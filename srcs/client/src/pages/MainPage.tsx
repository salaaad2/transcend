import './MainPage.css'
import { Redirect } from 'react-router';
import { useUser } from '../components/context/UserAuthContext';

function MainPage(props: any) {
    const { user } = useUser()!;

    if (user.id > 0)
    {
        return (<Redirect to={{ pathname: "/profile/:" + user.username, state: { from: props.location} }} />);
    }
    else
    {
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    }
}

export default MainPage;
