import React, { useState } from "react";
import { Modal, Button, Input, Upload, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { postCreateTechnology } from "../service/TechnologyServices";
import { toast } from "react-toastify";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

const { Option } = Select;

const ModalAddTechnology = ({ open, handleClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (image) {
      try {
        const imageRef = storageRef(storage, `technology/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image.");
        throw error;
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);

      let uploadedImageURL = "";
      if (image) {
        uploadedImageURL = await handleUpload();
        toast.success("Image uploaded successfully!");
      }

      await postCreateTechnology(name, description, status, uploadedImageURL);

      toast.success("Technology added successfully!");

      // Reset form fields to default values
      setName("");
      setDescription("");
      setStatus("active");
      setImage(null);
      setImagePreview(null);

      handleClose();
    } catch (error) {
      toast.error("Failed to add technology.");
      console.error("Error adding technology:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Add New Technology"
      open={open}
      onCancel={() => {
        handleClose();
        setImagePreview("");
        setStatus("active");
      }}
      footer={[
        <Button key="back" onClick={handleClose}>
          Close
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={uploading}
        >
          Save
        </Button>,
      ]}
    >
      <div className="body-add">
        <div className="mb-3">
          <label className="form-label">Name</label>
          <Input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <Input
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Status</label>
          <Select
            value={status}
            onChange={(value) => setStatus(value)}
            placeholder="Select Status"
          >
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
        </div>
        <div className="mb-3">
          <Upload
            accept=".jpg,.jpeg,.png"
            beforeUpload={(file) => {
              handleImageChange({ target: { files: [file] } });
              return false; // Prevent automatic upload
            }}
            listType="picture"
          >
            <Button>
              <PlusOutlined />
              Upload Image
            </Button>
          </Upload>
          {imagePreview && (
            <img src={imagePreview} alt="Image Preview" width="100%" />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalAddTechnology;