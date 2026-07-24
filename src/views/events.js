import { isSupabaseConfigured, loadEventsState, saveEventsState } from "../services/supabaseStore.js";

const STORAGE_KEY = "sc2.communityEvents.v1";
const ADMIN_AUTH_KEY = "sc2.admin.unlocked";

const CATEGORIES = [
  {
    id: "mining",
    label: "Minería e Industria",
    shortLabel: "Industria",
    tag: "MIN",
    emptyTitle: "Sin eventos industriales",
    emptyCopy: "Crea una operación de minería, producción o logística para registrar asistencia."
  },
  {
    id: "pve",
    label: "PvE",
    shortLabel: "PvE",
    tag: "PVE",
    emptyTitle: "Sin eventos PvE",
    emptyCopy: "Registra misiones, anomalías, incursiones y salidas coordinadas."
  },
  {
    id: "pvp",
    label: "PvP",
    shortLabel: "PvP",
    tag: "PVP",
    emptyTitle: "Sin eventos PvP",
    emptyCopy: "Crea flotas, defensas, roams o CTA para medir participación real."
  }
];

const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((category) => [category.id, category]));

export function renderEvents() {
  return `
    <section class="events-page" aria-label="Gestor de eventos de comunidad">
      <header class="events-command-center">
        <div class="events-command-copy">
          <span class="events-kicker">Control de operaciones</span>
          <h1>Gestor de eventos SC2</h1>
          <p>Administra eventos de Minería e Industria, PvE y PvP con historial automático por miembro.</p>
        </div>

        <div class="events-command-actions">
          <span class="events-sync-status" data-events-sync-status>Conectando BD</span>
          <a class="events-btn" href="#/admin" data-events-admin-link>Desbloquear Admin</a>
          <button class="events-btn events-btn-primary" type="button" data-events-action="create-event" data-events-editor-control>Nuevo evento</button>
          <button class="events-btn" type="button" data-events-action="create-member" data-events-editor-control>Nuevo miembro</button>
        </div>
      </header>

      <section class="events-stat-rail" id="eventsStatsRail" aria-label="Resumen de participaciones"></section>

      <section class="events-workspace" aria-label="Eventos por categoría">
        <aside class="events-category-panel" id="eventsCategoryNav" aria-label="Apartados de eventos"></aside>

        <section class="events-board" aria-labelledby="eventsCategoryTitle">
          <header class="events-board-header">
            <div>
              <span class="events-kicker" id="eventsCategoryMeta">Eventos</span>
              <h2 id="eventsCategoryTitle">Minería e Industria</h2>
            </div>

            <div class="events-toolbar">
              <label class="events-search" for="eventsSearchInput">
                <span>Buscar</span>
                <input id="eventsSearchInput" type="search" autocomplete="off" placeholder="Evento, descripción o miembro">
              </label>
              <button class="events-btn events-btn-primary" type="button" data-events-action="create-event" data-events-editor-control>Crear</button>
            </div>
          </header>

          <div class="events-list" id="eventsListMount" aria-live="polite"></div>
        </section>
      </section>

      <section class="events-members" aria-labelledby="eventsMembersTitle">
        <header class="events-members-header">
          <div>
            <span class="events-kicker">Perfiles de miembros</span>
            <h2 id="eventsMembersTitle">Historial acumulativo</h2>
          </div>

          <label class="events-search" for="eventsMemberSearchInput">
            <span>Buscar</span>
            <input id="eventsMemberSearchInput" type="search" autocomplete="off" placeholder="Nombre o evento">
          </label>
        </header>

        <div class="events-member-list" id="eventsMembersMount" aria-live="polite"></div>
      </section>

      <dialog class="events-modal" id="eventsModal" aria-labelledby="eventsModalTitle">
        <div class="events-modal-shell" role="document">
          <header class="events-modal-header">
            <div>
              <span class="events-modal-kicker" id="eventsModalKicker">Operación</span>
              <h3 id="eventsModalTitle">Modal</h3>
            </div>
            <button class="events-modal-close" type="button" data-events-modal-close aria-label="Cerrar">x</button>
          </header>
          <div class="events-modal-body" id="eventsModalBody"></div>
          <footer class="events-modal-footer" id="eventsModalFooter"></footer>
        </div>
      </dialog>

      <div class="events-toast-stack" id="eventsToastStack" aria-live="polite" aria-atomic="true"></div>
    </section>
  `;
}

export function initEvents({ main, anchor }) {
  const controller = new AbortController();
  const { signal } = controller;
  let activeModalCleanup = null;

  const state = {
    members: [],
    events: [],
    participations: [],
    activeCategory: CATEGORY_BY_ID[anchor] ? anchor : "mining",
    eventSearchTerm: "",
    memberSearchTerm: "",
    expandedMembers: new Set(),
    isAdmin: isAdminUnlocked(),
    syncStatus: isSupabaseConfigured() ? "connecting" : "local",
    syncMessage: isSupabaseConfigured() ? "Conectando BD" : "LocalStorage"
  };

  const els = {
    adminLink: main.querySelector("[data-events-admin-link]"),
    editorControls: Array.from(main.querySelectorAll("[data-events-editor-control]")),
    syncStatus: main.querySelector("[data-events-sync-status]"),
    statsRail: main.querySelector("#eventsStatsRail"),
    categoryNav: main.querySelector("#eventsCategoryNav"),
    categoryTitle: main.querySelector("#eventsCategoryTitle"),
    categoryMeta: main.querySelector("#eventsCategoryMeta"),
    eventsSearchInput: main.querySelector("#eventsSearchInput"),
    memberSearchInput: main.querySelector("#eventsMemberSearchInput"),
    eventsListMount: main.querySelector("#eventsListMount"),
    membersMount: main.querySelector("#eventsMembersMount"),
    modal: main.querySelector("#eventsModal"),
    modalKicker: main.querySelector("#eventsModalKicker"),
    modalTitle: main.querySelector("#eventsModalTitle"),
    modalBody: main.querySelector("#eventsModalBody"),
    modalFooter: main.querySelector("#eventsModalFooter"),
    toastStack: main.querySelector("#eventsToastStack")
  };

  bindEvents();
  render();
  void loadData();

  return () => {
    activeModalCleanup?.();
    controller.abort();
    if (els.modal.open) {
      els.modal.close();
    }
  };

  function bindEvents() {
    main.addEventListener("click", handlePageAction, { signal });

    els.eventsSearchInput.addEventListener("input", (event) => {
      state.eventSearchTerm = event.target.value.trim();
      renderEventsList();
    }, { signal });

    els.memberSearchInput.addEventListener("input", (event) => {
      state.memberSearchTerm = event.target.value.trim();
      renderMembers();
    }, { signal });

    els.modal.addEventListener("click", (event) => {
      if (event.target === els.modal || event.target.closest("[data-events-modal-close]")) {
        closeModal();
      }
    }, { signal });

    els.modal.addEventListener("close", () => {
      els.modal.classList.remove("is-visible");
      activeModalCleanup?.();
      activeModalCleanup = null;
    }, { signal });
  }

  function handlePageAction(event) {
    const button = event.target.closest("[data-events-action]");
    if (!button) {
      return;
    }

    const action = button.dataset.eventsAction;
    const eventId = button.dataset.eventId;
    const memberId = button.dataset.memberId;
    const categoryId = button.dataset.categoryId;

    if (requiresEditorPermission(action) && !ensureCanEdit()) {
      return;
    }

    switch (action) {
      case "select-category":
        selectCategory(categoryId);
        break;
      case "create-event":
        openEventModal("create");
        break;
      case "edit-event":
        openEventModal("edit", eventId);
        break;
      case "show-event":
        openEventDetails(eventId);
        break;
      case "delete-event":
        openDeleteEventModal(eventId);
        break;
      case "create-member":
        openMemberModal("create");
        break;
      case "edit-member":
        openMemberModal("edit", memberId);
        break;
      case "toggle-member":
        toggleMember(memberId);
        break;
      default:
        break;
    }
  }

  function requiresEditorPermission(action) {
    return [
      "create-event",
      "edit-event",
      "delete-event",
      "create-member",
      "edit-member"
    ].includes(action);
  }

  function ensureCanEdit() {
    state.isAdmin = isAdminUnlocked();

    if (state.isAdmin) {
      return true;
    }

    showToast("Entra al panel Admin para gestionar eventos.");
    updateEditorControls();
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
      showToast("No se pudo leer el respaldo local.");
    }

    if (!isSupabaseConfigured()) {
      setSyncStatus("local", "LocalStorage");
      return;
    }

    setSyncStatus("connecting", "Conectando BD");

    try {
      const remotePayload = await loadEventsState();

      if (remotePayload) {
        applyPayload(remotePayload);
        persistLocalPayload(buildBackupPayload());
        setSyncStatus("online", "Online / Supabase");
        render();
        return;
      }

      if (state.events.length || state.members.length) {
        await saveEventsState(buildBackupPayload());
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
        showToast("Datos guardados localmente.");
      }
    } catch (error) {
      console.error(error);
      showToast("El navegador no permitio guardar en LocalStorage.");
    }

    if (!isSupabaseConfigured()) {
      setSyncStatus("local", "LocalStorage");
      return;
    }

    setSyncStatus("syncing", "Sincronizando");
    saveEventsState(payload)
      .then(() => {
        setSyncStatus("online", "Online / Supabase");
        if (showSavedToast) {
          showToast("Datos sincronizados en Supabase.");
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
    const normalized = normalizePayload(payload);
    state.members = normalized.members;
    state.events = normalized.events;
    state.participations = normalized.participations;
    removeOrphanParticipations();
  }

  function buildBackupPayload() {
    return {
      app: "SC2 Community Event Manager",
      version: 2,
      exportedAt: new Date().toISOString(),
      members: state.members,
      events: state.events,
      participations: state.participations
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
    updateSyncStatus();
    updateEditorControls();
    renderStats();
    renderCategoryNav();
    renderEventsList();
    renderMembers();
  }

  function updateEditorControls() {
    els.editorControls.forEach((control) => {
      control.hidden = !state.isAdmin;
    });

    if (els.adminLink) {
      els.adminLink.hidden = state.isAdmin;
    }
  }

  function renderStats() {
    const stats = getGlobalStats();
    const lastParticipation = getLastParticipation();
    const cards = [
      ["Eventos", state.events.length, "Operaciones registradas"],
      ["Participaciones", stats.totalParticipations, "Total general"],
      ["Miembros", state.members.length, "Perfiles disponibles"],
      ["Última participación", lastParticipation ? formatDate(lastParticipation.eventStartsAt) : "N/A", lastParticipation ? getMemberName(lastParticipation.memberId) : "Sin actividad"]
    ];

    els.statsRail.innerHTML = cards.map(([label, value, detail]) => `
      <article class="events-stat-card">
        <span class="events-stat-label">${escapeHtml(label)}</span>
        <strong class="events-stat-value">${escapeHtml(value)}</strong>
        <p>${escapeHtml(detail)}</p>
      </article>
    `).join("");
  }

  function renderCategoryNav() {
    const stats = getGlobalStats();

    els.categoryNav.innerHTML = CATEGORIES.map((category) => {
      const categoryStats = stats.categories[category.id];
      return `
        <button
          class="events-category-button ${category.id === state.activeCategory ? "is-active" : ""}"
          type="button"
          data-events-action="select-category"
          data-category-id="${escapeAttr(category.id)}"
          aria-pressed="${category.id === state.activeCategory}"
        >
          <span class="events-category-tag">${escapeHtml(category.tag)}</span>
          <span class="events-category-copy">
            <strong>${escapeHtml(category.label)}</strong>
            <span>${categoryStats.events} eventos / ${categoryStats.participations} participaciones</span>
          </span>
        </button>
      `;
    }).join("");
  }

  function renderEventsList() {
    const category = getActiveCategory();
    const events = getVisibleEvents();
    const categoryStats = getGlobalStats().categories[category.id];

    els.categoryTitle.textContent = category.label;
    els.categoryMeta.textContent = `${categoryStats.events} eventos / ${categoryStats.participations} participaciones`;

    if (!events.length) {
      els.eventsListMount.innerHTML = renderEmptyState({
        title: category.emptyTitle,
        copy: state.eventSearchTerm
          ? "No hay coincidencias con la búsqueda actual."
          : state.isAdmin
            ? category.emptyCopy
            : "Entra al panel Admin para crear y gestionar eventos.",
        action: state.isAdmin ? "create-event" : "",
        label: "Crear evento"
      });
      return;
    }

    els.eventsListMount.innerHTML = events.map(renderEventCard).join("");
  }

  function renderEventCard(record) {
    const category = CATEGORY_BY_ID[record.category] || getActiveCategory();
    const participants = record.participantIds.map(getMemberName).filter(Boolean);
    const previewNames = participants.slice(0, 4).join(", ");
    const extraCount = Math.max(0, participants.length - 4);

    return `
      <article class="events-event-card">
        <div class="events-event-main">
          <div class="events-event-heading">
            <span class="events-event-tag">${escapeHtml(category.tag)}</span>
            <div>
              <h3>${escapeHtml(record.name)}</h3>
              <time datetime="${escapeAttr(record.startsAt)}">${escapeHtml(formatDate(record.startsAt))}</time>
            </div>
          </div>
          <p>${escapeHtml(record.description || "Sin descripción.")}</p>
          <div class="events-participant-preview">
            <span>${record.participantIds.length} participantes</span>
            <strong>${escapeHtml(previewNames || "Aún sin miembros")}${extraCount ? ` +${extraCount}` : ""}</strong>
          </div>
        </div>

        <div class="events-event-actions" aria-label="Acciones del evento">
          <button class="events-btn events-btn-small" type="button" data-events-action="show-event" data-event-id="${escapeAttr(record.uid)}">Detalles</button>
          ${state.isAdmin ? `
            <button class="events-btn events-btn-small" type="button" data-events-action="edit-event" data-event-id="${escapeAttr(record.uid)}">Editar</button>
            <button class="events-btn events-btn-danger events-btn-small" type="button" data-events-action="delete-event" data-event-id="${escapeAttr(record.uid)}">Eliminar</button>
          ` : ""}
        </div>
      </article>
    `;
  }

  function renderMembers() {
    const members = getVisibleMembers();

    if (!members.length) {
      els.membersMount.innerHTML = renderEmptyState({
        title: state.memberSearchTerm ? "Sin coincidencias" : "Sin miembros registrados",
        copy: state.memberSearchTerm
          ? "Prueba con otro nombre o evento."
          : state.isAdmin
            ? "Crea miembros desde un evento o desde el botón Nuevo miembro."
            : "Entra al panel Admin para crear miembros y registrar asistencia.",
        action: state.isAdmin ? "create-member" : "",
        label: "Nuevo miembro"
      });
      return;
    }

    els.membersMount.innerHTML = members.map(renderMemberProfile).join("");
  }

  function renderMemberProfile(member) {
    const stats = getMemberStats(member.uid);
    const history = getMemberHistory(member.uid);
    const isOpen = state.expandedMembers.has(member.uid);
    const last = history[0];

    return `
      <article class="events-member-card ${isOpen ? "is-open" : ""}">
        <div class="events-member-summary">
          <div>
            <span class="events-kicker">Miembro</span>
            <h3>${escapeHtml(member.name)}</h3>
            <p>Última participación: ${last ? escapeHtml(formatDate(last.eventStartsAt)) : "N/A"}</p>
          </div>

          <div class="events-member-stats" aria-label="Participaciones de ${escapeAttr(member.name)}">
            ${renderMemberStat("Total", stats.total)}
            ${renderMemberStat("Minería", stats.mining)}
            ${renderMemberStat("PvE", stats.pve)}
            ${renderMemberStat("PvP", stats.pvp)}
          </div>
        </div>

        <div class="events-member-actions">
          <button class="events-btn events-btn-small" type="button" data-events-action="toggle-member" data-member-id="${escapeAttr(member.uid)}">
            ${isOpen ? "Ocultar historial" : "Ver historial"}
          </button>
          ${state.isAdmin ? `<button class="events-btn events-btn-small" type="button" data-events-action="edit-member" data-member-id="${escapeAttr(member.uid)}">Editar</button>` : ""}
        </div>

        ${isOpen ? renderMemberHistory(history) : ""}
      </article>
    `;
  }

  function renderMemberStat(label, value) {
    return `
      <span class="events-member-stat">
        <strong>${value}</strong>
        <span>${escapeHtml(label)}</span>
      </span>
    `;
  }

  function renderMemberHistory(history) {
    if (!history.length) {
      return `
        <div class="events-member-history">
          <p class="events-muted">Este miembro todavía no tiene participaciones.</p>
        </div>
      `;
    }

    return `
      <div class="events-member-history">
        <h4>Historial de eventos</h4>
        <ul>
          ${history.map((item) => `
            <li>
              <span class="events-history-tag">${escapeHtml(CATEGORY_BY_ID[item.category]?.tag || "EVT")}</span>
              <span>
                <strong>${escapeHtml(item.eventName)}</strong>
                <time datetime="${escapeAttr(item.eventStartsAt)}">${escapeHtml(formatDate(item.eventStartsAt))}</time>
              </span>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  function renderEmptyState({ title, copy, action, label }) {
    return `
      <div class="events-empty-state">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(copy)}</p>
          ${action ? `<button class="events-btn events-btn-primary" type="button" data-events-action="${escapeAttr(action)}">${escapeHtml(label)}</button>` : ""}
        </div>
      </div>
    `;
  }

  function selectCategory(categoryId) {
    if (!CATEGORY_BY_ID[categoryId] || state.activeCategory === categoryId) {
      return;
    }

    state.activeCategory = categoryId;
    renderCategoryNav();
    renderEventsList();
  }

  function openEventModal(mode, eventId) {
    if (!ensureCanEdit()) {
      return;
    }

    const editing = mode === "edit";
    const eventRecord = editing ? findEvent(eventId) : createBlankEvent();

    if (!eventRecord) {
      showToast("No se encontró el evento.");
      return;
    }

    const selectedParticipantIds = new Set(eventRecord.participantIds || []);
    const modalController = new AbortController();
    const modalSignal = modalController.signal;

    openModal({
      kicker: editing ? "Editar evento" : getActiveCategory().label,
      title: editing ? eventRecord.name : "Nuevo evento",
      body: renderEventForm(eventRecord),
      footer: `
        <button class="events-btn" type="button" data-events-modal-close>Cancelar</button>
        <button class="events-btn events-btn-primary" type="submit" form="eventsEventForm">${editing ? "Guardar cambios" : "Crear evento"}</button>
      `
    });

    activeModalCleanup = () => modalController.abort();

    const form = main.querySelector("#eventsEventForm");
    const participantTools = main.querySelector("#eventsParticipantTools");
    const participantList = main.querySelector("#eventsParticipantList");

    renderParticipantEditor();

    participantTools.addEventListener("click", (event) => {
      const addExistingButton = event.target.closest("[data-add-existing-member]");
      const createMemberButton = event.target.closest("[data-create-inline-member]");

      if (addExistingButton) {
        const select = main.querySelector("#eventsExistingMemberSelect");
        const memberId = select.value;
        if (!memberId) {
          showToast("Selecciona un miembro.");
          return;
        }
        selectedParticipantIds.add(memberId);
        renderParticipantEditor();
      }

      if (createMemberButton) {
        const input = main.querySelector("#eventsInlineMemberName");
        const name = input.value.trim();
        if (!name) {
          showToast("Escribe el nombre del miembro.");
          return;
        }

        const existing = findMemberByName(name);
        const member = existing || createMember(name);
        selectedParticipantIds.add(member.uid);
        input.value = "";
        renderParticipantEditor();

        if (!existing) {
          persistData(false);
          renderStats();
          renderMembers();
        }
      }
    }, { signal: modalSignal });

    participantList.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-remove-participant]");
      if (!removeButton) {
        return;
      }

      selectedParticipantIds.delete(removeButton.dataset.memberId);
      renderParticipantEditor();
    }, { signal: modalSignal });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = readEventForm(form, selectedParticipantIds);
      const error = main.querySelector("#eventsEventFormError");

      if (!result.ok) {
        error.textContent = result.message;
        return;
      }

      if (editing) {
        Object.assign(eventRecord, result.value, { updatedAt: new Date().toISOString() });
        syncEventParticipations(eventRecord);
        persistData();
        closeModal();
        render();
        return;
      }

      const newEvent = {
        ...result.value,
        uid: createUid("event"),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      state.events.unshift(newEvent);
      syncEventParticipations(newEvent);
      persistData();
      closeModal();
      render();
    }, { signal: modalSignal });

    function renderParticipantEditor() {
      const selectedMembers = getMembersByIds([...selectedParticipantIds]);
      const availableMembers = getSortedMembers().filter((member) => !selectedParticipantIds.has(member.uid));

      participantTools.innerHTML = `
        <div class="events-participant-tools">
          <div class="events-form-field">
            <label for="eventsExistingMemberSelect">Lista de miembros</label>
            <div class="events-inline-control">
              <select id="eventsExistingMemberSelect">
                <option value="">Selecciona un miembro</option>
                ${availableMembers.map((member) => `<option value="${escapeAttr(member.uid)}">${escapeHtml(member.name)}</option>`).join("")}
              </select>
              <button class="events-btn events-btn-small" type="button" data-add-existing-member>Agregar</button>
            </div>
          </div>

          <div class="events-form-field">
            <label for="eventsInlineMemberName">Crear miembro</label>
            <div class="events-inline-control">
              <input id="eventsInlineMemberName" type="text" autocomplete="off" placeholder="Nombre del nuevo miembro">
              <button class="events-btn events-btn-small" type="button" data-create-inline-member>Crear</button>
            </div>
          </div>
        </div>
      `;

      participantList.innerHTML = selectedMembers.length ? selectedMembers.map((member) => `
        <div class="events-participant-row">
          <strong>${escapeHtml(member.name)}</strong>
          <button class="events-btn events-btn-danger events-btn-small" type="button" data-remove-participant data-member-id="${escapeAttr(member.uid)}">Quitar</button>
        </div>
      `).join("") : `
        <div class="events-participant-empty">Sin participantes seleccionados.</div>
      `;
    }
  }

  function renderEventForm(record) {
    const category = CATEGORY_BY_ID[record.category] || getActiveCategory();

    return `
      <form class="events-modal-form" id="eventsEventForm" data-category="${escapeAttr(record.category || getActiveCategory().id)}" novalidate>
        <div class="events-form-grid">
          <div class="events-form-field">
            <label for="eventsEventName">Nombre del evento</label>
            <input id="eventsEventName" name="name" type="text" value="${escapeAttr(record.name)}" required>
          </div>
          <div class="events-form-field">
            <label for="eventsEventStartsAt">Fecha y hora</label>
            <input id="eventsEventStartsAt" name="startsAt" type="datetime-local" value="${escapeAttr(formatDateForInput(record.startsAt))}" required>
          </div>
          <div class="events-form-field">
            <label>Categoría</label>
            <input type="text" value="${escapeAttr(category.label)}" disabled>
          </div>
          <div class="events-form-field full">
            <label for="eventsEventDescription">Descripción</label>
            <textarea id="eventsEventDescription" name="description">${escapeHtml(record.description)}</textarea>
          </div>
        </div>

        <section class="events-modal-section">
          <div class="events-modal-section-heading">
            <h4>Participantes</h4>
            <span>Se registra una participación por cada miembro agregado.</span>
          </div>
          <div id="eventsParticipantTools"></div>
          <div class="events-participant-list" id="eventsParticipantList"></div>
        </section>

        <p class="events-form-error" id="eventsEventFormError" aria-live="polite"></p>
      </form>
    `;
  }

  function readEventForm(form, selectedParticipantIds) {
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const startsAtInput = String(formData.get("startsAt") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const startsAt = parseDateTimeLocal(startsAtInput);

    if (!name) {
      return { ok: false, message: "El nombre del evento es obligatorio." };
    }

    if (!startsAt) {
      return { ok: false, message: "La fecha y hora son obligatorias." };
    }

    return {
      ok: true,
      value: {
        category: form.dataset.category || getActiveCategory().id,
        name,
        startsAt,
        description,
        participantIds: [...selectedParticipantIds]
      }
    };
  }

  function openEventDetails(eventId) {
    const record = findEvent(eventId);
    if (!record) {
      showToast("No se encontró el evento.");
      return;
    }

    const category = CATEGORY_BY_ID[record.category] || getActiveCategory();
    const participants = getMembersByIds(record.participantIds);

    openModal({
      kicker: category.label,
      title: record.name,
      body: `
        <div class="events-detail-grid">
          <div class="events-detail-block">
            <span>Fecha</span>
            <strong>${escapeHtml(formatDate(record.startsAt))}</strong>
          </div>
          <div class="events-detail-block">
            <span>Participantes</span>
            <strong>${participants.length}</strong>
          </div>
          <div class="events-detail-block full">
            <span>Descripción</span>
            <p>${escapeHtml(record.description || "Sin descripción.")}</p>
          </div>
        </div>

        <section class="events-modal-section">
          <div class="events-modal-section-heading">
            <h4>Lista completa de participantes</h4>
          </div>
          ${participants.length ? `
            <ul class="events-detail-participants">
              ${participants.map((member) => `<li>${escapeHtml(member.name)}</li>`).join("")}
            </ul>
          ` : `<p class="events-muted">Este evento no tiene participantes.</p>`}
        </section>
      `,
      footer: `
        <button class="events-btn" type="button" data-events-modal-close>Cerrar</button>
        ${state.isAdmin ? `<button class="events-btn events-btn-primary" type="button" id="eventsDetailEditButton">Editar</button>` : ""}
      `
    });

    const modalController = new AbortController();
    activeModalCleanup = () => modalController.abort();
    main.querySelector("#eventsDetailEditButton")?.addEventListener("click", () => {
      if (!ensureCanEdit()) {
        return;
      }

      openEventModal("edit", record.uid);
    }, { signal: modalController.signal });
  }

  function openDeleteEventModal(eventId) {
    if (!ensureCanEdit()) {
      return;
    }

    const record = findEvent(eventId);
    if (!record) {
      showToast("No se encontró el evento.");
      return;
    }

    openConfirmModal({
      kicker: "Eliminar evento",
      title: record.name,
      message: "Se eliminará el evento y todas sus participaciones asociadas.",
      confirmLabel: "Eliminar",
      confirmClass: "events-btn-danger",
      onConfirm: () => {
        state.events = state.events.filter((item) => item.uid !== record.uid);
        state.participations = state.participations.filter((item) => item.eventId !== record.uid);
        persistData();
        render();
      }
    });
  }

  function openMemberModal(mode, memberId) {
    if (!ensureCanEdit()) {
      return;
    }

    const editing = mode === "edit";
    const member = editing ? findMember(memberId) : createBlankMember();

    if (!member) {
      showToast("No se encontró el miembro.");
      return;
    }

    openModal({
      kicker: editing ? "Editar miembro" : "Nuevo miembro",
      title: editing ? member.name : "Crear miembro",
      body: `
        <form class="events-modal-form" id="eventsMemberForm" novalidate>
          <div class="events-form-field">
            <label for="eventsMemberName">Nombre</label>
            <input id="eventsMemberName" name="name" type="text" value="${escapeAttr(member.name)}" required>
          </div>
          <p class="events-form-error" id="eventsMemberFormError" aria-live="polite"></p>
        </form>
      `,
      footer: `
        <button class="events-btn" type="button" data-events-modal-close>Cancelar</button>
        <button class="events-btn events-btn-primary" type="submit" form="eventsMemberForm">${editing ? "Guardar cambios" : "Crear miembro"}</button>
      `
    });

    const modalController = new AbortController();
    activeModalCleanup = () => modalController.abort();

    main.querySelector("#eventsMemberForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get("name") || "").trim();
      const error = main.querySelector("#eventsMemberFormError");

      if (!name) {
        error.textContent = "El nombre del miembro es obligatorio.";
        return;
      }

      const duplicate = findMemberByName(name);
      if (duplicate && duplicate.uid !== member.uid) {
        error.textContent = "Ya existe un miembro con ese nombre.";
        return;
      }

      if (editing) {
        member.name = name;
        member.updatedAt = new Date().toISOString();
      } else {
        createMember(name);
      }

      persistData();
      closeModal();
      render();
    }, { signal: modalController.signal });
  }

  function openConfirmModal({ kicker, title, message, confirmLabel, confirmClass = "events-btn-primary", onConfirm }) {
    openModal({
      kicker,
      title,
      body: `<p class="events-modal-copy">${escapeHtml(message)}</p>`,
      footer: `
        <button class="events-btn" type="button" data-events-modal-close>Cancelar</button>
        <button class="events-btn ${escapeAttr(confirmClass)}" type="button" id="eventsConfirmActionButton">${escapeHtml(confirmLabel)}</button>
      `
    });

    const modalController = new AbortController();
    activeModalCleanup = () => modalController.abort();
    main.querySelector("#eventsConfirmActionButton").addEventListener("click", () => {
      onConfirm();
      closeModal();
    }, { signal: modalController.signal });
  }

  function openModal({ kicker, title, body, footer }) {
    activeModalCleanup?.();
    activeModalCleanup = null;

    els.modalKicker.textContent = kicker;
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = body;
    els.modalFooter.innerHTML = footer;

    if (!els.modal.open) {
      els.modal.showModal();
    }

    requestAnimationFrame(() => {
      els.modal.classList.add("is-visible");
      const focusTarget = els.modalBody.querySelector("input, textarea, select, button") || els.modalFooter.querySelector("button");
      focusTarget?.focus();
    });
  }

  function closeModal() {
    activeModalCleanup?.();
    activeModalCleanup = null;
    els.modal.classList.remove("is-visible");
    window.setTimeout(() => {
      if (els.modal.open) {
        els.modal.close();
      }
    }, 150);
  }

  function toggleMember(memberId) {
    if (state.expandedMembers.has(memberId)) {
      state.expandedMembers.delete(memberId);
    } else {
      state.expandedMembers.add(memberId);
    }
    renderMembers();
  }

  function syncEventParticipations(record) {
    const previousByMember = new Map(
      state.participations
        .filter((item) => item.eventId === record.uid)
        .map((item) => [item.memberId, item])
    );

    state.participations = state.participations.filter((item) => item.eventId !== record.uid);

    for (const memberId of uniqueIds(record.participantIds)) {
      if (!findMember(memberId)) {
        continue;
      }

      const previous = previousByMember.get(memberId);
      state.participations.push({
        uid: previous?.uid || createUid("participation"),
        memberId,
        eventId: record.uid,
        category: record.category,
        eventName: record.name,
        eventStartsAt: record.startsAt,
        recordedAt: previous?.recordedAt || new Date().toISOString()
      });
    }

    record.participantIds = uniqueIds(record.participantIds).filter((memberId) => findMember(memberId));
  }

  function removeOrphanParticipations() {
    const memberIds = new Set(state.members.map((member) => member.uid));
    const eventIds = new Set(state.events.map((record) => record.uid));
    state.participations = state.participations.filter((item) => memberIds.has(item.memberId) && eventIds.has(item.eventId));

    for (const record of state.events) {
      record.participantIds = uniqueIds(record.participantIds).filter((memberId) => memberIds.has(memberId));
    }
  }

  function createMember(name) {
    const member = {
      uid: createUid("member"),
      name: String(name || "").trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    state.members.unshift(member);
    return member;
  }

  function createBlankMember() {
    return {
      uid: "",
      name: "",
      createdAt: "",
      updatedAt: ""
    };
  }

  function createBlankEvent() {
    return {
      uid: "",
      category: getActiveCategory().id,
      name: "",
      startsAt: "",
      description: "",
      participantIds: [],
      createdAt: "",
      updatedAt: ""
    };
  }

  function getActiveCategory() {
    return CATEGORY_BY_ID[state.activeCategory] || CATEGORIES[0];
  }

  function getGlobalStats() {
    const categories = Object.fromEntries(CATEGORIES.map((category) => [
      category.id,
      { events: 0, participations: 0 }
    ]));

    for (const record of state.events) {
      const category = CATEGORY_BY_ID[record.category] ? record.category : "mining";
      categories[category].events += 1;
    }

    for (const participation of state.participations) {
      const category = CATEGORY_BY_ID[participation.category] ? participation.category : "mining";
      categories[category].participations += 1;
    }

    return {
      totalParticipations: state.participations.length,
      categories
    };
  }

  function getMemberStats(memberId) {
    const stats = { total: 0, mining: 0, pve: 0, pvp: 0 };

    for (const participation of state.participations) {
      if (participation.memberId !== memberId) {
        continue;
      }

      stats.total += 1;
      if (stats[participation.category] !== undefined) {
        stats[participation.category] += 1;
      }
    }

    return stats;
  }

  function getMemberHistory(memberId) {
    return state.participations
      .filter((item) => item.memberId === memberId)
      .map((item) => {
        const record = findEvent(item.eventId);
        return {
          ...item,
          eventName: record?.name || item.eventName || "Evento eliminado",
          eventStartsAt: record?.startsAt || item.eventStartsAt,
          category: record?.category || item.category
        };
      })
      .sort((a, b) => new Date(b.eventStartsAt) - new Date(a.eventStartsAt));
  }

  function getLastParticipation() {
    return [...state.participations].sort((a, b) => new Date(b.eventStartsAt) - new Date(a.eventStartsAt))[0] || null;
  }

  function getVisibleEvents() {
    const term = normalizeText(state.eventSearchTerm);

    return state.events
      .filter((record) => record.category === state.activeCategory)
      .filter((record) => !term || eventMatches(record, term))
      .sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
  }

  function getVisibleMembers() {
    const term = normalizeText(state.memberSearchTerm);

    return getSortedMembers()
      .filter((member) => !term || memberMatches(member, term))
      .sort((a, b) => {
        const byTotal = getMemberStats(b.uid).total - getMemberStats(a.uid).total;
        return byTotal || a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      });
  }

  function eventMatches(record, term) {
    const participantNames = record.participantIds.map(getMemberName).join(" ");
    return normalizeText([
      record.name,
      record.description,
      CATEGORY_BY_ID[record.category]?.label,
      participantNames
    ].join(" ")).includes(term);
  }

  function memberMatches(member, term) {
    const historyNames = getMemberHistory(member.uid).map((item) => item.eventName).join(" ");
    return normalizeText([member.name, historyNames].join(" ")).includes(term);
  }

  function getSortedMembers() {
    return [...state.members].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }

  function getMembersByIds(memberIds) {
    const idSet = new Set(memberIds);
    return getSortedMembers().filter((member) => idSet.has(member.uid));
  }

  function getMemberName(memberId) {
    return findMember(memberId)?.name || "";
  }

  function findEvent(eventId) {
    return state.events.find((record) => record.uid === eventId);
  }

  function findMember(memberId) {
    return state.members.find((member) => member.uid === memberId);
  }

  function findMemberByName(name) {
    const normalized = normalizeText(name);
    return state.members.find((member) => normalizeText(member.name) === normalized);
  }

  function normalizePayload(payload) {
    const rawMembers = Array.isArray(payload?.members) ? payload.members : [];
    const members = rawMembers.map(normalizeMember).filter(Boolean);
    const memberIds = new Set(members.map((member) => member.uid));

    const events = (Array.isArray(payload?.events) ? payload.events : [])
      .map((record) => normalizeEvent(record, memberIds))
      .filter(Boolean);

    const eventIds = new Set(events.map((record) => record.uid));
    const eventById = new Map(events.map((record) => [record.uid, record]));
    let participations = (Array.isArray(payload?.participations) ? payload.participations : [])
      .map((item) => normalizeParticipation(item, memberIds, eventIds, eventById))
      .filter(Boolean);

    if (!participations.length) {
      participations = events.flatMap((record) => record.participantIds.map((memberId) => ({
        uid: createUid("participation"),
        memberId,
        eventId: record.uid,
        category: record.category,
        eventName: record.name,
        eventStartsAt: record.startsAt,
        recordedAt: record.updatedAt || record.createdAt || new Date().toISOString()
      })));
    }

    return { members, events, participations };
  }

  function normalizeMember(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const name = stringFrom(raw.name, raw.mainName, raw.nombre);
    if (!name) {
      return null;
    }

    return {
      uid: String(raw.uid || raw.id || createUid("member")),
      name,
      createdAt: stringFrom(raw.createdAt) || new Date().toISOString(),
      updatedAt: stringFrom(raw.updatedAt) || new Date().toISOString()
    };
  }

  function normalizeEvent(raw, memberIds) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const name = stringFrom(raw.name, raw.nombre, raw.title);
    const startsAt = normalizeDate(raw.startsAt || raw.date || raw.fecha);
    const category = CATEGORY_BY_ID[raw.category] ? raw.category : normalizeCategory(raw.category);

    if (!name || !startsAt) {
      return null;
    }

    const participantIds = uniqueIds(raw.participantIds || raw.members || raw.participants)
      .filter((memberId) => memberIds.has(memberId));

    return {
      uid: String(raw.uid || raw.id || createUid("event")),
      category,
      name,
      startsAt,
      description: stringFrom(raw.description, raw.descripcion),
      participantIds,
      createdAt: stringFrom(raw.createdAt) || new Date().toISOString(),
      updatedAt: stringFrom(raw.updatedAt) || new Date().toISOString()
    };
  }

  function normalizeParticipation(raw, memberIds, eventIds, eventById) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    const memberId = String(raw.memberId || raw.member || "");
    const eventId = String(raw.eventId || raw.event || "");

    if (!memberIds.has(memberId) || !eventIds.has(eventId)) {
      return null;
    }

    const record = eventById.get(eventId);

    return {
      uid: String(raw.uid || raw.id || createUid("participation")),
      memberId,
      eventId,
      category: CATEGORY_BY_ID[raw.category] ? raw.category : record?.category || "mining",
      eventName: stringFrom(raw.eventName, record?.name, raw.name) || "Evento",
      eventStartsAt: normalizeDate(raw.eventStartsAt || record?.startsAt || raw.startsAt) || new Date().toISOString(),
      recordedAt: normalizeDate(raw.recordedAt || raw.createdAt) || new Date().toISOString()
    };
  }

  function normalizeCategory(value) {
    const normalized = normalizeText(value);
    if (normalized.includes("pvp")) {
      return "pvp";
    }
    if (normalized.includes("pve")) {
      return "pve";
    }
    return "mining";
  }

  function uniqueIds(values) {
    if (!Array.isArray(values)) {
      return [];
    }

    return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
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

  function normalizeDate(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
  }

  function parseDateTimeLocal(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString();
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

  function formatDateForInput(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) {
      return "";
    }

    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate.toISOString().slice(0, 16);
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
    toast.className = "events-toast";
    toast.textContent = message;
    els.toastStack.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
      window.setTimeout(() => toast.remove(), 180);
    }, 2600);
  }
}
