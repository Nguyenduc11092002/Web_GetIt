import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, Space } from "antd";
import {
  postCreatePosition,
  fetchAllPositions,
  deletePositionById,
} from "../service/PositionServices";
import { EyeOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../Components/AddPosition.jsx";
import "../assets/style/Global.scss";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { Column } = Table;

const AddPosition = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("active");
  const [positions, setPositions] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const loadPositions = async () => {
    try {
      const data = await fetchAllPositions();
      setPositions(data);
    } catch (error) {
      console.error(t("Failed to fetch positions:"), error);
    }
  };

  useEffect(() => {
    loadPositions();
  }, []);

  const handleAddPosition = async () => {
    if (!name || !description || !department || !status) {
      toast.error(t("Please fill in all fields."));
      return;
    }

    try {
      await postCreatePosition(name, description, department, status);
      localStorage.setItem("positionAdded", "true");
      navigate("/position-management");
    } catch (error) {
      toast.error(t("Failed to add position."));
    }
  };
  const handleViewPosition = (position) => {
    setSelectedPosition(position);
    setViewModalVisible(true);
  };

  const handleDeletePosition = async (id) => {
    try {
      await deletePositionById(id);
      toast.success(t("Position deleted successfully!"));
      loadPositions(); // Reload the positions list
    } catch (error) {
      toast.error(t("Failed to delete position."));
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
    <div className="add-position">
      <h2>{t("AddNewPosition")}</h2>
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
        <label>{t("Department")}</label>
        <Input
          type="text"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
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
        onClick={handleAddPosition}
        disabled={!name || !description || !department || !status}
      >
        {t("Save")}
      </Button>
      <Button
        className="btn-length"
        style={{ marginLeft: 8 }}
        onClick={() => navigate("/position-management")}
      >
        {t("BacktoPositionManagement")}
      </Button>

      <h2>{t("ExistingPosition")}</h2>
      <Table dataSource={positions} rowKey="key" pagination={false}>
        <Column title={t("name")} dataIndex="name" key="name" />
        <Column
          title={t("Description")}
          dataIndex="description"
          key="description"
          render={(text) => formatDescription(text)}
        /> 
        <Column title={t("Department")} dataIndex="department" key="department" />
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
                onClick={() => handleViewPosition(record)}
              />
              <Button 
                icon={<DeleteOutlined />} 
                style={{ color: "red", borderColor: "red" }} 
                onClick={() => handleDeletePosition(record.key)}
              />
            </Space>
          )}
        />
      </Table>
      <Modal
        title={t("ViewPosition")}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            {t("close")}
          </Button>,
        ]}
      >
        {selectedPosition && (
          <div>
            <p>
              <strong>{t("name")}:</strong> {selectedPosition.name}
            </p>
            <p>
              <strong>{t("Description")}:</strong> {formatDescription(selectedPosition.description)}
            </p>
            <p>
              <strong>{t("Department")}:</strong> {selectedPosition.department}
            </p>
            <p>
              <strong>{t("Status")}:</strong> {formatStatus(selectedPosition.status)}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddPosition;