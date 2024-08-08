import React, { useState, useEffect } from "react";
import {
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { Button, Form, Input, Select, Upload, Table, Modal, Space } from "antd";
import { storage } from "../firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  postCreateTechnology,
  fetchTechnologyById,
  fetchAllTechnology,
  putUpdateTechnology,
  deleteTechnology,
} from "../service/TechnologyServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { Column } = Table;

const AddTechnology = () => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const loadTechnologies = async () => {
    try {
      const data = await fetchAllTechnology();
      setTechnologies(data);
    } catch (error) {
      console.error("Failed to fetch technologies:", error);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    if (!imageFile) {
      toast.error(t("Please upload an image!"));
      setLoading(false);
      return;
    }

    try {
      // Upload image to Firebase Storage
      const storageReference = storageRef(
        storage,
        `technologies/${imageFile.name}`
      );
      await uploadBytes(storageReference, imageFile);
      const imageUrl = await getDownloadURL(storageReference);

      // Save technology details to Firebase Database
      const technologyId = await postCreateTechnology(
        values.name,
        values.description,
        values.status,
        imageUrl
      );
      toast.success(t("Technology added successfully!"));
      loadTechnologies(); // Reload the technologies after adding a new one
      navigate("/technology-management");
    } catch (error) {
      toast.error(t("Failed to add technology."));
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTechnology = (technology) => {
    setSelectedTechnology(technology);
    setViewModalVisible(true);
  };

  const handleDeleteTechnology = async (id) => {
    try {
      await deleteTechnology(id);
      toast.success(t("Technology deleted successfully!"));
      loadTechnologies();
    } catch (error) {
      toast.error(t("Failed to delete technology."));
    }
  };

  const handleImageChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      setImageFile(fileList[fileList.length - 1].originFileObj);
    } else {
      setImageFile(null);
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
    <div
      style={{
        padding: "24px 0",
        background: "#fff",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h2>{t("Add New Technology")}</h2>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[
            { required: true, message: t("Please input the technology name!") },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("Description")}
          name="description"
          rules={[
            {
              required: true,
              message: t("Please input the technology description!"),
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label={t("Status")}
          name="status"
          rules={[
            { required: true, message: t("Please select the technology status!") },
          ]}
        >
          <Select>
            <Option value="active">{t("active")}</Option>
            <Option value="inactive">{t("inactive")}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("Image")}
          name="image"
          rules={[{ required: true, message: t("Please upload an image!") }]}
        >
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleImageChange}
          >
            <Button icon={<UploadOutlined />}>{t("Click to Upload")}</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button className="btn" type="primary" htmlType="submit" loading={loading}>
            {t("Save")}
          </Button>
          <Button
            className="btn-length"
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/technology-management")}
          >
            {t("Back to Technology Management")}
          </Button>
        </Form.Item>
      </Form>

      <h2>{t("ExistingTechnologies")}</h2>
      <Table dataSource={technologies} rowKey="id" pagination={false}>
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
                onClick={() => handleViewTechnology(record)}
              />
              <Button
                icon={<DeleteOutlined />}
                style={{ color: "red", borderColor: "red" }}
                onClick={() => handleDeleteTechnology(record.id)}
              />
            </Space>
          )}
        />
      </Table>

      <Modal
        title="View Technology"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button className="btn" key="close" onClick={() => setViewModalVisible(false)}>
            {t("close")}
          </Button>,
        ]}
      >
        {selectedTechnology && (
          <div>
            <p>
              <strong>{t("name")}:</strong> {selectedTechnology.name}
            </p>
            <p>
              <strong>{t("Description")}:</strong> {formatDescription(selectedTechnology.description)}
            </p>
            <p>
              <strong>{t("Status")}:</strong> {formatStatus(selectedTechnology.status)}
            </p>
            {selectedTechnology.imageUrl && (
              <p>
                <strong>{t("Image")}:</strong>
                <img
                  src={selectedTechnology.imageUrl}
                  alt="Technology Image"
                  style={{ width: "100%", height: "auto" }}
                />
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AddTechnology;
