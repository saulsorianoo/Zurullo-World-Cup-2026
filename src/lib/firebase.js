// Firebase configuration
// Las claves de API de Firebase para web son públicas por diseño.
// La seguridad se gestiona mediante las reglas de Firestore, no ocultando la clave.

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'AIzaSyC7s3jhusPZC9PwjfwZMtFO30x4Brk3rTI',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'zurullo-world-cup.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'zurullo-world-cup',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'zurullo-world-cup.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '944546503981',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '1:944546503981:web:60b453ea3971b516c807a4',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// experimentalForceLongPolling: evita el transporte gRPC-Web/WebSocket que
// se bloquea en ciertos navegadores/redes (GitHub Pages, proxies, etc.)
// y usa HTTP long polling como fallback fiable.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
  experimentalForceLongPolling: true,
});

export default app;
