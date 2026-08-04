const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujarati");
const pageLinks = document.querySelectorAll(".pages .page");

const buttons = [btnEn, btnHi, btnGu].filter(Boolean);

const LANG_KEY = "selectedLanguage";
const DEFAULT_LANG = "English";
const VALID_LANGS = ["English", "Hindi", "Gujarati"];

// ================= LANDSCAPE ALERT =================

let landscapeAlertShown = false;

function checkScreenSize() {
  const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  if (isMobile && window.innerWidth < 768) {
    if (!landscapeAlertShown) {
      landscapeAlertShown = true;
      alert("Please use Landscape!");
    }
  } else {
    landscapeAlertShown = false;
  }
}

window.addEventListener("load", checkScreenSize);
window.addEventListener("resize", checkScreenSize);



let translations = {};

// Language click audios (renamed to avoid clashing with page-specific inline scripts
// that declare their own engAudio/hinAudio/gujAudio consts)
const langEngAudio = document.getElementById("engAudio");
const langHinAudio = document.getElementById("hinAudio");
const langGujAudio = document.getElementById("gujAudio");

function playLangAudio(audio) {
  if (!audio) return;

  [langEngAudio, langHinAudio, langGujAudio].forEach((a) => {
    if (a) {
      a.pause();
      a.currentTime = 0;
    }
  });

  audio.currentTime = 0;
  const playPromise = audio.play();

  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.log("Audio not playing. Check file path or browser:", error);
    });
  }
}

function getSavedLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return VALID_LANGS.includes(saved) ? saved : DEFAULT_LANG;
}

const savedLangOnStart = getSavedLang();

document.documentElement.lang = savedLangOnStart;

if (document.body) {
  if (savedLangOnStart === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
  } else if (savedLangOnStart === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
  } else {
    document.body.setAttribute("data-lang", "en");
  }
}

const hoverAudio = new Audio("./assets/video/audio.mp3");
hoverAudio.preload = "auto";

function setActiveButton(activeBtn) {
  buttons.forEach((btn) => btn.classList.remove("active"));
  if (activeBtn) activeBtn.classList.add("active");
}

function setLanguageAttribute(lang) {
  document.documentElement.lang = lang;

  if (lang === "English") {
    document.body.setAttribute("data-lang", "en");
  } else if (lang === "Hindi") {
    document.body.setAttribute("data-lang", "hi");
  } else if (lang === "Gujarati") {
    document.body.setAttribute("data-lang", "gu");
  }
}

function applyLanguage(lang) {
  const langData = translations[lang];
  if (!langData) {
    console.warn(`No translation data found for language: "${lang}"`);
    return;
  }

  setLanguageAttribute(lang);

  if (lang === "English") {
    setActiveButton(btnEn);
  } else if (lang === "Hindi") {
    setActiveButton(btnHi);
  } else if (lang === "Gujarati") {
    setActiveButton(btnGu);
  }

  document.querySelectorAll("[data-lang-key]").forEach((el) => {
    const key = el.getAttribute("data-lang-key");
    const value = langData[key];

    if (value !== undefined) {
      if (typeof value === "string" && value.includes("<br>")) {
        el.innerHTML = value;
      } else {
        el.textContent = value;
      }
    }
  });

  localStorage.setItem(LANG_KEY, lang);
}

async function loadTranslations() {
  try {
    const savedLang = getSavedLang();
    setLanguageAttribute(savedLang);

    const basePath =
      window.location.origin +
      window.location.pathname.substring(
        0,
        window.location.pathname.lastIndexOf("/") + 1
      );

    const response = await fetch(`${basePath}assets/json/data.json`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        `Could not load data.json — HTTP ${response.status}: ${response.statusText}`
      );
    }

    const text = await response.text();

    try {
      translations = JSON.parse(text);
    } catch (parseErr) {
      throw new Error(`data.json has invalid JSON: ${parseErr.message}`);
    }

    console.log("✅ Translations loaded:", Object.keys(translations));
    applyLanguage(savedLang);
  } catch (error) {
    console.error("❌ Translation error:", error.message);
  }
}

function setActivePage() {
  let currentPage = window.location.pathname.split("/").pop();

  if (currentPage === "") {
    currentPage = "index.html";
  }

  pageLinks.forEach((link) => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  loadTranslations();
  setActivePage();

  btnEn?.addEventListener("click", () => {
    playLangAudio(langEngAudio);
    applyLanguage("English");
  });

  btnHi?.addEventListener("click", () => {
    playLangAudio(langHinAudio);
    applyLanguage("Hindi");
  });

  btnGu?.addEventListener("click", () => {
    playLangAudio(langGujAudio);
    applyLanguage("Gujarati");
  });

  document
    .querySelectorAll(".circle-2, .circle-3, .circle-4")
    .forEach((circle) => {
      circle.addEventListener("mouseenter", () => {
        hoverAudio.pause();
        hoverAudio.currentTime = 0;
        hoverAudio.play().catch((error) => {
          console.log("Browser blocked hover audio:", error);
        });
      });

      circle.addEventListener("mouseleave", () => {
        hoverAudio.pause();
        hoverAudio.currentTime = 0;
      });
    });
});