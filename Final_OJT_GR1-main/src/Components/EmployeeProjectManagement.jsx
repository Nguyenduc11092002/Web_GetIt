import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import {
  Avatar,
  Button,
  Input,
  Pagination,
  Space,
  Table,
  Tabs,
  Tag,
} from "antd";
import { onValue, ref } from "firebase/database"; // Import ref và onValue từ Firebase Database
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../assets/style/Global.scss";
import "../assets/style/Pages/ProjectManagement.scss";
import { database } from "../firebaseConfig"; // Import cấu hình Firebase

const statusColors = {
  COMPLETED: "green",
  ONGOING: "blue",
  "NOT STARTED": "orange",
  PENDING: "yellow",
};

const EmployeeProjectManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStatus, setFilteredStatus] = useState("All Projects");
  const [data, setData] = useState([]);
  const pageSize = 10;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { t } = useTranslation();

  // Lấy userId của employee đăng nhập từ localStorage
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      const projectsRef = ref(database, "projects");
      onValue(projectsRef, (snapshot) => {
        const projectsData = snapshot.val();
        const projects = [];
        for (const key in projectsData) {
          projects.push({ key, ...projectsData[key] });
        }
        // Kiểm tra xem dự án có mảng teamMembers chứa userId của employee đăng nhập không
        const employeeProjects = projects.filter((project) => {
          if (project.teamMembers && Array.isArray(project.teamMembers)) {
            return project.teamMembers.includes(userId); // So sánh với userId
          }
          return false;
        });
        setData(employeeProjects.reverse());
      });
    };
    fetchData();
  }, [userId]); // Thay đổi phụ thuộc vào userId

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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
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

  const formatBudget = (value) => {
    if (typeof value !== "string") {
      value = String(value);
    }
    if (!value) return "";
    const hasDollarSign = value.startsWith("$");
    const hasVND = value.endsWith("VND");
    let numericValue = value.replace(/[^\d]/g, "");
    numericValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (hasDollarSign) {
      numericValue = `$${numericValue}`;
    }
    if (hasVND) {
      numericValue = `${numericValue}VND`;
    }
    return numericValue;
  };

  const columns = [
    {
      title: t("ProjectName"),
      dataIndex: "name",
      key: "name",
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
    },
    {
      title:  t("Budget"),
      dataIndex: "budget",
      key: "budget",
      render: formatBudget,
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
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            style={{ color: "green", borderColor: "green" }}
            onClick={() => navigate(`/project/${record.key}`)}
          />
        </Space>
      ),
    },
  ];

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

export default EmployeeProjectManagement;
