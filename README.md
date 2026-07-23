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
