import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import MainNavBar from "../components/layout/MainNavBar";
import authHeader from "../services/auth-header";
import Utils from "../components/utils/utils"
import './ProfileDetailPage.css'
import orImage from '../media/images/or.png'
import argentImage from '../media/images/argent.png'
import bronzeImage from '../media/images/bronze.png'
import { SocketContext } from '../socket/context'
import React from "react";
import { defaultUser, useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router';
import { Button, Form } from "react-bootstrap";
import Avatars from "@dicebear/avatars";

import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

function AdminPanel(props: any) {
    const [Error, setError] = useState(0);
    const [isLoading, setLoading] = useState(false);
    const [Everyone, setEveryone] = useState([]);
    const [Channels, setChannels] = useState([]);
    let idUser: number = 0;
    let idChan: number = 0;
    const socket = React.useContext(SocketContext);
    const { user } = useUser()!;

	function ListEveryone(everyone: any) {
        idUser++;
        return (
                <tr key={idUser} id={idUser === 1 ? "gold" : idUser === 2 ? "silver" : idUser === 3 ? "bronze" : ""}>
                    <th scope='row'>
                        <p>{idUser}</p>
                    </th>
                    <td>
                        <img src={everyone.avatar} alt="avatar" width="30" height="30"/>
                        <a href={'#profile/:' + everyone.username}>{everyone.username}</a>
                    </td>
                    <td><p>{everyone.status}</p></td>
                    <td><p>{everyone.wins}</p></td>
                    <td><p>{everyone.losses}</p></td>
                    <td><p>{everyone.elo}</p></td>
                </tr>
        )
    }

    function deleteChan(chan: string) {
        console.log('trying to delete chan : ' + chan);
        if (chan === 'General') {
            Utils.notifyErr('cannot delete general');
            return ;
        }
        axios.post(`${process.env.REACT_APP_BASE_URL}/chat/deletechan`,
        { channel: chan },
        { withCredentials: true })
        .then((response) => {
            if (response.data) {
                console.log(response.data);
            }
            socket.emit('request_destroy_channel', {
                'channel': chan,
                'id': user.id});
            setLoading(true);
            Utils.notifySuccess('successfully deleted channel ' + chan);
        })
    }

    function setAdmin(adm: any, chan: string) {
        console.log(adm.innerText);
        console.log('adm : ' + adm.innerText + 'chan : ' + chan);
            socket.emit('request_promote_client', {
                        'channel': adm.innerText,
                        'admin': adm,
                }
            );
            setLoading(true);
            Utils.notifySuccess('succesfully set admin' + chan);
    }

    // TODO: use .length like a normal human,
    // instead of this disgusting workaround
    // TODO: updateDOmElement before mapping users, yo
    // isLoading ?





    function ListChannels(channels: any) {
        idChan++;
        return (
                <tr key={idChan} >
                    <td><p>{channels.name}</p></td>
                    <td><p>{channels.clients.length}</p></td>
                    <td><Button type="button" onClick={() =>
                        deleteChan(channels.name)}
                                className="btn btn-secondary">{"delete " + channels.name}</Button></td>
                    <div className="adminselect" id="divadminselect">
                    <td>
                        <select id="adminselect">
                        {channels.clients.map((admin: any) => (
                            <option id={admin.value} value={admin.value}>
                            {admin}
                            </option>
                        ))}
                        </select>
                    <button type="button" onClick={(e: any) =>
                        setAdmin(document.getElementById('adminselect'), channels.name)}
                                className="btn btn-secondary">{"set as admin " + channels.name}</button>
                    </td>
                    </div>
                    <td><p>{channels.admin}</p></td>
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
    }, [isLoading, socket, user.username, props, user.id])

    useEffect(() => {
        if (user.id > 0)
            socket.emit('login', user.username);
        Utils.intercept401(props);
        console.log('on page : ' + user.username);
        axios.post(`${process.env.REACT_APP_BASE_URL}/chat/channels`,
        {username : user.username},
                   {withCredentials: true})
        .then((response) => {
            if (response.data) {
                console.log('channels : ');
                console.log(response.data);
                setChannels(response.data);
                setLoading(false);
            }
        })

    }, [isLoading, socket, user.username, props, user.id])

    if (Error === 401) {
        console.log('you are not admin') ;
        return(<div/>)
    }
    else if (isLoading){
        return (<MainNavBar />)
    }
    else if (user.id > 0){
        console.log('you are admin') ;
        return (
            <div>
                <MainNavBar />
                <div className="px-4 py-3 mt-2">
                    <h3 style={{padding: '12px'}} className="mb-0 text-white text-center bg-dark">Users</h3>
                    <table id="ladderList" className="table table-striped bg-dark text-white"><thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            <th scope="col">Status</th>
                            <th scope="col">Victories</th>
                            <th scope="col">Defeats</th>
                            <th scope="col">Elo</th>
                        </tr>
                        {Everyone.map((listvalue) => {
                            return (ListEveryone(listvalue))
                        })}
                    </thead></table>
                </div>
                <div>
                    <h3 style={{padding: '12px'}} className="mb-0 text-white text-center bg-dark">Channels</h3>
                    <table id="chanlist" className="table table-striped bg-dark text-white">
                        <thead>
                            <tr>
                            <th scope="col">name</th>
                            <th scope="col">n of users</th>
                            <th scope="col">delete</th>
                            <th scope="col">set admin</th>
                            <th scope="col">current admin</th>
                            </tr>
                            {Channels.map((listvalue) => {
                                return (ListChannels(listvalue));
                            })}
                        </thead>
                    </table>
                </div>
            </div>
        );
    }
    else {
        return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
    }
}

export default AdminPanel;
