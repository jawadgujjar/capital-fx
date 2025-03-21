import React, { useState } from 'react';
import { Table, Button, Space, Modal, List, Image } from 'antd';
import './user.css'; // Ensure the custom CSS is imported

const User = () => {
  // Sample data for the table
  const data = [
    {
      key: '1',
      userName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      funds: 5000, // User funds
      transactions: [ // Sample transactions for the user
        { type: 'Deposit', amount: 2000, date: '2025-03-20' },
        { type: 'Withdraw', amount: 500, date: '2025-03-19' },
        { type: 'Deposit', amount: 1000, date: '2025-03-18' },
      ],
      kyc: {
        cnicFront: 'path_to_cnic_front_image.jpg',
        cnicBack: 'path_to_cnic_back_image.jpg',
        utilityBill: 'path_to_utility_bill_image.jpg'
      }
    },
    {
      key: '2',
      userName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      funds: 3000,
      transactions: [
        { type: 'Deposit', amount: 1500, date: '2025-03-21' },
        { type: 'Withdraw', amount: 200, date: '2025-03-19' },
      ],
      kyc: {
        cnicFront: null,  // No CNIC Front image for this user
        cnicBack: 'path_to_cnic_back_image.jpg',
        utilityBill: null  // No utility bill image for this user
      }
    },
    {
      key: '3',
      userName: 'Mark Wilson',
      email: 'mark@example.com',
      phone: '+1122334455',
      funds: 10000,
      transactions: [
        { type: 'Deposit', amount: 5000, date: '2025-03-20' },
        { type: 'Withdraw', amount: 1000, date: '2025-03-18' },
      ],
      kyc: {
        cnicFront: 'path_to_cnic_front_image.jpg',
        cnicBack: 'path_to_cnic_back_image.jpg',
        utilityBill: 'path_to_utility_bill_image.jpg'
      }
    }
  ];

  // State for managing modal visibility and selected user data
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);

  // Columns for the Ant Design table
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

  // Function to handle viewing user (opens the modal and sets user data)
  const viewUser = (record) => {
    setSelectedUser(record); // Set the selected user data
    setIsModalVisible(true);  // Show the modal
  };

  // Function to handle viewing KYC verification
  const viewKYC = (record) => {
    setSelectedUser(record); // Set the selected user data
    setIsKycModalVisible(true);  // Show the KYC modal
  };

  // Function to handle closing the modals
  const handleCancel = () => {
    setIsModalVisible(false); // Close the user modal
    setIsKycModalVisible(false); // Close the KYC modal
    setSelectedUser(null); // Reset the selected user data
  };

  // Function to handle deleting user
  const deleteUser = (key) => {
    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (confirmed) {
      alert(`User with key ${key} has been deleted.`);
      // Add logic to delete the user (e.g., remove from state or API call)
    }
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
        width={700}
      >
        {selectedUser && (
          <div className="modal-content">
            <div className="user-info">
              <p><strong>Name:</strong> {selectedUser.userName}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone Number:</strong> {selectedUser.phone}</p>
              <p><strong>Funds Balance:</strong> ${selectedUser.funds}</p>
            </div>

            <div className="transaction-section">
              <h3>Transactions</h3>
              <List
                dataSource={selectedUser.transactions}
                renderItem={(transaction) => (
                  <List.Item>
                    <div>
                      <strong>{transaction.type}:</strong> ${transaction.amount} on {transaction.date}
                    </div>
                  </List.Item>
                )}
              />
            </div>
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
