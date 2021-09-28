import MainNavBar from '../components/layout/MainNavBar';
import { Redirect } from 'react-router-dom';
import { useUser }from '../components/context/UserAuthContext';
import ChatArea from '../components/chat/ChatArea';
import { SocketContext } from '../socket/context';
import React from 'react';
import './ChatPage2.css';

function ChatPage(props: any) {
	const { user } = useUser()!;
	const socket = React.useContext(SocketContext);

	if (user.id > 0)
	{
		socket.emit('login', user.username);
	return (
		<div>
			<MainNavBar />
			<div className="container-fluid">
				<div className="row">
					<div className="col-2 row-height" id="row-height">
						<div>
						<ChatArea user={user} socket={socket}/>
						</div>
						<hr/>
						<h5 id='subTitle'>CHANNELS</h5>
						<div className="chanlist" id="divchanlist">
							<ul id="chanlist">
							</ul>
						</div>
						<div className="clientlist" id="cldiv">
							<ul className = "ul" id="clientslist">
							</ul>
						</div>
					</div>
					<div className="col-10 row-chat">
						<div className="row chatheader">
							<p id="channel-title" />
						</div>
						<div className="row chatbox" id="chatbox">
							<ul id="chat">
							</ul>
						</div>
						<div className="row chatfooter" id="chat-footer">
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
	else
		return (<Redirect to={{ pathname: "/login", state: { from: props.location} }} />);
}

export default ChatPage;
