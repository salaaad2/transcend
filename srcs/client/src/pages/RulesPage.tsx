import { useEffect, useState } from 'react';
import MainNavBar from '../components/layout/MainNavBar';
import Utils from "../components/utils/utils"
import axios from 'axios';
import './LadderPage.css'
import { SocketContext } from '../socket/context'
import React from 'react';
import { useUser } from '../components/context/UserAuthContext';
import { Redirect } from 'react-router';

function RulesPage(props: any) {
    return (
        <div>
        <MainNavBar/>
        <div>RULES</div>
        </div>
    )
}

export default RulesPage