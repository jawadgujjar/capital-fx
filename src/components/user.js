import React, { useState } from "react";
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
  const data = [
    {
      key: "1",
      userName: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      funds: 5000,
      accountType: "demo", // demo/live account type
      accountRequestStatus: "pending", // pending/accepted
      demoAccountTransactions: [
        { type: "Deposit", amount: 2000, date: "2025-03-20" },
        { type: "Withdraw", amount: 500, date: "2025-03-19" },
      ],
      liveAccountTransactions: [
        { type: "Deposit", amount: 1000, date: "2025-03-18" },
        { type: "Withdraw", amount: 300, date: "2025-03-17" },
      ],
      kyc: {
        cnicFront: "path_to_cnic_front_image.jpg",
        cnicBack: "path_to_cnic_back_image.jpg",
        bankDetails: {
          accountNumber: "123456789",
          ibanNumber: "GB29XABC10161234567801",
          holderName: "John Doe",
          bankName: "Bank of Example",
        },
        isVerified: false,
      },
    },
    // More user data...
  ];

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
      key: "userName"
    },
    {
      title: "Account Type",
      dataIndex: "accountType",
      key: "accountType"
    },
    {
      title: "Request Status",
      dataIndex: "accountRequestStatus",
      key: "accountRequestStatus",
      render: (status) => (
        <span style={{ color: status === 'accepted' ? 'green' : 'orange' }}>
          {status.toUpperCase()}
        </span>
      )
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

  const handleVerifyKYC = () => {
    if (selectedUser) {
      selectedUser.kyc.isVerified = true;
      setSelectedUser({ ...selectedUser });
      notification.success({ message: "KYC Verified successfully!" });
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
        image: null, // No image for new deposits
      };

      // Add the new deposit to the `newDeposits` state
      setNewDeposits([...newDeposits, newTransaction]);

      // Reset the deposit input field
      setDepositAmount("");
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
        {selectedUser && (
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
  <div style={{ 
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '16px',
    padding: '16px'
  }}>
    {selectedUser.demoAccountTransactions
      .filter(txn => txn.type === "Deposit")
      .map((transaction, index) => (
        transaction.images?.length > 0 ? (
          transaction.images.map((img, imgIndex) => (
            <div
              key={`${index}-${imgIndex}`}
              onClick={() => handleImageClick(img)}
              style={{
                cursor: 'pointer',
                position: 'relative',
                paddingBottom: '100%',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Image
                src={img}
                alt={`Deposit ${index + 1}-${imgIndex + 1}`}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                preview={false}
              />
            </div>
          ))
        ) : (
          <div
            key={index}
            style={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            No Images
          </div>
        )
      ))
    }
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
                  ...newDeposits, // Include newly added deposits
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
          dataSource={data.filter(user => user.accountRequestStatus === "pending")}
          pagination={false}
          rowKey="key"
        />

        <h3 style={{ marginTop: "20px" }}>Accepted Requests</h3>
        <Table
          columns={accountRequestColumns}
          dataSource={data.filter(user => user.accountRequestStatus === "accepted")}
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
