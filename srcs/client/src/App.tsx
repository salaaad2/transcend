import './App.css';
import {
  Route,
  HashRouter,
  Switch
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
import NotFoundPage from './pages/NotFoundPage'
import AdminPanel from './pages/AdminPanel';
import BanPage from './pages/BanPage';

/*
 * App.tsx : mapping pages and components to paths
 * default redirect is profile page
 *
 *
 * */

function App() {

  return(
      <HashRouter>
        <div className="content">
          <Switch>
          <Route exact path="/profile/:username" component={ProfilePage}/>
          <Route exact path="/profile/:username/otp" component={OtpPage}/>
          <Route path="/ladder" component={LadderPage}/>
          <Route path="/login" component={LoginPage}/>
          <Route path="/otp-login" component={OtpLoginPage}/>
          <Route path="/adminpanel" component={AdminPanel}/>
          <Route path="/chat" component={ChatPage}/>
          <Route exact path='/game' component={GameLobby}/>
          <Route exact path='/game/:room' component={GamePage}/>
          <Route exact path='/spectator' component={SpectatorPage}/>
          <Route exact path='/rules' component={RulesPage}/>
          <Route path="/logout" component={Logout}/>
          <Route exact path="/" component={MainPage}/>
          <Route exact path="/ban" component={BanPage}/>
          <Route component={NotFoundPage}/>
          </Switch>
        </div>
      </HashRouter>
  );
}

export default App;
