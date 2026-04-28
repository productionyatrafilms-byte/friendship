const btnEn = document.querySelector(".english");
const btnHi = document.querySelector(".hindi");
const btnGu = document.querySelector(".gujarati");
const pageLinks = document.querySelectorAll(".pages .page");

const buttons = [btnEn, btnHi, btnGu].filter(Boolean);

const LANG_KEY = "selectedLanguage";
const DEFAULT_LANG = "English";

let translations = {};

const savedLangOnStart = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;

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
  if (!langData) return;

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
    const savedLang = localStorage.getItem(LANG_KEY) || DEFAULT_LANG;
    setLanguageAttribute(savedLang);

    const response = await fetch("./assets/json/data.json", {
      cache: "no-store",
    });

    translations = await response.json();

    applyLanguage(savedLang);
  } catch (error) {
    console.error("Error loading translations:", error);
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

  btnEn?.addEventListener("click", () => applyLanguage("English"));
  btnHi?.addEventListener("click", () => applyLanguage("Hindi"));
  btnGu?.addEventListener("click", () => applyLanguage("Gujarati"));

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