# :sparkles: Gestión de eventos comunitarios

Un aplicación móvil, pensada para gestionar eventos y asistencias de cualquier indole.

### :wrench: Técnologías

- react-native
- expo-auth-session
- expo

#### Equipo de trabajo

- Oliver Alejandro Erazo Reyes – ER231663 
- René Francisco Guevara Alfaro – GA202826 
- Laura Sofía Pineda Castro – PC230111 

#### 🔗 Enlaces
- [Trello](https://trello.com/invite/b/692399855328270985f4cd8a/ATTIa902b3d6702001cc8521e2288614319d8396055B/gestion-de-eventos-comunitarios)
- [Figma](https://www.figma.com/design/dLRI7j44pmoBsqVQt0N90L/Actividades?node-id=7-391&t=5n8kJSaXiIqgf3KY-1)

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


## �🛠️ Comandos adicionales

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

## 📄 Licencia

Este proyecto está distribuido bajo la licencia Creative Commons Atribución – No Comercial 4.0 Internacional (CC BY-NC 4.0).

Esto significa que:

✔️ Puedes copiar y redistribuir el material en cualquier medio o formato

✔️ Puedes remezclar, transformar y crear obras derivadas

❗ No puedes usarlo con fines comerciales

✔️ Debes dar crédito apropiado, incluir un enlace a la licencia y especificar si realizaste cambios

🔗 Ver licencia completa:
https://creativecommons.org/licenses/by-nc/4.0/
##
