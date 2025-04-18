import React, { useState } from "react";
import { Form, Input, DatePicker, Radio, Button, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { 
  registerUser, 
  isValidEmail, 
  isStrongPassword, 
  isValidUsername, 
  generateStrongPassword,
  checkEmailExists,
  checkUsernameExists,
  checkPhoneExists
} from "./SigninProcess/SigninValidate";
import ExistsAccountModal from "../AccountCheckNoti/ExistsAccountModal";

const SigninForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // State for account exists modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    value: "",
    type: "email" // "email", "username", or "phone"
  });

  // Gợi ý mật khẩu mạnh
  const suggestStrongPassword = () => {
    const password = generateStrongPassword();
    form.setFieldsValue({ password, confirmPassword: password });
    message.info("Đã tạo mật khẩu mạnh! Hãy lưu lại mật khẩu này.");
  };

  // Close the modal
  const closeModal = () => {
    setModalState({...modalState, isOpen: false});
  };

  // Xử lý khi form được submit
  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Kiểm tra email tồn tại
      const emailExists = await checkEmailExists(values.email);
      if (emailExists) {
        console.log("Email đã tồn tại!");
        setModalState({
          isOpen: true,
          value: values.email,
          type: "email"
        });
        setLoading(false);
        return;
      }
      
      // Kiểm tra username tồn tại
      const usernameExists = await checkUsernameExists(values.username);
      if (usernameExists) {
        console.log("Tên đăng nhập đã tồn tại!");
        setModalState({
          isOpen: true,
          value: values.username,
          type: "username"
        });
        setLoading(false);
        return;
      }
      
      // Kiểm tra số điện thoại tồn tại
      if (values.phoneNumber) {
        const phoneExists = await checkPhoneExists(values.phoneNumber);
        if (phoneExists) {
          console.log("Số điện thoại đã tồn tại!");
          setModalState({
            isOpen: true,
            value: values.phoneNumber,
            type: "phone"
          });
          setLoading(false);
          return;
        }
      }
      
      // Nếu email chưa tồn tại, tiếp tục đăng ký
      const result = await registerUser(values);
      message.success("Đăng ký thành công!" + result.message);
      
      // Chuyển hướng đến trang đăng nhập hoặc trang xác thực
      // navigate("/verification", { state: { email: values.email } });
      navigate("/login");
    } catch (error) {
      message.error(error.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg p-6" style={{maxHeight: "90vh", overflowY: "auto"}}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-black-600">Tạo tài khoản mới</h1>
        <p className="text-gray-600 text-sm mt-1">Điền thông tin để tạo tài khoản</p>
      </div>
      
      {/* Using our new ExistsAccountModal component */}
      <ExistsAccountModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        existingValue={modalState.value}
        type={modalState.type}
      />
      
      <Form
        form={form}
        name="register"
        onFinish={onFinish}
        layout="vertical"
        scrollToFirstError
        size="middle"
        className="space-y-2"
      >
        
        <div className="flex gap-2 flex-row">
          <Form.Item
            name="firstName"
            className="flex-1 mb-2"
            rules={[{ required: true, message: "Vui lòng nhập họ!" }]}
          >
            <Input 
              placeholder="Họ" 
              prefix={<UserOutlined className="text-gray-400" />}
              className="rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            className="flex-1 mb-2"
            rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
          >
            <Input 
              placeholder="Tên" 
              prefix={<UserOutlined className="text-gray-400" />}
              className="rounded-md"
            />
          </Form.Item>
        </div>

        {/* Email */}
        <Form.Item
          name="email"
          className="mb-2"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            () => ({
              validator(_, value) {
                if (!value || isValidEmail(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Email không hợp lệ!"));
              },
            }),
          ]}
        >
          <Input 
            placeholder="Email" 
            prefix={<MailOutlined className="text-gray-400" />}
            className="rounded-md"
          />
        </Form.Item>

        {/* Số điện thoại */}
        <Form.Item
          name="phoneNumber"
          className="mb-2"
          rules={[
            { required: false },
            { pattern: /(84|0[3|5|7|8|9])+([0-9]{8})\b/, message: "Số điện thoại không hợp lệ!" }
          ]}
        >
          <Input 
            placeholder="Số điện thoại" 
            prefix={<PhoneOutlined className="text-gray-400" />}
            className="rounded-md"
          />
        </Form.Item>

        {/* Tên đăng nhập */}
        <Form.Item
          name="username"
          className="mb-2"
          rules={[
            { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            () => ({
              validator(_, value) {
                if (!value || isValidUsername(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Tên đăng nhập phải có 3-20 ký tự và không chứa ký tự đặc biệt!"));
              },
            }),
          ]}
        >
          <Input 
            placeholder="Tên đăng nhập" 
            prefix={<UserOutlined className="text-gray-400" />}
            className="rounded-md"
          />
        </Form.Item>

        {/* Mật khẩu */}
        <Form.Item
          name="password"
          className="mb-2"
          extra={
            <div className="text-xs text-gray-500">
              <Button 
                type="link" 
                size="small" 
                onClick={suggestStrongPassword}
                className="p-0 h-auto text-blue-500"
              >
                Gợi ý mật khẩu mạnh
              </Button>
            </div>
          }
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu!" },
            () => ({
              validator(_, value) {
                if (!value || isStrongPassword(value)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không đủ mạnh!"));
              },
            }),
          ]}
          hasFeedback
        >
          <Input.Password 
            placeholder="Mật khẩu" 
            prefix={<LockOutlined className="text-gray-400" />}
            className="rounded-md"
          />
        </Form.Item>

        {/* Xác nhận mật khẩu */}
        <Form.Item
          name="confirmPassword"
          className="mb-2"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password 
            placeholder="Xác nhận mật khẩu" 
            prefix={<LockOutlined className="text-gray-400" />}
            className="rounded-md"
          />
        </Form.Item>

        <div className="flex gap-2 md:flex-row flex-col">
          {/* Ngày sinh */}
          <Form.Item
            name="dateOfBirth"
            label={<span className="text-gray-700 text-sm">Ngày sinh</span>}
            className="flex-1 mb-2"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sinh!" },
              () => ({
                validator(_, value) {
                  if (!value || value.isValid === false) {
                    return Promise.resolve();
                  }
                  
                  const today = new Date();
                  const birthDate = new Date(value);
                  const age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    if (age - 1 < 16) {
                      return Promise.reject(new Error("Bạn phải đủ 16 tuổi!"));
                    }
                  } else if (age < 16) {
                    return Promise.reject(new Error("Bạn phải đủ 16 tuổi!"));
                  }
                  
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker 
              className="w-full rounded-md" 
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          {/* Giới tính */}
          <Form.Item
            name="gender"
            label={<span className="text-gray-700 text-sm">Giới tính</span>}
            className="flex-1 mb-2"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Radio.Group>
              <div className="flex gap-2">
                <Radio value="Nữ">Nữ</Radio>
                <Radio value="Nam">Nam</Radio>
                <Radio value="other">Khác</Radio>
              </div>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* Điều khoản và điều kiện */}
        <Form.Item
          name="agreement"
          valuePropName="checked"
          className="mb-2"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error("Bạn phải đồng ý với điều khoản!")),
            },
          ]}
        >
          <div className="text-xs text-gray-500">
            <input type="checkbox" className="mr-1" />
            Bằng cách đăng ký, bạn đồng ý với 
            <a href="/terms" className="text-blue-600 mx-1">Điều khoản</a>
            và
            <a href="/privacy" className="text-blue-600 mx-1">Chính sách bảo mật</a>
          </div>
        </Form.Item>

        {/* Nút đăng ký */}
        <Form.Item className="mb-2">
          <button 
            type="submit" 
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md
              ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </Form.Item>
      </Form>
      <div className="flex items-center my-3">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="px-3 text-gray-500 text-xs">HOẶC</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>
      <button
        type="button"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md"
        onClick={() => navigate("/login")}
      >
        Đăng nhập
      </button>
    </div>
  );
};

export default SigninForm;