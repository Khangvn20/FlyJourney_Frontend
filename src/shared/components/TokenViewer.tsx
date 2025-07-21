import React from "react";
import { Typography } from "antd";

type Props = {
  token: string | null;
};

const TokenViewer: React.FC<Props> = ({ token }) => {
  return (
    <div>
      <Typography.Text strong>Access Token:</Typography.Text>
      <pre style={{ background: "#f5f5f5", padding: "0.5rem" }}>
        {token || "No token available"}
      </pre>
    </div>
  );
};

export default TokenViewer;
