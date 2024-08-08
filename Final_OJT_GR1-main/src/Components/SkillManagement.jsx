import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SearchOutlined
} from "@ant-design/icons";
import { Button, Input, message, Modal, Space, Table, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/style/Global.scss";
import "../assets/style/Pages/SkillManagement.scss";
import {
    deleteSkillById,
    fetchAllSkills,
} from "../service/SkillServices";
import { useTranslation } from "react-i18next";

const { Column } = Table;
const { confirm } = Modal;

const SkillManagement = () => {
    const [skills, setSkills] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filteredStatus, setFilteredStatus] = useState("All Skills");
    const navigate = useNavigate();
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [dataSkillEdit, setDataSkillEdit] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();

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

        const skillAdded = localStorage.getItem("skillAdded");
        if (skillAdded === "true") {
            message.success(t("Skill added successfully!"));
            localStorage.removeItem("skillAdded"); // Xóa thông báo sau khi đã hiển thị
        }
    }, []);

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
    };

    const showEditModal = (record) => {
        setDataSkillEdit(record);
        setIsEditModalVisible(true);
    };

    const showAddPage = () => {
        navigate("/position-management/skill/add");
    };

    const handleDelete = (record) => {
        if (record.status !== "inactive") {
            message.error(t("Only inactive skills can be deleted."));
            return;
        }

        confirm({
            title: t("Are you sure you want to delete this skill?"),
            onOk: async () => {
                try {
                    await deleteSkillById(record.key);
                    message.success(t("Skill deleted successfully!"));
                    loadSkills();
                } catch (error) {
                    message.error(t("Failed to delete skill."));
                }
            },
            onCancel() {
                console.log("Cancel");
            },
        });
    };

    const handleTabChange = (key) => {
        setFilteredStatus(key);
        setCurrentPage(1); // Reset to first page when changing tabs
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const filteredData = skills.filter((item) => {
        const matchesStatus = filteredStatus === "All Skills" || item.status.toLowerCase() === filteredStatus.toLowerCase();
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const formatDescription = (description) => {
        const translatedDescription = t(description);
        return translatedDescription ? translatedDescription.charAt(0).toUpperCase() + translatedDescription.slice(1) : null;
    };

    const tabItems = [
        { key: "All Skills", label: t("All Skills") },
        { key: "active", label: t("active") },
        { key: "inactive", label: t("inactive") },
    ];

    return (
        <div>
            <Button
                className="btn"
                type="primary"
                style={{ marginBottom: 16 }}
                onClick={showAddPage}
                icon={<PlusOutlined />}
            >
                {t("Add New Skill")}
            </Button>
            <Input
                placeholder={t("searchbyname")}
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ width: "250px", marginBottom: 16 }}
                prefix={<SearchOutlined />}
            />
            <Tabs
                defaultActiveKey="All Skills"
                onChange={handleTabChange}
                items={tabItems}
                centered
            />
            <Table
                dataSource={paginatedData}
                rowKey="key"
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredData.length,
                    onChange: (page, pageSize) =>
                        handleTableChange({ current: page, pageSize }),
                }}
            >
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
                                icon={<EditOutlined />}
                                style={{ color: "blue", borderColor: "blue" }}
                                onClick={() =>
                                    navigate(`/position-management/skill/edit/${record.key}`)
                                }
                            />
                            <Button
                                icon={<DeleteOutlined />}
                                style={{ color: "red", borderColor: "red" }}
                                onClick={() => handleDelete(record)}
                            />
                        </Space>
                    )}
                />
            </Table>
        </div>
    );
};

export default SkillManagement;
