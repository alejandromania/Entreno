# Entreno — app con backend

Esta carpeta contiene tu app de entrenamiento (`public/index.html`, el mismo frontend que ya tenías, con pequeños añadidos) más un backend (`server.js`) para que los datos se guarden en un servidor y así el iPhone y el PC vean siempre lo mismo, en vez de cada uno tener su copia suelta en el navegador.

Componentes:
- **Servidor** (Node + Express): sirve la app y expone una API con tus datos.
- **Base de datos** en [Turso](https://turso.tech) (gratis): donde vive de verdad la información (sesiones, récords, pesos), para que no se pierda si el servidor se reinicia.
- **Hosting** en [Render](https://render.com) (gratis): donde se ejecuta el servidor, con una URL fija tipo `https://entreno-tuusuario.onrender.com`.
- **Contraseña**: la app pide una contraseña la primera vez en cada dispositivo, para que no sea pública.

No hace falta que sepas programar para desplegarlo, solo ir siguiendo estos pasos.

## 1. Crear la base de datos en Turso

1. Ve a https://turso.tech y crea una cuenta gratuita (puedes entrar con GitHub).
2. En el panel, crea una base de datos nueva (botón "Create Database"). Ponle el nombre que quieras, por ejemplo `entreno`.
3. Una vez creada, entra en ella y busca la sección de conexión/credenciales. Necesitas dos datos:
   - La **URL** de la base de datos (empieza por `libsql://...`).
   - Un **token de autenticación** (auth token) — normalmente hay un botón "Create Token" o "Generate Token".
4. Guarda esos dos valores, los necesitarás en el paso 3.

## 2. Subir el proyecto a GitHub

Render despliega desde un repositorio de GitHub.

1. Crea una cuenta en https://github.com si no tienes.
2. Crea un repositorio nuevo (puede ser privado), por ejemplo `entreno-app`.
3. Sube el contenido de esta carpeta a ese repositorio. Si nunca has usado git, la forma más sencilla es:
   - En la página del repositorio en GitHub, usa la opción de subir archivos ("uploading an existing file") y arrastra todos los archivos y carpetas de este proyecto (incluida la carpeta `public/`), **excepto** `node_modules` y `.env` si existieran.

## 3. Desplegar en Render

1. Ve a https://render.com y crea una cuenta gratuita (puedes entrar con GitHub, así te resultará más fácil conectar el repositorio).
2. En el panel, pulsa "New +" → "Web Service".
3. Conecta tu repositorio `entreno-app` de GitHub.
4. Configura:
   - **Name**: lo que quieras, por ejemplo `entreno`.
   - **Runtime**: Node.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free.
5. En la sección "Environment Variables" añade estas tres:
   - `APP_PASSWORD` → la contraseña que quieras usar para entrar en la app.
   - `TURSO_DATABASE_URL` → la URL que copiaste de Turso (`libsql://...`).
   - `TURSO_AUTH_TOKEN` → el token que copiaste de Turso.
6. Pulsa "Create Web Service". Render instalará todo y en un par de minutos te dará una URL como `https://entreno-xxxx.onrender.com`. Esa es tu app.

Nota sobre el plan gratuito de Render: si la app no se usa durante un rato, el servidor "se duerme" y la primera vez que la abres después de un tiempo tarda unos segundos extra en despertar. Es normal, no se pierden datos (esos viven en Turso, no en Render).

## 4. Instalar el icono en el iPhone

1. Abre la URL de tu app (la de Render) en Safari en el iPhone (tiene que ser Safari, no Chrome, para que funcione "Añadir a pantalla de inicio").
2. Introduce tu contraseña la primera vez.
3. Pulsa el botón de compartir (el cuadrado con la flecha hacia arriba) y elige "Añadir a pantalla de inicio".
4. Te aparecerá un icono como el de cualquier otra app, y al abrirlo ya no verás la barra de Safari.

## 5. Verla desde el PC

Simplemente abre la misma URL de Render en cualquier navegador del PC e introduce la contraseña. Verás los mismos datos que en el iPhone (puede haber unos segundos de retraso entre que guardas algo en un dispositivo y aparece en el otro si recargas justo en ese momento, pero normalmente es instantáneo).

## Notas sobre cómo funciona por dentro

- La app sigue guardando una copia en el propio navegador (`localStorage`), así que si te quedas sin conexión puedes seguir viendo y anotando datos con normalidad; en cuanto recupera la conexión, sincroniza con el servidor automáticamente.
- En la pestaña **Datos** de la app verás un aviso de "Sincronizado" con la hora, o un aviso si no ha podido conectar con el servidor.
- Ahí también hay un botón "Cerrar sesión" por si algún día quieres pedir la contraseña de nuevo en ese dispositivo (por ejemplo, si cambias la contraseña).
- Los "récords iniciales" que ya traía la app (`RECORDS_INICIALES` en el código) siguen ahí tal cual; como decidiste empezar de cero, no se ha migrado ningún dato que tuvieras guardado en el navegador antiguo. Si en algún momento quieres recuperarlos, dime y lo preparamos (la propia app tiene en la pestaña "Datos" una función de exportar/restaurar que puede servir de puente).

## Desarrollo/pruebas en tu propio ordenador (opcional)

Si en algún momento quieres probar cambios en tu ordenador antes de subirlos:

```
npm install
cp .env.example .env   # y edita .env con tus valores
npm start
```

Si no rellenas `TURSO_DATABASE_URL`, usará un archivo `local.db` en esta misma carpeta en vez de Turso — útil solo para probar, no para el uso real desde el móvil y el PC.
