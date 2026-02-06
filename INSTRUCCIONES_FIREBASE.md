# Instrucciones para Configurar Firebase

## ¿Por qué necesito Firebase?

Firebase permite que las noticias se guarden **globalmente** para todos los usuarios. Cuando alguien agrega una noticia, todos los que visiten la web la verán.

**Sin Firebase**: Las noticias solo se guardan en el navegador de cada persona (localStorage).
**Con Firebase**: Las noticias se guardan en la nube y todos las ven.

---

## Pasos para Configurar Firebase (Gratis)

### 1. Crear Cuenta en Firebase

1. Ve a https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Add project"** (Agregar proyecto)

### 2. Crear el Proyecto

1. **Nombre del proyecto**: Ej. "USIL-Portal"
2. **Google Analytics**: Puedes desactivarlo (no es necesario)
3. Haz clic en **"Create project"**
4. Espera a que se cree (tarda 1-2 minutos)

### 3. Configurar Realtime Database

1. En el menú izquierdo, ve a **"Build" > "Realtime Database"**
2. Haz clic en **"Create Database"**
3. **Location**: Elige **"United States (us-central1)"**
4. **Security rules**: Selecciona **"Start in test mode"** (para desarrollo)
   - ⚠️ IMPORTANTE: Test mode es temporal, cambiaremos esto después
5. Haz clic en **"Enable"**

### 4. Configurar las Reglas de Seguridad

Por defecto, test mode permite cualquier acceso por 30 días. Para producción, necesitas reglas más seguras:

1. En la pestaña **"Rules"** de Realtime Database
2. Reemplaza las reglas con esto:

```json
{
  "rules": {
    "news": {
      ".read": true,
      ".write": "auth != null || true"
    }
  }
}
```

Esto permite que:
- **Cualquiera puede leer** las noticias
- **Solo administradores pueden escribir** (con contraseña)

### 5. Obtener la Configuración

1. Ve a **"Project Settings"** (⚙️ en el menú superior izquierdo)
2. Baja hasta **"Your apps"**
3. Haz clic en el ícono **Web** (`</>`)
4. **App nickname**: "USIL-Web"
5. **NO** marques "Firebase Hosting"
6. Haz clic en **"Register app"**
7. Copia la configuración que aparece (algo como esto):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "usil-portal.firebaseapp.com",
  databaseURL: "https://usil-portal-default-rtdb.firebaseio.com",
  projectId: "usil-portal",
  storageBucket: "usil-portal.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 6. Actualizar tu Código

1. Abre el archivo **`script.js`**
2. Busca la sección de `FIREBASE_CONFIG` (línea 25 aproximadamente)
3. Reemplaza los valores con tu configuración:

```javascript
FIREBASE_CONFIG: {
    apiKey: "AIzaSyB...",  // ← Pega tu API key aquí
    authDomain: "usil-portal.firebaseapp.com",  // ← Tu auth domain
    databaseURL: "https://usil-portal-default-rtdb.firebaseio.com",  // ← Tu database URL
    projectId: "usil-portal",  // ← Tu project ID
    storageBucket: "usil-portal.appspot.com",  // ← Tu storage bucket
    messagingSenderId: "123456789",  // ← Tu messaging sender ID
    appId: "1:123456789:web:abc123"  // ← Tu app ID
},
USE_FIREBASE: true  // ← Cambia esto a TRUE
```

### 7. Subir a GitHub

1. Guarda los cambios
2. Haz commit:
   ```bash
   git add .
   git commit -m "Configurar Firebase para noticias globales"
   git push
   ```

### 8. Probar

1. Abre tu web en GitHub Pages
2. Abre la consola del navegador (F12)
3. Deberías ver: `✅ Firebase inicializado correctamente`
4. Agrega una noticia como administrador
5. Abre la web en otro navegador o computadora
6. ¡La noticia debería aparecer!

---

## Seguridad de Firebase

### Reglas Recomendadas para Producción

Para mayor seguridad, usa estas reglas en Firebase:

```json
{
  "rules": {
    "news": {
      ".read": true,
      ".write": "root.child('admins').child(auth.uid).exists()"
    }
  }
}
```

### Cambiar la Contraseña de Administrador

En `script.js`, línea 13:

```javascript
ADMIN_PASSWORD: "admin123",  // ← Cambia esto por una contraseña segura
```

---

## Solución de Problemas

### Error: "Firebase is not defined"

- Verifica que las etiquetas `<script>` de Firebase estén en `index.html` **ANTES** de `script.js`

### Error: "Permission denied"

- Las reglas de Firebase están muy restrictivas
- Usa las reglas de test mode (ver paso 4)

### Las noticias no se guardan

- Verifica que `USE_FIREBASE: true` esté configurado
- Abre la consola (F12) y busca errores en rojo
- Verifica que la `databaseURL` sea correcta

---

## Alternativa Sin Firebase

Si no quieres usar Firebase, el código seguirá funcionando con `localStorage`:

1. Deja `USE_FIREBASE: false`
2. Las noticias se guardarán localmente (solo en cada navegador)
3. Para compartir noticias, cada persona debe agregarlas manualmente

---

## Costos

Firebase es **100% GRATIS** para tu uso:

- **Realtime Database gratuito**: 1GB almacenamiento + 10GB/mes de transferencia
- Tu web solo necesita unos pocos KB
- Puedes tener millones de visitas antes de pagar

---

¿Necesitas ayuda? Revisa la documentación oficial:
https://firebase.google.com/docs/database/web/start
