import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  LineChartOutlined,
  ShoppingCartOutlined,
  DollarCircleOutlined,
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
    totalProducts: 500, // Mock value for products
    totalHangtags: 200, // Mock value for hangtags
  });

  useEffect(() => {
    // Simulate data update
    const fetchDashboardData = async () => {
      // Mocking the API data for this example
      const totalHangtags = 200;
      const totalProducts = 500;

      setDashboardData({ totalHangtags, totalProducts });
      localStorage.setItem("totalhangtags", totalHangtags);
      localStorage.setItem("totalproducts", totalProducts);
    };

    fetchDashboardData();
  }, []);

  const { totalProducts, totalHangtags } = dashboardData;

  const data = [
    {
      title: "Total Orders",
      number: 650,
      icon: <ShoppingCartOutlined />,
      color: "#FF5722",
    },
    {
      title: "Products",
      number: totalProducts + totalHangtags, // Add the numeric values
      icon: <LineChartOutlined />,
      color: "#3F51B5",
    },
    {
      title: "Total Sales",
      number: 10370, // Update to a number without "$" for calculations
      icon: <DollarCircleOutlined />,
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
    value:
      item.title === "Total Sales"
        ? item.number / 1000 // Divide by 1000 for scaling, if needed
        : item.number,
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
                    item.title === "Total Sales"
                      ? formatCurrency(item.number)
                      : item.number
                  } // Format the value if it's Total Sales
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

      {/* Chart Section */}
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
