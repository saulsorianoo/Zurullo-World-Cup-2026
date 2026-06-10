import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7s3jhusPZC9PwjfwZMtFO30x4Brk3rTI",
  authDomain: "zurullo-world-cup.firebaseapp.com",
  projectId: "zurullo-world-cup",
  storageBucket: "zurullo-world-cup.firebasestorage.app",
  messagingSenderId: "944546503981",
  appId: "1:944546503981:web:60b453ea3971b516c807a4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Fetching profiles collection...");
    const snap = await getDocs(collection(db, "profiles"));
    console.log("Profiles count:", snap.size);
    snap.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (error) {
    console.error("Error fetching profiles:", error.message);
  }
}

test();
