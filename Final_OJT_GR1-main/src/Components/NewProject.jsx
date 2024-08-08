import { UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, message, Select, Upload } from "antd";
import emailjs from "emailjs-com";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  fetchAllEmployees,
  updateEmployeeStatus,
} from "../service/EmployeeServices";
import { fetchAllLanguages } from "../service/LanguageServices";
import { postCreateProject, recordHistory } from "../service/Project";
import { fetchAllTechnology } from "../service/TechnologyServices";

const { Option } = Select;
const { TextArea } = Input;

const NewProject = () => {
  const [technologies, setTechnologies] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [startDate, setStartDate] = useState(null); // State to store selected start date
  const [endDate, setEndDate] = useState(null); // State to store selected end date
  const { t } = useTranslation();

  const onFinish = async (values) => {
    try {
      const projectData = {
        ...values,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        technologies: values.technologies || [],
        languages: values.languages || [],
        budget: values.budget.replace(/,/g, ""),
      };
      const newProjectKey = await postCreateProject(projectData, imageFile);

      // Ghi lịch sử thêm nhân viên mới
      const teamMembers = values.teamMembers || [];
      await Promise.all(
        teamMembers.map((memberId) => {
          updateEmployeeStatus(memberId, "involved");
          return recordHistory(newProjectKey, "added", memberId);
        })
      );

      const memberEmails = employees
        .filter((emp) => teamMembers.includes(emp.value))
        .map((emp) => emp.email);

      sendNotificationEmail(memberEmails, values.name, "added");

      message.success(t("Project added successfully"));
      navigate("/project-management");
    } catch (error) {
      console.error("Failed to create project:", error);
      message.error(t("Failed to add project"));
    }
  };

  const sendNotificationEmail = (memberEmails, projectName, action) => {
    memberEmails.forEach((memberEmail) => {
      const templateParams = {
        user_email: memberEmail,
        projectName: projectName,
        action: action,
      };

      emailjs
        .send(
          "service_ncefpgz",
          "template_kngz6s9",
          templateParams,
          "lb5ycQksDnRX-2uqk"
        )
        .then((response) => {
          console.log(
            "Email sent successfully:",
            response.status,
            response.text
          );
        })
        .catch((err) => {
          console.error("Failed to send email:", err);
        });
    });
  };

  const handleImageChange = ({ fileList }) => {
    setFileList(fileList);
    if (fileList.length > 0) {
      setImageFile(fileList[fileList.length - 1].originFileObj);
    } else {
      setImageFile(null);
    }
  };

  // Load technologies
  useEffect(() => {
    const loadTechnologies = async () => {
      try {
        const data = await fetchAllTechnology();
        const techOptions = data.map((tech) => ({
          label: tech.name,
          value: tech.id, // Use key as value for Option
        }));
        setTechnologies(techOptions);
      } catch (err) {
        setError(t("Failed to fetch technologies"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadTechnologies();
  }, []);

  // Load languages
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const data = await fetchAllLanguages();
        const languageOptions = data.map((lang) => ({
          label: lang.name,
          value: lang.key, // Use key as value for Option
        }));
        setLanguages(languageOptions);
      } catch (err) {
        setError("Failed to fetch languages");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLanguages();
  }, []);

  // Load employees
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchAllEmployees();
        const employeeOptions = data
          .filter((emp) => emp.role === "employee")
          .map((emp) => ({
            label: emp.name,
            value: emp.key, // Use key as value for Option
            email: emp.email,
          }));
        setEmployees(employeeOptions);
      } catch (err) {
        setError(t("Failed to fetch employees"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, []);

  const disabledStartDate = (startDate) => {
    if (!endDate) {
      return false;
    }
    return startDate && startDate.isAfter(endDate, "day");
  };

  const disabledEndDate = (endDate) => {
    if (!startDate) {
      return false;
    }
    return endDate && endDate.isBefore(startDate, "day");
  };

  const handleFieldBlur = async (fieldName) => {
    try {
      await form.validateFields([fieldName]);
    } catch (error) {
      console.error(`Validation failed for ${fieldName}:`, error);
    }
  };

  const handleBudgetBlur = () => {
    form
      .validateFields(["budget"])
      .then(() => {
        // Handle successful validation if needed
      })
      .catch((error) => {
        // Handle validation errors if needed
        console.error("Validation error:", error);
      });
  };

  const formatNumberWithCommas = (value) => {
    if (value === null || value === undefined || value === "") {
      return "";
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleBudgetChange = (e) => {
    const value = e.target.value;
    // Remove all commas for validation and storage
    const cleanedValue = value.replace(/,/g, "");
    form.setFieldsValue({ budget: formatNumberWithCommas(cleanedValue) });
  };

  const validateBudget = (rule, value) => {
    if (!value) {
      return Promise.reject(t("Please input the budget!"));
    }
    // Remove commas for validation
    const cleanedValue = value.replace(/,/g, "");
    const regex = /^\d+(\.\d{1,2})?\s?(VND|USD)?$/;
    if (!regex.test(cleanedValue)) {
      return Promise.reject(
        t("Invalid budget format. Use 'amount currency' format.")
      );
    }
    return Promise.resolve();
  };

  return (
    <div
      style={{
        padding: "24px 0",
        background: "#fff",
        maxWidth: "1000px",
        margin: "auto",
      }}
    >
      <h2>{t("NewProject")}</h2>
      <Form
        form={form}
        onFinish={onFinish}
        initialValues={{ status: "NOT STARTED" }}
      >
        <Form.Item
          label={t("ProjectName")}
          name="name"
          rules={[
            { required: true, message: t("Please input the project name!") },
          ]}
        >
          <Input
            placeholder={t("Enter project name")}
            onBlur={() => handleFieldBlur("name")}
          />
        </Form.Item>

        <Form.Item
          label={t("Description")}
          name="description"
          rules={[
            {
              required: true,
              message: t("Please input the project description!"),
            },
          ]}
        >
          <TextArea
            rows={4}
            placeholder={t("Enter project description")}
            onBlur={() => handleFieldBlur("description")}
          />
        </Form.Item>

        <Form.Item
          label={t("StartDate")}
          name="startDate"
          rules={[
            { required: true, message: t("Please select the start date!") },
          ]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            placeholder={t("Select start date")}
            onChange={(date) => setStartDate(date)}
            disabledDate={disabledStartDate}
            onBlur={() => handleFieldBlur("startDate")}
          />
        </Form.Item>

        <Form.Item
          label={t("EndDate")}
          name="endDate"
          rules={[
            { required: true, message: t("Please select the end date!") },
          ]}
        >
          <DatePicker
            format="DD/MM/YYYY"
            placeholder={t("Select end date")}
            onChange={(date) => setEndDate(date)}
            disabledDate={disabledEndDate}
            onBlur={() => handleFieldBlur("endDate")}
          />
        </Form.Item>

        <Form.Item
          label={t("clientName")}
          name="clientName"
          rules={[
            { required: true, message: t("Please input the client name!") },
          ]}
        >
          <Input
            placeholder={t("Enter client name")}
            onBlur={() => handleFieldBlur("clientName")}
          />
        </Form.Item>

        <Form.Item
          label={t("clientEmail")}
          name="clientEmail"
          rules={[
            { required: true, message: t("Please input the client email!") },
            { type: "email", message: t("Please enter a valid email!") },
          ]}
        >
          <Input placeholder="example@gmail.com" />
        </Form.Item>

        <Form.Item
          label={t("phoneNumber")}
          name="phoneNumber"
          rules={[
            { required: true, message: t("Please input the phone number!") },
            {
              pattern: /^[0-9]{10}$/,
              message: t("Please enter a valid 10-digit phone number!"),
            },
          ]}
        >
          <Input
            placeholder="0123456789"
            onBlur={() => handleFieldBlur("phoneNumber")}
          />
        </Form.Item>

        <Form.Item
          label={t("ProjectManager")}
          name="projectManager"
          rules={[
            { required: true, message: t("Please input the project manager!") },
          ]}
        >
          <Input
            placeholder={t("Enter project manager")}
            onBlur={() => handleFieldBlur("projectManager")}
          />
        </Form.Item>

        <Form.Item
          label={t("TeamMember")}
          name="teamMembers"
          rules={[
            { required: true, message: t("Please select the team members!") },
          ]}
        >
          <Select
            mode="multiple"
            placeholder={t("Select team members")}
            onBlur={() => handleFieldBlur("teamMembers")}
          >
            {employees.map((emp) => (
              <Option key={emp.value} value={emp.value}>
                {emp.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t("Budget")}
          name="budget"
          rules={[{ required: true, validator: validateBudget }]}
        >
          <Input
            placeholder={t("Enter budget (e.g., 1,000,000 VND or 500 USD)")}
            onChange={handleBudgetChange}
            onBlur={handleBudgetBlur}
            maxLength={50} // Optional: to limit input length
          />
        </Form.Item>

        <Form.Item
          label={t("Status")}
          name="status"
          rules={[
            { required: true, message: t("Please select the project status!") },
          ]}
          style={{ display: "none" }} // Ẩn trường
        >
          <Select placeholder={t("Select project status")}>
            <Option value="NOT STARTED">{t("NotStarted")}</Option>
            <Option value="COMPLETED">{t("Completed")}</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label={t("Priority")}
          name="priority"
          rules={[
            {
              required: true,
              message: t("Please select the project priority!"),
            },
          ]}
        >
          <Select
            onBlur={() => handleFieldBlur("priority")}
            placeholder={t("Select the project priority")}
          >
            <Option value="HIGH">High</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="LOW">Low</Option>
          </Select>
        </Form.Item>

        {/* Select technologies */}
        <Form.Item label={t("TechnologiesUsed")} name="technologies">
          <Select
            mode="multiple"
            placeholder={t("Select technologies")}
            onBlur={() => handleFieldBlur("technologies")}
          >
            {technologies.map((tech) => (
              <Option key={tech.value} value={tech.value}>
                {tech.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Select programming languages */}
        <Form.Item label={t("ProgrammingLanguageUsed")} name="languages">
          <Select
            mode="multiple"
            placeholder={t("Select languages")}
            onBlur={() => handleFieldBlur("languages")}
          >
            {languages.map((lang) => (
              <Option key={lang.value} value={lang.value}>
                {lang.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label={t("Attachments")} name="attachments">
          <Upload
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleImageChange}
            onBlur={() => handleFieldBlur("attachments")}
          >
            <Button icon={<UploadOutlined />}>{t("Click to Upload")}</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button className="btn" type="primary" htmlType="submit">
            {t("Register")}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewProject;
