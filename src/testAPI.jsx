import axios from 'axios';
function testAPI() {
    return axios.get('http://localhost:8080/users')
    .then(response => {
      console.log('Dữ liệu nhận được:', response.data);
      return response.data;
    })
    .catch(error => {
      console.error('Lỗi khi lấy dữ liệu:', error);
      throw error;
    });
}
export default testAPI;