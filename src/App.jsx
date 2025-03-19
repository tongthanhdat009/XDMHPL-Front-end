import { useEffect, useState } from "react";
import testAPI from "./testAPI";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    testAPI()
      .then(response => {
        setData(response);  // Lưu dữ liệu vào state
      })
      .catch(error => {
        console.error("Lỗi khi gọi API:", error);
      });
  }, []); // useEffect chỉ chạy một lần khi component mount

  return (
    <div>
      <h1>Kết quả API:</h1>
      <pre>{data ? JSON.stringify(data, null, 2) : "Đang tải..."}</pre>
    </div>
  );
}

export default App;
