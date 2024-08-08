import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchTechnologyById } from "../service/TechnologyServices";
import { Button, Spin, message } from "antd";
import "../Components/TechnologyDetails.jsx"; // Assuming you have a similar stylesheet
import { useTranslation } from "react-i18next";

const TechnologyDetails = () => {
  const { id } = useParams();
  const [technology, setTechnology] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loadTechnology = async () => {
      try {
        const data = await fetchTechnologyById(id);
        setTechnology(data);
        setLoading(false);
      } catch (error) {
        message.error(t("Failed to fetch technology details."));
        setLoading(false);
      }
    };

    loadTechnology();
  }, [id]);

  if (loading) return <Spin size="large" />;

  return (
    <div className="technology-details">
      <h2>Technology Details</h2>
      {technology ? (
        <div>
          <p>
            <strong>Name:</strong> {technology.name}
          </p>
          <p>
            <strong>Description:</strong> {technology.description}
          </p>
          <p>
            <strong>Status:</strong> {technology.status}
          </p>
          {technology.imageURL && (
            <p>
              <strong>Image:</strong> <br />
              <img
                src={technology.imageURL}
                alt={technology.name}
                style={{ width: 150, height: 150 }}
              />
            </p>
          )}
          <Button
            type="primary"
            onClick={() => navigate("/technology-management")}
          >
            Back to Technology Management
          </Button>
        </div>
      ) : (
        <p>Technology not found.</p>
      )}
    </div>
  );
};

export default TechnologyDetails;
