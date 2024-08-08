// import { useState } from "react";
// import { FaEnvelope, FaLock } from "react-icons/fa";
// import "./LoginForm.css";

// function LoginForm() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [emailError, setEmailError] = useState("");
//   const [passwordError, setPasswordError] = useState("");

//   const handleEmailChange = (e) => {
//     setEmail(e.target.value);
//   };

//   const handlePasswordChange = (e) => {
//     setPassword(e.target.value);
//   };

//   const handleBlur = (field) => {
//     if (field === "email") {
//       if (email.trim() === "") {
//         setEmailError("Please enter email.");
//       } else if (!isValidEmail(email)) {
//         setEmailError("Please enter a valid email address.");
//       } else {
//         setEmailError("");
//       }
//     } else if (field === "password") {
//       if (password.trim() === "") {
//         setPasswordError("Please enter password.");
//       } else {
//         setPasswordError("");
//       }
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     let valid = true;
//     if (email.trim() === "") {
//       setEmailError("Please enter email.");
//       valid = false;
//     } else if (!isValidEmail(email)) {
//       setEmailError("Please enter a valid email address.");
//       valid = false;
//     } else {
//       setEmailError("");
//     }

//     if (password.trim() === "") {
//       setPasswordError("Please enter password.");
//       valid = false;
//     } else {
//       setPasswordError("");
//     }

//     // Submit logic here if validation passes
//     if (valid) {
//       // Do submit
//     }
//   };

//   const isValidEmail = (value) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
//   };

//   return (
//     <div className="wrapper">
//       <form onSubmit={handleSubmit}>
//         <h1>Login</h1>
//         <div className="input-box">
//           <input
//             type="email"
//             placeholder="Email"
//             value={email}
//             onChange={handleEmailChange}
//             onBlur={() => handleBlur("email")}
//             className={emailError ? "error" : ""}
//             required
//           />
//           <FaEnvelope className="icon" />
//         </div>
//         {emailError && <div className="error-msg">{emailError}</div>}
//         <div className="input-box">
//           <input
//             type="password"
//             placeholder="Password"
//             value={password}
//             onChange={handlePasswordChange}
//             onBlur={() => handleBlur("password")}
//             className={passwordError ? "error" : ""}
//             required
//           />
//           <FaLock className="icon" />
//         </div>
//         {passwordError && <div className="error-msg">{passwordError}</div>}
//         <div className="remember-forgot">
//           <label>
//             <input type="checkbox" />
//             Remember me
//           </label>
//           <a href="#">Forgot password?</a>
//         </div>
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }

// export default LoginForm;

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert } from "antd";
import { loginUser, signUpUser } from "../service/authService.js";
import styles from "../assets/style/Pages/Login.module.scss"; // Import SCSS file

const { Title } = Typography;

function Login({ setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    const { email, password, name } = values;
    if (isSignUp) {
      const { success, error } = await signUpUser(
        email,
        password,
        name,
        setSuccessMessage,
        setError
      );
      if (!success) {
        setError(error);
      }
    } else {
      const { user, error } = await loginUser(
        email,
        password,
        setUser,
        setError,
        navigate
      );
      if (!user) {
        setError(error);
      } else {
        localStorage.setItem("user", JSON.stringify(user)); // Save user data to local storage
        navigate(user.role === "admin" ? "/account-management" : "/employee");
      }
    }
  };

  const forgetPassword = () => {
    navigate("/forget-password");
  };

  const handleBlur = (field) => {
    form.validateFields([field]);
  };

  return (
    <div className={styles["login-container"]}>
      <div className={styles["login-form"]}>
        <div className={styles["header-form"]}>
          <Title level={2} className={styles["title"]}>
            {isSignUp ? "Sign Up" : "Login"}
          </Title>
          <img
            src="/public/images/logo.jpg"
            alt="logo"
            className={styles["logo-header"]}
          />
        </div>
        <Form form={form} onFinish={handleSubmit}>
          {isSignUp && (
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input onBlur={() => handleBlur("name")} />
            </Form.Item>
          )}
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" onBlur={() => handleBlur("email")} />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password onBlur={() => handleBlur("password")} />
          </Form.Item>
          {error && <Alert message={error} type="error" showIcon />}
          {successMessage && (
            <div>
              <Alert message={successMessage} type="success" showIcon />
            </div>
          )}
          <Form.Item>
            <Button
              className={styles["btn-login"]}
              type="primary"
              htmlType="submit"
              block
            >
              {isSignUp ? "Sign Up" : "Login"}
            </Button>
            <Button
              type="link"
              onClick={forgetPassword}
              className={styles["link-forget"]}
            >
              Forgot Password
            </Button>
          </Form.Item>
        </Form>
        <Button
          type="link"
          className={styles["link-button"]}
          onClick={() => setIsSignUp(!isSignUp)}
          block
        >
          {isSignUp
            ? "Already have an account? Login"
            : "Need an account? Sign Up"}
        </Button>
      </div>
    </div>
  );
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
