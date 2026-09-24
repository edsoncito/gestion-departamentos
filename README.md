# Gestión de departamentos

Aplicación web personal para administrar departamentos, contratos y pagos de
alquiler.

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- GitHub Actions y GitHub Pages

## Desarrollo local

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run lint
npm run build
```

## Variables de entorno

Copia `.env.example` como `.env.local` y configura `VITE_API_URL` cuando esté
disponible la API de Google Apps Script.

## Despliegue

Cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`, genera el
directorio `dist` y publica el resultado en GitHub Pages.
