import { ref, set, push, update, get, remove } from "firebase/database";
import {
  getStorage,
  ref as storageRef,
  deleteObject,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { database, storage } from "../firebaseConfig";

const db = database;
const storageInstance = storage;

const formatBudget = (value) => {
  if (typeof value !== "string") {
    value = String(value);
  }

  // Kiểm tra nếu value không tồn tại hoặc là một chuỗi trống
  if (!value) return "";

  // Check if the value has "$" or "VND"
  const hasDollarSign = value.startsWith("$");
  const hasVND = value.endsWith("VND");

  // Remove "$" and "VND" for formatting
  let numericValue = value.replace(/[^\d]/g, "");

  // Format the number with commas
  numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add "$" or "VND" back
  if (hasDollarSign) {
    numericValue = `$${numericValue}`;
  }
  if (hasVND) {
    numericValue = `${numericValue}VND`;
  }

  return numericValue;
};

const postCreateProject = async (projectData, imageFile) => {
  try {
    const newProjectRef = push(ref(db, "projects"));

    let imageUrl = null;
    if (imageFile) {
      const imageRef = storageRef(
        storageInstance,
        `images/${newProjectRef.key}/${imageFile.name}`
      );
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Định dạng ngân sách trước khi lưu trữ
    projectData.budget = formatBudget(projectData.budget);

    await set(newProjectRef, {
      ...projectData,
      imageUrl,
    });

    return newProjectRef.key;
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error;
  }
};

const fetchAllProjects = async () => {
  try {
    const projectsRef = ref(db, "projects");
    const snapshot = await get(projectsRef);
    const data = snapshot.val();
    return data
      ? Object.entries(data).map(([key, value]) => ({ key, ...value }))
      : [];
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw error;
  }
};

const fetchArchivedProjects = async () => {
  try {
    const archivedProjectsRef = ref(db, "archivedProjects");
    const snapshot = await get(archivedProjectsRef);
    const data = snapshot.val();
    return data
      ? Object.entries(data).map(([key, value]) => ({ key, ...value }))
      : [];
  } catch (error) {
    console.error("Failed to fetch archived projects:", error);
    throw error;
  }
};

const putUpdateProject = async (id, projectData, imageFile) => {
  try {
    const projectRef = ref(db, `projects/${id}`);

    let imageUrl = null;
    if (imageFile) {
      const imageRef = storageRef(
        storageInstance,
        `images/${id}/${imageFile.name}`
      );
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    // Định dạng ngân sách trước khi lưu trữ
    projectData.budget = formatBudget(projectData.budget);

    await update(projectRef, {
      ...projectData,
      imageUrl: imageUrl || projectData.imageUrl,
    });

    return id;
  } catch (error) {
    console.error("Failed to update project:", error);
    throw error;
  }
};

const moveToArchive = async (id) => {
  try {
    const projectRef = ref(db, `projects/${id}`);
    const projectSnapshot = await get(projectRef);
    const projectData = projectSnapshot.val();

    if (projectData) {
      const archivedProjectRef = ref(db, `archivedProjects/${id}`);
      await set(archivedProjectRef, projectData);
      await remove(projectRef);
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Failed to archive project:", error);
    throw error;
  }
};

const deleteProjectPermanently = async (id) => {
  try {
    const archivedProjectRef = ref(db, `archivedProjects/${id}`);
    const projectSnapshot = await get(archivedProjectRef);

    const imageUrl = projectSnapshot.val()?.imageUrl;
    if (imageUrl) {
      const imageName = decodeURIComponent(
        imageUrl.split("/").pop().split("?")[0]
      );
      const imageRef = storageRef(storageInstance, `images/${id}/${imageName}`);

      try {
        await deleteObject(imageRef);
      } catch (error) {
        if (error.code !== "storage/object-not-found") {
          throw error;
        } else {
          console.warn(`Object not found: ${imageName}`);
        }
      }
    }

    await remove(archivedProjectRef);
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw error;
  }
};

const restoreProject = async (id) => {
  try {
    const archivedProjectRef = ref(db, `archivedProjects/${id}`);
    const projectSnapshot = await get(archivedProjectRef);
    const projectData = projectSnapshot.val();

    if (projectData) {
      const projectRef = ref(db, `projects/${id}`);
      await set(projectRef, projectData);
      await remove(archivedProjectRef);
    } else {
      throw new Error("Project not found");
    }
  } catch (error) {
    console.error("Failed to restore project:", error);
    throw error;
  }
};

export {
  fetchAllProjects,
  postCreateProject,
  putUpdateProject,
  moveToArchive,
  fetchArchivedProjects,
  deleteProjectPermanently,
  restoreProject,
};
