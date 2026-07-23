import { DEFAULT_GUIDES, GUIDE_IMAGE_OPTIONS } from "../data/guidesData.js";
import { isSupabaseConfigured, loadGuidesState, saveGuidesState } from "../services/supabaseStore.js";
import anomaliesImage from "../assets/guides/anomalies-guide.webp";
import damageTypesImage from "../assets/guides/damage-types-guide.png";
import guideImage from "../assets/guides/heart-of-the-swarm-bg.png";
import implantsImage from "../assets/guides/implants-guide.png";
import nanocoreAiImage from "../assets/guides/nanocore-ai-guide.png";
import privateContractsImage from "../assets/guides/private-contracts-guide.png";
import resonanceScannersImage from "../assets/guides/resonance-scanners-guide.png";
import rewardDuplicationImage from "../assets/guides/reward-duplication-guide.png";
import specialAnomaliesImage from "../assets/guides/special-anomalies-guide.webp";
import stackingPenaltyImage from "../assets/guides/stacking-penalty-guide.png";
import storyMissionsImage from "../assets/guides/story-missions-guide.png";

const STORAGE_KEY = "sc2.guides.library.v1";
const ADMIN_AUTH_KEY = "sc2.admin.unlocked";

const guideImages = {
  anomalies: anomaliesImage,
  damageTypes: damageTypesImage,
  implants: implantsImage,
  nanocoreAi: nanocoreAiImage,
  privateContracts: privateContractsImage,
  resonanceScanners: resonanceScannersImage,
  rewardDuplication: rewardDuplicationImage,
  specialAnomalies: specialAnomaliesImage,
  stackingPenalty: stackingPenaltyImage,
  storyMissions: storyMissionsImage,
  swarm: guideImage
};

const state = {
  category: "all",
  editingId: null,
  guides: cloneGuides(DEFAULT_GUIDES),
  imageDialogTitle: "",
  imageDialogUrl: "",
  isAdmin: false,
  isLoading: true,
  pendingDeleteId: null,
  query: "",
  selectedId: DEFAULT_GUIDES[0]?.id || "",
  syncStatus: "Cargando biblioteca"
};

let els = {};
let isMounted = false;

export function renderGuides() {
  return `
    <section class="guides-page" aria-labelledby="guidesTitle">
      <aside class="guides-sidebar" aria-label="Menu lateral de guias">
        <div class="guides-sidebar-head">
          <span class="guides-sidebar-kicker">Biblioteca</span>
          <h2>Guias SC2</h2>
          <p>Archivo tactico conectado a la base de datos del sitio.</p>
        </div>

        <nav class="guides-category-nav" id="guidesCategoryNav" aria-label="Categorias de guias"></nav>

        <div class="guides-admin-card">
          <span class="guides-status" data-guides-sync-status>Cargando biblioteca</span>
          <p data-guides-admin-copy></p>
          <button class="button button-primary guides-admin-action" type="button" data-guide-create>
            Nueva guia
          </button>
          <a class="button button-ghost guides-admin-login" href="#/admin" data-guides-admin-login>
            Abrir Admin
          </a>
        </div>
      </aside>

      <section class="guides-workspace">
        <header class="guides-hero">
          <div>
            <p class="eyebrow">Centro tactico</p>
            <h1 id="guidesTitle">Guias del enjambre</h1>
            <p>Consulta estrategias, imagenes de referencia y procedimientos. La edicion se activa al entrar al panel Admin.</p>
          </div>

          <div class="guides-tools" aria-label="Herramientas de guias">
            <label class="guides-search-control" for="guidesSearch">
              <span>Buscar</span>
              <input id="guidesSearch" type="search" autocomplete="off" placeholder="Nombre, categoria, nivel o etiqueta">
            </label>
            <button class="button button-primary" type="button" data-guide-create>
              Nueva guia
            </button>
          </div>
        </header>

        <div class="guides-count" id="guidesCount" aria-live="polite"></div>

        <div class="guides-layout">
          <section class="guides-list" id="guidesList" aria-label="Listado de guias"></section>
          <article class="guides-detail" id="guidesDetail" aria-live="polite"></article>
        </div>
      </section>

      <dialog class="guides-modal" id="guidesEditorDialog" aria-labelledby="guidesEditorTitle">
        <form class="guides-modal-shell" id="guidesEditorForm" method="dialog" novalidate>
          <header class="guides-modal-header">
            <div>
              <span class="guides-kicker">Editor de biblioteca</span>
              <h2 id="guidesEditorTitle">Nueva guia</h2>
            </div>
            <button class="guides-modal-close" type="button" data-guides-dialog-close aria-label="Cerrar">x</button>
          </header>

          <div class="guides-form-grid">
            <label class="guides-form-field">
              <span>Titulo</span>
              <input name="title" type="text" required>
            </label>
            <label class="guides-form-field">
              <span>Categoria</span>
              <input name="category" type="text" required>
            </label>
            <label class="guides-form-field">
              <span>Nivel</span>
              <input name="level" type="text" placeholder="Basico, Intermedio, Avanzado">
            </label>
            <label class="guides-form-field">
              <span>Tiempo de lectura</span>
              <input name="readingTime" type="text" placeholder="5 min">
            </label>
            <label class="guides-form-field">
              <span>Imagen</span>
              <select name="imageKey">
                ${GUIDE_IMAGE_OPTIONS.map((option) => `
                  <option value="${escapeAttr(option.key)}">${escapeHtml(option.label)}</option>
                `).join("")}
              </select>
            </label>
            <label class="guides-form-field">
              <span>Ajuste de imagen</span>
              <select name="imageFit">
                <option value="contain">Contener completa</option>
                <option value="cover">Cubrir espacio</option>
              </select>
            </label>
            <label class="guides-form-field full">
              <span>Descripcion corta</span>
              <textarea name="description" rows="3" required></textarea>
            </label>
            <label class="guides-form-field full">
              <span>Contenido completo</span>
              <textarea name="fullDetails" rows="7" placeholder="Un parrafo por linea"></textarea>
            </label>
            <label class="guides-form-field full">
              <span>Etiquetas</span>
              <input name="tags" type="text" placeholder="anomalias, botin, escaneo">
            </label>
          </div>

          <p class="guides-form-error" id="guidesFormError" aria-live="polite"></p>

          <footer class="guides-modal-footer">
            <button class="button button-ghost" type="button" data-guides-dialog-close>Cancelar</button>
            <button class="button button-primary" type="submit">Guardar guia</button>
          </footer>
        </form>
      </dialog>

      <dialog class="guides-modal guides-confirm-dialog" id="guidesConfirmDialog" aria-labelledby="guidesConfirmTitle">
        <div class="guides-modal-shell">
          <header class="guides-modal-header">
            <div>
              <span class="guides-kicker">Confirmacion</span>
              <h2 id="guidesConfirmTitle">Eliminar guia</h2>
            </div>
            <button class="guides-modal-close" type="button" data-guides-confirm-close aria-label="Cerrar">x</button>
          </header>
          <p class="guides-confirm-copy" id="guidesConfirmCopy"></p>
          <footer class="guides-modal-footer">
            <button class="button button-ghost" type="button" data-guides-confirm-close>Cancelar</button>
            <button class="button guides-danger-button" type="button" data-guides-confirm-delete>Eliminar</button>
          </footer>
        </div>
      </dialog>

      <dialog class="guides-image-dialog" id="guidesImageDialog" aria-labelledby="guidesImageTitle">
        <div class="guides-image-shell">
          <header class="guides-modal-header">
            <h2 id="guidesImageTitle">Imagen completa</h2>
            <button class="guides-modal-close" type="button" data-guides-image-close aria-label="Cerrar">x</button>
          </header>
          <img id="guidesImagePreview" alt="">
        </div>
      </dialog>

      <div class="guides-toast-stack" id="guidesToastStack" aria-live="polite" aria-atomic="true"></div>
    </section>
  `;
}

export function initGuides({ main }) {
  const controller = new AbortController();
  const { signal } = controller;
  isMounted = true;
  state.isAdmin = isAdminUnlocked();

  els = {
    adminCopy: main.querySelector("[data-guides-admin-copy]"),
    adminLogin: main.querySelector("[data-guides-admin-login]"),
    categoryNav: main.querySelector("#guidesCategoryNav"),
    confirmCopy: main.querySelector("#guidesConfirmCopy"),
    confirmDialog: main.querySelector("#guidesConfirmDialog"),
    count: main.querySelector("#guidesCount"),
    createButtons: Array.from(main.querySelectorAll("[data-guide-create]")),
    detail: main.querySelector("#guidesDetail"),
    editorDialog: main.querySelector("#guidesEditorDialog"),
    editorForm: main.querySelector("#guidesEditorForm"),
    editorTitle: main.querySelector("#guidesEditorTitle"),
    formError: main.querySelector("#guidesFormError"),
    imageDialog: main.querySelector("#guidesImageDialog"),
    imagePreview: main.querySelector("#guidesImagePreview"),
    imageTitle: main.querySelector("#guidesImageTitle"),
    list: main.querySelector("#guidesList"),
    search: main.querySelector("#guidesSearch"),
    status: main.querySelector("[data-guides-sync-status]"),
    toastStack: main.querySelector("#guidesToastStack")
  };

  loadLocalGuides();
  renderAll();
  hydrateGuides();

  els.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderListAndDetail();
  }, { signal });

  els.categoryNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-guide-category]");

    if (!button) {
      return;
    }

    state.category = button.dataset.guideCategory;
    ensureSelectedGuide();
    renderListAndDetail();
  }, { signal });

  els.list.addEventListener("click", handleGuideAction, { signal });
  els.detail.addEventListener("click", handleGuideAction, { signal });

  els.createButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!state.isAdmin) {
        showToast("Entra al panel Admin para editar guias.");
        return;
      }

      openEditor();
    }, { signal });
  });

  main.querySelectorAll("[data-guides-dialog-close]").forEach((button) => {
    button.addEventListener("click", closeEditor, { signal });
  });

  main.querySelectorAll("[data-guides-confirm-close]").forEach((button) => {
    button.addEventListener("click", closeConfirmDialog, { signal });
  });

  main.querySelector("[data-guides-confirm-delete]").addEventListener("click", deletePendingGuide, { signal });

  main.querySelectorAll("[data-guides-image-close]").forEach((button) => {
    button.addEventListener("click", closeImageDialog, { signal });
  });

  els.editorForm.addEventListener("submit", handleEditorSubmit, { signal });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeImageDialog();
      closeConfirmDialog();
      closeEditor();
    }
  }, { signal });

  return () => {
    isMounted = false;
    controller.abort();
    document.body.classList.remove("viewer-lock");
  };
}

function handleGuideAction(event) {
  const selectTrigger = event.target.closest("[data-guide-select]");
  const imageTrigger = event.target.closest("[data-guide-image]");
  const editTrigger = event.target.closest("[data-guide-edit]");
  const deleteTrigger = event.target.closest("[data-guide-delete]");

  if (selectTrigger) {
    state.selectedId = selectTrigger.dataset.guideSelect;
    renderListAndDetail();
    return;
  }

  if (imageTrigger) {
    openImageDialog(imageTrigger.dataset.guideImage, imageTrigger.dataset.guideImageTitle);
    return;
  }

  if (editTrigger) {
    if (!state.isAdmin) {
      showToast("Entra al panel Admin para editar guias.");
      return;
    }

    openEditor(editTrigger.dataset.guideEdit);
    return;
  }

  if (deleteTrigger) {
    if (!state.isAdmin) {
      showToast("Entra al panel Admin para eliminar guias.");
      return;
    }

    openConfirmDialog(deleteTrigger.dataset.guideDelete);
  }
}

function handleEditorSubmit(event) {
  event.preventDefault();

  if (!state.isAdmin) {
    showFormError("Debes entrar al panel Admin antes de guardar.");
    return;
  }

  const form = event.currentTarget;
  const formData = new FormData(form);
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!title || !category || !description) {
    showFormError("Titulo, categoria y descripcion son obligatorios.");
    return;
  }

  const existingGuide = state.guides.find((guide) => guide.id === state.editingId);
  const guide = normalizeGuide({
    ...(existingGuide || {}),
    id: existingGuide?.id || createUid("guide"),
    title,
    category,
    description,
    imageKey: String(formData.get("imageKey") || "swarm"),
    imageFit: String(formData.get("imageFit") || "cover"),
    imagePosition: existingGuide?.imagePosition || "center",
    level: String(formData.get("level") || "Basico").trim() || "Basico",
    readingTime: String(formData.get("readingTime") || "5 min").trim() || "5 min",
    tags: splitList(formData.get("tags")),
    fullDetails: splitLines(formData.get("fullDetails"))
  });

  if (!guide.fullDetails.length) {
    guide.fullDetails = [description];
  }

  if (existingGuide) {
    state.guides = state.guides.map((item) => item.id === existingGuide.id ? guide : item);
  } else {
    state.guides = [guide, ...state.guides];
  }

  state.selectedId = guide.id;
  closeEditor();
  renderAll();
  persistGuides("Guia guardada.");
}

function loadLocalGuides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (Array.isArray(parsed?.guides) && parsed.guides.length) {
      state.guides = cloneGuides(parsed.guides);
    } else {
      state.guides = cloneGuides(DEFAULT_GUIDES);
    }
  } catch {
    state.guides = cloneGuides(DEFAULT_GUIDES);
  }

  ensureSelectedGuide();
}

async function hydrateGuides() {
  if (!isSupabaseConfigured()) {
    state.isLoading = false;
    setSyncStatus("LocalStorage / sin BD");
    renderAll();
    return;
  }

  setSyncStatus("Conectando Supabase");

  try {
    const remoteState = await loadGuidesState();

    if (Array.isArray(remoteState?.guides) && remoteState.guides.length) {
      state.guides = cloneGuides(remoteState.guides);
      writeLocalGuides();
    } else {
      await saveGuidesState(createPayload());
    }

    state.isLoading = false;
    setSyncStatus("Supabase sincronizado");
    ensureSelectedGuide();
    renderAll();
  } catch (error) {
    state.isLoading = false;
    setSyncStatus("LocalStorage / respaldo");
    showToast(`Supabase no respondio. Usando copia local. ${error.message}`);
    renderAll();
  }
}

async function persistGuides(successMessage = "Cambios guardados.") {
  writeLocalGuides();

  if (!isSupabaseConfigured()) {
    setSyncStatus("Guardado local");
    showToast(successMessage);
    return;
  }

  setSyncStatus("Guardando cambios");

  try {
    await saveGuidesState(createPayload());
    setSyncStatus("Supabase sincronizado");
    showToast(successMessage);
  } catch (error) {
    setSyncStatus("LocalStorage / respaldo");
    showToast(`Se guardo localmente. Supabase respondio con error: ${error.message}`);
  }
}

function writeLocalGuides() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createPayload()));
  } catch {
    showToast("El navegador no permitio guardar la copia local.");
  }
}

function createPayload() {
  return {
    app: "SC2 Guides Library",
    version: 1,
    exportedAt: new Date().toISOString(),
    guides: state.guides.map(stripGuideForStorage)
  };
}

function renderAll() {
  if (!isMounted) {
    return;
  }

  state.isAdmin = isAdminUnlocked();
  renderSidebar();
  renderAdminControls();
  renderListAndDetail();
}

function renderListAndDetail() {
  ensureSelectedGuide();
  renderCategoryButtons();
  renderGuidesList();
  renderGuideDetail();
}

function renderSidebar() {
  els.status.textContent = state.syncStatus;
  els.adminCopy.textContent = state.isAdmin
    ? "Modo editor activo. Puedes crear, editar y eliminar guias."
    : "Modo lectura. Para editar, entra al panel Admin con la clave.";
  els.adminLogin.hidden = state.isAdmin;
}

function renderAdminControls() {
  els.createButtons.forEach((button) => {
    button.hidden = !state.isAdmin;
  });
}

function renderCategoryButtons() {
  const counts = getCategoryCounts();
  const categories = ["all", ...Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, "es"))];

  els.categoryNav.innerHTML = categories.map((category) => {
    const label = category === "all" ? "Todas" : category;
    const count = category === "all" ? state.guides.length : counts.get(category);

    return `
      <button class="guides-category-button ${category === state.category ? "is-active" : ""}" type="button" data-guide-category="${escapeAttr(category)}">
        <span>${escapeHtml(label)}</span>
        <strong>${count}</strong>
      </button>
    `;
  }).join("");
}

function renderGuidesList() {
  const filteredGuides = getFilteredGuides();

  els.count.textContent = state.isLoading
    ? "Sincronizando guias..."
    : `${filteredGuides.length} guia${filteredGuides.length === 1 ? "" : "s"} disponible${filteredGuides.length === 1 ? "" : "s"}`;

  if (!filteredGuides.length) {
    els.list.innerHTML = `
      <div class="guides-empty-state">
        <strong>Sin resultados</strong>
        <p>No hay guias que coincidan con el filtro actual.</p>
      </div>
    `;
    return;
  }

  els.list.innerHTML = filteredGuides.map((guide) => renderGuideCard(guide)).join("");
}

function renderGuideCard(guide) {
  const imageUrl = getGuideImageUrl(guide);
  const isActive = guide.id === state.selectedId;

  return `
    <article class="guides-card ${isActive ? "is-active" : ""}">
      <button class="guides-card-select" type="button" data-guide-select="${escapeAttr(guide.id)}" aria-pressed="${isActive}">
        <span class="guides-card-media ${guide.imageFit === "contain" ? "is-contain" : ""}">
          <img src="${escapeAttr(imageUrl)}" alt="Imagen de ${escapeAttr(guide.title)}" loading="lazy" style="object-position:${escapeAttr(guide.imagePosition || "center")}">
        </span>
        <span class="guides-card-copy">
          <span class="guides-kicker">${escapeHtml(guide.category)}</span>
          <strong>${escapeHtml(guide.title)}</strong>
          <span>${escapeHtml(guide.description)}</span>
        </span>
      </button>
      <div class="guides-card-actions">
        <button class="guides-small-button" type="button" data-guide-image="${escapeAttr(imageUrl)}" data-guide-image-title="${escapeAttr(guide.title)}">Imagen</button>
        ${state.isAdmin ? `
          <button class="guides-small-button" type="button" data-guide-edit="${escapeAttr(guide.id)}">Editar</button>
          <button class="guides-small-button is-danger" type="button" data-guide-delete="${escapeAttr(guide.id)}">Eliminar</button>
        ` : ""}
      </div>
    </article>
  `;
}

function renderGuideDetail() {
  const guide = getSelectedGuide();

  if (!guide) {
    els.detail.innerHTML = `
      <div class="guides-empty-state">
        <strong>Selecciona una guia</strong>
        <p>El detalle aparecera en este panel.</p>
      </div>
    `;
    return;
  }

  const imageUrl = getGuideImageUrl(guide);
  const details = guide.fullDetails?.length ? guide.fullDetails : [guide.description];

  els.detail.innerHTML = `
    <header class="guides-detail-header">
      <span class="guides-kicker">${escapeHtml(guide.category)}</span>
      <h2>${escapeHtml(guide.title)}</h2>
      <p>${escapeHtml(guide.description)}</p>
      <ul class="guides-meta">
        <li>${escapeHtml(guide.level)}</li>
        <li>${escapeHtml(guide.readingTime)}</li>
        ${guide.tags.slice(0, 3).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
      </ul>
      ${state.isAdmin ? `
        <div class="guides-detail-actions">
          <button class="button button-ghost" type="button" data-guide-edit="${escapeAttr(guide.id)}">Editar</button>
          <button class="button guides-danger-button" type="button" data-guide-delete="${escapeAttr(guide.id)}">Eliminar</button>
        </div>
      ` : ""}
    </header>

    <button class="guides-detail-media ${guide.imageFit === "contain" ? "is-contain" : ""}" type="button" data-guide-image="${escapeAttr(imageUrl)}" data-guide-image-title="${escapeAttr(guide.title)}">
      <img src="${escapeAttr(imageUrl)}" alt="Imagen principal de ${escapeAttr(guide.title)}" loading="lazy" style="object-position:${escapeAttr(guide.imagePosition || "center")}">
    </button>

    <section class="guides-prose">
      ${details.map((detail) => `<p>${escapeHtml(detail)}</p>`).join("")}
      ${renderDamageTypes(guide)}
      ${renderGallery(guide)}
      ${renderTags(guide)}
    </section>
  `;
}

function renderDamageTypes(guide) {
  if (!guide.damageTypes?.length) {
    return "";
  }

  return `
    <ul class="guides-damage-list">
      ${guide.damageTypes.map((type) => `
        <li>
          <strong>${escapeHtml(type.name)}:</strong>
          <span>${escapeHtml(type.description)}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderGallery(guide) {
  if (!guide.gallery?.length) {
    return "";
  }

  return `
    <div class="guides-gallery">
      ${guide.gallery.map((item) => {
        const imageUrl = guideImages[item.imageKey] || guideImages.swarm;

        return `
          <button class="guides-gallery-item" type="button" data-guide-image="${escapeAttr(imageUrl)}" data-guide-image-title="${escapeAttr(item.title || guide.title)}">
            <img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(item.title || guide.title)}" loading="lazy">
            <span>${escapeHtml(item.title || guide.title)}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderTags(guide) {
  if (!guide.tags.length) {
    return "";
  }

  return `
    <div class="guides-tags">
      ${guide.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function openEditor(guideId = "") {
  const guide = state.guides.find((item) => item.id === guideId) || null;
  state.editingId = guide?.id || null;
  els.editorTitle.textContent = guide ? "Editar guia" : "Nueva guia";
  els.formError.textContent = "";

  const form = els.editorForm;
  form.elements.title.value = guide?.title || "";
  form.elements.category.value = guide?.category || "";
  form.elements.level.value = guide?.level || "Basico";
  form.elements.readingTime.value = guide?.readingTime || "5 min";
  form.elements.imageKey.value = guide?.imageKey || "swarm";
  form.elements.imageFit.value = guide?.imageFit || "contain";
  form.elements.description.value = guide?.description || "";
  form.elements.fullDetails.value = (guide?.fullDetails || []).join("\n");
  form.elements.tags.value = (guide?.tags || []).join(", ");

  openDialog(els.editorDialog);
  form.elements.title.focus();
}

function closeEditor() {
  if (els.editorDialog?.open) {
    els.editorDialog.close();
  }

  state.editingId = null;
  els.formError.textContent = "";
  syncDialogLock();
}

function openConfirmDialog(guideId) {
  const guide = state.guides.find((item) => item.id === guideId);

  if (!guide) {
    return;
  }

  state.pendingDeleteId = guide.id;
  els.confirmCopy.textContent = `Esta accion eliminara "${guide.title}" de la biblioteca.`;
  openDialog(els.confirmDialog);
}

function closeConfirmDialog() {
  if (els.confirmDialog?.open) {
    els.confirmDialog.close();
  }

  state.pendingDeleteId = null;
  syncDialogLock();
}

function deletePendingGuide() {
  const guideId = state.pendingDeleteId;

  if (!guideId) {
    return;
  }

  state.guides = state.guides.filter((guide) => guide.id !== guideId);
  closeConfirmDialog();
  ensureSelectedGuide();
  renderAll();
  persistGuides("Guia eliminada.");
}

function openImageDialog(imageUrl, title) {
  els.imageTitle.textContent = title || "Imagen completa";
  els.imagePreview.src = imageUrl;
  els.imagePreview.alt = title || "Imagen completa";
  openDialog(els.imageDialog);
}

function closeImageDialog() {
  if (els.imageDialog?.open) {
    els.imageDialog.close();
    els.imagePreview.src = "";
  }

  syncDialogLock();
}

function openDialog(dialog) {
  if (!dialog?.open) {
    dialog.showModal();
    document.body.classList.add("viewer-lock");
  }
}

function syncDialogLock() {
  const hasOpenDialog = [els.editorDialog, els.confirmDialog, els.imageDialog].some((dialog) => dialog?.open);
  document.body.classList.toggle("viewer-lock", hasOpenDialog);
}

function getSelectedGuide() {
  return state.guides.find((guide) => guide.id === state.selectedId) || null;
}

function ensureSelectedGuide() {
  const filteredGuides = getFilteredGuides();
  const selectedExists = filteredGuides.some((guide) => guide.id === state.selectedId);

  if (!filteredGuides.length) {
    state.selectedId = "";
    return;
  }

  if (!selectedExists) {
    state.selectedId = filteredGuides[0].id;
  }
}

function getFilteredGuides() {
  const query = normalizeText(state.query);

  return state.guides.filter((guide) => {
    const matchesCategory = state.category === "all" || guide.category === state.category;
    const searchable = normalizeText([
      guide.title,
      guide.category,
      guide.description,
      guide.level,
      guide.readingTime,
      ...guide.tags
    ].join(" "));

    return matchesCategory && (!query || searchable.includes(query));
  });
}

function getCategoryCounts() {
  return state.guides.reduce((counts, guide) => {
    counts.set(guide.category, (counts.get(guide.category) || 0) + 1);
    return counts;
  }, new Map());
}

function getGuideImageUrl(guide) {
  return guideImages[guide.imageKey] || guideImages.swarm;
}

function setSyncStatus(message) {
  state.syncStatus = message;

  if (els.status) {
    els.status.textContent = message;
  }
}

function showFormError(message) {
  els.formError.textContent = message;
}

function showToast(message) {
  if (!els.toastStack || !isMounted) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "guides-toast";
  toast.textContent = message;
  els.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4200);
}

function cloneGuides(guides) {
  return guides.map((guide) => normalizeGuide(structuredCloneSafe(guide)));
}

function normalizeGuide(guide) {
  return {
    id: String(guide.id || createUid("guide")),
    title: String(guide.title || "Guia sin titulo").trim(),
    category: String(guide.category || "General").trim(),
    imageKey: guideImages[guide.imageKey] ? guide.imageKey : "swarm",
    imageFit: guide.imageFit === "contain" ? "contain" : "cover",
    imagePosition: String(guide.imagePosition || "center"),
    description: String(guide.description || "").trim(),
    fullDetails: Array.isArray(guide.fullDetails)
      ? guide.fullDetails.map((detail) => String(detail || "").trim()).filter(Boolean)
      : [],
    damageTypes: Array.isArray(guide.damageTypes)
      ? guide.damageTypes.map((type) => ({
        name: String(type.name || "").trim(),
        description: String(type.description || "").trim()
      })).filter((type) => type.name || type.description)
      : [],
    gallery: Array.isArray(guide.gallery)
      ? guide.gallery.map((item) => ({
        imageKey: guideImages[item.imageKey] ? item.imageKey : "swarm",
        title: String(item.title || "").trim()
      }))
      : [],
    level: String(guide.level || "Basico").trim(),
    readingTime: String(guide.readingTime || "5 min").trim(),
    tags: Array.isArray(guide.tags)
      ? guide.tags.map((tag) => String(tag || "").trim()).filter(Boolean)
      : []
  };
}

function stripGuideForStorage(guide) {
  return {
    id: guide.id,
    title: guide.title,
    category: guide.category,
    imageKey: guide.imageKey,
    imageFit: guide.imageFit,
    imagePosition: guide.imagePosition,
    description: guide.description,
    fullDetails: guide.fullDetails,
    damageTypes: guide.damageTypes,
    gallery: guide.gallery,
    level: guide.level,
    readingTime: guide.readingTime,
    tags: guide.tags
  };
}

function structuredCloneSafe(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

function splitLines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitList(value) {
  return String(value || "")
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function createUid(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }

  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function isAdminUnlocked() {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  } catch {
    return false;
  }
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
  return escapeHtml(value).replace(/`/g, "&#096;");
}
