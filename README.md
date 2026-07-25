# SC2 Command Center

Aplicacion web unificada para Heart Of The Swarm, preparada con Vite para publicarse en GitHub Pages.

## Desarrollo local

```bash
npm install
npm run dev
```

## Compilacion

```bash
npm run build
```

El sitio compilado queda en `dist/`.

## GitHub Pages

Este proyecto genera rutas relativas mediante `vite.config.js`, por lo que el build funciona correctamente bajo el subdirectorio de un repositorio de GitHub Pages.

Para publicar:

1. Sube el proyecto al repositorio.
2. En GitHub, configura Pages con origen `GitHub Actions`.
3. Haz push a la rama `main`.

El workflow `.github/workflows/deploy.yml` instala dependencias, ejecuta `npm run build` y publica `dist/`.

## Supabase

El panel Admin, la biblioteca de guias y el gestor de eventos usan Supabase como almacenamiento remoto mediante `src/services/supabaseStore.js`.

Antes de usarlo en produccion, abre Supabase SQL Editor y ejecuta:

```sql
-- supabase/schema.sql
```

La tabla `app_state` guarda documentos publicos de la app:

- `corp-command`: miembros, alters, EX-CORP y lista negra.
- `guides-library`: guias.
- `community-events`: miembros de eventos, eventos y participaciones.

El gestor de eventos guarda `members`, `events` y `participations` por separado. Los contadores de Mineria e Industria, PvE, PvP, total general, ultima participacion e historial de cada miembro se calculan desde `participations`, por lo que al editar o eliminar un evento las estadisticas se actualizan sin duplicar datos. Esta estructura deja espacio para puntos, rankings, filtros por fecha, reportes mensuales/anuales, roles de usuario y exportacion a Excel o PDF.

En Eventos, la consulta de participacion es publica y de solo lectura. Crear, editar, eliminar, iniciar, finalizar y gestionar participantes requiere desbloquear la sesion Admin con el flujo existente.

Las fechas de eventos se guardan internamente en UTC ISO 8601. El formulario de administracion toma la fecha/hora local del navegador y la convierte a UTC antes de guardar; al visualizar, cada usuario ve la hora convertida automaticamente a su zona horaria local con un contador regresivo en vivo.

La clave publishable es publica y puede vivir en el frontend. No subas claves secretas ni claves de servicio al repositorio.
