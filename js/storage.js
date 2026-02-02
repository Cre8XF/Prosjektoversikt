/* storage.js — localStorage overrides for project data */
(function () {
  var STORAGE_KEY = "cxf-overrides";

  /** Return the raw overrides object { [id]: partialProject } */
  function loadOverrides() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  /** Save the full overrides object */
  function saveOverrides(overrides) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  }

  /** Update a single project override (merges with existing) */
  function updateProject(id, fields) {
    var overrides = loadOverrides();
    overrides[id] = Object.assign({}, overrides[id] || {}, fields);
    saveOverrides(overrides);
  }

  /** Clear all overrides */
  function clearOverrides() {
    localStorage.removeItem(STORAGE_KEY);
  }

  /** Replace all overrides (for import) */
  function replaceOverrides(overrides) {
    saveOverrides(overrides);
  }

  window.Storage = {
    loadOverrides: loadOverrides,
    saveOverrides: saveOverrides,
    updateProject: updateProject,
    clearOverrides: clearOverrides,
    replaceOverrides: replaceOverrides
  };
})();
