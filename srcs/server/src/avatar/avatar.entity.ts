import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Avatar {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public userid: number;

    @Column()
    public image: string;
}

export default Avatar;
