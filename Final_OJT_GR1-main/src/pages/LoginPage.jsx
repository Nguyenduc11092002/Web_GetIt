import React, { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Alert } from "antd";
import { loginUser, signUpUser } from "../service/authService.js";
import styles from "../assets/style/Pages/Login.module.scss"; // Import SCSS file
import { useTranslation } from "react-i18next";

const { Title } = Typography;

function Login({ setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setUser(user); // Update state
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
            {isSignUp ? t("SignUp") : t("Login")}
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
              label={t("name")}
              name="name"
              rules={[{ required: true, message: "Please input your name!" }]}
            >
              <Input className="inp-length" onBlur={() => handleBlur("name")} />
            </Form.Item>
          )}
          <Form.Item
            label={t("Email")}
            name="email"
            rules={[{ required: true, message: "Please input your email!" }]}
          >
            <Input type="email" onBlur={() => handleBlur("email")} />
          </Form.Item>
          <Form.Item
            label={t("Password")}
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              className="inp-length"
              onBlur={() => handleBlur("password")}
            />
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
              {isSignUp ? t("SignUp") : t("Login")}
            </Button>
            <Button
              type="link"
              onClick={forgetPassword}
              className={styles["link-forget"]}
            >
              {t("ForgotPassword")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

Login.propTypes = {
  setUser: PropTypes.func.isRequired,
};

export default Login;
