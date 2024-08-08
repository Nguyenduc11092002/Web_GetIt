import { Button, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchEmployeeById,
  fetchAllPositions,
  fetchAllSkills,
} from "../service/EmployeeServices";
import { get, getDatabase, ref } from "firebase/database";
import "../assets/style/Global.scss";

const EmployeeDetails = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillsList, setSkillsList] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const data = await fetchEmployeeById(id);
        setEmployee(data);

        // Lấy thông tin dự án liên quan đến nhân viên
        const db = getDatabase();
        const projectsRef = ref(db, `projects`);
        const projectsSnapshot = await get(projectsRef);
        const allProjects = projectsSnapshot.val();

        // Lọc các dự án mà nhân viên đang tham gia
        const userProjects = Object.values(allProjects).filter((project) =>
          project.teamMembers.includes(id)
        );

        setProjects(userProjects || []);
      } catch (error) {
        message.error(t("failedToFetchEmployeeDetails"));
      } finally {
        setLoading(false);
      }
    };

    const loadSkills = async () => {
      try {
        const skillsData = await fetchAllSkills();
        setSkillsList(
          skillsData.map((skill) => ({ key: skill.key, name: skill.label }))
        );
      } catch (error) {
        message.error(t("Failed to fetch skills"));
      }
    };

    const loadPositions = async () => {
      try {
        const positionsData = await fetchAllPositions();
        setPositions(
          positionsData.map((pos) => ({ key: pos.key, name: pos.label }))
        ); // Adjust based on your data structure
      } catch (error) {
        message.error(t("failedToFetchPositions"));
      }
    };

    loadEmployee();
    loadPositions();
    loadSkills();
  }, [id, t]);

  const getPositionNameById = (positionId, positions) => {
    const position = positions.find((pos) => pos.key === positionId);
    return position ? position.name : t("unknownPosition");
  };

  const getSkillNameById = (skillId, skills) => {
    const skill = skills.find((sk) => sk.key === skillId);
    return skill ? skill.name : t("Unknown Skill");
  };

  if (loading) return <Spin size="large" />;

  const formatSkill = (skill) =>
    skill
      .replace(/_/g, " ") // Thay thế dấu gạch dưới bằng dấu cách
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const formatDepartment = (department) => {
    if (typeof department === "string") {
      return department
        .replace(/_/g, " ") // Thay dấu "_" bằng dấu cách
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Viết hoa chữ cái đầu
    }
    return department; // Nếu department không phải là chuỗi, trả về giá trị gốc
  };

  return (
    <div className="employee-details">
      <h2>{t("employeeDetails")}</h2>
      {employee ? (
        <div>
          {employee.imageUrl && (
            <div>
              <img
                src={employee.imageUrl}
                alt={t("employeeImage")}
                width="100"
                height="100"
                style={{ objectFit: "cover", marginLeft: "10px" }}
              />
            </div>
          )}
          <p>
            <strong>{t("name")}:</strong> {employee.name}
          </p>
          <p>
            <strong>{t("email")}:</strong> {employee.email}
          </p>
          <p>
            <strong>{t("phoneNumber")}:</strong> {employee.phoneNumber}
          </p>
          <p>
            <strong>{t("skills")}:</strong>{" "}
            {employee.skills
              .map((skillId) => getSkillNameById(skillId, skillsList))
              .join(", ")}
          </p>
          <p>
            <strong>{t("department")}:</strong>{" "}
            {formatDepartment(employee.department)}
          </p>
          <p>
            <strong>{t("position")}:</strong>{" "}
            {getPositionNameById(employee.position, positions)}
          </p>
          <p>
            <strong>{t("status")}: </strong>
            <span
              className={
                employee.status === "active"
                  ? "status-active"
                  : employee.status === "involved"
                    ? "status-involved"
                    : "status-inactive"
              }
            >
              {employee.status
                ? employee.status.charAt(0).toUpperCase() +
                employee.status.slice(1)
                : ""}
            </span>
          </p>
          <div className="project-detail">
            {projects.map((project) => (
              <div className="project-detail-item" key={project.id}>
                <p>
                  <strong>{t("ProjectName")}:</strong> {project.name}
                </p>
                <p>
                  <strong>{t("Description")}:</strong> {project.description}
                </p>
                <p>
                  <strong>{t("StartDate")}:</strong>{" "}
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>{t("EndDate")}:</strong>{" "}
                  {new Date(project.endDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
          <Button
            type="primary"
            className="btn"
            onClick={() => navigate("/employee-management")}
            style={{ marginTop: "16px" }}
          >
            {t("backToEmployeeManagement")}
          </Button>
        </div>
      ) : (
        <p>{t("employeeNotFound")}</p>
      )}
    </div>
  );
};

export default EmployeeDetails;