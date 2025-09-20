// import { useState } from "react";
// import api from "../api";

// export default function TransactionStatus() {
//   const [orderId, setOrderId] = useState("");
//   const [result, setResult] = useState(null);

//   const checkStatus = async () => {
//     const res = await api.get(`/check-status/${orderId}`);
//     setResult(res.data);
//   };

//   return (
//     <div>
//       <h1 className="text-xl mb-4">Transaction Status</h1>
//       <input
//         placeholder="Custom Order ID"
//         className="border p-1 mr-2"
//         value={orderId}
//         onChange={(e) => setOrderId(e.target.value)}
//       />
//       <button onClick={checkStatus} className="bg-blue-500 text-white px-2 py-1 rounded">
//         Check
//       </button>
//       {result && <pre className="mt-4 bg-gray-100 p-2">{JSON.stringify(result, null, 2)}</pre>}
//     </div>
//   );
// }

import { useState } from "react";
import api from "../api";

export default function TransactionStatus() {
  type GatewayStatus = {
  status: string;
  amount?: number;
  collect_request_id?: string;
  details?: any;
  last_checked?: string;
  error?: string;
};

type OrderDetails = {
  id: string;
  school_id: string;
  amount: number;
  gateway_name: string;
};

type LocalStatus = {
  status: string;
  transaction_amount?: number;
  payment_url?: string;
};

type TransactionStatusResponse = {
  gateway_status?: GatewayStatus;
  order_details?: OrderDetails;
  local_status?: LocalStatus;
  last_checked?: string;
};

  const [searchData, setSearchData] = useState({
    orderId: "",
    collectRequestId: "",
    schoolId: ""
  });
  const [result, setResult] = useState<TransactionStatusResponse | null>(null);
  const [error, setError] = useState<string | object | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("orderId"); // "orderId" or "collectRequest"

  const checkStatusByOrderId = async () => {

    
    if (!searchData.orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Checking status for order ID:", searchData.orderId);
      console.log("Making request to:", `/payment/check-status/${searchData.orderId}`);
      
      const res = await api.get(`/payment/check-status/${searchData.orderId}`);
      console.log("Status response:", res.data);
      setResult(res.data);
    } catch (err:any) {
      console.error("Status check error:", err);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      console.error("Error config:", err.config);
      
      // Provide more detailed error information
      const errorInfo = {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url,
        method: err.config?.method
      };
      
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const checkStatusByCollectRequest = async () => {
    if (!searchData.collectRequestId.trim() || !searchData.schoolId.trim()) {
      setError("Please enter both Collect Request ID and School ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Checking status for collect request:", {
        collectRequestId: searchData.collectRequestId,
        schoolId: searchData.schoolId
      });
      
      const res = await api.get('/payment/status', {
        params: {
          collect_request_id: searchData.collectRequestId,
          school_id: searchData.schoolId
        }
      });
      
      console.log("Status response:", res.data);
      setResult(res.data);
    } catch (err:any) {
      console.error("Status check error:", err);
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    if (searchType === "orderId") {
      checkStatusByOrderId();
    } else {
      checkStatusByCollectRequest();
    }
  };

  const resetForm = () => {
    setSearchData({ orderId: "", collectRequestId: "", schoolId: "" });
    setResult(null);
    setError(null);
  };
  const lastChecked = result?.last_checked || result?.gateway_status?.last_checked;

  const getStatusBadge = (status: string) => {
    if (!status) return null;
    
    const statusColors: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  INITIATED: "bg-yellow-100 text-yellow-800",
  CREATING: "bg-blue-100 text-blue-800",
  PENDING: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-gray-200 text-gray-900",
  EXPIRED: "bg-gray-400 text-gray-100",
};

   const statusIcons: Record<string, string> = {
  SUCCESS: "✅",
  FAILED: "❌",
  INITIATED: "🔄",
  CREATING: "⏳",
  PENDING: "⏳",
  CANCELLED: "🚫",
  EXPIRED: "⏰",
};

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
      }`}>
        <span className="mr-1">{statusIcons[status] || '❓'}</span>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              📈 Transaction Status
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Check the status of your payment transactions
            </p>
          </div>
          <button
            onClick={resetForm}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            Reset Form
          </button>
        </div>
      </div>

      {/* Search Type Toggle */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Search Method
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="orderId"
                checked={searchType === "orderId"}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                By Internal Order ID
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="searchType"
                value="collectRequest"
                checked={searchType === "collectRequest"}
                onChange={(e) => setSearchType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                By Collect Request ID
              </span>
            </label>
          </div>
        </div>

        {/* Search Form */}
        {searchType === "orderId" ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Internal Order ID
              </label>
              <div className="relative">
                <input
                  id="orderId"
                  type="text"
                  placeholder="Enter your internal order ID"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  value={searchData.orderId}
                  onChange={(e) => setSearchData({ ...searchData, orderId: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">#️⃣</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This is the order ID returned when you created the payment
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="collectRequestId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Collect Request ID
              </label>
              <div className="relative">
                <input
                  id="collectRequestId"
                  type="text"
                  placeholder="Enter collect request ID"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  value={searchData.collectRequestId}
                  onChange={(e) => setSearchData({ ...searchData, collectRequestId: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔗</span>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="schoolId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                School ID
              </label>
              <div className="relative">
                <input
                  id="schoolId"
                  type="text"
                  placeholder="Enter school ID"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                  value={searchData.schoolId}
                  onChange={(e) => setSearchData({ ...searchData, schoolId: e.target.value })}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🏫</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleCheck}
            disabled={loading || (searchType === "orderId" ? !searchData.orderId : (!searchData.collectRequestId || !searchData.schoolId))}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Checking Status...
              </>
            ) : (
              <>
                <span>🔍</span>
                Check Status
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-red-500 text-xl">❌</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Status Check Failed
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <pre className="whitespace-pre-wrap font-mono text-xs bg-red-100 dark:bg-red-900/40 p-3 rounded">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Gateway Status Display */}
          {result.gateway_status && !result.gateway_status.error && (
            <div className="border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-blue-500 text-xl">🌐</span>
                </div>
                <div className="ml-3 w-full">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
                    Live Gateway Status
                  </h3>
                  
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Payment Status:</span>
                        <div className="mt-1">
                          {getStatusBadge(result.gateway_status.status)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Amount:</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono">
                          ₹{result.gateway_status.amount || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Collect Request ID:</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-mono text-xs">
                          {result.gateway_status.collect_request_id}
                        </p>
                      </div>
                    </div>

                    {result.gateway_status.details && (
                      <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Payment Details:</span>
                        <pre className="text-xs text-blue-700 dark:text-blue-300 mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                          {JSON.stringify(result.gateway_status.details, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="pt-3 border-t border-blue-200 dark:border-blue-800 text-xs text-blue-600 dark:text-blue-400">
                     
{lastChecked && (
  <div>
    Last checked: {new Date(lastChecked).toLocaleString()}
  </div>
)}

                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Local Status Display */}
          <div className="border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-green-500 text-xl">💾</span>
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
                  Local Order Information
                </h3>
                
                <div className="bg-green-100 dark:bg-green-900/40 p-4 rounded-lg">
                  {result.order_details && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Internal Order ID:</span>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                          {result.order_details.id}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">School ID:</span>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                          {result.order_details.school_id}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Amount:</span>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                          ₹{result.order_details.amount}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">Gateway:</span>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          {result.order_details.gateway_name}
                        </p>
                      </div>
                    </div>
                  )}

                  {result.local_status && (
                    <div className="pt-3 border-t border-green-200 dark:border-green-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">Local Status:</span>
                          <div className="mt-1">
                            {getStatusBadge(result.local_status.status)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-green-800 dark:text-green-200">Transaction Amount:</span>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1 font-mono">
                            ₹{result.local_status.transaction_amount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result.local_status?.payment_url && (
                    <div className="pt-3 border-t border-green-200 dark:border-green-800">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">Payment URL:</span>
                      <div className="mt-1">
                        <a 
                          href={result.local_status.payment_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-200 rounded-full hover:bg-green-300 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
                        >
                          🔗 Open Payment Page
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Error Display */}
          {result.gateway_status?.error && (
            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-orange-500 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Gateway Status Check Failed
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                    Could not fetch live status from payment gateway. Showing local information only.
                  </p>
                  <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                    Error: {result.gateway_status.error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Response Details */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <details className="cursor-pointer">
              <summary className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                🔍 View Full Response Details
              </summary>
              <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}