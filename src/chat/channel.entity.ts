import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import User from '../users/user.entity';
import Message from './message.entity';
 
@Entity()
class Channel {
  @PrimaryGeneratedColumn()
  public id: number;
 
  @Column({unique: true})
  public name: string;

  @Column()
  public admin: string;

  @Column()
  public password: string;
 
  @OneToMany(() => Message, (message: Message) => message.channel, 
  {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  @JoinColumn()
  public message: Message[];
}

export default Channel;