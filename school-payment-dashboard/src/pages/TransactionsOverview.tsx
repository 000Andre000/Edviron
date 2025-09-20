  import { useEffect, useState } from "react";
  import api from "../api";

  export default function TransactionsOverview() {

    interface Transaction {
    collect_id: string;
    school_id: string;
    gateway: string;
    order_amount: number;
    transaction_amount: number;
    status: string;
    custom_order_id: string;
  }

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [status, setStatus] = useState("");
    const [schoolId, setSchoolId] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
      const fetchTx = async () => {
        const res = await api.get("/transactions", {
          params: { status, school_id: schoolId, q: search },
        });
        setTransactions(res.data);
      };
      fetchTx();
    }, [status, schoolId, search]);

    return (
      <div className="">
        <h1 className="text-xl mb-4">Transactions Overview</h1>
        <div className="flex gap-2 mb-4">
          <input
            placeholder="Search"
            className="border p-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-1">
            <option value="">All Status</option>
            <option>Success</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
          <input
            placeholder="School ID"
            className="border p-1"
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
          />
        </div>
        <table className="min-w-full border-collapse shadow-md rounded-lg overflow-hidden">
          <thead>
      <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 text-left text-sm uppercase font-medium">
        <th className="px-4 py-3 border">#</th>
        <th className="px-4 py-3 border">Collect ID</th>
        <th className="px-4 py-3 border">School ID</th>
        <th className="px-4 py-3 border">Gateway</th>
        <th className="px-4 py-3 border">Order Amount</th>
        <th className="px-4 py-3 border">Transaction Amount</th>
        <th className="px-4 py-3 border">Status</th>
        <th className="px-4 py-3 border">Custom Order ID</th>
      </tr>
    </thead>
        {/* <tbody>
    {transactions.map((t) => (
      <tr
        key={t.collect_id}
        className="hover:scale-y-105 transform transition-transform duration-200 bg-gray-300 "
      >
        <td className="p-0.5 border">{t.collect_id}</td>
        <td className="p-0.5 border">{t.school_id}</td>
        <td className="p-0.5 border">{t.gateway}</td>
        <td className="p-0.5 border">{t.order_amount}</td>
        <td className="p-0.5 border">{t.transaction_amount}</td>
        <td className="p-0.5 border">{t.status}</td>
        <td className="p-0.5 border">{t.custom_order_id}</td>
      </tr>
    ))}
  </tbody> */}
  <tbody>
    {transactions.map((t, idx) => (
      <tr
        key={t.collect_id}
        className="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transform hover:scale-105 transition-transform duration-200 cursor-pointer"
      >
        <td className="px-4 py-2 border text-sm">{idx + 1}</td>
        <td className="px-4 py-2 border text-sm">{t.collect_id}</td>
        <td className="px-4 py-2 border text-sm">{t.school_id}</td>
        <td className="px-4 py-2 border text-sm">{t.gateway}</td>
        <td className="px-4 py-2 border text-sm">{t.order_amount}</td>
        <td className="px-4 py-2 border text-sm">{t.transaction_amount}</td>
        <td className="px-4 py-2 border text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              t.status === "Success"
                ? "bg-green-100 text-green-800"
                : t.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {t.status}
          </span>
        </td>
        <td className="px-4 py-2 border text-sm">{t.custom_order_id || "N/A"}</td>
      </tr>
    ))}
  </tbody>


        </table>
      </div>
    );
  }
