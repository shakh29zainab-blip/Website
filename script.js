/* =========================================================
   HAPPY GIRLFRIEND'S DAY — vanilla JS interactions
   No frameworks. Small, commented, easy to edit.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------------------------------------------------
     0. BACKGROUND MUSIC
     Browsers block audio-with-sound from autoplaying
     until the visitor interacts with the page, so we:
       a) try to start it right away (works on some browsers/PWAs)
       b) if that's blocked, start it on the very first tap/click
       c) let the floating button toggle play/pause any time
  --------------------------------------------------- */
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const musicIcon = document.getElementById('musicIcon');

  function setMusicButtonState(isPlaying) {
    if (!musicToggle || !musicIcon) return;
    musicToggle.classList.toggle('playing', isPlaying);
    musicIcon.textContent = isPlaying ? '🎶' : '🎵';
    musicToggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  }

  function tryAutoplayMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.55;
    bgMusic.play()
      .then(() => setMusicButtonState(true))
      .catch(() => {
        // autoplay blocked — start on the visitor's first tap anywhere
        const startOnFirstTap = () => {
          bgMusic.play().then(() => setMusicButtonState(true)).catch(() => {});
          document.removeEventListener('click', startOnFirstTap);
          document.removeEventListener('touchstart', startOnFirstTap);
        };
        document.addEventListener('click', startOnFirstTap, { once: true });
        document.addEventListener('touchstart', startOnFirstTap, { once: true });
      });
  }
  tryAutoplayMusic();

  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().then(() => setMusicButtonState(true)).catch(() => {});
      } else {
        bgMusic.pause();
        setMusicButtonState(false);
      }
    });
  }

  /* ---------------------------------------------------
     1. AMBIENT FLOATING HEARTS & SPARKLES
     Spawns a soft heart/sparkle drifting up the page
     every couple of seconds. Purely decorative.
  --------------------------------------------------- */
  const ambientLayer = document.getElementById('ambientLayer');
  const floaterSymbols = ['♡', '❤', '✦', '✧'];

  function spawnFloater() {
    if (!ambientLayer) return;
    const el = document.createElement('span');
    el.className = 'floater';
    el.textContent = floaterSymbols[Math.floor(Math.random() * floaterSymbols.length)];
    el.style.left = Math.random() * 100 + 'vw';
    const duration = 10 + Math.random() * 8; // 10-18s slow drift
    el.style.animationDuration = duration + 's';
    el.style.fontSize = (0.9 + Math.random() * 0.9) + 'rem';
    ambientLayer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000);
  }
  setInterval(spawnFloater, 2200);
  spawnFloater();

  /* ---------------------------------------------------
     2. SCROLL REVEAL (fade-up on enter viewport)
  --------------------------------------------------- */
  const revealEls = document.querySelectorAll('.fade-up');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------------------------------------------
     3. GENERIC POPUP OPEN / CLOSE HANDLING
     Works for: surprise video popup + all card popups
  --------------------------------------------------- */
  function openPopup(popup) {
    if (!popup) return;
    popup.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePopup(popup) {
    if (!popup) return;
    popup.classList.remove('open');
    document.body.style.overflow = '';

    // pause any video inside so it doesn't keep playing off-screen
    const video = popup.querySelector('video');
    if (video) video.pause();
  }

  // Open the "Click for Surprise" video popup
  const surpriseBtn = document.getElementById('surpriseBtn');
  const surprisePopup = document.getElementById('surprisePopup');
  const surpriseVideo = document.getElementById('surpriseVideo');

  if (surpriseBtn && surprisePopup) {
    surpriseBtn.addEventListener('click', () => {
      openPopup(surprisePopup);
      if (surpriseVideo) {
        surpriseVideo.currentTime = 0;
        surpriseVideo.play().catch(() => {
          /* autoplay might be blocked until the user taps play — that's fine */
        });
      }
    });
  }

  // Open any "Explore Our World" card popup
  document.querySelectorAll('[data-popup]').forEach(card => {
    card.addEventListener('click', () => {
      const target = document.getElementById(card.dataset.popup);
      openPopup(target);
    });
  });

  // Close buttons (✕) inside popups
  document.querySelectorAll('[data-close]').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
      closePopup(closeBtn.closest('.popup-overlay'));
    });
  });

  // Click on the dark overlay (outside the paper) also closes it
  document.querySelectorAll('.popup-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup(overlay);
    });
  });

  // Escape key closes any open popup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.popup-overlay.open').forEach(closePopup);
    }
  });

  /* ---------------------------------------------------
     4. LOVE LETTER ENVELOPE — tap to unfold
  --------------------------------------------------- */
  const envelope = document.getElementById('envelope');
  const letterPaper = document.getElementById('letterPaper');
  const letterClose = document.getElementById('letterClose');

  if (envelope && letterPaper) {
    envelope.addEventListener('click', () => {
      envelope.classList.add('open');
      // slight delay so the flap opens before the letter rises out
      setTimeout(() => letterPaper.classList.add('open'), 350);
    });
  }

  if (letterClose) {
    letterClose.addEventListener('click', (e) => {
      e.stopPropagation();
      letterPaper.classList.remove('open');
      setTimeout(() => envelope.classList.remove('open'), 300);
    });
  }

  /* ---------------------------------------------------
     5. MEMORIES ROPE — gentle auto-slide every 3s
     Smoothly scrolls the hanging-photo rope sideways,
     looping back to the start once it reaches the end.
  --------------------------------------------------- */
  const ropeTrack = document.getElementById('ropeTrack');
  if (ropeTrack) {
    let autoSlideTimer = setInterval(() => {
      const photoWidth = ropeTrack.firstElementChild
        ? ropeTrack.firstElementChild.getBoundingClientRect().width + 26 /* gap */
        : 250;
      const atEnd = ropeTrack.scrollLeft + ropeTrack.clientWidth >= ropeTrack.scrollWidth - 10;

      if (atEnd) {
        ropeTrack.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        ropeTrack.scrollBy({ left: photoWidth, behavior: 'smooth' });
      }
    }, 3000);

    // pause the auto-slide while the visitor is manually scrolling/touching it
    let resumeTimeout;
    ropeTrack.addEventListener('touchstart', () => clearInterval(autoSlideTimer));
    ropeTrack.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
  }

});
