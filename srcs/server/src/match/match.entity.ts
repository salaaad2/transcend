import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Match {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public username: string;

    @Column()
    public opponent: string;

    @Column()
    public points: number;

    @Column()
    public o_points: number;

}

export default Match;
