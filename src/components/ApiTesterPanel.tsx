import React, { useState } from "react";
import { Input, Button, Select, Space, message } from "antd";

const { TextArea } = Input;
const { Option } = Select;

const ApiTesterPanel: React.FC = () => {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [params, setParams] = useState("");
  const [token, setToken] = useState("");

  const handleTest = () => {
    message.info(`Testing ${method} ${url} with token ${token}`);
    // You can hook up actual fetch/axios logic here later
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Input
        placeholder="API URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Select
        value={method}
        onChange={(val) => setMethod(val)}
        style={{ width: 120 }}>
        <Option value="GET">GET</Option>
        <Option value="POST">POST</Option>
        <Option value="PUT">PUT</Option>
        <Option value="DELETE">DELETE</Option>
      </Select>
      <TextArea
        rows={4}
        placeholder="Params (JSON)"
        value={params}
        onChange={(e) => setParams(e.target.value)}
      />
      <Input
        placeholder="Auth Token (optional)"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <Button type="primary" onClick={handleTest}>
        Send Request
      </Button>
    </Space>
  );
};

export default ApiTesterPanel;
