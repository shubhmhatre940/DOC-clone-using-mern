import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync.js';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as encoding from 'lib0/encoding.js';
import * as decoding from 'lib0/decoding.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Document from '../models/Document.js';

const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;

// In-memory collection of active document rooms
// Key: docId, Value: { doc: Y.Doc, awareness: awarenessProtocol.Awareness, conns: Map<WebSocket, Set<number>>, persistTimeout: any }
const docs = new Map();

/**
 * Send an encoded message to a specific WebSocket client
 */
const send = (conn, encoder) => {
  if (conn.readyState !== WebSocket.OPEN) return;
  try {
    conn.send(encoding.toUint8Array(encoder));
  } catch (e) {
    console.error('[CollabServer] Error sending message:', e.message);
  }
};

/**
 * Get or load a collaborative document room from MongoDB
 */
async function getYDoc(docId) {
  let docData = docs.get(docId);
  if (docData) {
    return docData;
  }

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);
  awareness.setLocalState(null);

  // Load existing state from MongoDB if available
  if (mongoose.isValidObjectId(docId)) {
    try {
      const mongoDoc = await Document.findById(docId);
      if (mongoDoc && mongoDoc.yjsState) {
        Y.applyUpdate(ydoc, new Uint8Array(mongoDoc.yjsState));
        console.log(`[CollabServer] Restored Yjs state for document ${docId}`);
      }
    } catch (err) {
      console.error(`[CollabServer] Failed to load Yjs state for ${docId}:`, err.message);
    }
  }

  docData = {
    doc: ydoc,
    awareness,
    conns: new Map(),
    persistTimeout: null
  };

  // Schedule debounced persistence on document update
  ydoc.on('update', (update, origin) => {
    // Broadcast update to all clients in room except origin
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeUpdate(encoder, update);
    const message = encoding.toUint8Array(encoder);

    docData.conns.forEach((_, conn) => {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(message);
      }
    });

    // Debounce save to MongoDB every 2 seconds
    if (docData.persistTimeout) {
      clearTimeout(docData.persistTimeout);
    }
    docData.persistTimeout = setTimeout(async () => {
      if (!mongoose.isValidObjectId(docId)) return;
      try {
        const stateUpdate = Y.encodeStateAsUpdate(ydoc);
        await Document.findByIdAndUpdate(docId, {
          yjsState: Buffer.from(stateUpdate),
          updatedAt: new Date()
        });
      } catch (err) {
        console.error(`[CollabServer] Persistence error for ${docId}:`, err.message);
      }
    }, 2000);
  });

  // Handle awareness updates (cursors, presence, active users)
  awareness.on('update', ({ added, updated, removed }, origin) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageAwareness);
    encoding.writeVarUint8Array(
      encoder,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients)
    );
    const buff = encoding.toUint8Array(encoder);

    docData.conns.forEach((_, conn) => {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(buff);
      }
    });
  });

  docs.set(docId, docData);
  return docData;
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(conn, docData, message) {
  try {
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, messageSync);
        syncProtocol.readSyncMessage(decoder, encoder, docData.doc, conn);
        if (encoding.length(encoder) > 1) {
          send(conn, encoder);
        }
        break;
      }
      case messageAwareness: {
        awarenessProtocol.applyAwarenessUpdate(
          docData.awareness,
          decoding.readVarUint8Array(decoder),
          conn
        );
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('[CollabServer] Error handling message:', err.message);
  }
}

/**
 * Set up the WebSocket collaboration server on an existing HTTP server instance
 */
export function setupCollabServer(httpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      
      // Handle WebSocket requests targeting /yjs or /yjs/<docId>
      if (!url.pathname.startsWith('/yjs')) {
        return;
      }

      console.log(`[CollabServer] Upgrade request received: ${request.url}`);

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } catch (err) {
      console.error('[CollabServer] Error during HTTP upgrade:', err.message);
      socket.destroy();
    }
  });

  wss.on('connection', async (ws, request) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
      const pathParts = url.pathname.split('/').filter(Boolean); // ['yjs', '<docId>']
      const docId =
        url.searchParams.get('docId') ||
        url.searchParams.get('room') ||
        (pathParts.length > 1 ? pathParts[1] : null);

      console.log(`[CollabServer] Client connected for docId: ${docId}`);

      if (!docId) {
        console.warn('[CollabServer] Rejected: Missing docId or room parameter');
        ws.close(1008, 'Missing docId or room parameter');
        return;
      }

      const docData = await getYDoc(docId);
      docData.conns.set(ws, new Set());

      ws.on('message', (message) => {
        handleMessage(ws, docData, new Uint8Array(message));
      });

      ws.on('error', (err) => {
        console.error(`[CollabServer] WebSocket error on doc ${docId}:`, err.message);
      });

      ws.on('close', (code, reason) => {
        console.log(`[CollabServer] Client disconnected from docId: ${docId} (code: ${code}, reason: ${reason || 'none'})`);
        const controlledIds = docData.conns.get(ws);
        docData.conns.delete(ws);

        if (controlledIds) {
          awarenessProtocol.removeAwarenessStates(
            docData.awareness,
            Array.from(controlledIds),
            null
          );
        }

        // If room is empty, persist immediately and clean up
        if (docData.conns.size === 0) {
          try {
            const stateUpdate = Y.encodeStateAsUpdate(docData.doc);
            Document.findByIdAndUpdate(docId, {
              yjsState: Buffer.from(stateUpdate),
              updatedAt: new Date()
            }).catch(console.error);
          } catch (e) {}

          // Keep in memory for 10 seconds before GC in case client is quickly reconnecting
          setTimeout(() => {
            const current = docs.get(docId);
            if (current && current.conns.size === 0) {
              docs.delete(docId);
              console.log(`[CollabServer] Cleaned up room for document ${docId}`);
            }
          }, 10000);
        }
      });

      // Step 1: Send syncStep1 to client
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, docData.doc);
      send(ws, encoder);

      // Step 2: Send current awareness states
      const awarenessStates = docData.awareness.getStates();
      if (awarenessStates.size > 0) {
        const awarenessEncoder = encoding.createEncoder();
        encoding.writeVarUint(awarenessEncoder, messageAwareness);
        encoding.writeVarUint8Array(
          awarenessEncoder,
          awarenessProtocol.encodeAwarenessUpdate(
            docData.awareness,
            Array.from(awarenessStates.keys())
          )
        );
        send(ws, awarenessEncoder);
      }
    } catch (err) {
      console.error('[CollabServer] Connection initialization error:', err.message);
      ws.close(1011, 'Internal server error');
    }
  });

  console.log('[CollabServer]: WebSocket real-time collaboration server initialized on /yjs');
}
