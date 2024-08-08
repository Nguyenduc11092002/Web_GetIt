import React, { useState, useEffect } from "react";
import { Button, Input, Select, Table, Modal, Space } from "antd";
import {
    postCreateSkill,
    fetchAllSkills,
    deleteSkillById,
} from "../service/SkillServices";
import { EyeOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "../Components/AddSkill.jsx";
import "../assets/style/Global.scss";
import { useTranslation } from "react-i18next";

const { Option } = Select;
const { Column } = Table;

const AddSkill = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("active");
    const [skills, setSkills] = useState([]);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const { t } = useTranslation();

    const navigate = useNavigate();

    const loadSkills = async () => {
        try {
            const data = await fetchAllSkills();
            setSkills(data);
        } catch (error) {
            console.error("Failed to fetch skills:", error);
        }
    };

    useEffect(() => {
        loadSkills();
    }, []);

    const handleAddSkill = async () => {
        if (!name || !description || !status) {
            toast.error(t("Please fill in all fields."));
            return;
        }

        try {
            await postCreateSkill(name, description, status);
            localStorage.setItem("skillAdded", "true");
            navigate("/position-management");
        } catch (error) {
            toast.error(t("Failed to add skill."));
        }
    };

    const handleViewSkill = (skill) => {
        setSelectedSkill(skill);
        setViewModalVisible(true);
    };

    const handleDeleteSkill = async (id) => {
        try {
            await deleteSkillById(id);
            toast.success(t("Skill deleted successfully!"));
            loadSkills(); // Reload the skills list
        } catch (error) {
            toast.error(t("Failed to delete skill."));
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
        <div className="add-skill">
            <h2>{t("Add New Skill")}</h2>
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
                onClick={handleAddSkill}
                disabled={!name || !description || !status}
            >
                {t("Save")}
            </Button>
            <Button
                className="btn-length"
                style={{ marginLeft: 8 }}
                onClick={() => navigate("/position-management")}
            >
                {t("Back to Skill Management")}
            </Button>

            <h2>{t("ExistingSkill")}</h2>
            <Table dataSource={skills} rowKey="key" pagination={false}>
                <Column title={t("name")} dataIndex="name" key="name" />
                <Column title={t("Description")} dataIndex="description" key="description" />
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
                                onClick={() => handleViewSkill(record)}
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                style={{ color: "red", borderColor: "red" }}
                                onClick={() => handleDeleteSkill(record.key)}
                            />
                        </Space>
                    )}
                />
            </Table>
            <Modal
                title={t("ViewSkill")}
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        {t("close")}
                    </Button>,
                ]}
            >
                {selectedSkill && (
                    <div>
                        <p>
                            <strong>{t("name")}:</strong> {selectedSkill.name}
                        </p>
                        <p>
                            <strong>{t("Description")}:</strong> {formatDescription(selectedSkill.description)}
                        </p>
                        <p>
                            <strong>{t("Status")}:</strong> {formatStatus(selectedSkill.status)}
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AddSkill;
