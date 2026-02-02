/* data.js — Load defaults from JSON, merge with localStorage overrides */
(function () {
  var defaults = [];
  var merged = [];

  /** Ensure a project has all expected fields */
  function normalize(p) {
    return {
      id: p.id || "",
      title: p.title || "",
      category: p.category || "ide",
      phase: p.phase || 1,
      status: p.status || "not_started",
      repoUrl: p.repoUrl || null,
      liveUrl: p.liveUrl || null,
      lastReviewed: p.lastReviewed || null,
      nextAction: p.nextAction || "",
      notes: p.notes || "",
      tech: Array.isArray(p.tech) ? p.tech : [],
      tags: Array.isArray(p.tags) ? p.tags : [],
      priority: p.priority || null
    };
  }

  /** Merge defaults with localStorage overrides */
  function merge() {
    var overrides = window.Storage.loadOverrides();
    merged = defaults.map(function (d) {
      var o = overrides[d.id];
      if (o) {
        return normalize(Object.assign({}, d, o));
      }
      return normalize(d);
    });
    return merged;
  }

  /** Fetch defaults from JSON, then merge */
  function loadDefaults() {
    return fetch("data/projects.json")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (projects) {
        defaults = projects.map(normalize);
        return merge();
      });
  }

  /** Get current merged data (without re-fetching) */
  function getProjects() {
    return merge();
  }

  /** Get a single project by id */
  function getProject(id) {
    return getProjects().find(function (p) { return p.id === id; }) || null;
  }

  /** Get the raw defaults (for export) */
  function getDefaults() {
    return defaults;
  }

  /** Build a full merged export (defaults + overrides applied) */
  function getExportData() {
    return getProjects();
  }

  window.Data = {
    loadDefaults: loadDefaults,
    getProjects: getProjects,
    getProject: getProject,
    getDefaults: getDefaults,
    getExportData: getExportData
  };
})();
