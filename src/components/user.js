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
} from "antd";
import { Tabs } from "antd";
import "./user.css";

const { Tab } = Tabs;

const User = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositImage, setDepositImage] = useState("");
  const [withdrawData, setWithdrawData] = useState("");
  const [deposits, setDeposits] = useState({
    // Structure: { [userId]: [{id, amount, image, date, status}, ...] }
  });
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isFundsModalVisible, setIsFundsModalVisible] = useState(false);
  const [isAccountRequestModalVisible, setIsAccountRequestModalVisible] =
    useState(false);
  const [isSendDetailsModalVisible, setIsSendDetailsModalVisible] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [accountRequests, setAccountRequests] = useState([]);
  const [withdrawRequests, setWithdrawRequests] = useState([]);
  const [newDeposits, setNewDeposits] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("demo");
  const [accountRequestsLoading, setAccountRequestsLoading] = useState(false);
  const [form] = Form.useForm(); // Initialize the form

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

        // Fetch all users
        const response = await users.get("/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Filter only users with role 'user' (exclude admins)
        const regularUsers = response.data.results
          .filter((user) => user.role === "user")
          .map((user) => ({
            ...user,
            // Ensure consistent field names
            id: user.id, // Handle both _id and id
            userName: user.name || "User",
            email: user.email || "No email",
          }));
        if (regularUsers.length > 0) {
          localStorage.setItem("userid", regularUsers[0].id);
        }
        const userId = regularUsers[0].id;
        // Fetch KYC and other data for regular users
        const usersWithData = await Promise.all(
          regularUsers.map(async (user) => {
            try {
              // Fetch KYC data
              const kycResponse = await kyc.get(`/${user.id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              return {
                ...user,
                kyc: kycResponse.data || null,
                demoAccountTransactions: user.demoAccountTransactions || [],
                liveAccountTransactions: user.liveAccountTransactions || [],
                accountRequestStatus: user.accountRequestStatus || "pending",
                accountType: user.accountType || "demo",
                // Add any other necessary fields here
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
  //account api********

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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response, "acounts ka data");

        // Filter the API response to only include the requests for the selected user
        const filteredRequests = response.data.results.filter(
          (request) => !selectedUserId || request.userId === selectedUserId
        );

        // Map the filtered data to match your table columns
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
  }, [selectedUserId]); // Re-fetch requests when selectedUserId changes
  useEffect(() => {
    // In your useEffect for fetching deposits
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userid");

        if (!userId || !token) {
          console.error("User ID or token not found");
          return;
        }

        // Fetch deposits for all users (admin view)
        const depositResponse = await deposit.get("/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Organize deposits by user ID
        const depositsByUser = {};
        depositResponse.data.forEach((deposit) => {
          if (!depositsByUser[deposit.user]) {
            depositsByUser[deposit.user] = [];
          }
          depositsByUser[deposit.user].push(deposit);
        });
        setNewDeposits(depositsByUser);
      } catch (error) {
        console.error("Error fetching deposits:", error);
      }
    };
    fetchData();
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      className: "custom-table-column",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "custom-table-column",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="custom-action-buttons">
          <Button className="view-kyc-button" onClick={() => viewKYC(record)}>
            KYC
          </Button>
          <Button className="funds-button" onClick={() => viewFunds(record)}>
            Funds
          </Button>
          <Button
            className="account-request-button"
            onClick={() => viewAccountRequest(record)} // Trigger for opening the modal
          >
            Account Request
          </Button>
          <Button
            className="send-details-button"
            onClick={() => viewSendDetails(record)}
          >
            Send Details
          </Button>
        </div>
      ),
      className: "custom-table-column",
    },
  ];

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
          disabled={record.status === "accepted"}
        >
          Accept
        </Button>
      ),
    },
  ];

  const viewKYC = (record) => {
    setSelectedUser(record);
    setIsKycModalVisible(true);
  };

  const viewFunds = (record) => {
    setSelectedUser(record);
    setSelectedUserId(record.id);
    setIsFundsModalVisible(true);
  };

  const viewAccountRequest = (record) => {
    setSelectedUser(record); // Set the selected user details
    setSelectedUserId(record.id); // Set the selected userId to filter the requests
    setIsAccountRequestModalVisible(true); // Show the modal
  };

  const viewSendDetails = (record) => {
    setSelectedUser(record);
    setIsSendDetailsModalVisible(true);
  };

  const handleVerifyKYC = async () => {
    if (selectedUser && selectedUser.id) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          notification.error({ message: "No authentication token found." });
          return;
        }

        const response = await kyc.patch(
          `/${selectedUser.id}`,
          { status: "verified" }, // ✅ API ke andar bhi verified bhej rahe hain
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          setSelectedUser({
            ...selectedUser,
            kyc: {
              ...selectedUser.kyc,
              status: "verified", // ✅ UI turant update ho jayegi
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
    } else {
      notification.error({ message: "User not found or invalid user ID." });
    }
  };
  useEffect(() => {
    if (selectedUserId) {
      // Fetch withdraw history data when selectedUserId changes
      fetchWithdrawData(selectedUserId);
    }
  }, [selectedUserId]); // Re-run this effect when selectedUserId changes

  const fetchWithdrawData = async (userId) => {
    setLoading(true); // Show spinner
    try {
      const response = await withdraw.get(`/user/${userId}`);
      if (response.data) {
        setWithdrawRequests(response.data); // Save withdraw data in state
      } else {
        setWithdrawRequests([]); // If no data returned, set as empty array
      }
    } catch (error) {
      console.error("Error fetching withdraw data:", error);
      notification.error({
        message: "Error",
        description: "Failed to fetch withdraw data. Please try again later.",
      });
    } finally {
      setLoading(false); // Hide spinner after data is fetched
    }
  };

  const handleDeleteWithdrawRequest = async (withdrawId) => {
    try {
      // Make the delete API call
      const response = await withdraw.delete(`/${withdrawId}`);
      if (response.data.success) {
        // If delete successful, remove the item from the state
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

      // Find the request in your state to get the userId
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
        {
          status: "verified",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Update state only after successful API response
        setAccountRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === requestId // Changed from _id to id to match your data structure
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

      // Status remains "pending" since the API call failed
    }
  };
  const handleSendDetails = () => {
    notification.success({
      message: `Details sent to ${email}`,
      description: `Account Type: ${accountType}`,
    });
    setIsSendDetailsModalVisible(false);
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
  const handleDepositChange = (e) => {
    setDepositAmount(e.target.value);
  };

  const handleDepositSubmit = async (userId, email) => {
    if (depositAmount && !isNaN(depositAmount) && Number(depositAmount) > 0) {
      try {
        // Make the API call for deposit (assuming you have a 'deposit' endpoint)
        const response = await depdraw.post("/", {
          userId, // Pass the user ID
          email, // Pass the email
          deposit: Number(depositAmount), // Pass the deposit amount
        });

        if (response.data.success) {
          // API call was successful
          notification.success({
            message: "Deposit added successfully!",
          });

          // Optionally, update the selected user or global state here if necessary
          setDepositAmount(""); // Reset the deposit amount input
          form.resetFields(); // Reset form values
        } else {
          // API call failed with some error message
          notification.error({
            message: "Deposit failed",
            description:
              response.data.message ||
              "Something went wrong. Please try again.",
          });
        }
      } catch (error) {
        // Handle error during the API call
        notification.error({
          message: "Error",
          description:
            error.message || "An error occurred while processing the deposit.",
        });
      }
    } else {
      notification.error({
        message: "Invalid amount",
        description: "Please enter a valid deposit amount.",
      });
    }
  };

  const handleCancel = () => {
    setIsKycModalVisible(false);
    setIsFundsModalVisible(false);
    setIsAccountRequestModalVisible(false);
    setIsSendDetailsModalVisible(false);
    setSelectedUser(null);
  };

  return (
    <div className="user-table-container">
      <h2 className="user-table-heading">User Information</h2>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="_id"
          pagination={false}
        />
      </Spin>

      {/* KYC Modal */}
      <Modal
        title={`KYC Details - ${selectedUser?.userName || "User"}`}
        visible={isKycModalVisible}
        onCancel={() => setIsKycModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedUser?.kyc ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h3>Proof of Identity</h3>
              {selectedUser.kyc.proofOfIdentity?.length > 0 ? (
                selectedUser.kyc.proofOfIdentity.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    alt={`Proof of Identity ${index + 1}`}
                    width="100%"
                    style={{
                      maxHeight: 300,
                      objectFit: "contain",
                      marginBottom: 10,
                    }}
                  />
                ))
              ) : (
                <Image
                  src="https://via.placeholder.com/300x200?text=No+Image"
                  alt="No Proof of Identity"
                  width="100%"
                  style={{ maxHeight: 300, objectFit: "contain" }}
                />
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <h3>Bank Details</h3>
              <Descriptions bordered column={1}>
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
              <div
                style={{
                  padding: 10,
                  background: "#f6ffed",
                  border: "1px solid #b7eb8f",
                  textAlign: "center",
                  borderRadius: 4,
                }}
              >
                <span style={{ color: "#52c41a" }}>✓ KYC Verified</span>
              </div>
            ) : (
              <Button
                type="primary"
                onClick={handleVerifyKYC}
                block
                size="large"
              >
                Verify KYC
              </Button>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 20 }}>
            <p>No KYC documents submitted yet</p>
          </div>
        )}
      </Modal>

      {/* Funds Modal */}
      <Modal
        title="Funds Transactions"
        visible={isFundsModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <Tabs defaultActiveKey="1" type="card">
            {/* Tab 1: Deposit Images */}
            <Tab key="1" tab="Deposit Images">
              <h3>Deposit Images for {selectedUser.name}</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "16px",
                  padding: "16px",
                }}
              >
                {newDeposits[selectedUser.id]?.map((deposit, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      paddingBottom: "100%",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Image
                      src={deposit.image}
                      alt={`Deposit ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      preview={true}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "4px",
                        fontSize: "12px",
                      }}
                    >
                      Amount: ${deposit.amount}
                    </div>
                  </div>
                ))}
                {(!newDeposits[selectedUser.id] ||
                  newDeposits[selectedUser.id].length === 0) && (
                  <p>No deposit images found for this user</p>
                )}
              </div>
            </Tab>

            {/* Tab 2: Add Deposit */}
            <Tab key="2" tab="Add Deposit">
              <h3>Add Deposit</h3>
              <div style={{ marginBottom: "10px" }}>
                <Input
                  type="number"
                  placeholder="Enter deposit amount"
                  value={depositAmount}
                  onChange={handleDepositChange}
                />
              </div>
              {/* Email input */}
              <div style={{ marginBottom: "10px" }}>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <Button
                type="primary"
                onClick={() => handleDepositSubmit(selectedUser.id, email)} // Pass email along with user ID
                style={{ marginTop: "10px" }}
              >
                Add Deposit
              </Button>
            </Tab>
            {/* Tab 3: Withdraw History */}
            <Tab key="3" tab="Withdraw History">
              <h3>Withdraw History</h3>
              {loading ? (
                <Spin />
              ) : (
                <List
                  dataSource={withdrawRequests}
                  renderItem={(transaction) => (
                    <List.Item>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <strong>{transaction.type}:</strong> $
                          {transaction.amount} on {transaction.date}
                        </div>
                        <Button
                          type="primary"
                          style={{ marginLeft: "10px" }}
                          disabled={transaction.status === "completed"}
                          onClick={() =>
                            handleDeleteWithdrawRequest(transaction._id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Tab>

            {/* Tab 4: Transaction History */}
            <Tab key="4" tab="Transaction History">
              <h3>All Transactions</h3>
              <List
                dataSource={[
                  ...(selectedUser.demoAccountTransactions || []),
                  ...(selectedUser.liveAccountTransactions || []),
                ]}
                renderItem={(transaction) => (
                  <List.Item>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <strong>{transaction.type}:</strong> $
                        {transaction.amount} on {transaction.date}
                      </div>
                      {transaction.type === "Withdraw" && (
                        <Button
                          type="primary"
                          style={{ marginLeft: "10px" }}
                          disabled={transaction.status === "completed"}
                          onClick={() => handlePaymentDone(transaction)}
                        >
                          {transaction.status === "completed"
                            ? "Payment Done"
                            : "Mark Payment Done"}
                        </Button>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Tab>
          </Tabs>
        )}

        {/* Image Preview Modal */}
        <Modal
          visible={imagePreviewVisible}
          footer={null}
          onCancel={() => setImagePreviewVisible(false)}
          width={800}
        >
          <Image src={imagePreviewSrc} alt="Preview" />
        </Modal>
      </Modal>

      {/* Account Request Modal */}
      <Modal
        title={`Account Requests for ${selectedUser?.name}`}
        visible={isAccountRequestModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={1000}
      >
        <Spin spinning={accountRequestsLoading}>
          <Tabs defaultActiveKey="1">
            {/* Pending Requests Tab */}
            <Tabs.TabPane tab="Pending Requests" key="1">
              <Table
                columns={accountRequestColumns}
                dataSource={accountRequests.filter(
                  (request) => request.status !== "accepted"
                )}
                pagination={false}
                rowKey="id"
              />
            </Tabs.TabPane>

            {/* Accepted Requests Tab */}
            <Tabs.TabPane tab="Accepted Requests" key="2">
              <Table
                columns={accountRequestColumns}
                dataSource={accountRequests.filter(
                  (request) => request.status === "accepted"
                )}
                pagination={false}
                rowKey="id"
              />
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </Modal>
      {/* Send Details Modal */}
      <Modal
        title="Send User Details"
        visible={isSendDetailsModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        <div className="send-details-content">
          <div>
            <h4>Email</h4>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <h4>Password</h4>
            <Input.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>
          <div style={{ marginTop: "10px" }}>
            <h4>Account Type</h4>
            <Radio.Group
              onChange={(e) => setAccountType(e.target.value)}
              value={accountType}
            >
              <Radio value="demo">Demo</Radio>
              <Radio value="live">Live</Radio>
            </Radio.Group>
          </div>
          <Button
            type="primary"
            onClick={handleSendDetails}
            style={{ marginTop: "20px" }}
          >
            Send
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default User;
