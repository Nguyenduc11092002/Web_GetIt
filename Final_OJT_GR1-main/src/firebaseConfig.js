import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref as dbRef, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAwAWQ93FKS0AT7i0otQ0zOTnw88bwbf7E",
  authDomain: "final-project-amit-77a68.firebaseapp.com",
  databaseURL: "https://final-project-amit-77a68-default-rtdb.firebaseio.com",
  projectId: "final-project-amit-77a68",
  storageBucket: "final-project-amit-77a68.appspot.com",
  messagingSenderId: "906043598453",
  appId: "1:906043598453:web:149c0f9be031d622c1ba3c",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

export { auth, database, storage };
