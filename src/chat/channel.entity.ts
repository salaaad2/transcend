import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import Message from './message.entity';
 
@Entity()
class Channel {
  @PrimaryGeneratedColumn()
  public id: number;
 
  @Column({unique: true})
  public name: string;

  @Column()
  public owner: string;

  @Column("text", { array: true, default: [""] })
  public admin: string[];

  @Column({nullable: true})
  public password: string;

  @Column("text", { array: true, default: [""] })
  public clients: string[];
 
  @OneToMany(() => Message, (message: Message) => message.channel, 
  {onDelete: 'CASCADE', onUpdate: 'CASCADE'})
  @JoinColumn()
  public message: Message[];
}

export default Channel;
