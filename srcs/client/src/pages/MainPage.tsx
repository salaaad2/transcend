import './MainPage.css'
import { Redirect } from 'react-router';
import { useUser } from '../components/context/UserAuthContext';
import axios from 'axios';
function MainPage(props: any) {
    const { user, setUser } = useUser()!;

    async function getUser() {
        await axios.get('/authentication/logged')
                   .then((res) => {
                       const newuser = res.data;
                       console.log(newuser);
                       setUser(res.data);
                       return (<Redirect to={{ pathname: "/profile/:" + res.data.username, state: { from: props.location} }} />);
                   })
                   .catch(() => {});
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    }

    if (user.id > 0)
    {
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
    }
    else
    {
        return(<div>{getUser}</div>)
    }
}

export default MainPage;
