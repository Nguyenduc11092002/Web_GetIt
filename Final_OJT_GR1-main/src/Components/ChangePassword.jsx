import { Button, Form, Input, message } from "antd";
import bcrypt from "bcryptjs";
import { get, getDatabase, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../assets/style/Pages/ChangePassword.scss";

function ChangePassword() {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [userId, setUserId] = useState(""); // Lưu userId từ Local Storage

  useEffect(() => {
    // Lấy thông tin userId từ Local Storage
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId); // Sử dụng userId từ Local Storage
    } else {
      message.error(t("User Not Logged In"));
      navigate("/login"); // Điều hướng đến trang đăng nhập nếu không có thông tin userId
    }
  }, [navigate, t]);

  const handleChangePassword = async (values) => {
    const { oldPassword, newPassword, confirmPassword } = values;

    if (!oldPassword || !newPassword || !confirmPassword) {
      message.error(t("Please Fill All Fields"));
      return;
    }

    if (newPassword.length < 6) {
      message.error(t("Password Min Length"));
      return;
    }

    if (newPassword !== confirmPassword) {
      message.error(t("Passwords Do Not Match"));
      return;
    }

    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Kiểm tra mật khẩu cũ
        const isOldPasswordValid = await bcrypt.compare(
          oldPassword,
          userData.password
        );
        if (!isOldPasswordValid) {
          message.error(t("Old Password Is Incorrect"));
          return;
        }

        // Mã hóa mật khẩu mới
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await update(userRef, { password: hashedPassword });
        message.success(t("Password Update Successful"));
        navigate("/login"); // Điều hướng đến trang đăng nhập sau khi cập nhật mật khẩu thành công
      } else {
        console.error("User Data:", snapshot.val()); // Log dữ liệu người dùng để kiểm tra
        message.error(t("User Does Not Exist"));
      }
    } catch (error) {
      console.error("Error details:", error);
      message.error(t("Error Updating Password"));
    }
  };

  return (
    <div className="change-password-container">
      <div className="change-password-form">
        <h1>{t("changePassword")}</h1>
        <Form form={form} onFinish={handleChangePassword} layout="vertical">
          <Form.Item
            label={t("Old Password")}
            name="oldPassword"
            rules={[
              { required: true, message: t("Please Input Old Password") },
            ]}
          >
            <Input.Password placeholder={t("Enter Old Password")} />
          </Form.Item>
          <Form.Item
            label={t("New Password")}
            name="newPassword"
            rules={[
              { required: true, message: t("Please Input New Password") },
              { min: 6, message: t("Password Min Length") },
            ]}
          >
            <Input.Password placeholder={t("Enter New Password")} />
          </Form.Item>
          <Form.Item
            label={t("Confirm Password")}
            name="confirmPassword"
            rules={[
              { required: true, message: t("Please Confirm New Password") },
              { min: 6, message: t("Password Min Length") },
            ]}
          >
            <Input.Password placeholder={t("Confirm New Password")} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {t("changePassword")}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default ChangePassword;