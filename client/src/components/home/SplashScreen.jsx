import { useState, useEffect } from 'react';
import splashLogo from '../../assets/Comp.png';

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('enter'); // enter → visible → exit → done

  const handleDismiss = () => {
    if (phase === 'done' || phase === 'exit') return;
    setPhase('exit');
    setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 400);
  };

  useEffect(() => {
    // Phase 1: Logo + tagline animate in (already via CSS)
    const visibleTimer = setTimeout(() => {
      setPhase('visible');
    }, 300);

    // Phase 2: Start exit after showing content
    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 3600);

    // Phase 3: Fully remove splash
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete?.();
    }, 4400);

    return () => {
      clearTimeout(visibleTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div className={`splash-screen ${phase}`} aria-hidden="true">
      {/* Ambient background glow effects */}
      <div className="splash-glow splash-glow-1" />
      <div className="splash-glow splash-glow-2" />

      {/* Skip button */}
      <button
        type="button"
        className="splash-skip-btn"
        onClick={handleDismiss}
        aria-label="Skip splash screen"
      >
        Skip ✕
      </button>

      {/* Center content */}
      <div className="splash-center">
        <div className="splash-logo-wrap">
          <img
            src={splashLogo}
            alt="Computer Match"
            className="splash-logo"
            draggable={false}
          />
        </div>
        <div className="splash-tagline">
          Power your dreams, Not your Expenses
        </div>
      </div>

      {/* Bottom vision quote */}
      <div className="splash-bottom">
        <span className="splash-vision-label">Our Vision &amp; Promise</span>
        <p className="splash-vision-text">
          "We believe the right technology can change a life. Our vision is to make powerful, reliable technology accessible to everyone at the right price."
        </p>
      </div>
    </div>
  );
}
