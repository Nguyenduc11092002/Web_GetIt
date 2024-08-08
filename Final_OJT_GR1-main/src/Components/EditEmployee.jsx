import { PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Select, Upload } from "antd";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchEmployeeById,
  fetchAllPositions, // Ensure this function is imported
  putUpdateEmployee,
  fetchAllSkills,
} from "../service/EmployeeServices";

const { Option } = Select;

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [oldImageUrl, setOldImageUrl] = useState("");
  const [positions, setPositions] = useState([]); // State for positions
  const [skillsList, setSkillsList] = useState([]);

  // Các tùy chọn được chuyển ngữ
  const departmentOptions = [
    { value: "accounting", label: t("departmentAccounting") },
    { value: "audit", label: t("departmentAudit") },
    { value: "sales", label: t("departmentSales") },
    { value: "administration", label: t("departmentAdministration") },
    { value: "human_resources", label: t("departmentHumanResources") },
    { value: "customer_service", label: t("departmentCustomerService") },
  ];

  useEffect(() => {
    const loadEmployee = async () => {
      try {
        const employee = await fetchEmployeeById(id);
        if (employee) {
          form.setFieldsValue({
            name: employee.name || "",
            email: employee.email || "",
            department: employee.department || [],
            status: employee.status || "",
            dateOfBirth: employee.dateOfBirth
              ? moment(employee.dateOfBirth)
              : "",
            address: employee.address || "",
            phoneNumber: employee.phoneNumber || "",
            skills: employee.skills || [],
            position: employee.position || "", // Set position value
          });

          setOldImageUrl(employee.imageUrl || "");

          if (employee.imageUrl) {
            setFileList([
              {
                uid: "-1",
                name: "attachment",
                status: "done",
                url: employee.imageUrl,
              },
            ]);
          }
        } else {
          message.error(t("employeeNotFound"));
        }
      } catch (error) {
        message.error(t("failedToFetchEmployee"));
      }
    };

    const loadPositions = async () => {
      try {
        const positionsData = await fetchAllPositions();
        setPositions(
          positionsData.map((pos) => ({ key: pos.key, name: pos.label }))
        ); // Adjust based on your data structure
      } catch (error) {
        message.error(t("failed To Fetch Positions"));
      }
    };

    const loadSkills = async () => {
      try {
        const skillsData = await fetchAllSkills();
        setSkillsList(
          skillsData.map((skill) => ({ key: skill.key, name: skill.label }))
        );
      } catch (error) {
        message.error("Failed to fetch skills");
      }
    };

    loadEmployee();
    loadPositions();
    loadSkills();
  }, [id, form, t]);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      form.setFieldsValue({ phoneNumber: value });
    }
  };

  const handleUpdateEmployee = async (values) => {
    try {
      const formattedDateOfBirth = values.dateOfBirth
        ? moment.isMoment(values.dateOfBirth)
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : values.dateOfBirth
        : null;

      await putUpdateEmployee(
        id,
        values.name,
        values.email,
        formattedDateOfBirth,
        values.address,
        values.phoneNumber,
        values.skills || [],
        values.status,
        values.department,
        values.position, // Pass position value
        fileList.length > 0 ? fileList[0].originFileObj : null,
        oldImageUrl
      );

      message.success(t("employee Updated Successfully"));
      navigate("/employee-management");
    } catch (error) {
      message.error(t("failed To Update Employee"));
      console.error("Error details:", error);
    }
  };

  const handleImageChange = ({ fileList }) => {
    setFileList(fileList);
  };

  const beforeUpload = (file) => {
    handleImageChange({ fileList: [file] });
    return false;
  };

  return (
    <Form
      form={form}
      onFinish={handleUpdateEmployee}
      layout="vertical"
      initialValues={{
        department: [],
        skills: [],
        position: "", // Initial value for position
      }}
    >
      <h2>{t("editEmployee")}</h2>

      <Form.Item
        label={t("name")}
        name="name"
        rules={[{ required: true, message: t("nameRequired") }]}
      >
        <Input placeholder={t("name")} />
      </Form.Item>

      <Form.Item
        label={t("email")}
        name="email"
        rules={[{ type: 'email', message: t("invalidEmail") }, { required: true, message: t("email Required") }]}
      >
        <Input placeholder={t("email")} disabled />
      </Form.Item>

      <Form.Item
        label={t("department")}
        name="department"
        rules={[{ required: true, message: t("departmentRequired") }]}
      >
        <Select placeholder={t("department")}>
          {departmentOptions.map((dept) => (
            <Option key={dept.value} value={dept.value}>
              {dept.label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t("skills")}
        name="skills"
        rules={[{ required: true, message: t("skillsRequired") }]}
      >
        <Select placeholder={t("skills")} mode="multiple">
          {skillsList.map((skill) => (
            <Option key={skill.key} value={skill.key}>
              {skill.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label={t("status")}
        name="status"
        rules={[{ required: true, message: t("statusRequired") }]}
      >
        <Select placeholder={t("status")}>
          <Option value="active">{t("active")}</Option>
          <Option value="inactive">{t("inactive")}</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label={t("dateOfBirth")}
        name="dateOfBirth"
        rules={[{ required: true, message: t("dateOfBirthRequired") }]}
      >
        <Input type="date" />
      </Form.Item>

      <Form.Item
        label={t("address")}
        name="address"
        rules={[{ required: true, message: t("addressRequired") }]}
      >
        <Input placeholder={t("address")} />
      </Form.Item>

      <Form.Item
        label={t("phoneNumber")}
        name="phoneNumber"
        rules={[
          { required: true, message: t("phoneNumberRequired") },
          { pattern: /^\d{10}$/, message: t("phoneNumberInvalid") }
        ]}
      >
        <Input
          placeholder={t("phoneNumber")}
          maxLength={10}
          onChange={handlePhoneNumberChange}
        />
      </Form.Item>

      <Form.Item
        label={t("position")}
        name="position"
        rules={[{ required: true, message: t("positionRequired") }]} // Add validation for position
      >
        <Select placeholder={t("position")}>
          {positions.map((pos) => (
            <Option key={pos.key} value={pos.key}>
              {pos.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Upload
          accept=".jpg,.jpeg,.png"
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={handleImageChange}
          listType="picture"c
          showUploadList={false}
        >
          <Button className="btn" type="primary" icon={<PlusOutlined />}>{t("uploadImageButton")}</Button>
        </Upload>
        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <img src={fileList[0].url} alt={t("imagePreview")} width="30%" />
          </div>
        )}
      </Form.Item>

      <Form.Item>
        <Button className="btn" type="primary" htmlType="submit">
          {t("save")}
        </Button>
        <Button
          className="btn-length"
          style={{ marginLeft: 8 }}
          onClick={() => navigate("/employee-management")}
        >
          {t("backToEmployeeManagement")}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default EditEmployee;
