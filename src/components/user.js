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
  message,
  Form,
  Input,
  InputNumber,
  Select,
  Row,
  Col
} from "antd";
import {
  UserOutlined,
  MoneyCollectOutlined,
  IdcardOutlined,
  CheckOutlined,
  CloseOutlined,
  MailOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
  FilterOutlined
} from "@ant-design/icons";
import { users, kyc, account } from "../utils/axios";
import Transactions from "./transactions";
import "./user.css";

const { Option } = Select;

const User = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isKycModalVisible, setIsKycModalVisible] = useState(false);
  const [isAccountModalVisible, setIsAccountModalVisible] = useState(false);
  const [isTransactionsModalVisible, setIsTransactionsModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isCreateAccountModalVisible, setIsCreateAccountModalVisible] = useState(false);
  const [selectedUserKyc, setSelectedUserKyc] = useState(null);
  const [accountRequests, setAccountRequests] = useState([]);
  const [allAccountRequests, setAllAccountRequests] = useState([]);
  const [accountRequestsLoading, setAccountRequestsLoading] = useState(false);
  const [emailForm] = Form.useForm();
  const [accountForm] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [kycFilter, setKycFilter] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3000,
    total: 0,
  });

  // Filter data based on search text and KYC status
  useEffect(() => {
    let filtered = [...data];

    // Apply email search filter
    if (searchText) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply KYC status filter
    if (kycFilter) {
      if (kycFilter === 'pending') {
        filtered = filtered.filter(user =>
          user.kyc && user.kyc.status === 'pending'  // Only users with actual pending KYC
        );
      } else if (kycFilter === 'not_submitted') {
        filtered = filtered.filter(user =>
          !user.kyc  // Only users with no KYC submission
        );
      } else {
        filtered = filtered.filter(user =>
          user.kyc && user.kyc.status === kycFilter
        );
      }
    }

    setFilteredData(filtered);
  }, [searchText, kycFilter, data]);

  // Fetch all users data and account requests with pagination
  const fetchData = async (page = 1, pageSize = "all") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const [usersResponse, accountsResponse] = await Promise.all([
        users.get("/", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page,
            limit: pageSize
          }
        }),
        account.get("/", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setAllAccountRequests(accountsResponse.data || []);

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
                kycStatus: kycResponse.data?.status || "not_submitted"
              };
            } catch (error) {
              return {
                ...user,
                id: user.id,
                userName: user.name || "User",
                email: user.email || "No email",
                kyc: null,
                kycStatus: "not_submitted"
              };
            }
          })
      );

      setData(regularUsers);
      setFilteredData(regularUsers);
      setPagination({
        ...pagination,
        current: page,
        pageSize,
        total: usersResponse.data.total || 0,
      });
    } catch (error) {
      message.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  // Handle table pagination change
  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
    setPagination(pagination);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchText("");
    setKycFilter(null);
  };

  // Email functionality
  const handleSendEmail = (record) => {
    setSelectedUserId(record.id);
    emailForm.setFieldsValue({
      name: record.name,
      email: record.email,
      username: record.username || "",
      mainPassword: "",
      investPassword: ""
    });
    setIsEmailModalVisible(true);
  };

  const sendAccountDetailsEmail = async (values) => {
    try {
      const token = localStorage.getItem("token");
      const emailContent = `Dear ${values.name},\n\nYour Real VFX Account Details as follow.\n\nReal Account Details\nName: ${values.name}\nUsername: ${values.username}\nMain Password: ${values.mainPassword}\nInvest Password: ${values.investPassword}\n\nKindest Regards,\nAljadeed Capitals FX Customer Service`;

      await account.post('/send-account-email', {
        to: values.email,
        subject: "Your Real VFX Account Details",
        text: emailContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success("Email sent successfully");
      setIsEmailModalVisible(false);
    } catch (error) {
      message.error("Failed to send email");
      console.error(error);
    }
  };

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

  const updateKycStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await kyc.patch(
        `/${selectedUserId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData(data.map(user =>
        user.id === selectedUserId
          ? { ...user, kyc: { ...user.kyc, status: newStatus } }
          : user
      ));

      setSelectedUserKyc({ ...selectedUserKyc, status: newStatus });
      message.success(`KYC ${newStatus === "verified" ? "verified" : "rejected"} successfully`);
    } catch (error) {
      message.error(`Failed to ${newStatus === "verified" ? "verify" : "reject"} KYC`);
    }
  };

  // Account Request Actions
  const handleAccountRequest = (userId) => {
    setSelectedUserId(userId);
    setAccountRequestsLoading(true);

    const userAccountRequests = allAccountRequests.filter(request => {
      const requestUserId = request.userId?.toString().trim();
      const currentUserId = userId?.toString().trim();
      return requestUserId === currentUserId;
    });

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

  // Create Real Account Manually
  const handleCreateRealAccount = () => {
    accountForm.resetFields();
    setIsCreateAccountModalVisible(true);
  };

  const submitCreateAccount = async (values) => {
    try {
      const token = localStorage.getItem("token");
      await account.post(
        "/",
        {
          userId: selectedUserId,
          accountType: "real",
          status: "verified",
          accCreated: "done",
          ...values
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh account requests
      const response = await account.get("/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllAccountRequests(response.data || []);

      const userAccountRequests = response.data.filter(request =>
        request.userId?.toString() === selectedUserId?.toString()
      );
      setAccountRequests(userAccountRequests);

      message.success("Real account created successfully");
      setIsCreateAccountModalVisible(false);
    } catch (error) {
      message.error("Failed to create real account");
      console.error(error);
    }
  };

  // Funds action
  const handleFundsAction = (userId) => {
    setSelectedUserId(userId);
    setIsTransactionsModalVisible(true);
    message.info(`Showing transactions for user ID: ${userId}`);
  };

  const handleDeleteKyc = async () => {
    try {
      const token = localStorage.getItem("token");
      await kyc.delete(`/${selectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(data.filter(user => user.id !== selectedUserId));
      setSelectedUserKyc(null);
      message.success("KYC deleted successfully");
      window.location.reload();
    } catch (error) {
      message.error("Failed to delete KYC");
    }
  };

  const handleAccountDelete = async (record) => {
    try {
      const token = localStorage.getItem("token");
      console.log(record)
      await users.delete(`/${record}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setData(data.filter(user => user.id !== record));
      message.success("User account deleted successfully");
      window.location.reload();
    } catch (error) {
      console.error("Account delete error:", error);
      message.error("Failed to delete user account");
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
          <Button
            icon={<MailOutlined />}
            onClick={() => handleSendEmail(record)}
          >
            Email
          </Button>
          <Button
            onClick={() => handleAccountDelete(record.id)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management-container">
      <Card
        title="User Management"
        bordered={false}
        extra={
          <Row gutter={16} align="middle">
            <Col>
              <Input
                placeholder="Search by email"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </Col>
            <Col>
              <Select
                placeholder="Filter by KYC status"
                value={kycFilter}
                onChange={setKycFilter}
                style={{ width: 200 }}
                allowClear
              >
                <Option value="verified">Verified</Option>
                <Option value="pending">Pending</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="not_submitted">Not Submitted</Option>
              </Select>
            </Col>
            <Col>
              <Button
                icon={<FilterOutlined />}
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`
          }}
          onChange={handleTableChange}
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
              <>
                <Button
                  type="primary"
                  onClick={() => updateKycStatus("verified")}
                  icon={<CheckOutlined />}
                  style={{ marginTop: 16, marginRight: 8 }}
                >
                  Verify KYC
                </Button>
                <Button
                  type="default"
                  danger
                  onClick={() => updateKycStatus("rejected")}
                  icon={<DeleteOutlined />}
                  style={{ marginTop: 16, marginRight: 8 }}
                >
                  Reject KYC
                </Button>
              </>
            )}

            <Button
              type="text"
              danger
              onClick={handleDeleteKyc}
              icon={<DeleteOutlined />}
              style={{ marginTop: 16 }}
            >
              Delete KYC
            </Button>
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
        footer={[
          <Button
            key="create"
            type="primary"
            onClick={handleCreateRealAccount}
            icon={<PlusOutlined />}
          >
            Create Real Account
          </Button>
        ]}
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

      {/* Create Account Modal */}
      <Modal
        title="Create Real Account"
        visible={isCreateAccountModalVisible}
        onCancel={() => setIsCreateAccountModalVisible(false)}
        onOk={() => accountForm.submit()}
        okText="Create Account"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={accountForm}
          layout="vertical"
          onFinish={submitCreateAccount}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: 'Please input email!', type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Account Type"
            name="accountType"
            initialValue="real"
          >
            <Select disabled>
              <Option value="real">Real Account</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Initial Amount ($)"
            name="amount"
            rules={[{ required: true, message: 'Please input amount!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please input phone number!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Country"
            name="country"
            rules={[{ required: true, message: 'Please input country!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Status"
            name="status"
            initialValue="verified"
          >
            <Select disabled>
              <Option value="verified">Verified</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Transactions Modal */}
      <Modal
        title={`Transactions for User ${selectedUserId}`}
        visible={isTransactionsModalVisible}
        onCancel={() => setIsTransactionsModalVisible(false)}
        footer={null}
        width={1000}
      >
        <Transactions userId={selectedUserId} />
      </Modal>

      {/* Email Modal */}
      <Modal
        title="Send Account Details"
        visible={isEmailModalVisible}
        onCancel={() => setIsEmailModalVisible(false)}
        onOk={() => emailForm.submit()}
        okText="Send Email"
        cancelText="Cancel"
        width={600}
      >
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={sendAccountDetailsEmail}
        >
          <Form.Item
            label="Recipient Email"
            name="email"
            rules={[{ required: true, message: 'Please input recipient email!', type: 'email' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please input name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please input username!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Main Password"
            name="mainPassword"
            rules={[{ required: true, message: 'Please input main password!' }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Invest Password"
            name="investPassword"
            rules={[{ required: true, message: 'Please input invest password!' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;