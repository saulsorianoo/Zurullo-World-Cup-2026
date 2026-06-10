# Zurullo World Cup 2026 ⚽

Plataforma interactiva para gestionar la porra del Mundial de Fútbol 2026 entre amigos.

## 🚀 Setup Rápido

### 1. Clona el repositorio
```bash
git clone https://github.com/TU_USUARIO/Zurullo-World-Cup-2026.git
cd "Zurullo-World-Cup-2026"
npm install
```

### 2. Configura Firebase

1. Ve a [console.firebase.google.com](https://console.firebase.google.com/)
2. Crea un proyecto nuevo
3. Activa **Authentication** > Email/Password
4. Activa **Firestore Database** (modo producción)
5. Ve a Configuración del Proyecto > Tus Apps > Web > Agrega app
6. Copia las credenciales al archivo `.env`:

```bash
cp .env.example .env
# Edita .env con tus credenciales de Firebase
```

### 3. Configura las Reglas de Firestore

Ve a Firestore > Reglas y pega:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Perfiles: lectura pública, escritura propia
    match /profiles/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Predicciones: lectura pública, escritura propia Y antes del inicio del partido
    match /predictions/{predId} {
      allow read: if true;
      allow create, update: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
    }
    
    // Bonus: lectura pública, escritura propia
    match /bonus/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Partidos y config: solo lectura pública
    match /matches/{matchId} {
      allow read: if true;
      allow write: if false; // Solo desde consola/admin SDK
    }
    
    match /config/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 4. Inicia en local

```bash
npm run dev
# Abre http://localhost:5173/Zurullo-World-Cup-2026/
```

### 5. Conviértete en Admin

1. Regístrate en la app con tu email
2. Ve a Firestore Console > profiles > tu documento
3. Cambia `isAdmin` a `true`

### 6. Inicializa los partidos

1. Entra como admin en la app
2. Ve a `/admin` > pestaña "Setup"
3. Haz clic en **"Inicializar 104 Partidos en Firestore"**

---

## 🚀 Deploy a GitHub Pages

1. Cambia `base` en `vite.config.js` al nombre de tu repositorio
2. Asegúrate de tener un repositorio en GitHub
3. Ejecuta:

```bash
npm run deploy
```

Las variables de entorno de Firebase deben configurarse en GitHub > Settings > Secrets and Variables > Actions si usas GitHub Actions.

---

## 🔑 Variables de Entorno

| Variable | Descripción |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |
| `VITE_FDO_API_KEY` | API Key de football-data.org (goles ruleta) |

---

## ⚡ Stack Técnico

- **React 18** + Vite 6 (SPA)
- **TailwindCSS v3** (glassmorphism, dark mode)
- **Firebase** (Auth + Firestore en tiempo real)
- **Zustand** (estado global)
- **React Router v6** (HashRouter para GitHub Pages)
- **date-fns** (formateo de fechas en español)
- **lucide-react** (iconos)

## 🏆 Sistema de Puntuación

| Resultado | Puntos | Color |
|---|---|---|
| Marcador exacto | +3 | 🟢 Verde |
| Ganador/empate correcto | +1 | 🟡 Amarillo |
| Error total | 0 | 🔴 Rojo |
| Clasificado correcto (elim.) | +1 extra | 🔵 |
| Campeón del mundo | +10 | ⭐ |
| Subcampeón | +5 | ⭐ |
| Bota de oro | +5 | ⭐ |
| Gol selección ruleta | +1/gol | 🎡 |

## 💰 Premios

- **1er Lugar**: 50% del bote
- **2º Lugar**: 30% del bote  
- **3er Lugar**: 20% del bote
- Cuota de entrada: 10€ por jugador
