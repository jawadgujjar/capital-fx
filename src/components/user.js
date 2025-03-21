import React, { useState } from 'react';
import { Table, Button, Space, Modal, List, Image, Tabs, Input, Select, Form } from 'antd';
import './user.css'; // Ensure the custom CSS is imported

const { TabPane } = Tabs;

const User = () => {
  // Sample data for the table
  const data = [
    {
      key: '1',
      userName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      funds: 5000,
      demoAccountTransactions: [ // Demo Account transactions
        { type: 'Deposit', amount: 2000, date: '2025-03-20' },
        { type: 'Withdraw', amount: 500, date: '2025-03-19' },
      ],
      liveAccountTransactions: [ // Live Account transactions
        { type: 'Deposit', amount: 1000, date: '2025-03-18' },
        { type: 'Withdraw', amount: 300, date: '2025-03-17' },
      ],
      kyc: {
        cnicFront: 'path_to_cnic_front_image.jpg',
        cnicBack: 'path_to_cnic_back_image.jpg',
        utilityBill: 'path_to_utility_bill_image.jpg',
      },
    },
    // More user data...
  ];

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [transactionType, setTransactionType] = useState('deposit');
  const [accountType, setAccountType] = useState('demo'); // 'demo' or 'live'
  const [amount, setAmount] = useState(0);

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'userName',
      key: 'userName',
      width: '30%',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '35%',
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone',
      width: '20%',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => viewUser(record)}>
            View User
          </Button>
          <Button type="danger" onClick={() => deleteUser(record.key)}>
            Delete User
          </Button>
          <Button type="default" onClick={() => viewKYC(record)}>
            View KYC Verification
          </Button>
        </Space>
      ),
      width: '25%',
    },
  ];

  const viewUser = (record) => {
    setSelectedUser(record);
    setIsModalVisible(true);
  };

  const viewKYC = (record) => {
    setSelectedUser(record);
    setIsKycModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsKycModalVisible(false);
    setSelectedUser(null);
    setAmount(0);
  };

  const deleteUser = (key) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      alert(`User with key ${key} has been deleted.`);
    }
  };

  const handleTransaction = () => {
    if (amount <= 0) {
      alert('Amount must be greater than zero!');
      return;
    }

    const newTransaction = {
      type: transactionType.charAt(0).toUpperCase() + transactionType.slice(1), // Capitalizing the first letter
      amount: amount,
      date: new Date().toLocaleDateString(),
    };

    if (accountType === 'demo') {
      selectedUser.demoAccountTransactions.push(newTransaction);
    } else {
      selectedUser.liveAccountTransactions.push(newTransaction);
    }

    // Update the user state to trigger re-render
    setSelectedUser({ ...selectedUser });

    // Close the modal and reset form
    setAmount(0);
    setIsModalVisible(false);
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

      {/* Modal for viewing user details */}
      <Modal
        title="User Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
      >
        {selectedUser && (
          <div className="modal-content">
            {/* User Info */}
            <div className="user-info">
              <p><strong>Name:</strong> {selectedUser.userName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone Number:</strong> {selectedUser.phone}</p>
              <p><strong>Funds Balance:</strong> ${selectedUser.funds}</p>
            </div>

            {/* Deposit/Withdraw Form */}
            <div className="transaction-form">
              <Form layout="inline">
                <Form.Item label="Amount">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </Form.Item>
                <Form.Item label="Account Type">
                  <Select
                    value={accountType}
                    onChange={(value) => setAccountType(value)}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="demo">Demo Account</Select.Option>
                    <Select.Option value="live">Live Account</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item label="Transaction Type">
                  <Select
                    value={transactionType}
                    onChange={(value) => setTransactionType(value)}
                    style={{ width: 120 }}
                  >
                    <Select.Option value="deposit">Deposit</Select.Option>
                    <Select.Option value="withdraw">Withdraw</Select.Option>
                  </Select>
                </Form.Item>
              </Form>

              <Button type="primary" onClick={handleTransaction} style={{ marginTop: 10 }}>
                Execute Transaction
              </Button>
            </div>

            {/* Tabs for demo and live account transactions */}
            <Tabs defaultActiveKey="1" style={{ marginTop: '20px' }}>
              <TabPane tab="Demo Account" key="1">
                <h3>Transaction History</h3>
                <List
                  dataSource={selectedUser.demoAccountTransactions}
                  renderItem={(transaction) => (
                    <List.Item>
                      <div>
                        <strong>{transaction.type}:</strong> ${transaction.amount} on {transaction.date}
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>

              <TabPane tab="Live Account" key="2">
                <h3>Transaction History</h3>
                <List
                  dataSource={selectedUser.liveAccountTransactions}
                  renderItem={(transaction) => (
                    <List.Item>
                      <div>
                        <strong>{transaction.type}:</strong> ${transaction.amount} on {transaction.date}
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>

      {/* Modal for viewing KYC details */}
      <Modal
        title="KYC Verification"
        visible={isKycModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={700}
      >
        {selectedUser && (
          <div className="kyc-content">
            <div className="kyc-document">
              <h3>CNIC Front</h3>
              {selectedUser.kyc.cnicFront ? (
                <Image src={selectedUser.kyc.cnicFront} alt="CNIC Front" width={300} />
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div className="kyc-document">
              <h3>CNIC Back</h3>
              {selectedUser.kyc.cnicBack ? (
                <Image src={selectedUser.kyc.cnicBack} alt="CNIC Back" width={300} />
              ) : (
                <p>No data available</p>
              )}
            </div>
            <div className="kyc-document">
              <h3>Utility Bill</h3>
              {selectedUser.kyc.utilityBill ? (
                <Image src={selectedUser.kyc.utilityBill} alt="Utility Bill" width={300} />
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default User;
