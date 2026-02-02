/* filters.js — Search, filter, sort logic */
(function () {
  var state = {
    search: "",
    phase: "",       // "" = all, or "1","2","3","4"
    status: "",      // "" = all, or specific status
    category: "",    // "" = all
    priority: "",    // "" = all
    needsAction: false,
    sortField: "title",
    sortAsc: true
  };

  function getState() {
    return state;
  }

  function setState(partial) {
    Object.assign(state, partial);
  }

  /** Apply all active filters + search to a project list */
  function apply(projects) {
    var result = projects;

    // Text search
    if (state.search) {
      var q = state.search.toLowerCase();
      result = result.filter(function (p) {
        return p.title.toLowerCase().indexOf(q) !== -1 ||
          p.notes.toLowerCase().indexOf(q) !== -1 ||
          p.tech.join(" ").toLowerCase().indexOf(q) !== -1 ||
          p.tags.join(" ").toLowerCase().indexOf(q) !== -1 ||
          p.nextAction.toLowerCase().indexOf(q) !== -1;
      });
    }

    // Filter: phase
    if (state.phase) {
      var ph = parseInt(state.phase, 10);
      result = result.filter(function (p) { return p.phase === ph; });
    }

    // Filter: status
    if (state.status) {
      result = result.filter(function (p) { return p.status === state.status; });
    }

    // Filter: category
    if (state.category) {
      result = result.filter(function (p) { return p.category === state.category; });
    }

    // Filter: priority
    if (state.priority) {
      result = result.filter(function (p) { return p.priority === state.priority; });
    }

    // Toggle: needs action
    if (state.needsAction) {
      result = result.filter(function (p) {
        return p.nextAction ||
          p.status === "not_started" ||
          p.status === "fixing";
      });
    }

    // Sort
    result = result.slice().sort(function (a, b) {
      var va = a[state.sortField];
      var vb = b[state.sortField];
      if (va == null) va = "";
      if (vb == null) vb = "";
      if (typeof va === "number" && typeof vb === "number") {
        return state.sortAsc ? va - vb : vb - va;
      }
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
      if (va < vb) return state.sortAsc ? -1 : 1;
      if (va > vb) return state.sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }

  window.Filters = {
    getState: getState,
    setState: setState,
    apply: apply
  };
})();
