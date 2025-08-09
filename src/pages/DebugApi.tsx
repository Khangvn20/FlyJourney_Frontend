import React, { Suspense, lazy } from "react";
import { ENV } from "../shared/config/env";

const LazyApiTesterPanel = lazy(() => import("../devtools/ApiTesterPanel"));

const DebugApi: React.FC = () => {
  if (!ENV.DEV) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>Debug API tools are only available in development mode.</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Debug API</h2>
      <Suspense fallback={<div>Loading debug tools...</div>}>
        <LazyApiTesterPanel />
      </Suspense>
    </div>
  );
};

export default DebugApi;
