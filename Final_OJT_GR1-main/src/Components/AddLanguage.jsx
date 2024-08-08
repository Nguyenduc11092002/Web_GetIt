import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, Space } from "antd";
import {
  postCreateLanguage,
  fetchAllLanguages,
  deleteLanguageById,
} from "../service/LanguageServices";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../assets/style/Global.scss";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { Column } = Table;

const AddLanguage = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [languages, setLanguages] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const loadLanguages = async () => {
    try {
      const data = await fetchAllLanguages();
      setLanguages(data);
    } catch (error) {
      console.error("Failed to fetch languages:", error);
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  const handleAddLanguage = async () => {
    if (!name || !description || !status) {
      toast.error(t("Please fill in all fields."));
      return;
    }

    try {
      await postCreateLanguage(name, description, status);
      localStorage.setItem("languageAdded", "true");
      navigate("/programing-language");
    } catch (error) {
      toast.error(t("Failed to add language."));
    }
  };

  const handleViewLanguage = (language) => {
    setSelectedLanguage(language);
    setViewModalVisible(true);
  };

  const handleDeleteLanguage = async (id) => {
    try {
      await deleteLanguageById(id);
      toast.success(t("Language deleted successfully!"));
      loadLanguages(); // Reload the languages list
    } catch (error) {
      toast.error(t("Failed to delete language."));
    }
  };

  const formatDescription = (description) => {
    const translatedDescription = t(description);
    return translatedDescription ? translatedDescription.charAt(0).toUpperCase() + translatedDescription.slice(1) : null;
  };

  const formatStatus = (status) => {
    const translatedStatus = t(status);
    return translatedStatus ? translatedStatus.charAt(0).toUpperCase() + translatedStatus.slice(1) : "";
  };

  return (
    <div className="add-language">
      <h2>{t("AddNewLanguage")}</h2>
      <div className="form-group">
        <label>{t("name")}</label>
        <Input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <div className="form-group">
        <label>{t("Description")}</label>
        <Input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>
      <div className="form-group">
        <label>{t("status")}</label>
        <Select
          value={status}
          onChange={(value) => setStatus(value)}
          placeholder={t("selectStatus")}
        >
          <Option value="active">{t("active")}</Option>
          <Option value="inactive">{t("inactive")}</Option>
        </Select>
      </div>
      <Button
        className="btn"
        type="primary"
        onClick={handleAddLanguage}
        disabled={!name || !description || !status}
      >
        {t("Save")}
      </Button>
      <Button
        className="btn-length"
        style={{ marginLeft: 8 }}
        onClick={() => navigate("/programing-language")}
      >
        {t("BacktoLanguageManagement")}
      </Button>

      <h2>{t("ExistingLanguage")}</h2>
      <Table dataSource={languages} rowKey="key" pagination={false}>
        <Column title={t("name")} dataIndex="name" key="name" />
        <Column
          title={t("Description")}
          dataIndex="description"
          key="description"
          render={(text) => formatDescription(text)}
        /> 
        <Column
          title={t("Status")}
          dataIndex="status"
          key="status"
          render={(text) => {
            // Dịch giá trị của text
            const translatedText = t(text);

            // Xác định lớp CSS dựa trên giá trị đã dịch
            const className =
              translatedText === t("active")
                ? "status-active"
                : "status-inactive";

            return (
              <span className={className}>
                {translatedText
                  ? translatedText.charAt(0).toUpperCase() +
                    translatedText.slice(1)
                  : ""}
              </span>
            );
          }}
        />
        <Column
          title={t("actions")}
          key="actions"
          render={(text, record) => (
            <Space>
                <Button 
                icon={<EyeOutlined />} 
                style={{ color: "green", borderColor: "green" }} 
                onClick={() => handleViewLanguage(record)}
                />
                <Button 
                icon={<DeleteOutlined />} 
                style={{ color: "red", borderColor: "red" }} 
                onClick={() => handleDeleteLanguage(record.key)}
                />
          </Space>
          )}
        />
      </Table>
      <Modal
        title={t("ViewLanguage")}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            {t("close")}
          </Button>,
        ]}
      >
        {selectedLanguage && (
          <div>
            <p>
              <strong>{t("name")}:</strong> {selectedLanguage.name}
            </p>
            <p>
              <strong>{t("Description")}:</strong> {formatDescription(selectedLanguage.description)}
            </p>
            <p>
              <strong>{t("Status")}:</strong> {formatStatus(selectedLanguage.status)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddLanguage;