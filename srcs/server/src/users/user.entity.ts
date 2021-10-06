import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public api_42_id: string;

    @Column({ default: false })
    public isOtpEnabled: boolean;

    @Column({ nullable: true })
    public otpSecret?: string;

    @Column({ unique: true })
    public username: string;

    @Column({ unique: true })
    public realname: string;

    @Column({default: 0})
    public wins: number;

    @Column({default: 0})
    public losses: number;

    @Column("text", {array: true, default: []})
    public friendlist: string[];

    @Column("text", {array: true, default: []})
    public blocklist: string[];

    @Column({default: 1000})
    public elo: number;

    @Column({default: 'offline'})
    public status: string;

    @Column("text", {array: true, default: []})
    public public_channels: string[];

    @Column("text", {array: true, default: []})
    public private_channels: string[];

    @Column({default: ""})
    public avatar: string;

    @Column("text", {array: true, default: []})
    public friendrequests: string[];

    @Column({default: 0})
    public theme: number;

    @Column({default: false})
    public ismod: boolean;

    @Column({default: false})
    public isbanned: boolean;
}

export default User;
