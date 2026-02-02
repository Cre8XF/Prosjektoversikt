/* theme.js — Theme switcher with localStorage persistence */
(function () {
  var THEME_KEY = "cxf-theme";
  var DEFAULT = "light-theme";

  function apply(theme) {
    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  }

  function init() {
    apply(localStorage.getItem(THEME_KEY) || DEFAULT);

    document.querySelectorAll("[data-theme]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        apply(btn.dataset.theme + "-theme");
      });
    });
  }

  window.Theme = { init: init };
})();
