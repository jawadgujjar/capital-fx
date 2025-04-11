import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { depdraw } from "../../utils/axios";

function Addwithdraw({ userId }) {
  const [form] = Form.useForm();
  const [successMessage, setSuccessMessage] = useState("");

  const onFinish = async (values) => {
    try {
      const response = await depdraw.post("/", {
        userId: userId,
        email: values.email,
        withdraw: values.withdraw,
      });

      if (response.status === 201) {
        setSuccessMessage("💸 Withdrawed submitted successfully!");
        form.resetFields();

        // Optional: hide message after 3s
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setSuccessMessage("❌ Something went wrong. Please try again.");
      }
    } catch (error) {
      setSuccessMessage(
        "❌ There was an issue submitting your withdraw request."
      );
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
          email: "",
          withdraw: "",
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
          label="Withdraw Amount"
          name="withdraw"
          rules={[
            { required: true, message: "Please input the withdraw amount!" },
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

export default Addwithdraw;
