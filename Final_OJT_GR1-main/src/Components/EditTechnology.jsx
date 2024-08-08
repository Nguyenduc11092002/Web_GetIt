import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Select, Upload, Modal, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import {
  fetchTechnologyById,
  putUpdateTechnology,
} from "../service/TechnologyServices";
import { storage } from "../firebaseConfig";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const EditTechnology = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [initialImageUrl, setInitialImageUrl] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadTechnology = async () => {
      try {
        console.log("Fetching technology with ID:", id);
        const data = await fetchTechnologyById(id);
        form.setFieldsValue({
          name: data.name,
          description: data.description,
          status: data.status,
        });
        setInitialImageUrl(data.imageUrl || "");
      } catch (error) {
        message.error(t("Failed to fetch technology data."));
        console.error("Failed to fetch technology by ID:", error);
      }
    };

    loadTechnology();
  }, [id, form]);

  const handleImageChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      setImageFile(fileList[fileList.length - 1].originFileObj);
    } else {
      setImageFile(null);
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let imageUrl = initialImageUrl;
      if (imageFile) {
        const storageReference = storageRef(
          storage,
          `technologies/${Date.now()}_${imageFile.name}`
        );
        await uploadBytes(storageReference, imageFile);
        imageUrl = await getDownloadURL(storageReference);
        console.log("Image URL:", imageUrl);
      }

      await putUpdateTechnology(
        id,
        values.name,
        values.description,
        values.status,
        imageUrl
      );

      Modal.success({
        content: t("Technology updated successfully!"),
        onOk: () => navigate("/technology-management"),
      });
    } catch (error) {
      message.error(t("Failed to update technology."));
      console.error("Failed to update technology:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-technology">
      <h2>{t("EditTechnology")}</h2>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label={t("name")}
          name="name"
          rules={[
            { required: true, message: t("Please input the technology name!")},
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
            { required: true, message: t("Please select the technology status!")},
          ]}
        >
          <Select>
            <Option value="active">{t("active")}</Option>
            <Option value="inactive">{t("inactive")}</Option>
          </Select>
        </Form.Item>

        <Form.Item label={t("Image")} name="image">
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleImageChange}
          >
            <Button icon={<UploadOutlined />}>{t("Click to Upload")}</Button>
          </Upload>
          {initialImageUrl && !fileList.length && (
            <img
              src={initialImageUrl}
              alt="Technology"
              style={{ width: "100px", marginTop: "10px" }}
            />
          )}
        </Form.Item>

        <Form.Item>
          <Button className="btn" type="primary" htmlType="submit" loading={loading}>
            {t("save")}
          </Button>
          <Button
            className="btn-length"
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/technology-management")}
          >
            {t("Back")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditTechnology;

