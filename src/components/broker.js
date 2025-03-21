import React, { useState } from 'react';
import './broker.css'; // Ensure custom CSS is imported
import { Input, Button, Modal, Form } from 'antd'; // Import Ant Design components

function Broker() {
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ibanNumber: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false); // For viewing details modal

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Save bank details (this could be used to store in a database or state management system)
  const handleSave = () => {
    // Here you can handle saving to a database or another state
    console.log('Bank details saved:', bankDetails);
    alert('Bank details saved!');
  };

  // View bank details in a modal
  const handleView = () => {
    setIsModalVisible(true);
  };

  // Close the modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="broker-container">
      <h2>Bank Account Details</h2>

      {/* Bank Details Form */}
      <div className="bank-details-form">
        <Form layout="vertical">
          <Form.Item label="Bank Account Number">
            <Input
              name="accountNumber"
              value={bankDetails.accountNumber}
              onChange={handleInputChange}
              placeholder="Enter your bank account number"
            />
          </Form.Item>

          <Form.Item label="IBAN Number">
            <Input
              name="ibanNumber"
              value={bankDetails.ibanNumber}
              onChange={handleInputChange}
              placeholder="Enter your IBAN number"
            />
          </Form.Item>

          {/* Save and View Buttons */}
          <Button type="primary" onClick={handleSave} style={{ marginRight: 10 }}>
            Save
          </Button>
          <Button type="default" onClick={handleView}>
            View
          </Button>
        </Form>
      </div>

      {/* Modal for viewing saved bank details */}
      <Modal
        title="Bank Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <div className="modal-content">
          <p><strong>Bank Account Number:</strong> {bankDetails.accountNumber}</p>
          <p><strong>IBAN Number:</strong> {bankDetails.ibanNumber}</p>
        </div>
      </Modal>
    </div>
  );
}

export default Broker;
