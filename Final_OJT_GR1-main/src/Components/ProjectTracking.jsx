import { Table } from "antd";
import dayjs from "dayjs";
import { get, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { database } from "../firebaseConfig";
import { useTranslation } from "react-i18next";

const ProjectTracking = () => {
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeMapping, setEmployeeMapping] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchEmployeeMapping = async () => {
      try {
        const employeeRef = ref(database, "users"); // Truy vấn từ bảng 'users'
        const snapshot = await get(employeeRef);
        const data = snapshot.val();
        if (data) {
          const mapping = Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value.name; // Giả sử tên nhân viên được lưu trong trường 'name'
            return acc;
          }, {});
          setEmployeeMapping(mapping);
          console.log("Employee Mapping:", mapping); // Kiểm tra dữ liệu nhân viên
        }
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployeeMapping();
  }, []); // Dependency array rỗng để chỉ chạy một lần khi component mount

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const historyRef = ref(database, `projectHistory/${id}`);
        const snapshot = await get(historyRef);
        const data = snapshot.val();

        const capitalizeFirstLetter = (string) => {
          return string.charAt(0).toUpperCase() + string.slice(1);
        };

        const formattedData = data
          ? Object.entries(data).map(([key, value]) => ({
              key,
              action: capitalizeFirstLetter(t(value.action)),
              employeeName: employeeMapping[value.employeeId] || t("Unknown"), // Thay thế ID bằng tên
              timestamp: value.timestamp,
            }))
          : [];
          
        // Sắp xếp theo timestamp từ mới nhất đến cũ nhất
        const sortedData = formattedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setHistory(sortedData);
        console.log("Sorted History Data:", sortedData); // Kiểm tra dữ liệu lịch sử đã sắp xếp
      } catch (error) {
        console.error("Failed to fetch project history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (Object.keys(employeeMapping).length > 0) {
      fetchHistory();
    }
  }, [id, employeeMapping]); // Chạy lại khi `id` hoặc `employeeMapping` thay đổi

  const columns = [
    {
      title: t("actions"),
      dataIndex: "action",
      key: "action",
    },
    {
      title: t("Employee Name"),
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
    },
    {
      title: t("Timestamp"),
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp) => dayjs(timestamp).format("DD/MM/YYYY HH:mm:ss"),
      sorter: (a, b) => new Date(b.timestamp) - new Date(a.timestamp), // Sắp xếp theo cột Timestamp
    },
  ];

  return (
    <div style={{ padding: "24px", background: "#fff" }}>
      <h2>{t("Project History")}</h2>
      <Table columns={columns} dataSource={history} loading={loading} />
    </div>
  );
};

export default ProjectTracking;
