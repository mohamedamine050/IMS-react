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
  const [totalSales, setTotalSales] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSuppliers, setTotalSuppliers] = useState(0);
  

  // Display error message
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 4000);
  };

  // Fetch transaction data for chart
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
    const fetchTotalSales = async () => {
      try {
        const salesCount = await ApiService.countSales();
        setTotalSales(salesCount);
      } catch (error) {
        showMessage(error.response?.data?.message || "Error fetching total sales");
      }
    };
    fetchTotalSales();
  }, []);

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
  




  // Transform backend data for chart
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

  // Handlers
  const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value, 10));
  const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value, 10));

  return (
    <Layout>
      {message && <div className="message">{message}</div>}
      <div className="dashboard-page">
        {/* Statistiques globales */}
        <div className="stat-cards">
          <div className="stat-card">Total Sales: {totalSales}</div>
          <div className="stat-card">Total Revenue: ${totalPrice}</div>
          <div className="stat-card">Total Products: {totalProducts}</div>
          <div className="stat-card">Total Suppliers: {totalSuppliers}</div>
        </div>

        {/* Boutons de filtre */}
        <div className="button-group">
          <button onClick={() => setSelectedData("count")}>Total No Of Transactions</button>
          <button onClick={() => setSelectedData("quantity")}>Product Quantity</button>
          <button onClick={() => setSelectedData("amount")}>Amount</button>
        </div>

        {/* Filtres date */}
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

        {/* Graphique */}
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
