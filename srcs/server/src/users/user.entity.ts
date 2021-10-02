import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public api_42_id: string;

    @Column({ unique: true })
    public username: string;

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
}

export default User;
