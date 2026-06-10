import { create } from 'zustand';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const useDataStore = create((set, get) => ({
  matchesData: {},      // matchId -> firestoreData
  predictions: {},      // matchId -> { uid: pred }
  profiles: [],         // array of all profiles
  profilesMap: {},      // uid -> profile
  bonusData: {},        // userId -> { bonus answers }
  config: {},           // general config (e.g. bonus locked)
  loading: true,        // Initial loading state
  initialized: false,

  resetInitialized: () => set({ initialized: false, loading: true }),

  initData: () => {
    if (get().initialized) return;
    
    let matchesLoaded = false;
    let profilesLoaded = false;

    const checkLoading = () => {
      if (matchesLoaded && profilesLoaded) {
        set({ loading: false, initialized: true });
      }
    };

    // Matches listener
    const unsubMatches = onSnapshot(collection(db, 'matches'), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      set({ matchesData: data });
      matchesLoaded = true;
      checkLoading();
    });

    // Profiles listener
    const unsubProfiles = onSnapshot(collection(db, 'profiles'), (snap) => {
      const data = snap.docs.map(d => d.data());
      const map = {};
      data.forEach(p => { map[p.uid] = p; });
      // Sort profiles by points descending for convenience
      data.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      set({ profiles: data, profilesMap: map });
      profilesLoaded = true;
      checkLoading();
    });

    // Predictions listener
    const unsubPreds = onSnapshot(collection(db, 'predictions'), (snap) => {
      const data = {};
      snap.docs.forEach(d => {
        const pred = d.data();
        if (!data[pred.matchId]) data[pred.matchId] = {};
        data[pred.matchId][pred.userId] = pred;
      });
      set({ predictions: data });
    });

    // Bonus listener
    const unsubBonus = onSnapshot(collection(db, 'bonus'), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); }); // Using userId as doc id
      set({ bonusData: data });
    });

    // Config listener
    const unsubConfig = onSnapshot(collection(db, 'config'), (snap) => {
      const data = {};
      snap.docs.forEach(d => { data[d.id] = d.data(); });
      set({ config: data });
    });

    return () => {
      unsubMatches();
      unsubProfiles();
      unsubPreds();
      unsubBonus();
      unsubConfig();
    };
  }
}));

export default useDataStore;
