// ==========================================
// חלק א': פונקציות לעיצוב ושינוי נראות הכרטיס
// ==========================================

// 1. פונקציה לשינוי צבע הרקע של הכרטיס
function changeBackground(imageSrc) {
    let bgImage = document.getElementById('card-bg');
    bgImage.src = imageSrc;
}

// 2. פונקציה לשינוי המסגרת
function changeFrame(imageSrc) {
    let frameImage = document.getElementById('card-frame');
    frameImage.src = imageSrc;
}

// 3. פונקציה להצגה או הסתרה של מדבקות בזמן עיצוב (שינוי שקיפות)
function toggleSticker(checkboxId, imageId) {
    let checkbox = document.getElementById(checkboxId);
    let stickerImage = document.getElementById(imageId);

    if (checkbox.checked === true) {
        stickerImage.style.opacity = "1";   /* נדלק! צבע מלא בלי שקיפות */
    } else {
        stickerImage.style.opacity = "0.25"; /* נכבה! חוזר לחצי שקיפות */
    }
}

// 4. פונקציית עזר: העלמת מדבקות שלא נבחרו בזמן ההדפסה
function hideIfUnchecked(checkboxId, imageId) {
    let checkbox = document.getElementById(checkboxId);
    let stickerImage = document.getElementById(imageId);

    if (checkbox.checked === false) {
        stickerImage.style.opacity = "0"; /* מעלים לגמרי בזמן ההדפסה */
    }
}

// ==========================================
// חלק ב': בדיקת תקינות השדות וחסימת הכפתור
// ==========================================

// 5. פונקציית הבדיקה האוטומטית (מופעלת ב-oninput ב-HTML בזמן הקלדה)
function checkFields() {
    let get = document.getElementById("nameGet").value;
    let bless = document.getElementById("greetingCard").value;
    let give = document.getElementById("nameGive").value;
    let printButton = document.getElementById("chekAndPrint");

    // אם שלושת השדות מלאים - משחררים את הכפתור ללחיצה
    if (get !== "" && bless !== "" && give !== "") {
        printButton.disabled = false;
    } else {
        printButton.disabled = true;
    }
}

// ==========================================
// חלק ג': פונקציות חיצוניות גנריות למניעת כפילויות (לולאות ומערכים)
// ==========================================

// 6. פונקציה חיצונית שבודקת כפתורי רדיו ומחזירה את הטקסט של מה שמסומן
function getSelectedRadio(radioIds, radioTexts) {
    for (let i = 0; i < radioIds.length; i++) {
        let element = document.getElementById(radioIds[i]);
        if (element && element.checked) {
            return radioTexts[i]; // מחזיר מיד את הטקסט התואם לרדיו שמסומן
        }
    }
    return "לא נבחר";
}

// 7. פונקציה חיצונית שבודקת צ'קבוקסים ומחזירה מחרוזת טקסט של כל מה שמסומן
function getSelectedCheckboxes(checkboxIds, checkboxTexts) {
    let resultText = "";

    for (let i = 0; i < checkboxIds.length; i++) {
        let element = document.getElementById(checkboxIds[i]);

        // אם הצ'קבוקס מסומן ב-V
        if (element && element.checked) {
            // אם זו לא המדבקה הראשונה (כבר יש משהו בטקסט), נוסיף פסיק ורווח לפני הבאה
            if (resultText !== "") {
                resultText = resultText + ", ";
            }
            // מוסיפים את שם המדבקה
            resultText = resultText + checkboxTexts[i];
        }
    }

    // אם הטקסט נשאר ריק לחלוטין, סימן שלא בחרו אף מדבקה
    if (resultText === "") {
        return "ללא מדבקות";
    } else {
        return resultText;
    }
}

// ==========================================
// חלק ד': פונקציית ההדפסה הראשית והפקת הסיכום
// ==========================================

// 8. פונקציית ההדפסה הראשית - מדפיסה לכרטיס ויוצרת סיכום במיקום נפרד בדף
function blessText() {
    const give = document.getElementById("nameGive").value;
    const bless = document.getElementById("greetingCard").value;
    const get = document.getElementById("nameGet").value;

    // הגדרת מערכים של ה-ID והטקסטים מתוך ה-HTML לצורך בדיקת העיצובים
    let colorIds = ["blue", "pink", "green", "yellow", "lilach"];
    let colorTexts = ["תכלת", "ורוד", "ירוק", "צהוב", "סגול"];

    let frameIds = ["balloons", "flowers", "hearts"];
    let frameTexts = ["בלונים", "פרחים", "לבבות"];

    let stickerIds = ["space", "smiley", "glitters", "dinosaur", "animals"];
    let stickerTexts = ["חלל", "סמיילים", "נצנצים", "דינוזאורים", "חיות"];

    // קריאה לפונקציות החיצוניות הגנריות שאוספות את הנתונים ומסכמות אותם
    let selectedColor = getSelectedRadio(colorIds, colorTexts);
    let selectedFrame = getSelectedRadio(frameIds, frameTexts);
    let selectedStickers = getSelectedCheckboxes(stickerIds, stickerTexts);

    // 1. הדפסת הברכה עצמה לתוך ה-div של ה-text (בתוך כרטיס הברכה במסך)
    document.getElementById("text").innerHTML =
        "<h2>לכבוד: " + get + "</h2>" +
        "<p>" + bless + "</p>" +
        "<h3>ממני: " + give + "</h3>";

    // 2. הדפסת הסיכום הטקסטואלי לתוך ה-div הריק שנמצא במקום אחר בדף
    document.getElementById("designSummary").innerHTML =
        "<strong>סיכום עיצוב:</strong><br>" +
        "צבע רקע: " + selectedColor + "<br>" +
        "מסגרת: " + selectedFrame + "<br>" +
        "מדבקות שנבחרו: " + selectedStickers;

    // לולאת עזר שעוברת על כל המדבקות ומעלימה את אלו שלא סומנו ב-V
    for (let i = 0; i < stickerIds.length; i++) {
        hideIfUnchecked(stickerIds[i], "img-" + stickerIds[i]);
    }
    document.getElementById("designSummary").style.display = "block";
}
