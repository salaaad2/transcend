import axios from 'axios'
import authHeader from './auth-header'



class UserService {
   async  getPublicContent() {
        return await axios.get('/all');
    }

    async getUserBoard() {
        return await axios.get('/user');
    }

    async getCurrentUser() {
        return await axios.get('/authentication/profile')
        .then(response => {
            if (response.data.username) {
                localStorage.setItem("user", JSON.stringify(response.data));
            }
                return response.data;
        });
    }
}

export default new UserService();
