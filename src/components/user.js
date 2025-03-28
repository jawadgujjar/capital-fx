import React, { useState, useEffect } from "react";
import {
  users,
  kyc,
  account,
  deposit,
  depdraw,
  withdraw,
} from "../utils/axios";
import {
  Table,
  Button,
  Modal,
  List,
  Form,
  notification,
  Input,
  Radio,
  Image,
  Spin,
  Descriptions,
  Card,
  Tabs,
  Tag,
  Space,
  Divider,
  Avatar,
} from "antd";
import {
  UserOutlined,
  MoneyCollectOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import "./user.css";

const { TabPane } = Tabs;

const User = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("demo");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Modal states
  const [activeTab, setActiveTab] = useState("1");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Data states
  const [deposits, setDeposits] = useState({});
  const [accountRequests, setAccountRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [accountRequestsLoading, setAccountRequestsLoading] = useState(false);

  // Form instance
  const [form] = Form.useForm();

  // Fetch all users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          notification.error({
            message: "Authentication Error",
            description: "No authentication token found. Please log in.",
          });
          return;
        }

        const response = await users.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const regularUsers = response.data.results
          .filter((user) => user.role === "user")
          .map((user) => ({
            ...user,
            id: user.id,
            userName: user.name || "User",
            email: user.email || "No email",
          }));

        if (regularUsers.length > 0) {
          localStorage.setItem("userid", regularUsers[0].id);
        }

        const usersWithData = await Promise.all(
          regularUsers.map(async (user) => {
            try {
              const kycResponse = await kyc.get(`/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              return {
                ...user,
                kyc: kycResponse.data || null,
                demoAccountTransactions: user.demoAccountTransactions || [],
                liveAccountTransactions: user.liveAccountTransactions || [],
                accountRequestStatus: user.accountRequestStatus || "pending",
                accountType: user.accountType || "demo",
              };
            } catch (error) {
              console.error(`Error fetching data for user ${user.id}:`, error);
              return {
                ...user,
                kyc: null,
                demoAccountTransactions: [],
                liveAccountTransactions: [],
                accountRequestStatus: "pending",
                accountType: "demo",
              };
            }
          })
        );

        setData(usersWithData);
      } catch (error) {
        console.error("Error fetching users:", error);
        notification.error({
          message: "Failed to load users",
          description:
            error.response?.data?.message || "Please try again later",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch account requests when selected user changes
  useEffect(() => {
    const fetchAccountRequests = async () => {
      try {
        setAccountRequestsLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          notification.error({
            message: "Authentication Error",
            description: "Please login first",
          });
          return;
        }

        const response = await account.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredRequests = response.data.results.filter(
          (request) => !selectedUserId || request.userId === selectedUserId
        );

        const processedRequests = filteredRequests.map((request) => ({
          id: request.id,
          name: request.name,
          email: request.email,
          accountType: request.accountType,
          amount: request.amount,
          country: request.country,
          phone: request.phone,
          status: request.status || "pending",
          userId: request.userId,
        }));

        setAccountRequests(processedRequests);
      } catch (error) {
        console.error("Error fetching account requests:", error);
        notification.error({
          message: "Failed to load account requests",
          description:
            error.response?.data?.message || "Please try again later",
        });
      } finally {
        setAccountRequestsLoading(false);
      }
    };

    fetchAccountRequests();
  }, [selectedUserId]);

  // Fetch deposits data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userid");

        if (!userId || !token) {
          console.error("User ID or token not found");
          return;
        }

        const depositResponse = await deposit.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const depositsByUser = {};
        depositResponse.data.forEach((deposit) => {
          if (!depositsByUser[deposit.user]) {
            depositsByUser[deposit.user] = [];
          }
          depositsByUser[deposit.user].push(deposit);
        });
        setDeposits(depositsByUser);
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch transactions when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      fetchTransactions(selectedUserId);
      fetchWithdrawData(selectedUserId);
    }
  }, [selectedUserId]);

  const fetchTransactions = async (userId) => {
    setLoading(true);
    try {
      const response = await depdraw.get(`/${userId}`);
      if (response.status === 200 && response) {
        const formattedTransaction = {
          id: response.id,
          amount: response.deposit || response.withdraw,
          type: response.withdraw ? "Withdraw" : "Deposit",
          email: response.email,
          status: response.status || "pending",
        };
        setTransactions([formattedTransaction]);
      } else {
        notification.error({
          message: "Unexpected Response",
          description: "API response format is incorrect.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to fetch transaction.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawData = async (userId) => {
    setLoading(true);
    try {
      const response = await withdraw.get(`/user/${userId}`);
      if (response.data) {
        setWithdrawRequests(response.data);
      } else {
        setWithdrawRequests([]);
      }
    } catch (error) {
      console.error("Error fetching withdraw data:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch withdraw data. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleRowClick = (record) => {
    setSelectedUser(record);
    setSelectedUserId(record.id);
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalVisible(true);
    setActiveTab("1");
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setModalType(null);
    setSelectedUser(null);
  };

  const handleVerifyKYC = async () => {
    if (!selectedUser?.id) {
      notification.error({ message: "User not found or invalid user ID." });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notification.error({ message: "No authentication token found." });
        return;
      }

      const response = await kyc.patch(
        `/${selectedUser.id}`,
        { status: "verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setSelectedUser({
          ...selectedUser,
          kyc: {
            ...selectedUser.kyc,
            status: "verified",
          },
        });
        notification.success({ message: "KYC Verified successfully!" });
      } else {
        notification.error({ message: "Failed to verify KYC." });
      }
    } catch (error) {
      console.error("Error verifying KYC:", error);
      notification.error({
        message: "Error verifying KYC. Please try again.",
      });
    }
  };

  const handleDeleteWithdrawRequest = async (withdrawId) => {
    try {
      const response = await withdraw.delete(`/${withdrawId}`);
      if (response.data.success) {
        setWithdrawRequests(
          withdrawRequests.filter((item) => item._id !== withdrawId)
        );
        notification.success({
          message: "Withdraw request deleted successfully!",
        });
      } else {
        notification.error({
          message: "Failed to delete request",
          description:
            response.data.message || "An error occurred while deleting.",
        });
      }
    } catch (error) {
      console.error("Error deleting withdraw request:", error);
      notification.error({
        message: "Error",
        description: "An error occurred while deleting the withdraw request.",
      });
    }
  };

  const handleAcceptAccountRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notification.error({
          message: "Authentication Error",
          description: "Please login first",
        });
        return;
      }

      const requestToAccept = accountRequests.find(
        (request) => request.id === requestId
      );

      if (!requestToAccept) {
        notification.error({
          message: "Request Not Found",
          description: "The account request could not be found",
        });
        return;
      }

      const userId = requestToAccept.userId;
      const response = await account.patch(
        `/${userId}`,
        { status: "verified" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setAccountRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === requestId
              ? { ...request, status: "verified" }
              : request
          )
        );
        notification.success({
          message: "Request Accepted",
          description: "Account request has been approved successfully",
        });
      }
    } catch (error) {
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
      });
      notification.error({
        message: "Failed to accept request",
        description:
          error.response?.data?.message ||
          "Please check the console for more details",
      });
    }
  };

  const handlePaymentDone = (transaction) => {
    if (selectedUser) {
      const updatedTransactions = (
        selectedUser.demoAccountTransactions || []
      ).map((txn) => {
        if (txn.type === "Withdraw" && txn.date === transaction.date) {
          return { ...txn, status: "completed" };
        }
        return txn;
      });

      const updatedUser = {
        ...selectedUser,
        demoAccountTransactions: updatedTransactions,
      };

      setSelectedUser(updatedUser);
      setData(
        data.map((user) => (user.key === selectedUser.key ? updatedUser : user))
      );

      notification.success({
        message: "Payment marked as done",
        description: `The withdrawal of $${transaction.amount} has been marked as completed.`,
      });
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) {
      notification.error({
        message: "Invalid amount",
        description: "Please enter a valid deposit amount.",
      });
      return;
    }

    try {
      const response = await depdraw.post("/", {
        userId: selectedUser.id,
        email,
        deposit: Number(depositAmount),
      });

      if (response.data.success) {
        notification.success({
          message: "Deposit added successfully!",
        });
        setDepositAmount("");
        form.resetFields();
      } else {
        notification.error({
          message: "Deposit failed",
          description:
            response.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.message || "An error occurred while processing the deposit.",
      });
    }
  };

  const handleWithdrawSubmit = async () => {
    if (
      !withdrawAmount ||
      isNaN(withdrawAmount) ||
      Number(withdrawAmount) <= 0
    ) {
      notification.error({
        message: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
      });
      return;
    }

    try {
      const response = await depdraw.post("/", {
        userId: selectedUser.id,
        email,
        withdraw: Number(withdrawAmount),
      });

      if (response.data.success) {
        notification.success({
          message: "Withdrawal added successfully!",
        });
        setWithdrawAmount("");
        if (form?.resetFields) form.resetFields();
      } else {
        notification.error({
          message: "Withdrawal failed",
          description:
            response.data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "An error occurred while processing the withdrawal.",
      });
    }
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
      dataIndex: "kyc",
      key: "kycStatus",
      render: (kyc) => (
        <Tag color={kyc?.status === "verified" ? "green" : "orange"}>
          {kyc?.status?.toUpperCase() || "NOT SUBMITTED"}
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
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
              openModal("kyc");
            }}
          >
            KYC
          </Button>
          <Button
            icon={<MoneyCollectOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
              openModal("funds");
            }}
          >
            Funds
          </Button>
          <Button
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(record);
              openModal("accountRequest");
            }}
          >
            Account Request
          </Button>
        </Space>
      ),
    },
  ];

  // Account request columns (original version)
  const accountRequestColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
      render: (type) => type.toUpperCase(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => `$${amount}`,
    },
    {
      title: "Country",
      dataIndex: "country",
      key: "country",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span style={{ color: status === "verified" ? "green" : "orange" }}>
          {status?.toUpperCase() || "PENDING"}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleAcceptAccountRequest(record.id)}
          disabled={record.status === "verified"}
        >
          Accept
        </Button>
      ),
    },
  ];

  // Render modals based on type
  const renderModalContent = () => {
    switch (modalType) {
      case "kyc":
        return renderKYCModal();
      case "funds":
        return renderFundsModal();
      case "accountRequest":
        return renderAccountRequestModal();
      default:
        return null;
    }
  };

  const renderKYCModal = () => (
    <div>
      {selectedUser?.kyc ? (
        <div>
          <div className="kyc-section">
            <h3>Proof of Identity</h3>
            <div className="kyc-images">
              {selectedUser.kyc.proofOfIdentity?.length > 0 ? (
                selectedUser.kyc.proofOfIdentity.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Proof of Identity ${index + 1}`}
                    width="100%"
                    className="kyc-image"
                  />
                ))
              ) : (
                <div className="no-image-placeholder">
                  <Image
                    src="https://via.placeholder.com/300x200?text=No+Image"
                    alt="No Proof of Identity"
                    width="100%"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="kyc-section">
            <h3>Bank Details</h3>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Account Holder">
                {selectedUser.kyc.bankDetails?.accountHolder || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="IBAN Number">
                {selectedUser.kyc.bankDetails?.ibanNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Account Number">
                {selectedUser.kyc.bankDetails?.accountNumber || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Bank Name">
                {selectedUser.kyc.bankDetails?.bankName || "N/A"}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {selectedUser.kyc.status === "verified" ? (
            <div className="kyc-verified-badge">
              <CheckOutlined /> KYC Verified
            </div>
          ) : (
            <Button
              type="primary"
              onClick={handleVerifyKYC}
              block
              size="large"
              icon={<CheckOutlined />}
            >
              Verify KYC
            </Button>
          )}
        </div>
      ) : (
        <div className="no-kyc-message">
          <p>No KYC documents submitted yet</p>
        </div>
      )}
    </div>
  );

  const renderFundsModal = () => (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <TabPane tab="Deposit Images" key="1">
        <div className="deposit-images-grid">
          {deposits[selectedUser?.id]?.map((deposit, index) => (
            <Card key={index} className="deposit-card">
              <Image
                src={deposit.image}
                alt={`Deposit ${index + 1}`}
                className="deposit-image"
                preview={{
                  mask: <EyeOutlined />,
                }}
              />
              <div className="deposit-info">
                <div>Amount: ${deposit.amount}</div>
                <div>Account: {deposit.tradingAccountId}</div>
              </div>
            </Card>
          ))}
          {(!deposits[selectedUser?.id] ||
            deposits[selectedUser?.id].length === 0) && (
            <div className="no-data-message">
              No deposit images found for this user
            </div>
          )}
        </div>
      </TabPane>

      <TabPane tab="Add Deposit" key="2">
        <Form form={form} layout="vertical">
          <Form.Item label="Deposit Amount">
            <Input
              type="number"
              placeholder="Enter deposit amount"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              prefix="$"
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleDepositSubmit}
            icon={<PlusOutlined />}
            block
          >
            Add Deposit
          </Button>
        </Form>
      </TabPane>

      <TabPane tab="Withdraw History" key="3">
        <Spin spinning={loading}>
          <List
            dataSource={withdrawRequests}
            renderItem={(transaction) => (
              <List.Item>
                <Card className="withdraw-card">
                  <div className="withdraw-info">
                    <div className="withdraw-row">
                      <span className="withdraw-label">Trading ID:</span>
                      <span>{transaction.tradingAccountId}</span>
                    </div>
                    <div className="withdraw-row">
                      <span className="withdraw-label">Account No:</span>
                      <span>{transaction.accountNumber}</span>
                    </div>
                    <div className="withdraw-row">
                      <span className="withdraw-label">Account Name:</span>
                      <span>{transaction.accountName}</span>
                    </div>
                    <div className="withdraw-row">
                      <span className="withdraw-label">Amount:</span>
                      <span className="withdraw-amount">
                        ${transaction.amount}
                      </span>
                    </div>
                    <div className="withdraw-date">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseOutlined />}
                    size="small"
                    onClick={() => handleDeleteWithdrawRequest(transaction._id)}
                  >
                    Delete
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </TabPane>

      <TabPane tab="Add Withdraw" key="4">
        <Form form={form} layout="vertical">
          <Form.Item label="Withdraw Amount">
            <Input
              type="number"
              placeholder="Enter withdraw amount"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              prefix="$"
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>
          <Button
            type="primary"
            onClick={handleWithdrawSubmit}
            icon={<MinusOutlined />}
            block
          >
            Add Withdraw
          </Button>
        </Form>
      </TabPane>

      <TabPane tab="Transaction History" key="5">
        <Spin spinning={loading}>
          <List
            dataSource={transactions}
            renderItem={(transaction) => (
              <List.Item>
                <Card className="transaction-card">
                  <div className="transaction-info">
                    <div className="transaction-email">{transaction.email}</div>
                    <div className="transaction-details">
                      <span className="transaction-type">
                        {transaction.type}:
                      </span>
                      <span className="transaction-amount">
                        ${transaction.amount}
                      </span>
                    </div>
                  </div>
                  {transaction.type === "Withdraw" && (
                    <Button
                      type="primary"
                      disabled={transaction.status === "completed"}
                      onClick={() => handlePaymentDone(transaction)}
                      icon={<ArrowRightOutlined />}
                    >
                      {transaction.status === "completed"
                        ? "Paid"
                        : "Mark Paid"}
                    </Button>
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Spin>
      </TabPane>
    </Tabs>
  );

  const renderAccountRequestModal = () => (
    <Spin spinning={accountRequestsLoading}>
      <Table
        columns={accountRequestColumns}
        dataSource={accountRequests}
        pagination={false}
        rowKey="id"
        size="small"
      />
    </Spin>
  );

  return (
    <div className="user-management-container">
      <Card
        title="User Management"
        bordered={false}
        className="user-management-card"
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
          })}
          rowClassName="user-table-row"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={
          modalType === "kyc"
            ? "KYC Verification"
            : modalType === "funds"
            ? "Funds Management"
            : "Account Requests"
        }
        visible={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={
          modalType === "funds"
            ? 800
            : modalType === "accountRequest"
            ? 1000
            : 600
        }
        className={`modal-${modalType}`}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default User;
