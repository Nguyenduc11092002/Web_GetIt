import { Button, Modal, message } from "antd";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchAllEmployees } from "../service/EmployeeServices";
import { fetchAllLanguages } from "../service/LanguageServices";
import { deleteProjectPermanently, fetchAllProjects } from "../service/Project";
import { fetchAllTechnology } from "../service/TechnologyServices";

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [technologies, setTechnologies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const formatDate = (date) => {
    if (!date) return "";
    const dateObj = dayjs(date, "YYYY-MM-DD");
    return dateObj.format("DD/MM/YYYY");
  };

  // Convert IDs to names using the provided list
  const getNamesFromIds = (ids = [], options = []) => {
    if (!Array.isArray(ids) || !Array.isArray(options)) return "";
    return options
      .filter((option) => ids.includes(option.value))
      .map((option) => option.label)
      .join(", "); // Join names with a command
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProjects, allTechnologies, allLanguages, allEmployees] =
          await Promise.all([
            fetchAllProjects(),
            fetchAllTechnology(),
            fetchAllLanguages(),
            fetchAllEmployees(),
          ]);

        const projectData = allProjects.find((project) => project.key === id);
        if (projectData) {
          setProject(projectData);
        } else {
          message.error(t("Project not found"));
          const userRole = JSON.parse(localStorage.getItem("user"))?.role;
          const redirectPath =
            userRole === "admin"
              ? "/project-management"
              : "/employee-ProjectManagement";
          navigate(redirectPath);
        }

        setTechnologies(
          allTechnologies.map((tech) => ({
            label: tech.name,
            value: tech.id,
          }))
        );
        setLanguages(
          allLanguages.map((lang) => ({
            label: lang.name,
            value: lang.key,
          }))
        );
        setEmployees(
          allEmployees
            .filter((emp) => emp.role === "employee")
            .map((emp) => ({
              label: emp.name,
              value: emp.key,
            }))
        );
      } catch (error) {
        console.error("Error fetching project or related data:", error);
        message.error(t("Error fetching project data"));
        const userRole = JSON.parse(localStorage.getItem("user"))?.role;
        const redirectPath =
          userRole === "admin"
            ? "/project-management"
            : "/employee-ProjectManagement";
        navigate(redirectPath);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      if (project && project.key) {
        await deleteProjectPermanently(project.key);
        message.success(t("Project deleted successfully"));
        const userRole = JSON.parse(localStorage.getItem("user"))?.role;
        const redirectPath =
          userRole === "admin"
            ? "/project-management"
            : "/employee-ProjectManagement";
        navigate(redirectPath);
      } else {
        message.error(t("Project not found"));
      }
    } catch (error) {
      message.error(t("Failed to delete project"));
    }
  };

  const showDeleteConfirm = () => {
    Modal.confirm({
      title: t("Are you sure you want to delete this project?"),
      content: t("This action cannot be undone"),
      okText: t("Yes"),
      okType: "danger",
      cancelText: t("No"),
      onOk: handleDelete,
    });
  };

  if (!project) {
    return <div>{t("Loading...")}</div>;
  }

  const displayedTechnologies = getNamesFromIds(
    project.technologies || [],
    technologies
  );
  const displayedLanguages = getNamesFromIds(
    project.languages || [],
    languages
  );
  const displayedTeamMembers = getNamesFromIds(
    project.teamMembers || [],
    employees
  );

  const handleBack = () => {
    const userRole = JSON.parse(localStorage.getItem("user"))?.role;
    const redirectPath =
      userRole === "admin"
        ? "/project-management"
        : "/employee-ProjectManagement";
    navigate(redirectPath);
  };

  return (
    <div style={{ padding: "24px", background: "#fff" }}>
      <Button className="btn-length" type="default" onClick={handleBack}>
        {t("Back")}
      </Button>
      <h2>{t("ProjectDetail")}</h2>
      {project.imageUrl && (
        <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <img
            src={project.imageUrl}
            alt="Project"
            style={{
              maxWidth: "100%",
              maxHeight: "400px",
              objectFit: "contain",
            }}
          />
        </div>
      )}
      <p>
        <strong>{t("ProjectName")}:</strong> {project.name}
      </p>
      <p>
        <strong>{t("Description")}:</strong> {project.description}
      </p>
      <p>
        <strong>{t("clientName")}:</strong> {project.clientName}
      </p>
      <p>
        <strong>{t("ProjectManager")}:</strong> {project.projectManager}
      </p>
      <p>
        <strong>{t("clientEmail")}:</strong> {project.clientEmail}
      </p>
      <p>
        <strong>{t("phoneNumber")}:</strong> {project.phoneNumber}
      </p>
      <p>
        <strong>{t("TeamMember")}:</strong> {displayedTeamMembers}
      </p>
      <p>
        <strong>{t("Budget")}:</strong> {project.budget}
      </p>
      <p>
        <strong>{t("Status")}:</strong> {project.status}
      </p>
      <p>
        <strong>{t("Priority")}:</strong> {t(project.priority)}
      </p>
      <p>
        <strong>{t("StartDate")}:</strong> {formatDate(project.startDate)}
      </p>
      <p>
        <strong>{t("EndDate")}:</strong> {formatDate(project.endDate)}
      </p>
      <p>
        <strong>{t("TechnologiesUsed")}:</strong> {displayedTechnologies}
      </p>
      <p>
        <strong>{t("ProgrammingLanguageUsed")}:</strong> {displayedLanguages}
      </p>
      <Link to={`/project-tracking/${project.key}`}>
        <Button className="btn" type="primary">{t("View History")}</Button>
      </Link>
    </div>
  );
};

export default ProjectDetail;
