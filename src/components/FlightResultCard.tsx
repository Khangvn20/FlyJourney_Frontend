import React from "react";
import { Card, Descriptions } from "antd";

const FlightResultCard: React.FC = () => {
  return (
    <Card title="VN123 – Vietnam Airlines" style={{ marginBottom: "1rem" }}>
      <Descriptions column={2}>
        <Descriptions.Item label="From">Hanoi (HAN)</Descriptions.Item>
        <Descriptions.Item label="To">Ho Chi Minh City (SGN)</Descriptions.Item>
        <Descriptions.Item label="Departure">08:00 AM</Descriptions.Item>
        <Descriptions.Item label="Arrival">10:30 AM</Descriptions.Item>
        <Descriptions.Item label="Price">$120</Descriptions.Item>
        <Descriptions.Item label="Class">Economy</Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default FlightResultCard;
