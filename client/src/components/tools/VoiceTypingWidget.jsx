import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, AlertCircle } from 'lucide-react';

const VoiceTypingWidget = ({ isOpen, onClose, editor }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setErrorMsg(null);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      setTranscript(interimStr || finalStr);

      if (finalStr && editor) {
        editor.chain().focus().insertContent(`${finalStr} `).run();
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg('Microphone access blocked. Please allow mic permissions.');
      } else {
        setErrorMsg(`Speech recognition error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (e) {
      console.warn('Could not auto-start speech recognition:', e);
    }

    return () => {
      recognition.stop();
    };
  }, [isOpen, editor]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMsg(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Start recognition error:', e);
      }
    }
  };

  return (
    <div className="fixed bottom-8 left-8 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3.5 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200 select-none max-w-sm">
      {/* Microphone Toggle Button */}
      <button
        type="button"
        onClick={toggleListening}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-md cursor-pointer ${
          isListening
            ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-100'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={isListening ? 'Click to pause voice typing' : 'Click to start voice typing'}
      >
        {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      {/* Status & Live Preview */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900">
            {isListening ? 'Listening...' : 'Voice typing paused'}
          </span>
          {isListening && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </div>

        {errorMsg ? (
          <p className="text-[11px] text-red-600 flex items-center gap-1 mt-0.5">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span className="truncate">{errorMsg}</span>
          </p>
        ) : (
          <p className="text-[11px] text-gray-500 truncate mt-0.5">
            {transcript || 'Speak clearly into your microphone...'}
          </p>
        )}
      </div>

      {/* Close Widget */}
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        title="Close voice typing"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default VoiceTypingWidget;
