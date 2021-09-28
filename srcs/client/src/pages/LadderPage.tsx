import { useEffect, useState } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import Utils from "../components/utils/utils"
import axios from 'axios';
import './LadderPage.css'
import { SocketContext } from '../socket/context'
import React from 'react';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router';

function LadderPage(props: any): any {

    const [isLoading, setLoading] = useState(true);
    const [Everyone, setEveryone] = useState([]);
    var idTab = 0;
    const socket = React.useContext(SocketContext);
    const { user } = useUser()!;

	function ListEveryone(everyone: any) {
        idTab++;
        return (
                <tr key={idTab} id={idTab === 1 ? "gold" : idTab === 2 ? "silver" : idTab === 3 ? "bronze" : ""}>
                    <th scope='row'>
                        <p>{idTab}</p>
                    </th>
                    <td>
                        <img src={everyone.avatar} alt="avatar" width="30" height="30"/>
                        <a href={'#profile/:' + everyone.username}>{everyone.username}</a>
                    </td>
                    <td><p>{everyone.wins}</p></td>
                    <td><p>{everyone.losses}</p></td>
                    <td><p>{everyone.elo}</p></td>
                </tr>
        )
    }

    useEffect(() => {
        if (user.id > 0)
            socket.emit('login', user.username);
        Utils.intercept401(props);
        axios.get(`${process.env.REACT_APP_BASE_URL}/authentication/all`,
        { withCredentials: true})
        .then((response) => {
            if (response.data) {
                setEveryone(response.data);
                setLoading(false)
            }
        })
    }, [isLoading])

    if (user.id > 0) {
        if (isLoading)
            return (
                <div>
                    <MainNavBar />
                </div>)
        else
        return (
            <div>
                <MainNavBar />
                <div className="px-4 py-3 mt-2">
                    <h3 style={{padding: '12px'}} className="mb-0 text-white text-center bg-dark">Ladder</h3>
                    <table id="ladderList" className="table table-striped bg-dark text-white"><thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            <th scope="col">Victories</th>
                            <th scope="col">Defeats</th>
                            <th scope="col">Elo</th>
                        </tr>                        
                        {Everyone.map((listvalue) => {
                            return (ListEveryone(listvalue))
                        })}
                    </thead></table>
                </div>
            </div>
        )
    }
    else
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
}

export default LadderPage;
