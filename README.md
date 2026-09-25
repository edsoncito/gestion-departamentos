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
- Google Identity Services
- Google Sheets API

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

Copia `.env.example` como `.env.local` si necesitás sobrescribir la configuración
del proyecto desplegado:

- `VITE_GOOGLE_CLIENT_ID`: cliente OAuth de tipo aplicación web.
- `VITE_GOOGLE_SHEET_ID`: identificador de la base en Google Sheets.
- `VITE_ALLOWED_GOOGLE_EMAIL`: única cuenta admitida por la interfaz.

El token OAuth se mantiene únicamente en memoria. El navegador consulta Google
Sheets después de que el usuario autoriza el acceso.

## Despliegue

Cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`, genera el
directorio `dist` y publica el resultado en GitHub Pages.

Las variables de repositorio `GOOGLE_CLIENT_ID`, `GOOGLE_SHEET_ID` y
`ALLOWED_GOOGLE_EMAIL` son opcionales y permiten sobrescribir los valores del
despliegue actual.
