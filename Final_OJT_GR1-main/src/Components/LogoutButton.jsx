import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import "../assets/style/Pages/LogoutButton.scss";
import { useTranslation } from "react-i18next";

// eslint-disable-next-line react/prop-types
function LogoutButton({ collapsed }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const handleLogout = () => {
    localStorage.removeItem("userId");
    navigate("/login");
  };

  return (
    <Button
      className={`logout-button ${collapsed ? "collapsed" : ""}`}
      type="text"
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      {!collapsed && t("LogOut")}
    </Button>
  );
}

LogoutButton.propTypes = {
  collapsed: PropTypes.bool.isRequired,
};

export default LogoutButton;