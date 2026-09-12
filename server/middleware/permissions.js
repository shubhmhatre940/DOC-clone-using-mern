import Document from '../models/Document.js';

// Role hierarchy: owner > editor > commenter > viewer
const ROLE_LEVELS = {
  viewer: 1,
  commenter: 2,
  editor: 3,
  owner: 4
};

/**
 * Middleware to verify a user's access level to a document
 * @param {'viewer' | 'commenter' | 'editor' | 'owner'} requiredRole - Minimum role required
 */
export const checkDocAccess = (requiredRole = 'viewer') => {
  return async (req, res, next) => {
    try {
      const document = await Document.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('collaborators.userId', 'name email');

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const userId = req.user ? req.user._id.toString() : null;
      let userRole = null;

      // Check if user is the document owner
      const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
      if (userId && ownerId === userId) {
        userRole = 'owner';
      }

      // Check if user is explicitly in collaborators array
      if (!userRole && userId && Array.isArray(document.collaborators)) {
        const collab = document.collaborators.find((c) => {
          const cId = c.userId?._id ? c.userId._id.toString() : c.userId?.toString();
          return cId === userId;
        });

        if (collab) {
          userRole = collab.role;
        }
      }

      // Check if document has link sharing enabled ('anyone-with-link')
      if (!userRole && document.visibility === 'anyone-with-link') {
        userRole = document.linkRole || 'viewer';
      }

      if (!userRole) {
        return res.status(403).json({ message: 'You do not have permission to access this document' });
      }

      const userLevel = ROLE_LEVELS[userRole] || 0;
      const requiredLevel = ROLE_LEVELS[requiredRole] || 0;

      if (userLevel < requiredLevel) {
        return res.status(403).json({
          message: `Insufficient permissions. Requires ${requiredRole} access, but your role is ${userRole}.`
        });
      }

      // Attach document and calculated user role to request
      req.doc = document;
      req.userRole = userRole;
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Document not found' });
      }
      return res.status(500).json({ message: 'Error verifying document permissions' });
    }
  };
};
