import { useState } from "react";
import api from "../api.js";

export default function TransactionsBySchool() {
  const [schoolId, setSchoolId] = useState("");
  
  interface Transaction {
  collect_id: string;
  custom_order_id: string;
  status: string;
  school_id?: string;
  gateway?: string;
  order_amount?: number;
  transaction_amount?: number;
  gateway_status?: { error?: string };
}

const [transactions, setTransactions] = useState<Transaction[]>([]);


  const fetch = async () => {
    const res = await api.get("/transactions", { params: { school_id: schoolId } });
    setTransactions(res.data);
  };

  

  return (
    <div>
      <h1 className="text-xl mb-4">Transactions by School</h1>
      <input
        placeholder="School ID"
        className="border p-1 mr-2"
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
      />
      <button onClick={fetch} className="bg-blue-500 text-white px-2 py-1 rounded">
        Fetch
      </button>
      <ul className="mt-4">
        {transactions.map((t) => (
          <li key={t.collect_id}>{t.custom_order_id} - {t.status}</li>
        ))}
      </ul>
    </div>
  );
}
