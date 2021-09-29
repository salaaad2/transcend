import axios from 'axios'

const API_URL = 'http://localhost:3000/';

class AuthService {

    async login(username: string | undefined, password: string | undefined) {
        return await axios.post(API_URL + "authentication/log-in", {
            username, password
        }, {withCredentials: true})
        .then(response => {
            return response.data;
        })
    }

    async register(username: string | undefined, password: string | undefined, avatar: string | undefined) {
        return await axios.post(API_URL + "authentication/register", {
            username, password, avatar
        })
    }
}

export default new AuthService();
