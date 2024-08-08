import { Button, Modal } from "antd";
import PropTypes from "prop-types";
import React from "react";
import { toast } from "react-toastify";
import { deleteTechnology } from "../service/TechnologyServices";

const ModalDeleteTechnology = ({ open, handleClose, technologyIdToDelete }) => {
  const handleDeleteTechnology = async () => {
    try {
      await deleteTechnology(technologyIdToDelete);
      handleClose();
      toast.success("Technology deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete technology.");
      console.error("Failed to delete technology:", error);
    }
  };

  return (
    <Modal
      title="Delete Technology"
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="back" onClick={handleClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          onClick={handleDeleteTechnology}
        >
          Delete
        </Button>,
      ]}
    >
      <p>Are you sure you want to delete this technology?</p>
    </Modal>
  );
};

ModalDeleteTechnology.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  technologyIdToDelete: PropTypes.string.isRequired,
};

export default ModalDeleteTechnology;
