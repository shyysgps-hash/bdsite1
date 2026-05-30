/**
 * Birthday Party Site - Central Logic (Vanilla JS)
 * Page-Aware Architecture supporting advanced interactive features:
 * - Age & Back Pain Entry Warning (index.html)
 * - Game Generator & Truth or Dare (games.html)
 * - Song list CRT TV YouTube Loader, Baking Simulator, Cake Decorator (karaoke-cake.html)
 * - Canvas Fireworks & Custom Goodie Bags builder (goodie-bags.html)
 * - Guestbook validations (contact.html)
 */

// ==========================================
// 1. Spritesheet & Dynamic Slices Configuration (Bypassed for individual Frame images)
// ==========================================
const PRODUCTS_METADATA = [
  { id: 'face_mask', name: 'מסכת פנים', image: 'images/Frame 3.png' },
  { id: 'gummy', name: 'נחשי גומי', image: 'images/Frame 4.png' },
  { id: 'tattoos', name: 'קעקועי מים', image: 'images/Frame 5.png' },
  { id: 'gum', name: 'קופסת מסטיקים בצורת סיגריות', image: 'images/Frame 6.png' },
  { id: 'coffee', name: 'קפה', image: 'images/Frame 7.png' },
  { id: 'socks', name: 'גרביים', image: 'images/Frame 8.png' },
  { id: 'opener', name: 'פותחן', image: 'images/Frame 9.png' },
  { id: 'glasses', name: 'משקפי ראייה', image: 'images/Frame 10.png' },
  { id: 'cloth', name: 'מטלית למשקפיים', image: 'images/Frame 11.png' },
  { id: 'eyes', name: 'רפידות ג׳ל לעיניים', image: 'images/Frame 12.png' },
  { id: 'pills', name: 'אדוויל/אקמול', image: 'images/Frame 13.png' },
  { id: 'chocolate', name: 'שוקולד מריר', image: 'images/Frame 14.png' },
  { id: 'coaster', name: 'תחתית לכוסות', image: 'images/Frame 15.png' },
  { id: 'tea', name: 'חליטת תה', image: 'images/Frame 16.png' },
  { id: 'bottle', name: 'בקבוק אלכוהול מיניאטורי', image: 'images/Frame 17.png' }
];

const SLICED_IMAGES = {};

// ==========================================
// 2. Global Page State
// ==========================================
let activeBagStyle = null; // 1, 2, or 3
let selectedItems = []; // custom goodie bag items

// ==========================================
// 3. Main Loader (Page-Aware Routing)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Global components
  initGlobalNavigation();
  initGlobalModals();
  initAdControls();
  initAccessibilityControls();

  // Route page-specific logic
  const path = window.location.pathname;
  const pageName = path.substring(path.lastIndexOf('/') + 1);

  if (document.getElementById('homePage') || pageName === '' || pageName === 'index.html') {
    initHomePage();
  }

  if (document.getElementById('gamesPage') || pageName === 'games.html') {
    initGamesPage();
  }

  if (document.getElementById('karaokeCakePage') || pageName === 'karaoke-cake.html') {
    initKaraokeCakePage();
  }

  if (document.getElementById('goodieBagsPage') || pageName === 'goodie-bags.html') {
    // Dynamic canvas cropping is needed on the goodie bags custom builder
    preloadAndSliceProducts(() => {
      renderProductGrid();
      initGoodieBagsPage();
    });
  }

  if (document.getElementById('contactPage') || pageName === 'contact.html') {
    initContactPage();
    initFaqAccordion();
  }

  if (document.getElementById('aboutHITPage') || pageName === 'about.html') {
    // About page doesn't require specific scripts, but we can set up any accessories
  }
});

// ==========================================
// 4. Global Setup
// ==========================================
function initGlobalNavigation() {
  const mobileToggle = document.getElementById('mobileNavToggle');
  const mobileMenu = document.getElementById('mobileNavMenu');

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', !isOpen);
      mobileToggle.innerHTML = isOpen
        ? '<span>⚙</span> תפריט'
        : '<span>✕</span> סגור';
    });
  }
}

function initGlobalModals() {
  const overlay = document.getElementById('retroModalOverlay');
  if (!overlay) return;

  const closeBtns = document.querySelectorAll('.modal-close-trigger');

  const closeModal = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    const modalContainer = overlay.querySelector('.retro-modal');
    if (modalContainer) {
      modalContainer.classList.remove('accessibility-modal');
    }
  };

  closeBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });
}

function showSystemModal(title, htmlMessage, onClose) {
  const overlay = document.getElementById('retroModalOverlay');
  const modalTitle = document.getElementById('modalTitleText');
  const modalBody = document.getElementById('modalBodyText');

  if (!overlay) return;

  modalTitle.innerHTML = title;
  modalBody.innerHTML = htmlMessage;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Support onClose callback for custom modal close events
  if (onClose) {
    const closeBtns = overlay.querySelectorAll('.modal-close-trigger');
    const handleClose = () => {
      onClose();
      // Clean up local listeners to prevent leaks
      closeBtns.forEach(btn => btn.removeEventListener('click', handleClose));
      overlay.removeEventListener('click', handleOverlayClick);
      document.removeEventListener('keydown', handleEsc);
    };
    const handleOverlayClick = (e) => {
      if (e.target === overlay) handleClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) handleClose();
    };

    closeBtns.forEach(btn => btn.addEventListener('click', handleClose));
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleEsc);
  }

  setTimeout(() => {
    const btn = document.getElementById('modalCloseBtn');
    if (btn) btn.focus();
  }, 100);
}

// ==========================================
// 5. HOME PAGE LOGIC (index.html)
// ==========================================
function initHomePage() {
  const warningOverlay = document.getElementById('entryWarningModalOverlay');
  const btnAgeConfirm = document.getElementById('btnAgeConfirm');
  const btnAgeDeny = document.getElementById('btnAgeDeny');

  if (warningOverlay) {
    // Check if user already dismissed warning in this session
    if (sessionStorage.getItem('seenAgeWarning') === 'true') {
      warningOverlay.style.display = 'none';
      document.body.style.overflow = '';
      return;
    }

    // Force show warning modal immediately on page load
    warningOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Age confirm (Yes I am aware / Yes I enter) - Shows warning dialog instead and restores warning afterwards
    btnAgeConfirm.addEventListener('click', () => {
      // Temporarily hide warning modal so both overlays don't stack confusingly
      warningOverlay.style.display = 'none';

      showSystemModal(
        'התראה נוסטלגית ⚠️',
        'על מי אנחנו עובדים? אנחנו לא בגיל לזה. מגיע לנו יום הולדת בסגנון אחר!',
        () => {
          // Restore the warning overlay and keep body locked when the system modal is closed
          warningOverlay.style.display = 'flex';
          document.body.style.overflow = 'hidden';
        }
      );
    });

    // Age deny (I'm not at the age for this) - Activates and opens the website!
    btnAgeDeny.addEventListener('click', () => {
      warningOverlay.style.display = 'none';
      document.body.style.overflow = '';
      sessionStorage.setItem('seenAgeWarning', 'true');
    });
  }
}

// ==========================================
// 6. GAMES PAGE LOGIC (games.html)
// ==========================================
function initGamesPage() {
  // Flipping cards
  const cards = document.querySelectorAll('.flip-card');
  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('aria-label', `לחץ כדי לראות הוראות עבור ${card.querySelector('h4').innerText}`);

    const toggleFlip = () => {
      const isFlipped = card.classList.toggle('flipped');
      card.setAttribute('aria-expanded', isFlipped);
    };

    card.addEventListener('click', toggleFlip);
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleFlip();
      }
    });
  });

  // Random Game Generator (Draw Game)
  const btnDrawGame = document.getElementById('btnDrawGame');
  if (btnDrawGame) {
    const gameTitles = [
      'לפוצץ בלונים בזוגות 🎈',
      'כיסאות מוזיקליים 🎵',
      'מי אני? (פתק על המצח) ✍️',
      'מרוץ שקים / כף וביצה 🥚',
      'מי שותה יותר מהר? (צ\'ייסר בירה) 🍺',
      'חבילה עוברת משודרגת 🎁',
      'להכניס פלח לימון לקוקטייל 🍸',
      'מומיית חשבונות בנק 💵',
      'תוריד אצבע / צ\'ייסר 🥃',
      'אמת או חובה קלאסי 🗣️',
      'קולג\' ביר פונג 🎯',
      'נשיפת נרות בגובה שולחן 🕯️'
    ];

    btnDrawGame.addEventListener('click', () => {
      btnDrawGame.disabled = true;
      btnDrawGame.innerText = 'מגריל משחק...';

      let counter = 0;
      const interval = setInterval(() => {
        const tempIdx = Math.floor(Math.random() * gameTitles.length);
        btnDrawGame.innerText = `🎲 ${gameTitles[tempIdx]} 🎲`;
        counter++;
        if (counter > 15) {
          clearInterval(interval);
          const finalIdx = Math.floor(Math.random() * gameTitles.length);
          btnDrawGame.disabled = false;
          btnDrawGame.innerText = '🎲 הגרל משחק נוסטלגי! 🎲';

          showSystemModal(
            'הגרלת משחק מושחתת בהצלחה! 🏆',
            `המשחק שנבחר עבור מסיבת יום ההולדת שלך הוא:<br><br><strong style="font-size: 1.4rem; color: var(--accent-magenta); font-family: var(--font-pixel);">${gameTitles[finalIdx]}</strong><br><br>נא להכין את האביזרים הדרושים ולזכור: השתדלו לא לעשות תנועות חדות שיפגעו בדיסק בגב!`
          );
        }
      }, 100);
    });
  }
}

// ==========================================
// 7. KARAOKE & CAKE PAGE LOGIC (karaoke-cake.html)
// ==========================================
function initKaraokeCakePage() {
  // A. Choice Tabs smooth navigations
  const tabToKaraoke = document.getElementById('tabToKaraoke');
  const tabToCake = document.getElementById('tabToCake');
  const sectionKaraoke = document.getElementById('sectionKaraoke');
  const sectionCake = document.getElementById('sectionCake');

  if (tabToKaraoke && sectionKaraoke) {
    tabToKaraoke.addEventListener('click', () => {
      window.scrollTo({ top: sectionKaraoke.offsetTop - 80, behavior: 'smooth' });
    });
  }
  if (tabToCake && sectionCake) {
    tabToCake.addEventListener('click', () => {
      window.scrollTo({ top: sectionCake.offsetTop - 80, behavior: 'smooth' });
    });
  }

  // B. Song List & CRT TV YouTube Loader
  const songItems = document.querySelectorAll('.song-item');
  const crtVideoFrame = document.getElementById('crtVideoFrame');
  const screenTitle = document.getElementById('playerSongTitle');

  const songYoutubeMap = {
    0: 'https://www.youtube.com/embed/PYpU2TxIzAM?si=ZnedcsWabuJOy4fs&autoplay=1',  // ...Baby One More Time
    1: 'https://www.youtube.com/embed/CduA0TULnow?autoplay=1',                      // Oops!... I Did It Again
    2: 'https://www.youtube.com/embed/CvBfHwUxRLk?autoplay=1',  // Umbrella
    3: 'https://www.youtube.com/embed/bESGLojNYJY?autoplay=1',  // Poker Face
    4: 'https://www.youtube.com/embed/R7UrFYvl5TE?autoplay=1',  // Since U Been Gone
    5: 'https://www.youtube.com/embed/ViwtNLUqkMY?autoplay=1',  // Crazy in Love
    6: 'https://www.youtube.com/embed/5NPBIwQyPFI?autoplay=1',  // Complicated
    7: 'https://www.youtube.com/embed/M11SvDtPBhA?autoplay=1',  // Party in the U.S.A.
    8: 'https://www.youtube.com/embed/gJLIiF15wjQ?autoplay=1',  // Wannabe
    9: 'https://www.youtube.com/embed/4fndeDfaWCg?autoplay=1',  // I Want It That Way
    10: 'https://www.youtube.com/embed/6hzrDeoppWg?autoplay=1', // Wonderwall
    11: 'https://www.youtube.com/embed/gGdGFtwCN0c?autoplay=1', // Mr. Brightside
    12: 'https://www.youtube.com/embed/Sv6dMFF_yts?autoplay=1', // We Are Young
    13: 'https://www.youtube.com/embed/VYCOg-yglNM?autoplay=1', // Dynamite
    14: 'https://www.youtube.com/embed/NOubzHCUt48?autoplay=1', // Ke$ha - Die Young
    15: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'  // Never Gonna Give You Up
  };

  songItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      // Highlight active
      songItems.forEach(s => s.classList.remove('active'));
      item.classList.add('active');

      const songTitle = item.querySelector('span').innerText;
      screenTitle.innerText = `מנגן: ${songTitle}`;

      // Change iframe src dynamically
      if (crtVideoFrame) {
        crtVideoFrame.src = songYoutubeMap[idx];
      }
    });
  });

  // C. Recipe Steps Toggle Checkboxes
  const steps = document.querySelectorAll('.recipe-step-item');
  steps.forEach(step => {
    step.setAttribute('tabindex', '0');
    step.setAttribute('role', 'checkbox');
    step.setAttribute('aria-checked', 'false');

    const toggle = () => {
      const isChecked = step.classList.toggle('checked');
      step.setAttribute('aria-checked', isChecked);
    };

    step.addEventListener('click', toggle);
    step.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // D. Interactive Baking Mixer Game
  const ingredients = document.querySelectorAll('.baking-ingredient-item');
  const btnMix = document.getElementById('btnMixBaking');
  const bakingBatter = document.getElementById('bakingBatter');
  const bakingSpoon = document.getElementById('bakingSpoon');

  let addedIngredients = [];
  const totalIngredientsCount = 5;

  ingredients.forEach(item => {
    item.addEventListener('click', () => {
      const ingId = item.dataset.ing;
      if (!addedIngredients.includes(ingId)) {
        addedIngredients.push(ingId);
        item.classList.add('added');

        // Increase batter height visually in bowl slightly
        const pct = (addedIngredients.length / totalIngredientsCount) * 40; // max 40px at start
        if (bakingBatter) bakingBatter.style.height = `${pct}px`;

        if (addedIngredients.length === totalIngredientsCount) {
          if (btnMix) btnMix.disabled = false;
          showSystemModal('יש כל המצרכים! 🥣', 'כל המצרכים בקערה! כעת לחצו על לחצן "ערבב בלילה!" כדי לבחוש את עוגת השוקולית הנוסטלגית שלכם!');
        }
      }
    });
  });

  if (btnMix) {
    btnMix.addEventListener('click', () => {
      btnMix.disabled = true;
      if (bakingSpoon) bakingSpoon.classList.add('spoon-mix-anim');

      // Animate batter filling the bowl fully
      let h = parseInt(bakingBatter.style.height || '40');
      const mixInterval = setInterval(() => {
        h += 5;
        if (bakingBatter) bakingBatter.style.height = `${Math.min(h, 96)}px`;
        if (h >= 96) {
          clearInterval(mixInterval);
          bakingSpoon.classList.remove('spoon-mix-anim');
          showSystemModal(
            'הבלילה מוכנה! 🥧',
            'עבודה מעולה! בלילת השוקולית העשירה נבחשה בהצלחה ונשלחה ישירות לתנור ל-30 דקות ב-180 מעלות.<br><br>כעת העוגה אפויה וקרה, והיא ממתינה לכם בפינת הקישוט למטה!'
          );
        }
      }, 100);
    });
  }

  // E. Interactive Cake Decorator - נוסטלגוג
  const sugarSheetUpload = document.getElementById('sugarSheetUpload');
  const sugarSheetUploadedImg = document.getElementById('sugarSheetUploadedImg');
  const decorationImageOverlay = document.getElementById('sugarSheetOverlay');

  // FileReader photo upload
  if (sugarSheetUpload && sugarSheetUploadedImg) {
    sugarSheetUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          sugarSheetUploadedImg.src = event.target.result;
          sugarSheetUploadedImg.style.display = 'block';
          if (decorationImageOverlay) {
            decorationImageOverlay.style.border = 'none';
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Icing text overlay
  const icingInput = document.getElementById('cakeIcingInput');
  const icingText = document.getElementById('cakeIcingText');
  if (icingInput && icingText) {
    icingInput.addEventListener('input', () => {
      icingText.innerText = icingInput.value || 'הכיתוב שלכם כאן';
    });
  }

  // Frosting color picker
  const colorCircles = document.querySelectorAll('.color-circle');
  const cakeFrosting = document.getElementById('cakeFrosting');
  colorCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      const color = circle.dataset.color;
      if (cakeFrosting) {
        cakeFrosting.style.backgroundColor = color;
      }
    });
  });

  // Adding Sprinkles & Candles
  const btnAddSprinkles = document.getElementById('btnAddSprinkles');
  const btnAddCandle = document.getElementById('btnAddCandle');
  const placedDecorations = document.getElementById('placedDecorations');

  if (btnAddSprinkles && placedDecorations) {
    const sprinkleColors = ['#FFF89A', '#9DF1FC', '#FFADF2', '#9EF7C1', '#FFAAA6', '#ffffff'];
    btnAddSprinkles.addEventListener('click', () => {
      // Add 20 random sprinkles
      for (let i = 0; i < 20; i++) {
        const sprinkle = document.createElement('div');
        sprinkle.className = 'placed-sprinkle';

        // Random pastel color
        const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
        sprinkle.style.backgroundColor = color;

        // Random coordinate inside cake (height 200px, width 280px)
        const left = Math.floor(Math.random() * 260) + 10;
        const top = Math.floor(Math.random() * 140) + 40;
        const angle = Math.floor(Math.random() * 360);

        sprinkle.style.left = `${left}px`;
        sprinkle.style.top = `${top}px`;
        sprinkle.style.transform = `rotate(${angle}deg)`;

        placedDecorations.appendChild(sprinkle);
      }
    });
  }

  if (btnAddCandle && placedDecorations) {
    btnAddCandle.addEventListener('click', () => {
      // Limit to 10 candles
      const existingCandles = placedDecorations.querySelectorAll('.placed-candle');
      if (existingCandles.length >= 10) {
        showSystemModal('יותר מדי אש!', '10 נרות מספיקים בהחלט לעוגה הזאת, בואו לא נזמין את מכבי האש למסיבה!');
        return;
      }

      const candle = document.createElement('div');
      candle.className = 'placed-candle';

      // Load one of the pixel clock/floppy/candle icons or draw CSS candle
      candle.style.backgroundImage = "url('images/icons.png')";
      candle.style.backgroundPosition = "-580px -250px"; // Notes pixel icon as placeholder or CSS

      // We can also styled candle using raw CSS
      candle.style.width = '12px';
      candle.style.height = '36px';
      candle.style.background = 'linear-gradient(to top, var(--accent-magenta), var(--accent-yellow))';
      candle.style.border = '2.5px solid #000';
      candle.style.boxShadow = '1px 1px 0 #000';

      // Create tiny flame on top
      const flame = document.createElement('div');
      flame.style.width = '6px';
      flame.style.height = '10px';
      flame.style.backgroundColor = '#ff8800';
      flame.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
      flame.style.position = 'absolute';
      flame.style.top = '-14px';
      flame.style.left = '1px';
      flame.style.border = '1px solid #000';
      candle.appendChild(flame);

      // Random position inside cake center
      const left = Math.floor(Math.random() * 220) + 30;
      const top = Math.floor(Math.random() * 40) + 10; // place near top frosting

      candle.style.left = `${left}px`;
      candle.style.top = `${top}px`;
      candle.style.position = 'absolute';

      placedDecorations.appendChild(candle);
    });
  }

  // Clear decorations
  const btnClearDecor = document.getElementById('btnClearDecor');
  if (btnClearDecor && placedDecorations) {
    btnClearDecor.addEventListener('click', () => {
      placedDecorations.innerHTML = '';
      if (sugarSheetUploadedImg) {
        sugarSheetUploadedImg.src = '';
        sugarSheetUploadedImg.style.display = 'none';
        decorationImageOverlay.style.border = '2px dashed var(--color-border)';
      }
      if (icingText) icingText.innerText = 'הכיתוב שלכם כאן';
      if (icingInput) icingInput.value = '';
      if (cakeFrosting) cakeFrosting.style.backgroundColor = 'var(--accent-pink)';
    });
  }

  // Save Cake
  const btnSaveDecor = document.getElementById('btnSaveDecor');
  if (btnSaveDecor) {
    btnSaveDecor.addEventListener('click', () => {
      const candlesCount = placedDecorations.querySelectorAll('.placed-candle').length;
      const sprinklesCount = placedDecorations.querySelectorAll('.placed-sprinkle').length;
      const hasImage = sugarSheetUploadedImg.style.display === 'block';

      const summary = `איזו עוגת פאר נוסטלגית!<br><br><strong>ציפוי:</strong> ${cakeFrosting.style.backgroundColor || 'ורוד פסטל'}<br><strong>כמות נרות גיל:</strong> ${candlesCount}<br><strong>סוכריות צבעוניות:</strong> ${sprinklesCount > 0 ? sprinklesCount : 'אין'}<br><strong>דף סוכר אישי:</strong> ${hasImage ? 'הועלה בהצלחה' : 'ללא תמונה'}<br><strong>כיתוב השוקולד שלך:</strong> "${icingInput.value || 'הכיתוב שלכם כאן'}"<br><br>העוגה נשמרה בגלריה בהצלחה! היא מוכנה כעת להגשה במרכז השולחן!`;
      showSystemModal('עוגת גן נוסטלגית מוכנה! 🍰', summary);
    });
  }

  // F. Detect file:// protocol and show helpful system warning modal
  if (window.location.protocol === 'file:') {
    setTimeout(() => {
      showSystemModal(
        'מערכת אבטחה ⚠️ (הרצה מקומית)',
        `זיהינו שהפעלת את האתר ישירות מהקבצים במחשב (כתובת file://).<br><br>` +
        `<strong>במצב זה, דפדפנים מודרניים חוסמים לעיתים את הטעינה של נגני יוטיוב מוטמעים</strong> עקב מגבלות אבטחת מקור.<br><br>` +
        `כדי שהסרטון יופיע בטלוויזיה בצורה מושלמת, יש להריץ את האתר דרך שרת מקומי. למשל:<br><br>` +
        `1. פתיחת התיקייה בתוך <strong>VS Code</strong> והפעלה עם התוסף <strong>Live Server</strong>.<br>` +
        `2. או פתיחת הטרמינל בתיקייה זו והרצת הפקודה הבאה:<br>` +
        `<code style="background:#000; color:#0f0; padding:6px 10px; border-radius:4px; font-family:monospace; display:block; margin:10px 0; direction:ltr; text-align:left; font-size:0.9rem; border:2px solid var(--color-border);">npx http-server ./</code>` +
        `לאחר מכן פתחו את הכתובת השרת שקיבלתם (למשל: <code style="font-family:monospace; font-weight:bold;">http://localhost:8080</code>) והכל יעבוד חלק!`
      );
    }, 1500);
  }
}

// ==========================================
// 8. GOODIE BAGS PAGE LOGIC (goodie-bags.html)
// ==========================================
function initGoodieBagsPage() {
  // A. Path switches
  const btnPathLazy = document.getElementById('btnPathLazy');
  const btnPathAdventure = document.getElementById('btnPathAdventure');
  const pathContainerLazy = document.getElementById('pathContainerLazy');
  const pathContainerAdventure = document.getElementById('pathContainerAdventure');

  if (btnPathLazy && btnPathAdventure) {
    btnPathLazy.addEventListener('click', () => {
      pathContainerLazy.style.display = 'block';
      pathContainerAdventure.style.display = 'none';
      scrollToElement(pathContainerLazy);
    });

    btnPathAdventure.addEventListener('click', () => {
      pathContainerAdventure.style.display = 'block';
      pathContainerLazy.style.display = 'none';
      scrollToElement(pathContainerAdventure);
    });
  }

  // A.1 HTML5 Drag and Drop Target Listeners for Visualizer Bag
  const dropZoneBag = document.getElementById('dropZoneBag');
  if (dropZoneBag) {
    dropZoneBag.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      dropZoneBag.classList.add('drag-over');
    });

    dropZoneBag.addEventListener('dragleave', () => {
      dropZoneBag.classList.remove('drag-over');
    });

    dropZoneBag.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZoneBag.classList.remove('drag-over');
      const productId = e.dataTransfer.getData('text/plain');
      if (productId) {
        const btnElement = document.querySelector(`.product-item-btn[data-id="${productId}"]`);
        if (btnElement) {
          addProductToCustomBag(productId, btnElement);
        }
      }
    });
  }

  // B. Pre-made bags with fireworks overlay trigger!
  const btnPremadeGo = document.querySelectorAll('.btn-premade-go');
  btnPremadeGo.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const bagId = btn.dataset.bag;
      let bagName = '';
      let bagContent = '';
      let bagImage = '';

      if (bagId === '1') {
        bagName = 'ערכת החמרמורת 💊';
        bagContent = '• אדוויל/אקמול להקלת הכאב<br>• בקבוק מים קטן להחזרת נוזלים<br>• פלסטר קטן לפציעות קלות<br>• שקית קפה שחור להרגעה<br>• משקפי שמש לכיסוי הנזק';
        bagImage = 'images/full_bag_3.png';
      } else if (bagId === '2') {
        bagName = 'ערכת הילד הנצחי 🍭';
        bagContent = '• קעקועי מים זמניים בעיצובים מגניבים<br>• סוכריות גומי נחשים צבעוניות<br>• טבעות סוכרייה מתוקות<br>• משרוקיות להרעשת האורחים';
        bagImage = 'images/full_bag_2.png';
      } else {
        bagName = 'ערכת הבורגני המפונק 🧦';
        bagContent = '• שוקולד מריר איכותי 80%<br>• בקבוק אלכוהול קטן (ויסקי)<br>• מסכת הזנה מפנקת לפנים<br>• גרבי בית עבות, נעימות ומלטפות';
        bagImage = 'images/full_bag_1.png';
      }

      // 1. Play Fullscreen Canvas Fireworks
      triggerCanvasFireworks();

      // 2. Open Retro Popup exactly at the clicked spot with Confetti exploding around it
      showSpotPopup(btn, bagName, bagContent, bagImage);
    });
  });

  // C. Custom Builder empty bag selection
  const bagOptions = document.querySelectorAll('.bag-option-card');
  const visualizerBag = document.getElementById('visualizerBag');
  const scatterContainer = document.getElementById('visualizerItemsScatter');

  bagOptions.forEach(option => {
    option.addEventListener('click', () => {
      bagOptions.forEach(b => b.classList.remove('selected'));
      option.classList.add('selected');
      activeBagStyle = parseInt(option.dataset.bag);

      if (visualizerBag) {
        visualizerBag.src = `images/empty_bag_${activeBagStyle}.png`;
        visualizerBag.alt = `שקית הפתעה ריקה בסגנון ${activeBagStyle}`;
        visualizerBag.classList.add('bag-bounce');
        setTimeout(() => visualizerBag.classList.remove('bag-bounce'), 400);
      }

      selectedItems = [];
      if (scatterContainer) scatterContainer.innerHTML = '';
      updateBuilderCounter();
    });
  });

  // Custom Builder Actions - Shows the gorgeous visual bag results modal
  const btnSaveBag = document.getElementById('btnSaveBag');
  if (btnSaveBag) {
    btnSaveBag.addEventListener('click', () => {
      if (!activeBagStyle) {
        showSystemModal('אופס!', 'עליך לבחור סוג שקית (שלב 1) תחילה!');
        return;
      }
      if (selectedItems.length === 0) {
        showSystemModal('שקית ריקה?', 'הוסף פריטים שווים לשקית שלך כדי שתעבור את סינון הנוסטלגיה!');
        return;
      }

      showCustomBagResultModal(activeBagStyle, selectedItems);
    });
  }

  const btnResetBag = document.getElementById('btnResetBag');
  if (btnResetBag) {
    btnResetBag.addEventListener('click', () => {
      selectedItems = [];
      if (scatterContainer) scatterContainer.innerHTML = '';
      updateBuilderCounter();
      if (visualizerBag) {
        visualizerBag.classList.add('bag-bounce');
        setTimeout(() => visualizerBag.classList.remove('bag-bounce'), 400);
      }
    });
  }
}

/**
 * Maps individual items to their Frame image paths in the images folder.
 * Accepts callback to trigger after mapping is finished.
 */
function preloadAndSliceProducts(callback) {
  PRODUCTS_METADATA.forEach(prod => {
    SLICED_IMAGES[prod.id] = prod.image;
  });
  if (callback) callback();
}

function renderProductGrid() {
  const container = document.getElementById('productsSelectionGrid');
  if (!container) return;

  container.innerHTML = '';

  PRODUCTS_METADATA.forEach(prod => {
    const btn = document.createElement('button');
    btn.className = 'product-item-btn';
    btn.dataset.id = prod.id;
    btn.setAttribute('type', 'button');
    btn.setAttribute('aria-label', `הוסף לשקית: ${prod.name}`);

    // Make products draggable
    btn.setAttribute('draggable', 'true');
    btn.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', prod.id);
      e.dataTransfer.effectAllowed = 'copy';
    });

    const imgContainer = document.createElement('div');
    imgContainer.className = 'product-sprite-container';

    const img = document.createElement('img');
    img.src = SLICED_IMAGES[prod.id] || '';
    img.alt = prod.name;
    img.className = 'product-sprite-img';

    imgContainer.appendChild(img);

    const nameLabel = document.createElement('span');
    nameLabel.innerText = prod.name;

    btn.appendChild(imgContainer);
    btn.appendChild(nameLabel);

    btn.addEventListener('click', (e) => {
      addProductToCustomBag(prod.id, e.currentTarget);
    });

    container.appendChild(btn);
  });
}

function addProductToCustomBag(productId, buttonElement) {
  if (!activeBagStyle) {
    showSystemModal('עצור!', 'אנא בחר את סוג השקית (שלב 1) לפני שאתה מתחיל להעמיס מוצרים!');
    return;
  }

  if (selectedItems.includes(productId)) {
    showSystemModal('כבר בשקית!', `הפריט "${PRODUCTS_METADATA.find(p => p.id === productId).name}" כבר נמצא בתוך שקית ההישרדות שלך.`);
    return;
  }

  const btnRect = buttonElement.getBoundingClientRect();
  const visualizer = document.getElementById('visualizerBag');
  if (!visualizer) return;
  const bagRect = visualizer.getBoundingClientRect();

  const flyer = document.createElement('img');
  flyer.src = SLICED_IMAGES[productId];
  flyer.className = 'flying-item';
  flyer.style.top = `${btnRect.top + window.scrollY}px`;
  flyer.style.left = `${btnRect.left + window.scrollX}px`;
  document.body.appendChild(flyer);

  requestAnimationFrame(() => {
    flyer.style.top = `${bagRect.top + window.scrollY + (bagRect.height / 2) - 20}px`;
    flyer.style.left = `${bagRect.left + window.scrollX + (bagRect.width / 2) - 20}px`;
    flyer.style.transform = 'scale(0.3) rotate(360deg)';
    flyer.style.opacity = '0.3';
  });

  setTimeout(() => {
    flyer.remove();
    selectedItems.push(productId);
    updateBuilderCounter();

    visualizer.classList.add('bag-bounce');
    setTimeout(() => visualizer.classList.remove('bag-bounce'), 400);

    scatterProductIcon(productId);
  }, 600);
}

function scatterProductIcon(productId) {
  const container = document.getElementById('visualizerItemsScatter');
  if (!container) return;

  const positions = [
    // Row 1 (top, widest) - 4 items
    { top: '25%', left: '10%' },
    { top: '25%', left: '32%' },
    { top: '25%', left: '54%' },
    { top: '25%', left: '76%' },
    // Row 2 - 3 items
    { top: '39%', left: '20%' },
    { top: '39%', left: '45%' },
    { top: '39%', left: '70%' },
    // Row 3 - 3 items
    { top: '53%', left: '15%' },
    { top: '53%', left: '45%' },
    { top: '53%', left: '75%' },
    // Row 4 - 3 items
    { top: '67%', left: '22%' },
    { top: '67%', left: '48%' },
    { top: '67%', left: '74%' },
    // Row 5 (bottom, narrowest) - 2 items
    { top: '80%', left: '30%' },
    { top: '80%', left: '60%' }
  ];

  const posIdx = (selectedItems.length - 1) % positions.length;
  const coord = positions[posIdx];

  const scatter = document.createElement('img');
  scatter.className = 'scatter-item';
  scatter.src = SLICED_IMAGES[productId];
  scatter.style.top = coord.top;
  scatter.style.left = coord.left;
  scatter.setAttribute('alt', PRODUCTS_METADATA.find(p => p.id === productId).name);
  scatter.setAttribute('title', PRODUCTS_METADATA.find(p => p.id === productId).name);

  container.appendChild(scatter);
}

function updateBuilderCounter() {
  const countSpan = document.getElementById('builderItemsCount');
  const liveRegion = document.getElementById('builderAriaLive');

  if (countSpan) {
    countSpan.innerText = selectedItems.length;
  }

  if (liveRegion) {
    liveRegion.innerText = `השקית כעת מכילה ${selectedItems.length} פריטים.`;
  }
}

// ==========================================
// 9. DYNAMIC CANVAS FIREWORKS ANIMATION (goodie-bags.html)
// ==========================================
function triggerCanvasFireworks() {
  const canvas = document.getElementById('fireworksCanvas');
  if (!canvas) return;

  canvas.style.display = 'block';
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ['#FFF89A', '#9DF1FC', '#A182F9', '#FFADF2', '#9EF7C1', '#FF4B91', '#ffffff'];

  class Particle {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;

      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.08;
      this.alpha = 1;
      this.decay = Math.random() * 0.015 + 0.015;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 4;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.restore();
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += this.gravity;
      this.alpha -= this.decay;
    }
  }

  // Create an explosion
  function createExplosion(x, y) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(x, y, color));
    }
  }

  // Spawn explosions on left and right at intervals
  let explosionTimer = setInterval(() => {
    // Left explosion
    createExplosion(width * 0.25, height * 0.35 + Math.random() * 100);
    // Right explosion
    createExplosion(width * 0.75, height * 0.35 + Math.random() * 100);
  }, 400);

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      } else {
        p.draw();
      }
    }

    animationFrame = requestAnimationFrame(animate);
  }

  animate();

  // Stop after 4 seconds
  setTimeout(() => {
    clearInterval(explosionTimer);
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, width, height);
    canvas.style.display = 'none';
  }, 4000);
}

// ==========================================
// 10. CONTACT PAGE LOGIC (contact.html)
// ==========================================
function playRetroErrorBeep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, ctx.currentTime); // Low retro error buzz
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch(e) {
    console.warn('Web Audio API not supported', e);
  }
}

function initContactPage() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const errorMsgBox = document.getElementById('contactFormError');

  // Define required fields and their Hebrew names
  const requiredFields = [
    { id: 'firstName', name: 'שם פרטי' },
    { id: 'lastName', name: 'שם משפחה' },
    { id: 'birthDate', name: 'תאריך היום הולדת' },
    { id: 'email', name: 'כתובת דואל אלקטרוני' },
    { id: 'packageSelect', name: 'בחירת מסלול לשקית הפתעה' }
  ];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let missingFieldNames = [];
    let firstInvalidField = null;

    // Reset previous errors
    errorMsgBox.classList.remove('visible');
    errorMsgBox.innerText = '';
    requiredFields.forEach(field => {
      const el = document.getElementById(field.id);
      if (el) {
        el.classList.remove('invalid-field');
        el.setAttribute('aria-invalid', 'false');
      }
    });

    let emailInvalid = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check all required fields
    requiredFields.forEach(field => {
      const el = document.getElementById(field.id);
      if (!el || !el.value.trim()) {
        missingFieldNames.push(field.name);
        if (el) {
          el.classList.add('invalid-field');
          el.setAttribute('aria-invalid', 'true');
          if (!firstInvalidField) firstInvalidField = el;
        }
      } else if (field.id === 'email') {
        const emailValue = el.value.trim();
        if (!emailRegex.test(emailValue)) {
          emailInvalid = true;
          if (!missingFieldNames.includes(field.name)) {
             missingFieldNames.push(field.name);
          }
          el.classList.add('invalid-field');
          el.setAttribute('aria-invalid', 'true');
          if (!firstInvalidField) firstInvalidField = el;
        }
      }
    });

    if (missingFieldNames.length > 0) {
      // Play retro error beep
      playRetroErrorBeep();

      // Show specific error message
      let errorText = `יש למלא את: ${missingFieldNames.join(', ')}`;
      if (emailInvalid) {
        errorText += `\nיש להזין כתובת דוא״ל תקינה הכוללת @ ונקודה`;
      }
      errorMsgBox.innerText = errorText;
      errorMsgBox.classList.add('visible');
      
      // Focus the first invalid field for accessibility
      if (firstInvalidField) firstInvalidField.focus();
    } else {
      // Success!
      const name = document.getElementById('firstName').value;
      showSystemModal(
        'הטופס נשלח בהצלחה! ✉',
        `תודה רבה לך <strong>${name}</strong>!<br><br>הפרטים שלך נשמרו בהצלחה במערכת. נחזור אליך בהקדם כדי לחגוג יום הולדת כמו שצריך!`
      );
      form.reset();
    }
  });

  // Realtime cleanup on focus/input
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (el) {
      el.addEventListener('input', () => {
        if (el.value.trim()) {
          el.classList.remove('invalid-field');
          el.setAttribute('aria-invalid', 'false');
          // Hide global error message if user fixes a field to prevent lingering alerts
          errorMsgBox.classList.remove('visible'); 
        }

        // Real-time email validation
        if (field.id === 'email') {
          const emailInlineError = document.getElementById('emailInlineError');
          if (emailInlineError) {
            const val = el.value.trim();
            if (val === '') {
              emailInlineError.classList.remove('visible');
              emailInlineError.innerText = '';
            } else {
              if (!emailRegex.test(val)) {
                emailInlineError.innerText = 'כתובת הדוא״ל צריכה לכלול @ ונקודה אחרי ה־@';
                emailInlineError.classList.add('visible');
              } else {
                emailInlineError.classList.remove('visible');
                emailInlineError.innerText = '';
              }
            }
          }
        }
      });
    }
  });
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ==========================================
// 11. FAQ ACCORDION LOGIC (used dynamically)
// ==========================================
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          otherItem.querySelector('.faq-answer').style.maxHeight = '0px';
        }
      });

      item.classList.toggle('active');
      btn.setAttribute('aria-expanded', !isActive);

      if (!isActive) {
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      } else {
        answer.style.maxHeight = '0px';
      }
    });
  });
}

// ==========================================
// 12. Utilities
// ==========================================
function scrollToElement(element) {
  window.scrollTo({
    top: element.offsetTop - 80,
    behavior: 'smooth'
  });
}

// ==========================================
// 13. Dynamic Localized Confetti & Bag Popups
// ==========================================

function spawnConfettiAroundPoint(x, y) {
  const colors = ['#FFF89A', '#9DF1FC', '#A182F9', '#FFADF2', '#9EF7C1', '#FF4B91'];
  const confettiCount = 60;
  const container = document.body;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'custom-confetti-particle';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.backgroundColor = color;
    
    const shape = Math.random();
    if (shape < 0.33) {
      confetti.style.borderRadius = '50%';
    } else if (shape < 0.66) {
      confetti.style.transform = 'rotate(45deg)';
    }

    confetti.style.left = `${x}px`;
    confetti.style.top = `${y}px`;

    const size = Math.floor(Math.random() * 8) + 6;
    confetti.style.width = `${size}px`;
    confetti.style.height = `${size}px`;

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 120 + 80;
    const destX = Math.cos(angle) * velocity;
    const destY = Math.sin(angle) * velocity + (Math.random() * 150 + 100);

    confetti.style.setProperty('--dx', `${destX}px`);
    confetti.style.setProperty('--dy', `${destY}px`);
    
    const rot = Math.random() * 720 - 360;
    confetti.style.setProperty('--dr', `${rot}deg`);

    const duration = Math.random() * 1.5 + 1.2;
    confetti.style.animation = `confettiExplodeFall ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`;

    container.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, duration * 1000);
  }
}

function showSpotPopup(btn, bagName, bagContent, bagImage) {
  // Remove any existing active spot popups and backdrops to avoid duplicates
  const existingPopups = document.querySelectorAll('.spot-bag-popup, .spot-popup-backdrop');
  existingPopups.forEach(p => p.remove());

  const rect = btn.getBoundingClientRect();
  const clickX = rect.left + window.scrollX + (rect.width / 2);
  const clickY = rect.top + window.scrollY + (rect.height / 2);

  // Spawn confetti burst first
  spawnConfettiAroundPoint(clickX, clickY);

  // 1. Create and append the dark overlay backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'spot-popup-backdrop';
  document.body.appendChild(backdrop);

  // 2. Create and append the popup element
  const popup = document.createElement('div');
  popup.className = 'spot-bag-popup';
  
  popup.innerHTML = `
    <div class="retro-titlebar">
      <div class="retro-window-title">
        <span class="retro-window-icon">🎁</span>
        <span>${bagName}</span>
      </div>
      <button class="retro-control-btn spot-popup-close" aria-label="סגור">✕</button>
    </div>
    <div class="spot-popup-body">
      <div class="spot-popup-congrats">מזל טוב! השקית שנבחרה היא:</div>
      <img src="${bagImage}" alt="${bagName}" class="spot-popup-img">
      <div class="spot-popup-content">
        <strong class="spot-popup-subtitle">תכולת שקית ההישרדות שלך:</strong>
        <div class="spot-popup-list">${bagContent}</div>
      </div>
      <button class="retro-btn retro-btn-accent spot-popup-close-btn" type="button">מעולה, תודה! 👍</button>
    </div>
  `;

  document.body.appendChild(popup);

  const popupWidth = 350;
  let leftPos = clickX - (popupWidth / 2);
  let topPos = rect.top + window.scrollY - 480;

  const screenWidth = window.innerWidth;
  if (leftPos < 15) {
    leftPos = 15;
  } else if (leftPos + popupWidth > screenWidth - 15) {
    leftPos = screenWidth - popupWidth - 15;
  }

  if (topPos < window.scrollY + 10) {
    topPos = rect.bottom + window.scrollY + 20;
  }

  popup.style.left = `${leftPos}px`;
  popup.style.top = `${topPos}px`;

  setTimeout(() => {
    const closeBtn = popup.querySelector('.spot-popup-close-btn');
    if (closeBtn) closeBtn.focus();
  }, 100);

  // Close handlers
  const closePopup = () => {
    popup.classList.add('closing');
    backdrop.classList.add('closing');
    setTimeout(() => {
      popup.remove();
      backdrop.remove();
    }, 200);
  };

  popup.querySelectorAll('.spot-popup-close, .spot-popup-close-btn').forEach(c => {
    c.addEventListener('click', closePopup);
  });
  backdrop.addEventListener('click', closePopup);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closePopup();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
}

function showCustomBagResultModal(bagStyle, items) {
  // Remove existing modals to avoid overlay issues
  const existingModals = document.querySelectorAll('.result-bag-modal, .spot-popup-backdrop');
  existingModals.forEach(m => m.remove());

  // 1. Play full fireworks!
  triggerCanvasFireworks();

  // 2. Create the dark backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'spot-popup-backdrop';
  document.body.appendChild(backdrop);

  // Detailed descriptions of products
  const itemDescriptions = {
    gummy: "סוכריות גומי ארוכות / נחשים — זריקת סוכר מתוקה שמחזירה אתכם ברגע לילדות.",
    pills: "אקמול פוקוס / אדוויל — ערכת ההישרדות האמיתית שלכם לבוקר שאחרי המסיבה.",
    alcohol: "בקבוקון אלכוהול מיניאטורי — לחגוג כמו גדולים, כי כבר מזמן עברתם את גיל 18.",
    eye_pads: "רפידות ג׳ל לעיניים — להסתרת שקיות העייפות של השגרה והעבודה.",
    tattoos: "קעקועי מים בעיצובים — האקססורי הכי מגניב שיזכיר לכם איך שיחקתם בהפסקה.",
    mask: "מסכה לפנים — קצת פינוק לעור הפנים אחרי לילה ארוך של חגיגות.",
    coffee: "שקיות קפה איכותי — הדרך היחידה לפתוח את היום ולשרוד את יום העבודה הבא.",
    opener: "פותחן בקבוקים נוסטלגי — שימושי, עמיד ותמיד מגיע בזמן הנכון.",
    socks: "גרביים עם הדפסים — כי אין כמו להתכרבל בבית בסטייל נוסטלגי.",
    tea: "תה צמחים מרגיע — להרגעת הגוף והנפש לפני השינה.",
    coaster: "תחתית לכוס קפה — שתגן על שולחן הפורמייקה היקר שלכם מפני כתמים.",
    cloth: "מטלית ניקוי למשקפיים — לראות את החיים בבהירות, גם כשמתחילים להזדקן.",
    glasses: "משקפיים שחורות — להסתיר את עיגולי העייפות בסטייל בלתי מתפשר.",
    chocolate: "שוקולד מריר — זריקת אנרגיה מרירה ואיכותית ברגעים קשים.",
    gum_cigs: "מסטיקים בקופסת סיגריות של פעם — הנוסטלגיה הכי מתוקה והכי שנויה במחלוקת."
  };

  // Get items list for detailed side panel
  const itemsListHTML = items.map(itemId => {
    const prod = PRODUCTS_METADATA.find(p => p.id === itemId);
    const desc = itemDescriptions[itemId] || "פריט נוסטלגי מיוחד שהוספת לשקית ההפתעות שלך.";
    if (!prod) return '';
    return `
      <div class="result-details-item">
        <img src="${SLICED_IMAGES[itemId]}" class="detail-item-img" alt="${prod.name}">
        <div class="detail-item-text">
          <strong class="detail-item-name">${prod.name}</strong>
          <span class="detail-item-desc">${desc}</span>
        </div>
      </div>
    `;
  }).join('');

  // 3. Create the Modal element with Two Columns (and NO bag name style heading)
  const modal = document.createElement('div');
  modal.className = 'result-bag-modal';
  
  modal.innerHTML = `
    <div class="retro-titlebar">
      <div class="retro-window-title">
        <span class="retro-window-icon">🛍️</span>
        <span class="result-modal-title">שקית ההפתעה המותאמת אישית שלך!</span>
      </div>
      <button class="retro-control-btn result-modal-close" aria-label="סגור">✕</button>
    </div>
    <div class="result-modal-body">
      <div class="spot-popup-congrats" style="margin-bottom: 12px; width: 100%;">מזל טוב! שקית ההפתעה שהרכבת מוכנה:</div>
      
      <div class="result-modal-columns">
        <!-- Left Column: Visual representation (Not compressed/squished) -->
        <div class="result-modal-left-col">
          <div class="result-bag-stage">
            <img src="images/empty_bag_${bagStyle}.png" alt="שקית ההפתעה המוכנה שלך" class="result-bag-img">
            <div class="result-items-overlay" id="resultItemsOverlay"></div>
          </div>
        </div>
        
        <!-- Right Column: Detailed item descriptions -->
        <div class="result-modal-right-col">
          <div class="result-details-list">
            ${itemsListHTML}
          </div>
        </div>
      </div>
    </div>
    <div class="result-modal-footer">
      <button class="retro-btn retro-btn-accent result-modal-close-btn" type="button">וואו, פשוט מדהים! 🎉</button>
    </div>
  `;

  document.body.appendChild(modal);

  // 4. Populate and scatter items absolute positioned on the bag in a neat grid!
  const overlay = modal.querySelector('#resultItemsOverlay');
  if (overlay) {
    const gridPositions = [
      // Row 1 (top, widest) - 4 items
      { top: '25%', left: '10%' },
      { top: '25%', left: '32%' },
      { top: '25%', left: '54%' },
      { top: '25%', left: '76%' },
      // Row 2 - 3 items
      { top: '39%', left: '20%' },
      { top: '39%', left: '45%' },
      { top: '39%', left: '70%' },
      // Row 3 - 3 items
      { top: '53%', left: '15%' },
      { top: '53%', left: '45%' },
      { top: '53%', left: '75%' },
      // Row 4 - 3 items
      { top: '67%', left: '22%' },
      { top: '67%', left: '48%' },
      { top: '67%', left: '74%' },
      // Row 5 (bottom, narrowest) - 2 items
      { top: '80%', left: '30%' },
      { top: '80%', left: '60%' }
    ];

    items.forEach((itemId, index) => {
      const img = document.createElement('img');
      img.src = SLICED_IMAGES[itemId] || '';
      img.className = 'result-scatter-img';
      img.alt = itemId;

      const coord = gridPositions[index % gridPositions.length];
      img.style.left = coord.left;
      img.style.top = coord.top;

      const rot = Math.floor(Math.random() * 20) - 10; // slight natural rotation
      img.style.setProperty('--rot', `${rot}deg`);
      
      // Delay the appearance of each item slightly for a beautiful cascading drop effect!
      img.style.animationDelay = `${index * 0.1}s`;

      overlay.appendChild(img);
    });
  }

  // Focus close button
  setTimeout(() => {
    const closeBtn = modal.querySelector('.result-modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }, 100);

  // Close handlers
  const closeModal = () => {
    modal.style.animation = 'resultModalClose 0.2s cubic-bezier(0.4, 0, 1, 1) forwards';
    backdrop.classList.add('closing');
    setTimeout(() => {
      modal.remove();
      backdrop.remove();
    }, 200);
  };

  modal.querySelectorAll('.result-modal-close, .result-modal-close-btn').forEach(c => {
    c.addEventListener('click', closeModal);
  });
  backdrop.addEventListener('click', closeModal);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
}

// ==========================================
// 14. Interactive Responsive Advertisement Pause Controls
// ==========================================
function initAdControls() {
  const adContainers = document.querySelectorAll('aside.ad-sidebar .ad-container, .mobile-ad-card');
  adContainers.forEach((adContainer) => {
    // Create pause button
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'ad-pause-btn';
    pauseBtn.setAttribute('type', 'button');
    pauseBtn.setAttribute('aria-label', 'עצור פרסומת');
    pauseBtn.innerHTML = '⏸️ עצור';

    // Create paused placeholder
    const placeholder = document.createElement('div');
    placeholder.className = 'ad-paused-placeholder';
    placeholder.style.display = 'none';
    placeholder.innerHTML = `
      <span class="ad-paused-icon">⏸️</span>
      <span class="ad-paused-text">פרסומת מושהית</span>
      <span class="ad-paused-subtext">לחצו להפעלה</span>
    `;

    adContainer.appendChild(placeholder);
    adContainer.appendChild(pauseBtn);

    const img = adContainer.querySelector('img');

    // Toggle pause state
    const togglePause = (e) => {
      e.stopPropagation();
      const isPaused = adContainer.classList.toggle('paused');
      if (isPaused) {
        placeholder.style.display = 'flex';
        if (img) img.style.display = 'none';
        pauseBtn.innerHTML = '▶️ הפעל';
        pauseBtn.setAttribute('aria-label', 'הפעל פרסומת');
      } else {
        placeholder.style.display = 'none';
        if (img) img.style.display = 'block';
        pauseBtn.innerHTML = '⏸️ עצור';
        pauseBtn.setAttribute('aria-label', 'עצור פרסומת');
      }
    };

    pauseBtn.addEventListener('click', togglePause);
    placeholder.addEventListener('click', togglePause);
  });
}

// ==========================================
// 12. Accessibility Controls & Full Statement
// ==========================================
function initAccessibilityControls() {
  // 1. Create and inject the floating button dynamically if it doesn't exist
  if (!document.getElementById('floatingAccessibilityBtn')) {
    const floatBtn = document.createElement('button');
    floatBtn.id = 'floatingAccessibilityBtn';
    floatBtn.className = 'floating-accessibility-btn';
    floatBtn.setAttribute('aria-label', 'פתח הצהרת נגישות מלאה');
    floatBtn.setAttribute('title', 'הצהרת נגישות');
    
    floatBtn.innerHTML = `
      <span class="accessibility-icon" aria-hidden="true">♿</span>
      <span class="accessibility-btn-text">הצהרת נגישות</span>
    `;
    
    document.body.appendChild(floatBtn);
    
    // Add event listener to floating button
    floatBtn.addEventListener('click', showAccessibilityModal);
  }

  // 2. Add event listeners to all accessibility badges in the footers
  const badges = document.querySelectorAll('.accessibility-badge');
  badges.forEach(badge => {
    badge.setAttribute('role', 'button');
    badge.setAttribute('tabindex', '0');
    badge.setAttribute('aria-label', 'פתח הצהרת נגישות מלאה');
    badge.style.cursor = 'pointer';
    
    badge.addEventListener('click', showAccessibilityModal);
    
    // Support keyboard accessibility (Enter/Space)
    badge.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        showAccessibilityModal();
      }
    });
  });
}

function showAccessibilityModal() {
  const overlay = document.getElementById('retroModalOverlay');
  const modalTitle = document.getElementById('modalTitleText');
  const modalBody = document.getElementById('modalBodyText');
  if (!overlay) return;

  const modalContainer = overlay.querySelector('.retro-modal');
  if (modalContainer) {
    modalContainer.classList.add('accessibility-modal');
  }

  modalTitle.innerHTML = '♿ הצהרת נגישות מלאה - אני לא בגיל לזה';
  
  modalBody.innerHTML = `
    <div class="accessibility-content" style="text-align: right; direction: rtl; font-family: var(--font-main);">
      <p style="margin-bottom: 15px; font-weight: bold; color: var(--accent-magenta); font-size: 1.1rem; text-align: center;">
        אנו בצוות "אני לא בגיל לזה" רואים חשיבות עליונה בהנגשת האתר לכלל האוכלוסייה, לרבות אנשים עם מוגבלויות.
      </p>
      
      <h4 style="color: var(--accent-dark-blue); margin-top: 20px; margin-bottom: 10px; border-bottom: 2px dashed var(--accent-gray-dark); padding-bottom: 5px; font-family: var(--font-pixel); text-align: right;">
        רמת הנגישות באתר
      </h4>
      <p style="margin-bottom: 15px; color: var(--color-text); font-weight: normal; text-align: right;">
        האתר מונגש ברמת <strong>WCAG 2.1 AA</strong> בהתאם להנחיות הנגישות של ארגון ה-W3C הבינלאומי ובכפוף לחקיקה הישראלית.
      </p>

      <h4 style="color: var(--accent-dark-blue); margin-top: 20px; margin-bottom: 10px; border-bottom: 2px dashed var(--accent-gray-dark); padding-bottom: 5px; font-family: var(--font-pixel); text-align: right;">
        התאמות עיקריות שבוצעו באתר:
      </h4>
      <ul style="list-style-type: square; list-style-position: inside; margin-bottom: 15px; padding-right: 10px; color: var(--color-text); line-height: 1.7; display: flex; flex-direction: column; gap: 8px; text-align: right; font-weight: normal;">
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">ניווט מקלדת מלא:</strong> כל הרכיבים האינטראקטיביים באתר, כולל כרטיסיות מתהפכות, משחקים, ונגן קריוקי, ניתנים לתפעול מלא באמצעות מקלדת (שימוש ב-Tab, Enter ו-Space).</li>
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">קישור דילוג (Skip Link):</strong> קיים קישור מהיר בראש כל עמוד המאפשר לדלג ישירות לתוכן המרכזי עבור משתמשי מקלדת וקוראי מסך.</li>
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">תמיכה בקוראי מסך:</strong> תגיות סמנטיות, מאפייני ARIA, תוויות כפתורים ברורות ותיאורי תמונות אלטרנטיביים (alt text) הוגדרו עבור כל הרכיבים והפרסומות.</li>
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">ניגודיות צבעים משופרת:</strong> נבחרו שילובי צבעים בעלי ניגודיות גבוהה העומדים בדרישות התקן להקלה על כבדי ראייה.</li>
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">מניעת הבהובים ורכיבים נעים:</strong> כל האנימציות והפרסומות מבוצעות בצורה רגועה ומותאמת, תוך אפשרות לשלוט בהן או לסגור אותן.</li>
        <li style="font-weight: normal;"><strong style="font-weight: bold; color: var(--color-text);">התאמה למכשירים שונים:</strong> האתר רספונסיבי לחלוטין ומותאם לצפייה במחשבים, טאבלטים וטלפונים ניידים.</li>
      </ul>

      <h4 style="color: var(--accent-dark-blue); margin-top: 20px; margin-bottom: 10px; border-bottom: 2px dashed var(--accent-gray-dark); padding-bottom: 5px; font-family: var(--font-pixel); text-align: right;">
        הפעלת התאמות הנגישות
      </h4>
      <p style="margin-bottom: 15px; color: var(--color-text); font-weight: normal; text-align: right;">
        האתר תומך בכל תוכנות הקראת המסך המובילות (כגון NVDA, JAWS, VoiceOver) ובכל הדפדפנים המודרניים. מומלץ להשתמש בדפדפן Google Chrome לקבלת חוויית משתמש מיטבית.
      </p>

      <h4 style="color: var(--accent-dark-blue); margin-top: 20px; margin-bottom: 10px; border-bottom: 2px dashed var(--accent-gray-dark); padding-bottom: 5px; font-family: var(--font-pixel); text-align: right;">
        רכיבים אינטראקטיביים מיוחדים שמונגשים:
      </h4>
      <p style="margin-bottom: 15px; color: var(--color-text); font-weight: normal; text-align: right;">
        בפיתוח האתר הושם דגש מיוחד על הנגשת רכיבים מורכבים ב-Vanilla JS ללא שימוש בספריות חיצוניות:<br>
        • <strong style="font-weight: bold; color: var(--color-text);">סימולטור אפייה וקישוט עוגה (נוסטלעוגן):</strong> נבנה עם פוקוס מובלט ומקלדת מלאה לתפעול שוטף.<br>
        • <strong style="font-weight: bold; color: var(--color-text);">בונה שקיות הפתעה +18:</strong> תומך בבנייה ובחירה נגישה דרך כפתורים מבוססי מקלדת וכן גרירה ושחרור (Drag and Drop) מונגשת.<br>
        • <strong style="font-weight: bold; color: var(--color-text);">כרטיסיות משחקים מתהפכות:</strong> תומכות במצב פוקוס ופתיחה/סגירה מונחית מקלדת.
      </p>

      <h4 style="color: var(--accent-dark-blue); margin-top: 20px; margin-bottom: 10px; border-bottom: 2px dashed var(--accent-gray-dark); padding-bottom: 5px; font-family: var(--font-pixel); text-align: right;">
        פניות בנושא נגישות
      </h4>
      <p style="margin-bottom: 15px; color: var(--color-text); font-weight: normal; text-align: right;">
        אם נתקלתם בבעיה או בתקלה כלשהי בנושא הנגישות במהלך הגלישה באתר, נשמח אם תפנו אלינו כדי שנוכל לתקן ולשפר. ניתן ליצור קשר דרך <strong><a href="contact.html" style="color: var(--accent-magenta); font-weight: bold; text-decoration: underline;">טופס צור קשר</a></strong> באתר או לפנות לצוות הפרויקט.
      </p>

      <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: left; margin-top: 20px; font-weight: normal;">
        עדכון אחרון להצהרה: מאי 2026
      </p>
    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    const btn = document.getElementById('modalCloseBtn');
    if (btn) btn.focus();
  }, 100);
}

