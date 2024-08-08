import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, message, Modal, Space, Table, Tabs } from "antd";
import { format } from "date-fns";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { get, getDatabase, onValue, ref } from "firebase/database";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import * as XLSX from "xlsx";
import "../assets/style/Global.scss";
import "../assets/style/Pages/EmployeeManagement.scss";
import {
  deleteEmployeeById,
  fetchAllEmployees,
  fetchAllSkills,
} from "../service/EmployeeServices";
import { fetchAllLanguages2 } from "../service/LanguageServices";
import { fetchAllTechnology } from "../service/TechnologyServices";

const { Column } = Table;
const { confirm } = Modal;
const { TabPane } = Tabs;
const { Search } = Input;

const EmployeeManagement = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userData, setUserData] = useState(null);
  const [data, setData] = useState([]);
  const [skillsList, setSkillsList] = useState([]); // or pass as a prop
  const { id } = useParams();
  const [technologies, setTechnologies] = useState([]);
  const [languages, setLanguages] = useState([]);

  const formatSkill = (skill) =>
    skill
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

  const formatDepartment = (department) => {
    if (typeof department === "string") {
      return department
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
    return department;
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

  const getSkillNameById = (skillId, skills) => {
    const skill = skills.find((sk) => sk.key === skillId);
    return skill ? skill.name : t("Unknown Skill");
  };

  const loadEmployees = async () => {
    try {
      const data = await fetchAllEmployees();
      const filteredData = data
        .filter((employee) => employee.role === "employee")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Lọc dữ liệu theo tab
      if (activeTab === "active") {
        setFilteredEmployees(filteredData.filter((e) => e.status === "active"));
      } else if (activeTab === "inactive") {
        setFilteredEmployees(
          filteredData.filter((e) => e.status === "inactive")
        );
      } else if (activeTab === "involved") {
        setFilteredEmployees(
          filteredData.filter((e) => e.status === "involved")
        );
      } else {
        setFilteredEmployees(filteredData); // Tab "All Employees"
      }
      setEmployees(filteredData);
    } catch (error) {
      console.error(t("errorFetchingEmployees"), error);
    }
  };

  useEffect(() => {
    loadSkills();
    loadEmployees();

    const employeeAdded = localStorage.getItem("employeeAdded");
    if (employeeAdded === "true") {
      message.success(t("employeeAddedSuccessfully"));
      localStorage.removeItem("employeeAdded");
    }
  }, [t, activeTab]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  useEffect(() => {
    // Filter employees based on search term
    const searchData = employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        [employee.name, employee.email, employee.phoneNumber].some((field) =>
          field.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Apply tab filter
    if (activeTab === "active") {
      setFilteredEmployees(searchData.filter((e) => e.status === "active"));
    } else if (activeTab === "inactive") {
      setFilteredEmployees(searchData.filter((e) => e.status === "inactive"));
    } else if (activeTab === "involved") {
      setFilteredEmployees(searchData.filter((e) => e.status === "involved"));
    } else {
      setFilteredEmployees(searchData); // Tab "All Employees"
    }
  }, [searchTerm, employees, activeTab]);

  const showAddPage = () => {
    navigate("/employee-management/add");
  };

  const handleDelete = (record) => {
    if (record.status !== "inactive") {
      message.error(t("onlyInactiveEmployeesCanBeDeleted"));
      return;
    }

    confirm({
      title: t("confirmDeleteEmployee"),
      onOk: async () => {
        try {
          await deleteEmployeeById(record.key);
          message.success(t("employeeDeletedSuccessfully"));
          loadEmployees();
        } catch (error) {
          message.error(t("failedToDeleteEmployee"));
        }
      },
      onCancel() {
        console.log(t("cancel"));
      },
    });
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const db = getDatabase();
        const userRef = ref(db, `users/${userId}`);
        const snapshot = await get(userRef);
        const data = snapshot.val();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchProjects = async () => {
      const projectsRef = ref(getDatabase(), "projects");
      onValue(projectsRef, (snapshot) => {
        const projectsData = snapshot.val();
        const projectsList = [];
        for (const key in projectsData) {
          projectsList.push({ key, ...projectsData[key] });
        }
        const userProjects = projectsList.filter((project) =>
          project.teamMembers?.includes(userId)
        );
        console.log("userProjects", userProjects);
        setProjects(userProjects.reverse());
        console.log("List projects", projectsData);
      });
    };

    if (userId) {
      fetchUserData();
      // fetchUserProjects();
    }
  }, [userId]);

  const exportToExcel = () => {
    const filteredEmployees = employees.map(
      ({ key, createdAt, password, imageUrl, isAdmin, ...rest }) => rest
    );

    const ws = XLSX.utils.json_to_sheet(filteredEmployees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("employees"));
    XLSX.writeFile(wb, `${t("employees")}.xlsx`);
  };

  const paginatedData = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const fetchUserProjects = async (userId) => {
    try {
      const db = getDatabase();
      const projectsRef = ref(db, "projects");
      const snapshot = await get(projectsRef);
      const projectsData = snapshot.val();

      if (!projectsData) {
        console.log(t("noProjectsDataFound"));
        return [];
      }

      const projectsList = Object.keys(projectsData).map((key) => ({
        key,
        ...projectsData[key],
      }));

      return projectsList.filter((project) =>
        project.teamMembers?.includes(userId)
      );
    } catch (error) {
      console.error(t("errorFetchingUserProjects"), error);
      return [];
    }
  };

  const formatDescription = (description) => {
    const translatedDescription = t(description);
    return translatedDescription
      ? translatedDescription.charAt(0).toUpperCase() +
          translatedDescription.slice(1)
      : null;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProjects, allTechnologies, allLanguages, allEmployees] =
          await Promise.all([
            fetchAllTechnology(),
            fetchAllLanguages2(),
            fetchAllEmployees(),
          ]);

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

  const getLanguageNameById = (id, languagesList) => {
    const languages = languagesList.find((lang) => lang.id === id);
    console.log(languages);
    return languages ? languages.name : t("No programming language");
  };

  const getTechnologyNameById = (id, technologiesList) => {
    const tech = technologiesList.find((tech) => tech.id === id);
    return tech ? tech.name : t("No technology");
  };
  const exportToWord = async (employee) => {
    try {
      // Lấy thông tin dự án của nhân viên dựa trên ID
      const userProjects = await fetchUserProjects(employee.key);

      // Fetch all languages and technologies
      const languagesList = await fetchAllLanguages2();
      const technologiesList = await fetchAllTechnology();
      // Tạo một Tài liệu mới
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Phần Tên và Địa chỉ
              new Paragraph({
                children: [
                  new TextRun({
                    text: employee.name || t("Name not available"),
                    bold: true,
                    size: 32, // Tùy chọn: Điều chỉnh kích thước phông chữ
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("Address: "),
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: employee.address || t("Address not available"),
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("Email: "),
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: employee.email || t("Email not available"),
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("Department: "),
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text:
                      formatDepartment(employee.department) ||
                      t("Not provided"),
                    size: 24,
                  }),
                ],
              }),

              // Thêm một đoạn trống để tạo không gian
              new Paragraph({}),

              // Phần KINH NGHIỆM LÀM VIỆC
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("WORKING EXPERIENCE"),
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("Skills: "),
                    bold: true,
                    size: 24,
                  }),
                  new TextRun({
                    text: Array.isArray(employee.skills)
                      ? employee.skills
                          .map((skillId) =>
                            getSkillNameById(skillId, skillsList)
                          )
                          .join(", ")
                      : employee.skills
                      ? getSkillNameById(employee.skills, skillsList)
                      : t("Not provided"),
                    size: 24,
                  }),
                ],
              }),

              // Thêm một đoạn trống để tạo không gian
              new Paragraph({}),

              // Phần DỰ ÁN TIÊU BIỂU
              new Paragraph({
                children: [
                  new TextRun({
                    text: t("TYPICAL PROJECTS"),
                    bold: true,
                    size: 24,
                  }),
                ],
              }),
              ...(userProjects.length > 0
                ? userProjects.flatMap((project) => [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Project name: "),
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: project.name || t("Not provided"),
                          size: 24,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Project Duration: "),
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text:
                            `${format(
                              new Date(project.startDate),
                              "dd/MM/yyyy"
                            )} - ${format(
                              new Date(project.endDate),
                              "dd/MM/yyyy"
                            )}` || t("Dates not provided"),
                          size: 24,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Description: "),
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text:
                            formatDescription(project.description) ||
                            t("Not provided"),
                          size: 24,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Programming languages: "),
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: Array.isArray(project.languages)
                            ? project.languages
                                .map((langId) =>
                                  getLanguageNameById(langId, languagesList)
                                )
                                .join(", ")
                            : project.languages
                            ? getLanguageNameById(
                                project.languages,
                                languagesList
                              )
                            : t("Not provided"),
                          size: 24,
                        }),
                      ],
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Technologies: "),
                          bold: true,
                          size: 24,
                        }),
                        new TextRun({
                          text: Array.isArray(project.technologies)
                            ? project.technologies
                                .map((techId) =>
                                  getTechnologyNameById(
                                    techId,
                                    technologiesList
                                  )
                                )
                                .join(", ")
                            : project.technologies
                            ? getTechnologyNameById(
                                project.technologies,
                                technologiesList
                              )
                            : t("Not provided"),
                          size: 24,
                        }),
                      ],
                    }),
                    // Thêm một đoạn trống để tạo không gian giữa các dự án
                    new Paragraph({}),
                  ])
                : [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: t("Not yet joined the project"),
                          size: 24,
                          italics: true,
                        }),
                      ],
                    }),
                  ]),
            ],
          },
        ],
      });

      // Lưu tài liệu dưới dạng tệp .docx
      Packer.toBlob(doc).then((blob) => {
        saveAs(blob, `${employee.name || t("Employee")}_CV.docx`);
      });
    } catch (error) {
      console.error("Error exporting to Word:", error);
      message.error(t("Unable to export to Word. Please try again."));
    }
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
        {t("Add New Employee")}
      </Button>
      <Button
        className="btn"
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={exportToExcel}
        icon={<ExportOutlined />}
      >
        {t("exportToExcel")}
      </Button>
      <Search
        placeholder={t("searchbyemailorphonenumber")}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: 250 }}
        prefix={<SearchOutlined />}
      />
      <Tabs
        centered
        defaultActiveKey="all"
        onChange={(key) => setActiveTab(key)}
      >
        <TabPane tab={t("AllEmployees")} key="all">
          {/* All Employees tab content */}
        </TabPane>
        <TabPane tab={t("active")} key="active">
          {/* Active Employees tab content */}
        </TabPane>
        <TabPane tab={t("inactive")} key="inactive">
          {/* Inactive Employees tab content */}
        </TabPane>
        <TabPane tab={t("involved")} key="involved">
          {/* Involved Employees tab content */}
        </TabPane>
      </Tabs>

      <Table
        dataSource={paginatedData}
        rowKey="key"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: employees.length,
          onChange: (page, pageSize) =>
            handleTableChange({ current: page, pageSize }),
        }}
      >
        <Column
          title={t("avatar")}
          dataIndex="imageUrl"
          key="imageUrl"
          render={(text, record) => (
            <img
              src={record.imageUrl}
              alt={t("employee")}
              width="50"
              height="50"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        />
        <Column title={t("name")} dataIndex="name" key="name" />
        <Column title={t("email")} dataIndex="email" key="email" />
        <Column
          title={t("phoneNumber")}
          dataIndex="phoneNumber"
          key="phoneNumber"
        />
        <Column
          title={t("skills")}
          dataIndex="skills"
          key="skills"
          render={(text) => {
            if (Array.isArray(text)) {
              return text
                .map((skillId) => getSkillNameById(skillId, skillsList))
                .join(", ");
            }
            return getSkillNameById(text, skillsList);
          }}
        />
        <Column
          title={t("status")}
          dataIndex="status"
          key="status"
          render={(text) => {
            const translatedText = t(text);

            const className =
              translatedText === t("active")
                ? "status-active"
                : translatedText === t("inactive")
                ? "status-inactive"
                : translatedText === t("involved")
                ? "status-involved"
                : "";

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
                onClick={() =>
                  navigate(`/employee-management/view/${record.key}`)
                }
              />
              <Button
                icon={<EditOutlined />}
                style={{ color: "blue", borderColor: "blue" }}
                onClick={() =>
                  navigate(`/employee-management/edit/${record.key}`)
                }
              />
              <Button
                icon={<DeleteOutlined />}
                style={{ color: "red", borderColor: "red" }}
                onClick={() => handleDelete(record)}
              />
              <Button
                icon={<ExportOutlined />}
                style={{ color: "black", borderColor: "black" }}
                onClick={() => exportToWord(record, projects)}
              />
            </Space>
          )}
        />
      </Table>
    </div>
  );
};

export default EmployeeManagement;
