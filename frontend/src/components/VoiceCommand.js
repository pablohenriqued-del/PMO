import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VoiceCommand = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(isListening);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Reconhecimento de voz não suportado neste navegador.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Better for discrete commands
    recognition.interimResults = false;
    recognition.lang = 'pt-BR';

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript.toLowerCase();
      setTranscript(result);
      
      // Navigation logic
      if (result.includes('projeto')) {
        navigate('/projects');
      } else if (result.includes('dashboard') || result.includes('home') || result.includes('início')) {
        navigate('/');
      } else if (result.includes('copilot') || result.includes('inteligência')) {
        navigate('/ai-copilot');
      } else if (result.includes('capacidade') || result.includes('heatmap') || result.includes('recurso')) {
        navigate('/capacity-planning');
      } else if (result.includes('crm') || result.includes('demanda')) {
        navigate('/crm');
      } else if (result.includes('status') || result.includes('relatório')) {
        navigate('/status-report');
      } else if (result.includes('parar') || result.includes('desligar')) {
        setIsListening(false);
      }
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      if (event.error === 'not-allowed') {
        setErrorMsg("Permissão de microfone negada.");
        setIsListening(false);
      } else if (event.error !== 'no-speech') {
        setIsListening(false);
      }
    };
    
    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch(e) {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [navigate]);

  useEffect(() => {
    if (isListening && recognitionRef.current) {
      setTranscript('');
      setErrorMsg('');
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error(e);
      }
    } else if (!isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9999 }}>
      {errorMsg && (
        <div style={{ 
          position: 'absolute', bottom: '65px', right: '0', 
          background: 'var(--sony-red)', color: 'white', 
          padding: '8px 16px', borderRadius: '8px', 
          fontSize: '12px', whiteSpace: 'nowrap',
          pointerEvents: 'none'
        }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {transcript && isListening && !errorMsg && (
        <div style={{ 
          position: 'absolute', bottom: '65px', right: '0', 
          background: 'rgba(0,0,0,0.8)', color: 'white', 
          padding: '8px 16px', borderRadius: '16px', 
          fontSize: '12px', whiteSpace: 'nowrap',
          pointerEvents: 'none', border: '1px solid rgba(255,255,255,0.2)'
        }}>
          🗣️ "{transcript}"
        </div>
      )}
      <button
        data-testid="voice-command-btn"
        onClick={() => setIsListening(!isListening)}
        style={{
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: isListening ? 'var(--sony-red)' : 'rgba(20, 20, 20, 0.8)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'var(--pure-white, white)',
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
