import { useState } from "react";
import api from "../api";

export default function CreatePayment() {
  const [data, setData] = useState({ school_id: "", order_amount: "" });
  const [res, setRes] = useState(null);

 const create = async () => {
  console.log("hwllo");
  const response = await api.post("/payment/create-payment", {
  school_id: "65b0e6293e9f76a9694d84b4",
  amount: String(data.order_amount),
  callback_url: "https://google.com",
});
  setRes(response.data);
  
  // Optional: redirect to payment page automatically
  window.location.href = "/";

};


  return (
    <div>
      <h1 className="text-xl mb-4">Create Payment</h1>
      <input
        placeholder="School ID"
        className="border p-1 mr-2"
        value={data.school_id}
        onChange={(e) => setData({ ...data, school_id: e.target.value })}
      />
      <input
        placeholder="Order Amount"
        className="border p-1 mr-2"
        value={data.order_amount}
        onChange={(e) => setData({ ...data, order_amount: e.target.value })}
      />
      <button onClick={create} className="bg-green-500 text-white px-2 py-1 rounded">
        Create
      </button>
      {res && <pre className="mt-4 bg-gray-100 p-2">{JSON.stringify(res, null, 2)}</pre>}
    </div>
  );
}
