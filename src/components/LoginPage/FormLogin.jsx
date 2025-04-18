import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Checkbox, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import authService from "./LoginProcess/ValidateLogin"; // Đường dẫn đến authService của bạn
const FormLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { userIdentifier, password, remember = false } = values;
      await authService.login(userIdentifier, password, remember);
      console.log("Đăng nhập thành công: ", authService.getCurrentUser());
      // Chuyển hướng sau khi đăng nhập
      navigate("/");
    } catch (error) {
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.");
      console.error("Lỗi đăng nhập:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">Đăng nhập</h1>
            <p className="text-gray-600 mt-2">Đăng nhập vào tài khoản của bạn</p>
          </div>
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="userIdentifier"
              rules={[
                { required: true, message: "Vui lòng nhập tên tài khoản hoặc email!" }
              ]}
            >
              <Input 
                placeholder="Tên tài khoản hoặc email" 
                prefix={<UserOutlined className="text-gray-400" />}
                className="rounded-md h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" }
              ]}
            >
              <Input.Password 
                placeholder="Mật khẩu" 
                prefix={<LockOutlined className="text-gray-400" />}
                className="rounded-md h-12"
              />
            </Form.Item>

            <div className="flex justify-between items-center mb-4">
              <Form.Item 
                name="remember" 
                valuePropName="checked" 
                noStyle
              >
                <Checkbox>Nhớ tài khoản</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item>
              <button 
                type="submit" 
                className={`w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md
                  ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Xác thực thông tin...' : 'Đăng nhập'}
              </button>
            </Form.Item>
          </Form>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <div className="text-center">
            <Link 
              to="/signin" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md w-full text-center h-12 flex items-center justify-center"
            >
              Tạo tài khoản mới!
            </Link>
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>Chưa có tài khoản? <Link to="/signin" className="text-blue-600 font-medium hover:underline">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;