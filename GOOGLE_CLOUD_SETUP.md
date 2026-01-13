# Guía Completa: Configuración de Google Cloud para Google Calendar

Esta guía te llevará paso a paso para configurar Google Cloud Console y obtener las credenciales necesarias para que la integración de Google Calendar funcione en tu aplicación.

---

## 📋 Requisitos Previos

- Una cuenta de Google (Gmail o Google Workspace)
- Acceso a Google Cloud Console (https://console.cloud.google.com)
- Tu aplicación Next.js corriendo en `http://localhost:3000` (o la URL de producción)

---

## 🚀 Paso 1: Crear un Proyecto en Google Cloud

1. **Ve a Google Cloud Console**

   - Abre tu navegador y visita: https://console.cloud.google.com
   - Inicia sesión con tu cuenta de Google

2. **Crear un Nuevo Proyecto**

   - En la parte superior de la página, verás un selector de proyectos (al lado del logo de Google Cloud)
   - Haz clic en el selector y luego en **"Nuevo proyecto"** (o "New Project")
   - Se abrirá un modal

3. **Configurar el Proyecto**

   - **Nombre del proyecto**: Ingresa un nombre descriptivo, por ejemplo: `weekly-task-organizer` o `ramon-calendar-integration`
   - **Organización**: Déjalo como está (si no tienes una organización, se creará sin ella)
   - **Ubicación**: Selecciona la ubicación que prefieras (no afecta la funcionalidad)
   - Haz clic en **"Crear"** (o "Create")

4. **Seleccionar el Proyecto**
   - Una vez creado, el proyecto debería seleccionarse automáticamente
   - Si no, usa el selector de proyectos en la parte superior y selecciona el proyecto que acabas de crear
   - Verifica que el nombre del proyecto aparezca en la barra superior

---

## 🔌 Paso 2: Habilitar Google Calendar API

1. **Ir a la Biblioteca de APIs**

   - En el menú lateral izquierdo (☰), busca y haz clic en **"APIs y servicios"** → **"Biblioteca"** (o "APIs & Services" → "Library")
   - También puedes ir directamente a: https://console.cloud.google.com/apis/library

2. **Buscar Google Calendar API**

   - En el buscador de la parte superior, escribe: `Google Calendar API`
   - Haz clic en el resultado que dice **"Google Calendar API"** (debería tener el logo de un calendario)

3. **Habilitar la API**
   - En la página de detalles de la API, verás un botón grande **"HABILITAR"** (o "ENABLE")
   - Haz clic en ese botón
   - Espera unos segundos mientras se habilita
   - Verás un mensaje de confirmación y la página cambiará mostrando estadísticas de uso

---

## 🔐 Paso 3: Configurar la Pantalla de Consentimiento OAuth

Esta pantalla es lo que verá Ramon cuando autorice tu aplicación a acceder a su calendario.

1. **Ir a la Configuración de OAuth**

   - En el menú lateral, ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"** (o "APIs & Services" → "OAuth consent screen")
   - También puedes ir a: https://console.cloud.google.com/apis/credentials/consent

2. **Seleccionar el Tipo de Usuario**

   - Te preguntará: **"¿Qué tipo de usuarios necesitas?"**
   - Selecciona **"Externo"** (External) - esto permite que cualquier cuenta de Google use tu app
   - Haz clic en **"Crear"** (Create)

3. **Completar la Información de la App (Paso 1: Información de la aplicación)**

   - **Nombre de la aplicación**: Por ejemplo, `Weekly Task Organizer` o `Ramon Calendar Sync`
   - **Correo electrónico de soporte del usuario**: Tu email (el que usas para Google Cloud)
   - **Logo de la aplicación**: (Opcional) Puedes subir un logo si tienes uno
   - **Dominio de inicio de sesión autorizado**: (Opcional) Déjalo vacío por ahora
   - **Correo electrónico del desarrollador**: Tu email (se rellena automáticamente)
   - Haz clic en **"Guardar y continuar"** (Save and Continue)

4. **Configurar Ámbitos (Paso 2: Ámbitos)**

   - Este paso define qué permisos pedirá tu aplicación
   - Haz clic en **"Agregar o quitar ámbitos"** (Add or Remove Scopes)
   - En el panel que se abre, busca y selecciona:
     - ✅ `.../auth/calendar` (Google Calendar API - acceso completo al calendario)
   - Haz clic en **"Actualizar"** (Update)
   - Haz clic en **"Guardar y continuar"** (Save and Continue)

5. **Usuarios de prueba (Paso 3: Usuarios de prueba)**

   - **IMPORTANTE**: Si tu app está en modo "Prueba" (Testing), solo los usuarios que agregues aquí podrán autorizar la app
   - Haz clic en **"+ Agregar usuarios"** (Add Users)
   - Ingresa el **email de la cuenta de Google de Ramon** (la que usará para conectar su calendario)
   - Haz clic en **"Agregar"** (Add)
   - Haz clic en **"Guardar y continuar"** (Save and Continue)

6. **Resumen (Paso 4: Resumen)**
   - Revisa la información
   - Haz clic en **"Volver al panel"** (Back to Dashboard)

**Nota**: Si quieres que cualquier usuario pueda usar la app sin estar en la lista de prueba, necesitarás publicar la app (requiere verificación de Google, proceso más largo). Para desarrollo y uso personal, el modo "Prueba" con usuarios de prueba es suficiente.

---

## 🔑 Paso 4: Crear Credenciales OAuth 2.0

1. **Ir a Credenciales**

   - En el menú lateral, ve a **"APIs y servicios"** → **"Credenciales"** (o "APIs & Services" → "Credentials")
   - También puedes ir a: https://console.cloud.google.com/apis/credentials

2. **Crear Credenciales OAuth**

   - En la parte superior de la página, haz clic en **"+ CREAR CREDENCIALES"** (Create Credentials)
   - Selecciona **"ID de cliente de OAuth 2.0"** (OAuth 2.0 Client ID)

3. **Configurar el ID de Cliente**

   - **Tipo de aplicación**: Selecciona **"Aplicación web"** (Web application)
   - **Nombre**: Ingresa un nombre descriptivo, por ejemplo: `Weekly Task Organizer Web Client`

4. **Configurar URIs de Redirección Autorizadas**

   - Esta es la parte **MÁS IMPORTANTE**. Aquí debes agregar las URLs a las que Google redirigirá después de la autorización.

   **Para Desarrollo (Localhost)**:

   - Haz clic en **"+ Agregar URI"** (Add URI)
   - Ingresa exactamente: `http://localhost:3000/api/google/auth/callback`
   - Presiona Enter o haz clic fuera del campo

   **Para Producción (cuando despliegues)**:

   - Haz clic en **"+ Agregar URI"** nuevamente
   - Ingresa: `https://tu-dominio.com/api/google/auth/callback`
   - Reemplaza `tu-dominio.com` con tu dominio real (ej: `weekly-tasks.vercel.app`)

   **IMPORTANTE**:

   - Las URLs deben coincidir **exactamente** (incluyendo `http://` vs `https://`, puertos, y rutas)
   - No agregues barras finales (`/`) a menos que tu ruta las tenga
   - Puedes agregar múltiples URIs (una para desarrollo, otra para producción)

5. **Crear el ID de Cliente**

   - Haz clic en **"Crear"** (Create)
   - Se abrirá un modal con tus credenciales

6. **Copiar las Credenciales**
   - **⚠️ MUY IMPORTANTE**: Copia estos valores AHORA, porque no podrás ver el "Client Secret" de nuevo después de cerrar este modal
   - **ID de cliente** (Client ID): Algo como `123456789-abcdefghijklmnop.apps.googleusercontent.com`
   - **Secreto de cliente** (Client Secret): Algo como `GOCSPX-abcdefghijklmnopqrstuvwxyz`
   - **Guárdalos en un lugar seguro** (por ejemplo, en un archivo de texto temporal o en un gestor de contraseñas)

---

## ⚙️ Paso 5: Configurar Variables de Entorno en tu Proyecto

1. **Crear o Editar `.env.local`**

   - En la raíz de tu proyecto Next.js, crea o edita el archivo `.env.local`
   - Este archivo NO debe subirse a Git (ya debería estar en `.gitignore`)

2. **Agregar las Variables**
   - Abre `.env.local` y agrega las siguientes líneas:

```bash
# Google OAuth Credentials
GOOGLE_CLIENT_ID=tu_client_id_aqui
GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/auth/callback

# App URL (para desarrollo)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Reemplazar los Valores**
   - Reemplaza `tu_client_id_aqui` con el **ID de cliente** que copiaste en el paso anterior
   - Reemplaza `tu_client_secret_aqui` con el **Secreto de cliente** que copiaste
   - **NO** pongas comillas alrededor de los valores
   - **NO** dejes espacios antes o después del signo `=`

**Ejemplo real** (no uses estos valores, son solo un ejemplo del formato):

```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/auth/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Para Producción**

   **IMPORTANTE**: Cuando despliegues tu app (Vercel, Netlify, etc.), debes configurar las siguientes variables de entorno en tu plataforma de hosting:

   ```bash
   # Variables requeridas
   GOOGLE_CLIENT_ID=tu_client_id_aqui
   GOOGLE_CLIENT_SECRET=tu_client_secret_aqui

   # URL de tu app en producción (ejemplo para Vercel)
   NEXT_PUBLIC_APP_URL=https://tu-dominio.vercel.app

   # Opcional: Si quieres especificar explícitamente la URI de redirección
   # Si no la especificas, se construirá automáticamente como: ${NEXT_PUBLIC_APP_URL}/api/google/auth/callback
   GOOGLE_REDIRECT_URI=https://tu-dominio.vercel.app/api/google/auth/callback

   # Opcional pero recomendado: Un secreto fijo para firmar el estado
   STATE_SECRET=tu-secreto-aleatorio-muy-seguro-aqui
   ```

   **Pasos adicionales**:

   1. Ve a Google Cloud Console → Credenciales → Tu OAuth 2.0 Client ID
   2. En "URIs de redirección autorizadas", agrega tu URL de producción:
      - `https://tu-dominio.vercel.app/api/google/auth/callback`
   3. Asegúrate de que la URI coincida **exactamente** (incluyendo `https://`, sin barra final)
   4. Guarda los cambios en Google Cloud Console
   5. Espera unos minutos para que los cambios se propaguen

---

## ✅ Paso 6: Verificar la Instalación

1. **Instalar Dependencias** (si aún no lo has hecho)

   ```bash
   npm install
   ```

   Esto instalará el paquete `googleapis` que agregamos al `package.json`

2. **Reiniciar el Servidor de Desarrollo**

   - Si tu servidor Next.js está corriendo, deténlo (Ctrl+C)
   - Inicia de nuevo:

   ```bash
   npm run dev
   ```

   - Esto es importante para que Next.js cargue las nuevas variables de entorno

3. **Probar la Conexión**
   - Abre tu app en `http://localhost:3000`
   - Cambia a la vista de **Administrator**
   - Busca el botón **"Connect Google Calendar"** en el header
   - Haz clic en él
   - Deberías ser redirigido a la pantalla de consentimiento de Google
   - Inicia sesión con la cuenta de Google de Ramon (debe estar en la lista de usuarios de prueba)
   - Autoriza los permisos
   - Deberías ser redirigido de vuelta a tu app con `?google=connected` en la URL

---

## 🐛 Solución de Problemas Comunes

### Error: "redirect_uri_mismatch"

- **Causa**: La URI de redirección en tu código no coincide exactamente con la que configuraste en Google Cloud
- **Solución**:
  - Verifica que en Google Cloud Console, en las "URIs de redirección autorizadas", tengas exactamente: `http://localhost:3000/api/google/auth/callback`
  - Verifica que en tu `.env.local`, `GOOGLE_REDIRECT_URI` tenga el mismo valor
  - Verifica que no haya espacios extra o caracteres especiales

### Error: "access_denied" o "invalid_client"

- **Causa**: Las credenciales (Client ID o Client Secret) son incorrectas
- **Solución**:
  - Verifica que copiaste correctamente el Client ID y Client Secret
  - Verifica que no hay espacios extra en `.env.local`
  - Reinicia el servidor de desarrollo después de cambiar `.env.local`

### Error: "User is not authorized"

- **Causa**: La cuenta de Google que estás usando no está en la lista de "Usuarios de prueba"
- **Solución**:
  - Ve a Google Cloud Console → OAuth consent screen → Usuarios de prueba
  - Agrega el email de la cuenta que estás intentando usar

### La app no redirige después de autorizar

- **Causa**: Puede ser un problema con la ruta de callback o con el código del callback
- **Solución**:
  - Verifica que la ruta `/api/google/auth/callback` existe en tu proyecto
  - Revisa la consola del navegador y los logs del servidor para ver errores específicos

### Variables de entorno no se cargan

- **Causa**: Next.js necesita reiniciarse para cargar nuevas variables de entorno
- **Solución**:
  - Detén el servidor (Ctrl+C)
  - Inicia de nuevo con `npm run dev`
  - Verifica que `.env.local` está en la raíz del proyecto (no en una subcarpeta)

### Funciona en local pero no en producción

- **Causa más común**: La URI de redirección no coincide o no está configurada correctamente
- **Soluciones**:

  1. **Verifica las variables de entorno en producción**:

     - Asegúrate de que `NEXT_PUBLIC_APP_URL` esté configurada con tu URL de producción (ej: `https://tu-dominio.vercel.app`)
     - Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén configuradas
     - Opcionalmente, configura `GOOGLE_REDIRECT_URI` explícitamente

  2. **Verifica en Google Cloud Console**:

     - Ve a Google Cloud Console → Credenciales → Tu OAuth 2.0 Client ID
     - En "URIs de redirección autorizadas", debe estar:
       - `http://localhost:3000/api/google/auth/callback` (para desarrollo)
       - `https://tu-dominio.vercel.app/api/google/auth/callback` (para producción)
     - Las URLs deben coincidir **exactamente** (mismo protocolo, mismo dominio, misma ruta)

  3. **Revisa los logs de producción**:

     - En Vercel: Ve a tu proyecto → Deployments → Click en el deployment → Logs
     - Busca mensajes que empiecen con "Google Callback:" o "OAuth Client:"
     - Verifica qué `redirectUri` se está usando y qué `origin` se está detectando

  4. **Problema común: STATE_SECRET diferente**:

     - Si `STATE_SECRET` no está configurado, se usa `GOOGLE_CLIENT_SECRET` como fallback
     - Si cambias `GOOGLE_CLIENT_SECRET` entre local y producción, el estado firmado no coincidirá
     - **Solución**: Configura `STATE_SECRET` explícitamente con el mismo valor en local y producción

  5. **Problema común: Código OAuth expirado**:
     - Los códigos de OAuth expiran rápidamente (unos minutos)
     - Si demoras mucho entre hacer clic en "Connect" y autorizar, el código puede expirar
     - **Solución**: Intenta conectar de nuevo inmediatamente después de hacer clic

---

## 📝 Checklist Final

Antes de considerar que todo está configurado, verifica:

- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Calendar API habilitada
- [ ] Pantalla de consentimiento OAuth configurada
- [ ] Usuario de prueba (Ramon) agregado en OAuth consent screen
- [ ] Credenciales OAuth 2.0 creadas (tipo "Aplicación web")
- [ ] URI de redirección agregada: `http://localhost:3000/api/google/auth/callback`
- [ ] Client ID y Client Secret copiados y guardados
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor reiniciado después de configurar variables de entorno
- [ ] Prueba de conexión exitosa desde la app

---

## 🔒 Seguridad

- **NUNCA** subas `.env.local` a Git (debería estar en `.gitignore`)
- **NUNCA** compartas tu Client Secret públicamente
- En producción, usa variables de entorno del hosting (Vercel, Netlify, etc.) en lugar de archivos `.env`
- Considera usar diferentes credenciales para desarrollo y producción

---

## 📚 Recursos Adicionales

- [Documentación oficial de Google Calendar API](https://developers.google.com/calendar/api)
- [Guía de OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

¡Listo! Con estos pasos, tu integración de Google Calendar debería funcionar correctamente. Si encuentras algún problema, revisa la sección de "Solución de Problemas" o verifica los logs de tu aplicación.
