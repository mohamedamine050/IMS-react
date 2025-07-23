import React, { useEffect, useState } from "react";
import Layout from "../component/Layout";
import ApiService from "../service/ApiService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedData, setSelectedData] = useState("amount");

  const [transactionData, setTransactionData] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  const [counts, setCounts] = useState({});

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ApiService.getAllTransactions();
        if (res.status === 200) {
          setTransactionData(
            transformTransactionData(res.transactions, selectedMonth, selectedYear)
          );
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching transactions");
      }
    };
    fetchData();
  }, [selectedMonth, selectedYear, selectedData]);

  useEffect(() => {
    const fetchTotalPrice = async () => {
      try {
        const total = await ApiService.sumTotalPriceByTransactionTypeAndStatus("sale", "completed");
        setTotalPrice(total);
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching total price");
      }
    };
    fetchTotalPrice();
  }, []);

  useEffect(() => {
    const fetchTotalProducts = async () => {
      try {
        const count = await ApiService.countProducts();
        setTotalProducts(count);
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching total products");
      }
    };
    fetchTotalProducts();
  }, []);

  useEffect(() => {
    const fetchTotalSuppliers = async () => {
      try {
        const count = await ApiService.countSuppliers();
        setTotalSuppliers(count);
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching total suppliers");
      }
    };
    fetchTotalSuppliers();
  }, []);

  useEffect(() => {
    const fetchTransactionCounts = async () => {
      try {
        const response = await ApiService.countAllTransactionTypes();
        if (response.status === 200) {
          setCounts(response.data || response);
        } else {
          setCounts(response);
        }
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching transaction counts");
      }
    };
    fetchTransactionCounts();
  }, []);

  useEffect(() => {
    const fetchCompletedSalesCount = async () => {
      try {
        const count = await ApiService.countCompletedSales();
        setTotalPrice(count);
      } catch (error) {
        showMessage(error.response?.data);
        console.error(error);
      }
    };
    fetchCompletedSalesCount();
  }, []); 

        

  const stats = [
    { title: "Total Sales", value: counts.SALE, icon: "💰", change: "+5% this month" },
    { title: "Total Purchases", value: counts.PURCHASE, icon: "🛒", change: "+3% this month" },
    { title: "Total Transactions", value: counts.SALE + counts.PURCHASE, icon: "📊", change: "+10% this month" },
    { title: "Total Products", value: totalProducts, icon: "📦", change: "+2% this month" },
    { title: "Total Suppliers", value: totalSuppliers, icon: "👥", change: "+1% this month" },
    { title: "Total Price of Sales", value: totalPrice, icon: "💵", change: "+4% this month" }
  ];

  const transformTransactionData = (transactions, month, year) => {
    const dailyData = {};
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      dailyData[day] = { day, count: 0, quantity: 0, amount: 0 };
    }

    transactions.forEach((tx) => {
      const date = new Date(tx.createdAt);
      if (date.getMonth() + 1 === month && date.getFullYear() === year) {
        const d = date.getDate();
        dailyData[d].count += 1;
        dailyData[d].quantity += tx.totalProducts;
        dailyData[d].amount += tx.totalPrice;
      }
    });

    return Object.values(dailyData);
  };

  const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value, 10));
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value, 10));

  return (
    <Layout>
      {message && <div className="message">{message}</div>}

      <div className="dashboard-page">
        <div className="stats-container">
  <div className="stats-grid">
    {stats.map((stat, index) => (
      <div key={index} className="stat-card">
        <div className="stat-content">
          <div className="stat-icon">{stat.icon}</div>
          <div className="stat-info">
            <p className="stat-title">{stat.title}</p>
            <p className="stat-value">{stat.value}</p>
            <p className="stat-change">{stat.change}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>Total No Of Transactions</button>
          <button onClick={() => setSelectedData("quantity")}>Product Quantity</button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        <div className="filter-section">
          <label htmlFor="month-select">Select Month:</label>
          <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <label htmlFor="year-select">Select Year:</label>
          <select id="year-select" value={selectedYear} onChange={handleYearChange}>
            {Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>

        <div className="chart-section">
          <h3>Daily Transactions</h3>
          <ResponsiveContainer width="100%" height={400}>
            {transactionData.length > 0 ? (
              <LineChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedData}
                  stroke="#008080"
                  fillOpacity={0.3}
                  fill="#008080"
                />
              </LineChart>
            ) : (
              <p>No transaction data available.</p>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
