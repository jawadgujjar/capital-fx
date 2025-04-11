import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  UserAddOutlined,
  BankOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Fade } from "react-awesome-reveal";
import "./dashboard.css";
import { depdraw, users } from "../utils/axios";

const Dashboard = () => {
  // Individual states
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [totalWithdraw, setTotalWithdraw] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");

      try {
        // Get all users
        const usersRes = await users.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const usersList = usersRes.data?.results || [];
        const filteredUsers = usersList.filter((user) => user.role === "user");
        setTotalUsers(filteredUsers.length);

        // Get deposits and withdrawals
        const depdrawsRes = await depdraw.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        let deposit = 0;
        let withdraw = 0;

        (depdrawsRes.data?.results || []).forEach((item) => {
          if (item.deposit) deposit += item.deposit;
          if (item.withdraw) withdraw += item.withdraw;
        });

        setTotalDeposit(deposit);
        setTotalWithdraw(withdraw);

        // Optional localStorage if needed
        localStorage.setItem("totalUsers", filteredUsers.length);
        localStorage.setItem("totalDeposit", deposit);
        localStorage.setItem("totalWithdraw", withdraw);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(number);
  };

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
  ];

  return (
    <div className="dashboard-container">
      <Row
        gutter={[16, 16]}
        justify="center"
        align="middle"
        style={{ marginTop: "3rem" }}
      >
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
                    item.title.includes("Deposit") ||
                    item.title.includes("Withdraw")
                      ? formatCurrency(item.number)
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
    </div>
  );
};

export default Dashboard;
