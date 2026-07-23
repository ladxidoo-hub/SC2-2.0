import dormantImage from "../assets/roles/dormant.png";
import industrialImage from "../assets/roles/industrial.png";
import mineroImage from "../assets/roles/minero.png";
import pveImage from "../assets/roles/pve.png";
import pvpImage from "../assets/roles/pvp.png";

const roles = [
  { name: "Industrial", src: industrialImage },
  { name: "PvP", src: pvpImage },
  { name: "PvE", src: pveImage },
  { name: "Minero", src: mineroImage },
  { name: "Dormant", src: dormantImage }
];

export function renderRoles() {
  return `
    <section class="roles-page" aria-labelledby="roles-title">
      <section class="roles-hero">
        <p class="eyebrow">Heart Of The Swarm Command Interface</p>
        <h1 id="roles-title">Biblioteca de Roles</h1>
        <p class="roles-copy">Consulta visual de especializaciones para pilotos de EVE Echoes.</p>
      </section>

      <section class="roles-gallery" aria-label="Galeria de roles disponibles">
        ${roles.map((role, index) => `
          <article class="role-card">
            <button class="role-trigger" type="button" data-index="${index}" aria-label="Abrir imagen del rol ${role.name}">
              <span class="image-frame">
                <img src="${role.src}" alt="Rol ${role.name}" loading="lazy" decoding="async">
              </span>
              <span class="role-name">${role.name}</span>
            </button>
          </article>
        `).join("")}
      </section>

      <section class="image-viewer" id="image-viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" aria-hidden="true">
        <div class="viewer-backdrop" data-close-viewer></div>
        <div class="viewer-panel">
          <header class="viewer-header">
            <div>
              <p class="viewer-count" data-viewer-count>1 de ${roles.length}</p>
              <h2 id="viewer-title" data-viewer-title>Industrial</h2>
            </div>
            <div class="viewer-actions" aria-label="Controles del visor">
              <button class="icon-button" type="button" data-zoom-out aria-label="Reducir imagen">-</button>
              <button class="icon-button" type="button" data-zoom-in aria-label="Ampliar imagen">+</button>
              <button class="text-button" type="button" data-reset-view aria-label="Restablecer imagen">100%</button>
              <button class="text-button" type="button" data-fullscreen aria-label="Ver a pantalla completa">Pantalla</button>
              <button class="icon-button close-button" type="button" data-close-viewer aria-label="Cerrar visor">x</button>
            </div>
          </header>

          <button class="viewer-nav viewer-prev" type="button" data-previous aria-label="Imagen anterior">&lt;</button>
          <button class="viewer-nav viewer-next" type="button" data-next aria-label="Imagen siguiente">&gt;</button>

          <div class="viewer-stage" data-viewer-stage>
            <img class="viewer-image" data-viewer-image src="" alt="">
          </div>
        </div>
      </section>
    </section>
  `;
}

export function initRoles({ main }) {
  const controller = new AbortController();
  const { signal } = controller;
  const viewer = main.querySelector("#image-viewer");
  const viewerPanel = main.querySelector(".viewer-panel");
  const viewerStage = main.querySelector("[data-viewer-stage]");
  const viewerImage = main.querySelector("[data-viewer-image]");
  const viewerTitle = main.querySelector("[data-viewer-title]");
  const viewerCount = main.querySelector("[data-viewer-count]");
  const roleTriggers = Array.from(main.querySelectorAll(".role-trigger"));
  const closeButtons = Array.from(main.querySelectorAll("[data-close-viewer]"));
  const previousButton = main.querySelector("[data-previous]");
  const nextButton = main.querySelector("[data-next]");
  const zoomInButton = main.querySelector("[data-zoom-in]");
  const zoomOutButton = main.querySelector("[data-zoom-out]");
  const resetButton = main.querySelector("[data-reset-view]");
  const fullscreenButton = main.querySelector("[data-fullscreen]");
  const primaryCloseButton = main.querySelector(".close-button");

  let currentIndex = 0;
  let lastFocusedElement = null;
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let dragStart = null;
  let swipeStart = null;
  let activePointers = new Map();
  let pinchStart = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const getLoopedIndex = (index) => {
    if (index < 0) {
      return roles.length - 1;
    }
    if (index >= roles.length) {
      return 0;
    }
    return index;
  };

  const updateTransform = () => {
    viewerImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
    resetButton.textContent = `${Math.round(scale * 100)}%`;
  };

  const resetTransform = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    updateTransform();
  };

  const preloadAdjacentImages = () => {
    [getLoopedIndex(currentIndex - 1), getLoopedIndex(currentIndex + 1)].forEach((index) => {
      const image = new Image();
      image.src = roles[index].src;
    });
  };

  const renderImage = () => {
    const role = roles[currentIndex];
    viewerTitle.textContent = role.name;
    viewerCount.textContent = `${currentIndex + 1} de ${roles.length}`;
    viewerImage.src = role.src;
    viewerImage.alt = `Rol ${role.name}`;
    resetTransform();
    preloadAdjacentImages();
  };

  const openViewer = (index) => {
    currentIndex = getLoopedIndex(index);
    lastFocusedElement = document.activeElement;
    renderImage();
    viewer.classList.add("is-open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.classList.add("viewer-lock");
    primaryCloseButton.focus();
  };

  const closeViewer = () => {
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("viewer-lock");

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    activePointers.clear();
    pinchStart = null;
    dragStart = null;
    viewerStage.classList.remove("is-dragging");

    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };

  const showImage = (direction) => {
    currentIndex = getLoopedIndex(currentIndex + direction);
    renderImage();
  };

  const zoomImage = (delta, originX = 0, originY = 0) => {
    const previousScale = scale;
    scale = clamp(scale + delta, 1, 4);

    if (scale === 1) {
      translateX = 0;
      translateY = 0;
    } else if (originX || originY) {
      const ratio = scale / previousScale;
      translateX = originX - (originX - translateX) * ratio;
      translateY = originY - (originY - translateY) * ratio;
    }

    updateTransform();
  };

  const getStagePoint = (event) => {
    const rect = viewerStage.getBoundingClientRect();
    return {
      x: event.clientX - rect.left - rect.width / 2,
      y: event.clientY - rect.top - rect.height / 2
    };
  };

  const getPointerDistance = () => {
    const points = Array.from(activePointers.values());
    if (points.length < 2) {
      return 0;
    }
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  };

  roleTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openViewer(Number(trigger.dataset.index)), { signal });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeViewer, { signal });
  });

  previousButton.addEventListener("click", () => showImage(-1), { signal });
  nextButton.addEventListener("click", () => showImage(1), { signal });
  zoomInButton.addEventListener("click", () => zoomImage(0.25), { signal });
  zoomOutButton.addEventListener("click", () => zoomImage(-0.25), { signal });
  resetButton.addEventListener("click", resetTransform, { signal });

  fullscreenButton.addEventListener("click", () => {
    if (!viewerPanel.requestFullscreen) {
      return;
    }

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      return;
    }

    viewerPanel.requestFullscreen().catch(() => {});
  }, { signal });

  document.addEventListener("fullscreenchange", () => {
    fullscreenButton.textContent = document.fullscreenElement ? "Salir" : "Pantalla";
  }, { signal });

  viewerStage.addEventListener("wheel", (event) => {
    if (!viewer.classList.contains("is-open")) {
      return;
    }

    event.preventDefault();
    const point = getStagePoint(event);
    const zoomDelta = event.deltaY < 0 ? 0.18 : -0.18;
    zoomImage(zoomDelta, point.x, point.y);
  }, { passive: false, signal });

  viewerStage.addEventListener("pointerdown", (event) => {
    viewerStage.setPointerCapture(event.pointerId);
    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size === 2) {
      pinchStart = {
        distance: getPointerDistance(),
        scale
      };
      return;
    }

    dragStart = {
      x: event.clientX,
      y: event.clientY,
      translateX,
      translateY
    };

    swipeStart = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now()
    };

    viewerStage.classList.add("is-dragging");
  }, { signal });

  viewerStage.addEventListener("pointermove", (event) => {
    if (!activePointers.has(event.pointerId)) {
      return;
    }

    activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (activePointers.size === 2 && pinchStart) {
      const nextDistance = getPointerDistance();
      scale = clamp(pinchStart.scale * (nextDistance / pinchStart.distance), 1, 4);

      if (scale === 1) {
        translateX = 0;
        translateY = 0;
      }

      updateTransform();
      return;
    }

    if (!dragStart || scale <= 1) {
      return;
    }

    translateX = dragStart.translateX + event.clientX - dragStart.x;
    translateY = dragStart.translateY + event.clientY - dragStart.y;
    updateTransform();
  }, { signal });

  const releasePointer = (event) => {
    const wasSinglePointer = activePointers.size === 1;
    activePointers.delete(event.pointerId);

    if (wasSinglePointer && swipeStart && scale === 1) {
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      const elapsed = Date.now() - swipeStart.time;

      if (Math.abs(deltaX) > 70 && Math.abs(deltaY) < 70 && elapsed < 520) {
        showImage(deltaX < 0 ? 1 : -1);
      }
    }

    if (activePointers.size < 2) {
      pinchStart = null;
    }

    dragStart = null;
    swipeStart = null;
    viewerStage.classList.remove("is-dragging");
  };

  viewerStage.addEventListener("pointerup", releasePointer, { signal });
  viewerStage.addEventListener("pointercancel", releasePointer, { signal });

  document.addEventListener("keydown", (event) => {
    if (!viewer.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeViewer();
    }

    if (event.key === "ArrowLeft") {
      showImage(-1);
    }

    if (event.key === "ArrowRight") {
      showImage(1);
    }

    if (event.key === "Tab") {
      const focusable = Array.from(viewer.querySelectorAll("button"));
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, { signal });

  return () => {
    controller.abort();
    document.body.classList.remove("viewer-lock");
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };
}
