import { isSupabaseConfigured, loadKillsState, saveKillsState } from "../services/supabaseStore.js";

const STORAGE_KEY = "sc2.monthlyKills.v1";
const ADMIN_AUTH_KEY = "sc2.admin.unlocked";
const MAX_IMAGE_MB = 8;
const IMAGE_MAX_SIZE = 1280;
const IMAGE_QUALITY = 0.74;

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre"
];

const SECTIONS = {
  home: "Kill del Mes",
  dashboard: "Dashboard",
  ranking: "Ranking",
  history: "Historial",
  search: "Busqueda",
  players: "Jugadores",
  admin: "Administracion"
};

const OCR_FIELDS = [
  "killer",
  "victim",
  "corporation",
  "victimCorporation",
  "ship",
  "isk",
  "participants",
  "date",
  "time"
];

const SHIPS = [
  "Raven modelo Navy Acorazado",
  "Raven modelo Navy",
  "Raven Navy Issue",
  "Machariel",
  "Nightmare",
  "Rattlesnake",
  "Vindicator",
  "Bhaalgorn",
  "Cynabal",
  "Gila",
  "Orthrus",
  "Barghest",
  "Apocalypse",
  "Raven",
  "Megathron",
  "Dominix",
  "Tempest",
  "Maelstrom",
  "Hurricane",
  "Drake",
  "Prophecy",
  "Ferox",
  "Retriever",
  "Covetor",
  "Orca",
  "Caracal",
  "Stabber",
  "Vexor",
  "Maller",
  "Cruor",
  "Daredevil",
  "Succubus",
  "Dramiel",
  "Atron",
  "Condor",
  "Tristan",
  "Slasher"
];

export function renderKills() {
  return `
    <section class="kills-page" aria-label="Modulo Kill del Mes">
      <header class="kills-command">
        <div class="kills-command-copy">
          <span class="kills-kicker">Modulo PVP</span>
          <h1>Kill del Mes</h1>
          <p>Registro de reportes, OCR, ranking mensual, historial, busqueda y perfiles de jugadores.</p>
        </div>

        <div class="kills-command-actions">
          <span class="kills-sync-status" data-kills-sync-status>Conectando BD</span>
          <a class="kills-btn" href="#/admin" data-kills-admin-link>Desbloquear Admin</a>
          <button class="kills-btn kills-btn-primary" type="button" data-kills-action="open-upload">Subir Kill</button>
        </div>
      </header>

      <nav class="kills-section-nav" aria-label="Navegacion Kill del Mes">
        ${Object.entries(SECTIONS).map(([id, label]) => `
          <a class="kills-section-link" href="#/kills/${id}" data-kills-section-link="${id}">${label}</a>
        `).join("")}
      </nav>

      <section class="kills-stat-rail" id="killsStatsRail" aria-label="Metricas de kills"></section>
      <section class="kills-view" id="killsViewMount" aria-live="polite"></section>

      <dialog class="kills-modal" id="killsModal" aria-labelledby="killsModalTitle">
        <div class="kills-modal-shell" role="document">
          <header class="kills-modal-header">
            <div>
              <span class="kills-modal-kicker" id="killsModalKicker">Operacion</span>
              <h3 id="killsModalTitle">Modal</h3>
            </div>
            <button class="kills-modal-close" type="button" data-kills-modal-close aria-label="Cerrar">x</button>
          </header>
          <div class="kills-modal-body" id="killsModalBody"></div>
          <footer class="kills-modal-footer" id="killsModalFooter"></footer>
        </div>
      </dialog>

      <input class="sr-only" id="killsImportInput" type="file" accept=".json,application/json">
      <div class="kills-toast-stack" id="killsToastStack" aria-live="polite" aria-atomic="true"></div>
    </section>
  `;
}

export function initKills({ main, anchor }) {
  const controller = new AbortController();
  const { signal } = controller;
  let activeModalCleanup = null;

  const now = new Date();
  const state = {
    kills: [],
    section: SECTIONS[anchor] ? anchor : "home",
    selectedYear: now.getUTCFullYear(),
    selectedMonth: now.getUTCMonth() + 1,
    searchFilters: {
      q: "",
      corporation: "",
      ship: "",
      minIsk: "",
      month: "",
      year: ""
    },
    playerSearchTerm: "",
    selectedPlayerName: "",
    isAdmin: isAdminUnlocked(),
    syncStatus: isSupabaseConfigured() ? "connecting" : "local",
    syncMessage: isSupabaseConfigured() ? "Conectando BD" : "LocalStorage"
  };

  const els = {
    syncStatus: main.querySelector("[data-kills-sync-status]"),
    adminLink: main.querySelector("[data-kills-admin-link]"),
    adminControls: Array.from(main.querySelectorAll("[data-kills-admin-control]")),
    sectionLinks: Array.from(main.querySelectorAll("[data-kills-section-link]")),
    statsRail: main.querySelector("#killsStatsRail"),
    viewMount: main.querySelector("#killsViewMount"),
    modal: main.querySelector("#killsModal"),
    modalKicker: main.querySelector("#killsModalKicker"),
    modalTitle: main.querySelector("#killsModalTitle"),
    modalBody: main.querySelector("#killsModalBody"),
    modalFooter: main.querySelector("#killsModalFooter"),
    importInput: main.querySelector("#killsImportInput"),
    toastStack: main.querySelector("#killsToastStack")
  };

  bindEvents();
  render();
  void loadData();

  if (anchor === "admin" && !state.isAdmin) {
    showToast("Desbloquea Admin para gestionar kills.");
  }

  return () => {
    activeModalCleanup?.();
    controller.abort();
    document.body.classList.remove("viewer-lock");
    if (els.modal.open) {
      els.modal.close();
    }
  };

  function bindEvents() {
    main.addEventListener("click", handlePageClick, { signal });
    els.viewMount.addEventListener("input", handleViewInput, { signal });
    els.viewMount.addEventListener("change", handleViewChange, { signal });
    els.importInput.addEventListener("change", handleImportFile, { signal });

    els.modal.addEventListener("click", (event) => {
      if (event.target === els.modal || event.target.closest("[data-kills-modal-close]")) {
        closeModal();
      }
    }, { signal });

    els.modal.addEventListener("close", () => {
      els.modal.classList.remove("is-visible");
      document.body.classList.remove("viewer-lock");
      activeModalCleanup?.();
      activeModalCleanup = null;
    }, { signal });
  }

  function handlePageClick(event) {
    const historyButton = event.target.closest("button[data-kills-history]");
    if (historyButton?.dataset.killsHistory === "month") {
      state.selectedMonth = Number(historyButton.value);
      renderHistory();
      return;
    }

    const actionTarget = event.target.closest("[data-kills-action]");
    if (!actionTarget) {
      return;
    }

    const action = actionTarget.dataset.killsAction;
    const killId = actionTarget.dataset.killId;
    const playerName = actionTarget.dataset.playerName;

    if (requiresAdmin(action) && !ensureCanManage()) {
      return;
    }

    switch (action) {
      case "open-upload":
        openKillModal("create");
        break;
      case "edit-kill":
        openKillModal("edit", killId);
        break;
      case "delete-kill":
        openDeleteKillModal(killId);
        break;
      case "show-player":
        state.section = "players";
        state.selectedPlayerName = playerName || "";
        window.location.hash = "/kills/players";
        render();
        break;
      case "clear-player":
        state.selectedPlayerName = "";
        renderPlayers();
        break;
      case "export-kills":
        exportBackup();
        break;
      case "import-kills":
        els.importInput.click();
        break;
      default:
        break;
    }
  }

  function handleViewInput(event) {
    const filter = event.target.dataset.killsFilter;
    if (filter) {
      state.searchFilters[filter] = event.target.value.trim();
      renderSearch();
      return;
    }

    if (event.target.matches("[data-kills-player-search]")) {
      state.playerSearchTerm = event.target.value.trim();
      renderPlayers();
    }
  }

  function handleViewChange(event) {
    const field = event.target.dataset.killsHistory;
    if (!field) {
      return;
    }

    if (field === "year") {
      state.selectedYear = Number(event.target.value);
    }

    if (field === "month") {
      state.selectedMonth = Number(event.target.value);
    }

    renderHistory();
  }

  function requiresAdmin(action) {
    return [
      "edit-kill",
      "delete-kill",
      "export-kills",
      "import-kills"
    ].includes(action);
  }

  function ensureCanManage() {
    state.isAdmin = isAdminUnlocked();

    if (state.isAdmin) {
      return true;
    }

    updateAdminControls();
    showToast("Desbloquea Admin para gestionar kills.");
    return false;
  }

  async function loadData() {
    let localPayload = null;

    try {
      localPayload = readLocalPayload();
      if (localPayload) {
        applyPayload(localPayload);
        render();
      }
    } catch (error) {
      console.error(error);
      showToast("No se pudo leer el respaldo local de kills.");
    }

    if (!isSupabaseConfigured()) {
      setSyncStatus("local", "LocalStorage");
      return;
    }

    setSyncStatus("connecting", "Conectando BD");

    try {
      const remotePayload = await loadKillsState();
      if (remotePayload) {
        applyPayload(remotePayload);
        persistLocalPayload(buildBackupPayload());
        setSyncStatus("online", "Online / Supabase");
        render();
        return;
      }

      if (state.kills.length) {
        await saveKillsState(buildBackupPayload());
      }

      setSyncStatus("online", "Online / Supabase");
      render();
    } catch (error) {
      console.error(error);
      setSyncStatus("local", "LocalStorage / sin BD");
      showToast("Supabase no esta listo. Usando respaldo local.");
    }
  }

  function persistData(showSavedToast = true) {
    const payload = buildBackupPayload();

    try {
      persistLocalPayload(payload);
      if (showSavedToast && !isSupabaseConfigured()) {
        showToast("Kills guardadas localmente.");
      }
    } catch (error) {
      console.error(error);
      showToast("El navegador no permitio guardar las kills.");
    }

    if (!isSupabaseConfigured()) {
      setSyncStatus("local", "LocalStorage");
      return;
    }

    setSyncStatus("syncing", "Sincronizando");
    saveKillsState(payload)
      .then(() => {
        setSyncStatus("online", "Online / Supabase");
        if (showSavedToast) {
          showToast("Kills sincronizadas en Supabase.");
        }
      })
      .catch((error) => {
        console.error(error);
        setSyncStatus("local", "LocalStorage / sin BD");
        if (showSavedToast) {
          showToast("Guardado local. Supabase no respondio.");
        }
      });
  }

  function applyPayload(payload) {
    state.kills = normalizeKills(payload?.kills);
  }

  function buildBackupPayload() {
    return {
      app: "SC2 Kill del Mes",
      version: 1,
      exportedAt: new Date().toISOString(),
      kills: state.kills
    };
  }

  function readLocalPayload() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function persistLocalPayload(payload) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function setSyncStatus(status, message) {
    state.syncStatus = status;
    state.syncMessage = message;
    updateSyncStatus();
  }

  function updateSyncStatus() {
    if (!els.syncStatus) {
      return;
    }

    els.syncStatus.textContent = state.syncMessage;
    els.syncStatus.classList.toggle("is-online", state.syncStatus === "online");
    els.syncStatus.classList.toggle("is-syncing", state.syncStatus === "syncing" || state.syncStatus === "connecting");
    els.syncStatus.classList.toggle("is-local", state.syncStatus === "local");
  }

  function render() {
    state.isAdmin = isAdminUnlocked();
    if (state.section === "admin" && !state.isAdmin) {
      state.section = "home";
    }

    updateSyncStatus();
    updateAdminControls();
    renderSectionNav();
    renderStatsRail();

    if (state.section === "dashboard") {
      renderDashboard();
      return;
    }

    if (state.section === "ranking") {
      renderRanking();
      return;
    }

    if (state.section === "history") {
      renderHistory();
      return;
    }

    if (state.section === "search") {
      renderSearch();
      return;
    }

    if (state.section === "players") {
      renderPlayers();
      return;
    }

    if (state.section === "admin") {
      renderAdminKills();
      return;
    }

    renderHome();
  }

  function updateAdminControls() {
    els.adminControls.forEach((control) => {
      control.hidden = !state.isAdmin;
    });

    if (els.adminLink) {
      els.adminLink.hidden = state.isAdmin;
    }

    const adminNav = main.querySelector('[data-kills-section-link="admin"]');
    if (adminNav) {
      adminNav.hidden = !state.isAdmin;
    }
  }

  function renderSectionNav() {
    els.sectionLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.killsSectionLink === state.section);
    });
  }

  function renderStatsRail() {
    const stats = getStats();
    const killOfMonth = stats.topMonthly[0] || stats.topHistorical[0];
    const cards = [
      ["Kill del Mes", killOfMonth ? formatIsk(killOfMonth.isk) : "N/A", killOfMonth ? killOfMonth.killer : "Sin registros"],
      ["Kills", stats.totalKills, "Reportes registrados"],
      ["ISK destruido", formatIsk(stats.totalIsk), `Promedio ${formatIsk(stats.averageIsk)}`],
      ["Jugador top", stats.playerMostIsk?.name || "N/A", stats.playerMostIsk ? formatIsk(stats.playerMostIsk.totalIsk) : "Sin datos"]
    ];

    els.statsRail.innerHTML = cards.map(([label, value, detail]) => `
      <article class="kills-stat-card">
        <span class="kills-stat-label">${escapeHtml(label)}</span>
        <strong class="kills-stat-value">${escapeHtml(value)}</strong>
        <p>${escapeHtml(detail)}</p>
      </article>
    `).join("");
  }

  function renderHome() {
    const stats = getStats();
    const killOfMonth = stats.topMonthly[0] || stats.topHistorical[0];
    const recentKills = getSortedKills().slice(0, 6);

    els.viewMount.innerHTML = `
      <section class="kills-hero-grid">
        <article class="kills-hero-card is-highlight">
          ${killOfMonth?.image ? `<img src="${escapeAttr(killOfMonth.image)}" alt="Kill report destacado" loading="lazy">` : ""}
          <div class="kills-hero-overlay"></div>
          <div class="kills-hero-content">
            <span class="kills-kicker">Kill del Mes</span>
            <h2>${escapeHtml(killOfMonth?.ship || "Sin kill registrada")}</h2>
            <p>${killOfMonth ? `${escapeHtml(killOfMonth.killer)} destruyo a ${escapeHtml(killOfMonth.victim)}.` : "Sube el primer Kill Report para activar el ranking mensual."}</p>
            <div class="kills-hero-stats">
              ${renderHeroStat("Atacante", killOfMonth?.killer || "--")}
              ${renderHeroStat("Victima", killOfMonth?.victim || "--")}
              ${renderHeroStat("Valor", killOfMonth ? formatIsk(killOfMonth.isk) : "--", true)}
              ${renderHeroStat("Fecha", killOfMonth ? formatShortDate(killOfMonth.date) : "--")}
            </div>
          </div>
        </article>

        <aside class="kills-side-stack">
          <button class="kills-upload-banner" type="button" data-kills-action="open-upload">Subir Kill</button>
          ${renderRankingPanel("Top mensual", stats.topMonthly.slice(0, 10), true)}
        </aside>
      </section>

      <section class="kills-dashboard-grid">
        ${renderMetricCard("Mayor kill historica", stats.biggestAllTime ? formatIsk(stats.biggestAllTime.isk) : "N/A", stats.biggestAllTime?.ship || "Sin datos")}
        ${renderMetricCard("Jugador con mas kills", stats.playerMostKills?.name || "N/A", stats.playerMostKills ? `${stats.playerMostKills.kills} kills` : "Sin datos")}
        ${renderMetricCard("Corporacion con mayor dano", stats.corporationMostDamage?.corporation || "N/A", stats.corporationMostDamage ? formatIsk(stats.corporationMostDamage.totalIsk) : "Sin datos")}
      </section>

      <section class="kills-split-grid">
        ${renderRankingPanel("Top historico", stats.topHistorical.slice(0, 10))}
        <article class="kills-panel">
          <div class="kills-panel-header">
            <div>
              <span class="kills-kicker">Actividad reciente</span>
              <h3>Ultimos reportes</h3>
            </div>
            <a class="kills-btn kills-btn-small" href="#/kills/search">Buscar</a>
          </div>
          <div class="kills-list">
            ${recentKills.length ? recentKills.map(renderKillRow).join("") : renderEmptyState("Sin kills registradas", "Cuando se suban reportes apareceran aqui.")}
          </div>
        </article>
      </section>
    `;
  }

  function renderDashboard() {
    const stats = getStats();

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Dashboard", "Estadisticas globales, dano por jugador, corporacion y tendencia mensual.")}
      <section class="kills-dashboard-grid">
        ${renderMetricCard("Mayor kill", stats.biggestAllTime ? formatIsk(stats.biggestAllTime.isk) : "N/A", stats.biggestAllTime?.ship || "Sin datos")}
        ${renderMetricCard("Kills registradas", stats.totalKills, `Promedio ${formatIsk(stats.averageIsk)}`)}
        ${renderMetricCard("Jugador con mayor ISK", stats.playerMostIsk?.name || "N/A", stats.playerMostIsk ? formatIsk(stats.playerMostIsk.totalIsk) : "Sin datos")}
        ${renderMetricCard("Corporacion top", stats.corporationMostDamage?.corporation || "N/A", stats.corporationMostDamage ? formatIsk(stats.corporationMostDamage.totalIsk) : "Sin datos")}
      </section>
      <section class="kills-chart-grid">
        ${renderChartPanel("Por mes", stats.monthlyChart.map((item) => ({ label: item.label, value: item.totalIsk })))}
        ${renderChartPanel("Por jugador", stats.playerChart.map((item) => ({ label: item.name, value: item.totalIsk })))}
        ${renderChartPanel("Por corporacion", stats.corporationChart.map((item) => ({ label: item.corporation, value: item.totalIsk })))}
      </section>
    `;
  }

  function renderRanking() {
    const nowDate = new Date();
    const ranking = getMonthlyRanking(nowDate.getUTCFullYear(), nowDate.getUTCMonth() + 1, 50);

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Ranking mensual", "Ranking del mes actual ordenado por valor ISK destruido.")}
      ${renderRankingPanel("Top mensual", ranking)}
    `;
  }

  function renderHistory() {
    const years = getAvailableYears();
    const ranking = getMonthlyRanking(state.selectedYear, state.selectedMonth, 50);
    const winner = ranking[0];

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Historial", "Ganadores guardados por mes y ano.")}
      <section class="kills-history-grid">
        <aside class="kills-panel kills-filter-panel">
          <label class="kills-field">
            <span>Ano</span>
            <select data-kills-history="year">
              ${years.map((year) => `<option value="${year}" ${year === state.selectedYear ? "selected" : ""}>${year}</option>`).join("")}
            </select>
          </label>
          <div class="kills-month-grid">
            ${MONTHS_ES.map((label, index) => `
              <button class="kills-month-button ${state.selectedMonth === index + 1 ? "is-active" : ""}" type="button" data-kills-history="month" value="${index + 1}">
                ${escapeHtml(label)}
              </button>
            `).join("")}
          </div>
        </aside>
        <article class="kills-panel">
          <div class="kills-panel-header">
            <div>
              <span class="kills-kicker">Ganador</span>
              <h3>${escapeHtml(MONTHS_ES[state.selectedMonth - 1])} ${state.selectedYear}</h3>
            </div>
          </div>
          ${winner ? renderWinnerSpotlight(winner) : renderEmptyState("Sin ganador registrado", "No hay kills para este mes.")}
        </article>
      </section>
      ${renderRankingPanel("Ranking del mes", ranking)}
    `;
  }

  function renderSearch() {
    const items = getFilteredKills();

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Busqueda", "Filtra por jugador, corporacion, nave, ISK, mes o ano.")}
      <section class="kills-panel kills-search-grid">
        ${renderFilterField("q", "Jugador o texto", state.searchFilters.q)}
        ${renderFilterField("corporation", "Corporacion", state.searchFilters.corporation)}
        ${renderFilterField("ship", "Nave", state.searchFilters.ship)}
        ${renderFilterField("minIsk", "ISK minimo", state.searchFilters.minIsk, "number")}
        ${renderFilterField("month", "Mes", state.searchFilters.month, "number")}
        ${renderFilterField("year", "Ano", state.searchFilters.year, "number")}
      </section>
      <section class="kills-panel">
        <div class="kills-list">
          ${items.length ? items.map(renderKillRow).join("") : renderEmptyState("Sin resultados", "Ajusta los filtros para encontrar reportes.")}
        </div>
      </section>
    `;
  }

  function renderPlayers() {
    const players = getPlayers();
    const term = normalizeText(state.playerSearchTerm);
    const visiblePlayers = players.filter((player) => !term || normalizeText(player.name).includes(term) || normalizeText(player.corporation).includes(term));
    const selected = state.selectedPlayerName
      ? players.find((player) => normalizeText(player.name) === normalizeText(state.selectedPlayerName))
      : null;

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Perfiles de jugadores", "Historial, ISK total, mayor kill y ranking historico por piloto.")}
      <section class="kills-panel">
        <label class="kills-search">
          <span>Buscar</span>
          <input type="search" value="${escapeAttr(state.playerSearchTerm)}" data-kills-player-search placeholder="Nombre o corporacion">
        </label>
      </section>
      ${selected ? renderPlayerProfile(selected) : ""}
      <section class="kills-player-grid">
        ${visiblePlayers.length ? visiblePlayers.map(renderPlayerCard).join("") : renderEmptyState("Sin jugadores", "No hay perfiles que coincidan.")}
      </section>
    `;
  }

  function renderAdminKills() {
    if (!state.isAdmin) {
      renderHome();
      return;
    }

    const stats = getStats();
    const kills = getSortedKills();

    els.viewMount.innerHTML = `
      ${renderSectionHeader("Administracion de Kills", "Gestiona reportes, OCR, respaldos y correcciones desde el panel existente.")}
      <section class="kills-admin-actions">
        <button class="kills-btn kills-btn-primary" type="button" data-kills-action="open-upload">Subir Kill con OCR</button>
        <button class="kills-btn" type="button" data-kills-action="export-kills">Exportar JSON</button>
        <button class="kills-btn" type="button" data-kills-action="import-kills">Importar JSON</button>
      </section>
      <section class="kills-dashboard-grid">
        ${renderMetricCard("Kills administradas", stats.totalKills, "Registros actuales")}
        ${renderMetricCard("ISK total", formatIsk(stats.totalIsk), "Valor acumulado")}
        ${renderMetricCard("Top mensual", stats.topMonthly[0]?.killer || "N/A", stats.topMonthly[0] ? formatIsk(stats.topMonthly[0].isk) : "Sin datos")}
      </section>
      <section class="kills-panel">
        <div class="kills-list">
          ${kills.length ? kills.map(renderKillRow).join("") : renderEmptyState("Sin kills", "Sube el primer reporte desde el boton superior.")}
        </div>
      </section>
    `;
  }

  function renderHeroStat(label, value, highlight = false) {
    return `
      <div class="kills-hero-stat">
        <span>${escapeHtml(label)}</span>
        <strong class="${highlight ? "is-highlight" : ""}">${escapeHtml(value)}</strong>
      </div>
    `;
  }

  function renderMetricCard(label, value, detail) {
    return `
      <article class="kills-metric-card">
        <span class="kills-stat-label">${escapeHtml(label)}</span>
        <strong class="kills-metric-value">${escapeHtml(value)}</strong>
        <p>${escapeHtml(detail)}</p>
      </article>
    `;
  }

  function renderRankingPanel(title, ranking, compact = false) {
    return `
      <article class="kills-panel">
        <div class="kills-panel-header">
          <div>
            <span class="kills-kicker">Ranking</span>
            <h3>${escapeHtml(title)}</h3>
          </div>
        </div>
        <div class="kills-rank-list ${compact ? "is-compact" : ""}">
          ${ranking.length ? ranking.map((kill, index) => renderRankRow(kill, index, compact)).join("") : renderEmptyState("Sin kills registradas", "El ranking se activara cuando existan reportes.")}
        </div>
      </article>
    `;
  }

  function renderRankRow(kill, index, compact) {
    return `
      <article class="kills-rank-row">
        <span class="kills-medal">${index + 1}</span>
        <div>
          <button class="kills-text-button" type="button" data-kills-action="show-player" data-player-name="${escapeAttr(kill.killer)}">${escapeHtml(kill.killer)}</button>
          <p>${escapeHtml(kill.ship)} / ${escapeHtml(kill.victim)} / ${escapeHtml(formatShortDate(kill.date))}</p>
        </div>
        <strong>${escapeHtml(formatIsk(kill.isk))}</strong>
        ${compact ? "" : `<span class="kills-rank-label">${escapeHtml(medalForIndex(index))}</span>`}
      </article>
    `;
  }

  function renderKillRow(kill) {
    return `
      <article class="kills-kill-row">
        ${kill.image ? `<img src="${escapeAttr(kill.image)}" alt="Kill report de ${escapeAttr(kill.killer)}" loading="lazy">` : `<span class="kills-image-placeholder">SC2</span>`}
        <div class="kills-kill-main">
          <button class="kills-text-button" type="button" data-kills-action="show-player" data-player-name="${escapeAttr(kill.killer)}">${escapeHtml(kill.killer)}</button>
          <p>${escapeHtml(kill.ship)} contra ${escapeHtml(kill.victim)}</p>
          <span>${escapeHtml(kill.corporation || "Sin corporacion")} / ${escapeHtml(formatShortDate(kill.date))}</span>
        </div>
        <strong class="kills-kill-value">${escapeHtml(formatIsk(kill.isk))}</strong>
        ${state.isAdmin ? `
          <div class="kills-row-actions">
            <button class="kills-btn kills-btn-small" type="button" data-kills-action="edit-kill" data-kill-id="${escapeAttr(kill.id)}">Editar</button>
            <button class="kills-btn kills-btn-danger kills-btn-small" type="button" data-kills-action="delete-kill" data-kill-id="${escapeAttr(kill.id)}">Eliminar</button>
          </div>
        ` : ""}
      </article>
    `;
  }

  function renderChartPanel(title, data) {
    const max = Math.max(1, ...data.map((item) => item.value));

    return `
      <article class="kills-panel">
        <div class="kills-panel-header">
          <div>
            <span class="kills-kicker">Grafica</span>
            <h3>${escapeHtml(title)}</h3>
          </div>
        </div>
        <div class="kills-chart-list">
          ${data.length ? data.map((item) => `
            <div class="kills-chart-row">
              <div>
                <span>${escapeHtml(item.label)}</span>
                <strong>${escapeHtml(formatIsk(item.value))}</strong>
              </div>
              <span class="kills-chart-track"><span style="width: ${Math.max(5, (item.value / max) * 100)}%"></span></span>
            </div>
          `).join("") : renderEmptyState("Sin datos", "Aun no hay informacion para graficar.")}
        </div>
      </article>
    `;
  }

  function renderWinnerSpotlight(kill) {
    return `
      <div class="kills-winner">
        ${kill.image ? `<img src="${escapeAttr(kill.image)}" alt="Kill report de ${escapeAttr(kill.killer)}" loading="lazy">` : ""}
        <div>
          <h4>${escapeHtml(kill.killer)}</h4>
          <strong>${escapeHtml(formatIsk(kill.isk))}</strong>
          <div class="kills-hero-stats">
            ${renderHeroStat("Nave", kill.ship)}
            ${renderHeroStat("Victima", kill.victim)}
            ${renderHeroStat("Corporacion", kill.corporation || "--")}
            ${renderHeroStat("Fecha", formatShortDate(kill.date))}
          </div>
        </div>
      </div>
    `;
  }

  function renderFilterField(key, label, value, type = "text") {
    return `
      <label class="kills-field">
        <span>${escapeHtml(label)}</span>
        <input type="${escapeAttr(type)}" value="${escapeAttr(value)}" data-kills-filter="${escapeAttr(key)}">
      </label>
    `;
  }

  function renderPlayerCard(player) {
    return `
      <article class="kills-player-card">
        <span class="kills-kicker">#${player.historicalRank}</span>
        <h3>${escapeHtml(player.name)}</h3>
        <p>${escapeHtml(player.corporation || "Sin corporacion")}</p>
        <div class="kills-player-stats">
          ${renderHeroStat("Kills", String(player.kills))}
          ${renderHeroStat("ISK", formatIsk(player.totalIsk), true)}
        </div>
        <button class="kills-btn kills-btn-small" type="button" data-kills-action="show-player" data-player-name="${escapeAttr(player.name)}">Ver perfil</button>
      </article>
    `;
  }

  function renderPlayerProfile(player) {
    const kills = state.kills
      .filter((kill) => normalizeText(kill.killer) === normalizeText(player.name))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return `
      <section class="kills-panel kills-player-profile">
        <div class="kills-panel-header">
          <div>
            <span class="kills-kicker">Perfil</span>
            <h3>${escapeHtml(player.name)}</h3>
            <p>${escapeHtml(player.corporation || "Sin corporacion")} / ranking historico #${player.historicalRank}</p>
          </div>
          <button class="kills-btn kills-btn-small" type="button" data-kills-action="clear-player">Cerrar perfil</button>
        </div>
        <div class="kills-dashboard-grid">
          ${renderMetricCard("Kills", player.kills, "Reportes registrados")}
          ${renderMetricCard("ISK total", formatIsk(player.totalIsk), "Valor acumulado")}
          ${renderMetricCard("Mayor kill", player.biggestKill ? formatIsk(player.biggestKill.isk) : "N/A", player.biggestKill?.ship || "Sin datos")}
        </div>
        <div class="kills-list">
          ${kills.map(renderKillRow).join("") || renderEmptyState("Sin historial", "Este jugador no tiene kills registradas.")}
        </div>
      </section>
    `;
  }

  function renderSectionHeader(title, subtitle) {
    return `
      <header class="kills-section-header">
        <span class="kills-kicker">Kill del Mes</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(subtitle)}</p>
      </header>
    `;
  }

  function renderEmptyState(title, copy) {
    return `
      <div class="kills-empty-state">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(copy)}</span>
      </div>
    `;
  }

  function openKillModal(mode, killId) {
    const editing = mode === "edit";
    if (editing && !ensureCanManage()) {
      return;
    }

    const existing = editing ? findKill(killId) : null;
    if (editing && !existing) {
      showToast("No se encontro la kill.");
      return;
    }

    let draft = existing ? killToForm(existing) : blankKillForm();
    let detection = null;
    let rawText = existing?.rawText || "";
    let busyMessage = "";
    const modalController = new AbortController();

    const renderForm = () => {
      openModal({
        kicker: editing ? "Editar kill" : "Subir Kill",
        title: editing ? existing.ship : "OCR inteligente",
        body: renderKillForm(draft, detection, rawText, busyMessage),
        footer: `
          <button class="kills-btn" type="button" data-kills-modal-close>Cancelar</button>
          <button class="kills-btn kills-btn-primary" type="submit" form="killsKillForm">${editing ? "Guardar cambios" : "Guardar kill"}</button>
        `
      });
    };

    renderForm();
    activeModalCleanup = () => modalController.abort();

    els.modalBody.addEventListener("input", (event) => {
      const field = event.target.dataset.killField;
      if (!field) {
        return;
      }

      draft[field] = event.target.value;
    }, { signal: modalController.signal });

    els.modalBody.addEventListener("change", async (event) => {
      if (!event.target.matches("#killsImageInput")) {
        return;
      }

      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      busyMessage = "Procesando imagen y OCR...";
      renderForm();

      try {
        const image = await compressImageFile(file);
        draft.image = image;
        const ocr = await analyzeKillImage(file);
        detection = ocr;
        rawText = ocr.rawText;
        draft = {
          ...draft,
          ...fillDraftFromDetection(draft, ocr)
        };
        busyMessage = "";
        renderForm();
        showToast(ocr.needsReview ? "OCR listo. Revisa los campos marcados." : "OCR completado con confianza alta.");
      } catch (error) {
        console.error(error);
        busyMessage = "";
        renderForm();
        showToast(error instanceof Error ? error.message : "No se pudo procesar la imagen.");
      }
    }, { signal: modalController.signal });

    els.modalBody.addEventListener("submit", (event) => {
      event.preventDefault();
      if (editing && !ensureCanManage()) {
        closeModal();
        return;
      }

      const result = readKillForm(draft);
      const error = els.modalBody.querySelector("#killsFormError");

      if (!result.ok) {
        error.textContent = result.message;
        return;
      }

      if (editing) {
        Object.assign(existing, result.value, {
          rawText,
          updatedAt: new Date().toISOString()
        });
      } else {
        state.kills.unshift({
          ...result.value,
          id: createUid("kill"),
          rawText,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      persistData();
      closeModal();
      render();
    }, { signal: modalController.signal });
  }

  function renderKillForm(draft, detection, rawText, busyMessage) {
    return `
      <form class="kills-form" id="killsKillForm" novalidate>
        <section class="kills-upload-grid">
          <div class="kills-upload-panel">
            <label class="kills-upload-drop" for="killsImageInput">
              <span>${busyMessage || "Seleccionar Kill Report"}</span>
              <input id="killsImageInput" type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            ${draft.image ? `<img class="kills-preview-image" src="${escapeAttr(draft.image)}" alt="Vista previa del Kill Report">` : ""}
            ${rawText ? `
              <details class="kills-ocr-raw">
                <summary>Texto OCR bruto</summary>
                <pre>${escapeHtml(rawText)}</pre>
              </details>
            ` : ""}
          </div>

          <div class="kills-form-fields">
            ${renderKillField("killer", "Atacante principal", draft.killer, detection)}
            ${renderKillField("victim", "Jugador destruido", draft.victim, detection)}
            ${renderKillField("corporation", "Corporacion atacante", draft.corporation, detection)}
            ${renderKillField("victimCorporation", "Corporacion victima", draft.victimCorporation, detection)}
            ${renderKillField("ship", "Nave destruida", draft.ship, detection)}
            ${renderKillField("isk", "Valor ISK", draft.isk, detection, "number")}
            ${renderKillField("participants", "Participantes", draft.participants, detection, "number")}
            ${renderKillField("date", "Fecha", draft.date, detection, "date")}
            ${renderKillField("time", "Hora", draft.time, detection, "time")}
          </div>
        </section>

        ${detection?.warnings?.length ? `
          <div class="kills-warning">
            ${detection.warnings.map((warning) => `<p>${escapeHtml(warning)}</p>`).join("")}
          </div>
        ` : ""}
        <p class="kills-form-error" id="killsFormError" aria-live="polite"></p>
      </form>
    `;
  }

  function renderKillField(key, label, value, detection, type = "text") {
    const confidence = detection?.confidence?.[key] || 0;
    const confidenceClassName = detection ? getConfidenceClass(confidence) : "";

    return `
      <label class="kills-field ${confidenceClassName}">
        <span>${escapeHtml(label)}</span>
        <input data-kill-field="${escapeAttr(key)}" type="${escapeAttr(type)}" value="${escapeAttr(value)}">
      </label>
    `;
  }

  function readKillForm(draft) {
    const killer = String(draft.killer || "").trim();
    const victim = String(draft.victim || "").trim();
    const corporation = String(draft.corporation || "").trim();
    const victimCorporation = String(draft.victimCorporation || "").trim();
    const ship = String(draft.ship || "").trim();
    const isk = parseIskNumber(draft.isk);
    const participants = Math.max(1, Number(draft.participants || 1));
    const date = parseLocalDateTimeToUtc(`${draft.date}T${draft.time || "00:00"}`);

    if (!killer || !victim || !ship) {
      return { ok: false, message: "Atacante, victima y nave son obligatorios." };
    }

    if (!isk) {
      return { ok: false, message: "El valor ISK debe ser mayor a cero." };
    }

    if (!date) {
      return { ok: false, message: "La fecha de la kill no es valida." };
    }

    if (!draft.image) {
      return { ok: false, message: "Agrega una imagen del Kill Report." };
    }

    return {
      ok: true,
      value: {
        killer,
        victim,
        corporation,
        victimCorporation,
        ship,
        isk,
        participants,
        date,
        image: draft.image,
        month: new Date(date).getUTCMonth() + 1,
        year: new Date(date).getUTCFullYear()
      }
    };
  }

  function openDeleteKillModal(killId) {
    if (!ensureCanManage()) {
      return;
    }

    const kill = findKill(killId);
    if (!kill) {
      showToast("No se encontro la kill.");
      return;
    }

    openConfirmModal({
      kicker: "Eliminar kill",
      title: kill.ship,
      message: "Se eliminara el reporte del ranking, historial y perfiles.",
      confirmLabel: "Eliminar",
      confirmClass: "kills-btn-danger",
      onConfirm: () => {
        if (!ensureCanManage()) {
          return;
        }

        state.kills = state.kills.filter((item) => item.id !== kill.id);
        persistData();
        render();
      }
    });
  }

  function openConfirmModal({ kicker, title, message, confirmLabel, confirmClass = "kills-btn-primary", onConfirm }) {
    openModal({
      kicker,
      title,
      body: `<p class="kills-modal-copy">${escapeHtml(message)}</p>`,
      footer: `
        <button class="kills-btn" type="button" data-kills-modal-close>Cancelar</button>
        <button class="kills-btn ${escapeAttr(confirmClass)}" type="button" id="killsConfirmActionButton">${escapeHtml(confirmLabel)}</button>
      `
    });

    const modalController = new AbortController();
    activeModalCleanup = () => modalController.abort();
    main.querySelector("#killsConfirmActionButton").addEventListener("click", () => {
      onConfirm();
      closeModal();
    }, { signal: modalController.signal });
  }

  function openModal({ kicker, title, body, footer }) {
    els.modalKicker.textContent = kicker;
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = body;
    els.modalFooter.innerHTML = footer;
    els.modalBody.scrollTop = 0;
    document.body.classList.add("viewer-lock");

    if (!els.modal.open) {
      els.modal.showModal();
    }

    requestAnimationFrame(() => {
      els.modal.classList.add("is-visible");
      const focusTarget = els.modalBody.querySelector("input, button, select, textarea") || els.modalFooter.querySelector("button");
      focusTarget?.focus();
    });
  }

  function closeModal() {
    activeModalCleanup?.();
    activeModalCleanup = null;
    els.modal.classList.remove("is-visible");
    document.body.classList.remove("viewer-lock");
    window.setTimeout(() => {
      if (els.modal.open) {
        els.modal.close();
      }
    }, 150);
  }

  function exportBackup() {
    const payload = buildBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sc2-kill-del-mes-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !ensureCanManage()) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        state.kills = normalizeKills(payload.kills || payload.items || []);
        persistData();
        render();
        showToast("Kills importadas correctamente.");
      } catch (error) {
        console.error(error);
        showToast("El archivo JSON no es valido.");
      }
    });
    reader.readAsText(file);
  }

  function getStats() {
    const nowDate = new Date();
    const currentYear = nowDate.getUTCFullYear();
    const currentMonth = nowDate.getUTCMonth() + 1;
    const kills = getSortedKills();
    const topMonthly = getMonthlyRanking(currentYear, currentMonth, 10);
    const topHistorical = [...kills].sort(sortByIsk).slice(0, 10);
    const totalIsk = kills.reduce((sum, kill) => sum + kill.isk, 0);
    const players = getPlayers();
    const corporations = getCorporations(kills);
    const monthlyChart = getMonthlyChart(kills);

    return {
      biggestAllTime: topHistorical[0],
      topMonthly,
      topHistorical,
      playerMostKills: [...players].sort((left, right) => right.kills - left.kills)[0],
      playerMostIsk: players[0],
      corporationMostDamage: corporations[0],
      totalIsk,
      totalKills: kills.length,
      averageIsk: kills.length ? Math.round(totalIsk / kills.length) : 0,
      monthlyChart,
      playerChart: players.slice(0, 8),
      corporationChart: corporations.slice(0, 8)
    };
  }

  function getSortedKills() {
    return [...state.kills].sort((a, b) => new Date(b.date) - new Date(a.date) || b.isk - a.isk);
  }

  function getMonthlyRanking(year, month, take = 10) {
    return state.kills
      .filter((kill) => kill.year === year && kill.month === month)
      .sort(sortByIsk)
      .slice(0, take);
  }

  function getFilteredKills() {
    const filters = state.searchFilters;
    const term = normalizeText(filters.q);
    const corporation = normalizeText(filters.corporation);
    const ship = normalizeText(filters.ship);
    const minIsk = Number(filters.minIsk || 0);
    const month = Number(filters.month || 0);
    const year = Number(filters.year || 0);

    return getSortedKills().filter((kill) => {
      const haystack = normalizeText([kill.killer, kill.victim, kill.corporation, kill.victimCorporation, kill.ship].join(" "));
      return (!term || haystack.includes(term))
        && (!corporation || normalizeText([kill.corporation, kill.victimCorporation].join(" ")).includes(corporation))
        && (!ship || normalizeText(kill.ship).includes(ship))
        && (!minIsk || kill.isk >= minIsk)
        && (!month || kill.month === month)
        && (!year || kill.year === year);
    });
  }

  function getPlayers() {
    const map = new Map();

    for (const kill of state.kills) {
      const key = normalizeText(kill.killer);
      const current = map.get(key) || {
        name: kill.killer,
        corporation: kill.corporation,
        kills: 0,
        totalIsk: 0,
        biggestKill: null,
        historicalRank: 0
      };

      current.kills += 1;
      current.totalIsk += kill.isk;

      if (!current.biggestKill || kill.isk > current.biggestKill.isk) {
        current.biggestKill = kill;
      }

      map.set(key, current);
    }

    return [...map.values()]
      .sort((left, right) => right.totalIsk - left.totalIsk || left.name.localeCompare(right.name, "es"))
      .map((player, index) => ({ ...player, historicalRank: index + 1 }));
  }

  function getCorporations(kills) {
    const map = new Map();

    for (const kill of kills) {
      const name = kill.corporation || "Sin corporacion";
      const current = map.get(name) || { corporation: name, totalIsk: 0, kills: 0 };
      current.totalIsk += kill.isk;
      current.kills += 1;
      map.set(name, current);
    }

    return [...map.values()].sort((left, right) => right.totalIsk - left.totalIsk);
  }

  function getMonthlyChart(kills) {
    const map = new Map();

    for (const kill of kills) {
      const key = `${kill.year}-${String(kill.month).padStart(2, "0")}`;
      const current = map.get(key) || {
        label: `${MONTHS_ES[kill.month - 1]} ${kill.year}`,
        year: kill.year,
        month: kill.month,
        totalIsk: 0,
        kills: 0
      };

      current.totalIsk += kill.isk;
      current.kills += 1;
      map.set(key, current);
    }

    return [...map.values()].sort((left, right) => left.year - right.year || left.month - right.month);
  }

  function getAvailableYears() {
    const years = new Set(state.kills.map((kill) => kill.year));
    years.add(new Date().getUTCFullYear());
    return [...years].sort((left, right) => right - left);
  }

  function sortByIsk(left, right) {
    return right.isk - left.isk || new Date(left.createdAt) - new Date(right.createdAt);
  }

  function findKill(killId) {
    return state.kills.find((kill) => kill.id === killId);
  }

  function normalizeKills(values) {
    if (!Array.isArray(values)) {
      return [];
    }

    return values
      .map(normalizeKill)
      .filter(Boolean)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function normalizeKill(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const killer = stringFrom(raw.killer, raw.attacker, raw.atacante);
    const victim = stringFrom(raw.victim, raw.victima);
    const ship = stringFrom(raw.ship, raw.nave);
    const isk = parseIskNumber(raw.isk || raw.value || raw.valor);
    const date = normalizeDate(raw.date || raw.fecha);

    if (!killer || !victim || !ship || !isk || !date) {
      return null;
    }

    const dateObject = new Date(date);
    return {
      id: String(raw.id || raw.uid || createUid("kill")),
      killer,
      victim,
      corporation: stringFrom(raw.corporation, raw.corp),
      victimCorporation: stringFrom(raw.victimCorporation, raw.victimCorp),
      ship,
      isk,
      participants: Math.max(1, Number(raw.participants || raw.participantes || 1)),
      date,
      image: stringFrom(raw.image, raw.screenshot, raw.imagen),
      month: Number(raw.month || dateObject.getUTCMonth() + 1),
      year: Number(raw.year || dateObject.getUTCFullYear()),
      rawText: stringFrom(raw.rawText),
      createdAt: normalizeDate(raw.createdAt || raw.created_at) || new Date().toISOString(),
      updatedAt: normalizeDate(raw.updatedAt) || new Date().toISOString()
    };
  }

  function killToForm(kill) {
    const date = new Date(kill.date);
    return {
      killer: kill.killer,
      victim: kill.victim,
      corporation: kill.corporation,
      victimCorporation: kill.victimCorporation,
      ship: kill.ship,
      isk: String(kill.isk),
      participants: String(kill.participants),
      date: Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10),
      time: Number.isNaN(date.getTime()) ? "00:00" : date.toISOString().slice(11, 16),
      image: kill.image
    };
  }

  function blankKillForm() {
    const nowDate = new Date();
    return {
      killer: "",
      victim: "",
      corporation: "",
      victimCorporation: "",
      ship: "",
      isk: "",
      participants: "1",
      date: nowDate.toISOString().slice(0, 10),
      time: nowDate.toISOString().slice(11, 16),
      image: ""
    };
  }

  async function compressImageFile(file) {
    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i)) {
      throw new Error("Usa una imagen PNG, JPG o WebP.");
    }

    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      throw new Error(`La imagen no debe superar ${MAX_IMAGE_MB} MB.`);
    }

    const imageUrl = URL.createObjectURL(file);
    const image = await loadImage(imageUrl);
    URL.revokeObjectURL(imageUrl);

    const scale = Math.min(1, IMAGE_MAX_SIZE / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", IMAGE_QUALITY);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("No se pudo leer la imagen."));
      image.src = src;
    });
  }

  async function analyzeKillImage(file) {
    try {
      const tesseract = await import("tesseract.js");
      const engine = tesseract.default || tesseract;
      const targets = await createKillOcrTargets(file);
      const regions = [];

      for (const target of targets) {
        try {
          const result = await engine.recognize(target.source, "eng", {
            tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789[]/:-,. ISKisk%<>|& aeiouAEIOU",
            ...(target.options || {})
          });
          regions.push(`OCR_REGION_${target.name.toUpperCase()}\n${result?.data?.text || ""}`);
        } catch (error) {
          console.warn(`OCR region ${target.name} fallida`, error);
        }
      }

      const text = regions.join("\n");

      return parseKillReportText(text);
    } catch (error) {
      console.error(error);
      return {
        ...blankDetection(""),
        warnings: ["OCR automatico no disponible. Completa los campos manualmente."],
        needsReview: true
      };
    }
  }

  async function createKillOcrTargets(file) {
    const fallback = [{ name: "full", source: file }];

    try {
      const imageUrl = URL.createObjectURL(file);
      const image = await loadImage(imageUrl);
      URL.revokeObjectURL(imageUrl);

      if (image.width < 600 || image.height < 320) {
        return fallback;
      }

      return [
        {
          name: "victim_line",
          source: createOcrCropCanvas(image, { x: 0.205, y: 0.155, width: 0.29, height: 0.075, scale: 4 }),
          options: { tessedit_pageseg_mode: "7", preserve_interword_spaces: "1" }
        },
        {
          name: "victim_header",
          source: createOcrCropCanvas(image, { x: 0.16, y: 0.105, width: 0.43, height: 0.22, scale: 3 }),
          options: { tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" }
        },
        {
          name: "participants_header",
          source: createOcrCropCanvas(image, { x: 0.16, y: 0.43, width: 0.30, height: 0.08, scale: 4 }),
          options: { tessedit_pageseg_mode: "7", preserve_interword_spaces: "1" }
        },
        {
          name: "participant_first",
          source: createOcrCropCanvas(image, { x: 0.18, y: 0.50, width: 0.28, height: 0.14, scale: 4 }),
          options: { tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" }
        },
        {
          name: "ship_value",
          source: createOcrCropCanvas(image, { x: 0.60, y: 0.13, width: 0.28, height: 0.22, scale: 3 }),
          options: { tessedit_pageseg_mode: "6", preserve_interword_spaces: "1" }
        },
        {
          name: "date_line",
          source: createOcrCropCanvas(image, { x: 0.16, y: 0.32, width: 0.34, height: 0.10, scale: 4 }),
          options: { tessedit_pageseg_mode: "7", preserve_interword_spaces: "1" }
        },
        { name: "top", source: createOcrCropCanvas(image, { x: 0.15, y: 0.06, width: 0.70, height: 0.34 }) },
        { name: "participants", source: createOcrCropCanvas(image, { x: 0.16, y: 0.43, width: 0.36, height: 0.46 }) },
        { name: "victim", source: createOcrCropCanvas(image, { x: 0.18, y: 0.11, width: 0.38, height: 0.22 }) },
        ...fallback
      ];
    } catch (error) {
      console.warn("No se pudo preparar la imagen para OCR por regiones.", error);
      return fallback;
    }
  }

  function createOcrCropCanvas(image, region) {
    const sourceX = Math.round(image.naturalWidth * region.x);
    const sourceY = Math.round(image.naturalHeight * region.y);
    const sourceWidth = Math.round(image.naturalWidth * region.width);
    const sourceHeight = Math.round(image.naturalHeight * region.height);
    const scale = region.scale || 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, sourceWidth * scale);
    canvas.height = Math.max(1, sourceHeight * scale);
    const context = canvas.getContext("2d", { willReadFrequently: true });

    context.fillStyle = "#020406";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.filter = "contrast(190%) brightness(112%) saturate(80%)";
    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas;
  }

  function parseKillReportText(text) {
    const detection = blankDetection(text);
    const lines = getOcrLines(text);
    const tagged = parseTaggedNames(lines);
    const victim = improveVictimCandidate(findVictimCandidate(tagged, lines), tagged);
    const killer = findKillerCandidate(tagged, lines, victim);
    const date = parseDateFromText(text);
    const time = parseTimeFromText(text);
    const isk = parseIskFromText(text);
    const ship = parseShip(lines);
    const participants = parseParticipants(text);

    if (killer?.name) {
      detection.data.killer = killer.name;
      detection.data.corporation = killer.tag;
      detection.confidence.killer = tagged.length > 1 ? 0.82 : 0.55;
      detection.confidence.corporation = 0.78;
    }

    if (victim?.name) {
      detection.data.victim = victim.name;
      detection.data.victimCorporation = victim.tag || "";
      detection.confidence.victim = victim.confidence || 0.82;
      detection.confidence.victimCorporation = victim.tag ? 0.78 : 0.35;
    }

    if (ship) {
      detection.data.ship = ship;
      detection.confidence.ship = SHIPS.includes(ship) ? 0.9 : 0.58;
    }

    if (isk > 0) {
      detection.data.isk = isk;
      detection.confidence.isk = 0.92;
    }

    if (date) {
      detection.data.date = date;
      detection.confidence.date = 0.88;
    }

    if (time) {
      detection.data.time = time;
      detection.confidence.time = 0.82;
    }

    if (participants > 1) {
      detection.data.participants = participants;
      detection.confidence.participants = 0.8;
    } else {
      detection.confidence.participants = 0.45;
    }

    detection.warnings = OCR_FIELDS
      .filter((field) => detection.confidence[field] < 0.65)
      .map((field) => `Revisar ${field}: baja confianza OCR.`);
    detection.needsReview = detection.warnings.length > 0;
    return detection;
  }

  function getOcrLines(text) {
    const lines = [];
    let region = "full";

    for (const rawLine of String(text || "").split(/\r?\n/)) {
      const line = rawLine.trim();

      if (!line) {
        continue;
      }

      const regionMatch = line.match(/^OCR_REGION_([A-Z_]+)/);
      if (regionMatch) {
        region = regionMatch[1].toLowerCase();
        continue;
      }

      lines.push({ text: line, region, index: lines.length });
    }

    return lines;
  }

  function fillDraftFromDetection(draft, detection) {
    const next = {};

    for (const field of OCR_FIELDS) {
      const value = detection.data[field];
      if (value !== undefined && value !== null && value !== "" && (!draft[field] || detection.confidence[field] >= 0.65)) {
        next[field] = String(value);
      }
    }

    return next;
  }

  function blankDetection(rawText = "") {
    return {
      data: {
        killer: "",
        victim: "",
        corporation: "",
        victimCorporation: "",
        ship: "",
        isk: "",
        participants: "1",
        date: new Date().toISOString().slice(0, 10),
        time: ""
      },
      confidence: Object.fromEntries(OCR_FIELDS.map((field) => [field, 0.1])),
      needsReview: true,
      warnings: [],
      rawText,
      source: "tesseract"
    };
  }

  function parseTaggedNames(lines) {
    const matches = [];

    for (const line of lines) {
      const parsed = parseTaggedNameFromLine(line.text, line.region);

      if (!parsed) {
        continue;
      }

      const name = normalizePilotName(parsed.name, parsed.missingClose);

      if (isLikelyPilotName(name, line.text)) {
        matches.push({
          tag: normalizeCorporationTag(parsed.tag),
          name,
          line: line.text,
          region: line.region,
          index: line.index,
          confidence: parsed.confidence || getOcrRegionConfidence(line.region)
        });
      }
    }

    return matches;
  }

  function parseTaggedNameFromLine(line, region = "full") {
    const knownTag = line.match(/\[\s*(SC2|FAB|RSCP|FTL|RTI|IU|RSC[P]?)\s*[\]\|Il]?\s*([A-ZJIl][A-Za-z0-9][^\[\]\n\r]{1,60})/i);
    if (knownTag) {
      return {
        tag: knownTag[1],
        name: knownTag[2],
        missingClose: !line.includes("]"),
        confidence: region === "participants" || region === "participant_first" ? 0.82 : 0.9
      };
    }

    if (region === "victim_line") {
      const compactLine = line.replace(/\s+/g, "");
      const compactBroken = compactLine.match(/\[?([A-Z0-9]{3,4})[\]\|Il]?([A-ZJIl][A-Za-z0-9]{2,34})/);

      if (compactBroken) {
        return {
          tag: compactBroken[1],
          name: compactBroken[2],
          missingClose: true,
          confidence: 0.86
        };
      }
    }

    const normalTag = line.match(/\[\s*([A-Za-z0-9-]{2,8})\s*\]\s*([^\[\]\n\r]+)/);
    if (normalTag) {
      return { tag: normalTag[1], name: normalTag[2] };
    }

    const pipeTag = line.match(/\[\s*([A-Za-z0-9-]{2,8})\s*[\|Il]\s*([^\[\]\n\r]+)/);
    if (pipeTag) {
      return { tag: pipeTag[1], name: pipeTag[2] };
    }

    const missingCloseTag = line.match(/\[\s*([A-Z0-9]{2,5})([A-ZJIl][A-Za-z0-9][^\[\]\n\r]{1,42})/);
    if (missingCloseTag) {
      return { tag: missingCloseTag[1], name: missingCloseTag[2], missingClose: true };
    }

    const looseTag = region === "victim"
      ? line.match(/\b([A-Z0-9]{2,8})\s*[\|Il]\s*([A-Za-z0-9][A-Za-z0-9 _.'-]{2,36})/)
      : null;
    if (looseTag) {
      return { tag: looseTag[1], name: looseTag[2] };
    }

    return null;
  }

  function findVictimCandidate(tagged, lines) {
    const participantIndex = lines.find((line) => /participantes?|participants?/i.test(line.text))?.index ?? Number.POSITIVE_INFINITY;
    return tagged
      .filter((item) => item.region !== "participants" && item.region !== "participant_first" && item.index < participantIndex)
      .sort((left, right) => scoreVictimCandidate(right) - scoreVictimCandidate(left))[0]
      || findLooseVictimName(lines, participantIndex)
      || null;
  }

  function improveVictimCandidate(victim, tagged) {
    if (!victim || victim.name.includes(" ")) {
      return victim;
    }

    const compactVictim = compactNameForCompare(victim.name);
    const spacingSource = tagged
      .filter((item) => item !== victim
        && item.name.includes(" ")
        && (!victim.tag || !item.tag || item.tag === victim.tag)
        && ["victim_header", "victim", "top"].includes(item.region))
      .sort((left, right) => scoreVictimCandidate(right) - scoreVictimCandidate(left))
      .find((item) => areCompactNamesClose(compactVictim, compactNameForCompare(item.name)));

    if (!spacingSource) {
      return victim;
    }

    return {
      ...victim,
      name: applyNameSpacing(victim.name, spacingSource.name),
      confidence: Math.max(victim.confidence || 0, spacingSource.confidence || 0)
    };
  }

  function compactNameForCompare(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }

  function areCompactNamesClose(left, right) {
    if (!left || !right || Math.abs(left.length - right.length) > 2) {
      return false;
    }

    let mismatches = Math.abs(left.length - right.length);
    const limit = Math.min(left.length, right.length);
    for (let index = 0; index < limit; index += 1) {
      if (left[index] !== right[index]) {
        mismatches += 1;
      }
    }

    return mismatches <= 2;
  }

  function applyNameSpacing(value, spacingTemplate) {
    const raw = String(value || "").replace(/\s+/g, "");
    const templateParts = String(spacingTemplate || "").split(/\s+/).filter(Boolean);
    const output = [];
    let cursor = 0;

    for (const part of templateParts) {
      if (cursor >= raw.length) {
        break;
      }

      output.push(raw.slice(cursor, cursor + part.length));
      cursor += part.length;
    }

    if (cursor < raw.length) {
      output.push(raw.slice(cursor));
    }

    return output.join(" ").trim() || value;
  }

  function findLooseVictimName(lines, participantIndex) {
    const ignored = /^(?:informe|muertes?|muerte|raven|modelo|navy|acorazado|dario|dafio|danio|dano|daño|total|potencia|codificadores|impulsos|utc|isk|scalding|pass|participantes?)$/i;
    const sourceLines = lines.filter((line) => ["top", "victim", "full"].includes(line.region) && line.index < participantIndex);

    for (const line of sourceLines) {
      const tokens = line.text.match(/[A-Za-z][A-Za-z0-9]{3,22}/g) || [];

      for (const token of tokens) {
        const name = normalizePilotName(token);

        if (ignored.test(name) || !/[a-z][A-Z]/.test(name)) {
          continue;
        }

        if (isLikelyPilotName(name, name)) {
          return {
            tag: "",
            name,
            line: line.text,
            region: line.region,
            index: line.index,
            confidence: name.length >= 5 ? 0.66 : 0.55
          };
        }
      }
    }

    return null;
  }

  function findKillerCandidate(tagged, lines, victim) {
    const participantTagged = tagged.filter((item) => item !== victim && !["victim", "victim_header", "victim_line", "top", "date_line", "ship_value"].includes(item.region));
    const finalBlowIndex = findLineIndex(lines, /golpe\s*de\s*gracia|solpe\s*de\s*grac/i);
    const topDamageIndex = findLineIndex(lines, /da[fñn]o\s*m[aáa]ximo|dano\s*maximo/i);
    const finalBlow = findTaggedBeforeIndex(participantTagged, finalBlowIndex);
    const topDamage = findTaggedBeforeIndex(participantTagged, topDamageIndex);

    return finalBlow || topDamage || participantTagged[0] || tagged.find((item) => item !== victim) || tagged[0];
  }

  function scoreVictimCandidate(item) {
    const regionScores = {
      victim_line: 100,
      victim_header: 92,
      victim: 86,
      top: 76,
      full: 50
    };

    const regionScore = regionScores[item.region] || 40;
    const tagBonus = item.tag ? 8 : 0;
    const nameBonus = item.name.includes(" ") ? 4 : 0;
    return regionScore + tagBonus + nameBonus + Math.round((item.confidence || 0) * 10);
  }

  function getOcrRegionConfidence(region) {
    const regionScores = {
      victim_line: 0.88,
      victim_header: 0.82,
      participant_first: 0.82,
      participants: 0.76,
      victim: 0.74,
      top: 0.7,
      full: 0.55
    };

    return regionScores[region] || 0.58;
  }

  function findLineIndex(lines, pattern) {
    const found = lines.find((line) => pattern.test(line.text));
    return found ? found.index : -1;
  }

  function findTaggedBeforeIndex(tagged, lineIndex) {
    if (lineIndex < 0) {
      return null;
    }

    return tagged
      .filter((item) => item.index <= lineIndex)
      .sort((left, right) => right.index - left.index)[0] || null;
  }

  function parseIskFromText(text) {
    const matches = [...text.matchAll(/(\d{1,3}(?:[,.]\d{3})+|\d+)(?:[,.](\d{1,2}))?\s*(?:ISK|1SK|lSK)?/gi)]
      .map((match) => Number(match[1].replace(/[,.]/g, "")))
      .filter((value) => value >= 100000);

    return matches.length ? Math.max(...matches) : 0;
  }

  function parseDateFromText(text) {
    const dateMatch = text.match(/(20\d{2})[\/.\-](\d{1,2})[\/.\-](\d{1,2})/);
    if (!dateMatch) {
      return "";
    }

    const [, year, month, day] = dateMatch;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  function parseTimeFromText(text) {
    const timeMatch = text.match(/\b([01]?\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?\b/);
    return timeMatch ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2]}` : "";
  }

  function parseParticipants(text) {
    const participantRegion = text.match(/OCR_REGION_PARTICIPANTS_HEADER([\s\S]*?)(?:OCR_REGION_|$)/i)
      || text.match(/OCR_REGION_PARTICIPANTS([\s\S]*?)(?:OCR_REGION_|$)/i);
    const regionMatch = participantRegion?.[1]?.match(/\[(\d{1,3})\]/);

    if (regionMatch) {
      return Number(regionMatch[1]);
    }

    const match = text.match(/(?:participants?|participantes?|pilots|attackers|atacantes)\s*[\[\(:|Il]?\s*(\d{1,3})/i)
      || text.match(/(\d{1,3})\s*(?:participants|participant|pilots|attackers|atacantes|participantes)/i);
    return match ? Number(match[1]) : 1;
  }

  function parseShip(lines) {
    const joined = lines.map((line) => line.text).join("\n");
    const known = [...SHIPS]
      .sort((left, right) => right.length - left.length)
      .find((ship) => new RegExp(`\\b${escapeRegExp(ship)}\\b`, "i").test(joined));

    if (known) {
      return known.replace(/\s+Acorazado$/i, "");
    }

    const likelyShip = lines.find((line) => /^[A-Z][A-Za-z'\-\s]{3,38}$/.test(line.text) && !line.text.includes("[") && !isEquipmentLine(line.text));
    return likelyShip?.text || "";
  }

  function normalizeCorporationTag(value) {
    const tag = String(value || "")
      .replace(/[^A-Za-z0-9-]/g, "")
      .toUpperCase()
      .slice(0, 8);

    const corrections = {
      RSEP: "RSCP",
      R5EP: "RSCP",
      RSFP: "RSCP",
      RSCF: "RSCP",
      RSBP: "RSCP",
      R5BP: "RSCP",
      RS8P: "RSCP",
      RSEPI: "RSCP"
    };

    return corrections[tag] || tag;
  }

  function normalizePilotName(value, fromBrokenTag = false) {
    let name = String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[|]+/g, "")
      .replace(/[<>].*$/g, "")
      .replace(/\bISK\b/gi, "")
      .replace(/\s*&\s*(?:ln|in|l|pe|pa|oak|<3).*$/i, "")
      .replace(/\s+\d{1,3}\s*[&_.\u00b0%-].*$/i, "")
      .replace(/\s+(?:Machariel|Raven|Nightmare|Rattlesnake|Vindicator|Nidhoggur|Nereus|Navy|Acorazado|Dafio|Dano|Danio|UTC|Muerte|Potencia)\b.*$/i, "")
      .replace(/\s+(?:po\s+LS|po|LS|Bo|Re|RR|Lr|Pit|Pith|Pith.*|Lanza.*|Dafi.*|Dano.*|Daño.*)$/i, "")
      .trim();

    name = name.replace(/^[\]\|:;'"`.,_-]+/, "");
    if (fromBrokenTag) {
      name = name.replace(/^[JIl](?=[A-Za-z0-9])/, "");
    }
    name = name.replace(/^J(?=[A-Z][a-z]+[0-9])/, "");
    name = name.replace(/I(?=o)/g, "l");
    name = name.replace(/HUK\b/g, "HuK");
    name = name.replace(/\s+\d{1,3}%?$/, "").trim();
    name = stripTrailingOcrNoise(name);
    name = applyKnownPilotCorrections(name);

    if (/^[a-z][a-z]+[A-Z]/.test(name)) {
      name = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    }

    return name;
  }

  function applyKnownPilotCorrections(value) {
    const name = String(value || "").trim();
    const compact = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase().replace(/0/g, "O");

    if (compact === "ZOLUS") {
      return "ZoLus";
    }

    if (["BUIOHUK", "BULOHUK", "JLOHUK", "JIOHUK", "SJLOHUK"].includes(compact)) {
      return "SJloHuK";
    }

    return name;
  }

  function stripTrailingOcrNoise(value) {
    const tokens = String(value || "").split(/\s+/).filter(Boolean);

    while (tokens.length > 1 && isOcrNoiseToken(tokens[tokens.length - 1])) {
      tokens.pop();
    }

    return tokens
      .join(" ")
      .replace(/\s+[&_.\u00b0%-]+$/g, "")
      .replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "")
      .trim();
  }

  function isOcrNoiseToken(token) {
    const clean = String(token || "").replace(/[^A-Za-z0-9-]/g, "");
    if (!clean) {
      return true;
    }

    if (!/[A-Za-z]/.test(clean)) {
      return true;
    }

    if (clean.length === 1) {
      return true;
    }

    return /^[A-Z0-9-]{1,3}$/.test(clean) && !/[a-z]/.test(clean);
  }

  function isLikelyPilotName(name, sourceLine = "") {
    if (!name || name.length < 3 || name.length > 34) {
      return false;
    }

    if (!/[A-Za-z]/.test(name)) {
      return false;
    }

    if (/^[a-z]{4,}$/.test(name)) {
      return false;
    }

    if (/([A-Za-z])\1{3,}/.test(name)) {
      return false;
    }

    const letters = name.toLowerCase().replace(/[^a-z]/g, "");
    if (letters.length >= 6 && new Set(letters).size <= 3) {
      return false;
    }

    if (isEquipmentLine(name)) {
      return false;
    }

    return !/informe|muerte|participantes?|codificadores|impulsos|scalding|pass|modelo|acorazado|ranura|pith|lanzamisiles|dafi|daño|dano/i.test(name);
  }

  function isEquipmentLine(value) {
    return /ranura|pith|lanzamisiles|misiles|tipo\s+c|superior|inferior|golpe\s*de\s*gracia|da[fñn]o\s*m[aáa]ximo|participantes?|muerte|informe|potencia|codificadores|impulsos|scalding|pass/i.test(value);
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function getConfidenceClass(value) {
    if (!value || value < 0.65) {
      return "is-low-confidence";
    }

    if (value < 0.82) {
      return "is-mid-confidence";
    }

    return "is-high-confidence";
  }

  function createUid(prefix) {
    if (window.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }

    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function parseLocalDateTimeToUtc(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function parseIskNumber(value) {
    return Math.max(0, Math.round(Number(String(value || "0").replace(/[,\s]/g, "")) || 0));
  }

  function formatIsk(value) {
    const amount = Number(value || 0);
    if (amount >= 1000000000000) {
      return `${(amount / 1000000000000).toFixed(2)} T ISK`;
    }

    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(2)} B ISK`;
    }

    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)} M ISK`;
    }

    return `${new Intl.NumberFormat("es-MX").format(amount)} ISK`;
  }

  function formatShortDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Fecha N/A";
    }

    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${day} ${MONTHS_ES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }

  function medalForIndex(index) {
    if (index === 0) {
      return "Oro";
    }

    if (index === 1) {
      return "Plata";
    }

    if (index === 2) {
      return "Bronce";
    }

    return `#${index + 1}`;
  }

  function stringFrom(...values) {
    const value = values.find((item) => item !== undefined && item !== null);
    return value === undefined ? "" : String(value).trim();
  }

  function normalizeText(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function isAdminUnlocked() {
    try {
      return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  }

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "kills-toast";
    toast.textContent = message;
    els.toastStack.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }
}
