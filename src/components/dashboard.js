import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Modal } from "antd";
import {
  UserAddOutlined,
  BankOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import { Fade } from "react-awesome-reveal";
import "./dashboard.css";
import { users, deposit, withdraw } from "../utils/axios"; // Keep existing imports

const Dashboard = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDepositCount, setTotalDepositCount] = useState(0);
  const [totalWithdrawCount, setTotalWithdrawCount] = useState(0);
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [isDepositModalVisible, setDepositModalVisible] = useState(false);
  const [isWithdrawModalVisible, setWithdrawModalVisible] = useState(false);

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

        // Get deposit count and requests
        const depositRes = await deposit.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const depositList = depositRes.data || [];
        setTotalDepositCount(depositList.length);

        // Fetch emails for deposit users by userId
        const depositUserEmails = await Promise.all(
          depositList.map(async (item) => {
            try {
              const userRes = await users.get(`/${item.user}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return userRes.data?.email || "Email not available"; // Assuming the response has email
            } catch (error) {
              console.error("Error fetching user for deposit:", error);
              return "Error fetching email";
            }
          })
        );
        setDepositRequests(depositUserEmails);

        // Get withdraw count and requests
        const withdrawRes = await withdraw.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const withdrawList = withdrawRes.data || [];
        setTotalWithdrawCount(withdrawList.length);

        // Fetch emails for withdraw users by userId
        const withdrawUserEmails = await Promise.all(
          withdrawList.map(async (item) => {
            try {
              const userRes = await users.get(`/${item.userId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              console.log(userRes)
              return userRes.data?.email || "Email not available"; // Assuming the response has email
            } catch (error) {
              console.error("Error fetching user for withdraw:", error);
              return "Error fetching email";
            }
          })
        );
        setWithdrawRequests(withdrawUserEmails);

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
      color: "transparent",
    },
    {
      title: "Deposit Requests",
      number: totalDepositCount,
      icon: <BankOutlined />,
      color: "transparent",
      onClick: () => setDepositModalVisible(true), // Open deposit modal
    },
    {
      title: "Withdraw Requests",
      number: totalWithdrawCount,
      icon: <ArrowUpOutlined />,
      color: "transparent",
      onClick: () => setWithdrawModalVisible(true), // Open withdraw modal
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
                onClick={item.onClick} // Trigger onClick when clicking the card
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

      {/* Deposit Modal */}
      <Modal
        title="Deposit Requests"
        visible={isDepositModalVisible}
        onCancel={() => setDepositModalVisible(false)}
        footer={null}
      >
        <h3>Deposit requests from:</h3>
        <ul>
          {depositRequests.length > 0 ? (
            depositRequests.map((email, index) => (
              <li key={index}>{email}</li>
            ))
          ) : (
            <p>No deposit requests available</p>
          )}
        </ul>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        title="Withdraw Requests"
        visible={isWithdrawModalVisible}
        onCancel={() => setWithdrawModalVisible(false)}
        footer={null}
      >
        <h3>Withdraw requests from:</h3>
        <ul>
          {withdrawRequests.length > 0 ? (
            withdrawRequests.map((email, index) => (
              <li key={index}>{email}</li>
            ))
          ) : (
            <p>No withdraw requests available</p>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default Dashboard;
