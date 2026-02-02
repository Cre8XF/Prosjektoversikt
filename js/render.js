/* render.js — Dashboard view, Table view, actions, import/export */
(function () {
  var STATUSES = [
    { value: "not_started", label: "Not started" },
    { value: "auditing", label: "Auditing" },
    { value: "fixing", label: "Fixing" },
    { value: "active", label: "Active" },
    { value: "frozen", label: "Frozen" },
    { value: "archived", label: "Archived" }
  ];

  var PHASE_LABELS = {
    1: "Phase 1 — Idea / Concept",
    2: "Phase 2 — In Progress",
    3: "Phase 3 — MVP / Prototype",
    4: "Phase 4 — Live / Maintained"
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  function link(href, text) {
    var a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = text;
    return a;
  }

  function statusBadge(status) {
    var label = status.replace(/_/g, " ");
    return el("span", "status-badge " + status, label);
  }

  function priorityDot(priority) {
    if (!priority) return document.createTextNode("");
    return el("span", "priority-dot " + priority);
  }

  function needsAction(p) {
    return p.nextAction ||
      p.status === "not_started" ||
      p.status === "auditing" ||
      p.status === "fixing";
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---- Actions ----

  function doAction(id, fields) {
    window.Storage.updateProject(id, fields);
    window.App.refresh();
  }

  function markReviewed(id) {
    doAction(id, { lastReviewed: today() });
  }

  function freeze(id) {
    doAction(id, { status: "frozen", lastReviewed: today() });
  }

  function archive(id) {
    doAction(id, { status: "archived" });
  }

  function actionButtons(p) {
    var wrap = el("div", "card-actions");

    var btnReview = el("button", "btn", "Mark reviewed");
    btnReview.addEventListener("click", function (e) {
      e.stopPropagation();
      markReviewed(p.id);
    });
    wrap.appendChild(btnReview);

    if (p.status !== "frozen") {
      var btnFreeze = el("button", "btn", "Freeze");
      btnFreeze.addEventListener("click", function (e) {
        e.stopPropagation();
        freeze(p.id);
      });
      wrap.appendChild(btnFreeze);
    }

    if (p.status !== "archived") {
      var btnArchive = el("button", "btn", "Archive");
      btnArchive.addEventListener("click", function (e) {
        e.stopPropagation();
        archive(p.id);
      });
      wrap.appendChild(btnArchive);
    }

    return wrap;
  }

  // ---- Dashboard View ----

  function renderCard(p) {
    var card = el("div", "card");
    card.id = "project-" + p.id;

    // Title row
    var titleRow = el("div", "card-title-row");
    var title = el("span", "card-title", p.title);
    titleRow.appendChild(title);

    var meta = el("span", "card-meta");
    meta.appendChild(statusBadge(p.status));
    meta.appendChild(priorityDot(p.priority));
    if (needsAction(p)) {
      meta.appendChild(el("span", "needs-action-dot"));
    }
    titleRow.appendChild(meta);
    card.appendChild(titleRow);

    // Details (hidden by default)
    var details = el("div", "card-details");

    if (p.notes) {
      details.appendChild(el("p", null, p.notes));
    }
    if (p.nextAction) {
      var naP = el("p");
      naP.appendChild(el("strong", null, "Next: "));
      naP.appendChild(document.createTextNode(p.nextAction));
      details.appendChild(naP);
    }

    var techP = el("p");
    techP.appendChild(el("strong", null, "Tech: "));
    techP.appendChild(document.createTextNode(p.tech.join(", ")));
    details.appendChild(techP);

    if (p.tags.length) {
      var tagWrap = el("div", "tag-list");
      p.tags.forEach(function (t) {
        tagWrap.appendChild(el("span", "badge", t));
      });
      details.appendChild(tagWrap);
    }

    // Links
    var linksDiv = el("div", "card-links");
    if (p.repoUrl) linksDiv.appendChild(link(p.repoUrl, "Repo"));
    if (p.liveUrl) linksDiv.appendChild(link(p.liveUrl, "Live"));
    if (linksDiv.childNodes.length) details.appendChild(linksDiv);

    if (p.lastReviewed) {
      details.appendChild(el("p", null, "Last reviewed: " + p.lastReviewed));
    }

    details.appendChild(actionButtons(p));
    card.appendChild(details);

    // Toggle
    card.addEventListener("click", function (e) {
      if (e.target.tagName === "A" || e.target.tagName === "BUTTON" || e.target.tagName === "SELECT") return;
      card.classList.toggle("open");
    });

    return card;
  }

  function renderDashboard(projects, container) {
    container.textContent = "";
    var grouped = {};
    projects.forEach(function (p) {
      var ph = p.phase;
      if (!grouped[ph]) grouped[ph] = [];
      grouped[ph].push(p);
    });

    // Render phases 4 → 1 (most mature first)
    [4, 3, 2, 1].forEach(function (ph) {
      var items = grouped[ph];
      if (!items || items.length === 0) return;

      var group = el("div", "phase-group");

      var header = el("div", "phase-header");
      header.appendChild(el("span", null, PHASE_LABELS[ph] || "Phase " + ph));

      // Status counts
      var counts = el("span", "phase-counts");
      var statusCount = {};
      items.forEach(function (p) {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
      });
      Object.keys(statusCount).forEach(function (s) {
        counts.appendChild(el("span", "status-badge " + s, statusCount[s] + " " + s.replace(/_/g, " ")));
      });
      header.appendChild(counts);
      group.appendChild(header);

      var body = el("div", "phase-body");
      items.forEach(function (p) {
        body.appendChild(renderCard(p));
      });
      group.appendChild(body);
      container.appendChild(group);
    });

    if (!container.childNodes.length) {
      container.appendChild(el("p", null, "No projects match the current filters."));
    }
  }

  // ---- Table View ----

  function renderTableHeader(container) {
    var header = el("div", "table-header");
    var fields = [
      { key: "title", label: "Title" },
      { key: "phase", label: "Phase" },
      { key: "status", label: "Status" },
      { key: "category", label: "Category" },
      { key: "lastReviewed", label: "Reviewed" },
      { key: "priority", label: "Priority" }
    ];
    fields.forEach(function (f) {
      var s = el("span", null, f.label);
      var fs = window.Filters.getState();
      if (fs.sortField === f.key) {
        var arrow = el("span", "sort-arrow", fs.sortAsc ? " ▲" : " ▼");
        s.appendChild(arrow);
      }
      s.addEventListener("click", function () {
        var current = window.Filters.getState();
        if (current.sortField === f.key) {
          window.Filters.setState({ sortAsc: !current.sortAsc });
        } else {
          window.Filters.setState({ sortField: f.key, sortAsc: true });
        }
        window.App.refresh();
      });
      header.appendChild(s);
    });
    container.appendChild(header);
  }

  function renderTableRow(p) {
    var row = el("div", "table-row");

    // Title + links
    var titleCell = el("div");
    var titleText = el("strong", null, p.title);
    titleCell.appendChild(titleText);
    if (needsAction(p)) {
      titleCell.appendChild(el("span", "needs-action-dot"));
    }
    if (p.repoUrl) {
      titleCell.appendChild(document.createTextNode(" "));
      titleCell.appendChild(link(p.repoUrl, "[repo]"));
    }
    if (p.liveUrl) {
      titleCell.appendChild(document.createTextNode(" "));
      titleCell.appendChild(link(p.liveUrl, "[live]"));
    }
    row.appendChild(titleCell);

    // Phase dropdown
    var phaseSelect = document.createElement("select");
    [1, 2, 3, 4].forEach(function (n) {
      var opt = document.createElement("option");
      opt.value = n;
      opt.textContent = n;
      if (p.phase === n) opt.selected = true;
      phaseSelect.appendChild(opt);
    });
    phaseSelect.addEventListener("change", function () {
      doAction(p.id, { phase: parseInt(phaseSelect.value, 10) });
    });
    row.appendChild(phaseSelect);

    // Status dropdown
    var statusSelect = document.createElement("select");
    STATUSES.forEach(function (s) {
      var opt = document.createElement("option");
      opt.value = s.value;
      opt.textContent = s.label;
      if (p.status === s.value) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.addEventListener("change", function () {
      doAction(p.id, { status: statusSelect.value });
    });
    row.appendChild(statusSelect);

    // Category
    row.appendChild(el("span", null, p.category));

    // Last reviewed
    row.appendChild(el("span", null, p.lastReviewed || "—"));

    // Priority
    var priCell = el("span");
    priCell.appendChild(priorityDot(p.priority));
    priCell.appendChild(document.createTextNode(" " + (p.priority || "—")));
    row.appendChild(priCell);

    return row;
  }

  function renderTable(projects, container) {
    container.textContent = "";
    var wrap = el("div", "table-wrap");
    renderTableHeader(wrap);
    projects.forEach(function (p) {
      wrap.appendChild(renderTableRow(p));
    });
    if (!projects.length) {
      wrap.appendChild(el("p", null, "No projects match the current filters."));
    }
    container.appendChild(wrap);
  }

  // ---- Summary strip ----

  function renderSummary(projects, container) {
    container.textContent = "";
    var total = projects.length;
    var action = projects.filter(needsAction).length;
    var frozen = projects.filter(function (p) { return p.status === "frozen"; }).length;
    var archived = projects.filter(function (p) { return p.status === "archived"; }).length;

    container.appendChild(el("span", null, "Total: " + total));
    container.appendChild(el("span", null, "Needs action: " + action));
    container.appendChild(el("span", null, "Frozen: " + frozen));
    container.appendChild(el("span", null, "Archived: " + archived));
  }

  // ---- Export / Import / Reset ----

  function exportJSON() {
    var data = window.Data.getExportData();
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "projects-export.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) throw new Error("Expected array");
        // Build overrides from imported data keyed by id
        var overrides = {};
        imported.forEach(function (p) {
          if (p.id) overrides[p.id] = p;
        });
        window.Storage.replaceOverrides(overrides);
        window.App.refresh();
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetOverrides() {
    if (confirm("Clear all local overrides and reload defaults?")) {
      window.Storage.clearOverrides();
      window.App.refresh();
    }
  }

  window.Render = {
    renderDashboard: renderDashboard,
    renderTable: renderTable,
    renderSummary: renderSummary,
    exportJSON: exportJSON,
    importJSON: importJSON,
    resetOverrides: resetOverrides
  };
})();
