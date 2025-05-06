import axios from "axios";

// Hàm kiểm tra email hợp lệ
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Hàm kiểm tra mật khẩu đủ mạnh
// Yêu cầu ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
export const isStrongPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// Hàm kiểm tra tên người dùng hợp lệ
// Không chứa ký tự đặc biệt, độ dài từ 3-20 ký tự
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

// Hàm kiểm tra tuổi (phải từ 16 tuổi trở lên)
export const isValidAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const age = today.getFullYear() - birthDate.getFullYear();
  
  const monthDifference = today.getMonth() - birthDate.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 16;
  }
  
  return age >= 16;
};

export const isValidPhoneNumber = (phone) => {
  // Regex cho số điện thoại Việt Nam
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

// ktra email tồn tại
export const checkEmailExists = async (email) => {
  try {
    const response = await axios.get("http://localhost:8080/auth/email-check/"+email);
    console.log(response.data);
    if (response.data === null) {
      return false; // email không tồn tại
    }
    if(Array.isArray(response.data)) {
      return response.data.length > 0; // true nếu email tồn tại
    }
    // Nếu response.data không phải là mảng nhưng có giá trị (object hoặc primitive value)
    return !!response.data; // true nếu email tồn tại
  } catch (error) {
    console.error("Lỗi kiểm tra email:", error);
    throw error;
  }

};

// ktra username tồn tại
export const checkUsernameExists = async (username) => {
  try {
    const response = await axios.get(`http://localhost:8080/auth/username-check/${username}`);
    console.log(response.data);
    
    if (response.data === null) {
      return false; // username không tồn tại
    }
    
    if (Array.isArray(response.data)) {
      return response.data.length > 0; // true nếu username tồn tại
    }
    
    // Nếu response.data không phải là mảng nhưng có giá trị
    return !!response.data; // true nếu username tồn tại
  } catch (error) {
    console.error("Lỗi kiểm tra username:", error);
    throw error;
  }
};

// ktra số điện thoại tồn tại
export const checkPhoneExists = async (phone) => {
  try {
    const response = await axios.get(`http://localhost:8080/auth/phone-check/${phone}`);
    console.log(response.data);
    
    if (response.data === null) {
      return false; // số điện thoại không tồn tại
    }
    
    if (Array.isArray(response.data)) {
      return response.data.length > 0; // true nếu số điện thoại tồn tại
    }
    
    // Nếu response.data không phải là mảng nhưng có giá trị (object hoặc primitive value)
    return !!response.data; // true nếu số điện thoại tồn tại
  } catch (error) {
    console.error("Lỗi kiểm tra số điện thoại:", error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    // Kiểm tra các điều kiện trước khi gửi đến server
    if (!isValidEmail(userData.email)) {
      throw new Error("Email không hợp lệ");
    }
    
    if (!isValidUsername(userData.username)) {
      throw new Error("Tên đăng nhập không hợp lệ");
    }
    
    if (!isStrongPassword(userData.password)) {
      throw new Error("Mật khẩu không đủ mạnh");
    }
    
    if (userData.password !== userData.confirmPassword) {
      throw new Error("Mật khẩu xác nhận không khớp");
    }
    
    if (userData.dateOfBirth && !isValidAge(userData.dateOfBirth)) {
      throw new Error("Bạn phải đủ 16 tuổi để đăng ký");
    }
    
    if (userData.phoneNumber && !isValidPhoneNumber(userData.phoneNumber)) {
      throw new Error("Số điện thoại không hợp lệ");
    }
    const formattedDateOfBirth = userData.dateOfBirth ? userData.dateOfBirth.format('YYYY-MM-DD') : null;

    const userJson =
      {
        "fullName": userData.firstName + userData.lastName,
        "username": userData.username,
        "email": userData.email,
        "password": userData.password,
        "avatar": null,
        "phoneNumber": userData.phoneNumber,
        "dateOfBirth": formattedDateOfBirth,
        "gender": userData.gender,
        "coverPhotoURL": null,
        "sessionID": null,
        "role": "user",
        "token": "",
    };
    console.log("Sending userJson:", userJson); // Đổi console.log để rõ ràng hơn

    const response = await axios.post(
      "http://localhost:8080/users/create-user",
      userJson, // <-- Sử dụng biến userJson đã tạo
      {
        headers: {
          // Đặt Content-Type tường minh để chỉ là 'application/json'
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Trả về kết quả từ server với flag success
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // Xử lý lỗi
    if (error.response) {
      // Lỗi từ server
      throw new Error(error.response.data.message || "Đăng ký thất bại");
    } else if (error.message) {
      // Lỗi từ validate
      throw error;
    } else {
      // Lỗi khác
      throw new Error("Đã xảy ra lỗi khi đăng ký");
    }
  }
};

// Hàm xử lý gửi email xác thực
export const sendVerificationEmail = async (email) => {
  try {
    const response = await axios.post("https://your-api-endpoint.com/api/send-verification", { email });
    return response.data;
  } catch (error) {
    console.error("Lỗi gửi email xác thực:", error);
    throw error;
  }
};

// Hàm xác thực tài khoản
export const verifyAccount = async (token) => {
  try {
    const response = await axios.post("https://your-api-endpoint.com/api/verify-account", { token });
    return response.data;
  } catch (error) {
    console.error("Lỗi xác thực tài khoản:", error);
    throw error;
  }
};

// Hàm tạo mật khẩu mạnh ngẫu nhiên (để gợi ý cho người dùng)
export const generateStrongPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let password = '';

  // Đảm bảo có ít nhất 1 ký tự từ mỗi loại
  password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));

  // Thêm các ký tự ngẫu nhiên cho đủ độ dài 10
  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = 0; i < 6; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Trộn ngẫu nhiên các ký tự
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

// Export tất cả các hàm xử lý form đăng ký
export default {
  isValidEmail,
  isStrongPassword,
  isValidUsername,
  isValidAge,
  isValidPhoneNumber,
  checkEmailExists,
  checkUsernameExists,
  checkPhoneExists,
  registerUser,
  sendVerificationEmail,
  verifyAccount,
  generateStrongPassword
};