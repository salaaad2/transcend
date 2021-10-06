import * as React from 'react'
import { IMessage } from '../interface/IMessage';
import IUserProps from '../interface/IUserProps';
import ISocketProps from '../interface/ISocketProps';
import { FormEvent } from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Form, FormControl, InputGroup, Row } from 'react-bootstrap';
import Utils from '../utils/utils';
interface IMessageProps {
    msglist: number[],
    currentChan: string,
    mute: boolean,
};

export class Message extends React.Component<IUserProps & ISocketProps & IMessageProps, any> {
    constructor(props: any) {
        super(props);
        this.listMsg = this.listMsg.bind(this);
        this.sendMsg = this.sendMsg.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.makeForm = this.makeForm.bind(this);
        this.props.msglist[0] = 0;
        this.state = {
            message: "",
        };
    }

    listMsg(req: IMessage) {
        if (!this.props.msglist.includes(req.id))
        {
            const chat = document.getElementById('chat')
            const message = document.createElement('li')
            const div = document.createElement('div');
            const entete = document.createElement('div');
            const author = document.createElement('h2');
            message.className = req.author === this.props.user.username ? 'me' : 'you';
            div.className = 'message';
            div.textContent = req.content;
            entete.className = 'entete';
            author.textContent = req.author;
            entete.appendChild(author);
            message.appendChild(entete);
            message.appendChild(div);
            chat?.appendChild(message);
            this.props.msglist.push(req.id);
        }
    }

    sendMsg(event: FormEvent) {
        event.preventDefault();
        if (this.props.mute === false)
        {
            this.props.socket.emit('send_message', {
                'channel': this.props.currentChan,
                'content': this.state.message,
            })
            this.setState({message: ""});
        }
        else
        {
            Utils.notifyErr('You are muted');
        }
    }

    handleChange(event: FormEvent, text: string) {
        event.preventDefault();
        this.setState({message: text});
    }

    makeForm() {
        const form = <form onSubmit={this.sendMsg}>
            <Row className="align-items-center">
								<Col sm={10} className="my-1">
									<Form.Control
													autoFocus
													as="textarea"
													rows={5}
													style={{ width: '100%', resize: "none" }}
													placeholder="Message"
													value={this.state.message}
													onChange={(e) => this.handleChange(e, e.target.value)}/>
								</Col>
								<Col xs="auto" className="my-1">
									<Button type="submit">Submit</Button>
								</Col>
							</Row>

                    </form>;
        return (form);
    }

    public render(){
        const node: HTMLElement|null = document.getElementById('chat-footer');
        if (node)
            return (ReactDOM.createPortal(this.makeForm(), node))
        else
            return(<div/>)
    }

    public componentDidMount(): void {
        if (this.props.currentChan)
            this.props.socket.emit('request_all_messages', this.props.currentChan)
        else
            this.props.socket.emit('request_all_messages', 'General');
        this.props.socket.on('send_all_messages',  (data:any) => {
            if (data)
                for (let mess of data)
                    this.listMsg(mess)
            });
        this.setState({message: ""})
        this.props.socket.on('receive_message',  (data:any) => {
                if (data && data.channel.name === this.props.currentChan)
                    this.listMsg(data)
                else
                    this.props.socket.emit('notif_message', data);
        });
    }

    public componentDidUpdate(): void {
    }

    public getSnapshotBeforeUpdate(prevProps: IMessageProps) {
        if (prevProps.currentChan !== this.props.currentChan)
        {
            Utils.updateDomElement('chat', 'ul', 'chat', '', 'chatbox');
            this.props.socket.emit('request_all_messages', this.props.currentChan)
        }
        return ( <div/> )
    }

    public componentWillUnmount(): void {
        this.props.socket.removeAllListeners('receive_message');
        this.props.socket.removeAllListeners('send_all_messages');
    }

};

export default Message;
