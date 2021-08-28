import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Multer } from 'multer';

@Entity()
class Avatar {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public userid: number;

    @Column({type: "bytea"})
    public image: Buffer;
}

export default Avatar;
