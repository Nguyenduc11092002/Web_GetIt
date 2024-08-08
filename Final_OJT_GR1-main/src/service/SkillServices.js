import { ref, set, push, update, get, remove } from "firebase/database";
import { getStorage, ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from '../firebaseConfig';

const db = database;
const storageInstance = storage;

// Create new skill
const postCreateSkill = async (name, description, status, imageFile) => {
    try {
        const newSkillRef = push(ref(db, 'skills'));

        let imageUrl = null;
        if (imageFile) {
            // Upload the image to Firebase Storage
            const imageRef = storageRef(storageInstance, `images/${newSkillRef.key}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        await set(newSkillRef, {
            name,
            description,
            status,
            imageUrl,
        });

        return newSkillRef.key;
    } catch (error) {
        console.error("Failed to create skill:", error);
        throw error;
    }
};

// Fetch all skills
const fetchAllSkills = async () => {
    try {
        const skillsRef = ref(db, 'skills');
        const snapshot = await get(skillsRef);
        const data = snapshot.val();
        return data ? Object.entries(data).map(([key, value]) => ({ key, ...value })) : [];
    } catch (error) {
        console.error("Failed to fetch skills:", error);
        throw error;
    }
};

// Update existing skill
const putUpdateSkill = async (id, name, description, status, imageFile) => {
    try {
        const skillRef = ref(db, `skills/${id}`);

        let imageUrl = null;
        if (imageFile) {
            const imageRef = storageRef(storageInstance, `images/${id}/${imageFile.name}`);
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        await update(skillRef, {
            name,
            description,
            status,
            imageUrl: imageUrl || null,
        });

        return id;
    } catch (error) {
        console.error("Failed to update skill:", error);
        throw error;
    }
};

// Delete skill
const deleteSkillById = async (id) => {
    try {
        const skillRef = ref(db, `skills/${id}`);
        const skillSnapshot = await get(skillRef);

        // Delete image from Firebase Storage
        const imageUrl = skillSnapshot.val()?.imageUrl;
        if (imageUrl) {
            const imageName = imageUrl.split('/').pop().split('?')[0]; // Extract file name from URL
            const imageRef = storageRef(storageInstance, `images/${id}/${imageName}`);
            await deleteObject(imageRef);
        }

        // Delete skill from Realtime Database
        await remove(skillRef);
    } catch (error) {
        console.error("Failed to delete skill:", error);
        throw error;
    }
};

const fetchSkillById = async (id) => {
    try {
        console.log(`Fetching skill with ID: ${id}`); // Debug
        const skillRef = ref(database, `skills/${id}`);
        const snapshot = await get(skillRef);
        console.log('Skill data:', snapshot.val()); // Debug
        return snapshot.val();
    } catch (error) {
        console.error("Failed to fetch skill by ID:", error);
        throw error;
    }
};

export { fetchAllSkills, postCreateSkill, putUpdateSkill, deleteSkillById, fetchSkillById };
