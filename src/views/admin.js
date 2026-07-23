const STORAGE_KEY = "eveEchoesCorpCommand.v1";
const ADMIN_PASSWORD = "anlaporura";
const ADMIN_AUTH_KEY = "sc2.admin.unlocked";

const STATUS_CONFIG = {
  active: {
    title: "Miembros",
    label: "Activo",
    emptyTitle: "Sin miembros activos",
    emptyCopy: "No hay registros activos en la corporacion."
  },
  excorp: {
    title: "EX-CORP",
    label: "EX-CORP",
    emptyTitle: "Sin registros EX-CORP",
    emptyCopy: "No hay antiguos miembros registrados."
  },
  blacklist: {
    title: "Lista Negra",
    label: "Lista Negra",
    emptyTitle: "Lista Negra vacia",
    emptyCopy: "No hay miembros marcados en Lista Negra."
  }
};

export function renderAdmin() {
  if (!isAdminUnlocked()) {
    return renderAdminGate();
  }

  return renderAdminPanel();
}

function renderAdminGate() {
  return `
    <section class="admin-login-page" aria-labelledby="adminLoginTitle">
      <form class="admin-login-card" data-admin-login-form novalidate>
        <span class="admin-section-kicker">Acceso restringido</span>
        <h1 id="adminLoginTitle">Corp Command</h1>
        <p>Introduce la contraseña administrativa para continuar.</p>

        <label class="admin-login-field" for="adminPassword">
          <span>Contraseña</span>
          <input id="adminPassword" name="password" type="password" autocomplete="current-password" required autofocus>
        </label>

        <p class="admin-login-error" data-admin-login-error aria-live="polite"></p>
        <button class="admin-btn admin-btn-primary" type="submit">Entrar al panel</button>
      </form>
    </section>
  `;
}

function renderAdminPanel() {
  return `
    <section class="admin-page" aria-label="Panel administrativo corporativo">
      <aside class="admin-sidebar" aria-label="Menu del panel administrativo">
        <div class="admin-brand">
          <span class="admin-brand-kicker">EVE Echoes</span>
          <h1>Corp Command</h1>
          <span class="admin-brand-status">Offline / LocalStorage</span>
        </div>

        <nav class="admin-nav-list">
          <button class="admin-nav-item is-active" type="button" data-admin-view="dashboard">
            <span class="admin-nav-mark" aria-hidden="true"></span>
            Dashboard
          </button>
          <button class="admin-nav-item" type="button" data-admin-view="active">
            <span class="admin-nav-mark" aria-hidden="true"></span>
            Miembros
          </button>
          <button class="admin-nav-item" type="button" data-admin-view="excorp">
            <span class="admin-nav-mark" aria-hidden="true"></span>
            EX-CORP
          </button>
          <button class="admin-nav-item" type="button" data-admin-view="blacklist">
            <span class="admin-nav-mark" aria-hidden="true"></span>
            Lista Negra
          </button>
        </nav>

        <div class="admin-sidebar-readout" id="adminSidebarReadout" aria-label="Resumen rapido"></div>
      </aside>

      <section class="admin-workspace">
        <header class="admin-command-bar">
          <div class="admin-command-heading">
            <span class="admin-section-kicker">Centro de administracion corporativa</span>
            <h2 id="adminViewTitle">Dashboard</h2>
          </div>

          <div class="admin-command-actions">
            <label class="admin-search-control" for="adminGlobalSearch">
              <span>Buscar</span>
              <input id="adminGlobalSearch" type="search" autocomplete="off" placeholder="Nombre, ID, Discord, telefono o notas">
            </label>
            <button class="admin-btn admin-btn-primary" type="button" id="adminAddMemberButton">
              + Nuevo miembro
            </button>
            <button class="admin-btn" type="button" id="adminExportButton">Exportar JSON</button>
            <button class="admin-btn" type="button" id="adminImportButton">Importar JSON</button>
            <input class="sr-only" type="file" id="adminImportInput" accept=".json,application/json">
          </div>
        </header>

        <section class="admin-counter-rail" id="adminCounterRail" aria-label="Contadores automaticos"></section>
        <section class="admin-view-shell" id="adminViewMount" aria-live="polite"></section>
      </section>

      <dialog class="admin-modal" id="adminModal" aria-labelledby="adminModalTitle">
        <div class="admin-modal-shell" role="document">
          <header class="admin-modal-header">
            <div>
              <span class="admin-modal-kicker" id="adminModalKicker">Operacion</span>
              <h3 id="adminModalTitle">Modal</h3>
            </div>
            <button class="admin-modal-close" type="button" data-modal-close aria-label="Cerrar">x</button>
          </header>
          <div class="admin-modal-body" id="adminModalBody"></div>
          <footer class="admin-modal-footer" id="adminModalFooter"></footer>
        </div>
      </dialog>

      <div class="admin-toast-stack" id="adminToastStack" aria-live="polite" aria-atomic="true"></div>
    </section>
  `;
}

export function initAdmin({ main }) {
  if (!isAdminUnlocked()) {
    return initAdminGate(main);
  }

  return initAdminPanel(main);
}

function initAdminGate(main) {
  const controller = new AbortController();
  const { signal } = controller;
  const form = main.querySelector("[data-admin-login-form]");
  const passwordInput = form?.querySelector('[name="password"]');
  const error = main.querySelector("[data-admin-login-error]");
  let panelCleanup = null;

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const password = String(new FormData(form).get("password") || "");

    if (password !== ADMIN_PASSWORD) {
      error.textContent = "Contraseña incorrecta.";
      passwordInput.value = "";
      passwordInput.focus();
      return;
    }

    sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
    controller.abort();
    main.innerHTML = renderAdminPanel();
    panelCleanup = initAdminPanel(main);
  }, { signal });

  requestAnimationFrame(() => passwordInput?.focus());

  return () => {
    controller.abort();
    panelCleanup?.();
  };
}

function initAdminPanel(main) {
  const controller = new AbortController();
  const { signal } = controller;
  const state = {
    members: [],
    currentView: "dashboard",
    searchTerm: "",
    expandedMembers: new Set()
  };

  const els = {
    viewTitle: main.querySelector("#adminViewTitle"),
    viewMount: main.querySelector("#adminViewMount"),
    counterRail: main.querySelector("#adminCounterRail"),
    sidebarReadout: main.querySelector("#adminSidebarReadout"),
    globalSearch: main.querySelector("#adminGlobalSearch"),
    addMemberButton: main.querySelector("#adminAddMemberButton"),
    exportButton: main.querySelector("#adminExportButton"),
    importButton: main.querySelector("#adminImportButton"),
    importInput: main.querySelector("#adminImportInput"),
    modal: main.querySelector("#adminModal"),
    modalKicker: main.querySelector("#adminModalKicker"),
    modalTitle: main.querySelector("#adminModalTitle"),
    modalBody: main.querySelector("#adminModalBody"),
    modalFooter: main.querySelector("#adminModalFooter"),
    toastStack: main.querySelector("#adminToastStack"),
    navButtons: Array.from(main.querySelectorAll("[data-admin-view]"))
  };

  loadData();
  bindEvents();
  render();

  return () => {
    controller.abort();
    if (els.modal.open) {
      els.modal.close();
    }
  };

  function bindEvents() {
    els.navButtons.forEach((button) => {
      button.addEventListener("click", () => {
        state.currentView = button.dataset.adminView;
        render();
      }, { signal });
    });

    els.globalSearch.addEventListener("input", (event) => {
      state.searchTerm = event.target.value.trim();
      render();
    }, { signal });

    els.addMemberButton.addEventListener("click", () => openMemberModal("create"), { signal });
    els.exportButton.addEventListener("click", exportBackup, { signal });
    els.importButton.addEventListener("click", () => els.importInput.click(), { signal });
    els.importInput.addEventListener("change", handleImportFile, { signal });
    els.viewMount.addEventListener("click", handleViewAction, { signal });

    els.modal.addEventListener("click", (event) => {
      if (event.target === els.modal || event.target.closest("[data-modal-close]")) {
        closeModal();
      }
    }, { signal });

    els.modal.addEventListener("close", () => {
      els.modal.classList.remove("is-visible");
    }, { signal });
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.members = [];
        return;
      }

      state.members = readMembersFromPayload(JSON.parse(raw));
      persistData(false);
    } catch (error) {
      console.error(error);
      state.members = [];
      showToast("No se pudo leer el almacenamiento local.");
    }
  }

  function persistData(showSavedToast = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(buildBackupPayload()));
      if (showSavedToast) {
        showToast("Datos guardados localmente.");
      }
    } catch (error) {
      console.error(error);
      showToast("El navegador no permitio guardar en LocalStorage.");
    }
  }

  function buildBackupPayload() {
    return {
      app: "EVE Echoes Corp Command",
      version: 1,
      exportedAt: new Date().toISOString(),
      members: state.members
    };
  }

  function render() {
    renderNavigation();
    renderCounters();

    if (state.currentView === "dashboard") {
      els.viewTitle.textContent = "Dashboard";
      renderDashboard();
      return;
    }

    const config = STATUS_CONFIG[state.currentView];
    els.viewTitle.textContent = config.title;
    renderRoster(state.currentView);
  }

  function renderNavigation() {
    els.navButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminView === state.currentView);
    });
  }

  function renderCounters() {
    const stats = getStats();
    const counters = [
      ["Miembros activos", stats.active, "Operativos"],
      ["Personajes MAIN", stats.main, "Todos los registros"],
      ["Personajes ALT", stats.alts, "Alters registrados"],
      ["EX-CORP", stats.excorp, "Fuera de la corporacion"],
      ["Lista Negra", stats.blacklist, "Marcados"]
    ];

    els.counterRail.innerHTML = counters.map(([label, value, sub]) => `
      <article class="admin-stat-card">
        <span class="admin-stat-label">${escapeHtml(label)}</span>
        <strong class="admin-stat-value">${value}</strong>
        <p class="admin-stat-sub">${escapeHtml(sub)}</p>
      </article>
    `).join("");

    els.sidebarReadout.innerHTML = counters.map(([label, value]) => `
      <div class="admin-readout-row">
        <span>${escapeHtml(label)}</span>
        <strong>${value}</strong>
      </div>
    `).join("");
  }

  function renderDashboard() {
    const stats = getStats();
    const searchResults = state.searchTerm ? getFilteredMembers() : [];

    els.viewMount.innerHTML = `
      ${state.searchTerm ? renderSearchResults(searchResults) : ""}
      <div class="admin-dashboard-grid">
        <section class="admin-command-panel">
          <header class="admin-panel-header">
            <div>
              <span class="admin-section-kicker">Estado de registros</span>
              <h3>Distribucion corporativa</h3>
            </div>
          </header>
          ${renderDistribution(stats)}
        </section>

        <section class="admin-command-panel">
          <header class="admin-panel-header">
            <div>
              <span class="admin-section-kicker">Bitacora</span>
              <h3>Actividad reciente</h3>
            </div>
          </header>
          ${renderRecentHistory()}
        </section>
      </div>
    `;
  }

  function renderRoster(status) {
    const config = STATUS_CONFIG[status];
    const members = getFilteredMembers(status);
    const totalForStatus = state.members.filter((member) => member.status === status).length;
    const termSuffix = state.searchTerm ? ` / ${members.length} coincidencias` : "";

    els.viewMount.innerHTML = `
      <div class="admin-list-header">
        <div>
          <span class="admin-section-kicker">${escapeHtml(config.label)}</span>
          <h3>${escapeHtml(config.title)}</h3>
          <p>${totalForStatus} registros${escapeHtml(termSuffix)}</p>
        </div>
      </div>
      ${members.length ? `<div class="admin-member-list">${members.map(renderMemberCard).join("")}</div>` : renderEmptyState(config)}
    `;
  }

  function renderSearchResults(results) {
    return `
      <section class="admin-search-results">
        <div class="admin-list-header">
          <div>
            <span class="admin-section-kicker">Busqueda global</span>
            <h3>${results.length} coincidencias</h3>
          </div>
        </div>
        ${results.length ? `<div class="admin-member-list">${results.map(renderMemberCard).join("")}</div>` : renderEmptyState({
          emptyTitle: "Sin coincidencias",
          emptyCopy: "No existe ningun registro con ese criterio."
        })}
      </section>
    `;
  }

  function renderDistribution(stats) {
    const rows = [
      ["Activos", stats.active],
      ["EX-CORP", stats.excorp],
      ["Lista Negra", stats.blacklist],
      ["ALT", stats.alts]
    ];
    const max = Math.max(...rows.map(([, value]) => value), 1);

    return `
      <div class="admin-status-grid">
        ${rows.map(([label, value]) => `
          <div class="admin-status-row">
            <span>${escapeHtml(label)}</span>
            <span class="admin-status-bar" aria-hidden="true">
              <span class="admin-status-fill" style="width: ${Math.max(4, Math.round((value / max) * 100))}%"></span>
            </span>
            <strong>${value}</strong>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderRecentHistory() {
    const recent = state.members
      .flatMap((member) => member.history.map((item) => ({ ...item, member })))
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    if (!recent.length) {
      return renderEmptyState({
        emptyTitle: "Sin actividad",
        emptyCopy: "La bitacora se alimentara con cada cambio."
      });
    }

    return `
      <ul class="admin-recent-list">
        ${recent.map((item) => `
          <li>
            <strong>${escapeHtml(item.member.mainName || "Registro sin nombre")}: ${escapeHtml(item.action)}</strong>
            <span>${escapeHtml(item.detail || "Sin detalle")}</span>
            <time datetime="${escapeAttr(item.at)}">${escapeHtml(formatDate(item.at))}</time>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderEmptyState(config) {
    return `
      <div class="admin-empty-state">
        <div>
          <h3>${escapeHtml(config.emptyTitle)}</h3>
          <p>${escapeHtml(config.emptyCopy)}</p>
        </div>
      </div>
    `;
  }

  function renderMemberCard(member) {
    const isOpen = state.expandedMembers.has(member.uid);
    const config = STATUS_CONFIG[member.status] || STATUS_CONFIG.active;

    return `
      <article class="admin-member-card is-${escapeAttr(member.status)} ${isOpen ? "is-open" : ""}">
        <button class="admin-member-toggle" type="button" data-action="toggle" data-member-id="${escapeAttr(member.uid)}" aria-expanded="${isOpen}">
          <span>
            <span class="admin-member-name-row">
              <span class="admin-member-name">${escapeHtml(member.mainName || "Sin nombre MAIN")}</span>
              <span class="admin-status-badge ${escapeAttr(member.status)}">${escapeHtml(config.label)}</span>
            </span>
            <span class="admin-member-meta">
              <span><span class="admin-meta-label">ID MAIN</span> <code class="admin-id-chip">${escapeHtml(member.mainId || "N/A")}</code></span>
              <span><span class="admin-meta-label">Discord</span> ${escapeHtml(member.discord || "N/A")}</span>
              <span><span class="admin-meta-label">ALT</span> ${member.alts.length}</span>
            </span>
          </span>
          <span class="admin-member-chevron" aria-hidden="true">v</span>
        </button>
        ${isOpen ? renderMemberBody(member) : ""}
      </article>
    `;
  }

  function renderMemberBody(member) {
    return `
      <div class="admin-member-body">
        <div class="admin-detail-grid">
          ${renderField("Nombre MAIN", member.mainName || "N/A")}
          ${renderField("ID MAIN", member.mainId || "N/A")}
          ${renderField("Telefono", member.phone || "N/A")}
          ${renderField("Discord", member.discord || "N/A")}
          <div class="admin-field-block admin-notes-block">
            <span class="admin-field-label">Notas</span>
            <p class="admin-notes-text">${escapeHtml(member.notes || "Sin notas")}</p>
          </div>
        </div>

        <section class="admin-subsection">
          <div class="admin-subsection-header">
            <h4>Personajes ALT</h4>
            <button class="admin-btn admin-btn-small" type="button" data-action="add-alt" data-member-id="${escapeAttr(member.uid)}">Agregar Alter</button>
          </div>
          ${renderAlts(member)}
        </section>

        <section class="admin-subsection">
          <div class="admin-subsection-header">
            <h4>Historial</h4>
          </div>
          ${renderHistory(member)}
        </section>

        <div class="admin-member-actions">
          ${renderMemberActions(member)}
        </div>
      </div>
    `;
  }

  function renderField(label, value) {
    return `
      <div class="admin-field-block">
        <span class="admin-field-label">${escapeHtml(label)}</span>
        <span class="admin-field-value">${escapeHtml(value)}</span>
      </div>
    `;
  }

  function renderAlts(member) {
    if (!member.alts.length) {
      return `<p class="admin-modal-copy">Sin alters registrados.</p>`;
    }

    return `
      <div class="admin-alt-list">
        ${member.alts.map((alt) => `
          <div class="admin-alt-row">
            <strong>${escapeHtml(alt.name || "ALT sin nombre")}</strong>
            <code>${escapeHtml(alt.characterId || "N/A")}</code>
            <div class="admin-row-actions">
              <button class="admin-btn admin-btn-small" type="button" data-action="edit-alt" data-member-id="${escapeAttr(member.uid)}" data-alt-id="${escapeAttr(alt.uid)}">Editar</button>
              <button class="admin-btn admin-btn-danger admin-btn-small" type="button" data-action="delete-alt" data-member-id="${escapeAttr(member.uid)}" data-alt-id="${escapeAttr(alt.uid)}">Eliminar</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  function renderHistory(member) {
    const history = [...member.history]
      .sort((a, b) => new Date(b.at) - new Date(a.at))
      .slice(0, 8);

    if (!history.length) {
      return `<p class="admin-modal-copy">Sin historial.</p>`;
    }

    return `
      <ul class="admin-history-list">
        ${history.map((item) => `
          <li>
            <strong>${escapeHtml(item.action)}</strong>
            <span>${escapeHtml(item.detail || "Sin detalle")}</span>
            <time datetime="${escapeAttr(item.at)}">${escapeHtml(formatDate(item.at))}</time>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function renderMemberActions(member) {
    const coreActions = `
      <button class="admin-btn" type="button" data-action="edit-member" data-member-id="${escapeAttr(member.uid)}">Editar</button>
      <button class="admin-btn" type="button" data-action="add-alt" data-member-id="${escapeAttr(member.uid)}">Agregar Alter</button>
    `;

    const deleteAction = `
      <button class="admin-btn admin-btn-danger" type="button" data-action="delete-member" data-member-id="${escapeAttr(member.uid)}">Eliminar</button>
    `;

    if (member.status === "active") {
      return `
        ${coreActions}
        <button class="admin-btn admin-btn-gold" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="excorp">Mover a EX-CORP</button>
        <button class="admin-btn admin-btn-danger" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="blacklist">Mover a Lista Negra</button>
        ${deleteAction}
      `;
    }

    if (member.status === "excorp") {
      return `
        ${coreActions}
        <button class="admin-btn admin-btn-primary" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="active">Reintegrar</button>
        <button class="admin-btn admin-btn-danger" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="blacklist">Mover a Lista Negra</button>
        ${deleteAction}
      `;
    }

    return `
      ${coreActions}
      <button class="admin-btn admin-btn-primary" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="active">Quitar de Lista Negra</button>
      <button class="admin-btn admin-btn-gold" type="button" data-action="move-member" data-member-id="${escapeAttr(member.uid)}" data-target-status="excorp">Mover a EX-CORP</button>
      ${deleteAction}
    `;
  }

  function handleViewAction(event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }

    const memberId = actionButton.dataset.memberId;
    const altId = actionButton.dataset.altId;

    switch (actionButton.dataset.action) {
      case "toggle":
        toggleMember(memberId);
        break;
      case "edit-member":
        openMemberModal("edit", memberId);
        break;
      case "delete-member":
        openDeleteMemberModal(memberId);
        break;
      case "add-alt":
        openAltModal("create", memberId);
        break;
      case "edit-alt":
        openAltModal("edit", memberId, altId);
        break;
      case "delete-alt":
        openDeleteAltModal(memberId, altId);
        break;
      case "move-member":
        openMoveMemberModal(memberId, actionButton.dataset.targetStatus);
        break;
      default:
        break;
    }
  }

  function toggleMember(memberId) {
    if (state.expandedMembers.has(memberId)) {
      state.expandedMembers.delete(memberId);
    } else {
      state.expandedMembers.add(memberId);
    }
    render();
  }

  function openMemberModal(mode, memberId) {
    const editing = mode === "edit";
    const member = editing ? findMember(memberId) : createBlankMember();

    if (!member) {
      showToast("No se encontro el registro.");
      return;
    }

    openModal({
      kicker: editing ? "Editar ficha" : "Nuevo registro",
      title: editing ? `Editar ${member.mainName || "miembro"}` : "Nuevo miembro",
      body: renderMemberForm(member),
      footer: `
        <button class="admin-btn admin-btn-quiet" type="button" data-modal-close>Cancelar</button>
        <button class="admin-btn admin-btn-primary" type="submit" form="adminMemberForm">${editing ? "Guardar cambios" : "Crear miembro"}</button>
      `
    });

    const form = main.querySelector("#adminMemberForm");
    const altList = main.querySelector("#adminAltEditorList");
    const addAltButton = main.querySelector("#adminAddAltEditorRow");

    addAltButton.addEventListener("click", () => {
      altList.insertAdjacentHTML("beforeend", renderAltEditorRow());
    });

    altList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-alt-row]");
      if (removeButton) {
        removeButton.closest("[data-alt-editor-row]").remove();
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = readMemberForm(form);
      const error = main.querySelector("#adminMemberFormError");

      if (!result.ok) {
        error.textContent = result.message;
        return;
      }

      if (editing) {
        Object.assign(member, result.value);
        addHistory(member, "Ficha editada", "Informacion principal y alters actualizados.");
        state.expandedMembers.add(member.uid);
        persistData();
        closeModal();
        render();
        return;
      }

      const newMember = {
        ...result.value,
        uid: createUid("member"),
        status: "active",
        history: [createHistory("Ficha creada", "Registro agregado como miembro activo.")]
      };

      state.members.unshift(newMember);
      state.expandedMembers.add(newMember.uid);
      persistData();
      closeModal();
      render();
    });
  }

  function renderMemberForm(member) {
    const altRows = member.alts.length ? member.alts.map(renderAltEditorRow).join("") : "";

    return `
      <form class="admin-modal-form" id="adminMemberForm" novalidate>
        <div class="admin-form-grid">
          <div class="admin-form-field">
            <label for="adminMainName">Nombre del MAIN</label>
            <input id="adminMainName" name="mainName" type="text" value="${escapeAttr(member.mainName)}" required>
          </div>
          <div class="admin-form-field">
            <label for="adminMainId">ID del MAIN</label>
            <input id="adminMainId" name="mainId" type="text" value="${escapeAttr(member.mainId)}" required>
          </div>
          <div class="admin-form-field">
            <label for="adminPhone">Numero telefonico</label>
            <input id="adminPhone" name="phone" type="tel" value="${escapeAttr(member.phone)}">
          </div>
          <div class="admin-form-field">
            <label for="adminDiscord">Discord</label>
            <input id="adminDiscord" name="discord" type="text" value="${escapeAttr(member.discord)}">
          </div>
          <div class="admin-form-field full">
            <label for="adminNotes">Notas</label>
            <textarea id="adminNotes" name="notes">${escapeHtml(member.notes)}</textarea>
          </div>
        </div>

        <section class="admin-modal-section">
          <div class="admin-subsection-header">
            <h4>Personajes ALT</h4>
            <button class="admin-btn admin-btn-small" type="button" id="adminAddAltEditorRow">Agregar alter</button>
          </div>
          <div class="admin-alt-editor-list" id="adminAltEditorList">${altRows}</div>
        </section>

        <p class="admin-form-error" id="adminMemberFormError" aria-live="polite"></p>
      </form>
    `;
  }

  function renderAltEditorRow(alt = createBlankAlt()) {
    return `
      <div class="admin-alt-editor-row" data-alt-editor-row data-alt-id="${escapeAttr(alt.uid || createUid("alt"))}">
        <div class="admin-form-field">
          <label>Nombre ALT</label>
          <input name="altName" type="text" value="${escapeAttr(alt.name || "")}">
        </div>
        <div class="admin-form-field">
          <label>ID ALT</label>
          <input name="altId" type="text" value="${escapeAttr(alt.characterId || "")}">
        </div>
        <button class="admin-btn admin-btn-danger admin-btn-small" type="button" data-remove-alt-row>Eliminar</button>
      </div>
    `;
  }

  function readMemberForm(form) {
    const formData = new FormData(form);
    const mainName = String(formData.get("mainName") || "").trim();
    const mainId = String(formData.get("mainId") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const discord = String(formData.get("discord") || "").trim();
    const notes = String(formData.get("notes") || "").trim();
    const alts = [];

    if (!mainName || !mainId) {
      return { ok: false, message: "Nombre e ID del MAIN son obligatorios." };
    }

    for (const row of form.querySelectorAll("[data-alt-editor-row]")) {
      const name = row.querySelector('[name="altName"]').value.trim();
      const characterId = row.querySelector('[name="altId"]').value.trim();

      if (!name && !characterId) {
        continue;
      }

      if (!name || !characterId) {
        return { ok: false, message: "Cada alter necesita nombre e ID." };
      }

      alts.push({
        uid: row.dataset.altId || createUid("alt"),
        name,
        characterId
      });
    }

    return {
      ok: true,
      value: {
        mainName,
        mainId,
        phone,
        discord,
        notes,
        alts
      }
    };
  }

  function openAltModal(mode, memberId, altId) {
    const member = findMember(memberId);
    const editing = mode === "edit";
    const alt = editing ? member?.alts.find((item) => item.uid === altId) : createBlankAlt();

    if (!member || !alt) {
      showToast("No se encontro el alter.");
      return;
    }

    openModal({
      kicker: editing ? "Editar alter" : "Agregar alter",
      title: editing ? `Alter de ${member.mainName}` : `Nuevo alter para ${member.mainName}`,
      body: `
        <form class="admin-modal-form" id="adminAltForm" novalidate>
          <div class="admin-form-grid">
            <div class="admin-form-field">
              <label for="adminAltName">Nombre</label>
              <input id="adminAltName" name="altName" type="text" value="${escapeAttr(alt.name || "")}" required>
            </div>
            <div class="admin-form-field">
              <label for="adminAltCharacterId">ID</label>
              <input id="adminAltCharacterId" name="altCharacterId" type="text" value="${escapeAttr(alt.characterId || "")}" required>
            </div>
          </div>
          <p class="admin-form-error" id="adminAltFormError" aria-live="polite"></p>
        </form>
      `,
      footer: `
        <button class="admin-btn admin-btn-quiet" type="button" data-modal-close>Cancelar</button>
        <button class="admin-btn admin-btn-primary" type="submit" form="adminAltForm">${editing ? "Guardar alter" : "Agregar alter"}</button>
      `
    });

    main.querySelector("#adminAltForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("altName") || "").trim();
      const characterId = String(formData.get("altCharacterId") || "").trim();
      const error = main.querySelector("#adminAltFormError");

      if (!name || !characterId) {
        error.textContent = "Nombre e ID del alter son obligatorios.";
        return;
      }

      if (editing) {
        alt.name = name;
        alt.characterId = characterId;
        addHistory(member, "Alter editado", `${name} actualizado.`);
      } else {
        member.alts.push({ uid: createUid("alt"), name, characterId });
        addHistory(member, "Alter agregado", `${name} agregado a la ficha.`);
      }

      state.expandedMembers.add(member.uid);
      persistData();
      closeModal();
      render();
    });
  }

  function openDeleteAltModal(memberId, altId) {
    const member = findMember(memberId);
    const alt = member?.alts.find((item) => item.uid === altId);

    if (!member || !alt) {
      showToast("No se encontro el alter.");
      return;
    }

    openConfirmModal({
      kicker: "Eliminar alter",
      title: alt.name,
      message: `Se eliminara el alter "${alt.name}" de la ficha de ${member.mainName}.`,
      confirmLabel: "Eliminar alter",
      confirmClass: "admin-btn-danger",
      onConfirm: () => {
        member.alts = member.alts.filter((item) => item.uid !== altId);
        addHistory(member, "Alter eliminado", `${alt.name} eliminado de la ficha.`);
        state.expandedMembers.add(member.uid);
        persistData();
        render();
      }
    });
  }

  function openDeleteMemberModal(memberId) {
    const member = findMember(memberId);
    if (!member) {
      showToast("No se encontro el registro.");
      return;
    }

    openConfirmModal({
      kicker: "Eliminar registro",
      title: member.mainName || "Registro sin nombre",
      message: "Esta accion eliminara la ficha completa del almacenamiento local.",
      confirmLabel: "Eliminar",
      confirmClass: "admin-btn-danger",
      onConfirm: () => {
        state.members = state.members.filter((item) => item.uid !== member.uid);
        state.expandedMembers.delete(member.uid);
        persistData();
        render();
      }
    });
  }

  function openMoveMemberModal(memberId, targetStatus) {
    const member = findMember(memberId);
    const target = STATUS_CONFIG[targetStatus];
    const current = member ? STATUS_CONFIG[member.status] : null;

    if (!member || !target || member.status === targetStatus) {
      showToast("Movimiento no disponible.");
      return;
    }

    const actionLabel = targetStatus === "active" ? "Reintegrar" : `Mover a ${target.title}`;

    openConfirmModal({
      kicker: "Movimiento de estado",
      title: member.mainName || "Registro sin nombre",
      message: `La ficha conservara informacion, alters, notas e historial. Destino: ${target.title}.`,
      confirmLabel: actionLabel,
      confirmClass: targetStatus === "blacklist" ? "admin-btn-danger" : "admin-btn-primary",
      onConfirm: () => {
        member.status = targetStatus;
        addHistory(member, actionLabel, `${current.title} -> ${target.title}.`);
        state.expandedMembers.add(member.uid);
        persistData();
        render();
      }
    });
  }

  function openConfirmModal({ kicker, title, message, confirmLabel, confirmClass = "admin-btn-primary", onConfirm }) {
    openModal({
      kicker,
      title,
      body: `<p class="admin-modal-copy">${escapeHtml(message)}</p>`,
      footer: `
        <button class="admin-btn admin-btn-quiet" type="button" data-modal-close>Cancelar</button>
        <button class="admin-btn ${escapeAttr(confirmClass)}" type="button" id="adminConfirmActionButton">${escapeHtml(confirmLabel)}</button>
      `
    });

    main.querySelector("#adminConfirmActionButton").addEventListener("click", () => {
      onConfirm();
      closeModal();
    });
  }

  function openModal({ kicker, title, body, footer }) {
    els.modalKicker.textContent = kicker;
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = body;
    els.modalFooter.innerHTML = footer;

    if (!els.modal.open) {
      els.modal.showModal();
    }

    requestAnimationFrame(() => {
      els.modal.classList.add("is-visible");
      const focusTarget = els.modalBody.querySelector("input, textarea, button") || els.modalFooter.querySelector("button");
      focusTarget?.focus();
    });
  }

  function closeModal() {
    els.modal.classList.remove("is-visible");
    window.setTimeout(() => {
      if (els.modal.open) {
        els.modal.close();
      }
    }, 150);
  }

  function exportBackup() {
    const payload = JSON.stringify(buildBackupPayload(), null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `eve-corp-respaldo-${date}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Respaldo JSON exportado.");
  }

  function handleImportFile(event) {
    const file = event.target.files[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const importedMembers = readMembersFromPayload(JSON.parse(String(reader.result)));
        openConfirmModal({
          kicker: "Importar respaldo",
          title: file.name,
          message: `Se reemplazaran los datos actuales por ${importedMembers.length} registros del respaldo seleccionado.`,
          confirmLabel: "Importar respaldo",
          confirmClass: "admin-btn-primary",
          onConfirm: () => {
            state.members = importedMembers;
            state.expandedMembers.clear();
            persistData();
            render();
          }
        });
      } catch (error) {
        console.error(error);
        showToast("El archivo JSON no tiene un formato valido.");
      }
    });
    reader.readAsText(file);
  }

  function readMembersFromPayload(payload) {
    const rawMembers = Array.isArray(payload) ? payload : payload?.members;

    if (!Array.isArray(rawMembers)) {
      throw new Error("Formato de respaldo invalido.");
    }

    return rawMembers.map(normalizeMember).filter(Boolean);
  }

  function normalizeMember(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const member = {
      uid: String(raw.uid || raw.recordId || createUid("member")),
      status: normalizeStatus(raw.status),
      mainName: stringFrom(raw.mainName, raw.name, raw.main, raw.nombreMain, raw.nombre),
      mainId: stringFrom(raw.mainId, raw.mainID, raw.characterId, raw.idMain, raw.id),
      phone: stringFrom(raw.phone, raw.telefono, raw.telephone, raw.number),
      discord: stringFrom(raw.discord, raw.discordUser),
      notes: stringFrom(raw.notes, raw.notas, raw.note),
      alts: Array.isArray(raw.alts) ? raw.alts.map(normalizeAlt).filter(Boolean) : [],
      history: Array.isArray(raw.history) ? raw.history.map(normalizeHistory).filter(Boolean) : []
    };

    if (!member.history.length) {
      member.history.push(createHistory("Registro importado", "Ficha normalizada en el sistema local."));
    }

    return member;
  }

  function normalizeAlt(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const name = stringFrom(raw.name, raw.altName, raw.nombre);
    const characterId = stringFrom(raw.characterId, raw.altId, raw.idAlt, raw.id);

    if (!name && !characterId) {
      return null;
    }

    return {
      uid: String(raw.uid || raw.recordId || createUid("alt")),
      name,
      characterId
    };
  }

  function normalizeHistory(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    return {
      uid: String(raw.uid || createUid("history")),
      at: stringFrom(raw.at, raw.date, raw.fecha) || new Date().toISOString(),
      action: stringFrom(raw.action, raw.accion, raw.title) || "Evento",
      detail: stringFrom(raw.detail, raw.detalle, raw.description)
    };
  }

  function normalizeStatus(value) {
    const normalized = normalizeText(value);
    if (normalized.includes("black") || normalized.includes("negra")) {
      return "blacklist";
    }
    if (normalized.includes("excorp") || normalized.includes("ex-corp") || normalized === "ex") {
      return "excorp";
    }
    return "active";
  }

  function getStats() {
    return state.members.reduce((stats, member) => {
      stats.main += 1;
      stats.alts += member.alts.length;
      stats[member.status] += 1;
      return stats;
    }, {
      active: 0,
      excorp: 0,
      blacklist: 0,
      main: 0,
      alts: 0
    });
  }

  function getFilteredMembers(status) {
    const term = normalizeText(state.searchTerm);

    return state.members
      .filter((member) => !status || member.status === status)
      .filter((member) => !term || memberMatches(member, term))
      .sort((a, b) => a.mainName.localeCompare(b.mainName, "es", { sensitivity: "base" }));
  }

  function memberMatches(member, term) {
    const fields = [
      member.mainName,
      member.mainId,
      member.phone,
      member.discord,
      member.notes,
      STATUS_CONFIG[member.status]?.title,
      ...member.alts.flatMap((alt) => [alt.name, alt.characterId]),
      ...member.history.flatMap((item) => [item.action, item.detail])
    ];

    return normalizeText(fields.join(" ")).includes(term);
  }

  function findMember(memberId) {
    return state.members.find((member) => member.uid === memberId);
  }

  function createBlankMember() {
    return {
      uid: "",
      status: "active",
      mainName: "",
      mainId: "",
      phone: "",
      discord: "",
      notes: "",
      alts: [],
      history: []
    };
  }

  function createBlankAlt() {
    return {
      uid: createUid("alt"),
      name: "",
      characterId: ""
    };
  }

  function addHistory(member, action, detail) {
    member.history = Array.isArray(member.history) ? member.history : [];
    member.history.push(createHistory(action, detail));
  }

  function createHistory(action, detail) {
    return {
      uid: createUid("history"),
      at: new Date().toISOString(),
      action,
      detail
    };
  }

  function createUid(prefix) {
    if (window.crypto?.randomUUID) {
      return `${prefix}-${window.crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
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

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "Fecha no disponible";
    }
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
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

  function showToast(message) {
    const toast = document.createElement("div");
    toast.className = "admin-toast";
    toast.textContent = message;
    els.toastStack.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }
}

function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  } catch {
    return false;
  }
}
