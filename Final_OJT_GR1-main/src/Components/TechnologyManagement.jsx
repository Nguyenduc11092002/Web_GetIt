import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Space, Table, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../assets/style/Pages/TechnologyManagement.scss";
import {
  deleteTechnology,
  fetchAllTechnology,
} from "../service/TechnologyServices";

const { Column } = Table;
const { confirm } = Modal;

const TechnologyManagement = () => {
  const [technologies, setTechnologies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredStatus, setFilteredStatus] = useState("All Technology");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  // Load technologies from the server
  const loadTechnologies = async () => {
    try {
      const data = await fetchAllTechnology();
      setTechnologies(data);
    } catch (error) {
      console.error(t("Failed to fetch technologies:"), error);
    }
  };

  useEffect(() => {
    loadTechnologies();
  }, []);

  // Handle table pagination changes
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Show add technology page
  const showAddPage = () => {
    navigate("/technology-management/add");
  };

  // Handle technology deletion
  const handleDelete = (record) => {
    if (record.status.toLowerCase() !== "inactive") {
      message.error(t("Only inactive technologies can be deleted."));
      return;
    }

    confirm({
      title: t("Are you sure you want to delete this technology?"),
      onOk: async () => {
        try {
          await deleteTechnology(record.id);
          message.success(t("Technology deleted successfully!"));
          loadTechnologies(); // Reload technologies after deletion
        } catch (error) {
          message.error(t("Failed to delete technology."));
        }
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  // Handle tab change
  const handleTabChange = (key) => {
    setFilteredStatus(key);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter and paginate data
  const filteredData = technologies.filter((item) => {
    const matchesStatus =
      filteredStatus === "All Technology" ||
      item.status.toLowerCase() === filteredStatus.toLowerCase();
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Tab items for filtering
  const tabItems = [
    { key: "All Technology", label: t("All Technologies") },
    { key: "active", label: t("Active") },
    { key: "inactive", label: t("Inactive") },
  ];

  const formatDescription = (description) => {
    const translatedDescription = t(description);
    return translatedDescription ? translatedDescription.charAt(0).toUpperCase() + translatedDescription.slice(1) : null;
  };

  return (
    <div>
      <Button
        className="btn"
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={showAddPage}
        icon={<PlusOutlined />}
      >
        {t("Add New Technology")}
      </Button>
      <Input
        placeholder={t("searchbyname")}
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ width: "250px", marginBottom: 16 }}
        prefix={<SearchOutlined />}
      />
      <Tabs
        defaultActiveKey="All Technology"
        onChange={handleTabChange}
        items={tabItems}
        centered
      />
      <Table
        dataSource={paginatedData}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
      >
        <Column
          title={t("Image")}
          dataIndex="imageUrl"
          key="imageUrl"
          render={(imageUrl) =>
            imageUrl ? (
              <img
                src={imageUrl}
                alt="Technology"
                style={{ width: 50, height: 50 }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "path/to/placeholder.png";
                }}
              />
            ) : (
              <span>No Image</span>
            )
          }
        />
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
                  navigate(`/technology-management/edit/${record.id}`)
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

export default TechnologyManagement;
