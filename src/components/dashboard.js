import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  UserAddOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { Fade } from "react-awesome-reveal";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Bar,
} from "recharts"; // Updated to BarChart
import "./dashboard.css";

const Dashboard = () => {
  // Mocked data instead of fetching from API
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 1200, // Mock value for users
    totalDeposit: 55000, // Mock value for total deposit
    totalWithdraw: 32000, // Mock value for total withdraw
    totalFunds: 23000, // Mock value for total funds
  });

  useEffect(() => {
    // Simulate data update
    const fetchDashboardData = async () => {
      // Mocking the API data for this example
      const totalUsers = 1200;
      const totalDeposit = 55000;
      const totalWithdraw = 32000;
      const totalFunds = 23000;

      setDashboardData({ totalUsers, totalDeposit, totalWithdraw, totalFunds });
      localStorage.setItem("totalUsers", totalUsers);
      localStorage.setItem("totalDeposit", totalDeposit);
      localStorage.setItem("totalWithdraw", totalWithdraw);
      localStorage.setItem("totalFunds", totalFunds);
    };

    fetchDashboardData();
  }, []);

  const { totalUsers, totalDeposit, totalWithdraw, totalFunds } = dashboardData;

  const data = [
    {
      title: "Total Users",
      number: totalUsers,
      icon: <UserAddOutlined />,
      color: "#FF9800",
    },
    {
      title: "Total Deposit",
      number: totalDeposit,
      icon: <BankOutlined />,
      color: "#4CAF50",
    },
    {
      title: "Total Withdraw",
      number: totalWithdraw,
      icon: <ArrowUpOutlined />,
      color: "#2196F3",
    },
    {
      title: "Total Funds",
      number: totalFunds,
      icon: <ArrowDownOutlined />,
      color: "#9C27B0",
    },
  ];

  // Format currency using Intl.NumberFormat for display
  const formatCurrency = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0, // Adjust the number of decimal places as needed
    }).format(number);
  };

  // Bar Chart Data from Cards
  const chartData = data.map((item) => ({
    name: item.title,
    value: item.number,
  }));

  // Get maximum value for scaling
  const maxValue = Math.max(...chartData.map((item) => item.value));

  return (
    <div className="dashboard-container">
      {/* Cards Section */}
      <Row gutter={[16, 16]} justify="center" align="middle">
        {data.map((item, index) => (
          <Col span={6} key={index}>
            <Fade direction="up" triggerOnce>
              <Card
                className="dashboard-card"
                hoverable
                style={{
                  borderRadius: "10px",
                  backgroundColor: item.color,
                  color: "#fff",
                }}
                bodyStyle={{ padding: "20px", textAlign: "center" }}
              >
                <div className="dashboard-card-icon">{item.icon}</div>
                <h3 className="dashboard-card-title">{item.title}</h3>
                <Statistic
                  value={
                    item.title === "Total Deposit" || item.title === "Total Funds"
                      ? formatCurrency(item.number) // Format the value if it's financial data
                      : item.number
                  }
                  valueStyle={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#FAF4EB",
                  }}
                />
              </Card>
            </Fade>
          </Col>
        ))}
      </Row>

      {/* Chart Section (Optional) */}
      {/* If you still want to include the chart */}
      <div className="dashboard-chart" style={{ textAlign: "center" }}>
        <h2>Analytics Overview</h2>
        <ResponsiveContainer width="80%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, maxValue * 1.2]} /> {/* Adjust Y-Axis scale */}
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
