import React from "react";
import { Modal, Button } from "antd";
import { useNavigate } from "react-router-dom";

const ExistsAccountModal = ({ 
  isOpen, 
  onClose, 
  existingValue,
  type = "email" // Có thể là "email", "username" hoặc "phone"
}) => {
  const navigate = useNavigate();

  // Handle login navigation
  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    onClose();
    navigate("/forgot-password", { state: { 
      email: type === "email" ? existingValue : "",
      phone: type === "phone" ? existingValue : ""
    }});
  };

  // Cấu hình dựa trên loại
  let title = "Thông tin đã tồn tại";
  let message = null;

  if (type === "email") {
    title = "Email đã tồn tại";
    message = (
      <>
        <p>Email <strong>{existingValue}</strong> đã tồn tại trong hệ thống.</p>
        <p>Bạn có thể đăng nhập với tài khoản hiện có hoặc lấy lại mật khẩu nếu đã quên.</p>
      </>
    );
  } else if (type === "username") {
    title = "Tên đăng nhập đã tồn tại";
    message = (
      <>
        <p>Tên đăng nhập <strong>{existingValue}</strong> đã tồn tại trong hệ thống.</p>
        <p>Vui lòng chọn tên đăng nhập khác hoặc đăng nhập nếu đây là tài khoản của bạn.</p>
      </>
    );
  } else if (type === "phone") {
    title = "Số điện thoại đã tồn tại";
    message = (
      <>
        <p>Số điện thoại <strong>{existingValue}</strong> đã tồn tại trong hệ thống.</p>
        <p>Bạn có thể đăng nhập với tài khoản hiện có hoặc lấy lại mật khẩu nếu đã quên.</p>
      </>
    );
  }

  // Xác định nút nào hiển thị dựa trên type
  const showForgotPasswordButton = type === "email" || type === "phone";

  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="login" type="primary" onClick={handleLogin}>
          Đăng nhập
        </Button>,
        showForgotPasswordButton && (
          <Button key="forgot" onClick={handleForgotPassword}>
            Quên mật khẩu
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      {message}
    </Modal>
  );
};

export default ExistsAccountModal;