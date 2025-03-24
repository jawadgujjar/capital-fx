import React, { useState, useEffect } from "react";
import { users,kyc } from "../utils/axios";
import {
  Table,
  Button,
  Modal,
  List,
  notification,
  Input,
  Radio,
  Image,
  Tabs,
} from "antd";
import "./user.css"; // Ensure custom CSS is applied

const { Tab } = Tabs;

const User = () => {
  const [data, setData] = useState([]); // State to store user data
  const [depositAmount, setDepositAmount] = useState("");
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewSrc, setImagePreviewSrc] = useState("");
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isFundsModalVisible, setIsFundsModalVisible] = useState(false);
  const [isAccountRequestModalVisible, setIsAccountRequestModalVisible] =
    useState(false);
  const [isSendDetailsModalVisible, setIsSendDetailsModalVisible] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [accountRequests, setAccountRequests] = useState([]);
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [newDeposits, setNewDeposits] = useState([]); // State for newly added deposits

  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [accountType, setAccountType] = useState("demo"); // State for account type (live/demo)

  // Fetch user data from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from localStorage

        if (!token) {
          notification.error({
            message: "Authentication Error",
            description: "No authentication token found. Please log in.",
          });
          return;
        }

        // Make the API request with the token in the Authorization header
        const response = await users.get("/", {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        });

        console.log(response); // Log the response for debugging

        // Assuming the API returns an array of users in response.data.results
        const usersData = response.data.results;

        // Filter out admins based on their role
        const filteredUsers = usersData.filter((user) => user.role !== "admin"); // Adjust this condition based on your API response

        setData(filteredUsers); // Set only non-admin users in the state
      } catch (error) {
        console.error("Error fetching user data:", error);
        notification.error({
          message: "Failed to fetch user data",
          description: "Please try again later.",
        });
      }
    };

    fetchUsers();
  }, []); // Empty dependency array ensures this runs only once on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from localStorage
  
        if (!token) {
          notification.error({
            message: 'Authentication Error',
            description: 'No authentication token found. Please log in.',
          });
          return;
        }
  
        // Make the API request with the token in the Authorization header
        const response = await users.get('/', {
          headers: {
            'Authorization': `Bearer ${token}`, // Include token in the Authorization header
          },
        });
  
        console.log(response); // Log the response for debugging
  
        const usersData = response.data.results;
  
        // Fetch KYC details for each user
        const usersWithKYC = await Promise.all(
          usersData.map(async (user) => {
            try {
              // Assuming each user has an ID, and we can fetch KYC details with it
              const kycResponse = await kyc.get(`/${user.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });
  
              return {
                ...user,
                kyc: kycResponse.data, // Attach KYC data to user
              };
            } catch (kycError) {
              console.error('Error fetching KYC data:', kycError);
              return {
                ...user,
                kyc: null, // In case of error, attach null to KYC data
              };
            }
          })
        );
  
        // Filter out admins based on their role
        const filteredUsers = usersWithKYC.filter((user) => user.role !== 'admin');
        setData(filteredUsers); // Set only non-admin users in the state
      } catch (error) {
        console.error('Error fetching user data:', error);
        notification.error({
          message: 'Failed to fetch user data',
          description: 'Please try again later.',
        });
      }
    };
  
    fetchUsers();
  }, []);
  

  const columns = [
    {
      title: "Name",
      dataIndex: "userName",
      key: "userName",
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
            onClick={() => viewAccountRequest(record)}
          >
            Account Request
          </Button>
          <Button
            className="send-details-button"
            onClick={() => viewSendDetails(record)}
          >
            Send Details
          </Button>{" "}
          {/* New Button */}
        </div>
      ),
      className: "custom-table-column",
    },
  ];

  const accountRequestColumns = [
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType",
    },
    {
      title: "Request Status",
      dataIndex: "accountRequestStatus",
      key: "accountRequestStatus",
      render: (status) => (
        <span style={{ color: status === "accepted" ? "green" : "orange" }}>
          {status.toUpperCase()}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleAcceptAccountRequest(record.key)}
          disabled={record.accountRequestStatus === "accepted"}
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
    setIsFundsModalVisible(true);
  };

  const viewAccountRequest = (record) => {
    setSelectedUser(record);
    setIsAccountRequestModalVisible(true);
  };

  const viewSendDetails = (record) => {
    setSelectedUser(record);
    setIsSendDetailsModalVisible(true); // Open the new modal
  };

  const handleVerifyKYC = async () => {
    if (selectedUser && selectedUser.kyc) {
      try {
        // Call API to update the KYC verification status
        const token = localStorage.getItem('token');
        const response = await kyc.put(`/${selectedUser.id}`, null, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        // Update KYC status locally if API call is successful
        setSelectedUser({
          ...selectedUser,
          kyc: {
            ...selectedUser.kyc,
            isVerified: true,
          },
        });
  
        notification.success({ message: 'KYC Verified successfully!' });
      } catch (error) {
        console.error('Error verifying KYC:', error);
        notification.error({ message: 'Failed to verify KYC' });
      }
    }
  };
  

  const handleAcceptAccountRequest = () => {
    if (selectedUser) {
      selectedUser.accountRequestStatus = "accepted";
      setAcceptedUsers([...acceptedUsers, selectedUser]);
      setIsAccountRequestModalVisible(false);
      notification.success({
        message: `Account request for ${selectedUser.userName} accepted!`,
      });
    }
  };

  const handleSendDetails = () => {
    if (selectedUser) {
      // Logic to send email and password along with account type
      notification.success({
        message: `Details sent to ${email}`,
        description: `Account Type: ${accountType}`, // Include selected account type in notification
      });
      setIsSendDetailsModalVisible(false); // Close the modal after sending
    }
  };

  const handlePaymentDone = (transaction) => {
    if (selectedUser) {
      // Find the transaction in the selected user's data and update its status
      const updatedTransactions = selectedUser.demoAccountTransactions.map(
        (txn) => {
          if (txn.type === "Withdraw" && txn.date === transaction.date) {
            return { ...txn, status: "completed" };
          }
          return txn;
        }
      );

      // Update the selectedUser's transactions
      const updatedUser = {
        ...selectedUser,
        demoAccountTransactions: updatedTransactions,
      };
      setSelectedUser(updatedUser);

      // Optional: Show a notification or update state to reflect the change
      notification.success({
        message: "Payment marked as done",
        description: `The withdrawal of $${transaction.amount} has been marked as completed.`,
      });
    }
  };

  const handleImageClick = (imageSrc) => {
    setImagePreviewSrc(imageSrc);
    setImagePreviewVisible(true);
  };

  const handleDepositChange = (e) => {
    setDepositAmount(e.target.value);
  };

  // Handle deposit submission
  const handleDepositSubmit = () => {
    if (depositAmount && !isNaN(depositAmount) && Number(depositAmount) > 0) {
      const newTransaction = {
        type: "Deposit",
        amount: Number(depositAmount),
        date: new Date().toISOString().split("T")[0], // Current date
      };

      // Update the selectedUser's transactions based on the account type
      const updatedUser = { ...selectedUser };
      if (selectedUser.accountType === "demo") {
        updatedUser.demoAccountTransactions = [
          ...selectedUser.demoAccountTransactions,
          newTransaction,
        ];
      } else if (selectedUser.accountType === "live") {
        updatedUser.liveAccountTransactions = [
          ...selectedUser.liveAccountTransactions,
          newTransaction,
        ];
      }

      // Update the selectedUser state
      setSelectedUser(updatedUser);

      // Reset the deposit input field
      setDepositAmount("");

      // Show success notification
      notification.success({
        message: "Deposit added successfully!",
      });
    } else {
      alert("Please enter a valid deposit amount.");
    }
  };

  const handleCancel = () => {
    setIsKycModalVisible(false);
    setIsFundsModalVisible(false);
    setIsAccountRequestModalVisible(false);
    setIsSendDetailsModalVisible(false); // Close the send details modal
    setSelectedUser(null);
  };

  return (
    <div className="user-table-container">
      <h2 className="user-table-heading">User Information</h2>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        className="custom-table"
      />

      {/* KYC Modal */}
      <Modal
        title="KYC Verification"
        visible={isKycModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedUser && selectedUser.kyc ? (
          <div className="kyc-content">
            <div>
              <h3>CNIC Front</h3>
              <img
                src={selectedUser.kyc.cnicFront}
                alt="CNIC Front"
                width={200}
              />
            </div>
            <div>
              <h3>CNIC Back</h3>
              <img
                src={selectedUser.kyc.cnicBack}
                alt="CNIC Back"
                width={200}
              />
            </div>
            <div>
              <h3>Bank Details</h3>
              <p>
                <strong>Account Number:</strong>{" "}
                {selectedUser.kyc.bankDetails.accountNumber}
              </p>
              <p>
                <strong>IBAN Number:</strong>{" "}
                {selectedUser.kyc.bankDetails.ibanNumber}
              </p>
              <p>
                <strong>Holder Name:</strong>{" "}
                {selectedUser.kyc.bankDetails.holderName}
              </p>
              <p>
                <strong>Bank Name:</strong>{" "}
                {selectedUser.kyc.bankDetails.bankName}
              </p>
            </div>
            {!selectedUser.kyc.isVerified && (
              <Button type="primary" onClick={handleVerifyKYC}>
                Verify KYC
              </Button>
            )}
          </div>
        ) : (
          <p>No KYC details found for this user.</p>
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
              <h3>Deposit Images</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "16px",
                  padding: "16px",
                }}
              >
                {selectedUser.demoAccountTransactions
                  .filter(
                    (txn) => txn.type === "Deposit" && txn.images?.length > 0
                  ) // Only show transactions with images
                  .map((transaction, index) =>
                    transaction.images.map((img, imgIndex) => (
                      <div
                        key={`${index}-${imgIndex}`}
                        onClick={() => handleImageClick(img)}
                        style={{
                          cursor: "pointer",
                          position: "relative",
                          paddingBottom: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Image
                          src={img}
                          alt={`Deposit ${index + 1}-${imgIndex + 1}`}
                          style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          preview={false} // Disable default preview to handle it manually
                        />
                      </div>
                    ))
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
              <Button
                type="primary"
                onClick={handleDepositSubmit}
                style={{ marginTop: "10px" }}
              >
                Add Deposit
              </Button>
            </Tab>

            {/* Tab 3: Withdraw History */}
            <Tab key="3" tab="Withdraw History">
              <h3>Withdraw History</h3>
              <List
                dataSource={selectedUser.demoAccountTransactions.filter(
                  (txn) => txn.type === "Withdraw"
                )}
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
                        onClick={() => handlePaymentDone(transaction)}
                      >
                        {transaction.status === "completed"
                          ? "Payment Done"
                          : "Mark Payment Done"}
                      </Button>
                    </div>
                  </List.Item>
                )}
              />
            </Tab>

            {/* Tab 4: Transaction History */}
            <Tab key="4" tab="Transaction History">
              <h3>All Transactions</h3>
              <List
                dataSource={[
                  ...selectedUser.demoAccountTransactions,
                  ...selectedUser.liveAccountTransactions,
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
        title="Account Requests"
        visible={isAccountRequestModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <h3>Pending Requests</h3>
        <Table
          columns={accountRequestColumns}
          dataSource={data.filter(
            (user) => user.accountRequestStatus === "pending"
          )}
          pagination={false}
          rowKey="key"
        />

        <h3 style={{ marginTop: "20px" }}>Accepted Requests</h3>
        <Table
          columns={accountRequestColumns}
          dataSource={data.filter(
            (user) => user.accountRequestStatus === "accepted"
          )}
          pagination={false}
          rowKey="key"
        />
      </Modal>

      {/* Send Details Modal */}
      <Modal
        title="Send User Details"
        visible={isSendDetailsModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={500}
      >
        {selectedUser && (
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
        )}
      </Modal>
    </div>
  );
};

export default User;
