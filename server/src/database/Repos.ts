import { Repository } from "typeorm";
import { AppDataSource } from "./data-source";
import { User } from "../entity/User";
import { Organization } from "../entity/Organization";
import { Transaction } from "../entity/Transaction";
import { UserLoan } from "../entity/UserLoan";
import { OrganizationShare } from "../entity/OrganizationShare";
import { OrganizationProject } from "../entity/OrganizationProject";
import { OrganizationMeeting } from "../entity/OrganizationMeeting";

/**
 * Repository types for various entities in the application.
 * These repositories are used to interact with the database for CRUD operations.
 * Each repository is typed to its corresponding entity class.
 */
export type UserRepoType = Repository<User>;
export const UserRepo: UserRepoType = AppDataSource.getRepository(User);

export type OrganizationRepoType = Repository<Organization>;
export const OrganizationRepo: OrganizationRepoType = AppDataSource.getRepository(Organization);

export type TransactionRepoType = Repository<Transaction>;
export const TransactionRepo: TransactionRepoType = AppDataSource.getRepository(Transaction);

export type UserLoadRepoType = Repository<UserLoan>;
export const UserLoadRepo: UserLoadRepoType = AppDataSource.getRepository(UserLoan);

export type OrganizationShareRepoType = Repository<OrganizationShare>;
export const OrganizationShareRepo: OrganizationShareRepoType = AppDataSource.getRepository(OrganizationShare);

export type OrganizationProjectRepoType = Repository<OrganizationProject>;
export const OrganizationProjectRepo: OrganizationProjectRepoType = AppDataSource.getRepository(OrganizationProject);

export type OrganizationMeetingRepoType = Repository<OrganizationMeeting>;
export const OrganizationMeetingRepo: OrganizationMeetingRepoType = AppDataSource.getRepository(OrganizationMeeting);
