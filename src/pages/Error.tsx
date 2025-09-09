import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type LastError = {
  message?: string | null;
  stack?: string | null;
  componentStack?: string | null;
  url?: string | null;
  pathname?: string | null;
  userAgent?: string | null;
  timestamp?: string;
};

const detectHints = (msg: string | null | undefined) => {
  const hints: string[] = [];
  if (!msg) return hints;
  const m = msg.toLowerCase();
  if (m.includes("has already been declared") && m.includes("react")) {
    hints.push(
      "Trùng import React trong cùng file. Kiểm tra đầu file để xóa import lặp",
    );
  }
  if (m.includes("unexpected keyword 'const'")) {
    hints.push(
      "Có thể bị lặp dòng code (ví dụ: khai báo const trùng). Soát lại diff gần đây",
    );
  }
  if (m.includes("cannot read properties") || m.includes("undefined")) {
    hints.push(
      "Đang truy cập thuộc tính của biến undefined. Kiểm tra data/props có null safety",
    );
  }
  return hints;
};

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const lastError: LastError | null = React.useMemo(() => {
    try {
      const raw = sessionStorage.getItem("app_last_error");
      return raw ? (JSON.parse(raw) as LastError) : null;
    } catch {
      return null;
    }
  }, [location.key]);

  const errorHints = detectHints(lastError?.message);

  const details = React.useMemo(() => {
    const env = import.meta.env?.MODE ?? process.env.NODE_ENV ?? "unknown";
    return {
      message: lastError?.message ?? "(không có message)",
      when: lastError?.timestamp ?? new Date().toISOString(),
      url: lastError?.url ?? window.location.href,
      route: lastError?.pathname ?? window.location.pathname,
      userAgent: lastError?.userAgent ?? navigator.userAgent,
      env,
      stack: lastError?.stack ?? undefined,
      componentStack: lastError?.componentStack ?? undefined,
    };
  }, [lastError]);

  const copyDetails = async () => {
    const text = JSON.stringify(details, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert("Đã copy thông tin lỗi vào clipboard");
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      alert("Đã copy thông tin lỗi vào clipboard");
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const handleRetry = () => {
    if (document.referrer) {
      navigate(-1);
    } else {
      window.location.reload();
    }
  };

  const clearLastError = () => {
    sessionStorage.removeItem("app_last_error");
    navigate(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Đã xảy ra lỗi khi tải trang
        </h1>
        <p className="text-gray-600 mb-4">
          Trang không thể hiển thị do lỗi runtime. Dưới đây là thông tin chi
          tiết để bạn debug nhanh.
        </p>

        {/* Summary */}
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <div className="text-sm text-red-800">
            <span className="font-semibold">Lý do: </span>
            {details.message}
          </div>
          {errorHints.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-sm text-red-700">
              {errorHints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
          <div className="p-3 bg-gray-50 rounded border">
            <div className="text-gray-500">Thời điểm</div>
            <div className="font-mono">{details.when}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <div className="text-gray-500">Route</div>
            <div className="font-mono break-all">{details.route}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border md:col-span-2">
            <div className="text-gray-500">URL</div>
            <div className="font-mono break-all">{details.url}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border md:col-span-2">
            <div className="text-gray-500">User Agent</div>
            <div className="font-mono break-all">{details.userAgent}</div>
          </div>
          <div className="p-3 bg-gray-50 rounded border">
            <div className="text-gray-500">Environment</div>
            <div className="font-mono">{details.env}</div>
          </div>
        </div>

        {/* Stack traces */}
        {details.stack && (
          <details className="mb-3">
            <summary className="cursor-pointer font-medium">Stack trace</summary>
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded overflow-auto text-xs">
{details.stack}
            </pre>
          </details>
        )}
        {details.componentStack && (
          <details className="mb-4">
            <summary className="cursor-pointer font-medium">
              Component stack
            </summary>
            <pre className="mt-2 p-3 bg-gray-900 text-gray-100 rounded overflow-auto text-xs whitespace-pre-wrap">
{details.componentStack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleRetry}
          >
            Thử lại
          </button>
          <button
            className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
            onClick={handleGoHome}
          >
            Trang chủ
          </button>
          <button
            className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
            onClick={copyDetails}
          >
            Copy chi tiết lỗi
          </button>
          <button
            className="px-4 py-2 bg-gray-100 border rounded hover:bg-gray-200"
            onClick={clearLastError}
          >
            Xóa cache lỗi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
