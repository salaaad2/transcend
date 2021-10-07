import * as React from 'react';
import IUserProps from '../interface/IUserProps';
import ISocketProps from '../interface/ISocketProps';
import Channel from './Channel';

export class ChatArea extends React.Component<IUserProps & ISocketProps, any> {
    constructor(props: any) {
        super(props);
        this.rerenderParentCallback = this.rerenderParentCallback.bind(this);
        this.state = {
        };
    }

  rerenderParentCallback() {
    this.forceUpdate();
  }
    public render() {
        return (
            <div>
                <Channel user={this.props.user} socket={this.props.socket} />
            </div>
        );
    }

    public componentDidMount(): void {
    }

    public componentDidUpdate(): void {
    }

    public componentWillUnmount(): void {
        this.props.socket.removeAllListeners("send_channels");
    }

};

export default ChatArea;
