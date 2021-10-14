import * as React from 'react';
import IUserProps from '../interface/IUserProps';
import ISocketProps from '../interface/ISocketProps';
import { Button, Form } from 'react-bootstrap';
import Utils from '../utils/utils';
import Message from './message';
import redcrossImage from '../../media/images/redcross.png';
import greencrossImage from '../../media/images/greencross.png';
import thumbUpImage from '../../media/images/thumbup.jpg';
import thumbDownImage from '../../media/images/thumbdown.jpg';
import muteImage from '../../media/images/mute.jpg';
import unmuteImage from '../../media/images/unmute.png';
import banImage from '../../media/images/ban.jpg';
import { socket } from '../../socket/context';

export class Channel extends React.Component<IUserProps & ISocketProps, any> {
    constructor(props: any) {
        super(props);
        this.sendChannelJoined = this.sendChannelJoined.bind(this);
        this.printChanList = this.printChanList.bind(this);
        this.printClientList = this.printClientList.bind(this);
        this.makeHTMLPublic = this.makeHTMLPublic.bind(this);
        this.makeHTMLPrivate = this.makeHTMLPrivate.bind(this);
        this.btnKickClient = this.btnKickClient.bind(this);
        this.btnPromote = this.btnPromote.bind(this);
        this.btnDemote = this.btnDemote.bind(this);
        this.btnUnmute = this.btnUnmute.bind(this);
        this.btnUnmute = this.btnUnmute.bind(this);
        this.btnUnban = this.btnUnban.bind(this);
        this.btnBan = this.btnBan.bind(this);
        this.sendLeftChannel = this.sendLeftChannel.bind(this);
        this.sendPromotedClient = this.sendPromotedClient.bind(this);
        this.sendDemotedClient = this.sendDemotedClient.bind(this);
        this.sendMutedClient = this.sendMutedClient.bind(this);
        this.sendUnmutedClient = this.sendUnmutedClient.bind(this);
        this.sendBannedClient = this.sendBannedClient.bind(this);
        this.makeButtonPrivate = this.makeButtonPrivate.bind(this);
        this.makeButtonPublic = this.makeButtonPublic.bind(this);
        this.state = {
            inputChannel: '',
            inputPassword: '',
            currentChan: '',
            chanlist: [],
            cllist: [],
            adminlist: [],
            mutelist: [],
            banlist: [],
            owner: false,
            admin: false,
            muted: false,
            toggle: 'public',
        };
    }

    printChanList() {
        Utils.updateDomElement('chanlist', 'ul', 'chanlist', 'chanlist', 'divchanlist');
        for (let chan of this.state.chanlist) {
            const parent = document.getElementById('chanlist');
            const child = document.createElement('li');
            const btn = document.createElement('button');
            child.className = 'row';
            btn.className = 'col chaninfo';
            btn.id = 'btn-chan' + chan;
            btn.addEventListener("click", (e:Event) => {
                e.preventDefault();
                const btn_id = btn.getAttribute('id');
                if (this.state.toggle === 'public')
                {
                    this.props.socket.emit('request_join_channel', {
                        'username': this.props.user.username,
                        'channel': btn_id?.substring(8),
                        'password': null,
                    })
                }
                else
                {
                    const tab = btn_id?.split('&');
                    if (tab)
                    {
                        tab[0] = tab[0].substring(8);
                        const src = this.props.user.username === tab[0] ? tab[0] : tab[1];
                        const dst = this.props.user.username !== tab[1] ? tab[1] : tab[0];
                        this.props.socket.emit('request_join_private_channel', {
                            'src': src,
                            'dst': dst});
                    }
                }
            });
            if (this.state.toggle === 'private')
            {
                const btn_id = btn.getAttribute('id');
                const tab = btn_id?.split('&');
                if (tab)
                {
                    tab[0] = tab[0].substring(8);
                    btn.innerHTML = this.props.user.username !== tab[1] ? tab[1] : tab[0];
                }
            }
            else
                btn.innerHTML = chan;
            if (this.state.currentChan === chan)
                btn.classList.add('selectedchan');
            child.appendChild(btn);
            parent?.appendChild(child);
        }
    }

    printClientList() {
        Utils.updateDomElement('clientlist', 'ul', 'clientlist', 'clientlist', 'cldiv');
        for (let cl of this.state.cllist) {
            const parent = document.getElementById('clientlist');
            const child = document.createElement('li');
            const div = document.createElement('div');
            const link = document.createElement('a');
            child.className = 'row';
            div.className = 'col userinfo';
            link.href = '#profile/:' + cl;
            link.textContent = cl;
            link.className = 'userinfo';
            if (this.state.toggle === 'public')
            {
                if (this.state.owner === cl && this.state.currentChan !== 'General')
                {
                    link.textContent += ' (OWNER)';
                    link.classList.add('owneruser');
                }
                else if (this.state.adminlist.includes(cl) && this.state.currentChan !== 'General')
                {
                    link.textContent += ' (ADMIN)';
                    link.classList.add('adminuser');
                }
                else if (!this.state.banlist.includes(cl))
                    link.classList.add('normaluser');
                if ((this.props.user.username === cl && this.state.currentChan !== 'General') ||
                    (this.state.admin === true && this.state.owner !== cl))
                {
                    if (this.state.banlist.includes(cl))
                    {
                        const btn = document.createElement('button'); // unnban button
                        const image = document.createElement('img');
                        btn.className = 'btn';
                        btn.id = 'btn-unban' + this.state.currentChan;
                        btn.addEventListener("click", (e:Event) => this.btnUnban(e, btn.id.substring(9), cl));
                        image.src = greencrossImage;
                        image.width = 20;
                        image.height = 20;
                        image.alt = '';
                        btn.appendChild(image);
                        div.appendChild(btn);
                    }
                    else
                    {
                        const btn = document.createElement('button'); // leave/kick button
                        const image = document.createElement('img');
                        btn.className = 'btn';
                        btn.id = 'btn-kick' + this.state.currentChan;
                        btn.addEventListener("click", (e:Event) => this.btnKickClient(e, btn.id.substring(8), cl));
                        image.src = redcrossImage;
                        image.width = 20;
                        image.height = 20;
                        image.alt = '';
                        btn.appendChild(image);
                        div.appendChild(btn);
                        if (this.props.user.username !== cl)
                        {
                            // mute/unmute button
                            const btn_mute = document.createElement('button');
                            const img_mute = document.createElement('img');
                            if (!this.state.mutelist.includes(cl))
                            {
                                btn_mute.addEventListener("click", (e:Event) => this.btnMute(e, btn_mute.id.substring(8), cl));
                                img_mute.src = muteImage;
                            }
                            else
                            {
                                btn_mute.addEventListener("click", (e:Event) => this.btnUnmute(e, btn_mute.id.substring(8), cl));
                                img_mute.src = unmuteImage;
                            }
                            btn_mute.className = 'btn';
                            btn_mute.id = 'btn-mute' + this.state.currentChan;
                            img_mute.width = 20;
                            img_mute.height = 20;
                            img_mute.alt = '';
                            btn_mute.appendChild(img_mute);
                            div.appendChild(btn_mute);
                            // ban button
                            const btn_ban = document.createElement('button');
                            const img_ban = document.createElement('img');
                            btn_ban.addEventListener("click", (e:Event) => this.btnBan(e, btn_ban.id.substring(7), cl));
                            img_ban.src = banImage;
                            btn_ban.className = 'btn';
                            btn_ban.id = 'btn-ban' + this.state.currentChan;
                            img_ban.width = 20;
                            img_ban.height = 20;
                            img_ban.alt = '';
                            btn_ban.appendChild(img_ban);
                            div.appendChild(btn_ban);
                        }
                        if (this.props.user.username !== cl && this.state.owner === this.props.user.username) // promote/demote button
                        {
                            const btn_grade = document.createElement('button');
                            const imgthumb = document.createElement('img');
                            if (!this.state.adminlist.includes(cl))
                            {
                                btn_grade.addEventListener("click", (e:Event) => this.btnPromote(e, btn_grade.id.substring(9), cl));
                                imgthumb.src = thumbUpImage;
                            }
                            else
                            {
                                btn_grade.addEventListener("click", (e:Event) => this.btnDemote(e, btn_grade.id.substring(9), cl));
                                imgthumb.src = thumbDownImage;

                            }
                            btn_grade.className = 'btn';
                            btn_grade.id = 'btn-grade' + this.state.currentChan;
                            imgthumb.width = 20;
                            imgthumb.height = 20;
                            imgthumb.alt = '';
                            btn_grade.appendChild(imgthumb);
                            div.appendChild(btn_grade);
                        }
                    }
                }
            }
            div.appendChild(link);
            child.appendChild(div);
            parent?.appendChild(child);
        }

    }

    btnPromote(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_promote_client', {
            channel: chan,
            client: cl
        });
    }

    btnDemote(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_demote_client', {
            channel: chan,
            client: cl
        });
    }

    btnMute(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_mute_client', {
            channel: chan,
            client: cl
        });
    }

    btnUnmute(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_unmute_client', {
            channel: chan,
            client: cl
        });
    }

    btnKickClient(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_leave_channel', {
            channel: chan,
            username: cl,
        });
    }

    btnBan(e: Event, chan:string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_ban_from_chan', {
            channel: chan,
            client: cl,
            toggle: true,
        });
    }

    btnUnban(e: Event, chan: string, cl: string) {
        e.preventDefault();
        this.props.socket.emit('request_ban_from_chan', {
            channel:chan,
            client: cl,
            toggle: false,
        })
    }

    sendChannelJoined(chan: string, username: string, owner: string, admin: string[], mute: string[])
    {
        if (chan !== this.state.currentChan && this.props.user.username === username)
        {
            const chan_title = document.getElementById('channel-title');
            if (chan_title)
                chan_title.textContent = chan;
            this.setState({
                currentChan: chan,
                inputChannel: "",
                inputPassword: "",
                chanlist: this.state.chanlist.includes(chan) ? this.state.chanlist : this.state.chanlist.concat([chan]),
                adminlist: admin,
                mutelist: mute,
                owner: owner,
                admin: admin.includes(username) ? true : false,
                });
            this.props.socket.emit('request_get_channel_clients', chan);
            this.props.socket.emit('request_get_banned_clients', chan);
            this.props.user.currentChannel = chan;
            Utils.notifySuccess('You joined ' + chan);
        }
        else if (chan === this.state.currentChan && this.props.user.username !== username
                && !this.state.cllist.includes(username))  // if another user join the channel
        {
            this.setState({ cllist: this.state.cllist.concat([username]) });
            Utils.notifyInfo(username + ' joined ' + chan);
        }
        else
            return;
    }

    sendPrivateChannelJoined(src: string, dst: string,chan: string) {
        if (chan !== this.state.currentChan && this.props.user.username === src)
        {
            socket.emit('remove_msg', [src, chan]);
            const chan_title = document.getElementById('channel-title');
            if (chan_title)
                chan_title.textContent = dst;
            this.setState({
                currentChan: chan,
                inputChannel: "",
                inputPassword: "",
                chanlist: this.state.chanlist.includes(chan) ? this.state.chanlist : this.state.chanlist.concat([chan]),
                adminlist: [],
                mutelist: [],
                owner: '',
                admin: false,
                });
            this.props.user.currentChannel = chan;
            this.props.socket.emit('request_get_channel_clients', chan);
        }
        else if (this.props.user.username === dst && this.state.currentChan !== chan)
        {
            if (this.state.toggle === 'private')
                this.setState({ chanlist: this.state.chanlist.includes(chan) ? this.state.chanlist : this.state.chanlist.concat([chan])});
        }
        else
            return;
    }

    sendLeftChannel(chan: string, username: string) {
            if (username !== this.props.user.username && this.state.currentChan === chan) // for other client of channel
            {
                const cllist: string[] = this.state.cllist;
                const lastIndex = cllist.indexOf(username);
                this.setState({ cllist: cllist.filter((item: string, index: number) => index !== lastIndex) });
                Utils.notifyInfo(username + ' left ' + chan);
            }
            else if (this.state.chanlist.includes(chan)) {
                const chanlist: string[] = this.state.chanlist;
                const lastIndex = chanlist.indexOf(chan);
                this.setState({ chanlist: chanlist.filter((item: string, index: number) => index !== lastIndex) });
                if (this.state.currentChan === chan) // redirect to 'General' if needed
                {
                    this.props.socket.emit('request_join_channel', {
                        'username': this.props.user.username,
                        'channel': 'General'})
                }
            }
        }

    sendPromotedClient(chan: string, username: string ) {
        if (username !== this.props.user.username && this.state.currentChan === chan)
        {
            if (!this.state.adminlist.includes(username))
                this.setState({ adminlist: this.state.adminlist.concat([username]) });
            Utils.notifyInfo(username + ' has been promoted on ' + chan);
        }
        else if (this.props.user.username === username && this.state.chanlist.includes(chan)
                 && !this.state.adminlist.includes(username))
        {
            this.setState({ adminlist: this.state.adminlist.concat([username]),
                            admin: this.state.currentChan === chan ? true : false });
            Utils.notifyInfo('You have been promoted on ' + chan);
        }
    }

    sendDemotedClient(chan: string, username: string ) {
        if (username !== this.props.user.username && this.state.currentChan === chan)
        {
            if (this.state.adminlist.includes(username))
            {
                const adminlist: string[] = this.state.adminlist;
                const lastIndex = adminlist.indexOf(username);
                this.setState({ adminlist: adminlist.filter((item: string, index: number) => index !== lastIndex) });
            }
            Utils.notifyInfo(username + ' has been demoted on ' + chan);
        }
        else if (this.props.user.username === username && this.state.chanlist.includes(chan)
                 && this.state.adminlist.includes(username))
        {
                const adminlist: string[] = this.state.adminlist;
                const lastIndex = adminlist.indexOf(username);
                this.setState({ adminlist: adminlist.filter((item: string, index: number) => index !== lastIndex),
                                admin: this.state.currentChan === chan ? false : this.state.admin });
            Utils.notifyInfo('You have been demoted on ' + chan);
        }
    }

    sendMutedClient(chan: string, username: string ) {
        if (username !== this.props.user.username && this.state.currentChan === chan)
        {
            if (!this.state.mutelist.includes(username))
                this.setState({ mutelist: this.state.mutelist.concat([username]) });
            Utils.notifyInfo(username + ' has been muted on ' + chan);
        }
        else if (this.props.user.username === username && this.state.chanlist.includes(chan)
                 && !this.state.mutelist.includes(username))
        {
            this.setState({ mutelist: this.state.mutelist.concat([username]),
                            muted: this.state.currentChan === chan ? true : this.state.muted });
            Utils.notifyInfo('You have been muted on ' + chan);
        }
    }

    sendUnmutedClient(chan: string, username: string ) {
        if (username !== this.props.user.username && this.state.currentChan === chan)
        {
            const mutelist: string[] = this.state.mutelist;
            const lastIndex = mutelist.indexOf(username);
            this.setState({ mutelist: mutelist.filter((item: string, index: number) => index !== lastIndex) });
            Utils.notifyInfo(username + ' has been unmuted on ' + chan);
        }
        else if (this.props.user.username === username && this.state.chanlist.includes(chan)
                 && this.state.mutelist.includes(username))
        {

            const mutelist: string[] = this.state.mutelist;
            const lastIndex = mutelist.indexOf(username);
            this.setState({ mutelist: mutelist.filter((item: string, index: number) => index !== lastIndex),
                            muted: this.state.currentChan === chan ? false : this.state.muted });
            Utils.notifyInfo('You have been unmuted on ' + chan);
        }
    }

    sendBannedClient(chan: string, username: string, toggle: boolean) {
        if (toggle === true)
        {
            if (username !== this.props.user.username && this.state.currentChan === chan)
            {
                this.setState({ banlist: this.state.banlist.concat([username]) });
                Utils.notifyInfo(username + ' was banned from ' + chan);
            }
            else if (this.props.user.username === username && this.state.chanlist.includes(chan))
            {
                const chanlist: string[] = this.state.chanlist;
                const lastIndex = chanlist.indexOf(chan);
                this.setState({ chanlist: chanlist.filter((item: string, index: number) => index !== lastIndex) });
                Utils.notifyInfo('You were banned from ' + chan);
                if (this.state.currentChan === chan)
                {
                    this.props.socket.emit('request_join_channel', {
                        'username': this.props.user.username,
                        'channel': 'General',
                    });
                }
            }
        } else if (toggle === false) {
            if (username !== this.props.user.username && this.state.currentChan === chan)
            {
                const banlist: string[] = this.state.banlist;
                const lastIndex = banlist.indexOf(username);
                this.setState({ banlist: banlist.filter((item: string, index: number) => index !== lastIndex) });
                Utils.notifyInfo(username + ' was unbanned from ' + chan);
            }
            else if (this.props.user.username === username)
            {
                const chanlist: string[] = this.state.chanlist;
                this.setState({ chanlist: chanlist.concat([chan]) });
                Utils.notifyInfo('You were unbanned from ' + chan);
            }
        }
    }

    makeButtonPublic () {
        return (
            <button onClick={(e) => {
                e.preventDefault();
                const barOuter = document.querySelector(".bar-outer");
                if (barOuter)
                {
                    barOuter.className= "bar-outer";
                    barOuter.classList.add('pos1');
                    barOuter.classList.add("left");
                }
                if (this.state.toggle !== 'public')
                {
                    const chan_title = document.getElementById('channel-title');
                    if (chan_title)
                        chan_title.textContent = 'General';
                    this.setState({
                        inputChannel: '',
                        inputPassword: '',
                        currentChan: '',
                        chanlist: [],
                        cllist: [],
                        adminlist: [],
                        mutelist: [],
                        owner: '',
                        admin: false,
                        muted: false,
                        toggle: 'public'});
                    this.props.socket.emit('request_get_channels', this.props.user.username);
                    this.props.socket.emit('request_join_channel', {
                        'username': this.props.user.username,
                        'channel': 'General',
                        'password': null });
                }
            }}>Public</button>
        )

    }

    makeButtonPrivate() {
        return (
            <button onClick={(e) => {
                e.preventDefault();
                if (this.state.toggle !== 'private')
                {
                    const barOuter = document.querySelector(".bar-outer");
                    if (barOuter)
                    {
                        barOuter.className= "bar-outer";
                        barOuter.classList.add('pos2');
                        barOuter.classList.add("right");
                    }
                    const chan_title = document.getElementById('channel-title');
                    if (chan_title)
                        chan_title.textContent = '';
                    this.setState({
                        inputChannel: '',
                        inputPassword: '',
                        currentChan: '',
                        chanlist: [],
                        cllist: [],
                        adminlist: [],
                        mutelist: [],
                        owner: '',
                        admin: false,
                        muted: false,
                        toggle: 'private'});
                    this.props.socket.emit('request_get_private_channels', this.props.user.username);
                }
            }} >Private</button>
        )
    }

    makeHTMLPublic() {
        const chan_title = document.getElementById('channel-title');
        if (chan_title)
            chan_title.textContent = this.state.currentChan;
        const html =
            <div>
                <div className="togglechan">
                    <div className = "bar bar-grey">
                        <div className="options">{this.makeButtonPublic()}</div>
                        <div className="options">{this.makeButtonPrivate()}</div>
                    </div>
                    <div className = "bar-outer">
                        <div className = "bar bar-purple">
                        <div className="options">{this.makeButtonPublic()}</div>
                        <div className="options">{this.makeButtonPrivate()}</div>
                        </div>
                    </div>
                </div>
                <Message user={this.props.user} socket={this.props.socket} msglist={[]} currentChan={this.state.currentChan} mute={this.state.muted} ispriv={this.state.toggle}/>;
        <div className='form-chat'>
            <Form onSubmit={(e) => {
                e.preventDefault();
                this.props.socket.emit('request_join_channel', {
                    'username': this.props.user.username,
                    'channel': this.state.inputChannel,
                    'password': this.state.inputPassword })}}>
                <Form.Control size="sm" type="text" placeholder="Channel name" autoFocus
                              value={this.state.inputChannel} onChange={(e) => this.setState({inputChannel: e.target.value})} />
                <Form.Control size="sm" type="password" placeholder="Password (optional)"
                              value={this.state.inputPassword} onChange={(e) => this.setState({inputPassword: e.target.value})}/>
                <Button type="submit" className="btn btn-secondary" id="btn-create">Create</Button>
            </Form>
        </div>
            </div>;
        return (html);
    }

    makeHTMLPrivate() {
        Utils.updateDomElement('clientlist', 'ul', 'clientlist', 'clientlist', 'cldiv');
        Utils.updateDomElement('chanlist', 'ul', 'chanlist', 'chanlist', 'divchanlist');
        const html =
            <div>
                <div className="togglechan">
                    <div className = "bar bar-grey">
                        <div className="options">{this.makeButtonPublic()}</div>
                        <div className="options">{this.makeButtonPrivate()}</div>
                    </div>
                    <div className = "bar-outer">
                        <div className = "bar bar-purple">
                        <div className="options">{this.makeButtonPublic()}</div>
                        <div className="options">{this.makeButtonPrivate()}</div>
                        </div>
                    </div>
                </div>
                <Message user={this.props.user} socket={this.props.socket} msglist={[]} currentChan={this.state.currentChan} mute={this.state.muted} ispriv={this.state.toggle}/>;
        <div className='form-chat'>
            <Form onSubmit={(e) => {
                e.preventDefault();
                this.props.socket.emit('request_join_private_channel', {
                    'src': this.props.user.username,
                    'dst': this.state.inputChannel })}}>
                <Form.Control size="sm" type="text" placeholder="Username" autoFocus
                              value={this.state.inputChannel} onChange={(e) => this.setState({inputChannel: e.target.value})} />
                <Button type="submit" className="btn btn-secondary" id="btn-create">Find</Button>
            </Form>
        </div>
            </div>;
        return (html);
    }

    render() {
        if (this.state.toggle === 'public')
            return (this.makeHTMLPublic());
        else
            return (this.makeHTMLPrivate());
    }

    public componentDidMount(): void {
        this.props.socket.emit('request_get_channels', this.props.user.username);
        this.props.socket.on('send_error', (log: string) => {
            Utils.notifyErr(log);
        });
            this.props.socket.emit('request_get_channel_clients', 'General');
        this.props.socket.on('send_channel_joined', (chan: string, username: string, owner: string,
                                                     admin: string[], mutelist: string[]) => {
            this.sendChannelJoined(chan, username, owner, admin, mutelist);
        });
        this.props.socket.on('send_channels', (data: string[]) => {
            if (data)
                this.setState({ chanlist: data })
            if (this.state.chanlist.length === 0 || !this.state.chanlist.includes('General'))
            {
                this.props.socket.emit('request_join_channel', {
                    'username': this.props.user.username,
                    'channel': 'General',
                    'password': null,
                })
                this.setState({currentChan: ''});
            }
            else
            {
                this.setState({currentChan: 'General'});
                this.props.socket.emit('request_get_channel_clients', 'General');
            }
        });
        this.props.socket.on('send_destroy_channel', (channel: string) => {
            if (this.state.currentChan === channel) {
                this.setState({currentChan: 'General',
                                owner: false,
                                admin: false});
                this.props.socket.emit('request_join_channel', {
                    'username': this.props.user.username,
                    'channel': 'General',
                    'password': null,
                })
            }
            this.props.socket.emit('request_get_channels', this.props.user.username);
        });
        this.props.socket.on('send_channel_clients', (cllist: string[]) => {
            this.setState({ cllist: cllist });
        });
        this.props.socket.on('send_banned_clients', (banlist: string[]) => {
            this.setState({ banlist: banlist });
        });
        this.props.socket.on('send_left_channel', (channel: string, username: string) => {
            this.sendLeftChannel(channel, username);
        });
        this.props.socket.on('send_promoted_client', (channel: string, username: string) => {
            this.sendPromotedClient(channel, username);
        });
        this.props.socket.on('send_demoted_client', (channel: string, username: string) => {
            this.sendDemotedClient(channel, username);
        });
        this.props.socket.on('send_muted_client', (channel: string, username: string) => {
            this.sendMutedClient(channel, username);
        });
        this.props.socket.on('send_unmuted_client', (channel: string, username: string) => {
            this.sendUnmutedClient(channel, username);
        });
        this.props.socket.on('send_chan_banned_client', (channel: string, username: string, toggle: boolean) => {
            this.sendBannedClient(channel, username, toggle);
        });
        this.props.socket.on('send_private_channels', (channel: string[]) => {
            this.setState({ chanlist: channel });
        });
        this.props.socket.on('send_private_channel_joined', (src: string, dst: string, name: string) => {
           this.sendPrivateChannelJoined(src, dst, name);
        })
    }

    public componentDidUpdate(): void {
            if (this.state.cllist.length > 0)
                this.printClientList() ;
            if (this.state.chanlist.length > 0)
                this.printChanList();
    }
        public componentWillUnmount(): void {
            this.props.socket.removeAllListeners('send_channels');
            this.props.socket.removeAllListeners('send_channel_joined');
            this.props.socket.removeAllListeners('send_channel_clients');
            this.props.socket.removeAllListeners('send_banned_clients');
            this.props.socket.removeAllListeners('send_destroy_channel');
            this.props.socket.removeAllListeners('send_left_channel');
            this.props.socket.removeAllListeners('send_error');
            this.props.socket.removeAllListeners('send_promoted_client');
            this.props.socket.removeAllListeners('send_demoted_client');
            this.props.socket.removeAllListeners('send_muted_client');
            this.props.socket.removeAllListeners('send_unmuted_client');
            this.props.socket.removeAllListeners('send_chan_banned_client');
            this.props.socket.removeAllListeners('send_private_channels');
            this.props.socket.removeAllListeners('send_private_channel_joined');
            this.props.user.currentChannel = "";
        }

    };

    export default Channel;
