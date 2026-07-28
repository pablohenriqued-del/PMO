import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, Maximize } from 'lucide-react';

const PresentationMode = () => {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();
  
  const routes = ['/', '/regional', '/projects', '/status-report', '/capacity-planning'];
  
  useEffect(() => {
    let interval;
    if (isActive) {
      let currentIndex = 0;
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % routes.length;
        navigate(routes[currentIndex]);
      }, 15000); // 15 seconds
    }
    return () => clearInterval(interval);
  }, [isActive, navigate]);

  const togglePresentation = () => {
    if (!isActive) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(e => console.log(e));
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
    setIsActive(!isActive);
  };

  return (
    <button
      onClick={togglePresentation}
      style={{
        background: isActive ? 'var(--sony-red)' : 'var(--sony-gray-900)',
        border: '1px solid var(--sony-gray-200)',
        borderRadius: '8px',
        padding: '8px 16px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'bold',
        marginLeft: '16px'
      }}
      title="TV / Presentation Mode"
    >
      {isActive ? <Square size={16} /> : <Play size={16} />}
      {isActive ? 'Stop TV Mode' : 'Modo TV'}
    </button>
  );
};

export default PresentationMode;
