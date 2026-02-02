document.addEventListener("DOMContentLoaded", function () {
  // --- A4: Theme logic — single source of truth on <body>, persisted in localStorage ---
  var THEME_KEY = "cxf-theme";
  var DEFAULT_THEME = "light-theme";

  function applyTheme(theme) {
    document.body.className = theme;
    localStorage.setItem(THEME_KEY, theme);
  }

  applyTheme(localStorage.getItem(THEME_KEY) || DEFAULT_THEME);

  document.querySelectorAll(".theme-switcher button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(btn.dataset.theme + "-theme");
    });
  });

  // --- A5: Generate a stable slug id from title ---
  function slugify(text) {
    return text
      .toLowerCase()
      .replace(/[æ]/g, "ae")
      .replace(/[ø]/g, "o")
      .replace(/[å]/g, "a")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // --- W11: Normalize links — ensure consistent shape ---
  function normalizeLinks(links) {
    if (!links || typeof links !== "object") {
      return { github: null, demo: null, roadmap: null };
    }
    return {
      github: links.github || null,
      demo: links.demo || null,
      roadmap: links.roadmap || null
    };
  }

  // --- A3: Safe DOM construction — no innerHTML for data fields ---
  function createLink(href, label) {
    var a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = label;
    return a;
  }

  function renderProject(p) {
    var div = document.createElement("div");
    div.className = "project";
    div.id = "project-" + p.id;

    var title = document.createElement("h2");
    title.textContent = p.title;
    div.appendChild(title);

    var details = document.createElement("div");
    details.className = "details";

    var desc = document.createElement("p");
    desc.textContent = p.description;
    details.appendChild(desc);

    var statusP = document.createElement("p");
    var statusLabel = document.createElement("strong");
    statusLabel.textContent = "Status: ";
    statusP.appendChild(statusLabel);
    statusP.appendChild(document.createTextNode(p.status));
    details.appendChild(statusP);

    var todoP = document.createElement("p");
    var todoLabel = document.createElement("strong");
    todoLabel.textContent = "Gjenstar: ";
    todoP.appendChild(todoLabel);
    todoP.appendChild(document.createTextNode(p.todo));
    details.appendChild(todoP);

    var techP = document.createElement("p");
    var techLabel = document.createElement("strong");
    techLabel.textContent = "Teknologi: ";
    techP.appendChild(techLabel);
    techP.appendChild(document.createTextNode(p.tech));
    details.appendChild(techP);

    var links = normalizeLinks(p.links);
    var meta = document.createElement("div");
    meta.className = "meta";

    if (links.github) {
      meta.appendChild(createLink(links.github, "GitHub"));
      meta.appendChild(document.createElement("br"));
    }
    if (links.demo) {
      meta.appendChild(createLink(links.demo, "Demo"));
      meta.appendChild(document.createElement("br"));
    }
    if (links.roadmap) {
      meta.appendChild(createLink(links.roadmap, "Roadmap"));
      meta.appendChild(document.createElement("br"));
    }

    var dateSpan = document.createElement("span");
    dateSpan.textContent = "Sist oppdatert: " + p.lastUpdated;
    meta.appendChild(dateSpan);

    details.appendChild(meta);
    div.appendChild(details);

    div.addEventListener("click", function (e) {
      // Don't toggle when clicking links
      if (e.target.tagName === "A") return;
      div.classList.toggle("open");
    });

    return div;
  }

  function renderProjects(list, containerId) {
    var container = document.getElementById(containerId);
    list.forEach(function (p) {
      container.appendChild(renderProject(p));
    });
  }

  // --- A6: Fetch with error handling ---
  fetch("data/projects.json")
    .then(function (res) {
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    })
    .then(function (projects) {
      // A5: Ensure every project has a stable id
      projects.forEach(function (p) {
        if (!p.id) {
          p.id = slugify(p.title);
        }
      });

      var ferdige = projects.filter(function (p) { return p.category === "ferdig"; });
      var pabegynte = projects.filter(function (p) { return p.category === "påbegynt"; });
      var ideer = projects.filter(function (p) { return p.category === "ide"; });

      renderProjects(ferdige, "ferdig-container");
      renderProjects(pabegynte, "pabegynt-container");
      renderProjects(ideer, "ide-container");
    })
    .catch(function (err) {
      console.error("Failed to load projects:", err);
      var errorBox = document.getElementById("error-box");
      if (errorBox) {
        errorBox.hidden = false;
      }
    });
});
