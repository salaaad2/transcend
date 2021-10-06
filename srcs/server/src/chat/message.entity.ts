import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Channel from './channel.entity';
 
@Entity()
class Message {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public author: string;

  @Column()
  public content: string;
 
  @ManyToOne(() => Channel, (channel: Channel) => channel.message)
  public channel: Channel;

}

export default Message;
