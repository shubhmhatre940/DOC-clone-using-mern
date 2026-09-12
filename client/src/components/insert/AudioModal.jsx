import React, { useState, useRef, useEffect } from 'react';
import { X, Volume2, Mic, Square, Play, Upload, Loader2, Check } from 'lucide-react';
import { uploadMediaFile } from '../../api/media';

const AudioModal = ({ isOpen, onClose, editor }) => {
  const [tab, setTab] = useState('record'); // 'record' | 'upload'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleInsert = async () => {
    try {
      setUploading(true);
      let fileToUpload = null;

      if (tab === 'record') {
        if (!audioBlob) return;
        fileToUpload = new File([audioBlob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
      } else {
        if (!selectedFile) return;
        fileToUpload = selectedFile;
      }

      const res = await uploadMediaFile(fileToUpload);
      const publicUrl = res.url;

      if (editor) {
        // Embed HTML audio player block into editor
        const audioHtml = `
          <div class="audio-embed-wrapper" style="margin: 16px 0; padding: 12px; background: #f8f9fa; border: 1px solid #e5e7eb; border-radius: 12px; display: inline-block;">
            <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #4b5563;">🎵 Audio Clip</p>
            <audio controls src="${publicUrl}" style="height: 36px; outline: none;"></audio>
          </div>
          <p></p>
        `;
        editor.chain().focus().insertContent(audioHtml).run();
      }

      onClose();
    } catch (err) {
      console.error('Failed to upload and embed audio:', err);
      alert(err.response?.data?.message || 'Failed to upload audio file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audio-modal-title"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-blue-600" />
            <h2 id="audio-modal-title" className="text-base font-semibold text-gray-900">
              Record or embed audio
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-gray-100 px-4 pt-1 bg-gray-50/50">
          <button
            type="button"
            onClick={() => setTab('record')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              tab === 'record'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Record with microphone
          </button>
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition cursor-pointer ${
              tab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Upload audio file
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {tab === 'record' ? (
            <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
              {isRecording ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg animate-pulse mb-3">
                    <Mic className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-semibold text-red-600 font-mono">
                    Recording: {formatTime(recordingTime)}
                  </span>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    Stop recording
                  </button>
                </>
              ) : audioUrl ? (
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-semibold text-emerald-700 mb-2">
                    ✓ Recording ready ({formatTime(recordingTime)})
                  </span>
                  <audio controls src={audioUrl} className="w-full h-8 mb-3" />
                  <button
                    type="button"
                    onClick={startRecording}
                    className="text-xs text-gray-500 hover:text-gray-800 underline"
                  >
                    Record again
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                    <Mic className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-gray-600 font-medium mb-3">
                    Click to record audio directly from your mic
                  </p>
                  <button
                    type="button"
                    onClick={startRecording}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition cursor-pointer shadow-xs"
                  >
                    <Mic className="w-4 h-4" />
                    Start recording
                  </button>
                </>
              )}
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/40 transition cursor-pointer text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Select an audio file'}
                </span>
                <span className="text-[11px] text-gray-400 mt-0.5">
                  MP3, WAV, WebM, OGG up to 25MB
                </span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={uploading || (tab === 'record' ? !audioBlob : !selectedFile)}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {uploading ? 'Uploading...' : 'Embed in document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioModal;
