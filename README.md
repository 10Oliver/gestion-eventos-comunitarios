# :sparkles: Gestión de eventos comunitarios

Un aplicación móvil, pensada para gestionar eventos y asistencias de cualquier indole.

### :wrench: Técnologías

- react-native
- expo-auth-session
- expo

## :rocket: Instalación (desarrollo)

### 0. Variables de entorno

Antes de compilar, copia el archivo de ejemplo y rellena el Client ID de X (Twitter). El valor se obtiene en el [Developer Portal de X](https://developer.twitter.com/):

```bash
cp .env.example .env
# Edita .env y reemplaza YOUR_X_CLIENT_ID
```

#### 1. Instalar paquetes 🗃️
``` bash
npm i
```

#### 2. Hacer el prebuild de la app 📦

``` bash
npx expo prebuild
```
> [!IMPORTANT]
> Para que inicie, es necesario tener un dispositivo conectado, ya sea un emulador o un dispositivo fisico conectado en modo de depuración

**Este paso es opcional**
Lista los dispositivos disponibles para contruir la app (debe de existir al menos uno)
``` bash
adb devices
```

#### 3. Construir la app en Android 📱
``` bash
npm run android
```



> [!NOTE]
> La primera vez, este proceso puede tarda una cantidad considerable de tiempo, hasta 30 minutos dependiendo del dispositivo

## 🔐 Autenticación con X (Twitter)

La app incluye inicio de sesión nativo con OAuth 2.0 + PKCE. Si aún no tienes configurado el proyecto en X:

1. Solicita acceso al portal de desarrolladores en [developer.twitter.com](https://developer.twitter.com).
2. Configura una app tipo **Native** y agrega como callback `com.gestioneventoscomunitarios.app://oauth2redirect/x` (importante incluir `://` para evitar errores en el portal).
3. Copia el **Client ID** en el archivo `.env` (variable `EXPO_PUBLIC_X_CLIENT_ID`).
4. Ejecuta `npx expo prebuild` y luego `npm run android` con el dispositivo conectado.

> [!WARNING]
> Actualmente X solo entrega el correo del usuario a través de OAuth 1.0a (`account/verify_credentials`). El flujo OAuth 2.0 usado por Expo **no devuelve email**, aunque actives “Request email from users”. Si lo necesitas obligatoriamente, deberás exponer un backend propio que complete ese intercambio y le envíe el correo a la app.

Consulta `docs/x-auth-setup.md` para una guía detallada paso a paso.

## 🛠️ Comandos adicionales

#### Limpiar el prebuild

```
# Entrar a la carpeta android
cd android

# Limpiar el gradel
 .\gradlew clean

# Regresar a la carpeta
cd ..
```

#### Desinstalar la app (para asegurar una instalación limpia)
``` bash
adb uninstall com.gestioneventoscomunitarios.app
```
