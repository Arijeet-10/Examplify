
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCubUmCWHwkjPkR57f18D7n5rR9yeWvK9I",
  authDomain: "examplify-yu3ro.firebaseapp.com",
  projectId: "examplify-yu3ro",
  storageBucket: "examplify-yu3ro.firebasestorage.app",
  messagingSenderId: "1069802717540",
  appId: "1:1069802717540:web:295919eee3f4c6442dba71"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, collection, query, where, getDocs, signInWithEmailAndPassword };
