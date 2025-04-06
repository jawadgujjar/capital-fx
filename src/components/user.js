import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  Space,
  Avatar,
  Modal,
  Descriptions,
  Spin,
  message
} from "antd";
import {
  UserOutlined,
  MoneyCollectOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { users, kyc, account } from "../utils/axios";
import Transactions from "./transactions"; // Import the Transactions component
import "./user.css";

const User = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isTransactionsModalVisible, setIsTransactionsModalVisible] = useState(false); // New state for transactions modal
  const [selectedUserKyc, setSelectedUserKyc] = useState(null);
  const [accountRequests, setAccountRequests] = useState([]);
  const [allAccountRequests, setAllAccountRequests] = useState([]);
  const [accountRequestsLoading, setAccountRequestsLoading] = useState(false);

  // Fetch all users data and account requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          message.error("No authentication token found");
          return;
        }

        // Fetch users and account requests in parallel
        const [usersResponse, accountsResponse] = await Promise.all([
          users.get("/", { headers: { Authorization: `Bearer ${token}` } }),
          account.get("/", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        // Store all account requests
        setAllAccountRequests(accountsResponse.data || []);

        // Process users with their KYC data
        const regularUsers = await Promise.all(
          usersResponse.data.results
            .filter((user) => user.role === "user")
            .map(async (user) => {
              try {
                const kycResponse = await kyc.get(`/${user.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                return {
                  ...user,
                  id: user.id,
                  userName: user.name || "User",
                  email: user.email || "No email",
                  kyc: kycResponse.data || null,
                };
              } catch (error) {
                return {
                  ...user,
                  id: user.id,
                  userName: user.name || "User",
                  email: user.email || "No email",
                  kyc: null,
                };
              }
            })
        );

        setData(regularUsers);
      } catch (error) {
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // KYC Actions
  const handleKycAction = async (userId) => {
    try {
      setSelectedUserId(userId);
      const token = localStorage.getItem("token");
      const response = await kyc.get(`/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUserKyc(response.data);
      setIsKycModalVisible(true);
    } catch (error) {
      message.error("Failed to fetch KYC details");
    }
  };

  const handleVerifyKyc = async () => {
    try {
      const token = localStorage.getItem("token");
      await kyc.patch(
        `/${selectedUserId}`,
        { status: "verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(data.map(user =>
        user.id === selectedUserId
          ? { ...user, kyc: { ...user.kyc, status: "verified" } }
          : user
      ));

      setSelectedUserKyc({ ...selectedUserKyc, status: "verified" });
      message.success("KYC verified successfully");
    } catch (error) {
      message.error("Failed to verify KYC");
    }
  };

  // Account Request Actions
  const handleAccountRequest = (userId) => {
    console.log("Handling account request for user ID:", userId);
    console.log("All account requests:", allAccountRequests);

    setSelectedUserId(userId);
    setAccountRequestsLoading(true);

    // Filter account requests for the selected user
    const userAccountRequests = allAccountRequests.filter(request => {
      // Convert both IDs to strings for comparison
      const requestUserId = request.userId?.toString().trim();
      const currentUserId = userId?.toString().trim();

      console.log("Comparing:", requestUserId, "with", currentUserId);
      return requestUserId === currentUserId;
    });

    console.log("Filtered requests:", userAccountRequests);
    setAccountRequests(userAccountRequests);
    setIsAccountModalVisible(true);
    setAccountRequestsLoading(false);
  };

  const handleAcceptAccountRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await account.patch(
        `/${requestId}`,
        { status: "verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update both allAccountRequests and filtered accountRequests
      const updatedRequests = allAccountRequests.map(request =>
        request._id === requestId
          ? { ...request, status: "verified" }
          : request
      );

      setAllAccountRequests(updatedRequests);
      setAccountRequests(updatedRequests.filter(req =>
        req.userId?.toString() === selectedUserId?.toString()
      ));
      message.success("Account request approved successfully");
    } catch (error) {
      message.error("Failed to approve account request");
    }
  };

  const handleRejectAccountRequest = async (requestId) => {
    console.log(requestId, "id deleted");
    try {
      const token = localStorage.getItem("token");
      await account.delete(`/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success("Account deleted successfully");
    } catch (error) {
      message.error("Failed to delete account");
      console.error(error);
    }
  };

  // Funds action - Modified to show transactions modal
  const handleFundsAction = (userId) => {
    setSelectedUserId(userId);
    setIsTransactionsModalVisible(true);
    message.info(`Showing transactions for user ID: ${userId}`);
  };

  // Table columns
  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="user-cell">
          <Avatar icon={<UserOutlined />} />
          <div className="user-info">
            <div className="user-name">{text || "User"}</div>
            <div className="user-email">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "KYC Status",
      key: "kycStatus",
      render: (_, record) => (
        <Tag color={record.kyc?.status === "verified" ? "green" : "orange"}>
          {record.kyc?.status?.toUpperCase() || "NOT SUBMITTED"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<IdcardOutlined />}
            onClick={() => handleKycAction(record.id)}
          >
            KYC
          </Button>
          <Button
            icon={<MoneyCollectOutlined />}
            onClick={() => handleFundsAction(record.id)}
          >
            Funds
          </Button>
          <Button
            type="primary"
            onClick={() => handleAccountRequest(record.id)}
          >
            Account
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <Card title="User Management" bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* KYC Modal */}
      <Modal
        title="KYC Verification"
        visible={isKycModalVisible}
        onCancel={() => setIsKycModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUserKyc ? (
          <div>
            <div className="kyc-section">
              <h3>Proof of Identity</h3>
              <div className="kyc-images">
                {selectedUserKyc.proofOfIdentity?.length > 0 ? (
                  selectedUserKyc.proofOfIdentity.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Proof ${index + 1}`}
                      className="kyc-image"
                      style={{ width: "100%", marginBottom: 16 }}
                    />
                  ))
                ) : (
                  <p>No identity documents submitted</p>
                )}
              </div>
            </div>

            <div className="kyc-section">
              <h3>Bank Details</h3>
              <Descriptions bordered column={1}>
                <Descriptions.Item label="Account Holder">
                  {selectedUserKyc.bankDetails?.accountHolder || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Account Number">
                  {selectedUserKyc.bankDetails?.accountNumber || "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Bank Name">
                  {selectedUserKyc.bankDetails?.bankName || "N/A"}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {selectedUserKyc.status === "verified" ? (
              <Tag color="green" style={{ marginTop: 16 }}>
                <CheckOutlined /> KYC Verified
              </Tag>
            ) : (
              <Button
                type="primary"
                onClick={handleVerifyKyc}
                icon={<CheckOutlined />}
                style={{ marginTop: 16 }}
              >
                Verify KYC
              </Button>
            )}
          </div>
        ) : (
          <p>No KYC data available for this user</p>
        )}
      </Modal>

      {/* Account Request Modal */}
      <Modal
        title={`Account Requests (User ${selectedUserId})`}
        visible={isAccountModalVisible}
        onCancel={() => setIsAccountModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Spin spinning={accountRequestsLoading}>
          {accountRequests.length > 0 ? (
            <Table
              columns={[
                {
                  title: 'Name',
                  dataIndex: 'name',
                  key: 'name',
                  render: (text) => text || 'N/A'
                },
                {
                  title: 'Email',
                  dataIndex: 'email',
                  key: 'email',
                  render: (text) => text || 'N/A'
                },
                {
                  title: 'Account Type',
                  dataIndex: 'accountType',
                  key: 'accountType',
                  render: (type) => (
                    <Tag color={type === 'real' ? 'blue' : 'purple'}>
                      {type?.toUpperCase() || 'N/A'}
                    </Tag>
                  ),
                },
                {
                  title: 'Amount ($)',
                  dataIndex: 'amount',
                  key: 'amount',
                  align: 'right',
                  render: (amount) => amount?.toFixed(2) || '0.00',
                },
                {
                  title: 'Phone',
                  dataIndex: 'phone',
                  key: 'phone',
                  render: (text) => text || 'N/A'
                },
                {
                  title: 'Country',
                  dataIndex: 'country',
                  key: 'country',
                  render: (text) => text || 'N/A'
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={status === 'verified' ? 'green' :
                      status === 'rejected' ? 'red' : 'orange'}>
                      {status?.toUpperCase() || 'PENDING'}
                    </Tag>
                  ),
                },
                // {
                //   title: 'Created At',
                //   dataIndex: 'createdAt',
                //   key: 'createdAt',
                //   render: (date) => date ? new Date(date).toLocaleString() : 'N/A',
                // },
                {
                  title: 'Actions',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Button
                        type="primary"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={() => handleAcceptAccountRequest(record.id)}
                        disabled={record.status === 'verified'}
                      >
                        Approve
                      </Button>
                      <Button
                        danger
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={() => handleRejectAccountRequest(record.id)}
                        disabled={record.status === 'rejected'}
                      >
                        Delete
                      </Button>
                    </Space>
                  ),
                },
              ]}
              dataSource={accountRequests}
              rowKey="_id"
              pagination={false}
              size="small"
            />
          ) : (
            <p>No account requests found for this user</p>
          )}
        </Spin>
      </Modal>

      {/* Transactions Modal */}
      <Modal
        title={`Transactions for User ${selectedUserId}`}
        visible={isTransactionsModalVisible}
        onCancel={() => setIsTransactionsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Transactions userId={selectedUserId} /> {/* Pass the user ID to Transactions component */}
      </Modal>
    </div>
  );
};

export default User;