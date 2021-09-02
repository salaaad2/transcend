import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Multer } from 'multer';

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
