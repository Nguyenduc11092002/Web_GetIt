import { ref, set, push, update, get, remove } from "firebase/database";
import { database } from '../firebaseConfig';

const db = database;

// Create new language
const postCreateLanguage = async (name, description, status) => {
    const languagesRef = push(ref(db, 'programmingLanguages'));
    await set(languagesRef, {
        name,
        description,
        status
    });
};

// Fetch all languages
const fetchAllLanguages = async () => {
    try {
        const languagesRef = ref(db, 'programmingLanguages');
        const snapshot = await get(languagesRef);
        const data = snapshot.val();
        return data ? Object.entries(data).map(([key, value]) => ({ key, ...value })) : [];
    } catch (error) {
        console.error("Failed to fetch languages:", error);
        throw error;
    }
};

const fetchAllLanguages2 = async () => {
    try {
        const languagesRef = ref(db, 'programmingLanguages');
        const snapshot = await get(languagesRef);
        const data = snapshot.val();
        return data ? Object.entries(data).map(([key, value]) => ({ id:key, ...value })) : [];
    } catch (error) {
        console.error("Failed to fetch languages:", error);
        throw error;
    }
};

// Update existing language
const putUpdateLanguage = async (id, name, description, status) => {
    try {
        const languageRef = ref(db, `programmingLanguages/${id}`);

        await update(languageRef, {
            name,
            description,
            status,
        });

        return id;
    } catch (error) {
        console.error("Failed to update language:", error);
        throw error;
    }
};

// Delete language
const deleteLanguageById = async (id) => {
    try {
        const languageRef = ref(db, `programmingLanguages/${id}`);

        // Delete language from Realtime Database
        await remove(languageRef);
    } catch (error) {
        console.error("Failed to delete language:", error);
        throw error;
    }
};

const fetchLanguageById = async (id) => {
    try {
        console.log(`Fetching language with ID: ${id}`); // Debug
        const languageRef = ref(database, `programmingLanguages/${id}`);
        const snapshot = await get(languageRef);
        console.log('Language data:', snapshot.val()); // Debug
        return snapshot.val();
    } catch (error) {
        console.error("Failed to fetch language by ID:", error);
        throw error;
    }
};

export { fetchAllLanguages, postCreateLanguage, putUpdateLanguage, deleteLanguageById, fetchLanguageById, fetchAllLanguages2 };