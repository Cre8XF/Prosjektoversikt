document.addEventListener("DOMContentLoaded", () => {
  fetch("data/projects.json")
    .then((res) => res.json())
    .then((projects) => {
      const ferdige = projects.filter(p => p.category === "ferdig");
      const pabegynte = projects.filter(p => p.category === "påbegynt");
      const ideer = projects.filter(p => p.category === "ide");

      renderProjects(ferdige, "ferdig-container");
      renderProjects(pabegynte, "pabegynt-container");
      renderProjects(ideer, "ide-container");
    });

  function renderProjects(list, containerId) {
    const container = document.getElementById(containerId);
    list.forEach((p) => {
      const div = document.createElement("div");
      div.className = "project";
      div.innerHTML = `
        <h2>${p.title}</h2>
        <div class="details">
          <p>${p.description}</p>
          <p><strong>Status:</strong> ${p.status}</p>
          <p><strong>Gjenstår:</strong> ${p.todo}</p>
          <p><strong>Teknologi:</strong> ${p.tech}</p>
          <div class="meta">
            ${p.links.github ? `<a href="${p.links.github}" target="_blank">🔗 GitHub</a><br>` : ""}
            ${p.links.demo ? `<a href="${p.links.demo}" target="_blank">🌐 Demo</a><br>` : ""}
            ${p.links.roadmap ? `<a href="${p.links.roadmap}" target="_blank">📝 Roadmap</a><br>` : ""}
            📅 Sist oppdatert: ${p.lastUpdated}
          </div>
        </div>
      `;
      div.addEventListener("click", () => {
        div.classList.toggle("open");
      });
      container.appendChild(div);
    });
  }
});
