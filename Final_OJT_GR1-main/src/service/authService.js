import bcrypt from "bcryptjs";
import {
  equalTo,
  get,
  getDatabase,
  orderByChild,
  query,
  ref,
  set,
  update,
} from "firebase/database";
import { v4 as uuidv4 } from "uuid";

// Hàm cập nhật mật khẩu đã mã hóa cho tất cả người dùng hiện có
const updateExistingPasswords = async () => {
  try {
    const db = getDatabase();
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    const usersData = snapshot.val();

    if (usersData) {
      for (const userId in usersData) {
        const user = usersData[userId];

        // Kiểm tra nếu mật khẩu chưa được mã hóa
        if (user.password && !user.password.startsWith("$2a$")) {
          // Mã hóa mật khẩu
          const hashedPassword = await bcrypt.hash(user.password, 10);

          // Cập nhật mật khẩu đã mã hóa vào cơ sở dữ liệu
          await update(ref(db, `users/${userId}`), {
            password: hashedPassword,
          });

          console.log(`Updated password for user: ${userId}`);
        }
      }
    } else {
      console.log("No users found.");
    }
  } catch (error) {
    console.error("Error updating passwords:", error);
  }
};

// Hàm đăng nhập người dùng
export const loginUser = async (
  email,
  password,
  setUser,
  setError,
  navigate
) => {
  try {
    const db = getDatabase();
    const userRef = ref(db, "users");
    const userQuery = query(userRef, orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);
    const userData = snapshot.val();

    console.log("User Data from DB:", userData); // Console log user data

    if (userData) {
      const userId = Object.keys(userData)[0];
      const user = userData[userId];

      // So sánh mật khẩu đã mã hóa
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        localStorage.setItem("userId", userId);
        localStorage.setItem("user", JSON.stringify(user)); // Save the entire user object
        setUser(user);

        // Điều hướng dựa trên vai trò người dùng
        navigate(
          user.role === "admin" ? "/account-management" : "/account-info"
        );
        return { user, error: null };
      } else {
        return { user: null, error: "Invalid password" };
      }
    } else {
      return { user: null, error: "User not found" };
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
    return { user: null, error: "An error occurred" };
  }
};

// Hàm đăng ký người dùng
export const signUpUser = async (
  email,
  password,
  name,
  setSuccessMessage,
  setError
) => {
  try {
    const db = getDatabase();
    const userRef = ref(db, "users");
    const userQuery = query(userRef, orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);

    console.log("Snapshot for Sign Up Check:", snapshot.val()); // Console log snapshot for sign up

    if (snapshot.val()) {
      setError("Email already in use");
      return { success: false, error: "Email already in use" };
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo ID ngẫu nhiên cho người dùng
    const userId = uuidv4();

    const newUserRef = ref(db, `users/${userId}`);
    const newUser = {
      email,
      password: hashedPassword,
      name,
      contact: "",
      cv_list: [
        {
          title: "",
          description: "",
          file: "",
          updatedAt: new Date().toISOString(),
        },
      ],
      role: email === "admin@gmail.com" ? "admin" : "employee",
      createdAt: new Date().toISOString(),
      projetcIds: "",
      skill: "",
      status: "active",
    };
    await set(newUserRef, newUser);

    if (newUser.role === "employee") {
      const employeeRef = ref(db, `employees/${userId}`);
      await set(employeeRef, {
        name: newUser.name,
        email: newUser.email,
        contact: newUser.contact,
        cv_list: newUser.cv_list,
        createdAt: newUser.createdAt,
        status: newUser.status,
      });
    }

    console.log("New User Object:", newUser); // Console log the new user object

    setSuccessMessage("Account created successfully! Please log in.");
    return { success: true, error: "" };
  } catch (error) {
    console.error("Error signing up: ", error);
    setError("An error occurred during sign up");
    return { success: false, error: "An error occurred during sign up" };
  }
};

// Gọi hàm để mã hóa mật khẩu hiện có (nên chỉ chạy một lần khi cần)
updateExistingPasswords();
