# Gestión de departamentos

Aplicación web personal para administrar departamentos, contratos y pagos de
alquiler.

La gestión de inquilinos conserva el historial mediante contratos: cada
departamento admite un solo responsable activo, la salida real se registra por
separado del vencimiento previsto y las mensualidades futuras se cancelan sin
eliminar las deudas ya vencidas.

## Tecnologías

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- GitHub Actions y GitHub Pages
- Google Identity Services
- Google Sheets API
- PWA instalable en iPhone y otros dispositivos

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

## Instalar en iPhone

1. Abre la aplicación publicada usando Safari.
2. Pulsa **Compartir**.
3. Selecciona **Agregar a pantalla de inicio** y confirma con **Agregar**.

La aplicación se abrirá en modo independiente. El service worker guarda únicamente
los archivos estáticos de la interfaz; los tokens y las respuestas de Google Sheets
no se almacenan para uso sin conexión.

## Estructura de datos

La pestaña `Contratos` utiliza la columna `K` (`fecha_salida_real`). El estado
`CANCELADO` de `Pagos` representa mensualidades futuras anuladas al finalizar
anticipadamente un alquiler.

## Despliegue

Cada push a `main` ejecuta el workflow `.github/workflows/deploy.yml`, genera el
directorio `dist` y publica el resultado en GitHub Pages.

Las variables de repositorio `GOOGLE_CLIENT_ID`, `GOOGLE_SHEET_ID` y
`ALLOWED_GOOGLE_EMAIL` son opcionales y permiten sobrescribir los valores del
despliegue actual.
