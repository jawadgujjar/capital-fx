import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic } from "antd";
import {
  UserAddOutlined,
  BankOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Fade } from "react-awesome-reveal";
import "./dashboard.css";
import { users, deposit, withdraw } from "../utils/axios";

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDepositCount, setTotalDepositCount] = useState(0);
  const [totalWithdrawCount, setTotalWithdrawCount] = useState(0);

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

        // Get deposit count
        const depositRes = await deposit.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(depositRes, "request")
        const depositList = depositRes.data || [];
        setTotalDepositCount(depositList.length);

        // Get withdraw count
        const withdrawRes = await withdraw.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(withdrawRes, "withdrawrequest")
        const withdrawList = withdrawRes.data || [];
        setTotalWithdrawCount(withdrawList.length);

        // Store in localStorage (optional)
        localStorage.setItem("totalUsers", filteredUsers.length);
        localStorage.setItem("totalDepositCount", depositList.length);
        localStorage.setItem("totalWithdrawCount", withdrawList.length);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const data = [
    {
      title: "Total Users",
      number: totalUsers,
      icon: <UserAddOutlined />,
      color: "#FF9800",
    },
    {
      title: "Deposit Requests",
      number: totalDepositCount,
      icon: <BankOutlined />,
      color: "#4CAF50",
    },
    {
      title: "Withdraw Requests",
      number: totalWithdrawCount,
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
                  value={item.number}
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
