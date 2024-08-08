import React from "react";
import { useTranslation } from "react-i18next";
import { Select } from "antd";

const { Option } = Select;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const handleChange = (value) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select defaultValue={i18n.language} onChange={handleChange}>
      <Option value="vi">{t("Vietnam")}</Option>
      <Option value="en">{t("English")}</Option>
    </Select>
  );
};

export default LanguageSwitcher;