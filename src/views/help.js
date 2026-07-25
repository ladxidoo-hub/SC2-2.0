const QUICK_START = [
  {
    number: "01",
    title: "Empieza por el reglamento",
    copy: "Consulta las normas PvE, PvP y de alianza antes de participar en operaciones.",
    href: "#/reglamento"
  },
  {
    number: "02",
    title: "Revisa tu rol",
    copy: "Entra a Roles para entender las areas disponibles y elegir como quieres aportar.",
    href: "#/roles"
  },
  {
    number: "03",
    title: "Mira los eventos",
    copy: "Consulta actividades activas, horarios locales y tu historial de participacion.",
    href: "#/eventos"
  },
  {
    number: "04",
    title: "Usa las guias",
    copy: "Busca informacion practica sobre mecanicas, builds, contratos y contenido del juego.",
    href: "#/guias"
  }
];

const SECTIONS = [
  {
    title: "Inicio",
    tag: "Entrada principal",
    copy: "Presenta la alianza y muestra accesos rapidos a los modulos principales. Es el mejor punto de partida para nuevos miembros.",
    href: "#/inicio"
  },
  {
    title: "Eventos",
    tag: "Operaciones",
    copy: "Muestra eventos por categoria, horarios convertidos a tu zona local, contador regresivo y participaciones acumuladas.",
    href: "#/eventos"
  },
  {
    title: "Reglamento",
    tag: "Normas oficiales",
    copy: "Centraliza reglas PvE, PvP y de alianza. Usa el buscador para encontrar una norma especifica sin recorrer toda la pagina.",
    href: "#/reglamento"
  },
  {
    title: "Roles",
    tag: "Especialidades",
    copy: "Explica las funciones dentro de la alianza con tarjetas visuales para mineria, industria, PvE, PvP y mas.",
    href: "#/roles"
  },
  {
    title: "Guias",
    tag: "Aprendizaje",
    copy: "Reune materiales de consulta para mecanicas de EVE Echoes, anomalias, contratos, implantes, nanocores y otros temas utiles.",
    href: "#/guias"
  },
  {
    title: "Admin",
    tag: "Gestion interna",
    copy: "Panel protegido para administradores. Permite gestionar miembros, EX-CORP, lista negra, importaciones y respaldos JSON.",
    href: "#/admin"
  }
];

const TIPS = [
  "Si entras desde telefono, abre el boton de menu en la esquina superior derecha.",
  "Los horarios de Eventos se muestran automaticamente en tu hora local.",
  "Si ves LocalStorage, los datos estan guardados solo en ese navegador.",
  "Si ves Online / Supabase, los datos estan sincronizados para otros dispositivos.",
  "Para dudas de reglas, usa primero el buscador del Reglamento.",
  "Solo administradores deben entrar al panel Admin."
];

export function renderHelp() {
  return `
    <section class="help-page" aria-labelledby="helpTitle">
      <header class="help-hero">
        <div class="help-hero-copy">
          <span class="help-kicker">Guia de uso</span>
          <h1 id="helpTitle">Como funciona la pagina</h1>
          <p>
            Esta guia resume que hace cada seccion del Command Center y cual es el camino
            recomendado para un miembro que entra por primera vez.
          </p>
        </div>
        <div class="help-status-panel" aria-label="Resumen rapido">
          <span>Ruta recomendada</span>
          <strong>Reglamento -> Roles -> Eventos -> Guias</strong>
        </div>
      </header>

      <section class="help-section" aria-labelledby="quickStartTitle">
        <div class="help-section-heading">
          <span class="help-kicker">Primer ingreso</span>
          <h2 id="quickStartTitle">Que hacer al entrar</h2>
        </div>

        <div class="help-steps">
          ${QUICK_START.map((item) => `
            <a class="help-step" href="${item.href}">
              <span>${item.number}</span>
              <strong>${item.title}</strong>
              <p>${item.copy}</p>
            </a>
          `).join("")}
        </div>
      </section>

      <section class="help-section" aria-labelledby="sectionsTitle">
        <div class="help-section-heading">
          <span class="help-kicker">Mapa del sitio</span>
          <h2 id="sectionsTitle">Para que sirve cada seccion</h2>
        </div>

        <div class="help-section-grid">
          ${SECTIONS.map((section) => `
            <article class="help-card">
              <span>${section.tag}</span>
              <h3>${section.title}</h3>
              <p>${section.copy}</p>
              <a href="${section.href}">Abrir ${section.title}</a>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="help-section help-split" aria-labelledby="tipsTitle">
        <div class="help-section-heading">
          <span class="help-kicker">Notas utiles</span>
          <h2 id="tipsTitle">Detalles que conviene saber</h2>
        </div>

        <ul class="help-tip-list">
          ${TIPS.map((tip) => `<li>${tip}</li>`).join("")}
        </ul>
      </section>
    </section>
  `;
}

export function initHelp() {
  return null;
}
