import React, { useEffect, useState } from 'react';
import { helpdesk } from '../utils/axios'; // Assuming you have the axios instance set up for 'helpdesk'
import { Card, Button, List, Typography, Row, Col } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function Helpdesk() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // Fetch the messages from the helpdesk API
                const response = await helpdesk.get('/');  // Assuming the endpoint to fetch messages
                setMessages(response.data);
            } catch (err) {
                setError('Failed to fetch helpdesk messages');
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (messages.length === 0) return <div>No messages available.</div>;

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5' }}>
            <Title level={3} style={{ textAlign: 'center', marginBottom: '20px' }}>
                Helpdesk Messages
            </Title>

            {/* Creating two cards per row */}
            <Row gutter={16}>
                {messages.map((message, index) => (
                    <Col key={index} xs={24} sm={12} md={12} lg={12} xl={12}>
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
                                <Button
                                    type="primary"
                                    icon={<MailOutlined />}
                                    href={`mailto:${message.email}?subject=Helpdesk Query&body=Your message here...`}
                                    target="_blank"
                                    style={{
                                        borderRadius: '5px',
                                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
                                    }}
                                >
                                    Send Email
                                </Button>
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
