import { DeleteOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Form, Input, Modal, Select, Space, Table, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  checkEmailExists,
  deleteEmployeeById,
  fetchAllEmployees,
  postCreateEmployee,
  fetchAllPositions,
  fetchAllSkills,
} from "../service/EmployeeServices";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const { Option } = Select;
const { Column } = Table;

const AddEmployee = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm(); // Using Ant Design's Form
  const [employees, setEmployees] = useState([]);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [positions, setPositions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  const departmentOptions = [
    { value: "accounting", label: t("departmentAccounting") },
    { value: "audit", label: t("departmentAudit") },
    { value: "sales", label: t("departmentSales") },
    { value: "administration", label: t("departmentAdministration") },
    { value: "human_resource", label: t("departmentHumanResources") },
    { value: "customer_service", label: t("departmentCustomerService") },
  ];

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchAllEmployees();
        const filteredData = data.filter(
          (employee) => employee.role === "employee"
        ); // Filter by role "employee"
        setEmployees(filteredData);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    loadEmployees();

    const fetchPositions = async () => {
      try {
        const positionsData = await fetchAllPositions();
        setPositions(positionsData.map((pos) => ({ value: pos.key, label: pos.label })));
      } catch (error) {
        console.error("Failed to fetch positions:", error);
      }
    };

    const fetchSkills = async () => {
      try {
        const skillsData = await fetchAllSkills();
        setSkills(skillsData.map((skill) => ({ value: skill.key, label: skill.label })));
      } catch (error) {
        console.error("Failed to fetch skills:", error);
      }
    };

    fetchPositions();
    fetchSkills();
  }, []);

  const uploadImage = (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage();
      const storageRef = ref(storage, `employee/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleAddEmployee = async (values) => {
    const {
      name,
      email,
      password,
      dateOfBirth,
      address,
      phoneNumber,
      skills,
      status,
      department,
      position,
    } = values;

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        form.setFields([
          {
            name: "email",
            errors: [t("emailAlreadyExists")],
          },
        ]);
        return; // Stop processing
      }

      setUploading(true);


      await postCreateEmployee(
        name,
        email,
        password,
        dateOfBirth,
        address,
        phoneNumber,
        skills,
        status,
        department,
        position,
        "employee",
        imageFiles[0]
      );

      localStorage.setItem("employeeAdded", "true");
      navigate("/employee-management");
      form.resetFields();
      setImageFiles([]);
      setImagePreviews([]);
      loadEmployees();
      toast.success(t("employeeAddedSuccessfully"));
    } catch (error) {
      toast.error(t("failedToAddEmployee"));
    } finally {
      setUploading(false);
    }
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    form.setFieldsValue({ email });

    try {
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        form.setFields([
          {
            name: "email",
            errors: [t("emailAlreadyExists")],
          },
        ]);
      } else {
        form.setFields([
          {
            name: "email",
            errors: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to check email existence:", error);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setViewModalVisible(true);
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await deleteEmployeeById(id);
      toast.success(t("employeeDeletedSuccessfully"));
      loadEmployees(); // Reload the employees list
    } catch (error) {
      toast.error(t("failedToDeleteEmployee"));
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 10) {
      form.setFieldsValue({ phoneNumber: numericValue });
    }
  };

  const handleImageChange = (info) => {
    if (info.fileList) {
      // Save files to state
      setImageFiles(info.fileList.map((file) => file.originFileObj));

      // Generate preview URLs
      const previewUrls = info.fileList.map((file) => {
        if (file.originFileObj) {
          return URL.createObjectURL(file.originFileObj);
        }
        return "";
      });
      setImagePreviews(previewUrls);
    }
    return false; // Prevent automatic upload
  };

  const handleFieldBlur = async (fieldName) => {
    try {
      await form.validateFields([fieldName]);
    } catch (error) {
      // Do nothing, Ant Design will automatically show error message
    }
  };

  return (
    <div className="add-employee">
      <h2>{t("addNewEmployee")}</h2>
      <Form
        form={form}
        onFinish={handleAddEmployee}
        layout="vertical"
        initialValues={{ status: "active" }}
      >
        <Form.Item
          label={t("name")}
          name="name"
          rules={[{ required: true, message: t("pleaseEnterName") }]}
        >
          <Input type="text" onBlur={() => handleFieldBlur("name")} />
        </Form.Item>
        <Form.Item
          label={t("email")}
          name="email"
          rules={[
            { required: true, message: t("pleaseEnterEmail") },
            { type: "email", message: t("invalidEmail") },
          ]}
        >
          <Input
            type="email"
            onBlur={() => handleFieldBlur("email")}
            onChange={handleEmailChange}
          />
        </Form.Item>
        <Form.Item
          label={t("password")}
          name="password"
          rules={[
            { required: true, message: t("pleaseEnterPassword") },
            { min: 6, message: t("passwordMinLength") },
          ]}
        >
          <Input type="password" onBlur={() => handleFieldBlur("password")} />
        </Form.Item>
        <Form.Item
          label={t("dateOfBirth")}
          name="dateOfBirth"
          rules={[{ required: true, message: t("pleaseEnterDateOfBirth") }]}
        >
          <Input type="date" onBlur={() => handleFieldBlur("dateOfBirth")} />
        </Form.Item>
        <Form.Item
          label={t("address")}
          name="address"
          rules={[{ required: true, message: t("pleaseEnterAddress") }]}
        >
          <Input type="text" onBlur={() => handleFieldBlur("address")} />
        </Form.Item>
        <Form.Item
          label={t("phoneNumber")}
          name="phoneNumber"
          rules={[
            { required: true, message: t("pleaseEnterPhoneNumber") },
            { pattern: /^[0-9]{10}$/, message: t("invalidPhoneNumber") },
          ]}
        >
          <Input
            type="text"
            maxLength={10}
            onBlur={() => handleFieldBlur("phoneNumber")}
            onChange={handlePhoneNumberChange}
          />
        </Form.Item>
        <Form.Item
          label={t("skills")}
          name="skills"
          rules={[{ required: true, message: t("pleaseSelectSkills") }]}
        >
          <Select mode="multiple" options={skills} onBlur={() => handleFieldBlur("skills")} />
        </Form.Item>
        <Form.Item
          label={t("status")}
          name="status"
          rules={[{ required: true, message: t("pleaseSelectStatus") }]}
        >
          <Select onBlur={() => handleFieldBlur("status")}>
            <Option value="active">{t("Active")}</Option>
            <Option value="inactive">{t("Inactive")}</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label={t("department")}
          name="department"
          rules={[{ required: true, message: t("pleaseSelectDepartment") }]}
        >
          <Select options={departmentOptions} onBlur={() => handleFieldBlur("department")} />
        </Form.Item>
        <Form.Item
          label={t("position")}
          name="position"
          rules={[{ required: true, message: t("pleaseSelectPosition") }]}
        >
          <Select options={positions} onBlur={() => handleFieldBlur("position")} />
        </Form.Item>
        <Form.Item label={t("images")}>
          <Upload
            accept=".jpg,.jpeg,.png"
            beforeUpload={() => false} // Prevent automatic upload
            multiple
            listType="picture"
            onChange={handleImageChange}
          >
            <Button>
              <PlusOutlined />
              {t("uploadImages")}
            </Button>
          </Upload>
          <div className="image-previews">
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`preview-${index}`}
                style={{ width: "100px", height: "100px", margin: "5px" }}
              />
            ))}
          </div>
        </Form.Item>
        <Form.Item>
          <Button className="btn" type="primary" htmlType="submit" loading={uploading}>
            {t("submit")}
          </Button>
        </Form.Item>
      </Form>
      <Table dataSource={employees} rowKey="id">
        <Column title={t("name")} dataIndex="name" key="name" />
        <Column title={t("email")} dataIndex="email" key="email" />
        <Column title={t("phoneNumber")} dataIndex="phoneNumber" key="phoneNumber" />
      </Table>

      {selectedEmployee && (
        <Modal
          title={t("employeeDetails")}
          visible={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={null}
        >
          <p>{t("name")}: {selectedEmployee.name}</p>
          <p>{t("email")}: {selectedEmployee.email}</p>
          <p>{t("phoneNumber")}: {selectedEmployee.phoneNumber}</p>
          {/* Add other details as necessary */}
          <div>
            {selectedEmployee.images && selectedEmployee.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`employee-${index}`}
                style={{ width: 100, height: 100, margin: 5 }}
              />
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddEmployee;
