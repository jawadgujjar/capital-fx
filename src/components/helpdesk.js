import React, { useEffect, useState } from 'react';
import { helpdesk } from '../utils/axios'; // Axios instance
import { Card, Button, Row, Col, Typography, Popconfirm, message as AntMessage } from 'antd';
import { MailOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Helpdesk() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMessages = async () => {
        try {
            const response = await helpdesk.get('/');
            setMessages(response.data);
        } catch (err) {
            setError('Failed to fetch helpdesk messages');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleDelete = async (id) => {
        try {
            await helpdesk.delete(`/${id}`);
            setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== id));
            AntMessage.success('Message deleted successfully');
        } catch (error) {
            AntMessage.error('Failed to delete the message');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (messages.length === 0) return <div>No messages available.</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
                Helpdesk Messages
            </Title>

            <Row gutter={16}>
                {messages.map((message) => (
                    <Col key={message._id} xs={24} sm={12} md={12} lg={12} xl={12}>
                        <Card
                            title={<Text strong>{`Message from: ${message.email}`}</Text>}
                            bordered={false}
                            style={{
                                borderRadius: '10px',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                backgroundColor: '#ffffff',
                                padding: '15px',
                                marginBottom: '15px',
                            }}
                            extra={
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Button
                                        type="primary"
                                        icon={<MailOutlined />}
                                        href={`mailto:${message.email}?subject=Helpdesk Query&body=Your message here...`}
                                        target="_blank"
                                    >
                                        Send Email
                                    </Button>
                                    <Popconfirm
                                        title="Are you sure to delete this message?"
                                        onConfirm={() => handleDelete(message._id)}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            danger
                                            icon={<DeleteOutlined />}
                                        >
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                </div>
                            }
                        >
                            <Text strong style={{ display: 'block', marginBottom: '10px' }}>
                                Message:
                            </Text>
                            <p>{message.message}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
}

export default Helpdesk;
