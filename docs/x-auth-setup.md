# Configuración de autenticación con X (Twitter)

Sigue esta guía antes de intentar compilar la app con `npm run android`.

## 1. Crear la cuenta y acceso de desarrollador

1. Regístrate en [https://twitter.com](https://twitter.com) si aún no tienes una cuenta de X.
2. Ingresa a [https://developer.twitter.com](https://developer.twitter.com) y en la barra lateral izquierda (actualizada en 2025) selecciona **Developer Portal** > **Apply**.
   - El formulario solicita: propósito de la app, tipo de datos que consumirás y forma de autenticación. Describe que solo leerás el perfil del usuario para iniciar sesión.
   - Confirma el correo y espera la aprobación (puede tardar desde minutos hasta 24 h).
3. Una vez aprobada, en la misma barra lateral selecciona **Projects & Apps**. Verás una tarjeta llamada **Default Project**; abrela y pulsa **Add App** > **Create new App**.

## 2. Configurar la app en el portal de X (UI noviembre 2025)

1. En la página de tu app selecciona el tab **User authentication settings** (está debajo del título de la app, junto a *Keys and tokens* y *App settings*).
2. Pulsa **Set up** dentro de *User authentication settings* y completa el formulario (tal como aparece en la captura que compartiste):
   - **App permissions** → selecciona **Read** (la primera opción) y, si tu caso de uso lo exige, activa **Request email from users** tal como se muestra en la captura adjunta. Aun con ese toggle activo, X solo expone el correo mediante OAuth 1.0a (`account/verify_credentials`), no en el flujo OAuth 2.0 que necesita Expo.
   - **Type of App** → *Native App*.
   - **Callback URI / Redirect URL** → `com.gestioneventoscomunitarios.app://oauth2redirect/x` (nota el `://`; si usas `:/` aparece el error rojo *Invalid callback url*).
   - **Website URL** → puedes reutilizar la landing del proyecto, por ejemplo `https://gestioneventoscomunitarios.com`.
   - **Terms of Service / Privacy** → si aún no existen, puedes usar URLs temporales (ej. Google Docs público). Más adelante se podrán actualizar.
    - **Scopes** (marcar las casillas visibles en la nueva UI tipo checklist):
     - `tweet.read`
     - `users.read`
     - `offline.access`
   - **Granular permissions** no es necesario modificarlo: deja el acceso de solo lectura.
3. Guarda los cambios. La pantalla mostrará una tarjeta con **App info** donde verás el valor **Client ID (OAuth 2.0)**; ahí mismo hay un botón “Copy”.

> [!TIP]
> Si necesitas ubicar de nuevo esta sección, en la navegación izquierda selecciona **Projects & Apps → Overview → (tu proyecto) → (tu app)** y luego el tab **User authentication settings**.

> [!NOTE]
> No necesitas exponer el Client Secret en la app móvil gracias al flujo OAuth 2.0 con PKCE.

> [!WARNING]
> Si ves el mensaje *Invalid callback url. Please check the characters used*, revisa que la URI comience con `com.gestioneventoscomunitarios.app://` (dos diagonales) y que no tenga espacios adicionales. El portal valida exactamente este formato para apps nativas.

> [!IMPORTANT]
> Con el flujo OAuth 2.0 + PKCE (requerido para Expo/React Native) X no envía el correo del usuario ni siquiera cuando “Request email from users” está habilitado. Si tu app debe obtener el correo directamente desde X, la única alternativa soportada hoy es implementar un backend que use OAuth 1.0a y el endpoint `GET account/verify_credentials?include_email=true`, y luego enviar ese dato a la app mediante tu propia API.

## 3. Compartir URIs y credenciales

Cuando quieras que otra persona (por ejemplo, yo) configure la app nativa, comparte los siguientes datos:

- **Callback URI principal:** `com.gestioneventoscomunitarios.app://oauth2redirect/x`
- **Scheme/base de la app:** `com.gestioneventoscomunitarios.app`
- **Client ID de OAuth 2.0:** El valor mostrado en el portal, sin espacios.

Puedes guardarlos en un archivo seguro `.env` o en un gestor de contraseñas y compartirlos mediante un canal cifrado (1Password share, ProtonMail, etc.).

## 4. Variables de entorno

1. Copia el archivo de ejemplo y agrega tu Client ID:

   ```bash
   cp .env.example .env
   ```
2. Edita `.env` y reemplaza `YOUR_X_CLIENT_ID` con el valor real de tu app en X.
3. Antes de compilar (por ejemplo, al usar `npm run android` o `eas build`), asegúrate de que el archivo `.env` esté presente y que la variable se cargue en el entorno del comando.

## 5. Prebuild y pruebas locales

1. Si ya tienes una carpeta `android/` generada, ejecuta nuevamente el prebuild para asegurar que los cambios en `app.json` y las variables se apliquen al proyecto nativo:

   ```bash
   npx expo prebuild
   ```
2. Conecta un emulador o dispositivo físico y corre:

   ```bash
   npm run android
   ```
3. Prueba ambos botones de inicio de sesión (Google y X). Ante cualquier error, revisa la consola Metro y los logs nativos `adb logcat`.

## 6. Producción y buenas prácticas

- En `eas.json`, crea perfiles de build que incluyan la variable `EXPO_PUBLIC_X_CLIENT_ID` a través de los *secret environments* de EAS.
- Si necesitas revocar el acceso de un usuario, usa el endpoint `https://api.twitter.com/2/oauth2/revoke` con el refresh token correspondiente.
- Considera persistir los `refresh_token` en una API segura (no en el dispositivo) si tu roadmap incluye funcionalidades que dependan de acciones prolongadas en X.

Con esto tendrás todo lo necesario para ejecutar el flujo de autenticación con X dentro de la aplicación Expo bare/Dev Client.
