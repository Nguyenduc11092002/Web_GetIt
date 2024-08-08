import bcrypt from "bcryptjs";
import { get, push, ref, remove, set, update } from "firebase/database";
import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import moment from "moment";
import { database, storage } from "../firebaseConfig";

const db = database;
const storageInstance = storage;

const checkEmailExists = async (email) => {
  const usersRef = ref(database, "users");
  const snapshot = await get(usersRef);
  const users = snapshot.val();

  if (users) {
    return Object.values(users).some((user) => user.email === email);
  }
  return false;
};

// Create new employee
const postCreateEmployee = async (
  name,
  email,
  password,
  dateOfBirth,
  address,
  phoneNumber,
  skills,
  status,
  department,
  position,
  role,
  imageFile
) => {
  try {
    const newEmployeeRef = push(ref(db, "users"));

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let imageUrl = null;
    if (imageFile) {
      const timestamp = Date.now();
      const filename = `${timestamp}_${imageFile.name}`;
      const imageRef = storageRef(
        storageInstance,
        `employee/${newEmployeeRef.key}/${filename}`
      );
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const formattedDateOfBirth = dateOfBirth
      ? moment(dateOfBirth).format("YYYY-MM-DD")
      : null;

    await set(newEmployeeRef, {
      name,
      email,
      password: hashedPassword,
      dateOfBirth: formattedDateOfBirth,
      address,
      phoneNumber,
      skills,
      status,
      department, // Added department
      position,
      imageUrl,
      isAdmin: false,
      role: role || "employee", // Default to "employee" if role is not provided
      createdAt: Date.now(), // Automatically set the createdAt attribute
    });

    return newEmployeeRef.key;
  } catch (error) {
    console.error("Failed to create employee:", error);
    throw error;
  }
};

const fetchAllPositions = async () => {
  try {
    const positionsRef = ref(db, "positions");
    const snapshot = await get(positionsRef);
    const data = snapshot.val();
    return data
      ? Object.entries(data).map(([key, value]) => ({ key, label: value.name })) // Adjust based on your data structure
      : [];
  } catch (error) {
    console.error("Failed to fetch positions:", error);
    throw error;
  }
};

const fetchAllSkills = async () => {
  try {
    const skillsRef = ref(db, "skills");
    const snapshot = await get(skillsRef);
    const data = snapshot.val();
    return data
      ? Object.entries(data).map(([key, value]) => ({ key, label: value.name }))
      : [];
  } catch (error) {
    console.error("Failed to fetch skills:", error);
    throw error;
  }
};

// Fetch all employees
const fetchAllEmployees = async () => {
  try {
    const employeesRef = ref(db, "users");
    const snapshot = await get(employeesRef);
    const data = snapshot.val();
    return data
      ? Object.entries(data).map(([key, value]) => ({ key, ...value }))
      : [];
  } catch (error) {
    console.error("Failed to fetch employees:", error);
    throw error;
  }
};

const updateEmployeeStatus = async (employeeId, status) => {
  try {
    // Cập nhật trạng thái của nhân viên trong cơ sở dữ liệu
    await update(ref(db, `users/${employeeId}`), { status });
  } catch (error) {
    console.error("Failed to update employee status:", error);
    throw error;
  }
};

// Cập nhật trạng thái của nhân viên thành "active"
const updateEmployeeStatusToActive = async (employeeId) => {
  try {
    await update(ref(db, `users/${employeeId}`), { status: "active" });
  } catch (error) {
    console.error("Failed to update employee status to active:", error);
    throw error;
  }
};

// Cập nhật trạng thái của nhân viên thành "involved"
const updateEmployeeStatusToInvolved = async (employeeId) => {
  try {
    await update(ref(db, `users/${employeeId}`), { status: "involved" });
  } catch (error) {
    console.error("Failed to update employee status to involved:", error);
    throw error;
  }
};

// Update existing employee
const putUpdateEmployee = async (
  id,
  name,
  email,
  dateOfBirth,
  address,
  phoneNumber,
  skills = [], // Ensure default value for skills
  status,
  department,
  position,
  imageFile,
  oldImageUrl
) => {
  try {
    const employeeRef = ref(db, `users/${id}`);
    const employeeSnapshot = await get(employeeRef);
    const currentData = employeeSnapshot.val();

    let imageUrl = currentData?.imageUrl || null;

    if (imageFile) {
      if (imageUrl) {
        const oldImagePath = imageUrl.split("/o/")[1].split("?")[0];
        const decodedOldImagePath = decodeURIComponent(oldImagePath);
        const oldImageRef = storageRef(storageInstance, decodedOldImagePath);
        await deleteObject(oldImageRef);
      }

      const timestamp = Date.now();
      const filename = `${timestamp}_${imageFile.name}`;
      const imageRef = storageRef(
        storageInstance,
        `employee/${id}/${filename}`
      );
      const snapshot = await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    const formattedDateOfBirth = dateOfBirth
      ? moment(dateOfBirth).format("YYYY-MM-DD")
      : null;

    const updates = {
      name,
      email,
      dateOfBirth: formattedDateOfBirth,
      address,
      phoneNumber,
      skills: skills || [], // Ensure skills is not undefined
      status,
      department,
      position,
      imageUrl: imageUrl || currentData.imageUrl,
    };

    if (currentData) {
      updates.role = currentData.role;
      updates.isAdmin = currentData.isAdmin;
    }

    await update(employeeRef, updates);

    return id;
  } catch (error) {
    console.error("Failed to update employee:", error);
    throw error;
  }
};

// Delete employee
const deleteEmployeeById = async (id) => {
  try {
    const employeeRef = ref(database, `users/${id}`);
    const employeeSnapshot = await get(employeeRef);

    if (!employeeSnapshot.exists()) {
      throw new Error("Employee not found");
    }

    const employeeData = employeeSnapshot.val();

    // Check if the employee is inactive before attempting to delete
    if (employeeData.status !== "inactive") {
      throw new Error("Only employees with status 'inactive' can be deleted.");
    }

    // Delete images from Firebase Storage
    const imageUrl = employeeData.imageUrl;
    if (imageUrl) {
      const imagePath = imageUrl.split("/o/")[1].split("?")[0];
      const decodedImagePath = decodeURIComponent(imagePath);
      const imageStorageRef = storageRef(storage, decodedImagePath);
      await deleteObject(imageStorageRef);
    }

    // Delete employee from Realtime Database
    await remove(employeeRef);
  } catch (error) {
    console.error("Failed to delete employee:", error);
    throw error;
  }
};

// Fetch employee by ID
const fetchEmployeeById = async (id) => {
  try {
    const employeeRef = ref(database, `users/${id}`);
    const snapshot = await get(employeeRef);
    return snapshot.val();
  } catch (error) {
    console.error("Failed to fetch employee by ID:", error);
    throw error;
  }
};

export {
  checkEmailExists,
  deleteEmployeeById,
  fetchAllEmployees,
  fetchEmployeeById,
  fetchAllSkills,
  postCreateEmployee,
  putUpdateEmployee,
  fetchAllPositions,
  updateEmployeeStatus,
  updateEmployeeStatusToActive,
  updateEmployeeStatusToInvolved,
};
