import axios from 'axios'

const API_URL = `${process.env.REACT_APP_BASE_URL}/authentication/`

class AuthService {

    async login(username: string | undefined, password: string | undefined) {
        return await axios.post(API_URL + "log-in", {
            username, password
        }, {withCredentials: true})
        .then(response => {
            return response.data;
        })
    }

    async register(username: string | undefined, password: string | undefined, avatar: string | undefined) {
        return await axios.post(API_URL + "register", {
            username, password, avatar
        })
    }
}

export default new AuthService();
