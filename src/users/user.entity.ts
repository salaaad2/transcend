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
}

export default User;
