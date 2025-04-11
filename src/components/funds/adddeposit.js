import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { depdraw } from "../../utils/axios";

function Adddeposit({ userId }) {
  const [form] = Form.useForm();
  const [successMessage, setSuccessMessage] = useState("");

  const onFinish = async (values) => {
    try {
      const response = await depdraw.post("/", {
        userId: userId,
        email: values.email,
        deposit: values.deposit,
      });

      if (response.status === 201) {
        setSuccessMessage("💰 Deposit added successfully!");
        form.resetFields();

        // Auto hide message after 3 seconds (optional)
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("❌ Something went wrong. Try again!");
      }
    } catch (error) {
      setSuccessMessage("❌ There was an error submitting your deposit.");
    }
  };

  return (
    <div>
      <h3>Add Deposit</h3>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{
          email: "",
          deposit: "",
        }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Deposit Amount"
          name="deposit"
          rules={[
            { required: true, message: "Please input the deposit amount!" },
          ]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

      {/* Message Area */}
      {successMessage && (
        <div
          style={{
            marginTop: 10,
            color: successMessage.includes("successfully") ? "green" : "red",
          }}
        >
          {successMessage}
        </div>
      )}
    </div>
  );
}

export default Adddeposit;
