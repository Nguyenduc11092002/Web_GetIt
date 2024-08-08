import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchLanguageById } from "../service/LanguageServices";
import { Button, Spin, message } from "antd";
import "../Components/LanguageDetails.jsx";
import { useTranslation } from "react-i18next";

const LanguageDetails = () => {
  const { id } = useParams();
  const [language, setLanguage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const data = await fetchLanguageById(id);
        setLanguage(data);
        setLoading(false);
      } catch (error) {
        message.error(t("Failed to fetch language details."));
        setLoading(false);
      }
    };

    loadLanguage();
  }, [id]);

  const formatDescription = (description) => {
    const translatedDescription = t(description);
    return translatedDescription ? translatedDescription.charAt(0).toUpperCase() + translatedDescription.slice(1) : null;
  };

  const formatStatus = (status) => {
    const translatedStatus = t(status);
    return translatedStatus ? translatedStatus.charAt(0).toUpperCase() + translatedStatus.slice(1) : "";
  };

  if (loading) return <Spin size="large" />;

  return (
    <div className="language-details">
      <h2>{t("DetailLanguage")}</h2>
      {language ? (
        <div>
          <p>
            <strong>{t("name")}:</strong> {language.name}
          </p>
          <p>
            <strong>{t("Description")}:</strong> {formatDescription(language.description)}
          </p>
          <p>
            <strong>{t("Status")}:</strong> {formatStatus(language.status)}
          </p>
          <Button
            type="primary"
            onClick={() => navigate("/programing-language")}
          >
            {t("BacktoLanguageManagement")}
          </Button>
        </div>
      ) : (
        <p>{t("Language not found.")}</p>
      )}
    </div>
  );
};

export default LanguageDetails;