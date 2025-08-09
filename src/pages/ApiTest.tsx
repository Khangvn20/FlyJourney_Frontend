import React, { Suspense, lazy } from "react";
import { ENV } from "../shared/config/env";

const LazyApiTestPanel = lazy(() => import("../devtools/ApiTestPanel"));

const ApiTest: React.FC = () => {
  if (!ENV.DEV) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>API Test tools are only available in development mode.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        API Integration Test
      </h1>
      <Suspense fallback={<div>Loading dev tools...</div>}>
        <LazyApiTestPanel />
      </Suspense>
    </div>
  );
};

export default ApiTest;
