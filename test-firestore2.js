import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7s3jhusPZC9PwjfwZMtFO30x4Brk3rTI",
  authDomain: "zurullo-world-cup.firebaseapp.com",
  projectId: "zurullo-world-cup",
  storageBucket: "zurullo-world-cup.firebasestorage.app",
  messagingSenderId: "944546503981",
  appId: "1:944546503981:web:60b453ea3971b516c807a4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Authenticating...");
    const email = "test" + Date.now() + "@example.com";
    const password = "password123";
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Authenticated as:", user.uid);

    console.log("Writing to profiles...");
    await setDoc(doc(db, "profiles", user.uid), {
      uid: user.uid,
      username: "TestUser",
      entryPaid: true
    });
    console.log("Write successful!");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();
