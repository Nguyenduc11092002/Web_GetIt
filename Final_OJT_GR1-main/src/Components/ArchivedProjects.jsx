import React, { useState, useEffect } from "react";
import { Table, Space, Button, Pagination, message, Modal, Input } from "antd";
import { useNavigate } from "react-router-dom"; 
import { fetchArchivedProjects, deleteProjectPermanently, restoreProject } from "../service/Project";
import { DeleteOutlined, RollbackOutlined, ArrowLeftOutlined, SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "../assets/style/Global.scss";

const ArchivedProjects = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const pageSize = 10;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = await fetchArchivedProjects();
        setData(projects);
      } catch (error) {
        message.error(t("Failed to fetch archived projects"));
        console.error('Failed to fetch archived projects:', error);
      }
    };
    fetchData();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: t("Are you sure you want to permanently delete this project?"),
      onOk: async () => {
        try {
          await deleteProjectPermanently(key);
          setData(prevData => prevData.filter(item => item.key !== key));
          message.success(t("Project permanently deleted"));
        } catch (error) {
          message.error(t("Failed to delete project"));
          console.error('Failed to delete project:', error);
        }
      }
    });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.projectManager &&
        item.projectManager.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleRestore = (key) => {
    Modal.confirm({
      title: t("Are you sure you want to restore this project?"),
      onOk: async () => {
        try {
          await restoreProject(key);
          setData(prevData => prevData.filter(item => item.key !== key));
          message.success(t("Project restored successfully"));
          navigate("/project-management"); // Navigate to project management page after restoring
        } catch (error) {
          message.error(t("Failed to restore project"));
          console.error('Failed to restore project:', error);
        }
      }
    });
  };

  const columns = [
    {
      title: t("ProjectName"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("Actions"),
      key: "actions",
      render: (text, record) => (
        <Space size="middle">
          <Button 
            icon={<RollbackOutlined />} 
            style={{ color: "blue", borderColor: "blue" }} 
            onClick={() => handleRestore(record.key)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            style={{ color: "red", borderColor: "red" }} 
            onClick={() => handleDelete(record.key)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#fff" }}>
      <Button
        className="btn-length"
        type="default" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate("/project-management")}
        style={{ marginBottom: "16px" }}
      >
        {t("Back")}
      </Button>
      <Input
        placeholder={t("search")}
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ width: "250px", marginBottom: 16 }}
        prefix={<SearchOutlined />}
      />
      <Table 
        columns={columns} 
        dataSource={filteredData.slice(
          (currentPage - 1) * pageSize,
          currentPage * pageSize
        )}
        pagination={false} 
      />
      <div style={{ marginTop: "16px", textAlign: "right" }}>
        <Pagination
          current={currentPage}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default ArchivedProjects;
