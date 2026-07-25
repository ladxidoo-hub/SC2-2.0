import "./styles/base.css";
import "./styles/home.css";
import "./styles/rules.css";
import "./styles/roles.css";
import "./styles/guides.css";
import "./styles/admin.css";
import "./styles/events.css";
import "./styles/kills.css";

import { renderHome, initHome } from "./views/home.js";
import { renderRules, initRules } from "./views/rules.js";
import { renderRoles, initRoles } from "./views/roles.js";
import { renderGuides, initGuides } from "./views/guides.js";
import { renderAdmin, initAdmin } from "./views/admin.js";
import { renderEvents, initEvents } from "./views/events.js";
import { renderKills, initKills } from "./views/kills.js";

const routes = {
  inicio: {
    label: "Inicio",
    title: "[SC2] Heart Of The Swarm",
    render: renderHome,
    init: initHome
  },
  eventos: {
    label: "Eventos",
    title: "Gestor de Eventos",
    render: renderEvents,
    init: initEvents
  },
  kills: {
    label: "Kills",
    title: "Kill del Mes",
    render: renderKills,
    init: initKills
  },
  reglamento: {
    label: "Reglamento",
    title: "Reglamento Oficial",
    render: renderRules,
    init: initRules
  },
  roles: {
    label: "Roles",
    title: "Biblioteca de Roles",
    render: renderRoles,
    init: initRoles
  },
  guias: {
    label: "Guias",
    title: "Guias del Enjambre",
    render: renderGuides,
    init: initGuides
  },
  admin: {
    label: "Admin",
    title: "Corp Command",
    render: renderAdmin,
    init: initAdmin
  }
};

const app = document.querySelector("#app");
let cleanupCurrentView = null;
let cleanupShellEvents = null;

function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [routeCandidate, anchor] = raw.split("/");
  const route = routes[routeCandidate] ? routeCandidate : "inicio";
  return { route, anchor };
}

function setHash(route, anchor = "") {
  const suffix = anchor ? `/${anchor}` : "";
  window.location.hash = `/${route}${suffix}`;
}

function renderApp() {
  cleanupShellEvents?.();
  cleanupCurrentView?.();

  const { route, anchor } = parseHash();
  const currentRoute = routes[route];
  document.body.dataset.route = route;
  document.title = `${currentRoute.title} | SC2 Command Center`;

  app.innerHTML = `
    <header class="app-header" data-app-header>
      <nav class="top-nav" aria-label="Navegacion principal">
        <a class="app-brand" href="#/inicio" aria-label="Volver al inicio">
          <span class="app-brand-mark">SC2</span>
          <span class="app-brand-copy">
            <strong>Heart Of The Swarm</strong>
            <span>Command Center</span>
          </span>
        </a>

        <button
          class="mobile-menu-button"
          type="button"
          aria-label="Abrir menu"
          aria-expanded="false"
          aria-controls="primary-navigation"
          data-mobile-menu
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="top-nav-panel" id="primary-navigation" data-nav-panel>
          ${Object.entries(routes).map(([id, item]) => `
            <a class="top-nav-link ${id === route ? "is-active" : ""}" href="#/${id}">
              ${item.label}
            </a>
          `).join("")}
        </div>
      </nav>
    </header>

    <main id="app-main" class="app-main route-${route}" tabindex="-1">
      ${currentRoute.render()}
    </main>
  `;

  bindShellEvents();
  cleanupCurrentView = currentRoute.init?.({
    app,
    main: app.querySelector("#app-main"),
    navigate: setHash,
    anchor
  }) || null;

  if (anchor) {
    requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    window.scrollTo({ top: 0, behavior: "auto" });
  }
}

function bindShellEvents() {
  const controller = new AbortController();
  const { signal } = controller;
  const header = app.querySelector("[data-app-header]");
  const menuButton = app.querySelector("[data-mobile-menu]");
  const navPanel = app.querySelector("[data-nav-panel]");

  const setHeaderState = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  }, { signal });

  navPanel.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeMenu();
    }
  }, { signal });

  window.addEventListener("scroll", setHeaderState, { passive: true, signal });
  setHeaderState();
  cleanupShellEvents = () => controller.abort();
}

window.addEventListener("hashchange", renderApp);

if (!window.location.hash) {
  setHash("inicio");
} else {
  renderApp();
}
