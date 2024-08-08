import { Alert, Button, Form, Input, message, Typography } from "antd";
import emailjs from "emailjs-com";
import { get, getDatabase, ref } from "firebase/database";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/style/Pages/ForgetPassword.scss";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

function ForgetPassword() {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleForgetPassword = async (values) => {
    const { email } = values;

    try {
      const db = getDatabase();
      const userRef = ref(db, `users`);
      const snapshot = await get(userRef);
      const usersData = snapshot.val();

      // Tìm người dùng với email đã cho
      const user = Object.entries(usersData).find(
        ([id, data]) => data.email === email
      );

      if (user) {
        const [userId] = user;
        const resetLink = `http://localhost:5173/reset-password?userId=${encodeURIComponent(userId)}`; 

        const response = await emailjs.send(
          'service_ncefpgz',      // Service ID của bạn
          'template_v0kukci',     // Template ID của bạn
          { 
            user_email: email,    // Tên biến khớp với template
            reset_link: resetLink 
          },  
          'lb5ycQksDnRX-2uqk'     // User ID của bạn
        );
        console.log(t("Email sent successfully:"), response);
        message.setSuccessMessage(t("Password reset instructions sent to your email."));
        form.resetFields(); // Reset form fields after success
      } else {
        message.setError("User does not exist.");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      message.setError(t("Failed to send password reset instructions."));
    }
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-form">
        <Title level={2} className="title">
          {t("changePassword")}
        </Title>
        <Form form={form} onFinish={handleForgetPassword}>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: t("pleaseEnterEmail") }]}
          >
            <Input type="email" placeholder= {t("Enter your email address")}/>
          </Form.Item>
          {error && <Alert message={error} type="error" showIcon />}
          {successMessage && <Alert message={successMessage} type="success" showIcon />}
          <Form.Item>
            <Button className="btn" type="primary" htmlType="submit" block>
              {t("SendEmail")}
            </Button>
          </Form.Item>
        </Form>
        <Form
          onFinish={handleLogout}
          className="logout-form"
          layout="vertical"
        >
          <Form.Item>
            <Button className="btn" type="primary" htmlType="submit" block>
              {t("Back")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ForgetPassword;
