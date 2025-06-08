import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./Organization";
import { User } from "./User";

export type OrganizationProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';

/**
 * Represents a project entity associated with an organization.
 */
@Entity({ name: 'organization_project' })
export class OrganizationProject {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'name' })
  Name!: string;
  
  @Column({ name: 'description', nullable: true })
  description?: string;
  
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate?: Date;
  
  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate?: Date;
  
  @Column({ name: 'budget', type: 'numeric', precision: 15, scale: 2, nullable: true })
  budget?: string; // Use string for currency to avoid JS float issues

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
  
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Organization, organization => organization.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;
  
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;
  
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy?: User;
  
  @Column({ default: false })
  deleted!: boolean;

  @Column({ name: 'status' })
  status?: OrganizationProjectStatus;
  
  @ManyToOne(() => User, user => user.id, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'status_updated_by' })
  statusUpdatedBy?: User; // Optional field to track who updated the project status
  
  @Column({ name: 'status_updated_at', type: 'timestamp', nullable: true })
  statusUpdatedAt?: Date; // Optional field to track when the project status was last updated
  
  @Column({ name: 'reference_id', nullable: true })
  referenceId?: string; // Optional field for external project reference

  toJson() {
    const { ...organizationProject } = this;
    return organizationProject;
  }
}
