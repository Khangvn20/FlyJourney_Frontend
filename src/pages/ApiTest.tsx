import React from "react";
import ApiTestPanel from "../components/ApiTestPanel";

const ApiTest: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        API Integration Test
      </h1>
      <ApiTestPanel />
    </div>
  );
};

export default ApiTest;
