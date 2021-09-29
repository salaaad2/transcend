import axios from 'axios'
import authHeader from './auth-header'


const API_URL = 'http://localhost:3000/'

class UserService {
   async  getPublicContent() {
        return await axios.get(API_URL + 'all');
    }

    async getUserBoard() {
        return await axios.get(API_URL + 'user');
    }

    async getCurrentUser() {
        return await axios.get(API_URL + 'authentication/profile')
        .then(response => {
            if (response.data.username) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
                return response.data;
        });
    }
}

export default new UserService();
