import './App.css';
import {
  Route,
  HashRouter,
} from "react-router-dom";
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ChatPage from './pages/ChatPage2';
import Logout from './pages/Logout';
import GameLobby from './pages/GameLobby';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfileDetailPage';
import LadderPage from './pages/LadderPage';
import SpectatorPage from './pages/SpectatorPage';
import OtpPage from './pages/OtpPage';
import OtpLoginPage from './pages/OtpLoginPage';
import RulesPage from './pages/RulesPage'
import React, { useEffect } from 'react';
import { SocketContext } from './socket/context';
import { useUser } from './components/context/UserAuthContext';
import Utils from './components/utils/utils';
function App() {

  // const socket = React.useContext(SocketContext);
  // const { user, setUser } = useUser()!;

  require('dotenv').config();

  // useEffect(() => {
  //   console.log('info');
  //   socket.on('notifications', (data: string) => {
  //     console.log('data');
  //     if (data) {
  //       if (data[0] == 'friendrequest') {
  //         console.log(data);
  //         Utils.notifyInfo(data[1]);
  //       }
  //       else if (data[0] == 'accept_friend') {
  //         console.log(data);
  //         Utils.notifyInfo(data[1] + 'accepted you as friend');
  //         user.friendlist.push(data[1]);
  //         setUser(user);
  //       }
  //     }
  //   })
  // }, [])

  return(
      <HashRouter>
        <div className="content">
          <Route exact path="/profile/:username" component={ProfilePage}/>
          <Route exact path="/profile/:username/otp" component={OtpPage}/>
          <Route path="/ladder" component={LadderPage}/>
          <Route path="/login" component={LoginPage}/>
          <Route path="/otp-login" component={OtpLoginPage}/>
          <Route path="/chat/:id" component={ChatPage}/>
          <Route exact path='/game' component={GameLobby}/>
          <Route exact path='/game/:room' component={GamePage}/>
          <Route exact path='/spectator' component={SpectatorPage}/>
          <Route exact path='/rules' component={RulesPage}/>
          <Route path="/logout" component={Logout}/>
          <Route exact path="/" component={MainPage}/>
        </div>
      </HashRouter>
  );
}

export default App;
