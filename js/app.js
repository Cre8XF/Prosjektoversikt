/* app.js — Main entry point, wires modules together */
(function () {
  var currentView = "dashboard"; // "dashboard" or "table"

  function refresh() {
    var projects = window.Data.getProjects();
    var filtered = window.Filters.apply(projects);

    var main = document.getElementById("main-content");
    var summary = document.getElementById("summary-strip");

    window.Render.renderSummary(filtered, summary);

    if (currentView === "dashboard") {
      window.Render.renderDashboard(filtered, main);
    } else {
      window.Render.renderTable(filtered, main);
    }
  }

  function setView(view) {
    currentView = view;
    document.querySelectorAll(".view-toggle .btn").forEach(function (b) {
      b.classList.toggle("active", b.dataset.view === view);
    });
    refresh();
  }

  function bindToolbar() {
    var searchInput = document.getElementById("filter-search");
    var phaseSelect = document.getElementById("filter-phase");
    var statusSelect = document.getElementById("filter-status");
    var categorySelect = document.getElementById("filter-category");
    var prioritySelect = document.getElementById("filter-priority");
    var needsActionCb = document.getElementById("filter-needs-action");

    searchInput.addEventListener("input", function () {
      window.Filters.setState({ search: searchInput.value });
      refresh();
    });

    phaseSelect.addEventListener("change", function () {
      window.Filters.setState({ phase: phaseSelect.value });
      refresh();
    });

    statusSelect.addEventListener("change", function () {
      window.Filters.setState({ status: statusSelect.value });
      refresh();
    });

    categorySelect.addEventListener("change", function () {
      window.Filters.setState({ category: categorySelect.value });
      refresh();
    });

    prioritySelect.addEventListener("change", function () {
      window.Filters.setState({ priority: prioritySelect.value });
      refresh();
    });

    needsActionCb.addEventListener("change", function () {
      window.Filters.setState({ needsAction: needsActionCb.checked });
      refresh();
    });
  }

  function bindViewToggle() {
    document.querySelectorAll(".view-toggle .btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.dataset.view);
      });
    });
  }

  function bindDataBar() {
    document.getElementById("btn-export").addEventListener("click", function () {
      window.Render.exportJSON();
    });

    document.getElementById("btn-import").addEventListener("click", function () {
      document.getElementById("import-file").click();
    });

    document.getElementById("import-file").addEventListener("change", function (e) {
      if (e.target.files.length) {
        window.Render.importJSON(e.target.files[0]);
        e.target.value = "";
      }
    });

    document.getElementById("btn-reset").addEventListener("click", function () {
      window.Render.resetOverrides();
    });
  }

  function init() {
    window.Theme.init();

    window.Data.loadDefaults()
      .then(function () {
        bindToolbar();
        bindViewToggle();
        bindDataBar();
        setView("dashboard");
      })
      .catch(function (err) {
        console.error("Failed to load projects:", err);
        document.getElementById("error-box").hidden = false;
      });
  }

  // Expose refresh globally so actions can trigger re-render
  window.App = { refresh: refresh, init: init };

  document.addEventListener("DOMContentLoaded", init);
})();
