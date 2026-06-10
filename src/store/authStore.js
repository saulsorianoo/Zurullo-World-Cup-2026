import { create } from 'zustand';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const useAuthStore = create((set, get) => ({
  user: null,         // Firebase Auth user
  profile: null,      // Firestore user profile
  loading: true,
  error: null,

  // Initialize auth listener
  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileRef = doc(db, 'profiles', firebaseUser.uid);
          const profileSnap = await getDoc(profileRef);
          
          let profile = null;
          if (profileSnap.exists()) {
            profile = profileSnap.data();
          } else {
            // El usuario existe en Auth pero no en Firestore (ej. falló por reglas de seguridad antiguas)
            // Lo creamos automáticamente para reparar su cuenta.
            const newProfile = {
              uid:           firebaseUser.uid,
              username:      firebaseUser.displayName || firebaseUser.email.split('@')[0],
              email:         firebaseUser.email,
              displayName:   firebaseUser.displayName || firebaseUser.email.split('@')[0],
              isAdmin:       false,
              entryPaid:     false,
              rouletteTeamId: null,
              rouletteGoals: 0,
              matchPoints:   0,
              bonusPoints:   0,
              totalPoints:   0,
              createdAt:     new Date().toISOString(),
            };
            await setDoc(profileRef, newProfile);
            profile = newProfile;
          }

          set({ user: firebaseUser, profile, loading: false, error: null });
        } catch (err) {
          set({ user: firebaseUser, profile: null, loading: false });
        }
      } else {
        set({ user: null, profile: null, loading: false });
      }
    });
    return unsubscribe;
  },

  // Login
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      set({ error: getAuthErrorMessage(err.code), loading: false });
      throw err;
    }
  },

  // Register
  register: async (email, password, username) => {
    set({ loading: true, error: null });
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
      
      // Create Firestore profile
      await setDoc(doc(db, 'profiles', user.uid), {
        uid:           user.uid,
        username,
        email,
        displayName:   username,
        isAdmin:       false,
        entryPaid:     false,
        rouletteTeamId: null,
        rouletteGoals: 0,
        matchPoints:   0,
        bonusPoints:   0,
        totalPoints:   0,
        createdAt:     new Date().toISOString(),
      });
    } catch (err) {
      set({ error: getAuthErrorMessage(err.code), loading: false });
      throw err;
    }
  },

  // Logout
  logout: async () => {
    await signOut(auth);
    set({ user: null, profile: null });
  },

  // Refresh profile from Firestore
  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;
    const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
    if (profileSnap.exists()) {
      set({ profile: profileSnap.data() });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if current user is admin
  isAdmin: () => {
    const { profile } = get();
    return profile?.isAdmin === true;
  },
}));

function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found':       'No existe ningún usuario con ese email.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/email-already-in-use': 'Este email ya está registrado.',
    'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
    'auth/invalid-email':        'El formato del email no es válido.',
    'auth/too-many-requests':    'Demasiados intentos fallidos. Espera un momento.',
    'auth/invalid-credential':   'Email o contraseña incorrectos.',
  };
  return messages[code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
}

export default useAuthStore;
