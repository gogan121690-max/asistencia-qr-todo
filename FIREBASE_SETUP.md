# 🔥 GUÍA DE CONFIGURACIÓN DE FIREBASE

## ✅ TODO LO QUE HE PREPARADO:

### **1. APP ASISTENCIA (asistencia.html)**
- ✅ Escáner QR
- ✅ Pase de Lista con campos automáticos
- ✅ Registros con scroll horizontal
- ✅ Búsqueda de alumnos
- ✅ Firebase integrado
- ✅ Modo offline activado
- ✅ Indicador de sincronización
- ❌ Generador QR eliminado (ya tienes app separada)

### **2. FIREBASE CONFIGURADO**
- ✅ Modo offline-first
- ✅ Sincronización automática
- ✅ Guardado local + nube
- ✅ Multi-dispositivo

---

## 📋 PASO 1: CREAR PROYECTO FIREBASE (5 MINUTOS)

### **1.1 Ir a Firebase Console**
1. Abre: https://console.firebase.google.com
2. Click en "Agregar proyecto"

### **1.2 Configurar Proyecto**
1. **Nombre del proyecto:** `asistencia-qr` (o el que prefieras)
2. Click "Continuar"
3. **Google Analytics:** Puedes desactivarlo (no es necesario)
4. Click "Crear proyecto"
5. Espera 30 segundos
6. Click "Continuar"

### **1.3 Crear Aplicación Web**
1. En la página principal, click en el ícono `</>`  (Web)
2. **Nombre de la app:** `Asistencia QR Web`
3. ✅ Marcar "También configurar Firebase Hosting"
4. Click "Registrar app"

### **1.4 Copiar Configuración**
Te aparecerá algo así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "asistencia-qr-xxxxx.firebaseapp.com",
  projectId: "asistencia-qr-xxxxx",
  storageBucket: "asistencia-qr-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**¡GUARDA ESTO! Lo necesitarás en el paso 2**

---

## 📋 PASO 2: ACTIVAR FIRESTORE

### **2.1 Ir a Firestore**
1. En el menú izquierdo: Click en "Firestore Database"
2. Click en "Crear base de datos"

### **2.2 Configurar Seguridad**
1. Selecciona: **"Empezar en modo de prueba"**
   - Esto permite leer/escribir por 30 días
   - Después configuraremos reglas más seguras
2. Click "Siguiente"

### **2.3 Ubicación**
1. Selecciona: **"us-central"** (o la más cercana)
2. Click "Habilitar"
3. Espera 1 minuto

---

## 📋 PASO 3: CONFIGURAR LA APP

### **3.1 Editar asistencia.html**
1. Abre el archivo `asistencia.html`
2. Busca la línea ~150 que dice:
```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    ...
```

3. **REEMPLAZA** con tu configuración del Paso 1.4:
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxx",  // TU API KEY REAL
    authDomain: "asistencia-qr-xxxxx.firebaseapp.com",  // TU DOMINIO REAL
    projectId: "asistencia-qr-xxxxx",  // TU PROJECT ID REAL
    storageBucket: "asistencia-qr-xxxxx.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
```

4. **Guarda el archivo**

---

## 📋 PASO 4: PROBAR LA APP

### **4.1 Abrir la App**
1. Abre `asistencia.html` en tu navegador
2. Mira la esquina superior derecha
3. Deberías ver: **🟢 Online - Sincronizado**

✅ Si ves esto: ¡Firebase está funcionando!
❌ Si ves "🔴 Offline": Revisa la configuración

### **4.2 Primera Prueba**
1. Crea una lista de prueba:
   - Grado: 1
   - Grupo: A
   - Materia: Prueba
   - Escuela: Test
2. Click "Crear Lista"
3. Ve a Firebase Console > Firestore
4. Deberías ver una colección `listas` con tu lista

✅ Si la ves: ¡Sincronización funcionando!

---

## 📋 PASO 5: PROBAR MODO OFFLINE

### **5.1 En el Celular**
1. Abre la app
2. **Desactiva WiFi y datos**
3. Crea una asistencia
4. Mira el indicador: Debería decir **🔴 Offline - Sin conexión**
5. El registro se guarda localmente

### **5.2 Sincronizar**
1. **Activa WiFi**
2. Espera 2-3 segundos
3. El indicador cambia a: **🟡 Sincronizando...**
4. Luego: **🟢 Online - Sincronizado**
5. Ve a Firebase Console
6. ¡El registro apareció en la nube!

---

## 📋 PASO 6: PROBAR MULTI-DISPOSITIVO

### **6.1 Dispositivo 1 (Celular)**
1. Abre la app
2. Crea una lista: "2_B_MATEMATICAS_EPO_67"
3. Agrega un alumno escaneando QR

### **6.2 Dispositivo 2 (Tablet)**
1. Abre la misma app
2. Espera 2-3 segundos
3. Refresca la página
4. ¡Debería aparecer la lista "2_B_MATEMATICAS_EPO_67"!

✅ Si aparece: ¡Sincronización multi-dispositivo funcionando!

---

## 🔒 PASO 7: CONFIGURAR SEGURIDAD (IMPORTANTE)

### **7.1 Reglas de Seguridad**
Después de probar (antes de 30 días), configura reglas:

1. Firebase Console > Firestore > Reglas
2. Reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir solo si el usuario está autenticado
    // Para simplicidad, por ahora permitimos todo
    // IMPORTANTE: Configura autenticación después
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**NOTA:** Esto es temporal. Después debes configurar autenticación.

---

## 📊 ESTRUCTURA DE DATOS EN FIREBASE

### **Colecciones creadas:**

#### **1. listas**
```
listas/
  ├─ 3_A_DISEÑO_DIGITAL_EPO_67/
  │   ├─ nombre: "3_A_DISEÑO_DIGITAL_EPO_67"
  │   ├─ alumnos: [...]
  │   └─ updatedAt: timestamp
  │
  └─ 1_B_MATEMÁTICAS_PRIMARIA/
      ├─ nombre: "1_B_MATEMÁTICAS_PRIMARIA"
      ├─ alumnos: [...]
      └─ updatedAt: timestamp
```

#### **2. asistencias**
```
asistencias/
  ├─ JUAN_GARCIA_01_01_2026_09_00/
  │   ├─ nombre: "JUAN"
  │   ├─ apellidoPaterno: "GARCÍA"
  │   ├─ apellidoMaterno: "LÓPEZ"
  │   ├─ fecha: "01/01/2026"
  │   ├─ hora: "09:00"
  │   └─ timestamp: timestamp
  │
  └─ MARIA_PEREZ_01_01_2026_09_05/
      └─ ...
```

---

## ⚠️ LÍMITES GRATUITOS DE FIREBASE

### **Plan Spark (Gratis):**
- ✅ 1 GB de almacenamiento
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día
- ✅ 20,000 eliminaciones/día

### **¿Es suficiente para una escuela?**
**SÍ**, de sobra:
- Una escuela de 500 alumnos
- 30 días de asistencia
- = ~15,000 escrituras/mes
- = ~5,000 lecturas/mes

**Muy por debajo del límite diario**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### **Problema 1: "🔴 Offline" siempre**
**Solución:**
1. Verifica que copiaste correctamente el firebaseConfig
2. Revisa la consola del navegador (F12)
3. Busca errores en rojo

### **Problema 2: "Firebase is not defined"**
**Solución:**
1. Verifica tu conexión a internet
2. Los scripts de Firebase se cargan desde CDN
3. Intenta recargar la página

### **Problema 3: "Permission denied"**
**Solución:**
1. Ve a Firebase Console > Firestore > Reglas
2. Verifica que las reglas permitan escritura

### **Problema 4: No sincroniza entre dispositivos**
**Solución:**
1. Verifica que ambos dispositivos tengan internet
2. Refresca la página en ambos dispositivos
3. Espera 5-10 segundos

---

## 🎯 PRÓXIMOS PASOS

1. ✅ Configura Firebase (esta guía)
2. ⏳ Te enviaré la App de Calificaciones
3. ⏳ Ambas apps compartirán los mismos datos
4. ⏳ Archivos manifest.json actualizados
5. ⏳ Instrucciones para generar APKs

---

## 📞 VERIFICACIÓN FINAL

Antes de continuar, verifica:
- [ ] Firebase proyecto creado
- [ ] Firestore activado
- [ ] Configuración copiada en asistencia.html
- [ ] App muestra "🟢 Online"
- [ ] Creaste una lista de prueba
- [ ] La lista aparece en Firebase Console
- [ ] Probaste modo offline
- [ ] Sincronización funciona

**¿Todo listo?** ¡Continúo con la App de Calificaciones!
