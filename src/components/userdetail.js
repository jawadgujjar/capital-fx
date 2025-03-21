import React from 'react';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import './user.css';

const UserDetails = () => {
  const { userId } = useParams(); // Fetch the userId from the URL
  const navigate = useNavigate();

  // Sample data (you can fetch real data here based on userId)
  const userData = {
    1: {
      userName: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
    },
    2: {
      userName: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
    },
    3: {
      userName: 'Mark Wilson',
      email: 'mark@example.com',
      phone: '+1122334455',
    },
  };

  const user = userData[userId];

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-details-container">
      <Button
        type="default"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/')} // Navigate back to the previous page (or to the user list)
        className="back-btn"
      >
        Back
      </Button>

      <div className="user-details">
        <h3>User Details</h3>
        <p><strong>Name:</strong> {user.userName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>
    </div>
  );
};

export default UserDetails;
