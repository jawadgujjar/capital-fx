import React, { useState } from "react";
import { Form, Input, Button, Card, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { signup } from "../utils/axios"; // Assuming this is your API call
import { useAuth } from "../contextapi"; // Correctly using Auth Context
import { ToastContainer, toast } from "react-toastify";
import "./signup.css"; // Import CSS file

const { Title, Text } = Typography;

const SignupPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth(); // Get loginUser from context
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("Form values: ", values);

    try {
      setLoading(true);
      // Send request to API for signup
      const response = await signup.post("/register", {
        ...values,
        role: "admin", // Add the role as 'admin'
      });

      // Assuming the response contains a token
      loginUser(response.data.token); // Store the token in context
      toast.success("Signup successful!"); // Display success message
      navigate("/"); // Redirect to the home page (or dashboard)
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed!"); // Handle errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Card className="signup-card">
        <Title level={2} className="signup-title">
          Sign Up
        </Title>
        <Form layout="vertical" onFinish={onFinish}>
          {/* Name */}
          <Form.Item
            label={<Text className="signup-label">Name</Text>}
            name="name"
            rules={[{ required: true, message: "Please enter your name!" }]}
          >
            <Input placeholder="Enter your name" className="signup-input" />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label={<Text className="signup-label">Email</Text>}
            name="email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Enter a valid email!",
              },
            ]}
          >
            <Input placeholder="Enter your email" className="signup-input" />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label={<Text className="signup-label">Password</Text>}
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="signup-input"
            />
          </Form.Item>

          {/* Country Input (Manual Entry) */}
          <Form.Item
            label={<Text className="signup-label">Country</Text>}
            name="country"
            rules={[{ required: true, message: "Please enter your country!" }]}
          >
            <Input placeholder="Enter your country" className="signup-input" />
          </Form.Item>

          {/* Phone Number Input (Manual Entry) */}
          <Form.Item
            label={<Text className="signup-label">Phone Number</Text>}
            name="phonenumber"
            rules={[
              { required: true, message: "Please enter your phone number!" },
              {
                pattern: /^\d{11}$/,
                message: "Phone number must be exactly 11 digits!",
              },
            ]}
          >
            <Input
              placeholder="Enter your phone number"
              className="signup-input"
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="signup-button"
              loading={loading}
            >
              Sign Up
            </Button>
          </Form.Item>
        </Form>

        {/* Login Link */}
        <div className="login-text">
          <Text>
            {" "}
            <p style={{ color: "white" }}>Already have an account?</p>{" "}
            <span className="login-link" onClick={() => navigate("/login")}>
              Login
            </span>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;
