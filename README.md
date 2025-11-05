# :sparkles: Gestión de eventos comunitarios

Un aplicación móvil, pensada para gestionar eventos y asistencias de cualquier indole.

### :wrench: Técnologías

- react-native
- expo-auth-session
- expo

## :rocket: Instalación (desarrollo)

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
