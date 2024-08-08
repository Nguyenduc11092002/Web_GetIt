import React, { useState, useEffect } from "react";
import { Input, Select, Button } from "antd";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import {
  putUpdateLanguage,
  fetchLanguageById,
} from "../service/LanguageServices";
import { useTranslation } from "react-i18next";

const { Option } = Select;

const EditLanguage = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        console.log(`Loading language with ID: ${id}`);
        const language = await fetchLanguageById(id);
        if (language) {
          console.log("Loaded language:", language);
          setName(language.name || "");
          setDescription(language.description || "");
          setStatus(language.status || "");
        } else {
          toast.error(t("Language not found."));
        }
      } catch (error) {
        toast.error(t("Failed to fetch language data."));
      }
    };

    loadLanguage();
  }, [id]);

  const handleUpdateLanguage = async () => {
    if (!name || !description || !status) {
      toast.error(t("Please fill in all fields."));
      return;
    }

    try {
      await putUpdateLanguage(id, name, description, status);
      toast.success(t("Language updated successfully!"));
      navigate("/programing-language");
    } catch (error) {
      toast.error(t("Failed to update language."));
      console.error("Error details:", error);
    }
  };

  return (
    <div>
      <h2>{t("EditLanguage")}</h2>

      <div className="form-group">
        <label>{t("name")}</label>
        <Input
          placeholder={t("name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>{t("Description")}</label>
        <Input.TextArea
          placeholder={t("Description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>{t("Status")}</label>
        <Select
          placeholder={t("Select Status")}
          value={status}
          onChange={(value) => setStatus(value)}
        >
          <Option value="active">{t("active")}</Option>
          <Option value="inactive">{t("inactive")}</Option>
        </Select>
      </div>
      <Button
        className="btn"
        type="primary"
        onClick={handleUpdateLanguage}
        disabled={!name || !description || !status}
      >
        {t("save")}
      </Button>
      <Button
        className="btn-length"
        style={{ marginLeft: 8 }}
        onClick={() => navigate("/programing-language")}
      >
        {t("BacktoLanguageManagement")}
      </Button>
    </div>
  );
};

export default EditLanguage;