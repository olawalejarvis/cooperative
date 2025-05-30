import { Repository } from "typeorm";
import { AppDataSource } from "./data-source";
import { User } from "../entity/User";
import { Organization } from "../entity/Organization";
import { UserTransaction } from "../entity/UserTransaction";

export type UserRepoType = Repository<User>;
export const UserRepo: UserRepoType = AppDataSource.getRepository(User);

export type OrganizationRepoType = Repository<Organization>;
export const OrganizationRepo: OrganizationRepoType = AppDataSource.getRepository(Organization);

export type UserTransactionRepoType = Repository<UserTransaction>;
export const UserTransactionRepo: UserTransactionRepoType = AppDataSource.getRepository(UserTransaction);
