import { ref, set, push, update, get, remove } from "firebase/database";
import { getStorage, ref as storageRef, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage";
import { database, storage } from '../firebaseConfig';

const db = database;
const storageInstance = storage;




// Create new position
const postCreatePosition = async (name, description, department, status, imageFile) => {
  try { 
    const newPositionRef = push(ref(db, 'positions'));

    let imageUrl = null;
    if (imageFile) {
      // Upload the image to Firebase Storage
      const imageRef = storageRef(storageInstance, `images/${newPositionRef.key}/${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await set(newPositionRef, {
      name,
      description,
      department,
      status,
      imageUrl,
    });

    return newPositionRef.key;
  } catch (error) {
    console.error("Failed to create position:", error);
    throw error;
  }
};

// Fetch all positions
const fetchAllPositions = async () => {
  try {
    const positionsRef = ref(db, 'positions');
    const snapshot = await get(positionsRef);
    const data = snapshot.val();
    return data ? Object.entries(data).map(([key, value]) => ({ key, ...value })) : [];
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    throw error;
  }
};

// Update existing position
const putUpdatePosition = async (id, name, description, department, status, salary, imageFile) => {
  try {
    const positionRef = ref(db, `positions/${id}`);

    let imageUrl = null;
    if (imageFile) {
      const imageRef = storageRef(storageInstance, `images/${id}/${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await update(positionRef, {
      name,
      description,
      department,
      status,
      salary,
      imageUrl: imageUrl || null,
    });

    return id;
  } catch (error) {
    console.error("Failed to update position:", error);
    throw error;
  }
};

// Delete position
const deletePositionById = async (id) => {
  try {
    const positionRef = ref(db, `positions/${id}`);
    const positionSnapshot = await get(positionRef);

    // Delete image from Firebase Storage
    const imageUrl = positionSnapshot.val()?.imageUrl;
    if (imageUrl) {
      const imageName = imageUrl.split('/').pop().split('?')[0]; // Extract file name from URL
      const imageRef = storageRef(storageInstance, `images/${id}/${imageName}`);
      await deleteObject(imageRef);
    }

    // Delete position from Realtime Database
    await remove(positionRef);
  } catch (error) {
    console.error("Failed to delete position:", error);
    throw error;
  }
};

const fetchPositionById = async (id) => {
  try {
    console.log(`Fetching position with ID: ${id}`); // Debug
    const positionRef = ref(database, `positions/${id}`);
    const snapshot = await get(positionRef);
    console.log('Position data:', snapshot.val()); // Debug
    return snapshot.val();
  } catch (error) {
    console.error("Failed to fetch position by ID:", error);
    throw error;
  }
};

export { fetchAllPositions, postCreatePosition, putUpdatePosition, deletePositionById, fetchPositionById };