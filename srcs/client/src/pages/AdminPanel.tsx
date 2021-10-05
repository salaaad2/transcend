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

    function reFresh() {
        setLoading(true);
    }

    function modClient(username: string, toggle: boolean) {
        if (username === 'admin') {
            Utils.notifyErr( 'who do you think you are ? Some kind of god ?' );
            return ;
        }
        axios.post(`${process.env.REACT_APP_BASE_URL}/authentication/mod_client`,
        { username: username,
          toggle: !toggle },
        { withCredentials: true })
        .then((response) => {
            if (response.data) {
                console.log(response.data);
            }
            /* socket.emit('request_destroy_channel', { // LOG OUT USER USING SOCKETS
             *     'channel': chan,
             *     'id': user.id}); */
            setLoading(true);
            Utils.notifySuccess('successfully modded ' + username);
        })
    }

    function banClient(uname: string, toggle: boolean) {
        if (uname === 'admin') {
            Utils.notifyErr( 'cannot ban admin, he is too cool' );
            return ;
        }

        axios.post(`${process.env.REACT_APP_BASE_URL}/authentication/ban_client`,
        { username: uname,
             toggle: !toggle},
        { withCredentials: true })
        .then((response) => {
            if (response.data) {
                console.log(response.data);
            }
            if (!toggle)
            {
                socket.emit('request_logout_client',
                    uname
                );
            }
            setLoading(true);
            Utils.notifySuccess('successfully banned ' + uname);
        })
    }


	function ListEveryone(everyone: any) {
        idUser++;
        return (
                <tr key={idUser}>
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
                    <td><p>
                    {everyone.ismod ?
                     <button type="button" onClick={(e: any) =>
                        modClient(everyone.username, everyone.ismod)}
                        className="btn btn-secondary">{"unmod " + everyone.username}</button> :
                     <button type="button" onClick={(e: any) =>
                        modClient(everyone.username, everyone.ismod)}
                        className="btn btn-secondary">{"mod " + everyone.username}</button> }
                    {everyone.isbanned ?
                     <button type="button" onClick={(e: any) =>
                        banClient(everyone.username, everyone.isbanned)}
                        className="btn btn-secondary">{"Unban " + everyone.username}</button> :
                     <button type="button" onClick={(e: any) =>
                        banClient(everyone.username, everyone.isbanned)}
                        className="btn btn-secondary">{"Ban " + everyone.username}</button> }
                    </p></td>
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
        socket.emit('request_promote_client', {
            'channel': chan,
            'client': adm.value});
        setLoading(true);
        Utils.notifySuccess('succesfully set admin' + chan);
    }


    // DONE : mapping is easy-peasy, yo
    //

    function ListChannels(channels: any) {
        idChan++;
        let strid = idChan.toString();
        return (
                <tr key={idChan} >
                    <td><p>{channels.name}</p></td>
                    <td><p>{channels.clients.length}</p></td>
                    <td><Button type="button" onClick={() =>
                        deleteChan(channels.name)}
                                className="btn btn-secondary">{"delete " + channels.name}</Button></td>
                    <td>
                        <select className="adminselect" id={strid}>
                        {channels.clients.map((admin: any) => (
                            <option id={admin.value} value={admin.value}>
                            {admin}
                            </option>
                        ))}
                        </select>
                    <button type="button" onClick={(e: any) =>
                        setAdmin(document.getElementById(strid), channels.name)}
                                className="btn btn-secondary">{"set as admin " + channels.name}</button>
                    </td>
                    <td><p>{channels.owner}</p></td>
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
        axios.post(`${process.env.REACT_APP_BASE_URL}/chat/channels`,
        {username : user.username},
                   {withCredentials: true})
        .then((response) => {
            if (response.data) {
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
                    <Button type="button" onClick={reFresh}> Refresh </Button>
                    <h3 style={{padding: '12px'}} className="mb-0 text-white text-center bg-dark">Users</h3>
                    <table id="ladderList" className="table table-striped bg-dark text-white"><thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Username</th>
                            <th scope="col">Status</th>
                            <th scope="col">Victories</th>
                            <th scope="col">Defeats</th>
                            <th scope="col">Elo</th>
                            <th scope="col">Danger Zone</th>
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
                            <th scope="col">owner</th>
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
