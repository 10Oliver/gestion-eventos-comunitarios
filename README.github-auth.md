# Guía temporal para iniciar sesión con GitHub

Esta guía complementa al `README.md` original exclusivamente para la configuración de GitHub OAuth dentro de la app **Gestión de eventos comunitarios**. No modifica ni reemplaza los flujos existentes de Google o X.

## 1. Crear (o confirmar) tu cuenta de GitHub

1. Visita [https://github.com](https://github.com) y crea una cuenta nueva o inicia sesión con la que usarás para administrar las credenciales.
2. Verifica tu correo y habilita el factor de doble autenticación si todavía no lo tienes (GitHub lo exigirá para crear aplicaciones OAuth nuevas).

## 2. Registrar una GitHub OAuth App

1. Verifica que en `app.json` exista la propiedad `"owner": "Firearcher717"` (o el usuario de Expo que uses). Esto fuerza a Expo a generar el redirect como `https://auth.expo.io/@Firearcher717/...` incluso si no iniciaste sesión en la CLI.
   - Si cambias de cuenta, actualiza ese campo y vuelve a crear la build.
   - Sin el owner, Expo usará `@anonymous` y GitHub lo rechazará.
2. Entra a **Settings → Developer settings → OAuth Apps**.
3. Elige **New OAuth App** y completa los campos:
   - **Application name:** cualquier nombre reconocible, por ejemplo `Gestion Eventos Comunitarios (local)`.
   - **Homepage URL:** `https://gestioneventoscomunitarios.dev` (o la URL pública que tengas; es solo informativa).
   - **Authorization callback URL:** debes usar una URL HTTPS porque GitHub no acepta esquemas personalizados. Usa el proxy de Expo con el formato `https://auth.expo.io/@<tu_usuario_expo>/gestion-eventos-comunitarios`.
     - Si no recuerdas tu usuario en Expo, ejecuta `npx expo whoami` o revisa la sección **Account name** en [https://expo.dev](https://expo.dev).
     - En modo local, si no has iniciado sesión en Expo, la herramienta mostrará `@anonymous`. Puedes registrar temporalmente `https://auth.expo.io/@anonymous/gestion-eventos-comunitarios` y actualizarlo después.
4. Guarda la app y anota el **Client ID**.
5. Haz clic en **Generate a new client secret**. Copia el valor porque GitHub solo lo mostrará una vez.

> ℹ️ Aclaración importante: aunque compilamos la app directamente con `npm run android` (no usamos Expo Go), el proxy `https://auth.expo.io` sigue funcionando. GitHub redirige a esa URL (porque es HTTPS) y Expo reenvía la respuesta al esquema nativo `com.gestioneventoscomunitarios.app://oauth2redirect/github`, que la app ya reconoce.

## 3. Variables de entorno

1. Duplica el archivo de ejemplo si aún no lo tienes:
   ```bash
   cp .env.example .env
   ```
2. Abre `.env` y rellena los nuevos valores:
   ```bash
   EXPO_PUBLIC_GITHUB_CLIENT_ID=tu_client_id
   EXPO_PUBLIC_GITHUB_CLIENT_SECRET=tu_client_secret
   ```
3. (Opcional) Verifica que en `app.json` estén los campos `"owner"` y `"slug"`. El redirect real siempre será:
   ```text
   https://auth.expo.io/@<owner>/<slug>
   ```
   Si quieres confirmarlo desde la CLI, usa:
   ```bash
   npx expo config --type public --json | jq -r '.expo.owner + "/" + .expo.slug'
   ```
   …y luego arma manualmente la URL anterior.
4. Vuelve a compilar la app para que Metro incruste las variables (por ejemplo, `npm run android`).

> ⚠️ Estos valores se empacan en la app al no contar con backend. Úsalos solo para entornos internos y rota el secret si piensas distribuir builds públicas.

## 4. Repaso rápido de la configuración en Expo / Android

- El esquema `com.gestioneventoscomunitarios.app` ya está definido en `app.json` e instalado en Android mediante `intentFilters`, por lo que no necesitas pasos extra.
- Existe la pantalla `app/oauth2redirect/github.tsx`, que solamente muestra un loader en lo que se completa la navegación.
- Toda la lógica de autenticación vive en `app/index.tsx` usando `expo-auth-session` + PKCE.

## 5. Flujo final dentro de la app

1. Abre la app en tu dispositivo físico con `npm run android`.
2. Pulsa **Continuar con GitHub**.
3. GitHub mostrará la pantalla de autorización. Revisa que la URL de callback corresponda a `auth.expo.io`.
4. Acepta los permisos `read:user` y `user:email`.
5. La app recuperará tu perfil y el correo (si el correo público está oculto se solicitará mediante el endpoint `/user/emails`).
6. La sesión se guarda en la base de datos SQLite igual que con Google o X, y aterrizas en `/(tabs)/home`.

## 6. Troubleshooting

| Problema | Causa probable | Solución |
| --- | --- | --- |
| `Be careful! The redirect_uri is not associated...` | El valor registrado en GitHub no coincide con el generado por Expo (ej. `@anonymous`) | Asegúrate de definir `owner` en `app.json`, vuelve a compilar y confirma la URL real con `npx expo config --type public`. |
| GitHub rechaza la callback | La URL no es HTTPS o no coincide con el registro | Verifica que usaste `https://auth.expo.io/@<usuario>/gestion-eventos-comunitarios` al pie de la letra. |
| Botón deshabilitado | Faltan variables `EXPO_PUBLIC_GITHUB_*` | Revisa `.env`, elimina el caché de Metro (`npx expo start -c`) y recompila. |
| No llega el correo del usuario | El perfil lo tiene oculto | GitHub devuelve una lista en `/user/emails`; asegúrate de que tu cuenta tenga al menos un correo verificado y marcado como primario. |
| Error "No access token returned" | Secret inválido o app regenerada | Genera un nuevo secret y actualiza el `.env`. |

## 7. Próximos pasos recomendados

- Montar un backend ligero que gestione el intercambio de código por token para no exponer el client secret.
- Registrar un dominio propio y, si lo deseas, montar un redireccionamiento en tu infraestructura (en vez del proxy de Expo) para cumplir con la restricción de HTTPS.
- Añadir pruebas end-to-end que cubran el flujo completo de GitHub usando mocks del endpoint `/user`.
