import axios from 'axios'

class AuthService {

    async login(username: string | undefined, password: string | undefined) {
        return await axios.post("/authentication/log-in", {
            username, password
        }, {withCredentials: true})
        .then(response => {
            return response.data;
        })
    }

    async register(username: string | undefined, password: string | undefined, avatar: string | undefined) {
        return await axios.post("/authentication/register", {
            username, password, avatar
        })
    }
}

export default new AuthService();
