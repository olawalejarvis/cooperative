import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

export type OrganizationMeetingStatus = 'scheduled' | 'completed' | 'cancelled';

/**
 * Represents a meeting held by a cooperative organization.
 */
@Entity({ name: 'organization_meeting' })
export class OrganizationMeeting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Column({ type: 'varchar', length: 128 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  agenda?: string;

  @Column({ type: 'timestamp' })
  meetingDate!: Date;

  @Column({ type: 'text', nullable: true })
  minutes?: string;

  /**
   * Represents the users who are attendees of the meeting.
   */
  @ManyToMany(() => User)
  @JoinTable({ name: 'organization_meeting_attendees', joinColumn: { name: 'meeting_id', referencedColumnName: 'id' }, inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' } })
  attendees?: User[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  status?: OrganizationMeetingStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;

  @Column({ default: false })
  deleted!: boolean;
}
