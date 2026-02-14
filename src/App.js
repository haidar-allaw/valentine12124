import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function App() {
  const cardRef = useRef(null);
  const noBtnRef = useRef(null);
  const yesBtnRef = useRef(null);

  const noTexts = useMemo(
    () => [
      "No",
      "Are you sure?",
      "Really sure?",
      "Think again 😶",
      "Last chance!",
      "Please? 🥺",
      "Don’t do this 😭",
      "Why tho? 😔",
      "Stoppp 😤",
      "I’m gonna run 😳",
    ],
    []
  );

  const [noIndex, setNoIndex] = useState(0);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [yesClicked, setYesClicked] = useState(false);
  const [noButtonEscaped, setNoButtonEscaped] = useState(false);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const moveNo = () => {
    const card = cardRef.current;
    const noBtn = noBtnRef.current;
    const yesBtn = yesBtnRef.current;
    if (!card || !noBtn) return;

    const c = card.getBoundingClientRect();
    const b = noBtn.getBoundingClientRect();
    const yesRect = yesBtn?.getBoundingClientRect();

    // Calculate position relative to the viewport (for position: fixed)
    // Since we use transform: translate(-50%, -50%), left/top represent the center point
    const pad = 18;
    const buttonPadding = 25; // Extra padding to avoid Yes button

    // Allow movement in a wider area around the card
    // Account for button width/height since we're centering it
    // On mobile, limit movement to viewport bounds
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < 480;

    const minX = isMobile
      ? b.width / 2 + pad
      : c.left - c.width * 0.3 + b.width / 2;
    const maxX = isMobile
      ? viewportWidth - b.width / 2 - pad
      : c.right + c.width * 0.3 - b.width / 2;

    const minY = c.top + c.height * 0.55 + b.height / 2; // start below the subtitle area
    const maxY = isMobile
      ? Math.min(c.bottom - pad - b.height / 2, viewportHeight - b.height / 2 - pad)
      : c.bottom - pad - b.height / 2;

    // Function to check if position overlaps with Yes button
    const overlapsWithYes = (x, y) => {
      if (!yesRect) return false;

      // Calculate the bounds of the No button at this position
      // Since we use translate(-50%, -50%), x,y is the center
      const noLeft = x - b.width / 2;
      const noRight = x + b.width / 2;
      const noTop = y - b.height / 2;
      const noBottom = y + b.height / 2;

      // Check if No button overlaps with Yes button (with padding)
      const yesLeft = yesRect.left - buttonPadding;
      const yesRight = yesRect.right + buttonPadding;
      const yesTop = yesRect.top - buttonPadding;
      const yesBottom = yesRect.bottom + buttonPadding;

      return !(
        noRight < yesLeft ||
        noLeft > yesRight ||
        noBottom < yesTop ||
        noTop > yesBottom
      );
    };

    // Try to find a position that doesn't overlap with Yes button
    let attempts = 0;
    let x, y;
    do {
      x = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
      y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
      attempts++;
      // Limit attempts to avoid infinite loop
      if (attempts > 50) break;
    } while (overlapsWithYes(x, y));

    setNoPos({
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    });
  };

  const onNoAttempt = (e) => {
    e.preventDefault();
    setNoButtonEscaped(true); // Mark that button has escaped
    setNoIndex((i) => (i + 1) % noTexts.length);
    moveNo();
  };

  const onYesClick = () => {
    setYesClicked(true);
  };

  useEffect(() => {
    // Initialize position - keep it in normal flow initially
    setNoPos({ x: 0, y: 0 });
    const onResize = () => {
      if (noButtonEscaped) {
        moveNo();
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Position the button when it first escapes
  useEffect(() => {
    if (noButtonEscaped && noPos.x === 0 && noPos.y === 0) {
      // Small delay to ensure button is rendered
      setTimeout(() => {
        const yesBtn = yesBtnRef.current;
        if (yesBtn) {
          const yesRect = yesBtn.getBoundingClientRect();
          // Position it to the right of Yes button initially
          const initialX = yesRect.right + 60;
          const initialY = yesRect.top + yesRect.height / 2;
          setNoPos({ x: initialX, y: initialY });
        }
      }, 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noButtonEscaped]);

  return (
    <div className="page">
      {!yesClicked ? (
        <>
          <div className="card" ref={cardRef}>
            <div className="hearts" aria-hidden="true">
              <span>💗</span><span>💘</span><span>💞</span><span>💓</span>
            </div>

            <h1 className="title">Would you be my valentine?</h1>
            <p className="subtitle">No pressure… but I'll be very happy 😌</p>

            <div className="buttons">
              <button ref={yesBtnRef} className="btn yes" onClick={onYesClick}>Yes</button>
              {!noButtonEscaped ? (
                <button
                  ref={noBtnRef}
                  className="btn no"
                  onMouseEnter={onNoAttempt}
                  onTouchStart={onNoAttempt}
                  onMouseDown={onNoAttempt}
                  onClick={(e) => e.preventDefault()}
                  aria-label="No"
                >
                  {noTexts[noIndex]}
                </button>
              ) : null}
            </div>
          </div>

          {/* NO button moved outside card so it can escape and appear above background */}
          {noButtonEscaped && (
            <button
              ref={noBtnRef}
              className="btn no noEscape"
              style={{
                left: `${noPos.x}px`,
                top: `${noPos.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={onNoAttempt}
              onTouchStart={onNoAttempt}
              onMouseDown={onNoAttempt}
              onClick={(e) => e.preventDefault()}
              aria-label="No"
            >
              {noTexts[noIndex]}
            </button>
          )}
        </>
      ) : (
        <div className="celebration">
          <div className="celebration-content">
            <div className="celebration-hearts">
              <span className="heart-emoji">💕</span>
              <span className="heart-emoji">💖</span>
              <span className="heart-emoji">💗</span>
              <span className="heart-emoji">💘</span>
              <span className="heart-emoji">💝</span>
              <span className="heart-emoji">💞</span>
              <span className="heart-emoji">💓</span>
              <span className="heart-emoji">💟</span>
            </div>
            <h1 className="celebration-text">yayy!!! i love you pookie</h1>
            <div className="celebration-hearts">
              <span className="heart-emoji">💕</span>
              <span className="heart-emoji">💖</span>
              <span className="heart-emoji">💗</span>
              <span className="heart-emoji">💘</span>
              <span className="heart-emoji">💝</span>
              <span className="heart-emoji">💞</span>
              <span className="heart-emoji">💓</span>
              <span className="heart-emoji">💟</span>
            </div>
          </div>
          <div className="confetti">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="confetti-piece" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
