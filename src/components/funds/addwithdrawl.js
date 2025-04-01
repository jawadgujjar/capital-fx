import React from 'react';
import { Form, Input, Button, notification } from 'antd';
import { depdraw } from '../../utils/axios'; // Assuming this is where your axios instance is imported

function Addwithdraw({ userId }) {
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            const response = await depdraw.post('/', {
                userId: userId,
                email: values.email,
                withdraw: values.withdraw,
            });
            notification.success({
                message: 'Deposit Added Successfully',
                description: 'Your deposit request has been submitted.',
            });
            form.resetFields();
        } catch (error) {
            notification.error({
                message: 'Error',
                description: 'There was an issue submitting your deposit request.',
            });
        }
    };

    return (
        <div>
            <h3>Add Withdraw</h3>
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                    email: '',
                    deposit: '',
                }}
            >
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Withdraw Amount"
                    name="withdraw"
                    rules={[{ required: true, message: 'Please input the deposit amount!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Addwithdraw;
