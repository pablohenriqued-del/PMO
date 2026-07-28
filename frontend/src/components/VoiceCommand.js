import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let recognition = null;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR'; // Adjust to default language

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript.toLowerCase();
        setTranscript(result);
        handleCommand(result);
      };

      recognition.onerror = (event) => {
        console.error("Voice recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        if (isListening) recognition.start(); // keep listening if intended
      };
    }

    if (isListening && recognition) {
      recognition.start();
    } else if (recognition) {
      recognition.stop();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  const handleCommand = (cmd) => {
    console.log("Comando reconhecido:", cmd);
    if (cmd.includes('projetos') || cmd.includes('abrir projetos')) {
      navigate('/projects');
    } else if (cmd.includes('dashboard') || cmd.includes('home')) {
      navigate('/');
    } else if (cmd.includes('copilot') || cmd.includes('inteligência')) {
      navigate('/ai-copilot');
    } else if (cmd.includes('capacidade') || cmd.includes('heatmap')) {
      navigate('/capacity-planning');
    } else if (cmd.includes('parar') || cmd.includes('desligar microfone')) {
      setIsListening(false);
    }
  };

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return null; // Not supported
  }

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999 }}>
      {transcript && isListening && (
        <div style={{ 
          position: 'absolute', bottom: '60px', right: '0', 
          background: 'rgba(0,0,0,0.8)', color: 'white', 
          padding: '8px 16px', borderRadius: '16px', 
          fontSize: '12px', whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          🗣️ "{transcript}"
        </div>
      )}
      <button
        onClick={() => setIsListening(!isListening)}
        style={{
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: isListening ? 'var(--sony-red)' : 'rgba(20, 20, 20, 0.8)',
          border: '2px solid rgba(255,255,255,0.1)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isListening ? '0 0 20px rgba(229, 9, 20, 0.5)' : '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        title="Voice Command (Comando de Voz)"
      >
        {isListening ? <Mic size={24} /> : <MicOff size={24} />}
      </button>
    </div>
  );
};

export default VoiceCommand;
