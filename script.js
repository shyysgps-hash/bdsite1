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
// 1. Spritesheet & Dynamic Slices Configuration
// ==========================================
const SPRITESHEET_URI = 'images/products.png';
const PRODUCTS_METADATA = [
  { id: 'gummy', name: 'סוכריות גומי ארוכות / נחשים', x: 285, y: 70, w: 280, h: 160 },
  { id: 'pills', name: 'אקמול פוקוס / אדוויל', x: 25, y: 340, w: 245, h: 155 },
  { id: 'alcohol', name: 'בקבוקון אלכוהול מיניאטורי', x: 25, y: 555, w: 90, h: 235 },
  { id: 'eye_pads', name: 'רפידות ג׳ל לעיניים', x: 195, y: 570, w: 200, h: 180 },
  { id: 'tattoos', name: 'קעקועי מים בעיצובים', x: 610, y: 90, w: 170, h: 190 },
  { id: 'mask', name: 'מסכה לפנים', x: 50, y: 55, w: 175, h: 195 },
  { id: 'coffee', name: 'שקיות קפה איכותי', x: 565, y: 340, w: 320, h: 160 },
  { id: 'opener', name: 'פותחן בקבוקים נוסטלגי', x: 505, y: 620, w: 210, h: 110 },
  { id: 'socks', name: 'גרביים עם הדפסים', x: 750, y: 730, w: 160, h: 110 },
  { id: 'tea', name: 'תה צמחים מרגיע', x: 80, y: 835, w: 160, h: 120 },
  { id: 'coaster', name: 'תחתית לכוס קפה', x: 590, y: 825, w: 130, h: 90 },
  { id: 'cloth', name: 'מטלית ניקוי למשקפיים', x: 760, y: 550, w: 145, h: 100 },
  { id: 'glasses', name: 'משקפיים שחורות', x: 360, y: 440, w: 180, h: 70 },
  { id: 'chocolate', name: 'שוקולד מריר', x: 340, y: 825, w: 155, h: 80 },
  { id: 'gum_cigs', name: 'מסטיקים בקופסת סיגריות של פעם', x: 790, y: 85, w: 180, h: 220 }
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

function showSystemModal(title, htmlMessage) {
  const overlay = document.getElementById('retroModalOverlay');
  const modalTitle = document.getElementById('modalTitleText');
  const modalBody = document.getElementById('modalBodyText');

  if (!overlay) return;

  modalTitle.innerHTML = title;
  modalBody.innerHTML = htmlMessage;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

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
    // Force show warning modal immediately on page load
    warningOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Age confirm (Yes I am aware / Yes I enter)
    btnAgeConfirm.addEventListener('click', () => {
      warningOverlay.style.display = 'none';
      document.body.style.overflow = '';
      // Optional: Play dynamic audio greeting
    });

    // Age deny (I'm not at the age for this)
    btnAgeDeny.addEventListener('click', () => {
      showSystemModal(
        'הפניה לעזרה רפואית 🚑',
        'החלטה נבונה! הבנו ששעת השינה שלך היא 21:30. הנפקנו עבורך אישור פטור מסירוק בלונים ומשיכה בחבל. אנא פנה לקופת החולים הקרובה לקבלת מרשם לאטמי אוזניים ומשחת וולטרן לגב!'
      );
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
    0: 'https://www.youtube.com/embed/H0CclDmsL6g?autoplay=1', // Parpar Nehmad
    1: 'https://www.youtube.com/embed/9B_30sMvLCo?autoplay=1', // Hopa Hey
    2: 'https://www.youtube.com/embed/U9sQjH6d_h0?autoplay=1', // Marco / The Heart
    3: 'https://www.youtube.com/embed/5a2d_W90N80?autoplay=1', // Inyan Shel Zman
    4: 'https://www.youtube.com/embed/2uS8qjD3Rhs?autoplay=1'  // Mesibat Kita
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

      // 1. Play Fireworks animation
      triggerCanvasFireworks();

      // 2. Open Retro Modal with Bag image
      setTimeout(() => {
        showSystemModal(
          `בחרת בהצלחה: ${bagName}!`,
          `<div style="display:flex; flex-direction:column; align-items:center; gap:15px;">
            <img src="${bagImage}" alt="${bagName}" style="height:220px; object-fit:contain; border-radius:4px;">
            <div style="text-align:right; width:100%; font-size:0.95rem;">
              <strong>תכולת שקית ההישרדות שלך:</strong><br>${bagContent}
            </div>
          </div>`
        );
      }, 500);
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

  // Custom Builder Actions
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

      const itemsNames = selectedItems.map(itemId => {
        const prod = PRODUCTS_METADATA.find(p => p.id === itemId);
        return prod ? prod.name : itemId;
      });

      const summaryText = `השקית החווייתית שלך מוכנה לחלוקה!<br><br><strong>סוג שקית:</strong> סגנון ${activeBagStyle}<br><strong>מספר פריטי הישרדות:</strong> ${selectedItems.length}<br><br><strong>רשימת הפריטים שהרכבת:</strong><br>• ${itemsNames.join('<br>• ')}`;
      showSystemModal('השקית נשמרה בהצלחה! 🛍️', summaryText);
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
 * Preloads products.png and cuts out individual items into Base64 URLs using Canvas.
 * Accepts callback to trigger after cropping is finished.
 */
function preloadAndSliceProducts(callback) {
  const img = new Image();
  img.src = SPRITESHEET_URI;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    PRODUCTS_METADATA.forEach(prod => {
      canvas.width = prod.w;
      canvas.height = prod.h;
      ctx.clearRect(0, 0, prod.w, prod.h);
      ctx.drawImage(img, prod.x, prod.y, prod.w, prod.h, 0, 0, prod.w, prod.h);
      SLICED_IMAGES[prod.id] = canvas.toDataURL('image/png');
    });

    if (callback) callback();
  };
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
    { top: '10%', left: '15%' },
    { top: '18%', left: '70%' },
    { top: '35%', left: '80%' },
    { top: '50%', left: '10%' },
    { top: '65%', left: '78%' },
    { top: '80%', left: '20%' },
    { top: '82%', left: '60%' },
    { top: '25%', left: '12%' },
    { top: '60%', left: '14%' },
    { top: '42%', left: '74%' },
    { top: '5%', left: '45%' },
    { top: '90%', left: '42%' },
    { top: '75%', left: '10%' },
    { top: '12%', left: '78%' },
    { top: '30%', left: '82%' }
  ];

  const posIdx = (selectedItems.length - 1) % positions.length;
  const coord = positions[posIdx];

  const scatter = document.createElement('div');
  scatter.className = 'scatter-item';
  scatter.style.backgroundImage = `url('${SLICED_IMAGES[productId]}')`;
  scatter.style.top = coord.top;
  scatter.style.left = coord.left;
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
function initContactPage() {
  const form = document.getElementById('guestbookForm');
  if (!form) return;

  const fields = ['name', 'email', 'message'];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      const error = document.getElementById(`${fieldId}Error`);
      
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('invalid');
        error.classList.add('visible');
        field.setAttribute('aria-invalid', 'true');
      } else if (fieldId === 'email' && !validateEmail(field.value.trim())) {
        isValid = false;
        field.classList.add('invalid');
        error.innerText = 'כתובת המייל שהזנת אינה תקינה';
        error.classList.add('visible');
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('invalid');
        error.classList.remove('visible');
        field.setAttribute('aria-invalid', 'false');
      }
    });

    if (isValid) {
      const name = document.getElementById('name').value;
      showSystemModal(
        'הברכה נרשמה בהצלחה! ✉', 
        `תודה רבה לך <strong>${name}</strong>!<br><br>ברכת יום ההולדת והמשוב המקסים שלך נשמרו בספר האורחים הרשמי של 'אני לא בגיל לזה'!<br>אנו נשמח לקרוא אותה בהקדם האפשרי.`
      );
      form.reset();
    }
  });

  // Realtime cleanup on focus/input
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    field.addEventListener('input', () => {
      if (field.value.trim()) {
        field.classList.remove('invalid');
        document.getElementById(`${fieldId}Error`).classList.remove('visible');
        field.setAttribute('aria-invalid', 'false');
      }
    });
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
