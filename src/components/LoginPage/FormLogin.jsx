import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Checkbox } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import authService from "./LoginProcess/ValidateLogin"; // Đường dẫn đến authService của bạn

const FormLogin = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // State để lưu trữ thông báo lỗi
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setErrorMessage(""); // Reset thông báo lỗi trước khi thử đăng nhập

    try {
      const { userIdentifier, password, remember = false } = values;
      const result = await authService.login(userIdentifier, password, remember);

      if (result.success) {
        navigate("/");
      } else {
        // Hiển thị thông báo lỗi nếu đăng nhập thất bại
        setErrorMessage(result.error.message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập: ", error);
      setErrorMessage("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
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

            {/* Hiển thị thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="text-red-600 text-center mb-4 font-medium">
                {errorMessage}
              </div>
            )}

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