import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  RestOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Modal,
  Pagination,
  Space,
  Table,
  Tabs,
  Tag,
  message,
} from "antd";
import moment from "moment"; // Thêm moment.js để xử lý định dạng ngày tháng
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../assets/style/Global.scss";
import "../assets/style/Pages/ProjectManagement.scss";
import { fetchAllProjects, moveToArchive } from "../service/Project";

const statusColors = {
  COMPLETED: "green",
  ONGOING: "blue",
  "NOT STARTED": "orange",
  PENDING: "yellow",
};

const ProjectManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStatus, setFilteredStatus] = useState("All Projects");
  const [data, setData] = useState([]);
  const pageSize = 10;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      const projects = await fetchAllProjects();
      setData(projects.reverse());
    };
    fetchData();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTabChange = (key) => {
    setFilteredStatus(key);
    setCurrentPage(1); // Reset to the first page when changing tabs
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const filteredData = data.filter((item) => {
    const matchesStatus =
      filteredStatus === "All Projects" ||
      item.status === filteredStatus.toUpperCase();
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.projectManager &&
        item.projectManager.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getInitials = (name) => {
    if (!name) return ""; // Handle undefined or null name
    const parts = name.split(" ");
    if (parts.length < 2) return name.charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getRandomColor = () => {
    const colors = [
      "#f56a00",
      "#7265e6",
      "#ffbf00",
      "#00a2ae",
      "#eb2f96",
      "#7cb305",
      "#13c2c2",
      "#096dd9",
      "#f5222d",
      "#fa8c16",
      "#fa541c",
      "#52c41a",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleDelete = (key) => {
    Modal.confirm({
      title: t("Are you sure you want to archive this project?"),
      onOk: async () => {
        try {
          await moveToArchive(key);
          setData((prevData) => prevData.filter((item) => item.key !== key));
          message.success(t("Project archived successfully"));
        } catch (error) {
          message.error(t("Failed to archive project"));
        }
      },
    });
  };

  const formatBudget = (value) => {
    // Chuyển đổi value thành chuỗi nếu nó không phải là chuỗi
    if (typeof value !== "string") {
      value = String(value);
    }

    // Kiểm tra nếu value không tồn tại hoặc là một chuỗi trống
    if (!value) return "";

    // Check if the value has "$" or "VND"
    const hasUSD = value.endsWith("USD");
    const hasVND = value.endsWith("VND");

    // Remove "$" and "VND" for formatting
    let numericValue = value.replace(/[^\d]/g, "");

    // Format the number with commas
    numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Add "$" or "VND" back
    if (hasUSD) {
      numericValue = `${numericValue} USD`;
    }
    if (hasVND) {
      numericValue = `${numericValue} VND`;
    }

    return numericValue;
  };

  const columns = [
    {
      title: t("ProjectName"),
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: t("StartDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => {
        if (!date) return "";
        const dateObj = moment(date); // Sử dụng moment để chuyển đổi định dạng ngày tháng
        return dateObj.isValid()
          ? dateObj.format("DD/MM/YYYY")
          : "Invalid Date";
      },
      sorter: (a, b) => {
        // Chuyển đổi ngày tháng thành đối tượng moment và so sánh
        const dateA = moment(a.startDate, "YYYY-MM-DD");
        const dateB = moment(b.startDate, "YYYY-MM-DD");
        return dateA - dateB;
      },
    },
    {
      title: t("EndDate"),
      dataIndex: "endDate",
      key: "endDate",
      render: (date) => {
        if (!date) return "";
        const dateObj = moment(date); // Sử dụng moment để chuyển đổi định dạng ngày tháng
        return dateObj.isValid()
          ? dateObj.format("DD/MM/YYYY")
          : "Invalid Date";
      },
      sorter: (a, b) => {
        // Chuyển đổi ngày tháng thành đối tượng moment và so sánh
        const dateA = moment(a.startDate, "YYYY-MM-DD");
        const dateB = moment(b.startDate, "YYYY-MM-DD");
        return dateA - dateB;
      },
    },
    {
      title: t("ProjectManager"),
      dataIndex: "projectManager",
      key: "projectManager",
      className: "text-align-start",
      render: (personInCharge) => (
        <div className="text-align-start">
          <Space>
            <Avatar style={{ backgroundColor: getRandomColor() }}>
              {getInitials(personInCharge)}
            </Avatar>
            {personInCharge}
          </Space>
        </div>
      ),
      sorter: (a, b) => {
        return a.projectManager.localeCompare(b.projectManager);
      },
    },
    {
      title: t("Budget"),
      dataIndex: "budget",
      key: "budget",
      render: formatBudget,
      sorter: (a, b) => {
        // Chuyển đổi giá trị budget từ chuỗi tiền tệ sang số thực để sắp xếp chính xác
        const budgetA = parseFloat(a.budget.replace(/[^0-9.-]+/g, ""));
        const budgetB = parseFloat(b.budget.replace(/[^0-9.-]+/g, ""));
        return budgetA - budgetB;
      },
    },
    {
      title: t("status"),
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status]} key={status}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: t("actions"),
      key: "actions",
      render: (text, record) => (
        <div className="actions-container">
          <Space size="middle">
            <Button
              icon={<EyeOutlined />}
              style={{ color: "green", borderColor: "green" }}
              onClick={() => navigate(`/project/${record.key}`)}
            />
            <Button
              icon={<EditOutlined />}
              style={{ color: "blue", borderColor: "blue" }}
              onClick={() => navigate(`/edit-project/${record.key}`)}
            />
            {record.status !== "ONGOING" && (
              <Button
                icon={<DeleteOutlined />}
                style={{ color: "red", borderColor: "red" }}
                onClick={() => handleDelete(record.key)}
              />
            )}
          </Space>
        </div>
      ),
    },
  ];

  // Tabs items
  const tabItems = [
    { key: "All Projects", label: t("AllProject") },
    { key: "Ongoing", label: t("Ongoing") },
    { key: "Not Started", label: t("NotStarted") },
    { key: "Completed", label: t("Completed") },
    { key: "Pending", label: t("Pending") },
  ];

  return (
    <div style={{ padding: "24px", background: "#fff" }}>
      <div className="project-management-header">
        <Button
          className="btn"
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/new-project")}
        >
          {t("Add New Project")}
        </Button>
        <Button
          className="btn"
          type="primary"
          icon={<RestOutlined />}
          onClick={() => navigate("/archived-projects")}
          style={{ marginLeft: "auto" }}
        >
          {t("Archived Projects")}
        </Button>
        <Input
          placeholder={t("searchbynameproject")}
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ width: "250px", marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />
      </div>
      <Tabs
        defaultActiveKey="All Projects"
        onChange={handleTabChange}
        items={tabItems}
        centered
      />
      <Table columns={columns} dataSource={paginatedData} pagination={false} />
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

export default ProjectManagement;
