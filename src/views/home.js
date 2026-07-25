export function renderHome() {
  return `
    <section class="home-page">
      <section class="home-hero" id="inicio" aria-labelledby="home-title">
        <div class="home-hero-content">
          <p class="eyebrow">Alianza Interestelar</p>
          <h1 id="home-title">[SC2] Heart Of The Swarm</h1>
          <p class="home-subtitle">Bienvenido a la Alianza</p>
          <p class="home-lead">
            Estrategia, disciplina y comunidad para pilotos que buscan dejar una marca real
            en las estrellas.
          </p>
          <div class="home-actions" aria-label="Acciones principales">
            <a class="button button-primary" href="#/inicio/reclutamiento">Unirme</a>
            <a class="button button-secondary" href="#/reglamento">Ver reglamento</a>
            <a class="button button-ghost" href="#/roles">Explorar roles</a>
          </div>
        </div>

        <dl class="signal-strip" aria-label="Valores de la alianza">
          <div>
            <dt>Unidad</dt>
            <dd>Flotas coordinadas</dd>
          </div>
          <div>
            <dt>Estrategia</dt>
            <dd>Doctrinas vivas</dd>
          </div>
          <div>
            <dt>Dominio</dt>
            <dd>Operaciones activas</dd>
          </div>
        </dl>
      </section>

      <section class="home-section welcome-section" id="bienvenida" aria-labelledby="welcome-title">
        <div class="section-shell welcome-layout">
          <div class="section-heading">
            <p class="eyebrow">Nexo SC2</p>
            <h2 id="welcome-title">Forjamos algo mas grande que nosotros mismos</h2>
          </div>

          <div class="welcome-copy">
            <p>
              Has llegado al nexo de la Alianza SC2, donde el legado de StarCraft y el
              vasto universo de EVE Echoes se fusionan en una fuerza coordinada. Somos
              una comunidad de estrategas, exploradores y guerreros.
            </p>
            <p>
              Nuestra mision es clara: dominar los cielos, proteger a los nuestros y
              conquistar lo desconocido.
            </p>
          </div>
        </div>
      </section>

      <section class="home-section pillars-section" aria-labelledby="pillars-title">
        <div class="section-shell">
          <div class="section-heading compact">
            <p class="eyebrow">Doctrina de alianza</p>
            <h2 id="pillars-title">Por que unirte a la Alianza SC2</h2>
          </div>

          <div class="pillars-grid">
            <article class="pillar-card">
              <span class="card-index">01</span>
              <h3>Poder en la Unidad</h3>
              <p>
                Encontraras companeros listos para apoyarte en cada batalla, mision y
                exploracion. La fuerza de SC2 proviene de la cohesion.
              </p>
            </article>

            <article class="pillar-card">
              <span class="card-index">02</span>
              <h3>Dominio de Estrategia</h3>
              <p>
                Combinamos tacticas probadas con conocimiento de EVE Echoes para crear
                doctrinas claras, medibles y faciles de ejecutar.
              </p>
            </article>

            <article class="pillar-card">
              <span class="card-index">03</span>
              <h3>Recursos y Apoyo</h3>
              <p>
                Desde operaciones PvE hasta batallas PvP, tendras guias, roles visuales
                y una red de apoyo para crecer como piloto.
              </p>
            </article>

            <article class="pillar-card">
              <span class="card-index">04</span>
              <h3>Comunidad Activa</h3>
              <p>
                Coordinamos operaciones, compartimos estrategias y mantenemos una cultura
                de equipo preparada para el largo plazo.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section class="home-section command-modules" aria-labelledby="modules-title">
        <div class="section-shell">
          <div class="section-heading compact">
            <p class="eyebrow">Centro unificado</p>
            <h2 id="modules-title">Todo el trabajo integrado en una sola aplicacion</h2>
          </div>

          <div class="module-grid">
            <a class="module-tile" href="#/reglamento">
              <span class="module-kicker">01</span>
              <strong>Reglamento Oficial</strong>
              <span>Normas PvE, PvP, sanciones, FAQ y buscador del reglamento.</span>
            </a>
            <a class="module-tile" href="#/roles">
              <span class="module-kicker">02</span>
              <strong>Biblioteca de Roles</strong>
              <span>Galeria visual con visor ampliado, zoom, swipe y pantalla completa.</span>
            </a>
            <a class="module-tile" href="#/eventos">
              <span class="module-kicker">03</span>
              <strong>Gestor de Eventos</strong>
              <span>Mineria, PvE, PvP, participaciones automaticas e historial por miembro.</span>
            </a>
            <a class="module-tile" href="#/kills">
              <span class="module-kicker">04</span>
              <strong>Kill del Mes</strong>
              <span>Ranking mensual, historial, estadisticas, busqueda, perfiles y OCR de reportes.</span>
            </a>
            <a class="module-tile" href="#/admin">
              <span class="module-kicker">05</span>
              <strong>Corp Command</strong>
              <span>Panel local para miembros, alters, EX-CORP, lista negra y respaldos JSON.</span>
            </a>
          </div>
        </div>
      </section>

      <section class="home-section external-tools" aria-labelledby="external-tools-title">
        <div class="section-shell">
          <div class="section-heading compact">
            <p class="eyebrow">Herramientas externas</p>
            <h2 id="external-tools-title">Accesos a paginas externas</h2>
          </div>

          <div class="external-tools-grid">
            <a class="module-tile external-tool-tile" href="https://discordtimestamp.com/" target="_blank" rel="noopener noreferrer">
              <span class="module-kicker">EXT-01</span>
              <strong>Discord Timestamp</strong>
              <span>Generador de horarios para publicar tiempos exactos en Discord.</span>
            </a>
            <a class="module-tile external-tool-tile" href="https://echoes.eveeye.com/?m=Pure%20Blind&o=nodeout_sec,node_sec,sub_npcs,sector_none,tag_none,etag_sig,con_none,thera,dark" target="_blank" rel="noopener noreferrer">
              <span class="module-kicker">EXT-02</span>
              <strong>EVE Echoes Eye</strong>
              <span>Mapa tactico de Pure Blind para rutas, sistemas y lectura regional.</span>
            </a>
          </div>
        </div>
      </section>

      <section class="home-section enlist-section" id="reclutamiento" aria-labelledby="enlist-title">
        <div class="section-shell enlist-layout">
          <div class="section-heading">
            <p class="eyebrow">Reclutamiento</p>
            <h2 id="enlist-title">Tu siguiente paso es simple: unete a nosotros</h2>
          </div>
          <div class="enlist-copy">
            <p>
              El universo es vasto y peligroso para recorrerlo solo. Forja tu legado con
              nosotros. Estamos listos para darte la bienvenida a nuestras filas.
            </p>
          </div>
        </div>
      </section>
    </section>
  `;
}

export function initHome() {
  return null;
}
