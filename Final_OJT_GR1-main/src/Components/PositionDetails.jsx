import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPositionById } from "../service/PositionServices";
import { Button, Spin, message } from "antd";
import "../Components/PositionDetails.jsx";

const PositionDetails = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPosition = async () => {
      try {
        const data = await fetchPositionById(id);
        setPosition(data);
        setLoading(false);
      } catch (error) {
        message.error("Failed to fetch position details.");
        setLoading(false);
      }
    };

    loadPosition();
  }, [id]);

  if (loading) return <Spin size="large" />;

  return (
    <div className="position-details">
      <h2>Position Details</h2>
      {position ? (
        <div>
          <p>
            <strong>Name:</strong> {position.name}
          </p>
          <p>
            <strong>Description:</strong> {position.description}
          </p>
          <p>
            <strong>Department:</strong> {position.department}
          </p>
          <p>
            <strong>Status:</strong> {position.status}
          </p>
          <Button
            type="primary"
            onClick={() => navigate("/position-management")}
          >
            Back to Position Management
          </Button>
        </div>
      ) : (
        <p>Position not found.</p>
      )}
    </div>
  );
};

export default PositionDetails;