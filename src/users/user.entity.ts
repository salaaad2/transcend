import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ unique: true })
    public username: string;

    @Column()
    @Exclude()
    public password: string;

    @Column({default: 0})
    public wins: number;

    @Column({default: 0})
    public losses: number;
}

export default User;
