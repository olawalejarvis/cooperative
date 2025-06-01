import { 
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate } from 'typeorm';
import { User } from './User';

@Entity({ name: 'organization' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ name: 'description', nullable: true })
  description?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy!: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ default: false })
  deleted!: boolean;


  @Column({ name: 'logo_url', nullable: true })
  logoUrl?: string;
  

  @BeforeInsert() 
  setTimestamps() {
    const now = new Date();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @BeforeUpdate()
  updateTimestamps() {
    this.updatedAt = new Date();
  }

  toJSON() {
    const { ...organization } = this;
    return organization;
  }
}
