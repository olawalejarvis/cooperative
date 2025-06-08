import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User, UserRole } from '../entity/User';
import { Organization } from '../entity/Organization';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const orgRepo = dataSource.getRepository(Organization);

    // default root user
    const defaultRootUser = userRepo.create({
      firstName: 'Root-Olawale',
      lastName: 'Aladeusi',
      email: process.env.DEFAULT_USER_EMAIL,
      phoneNumber: process.env.DEFAULT_USER_PHONE,
      userName: process.env.DEFAULT_USER_USERNAME,
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
      deleted: false,
      role: UserRole.ROOT
    });

    // Set the transient password property so the hook can hash it
    defaultRootUser.password = process.env.DEFAULT_USER_PASSWORD || 'defaultPassword123!';
    
    // default organization
    const organization = orgRepo.create({
      name: 'root',
      label: 'Root',
      description: 'This is the default organization created during seeding.',
      createdBy: defaultRootUser,
      logoUrl: 'https://example.com/logo.png',
      isActive: true,
      deleted: false,
    });

    // Save organization first to ensure createdBy is set correctly
    await orgRepo.save(organization);
    
    // Set the organization for the user
    defaultRootUser.organization = organization;
   
    // Save the user
    await userRepo.save(defaultRootUser);


    // Update the organization with createdBy and updatedBy
    organization.createdBy = defaultRootUser;
    organization.updatedBy = defaultRootUser;
    // Save the organization again to update createdBy and updatedBy
    await orgRepo.save(organization);

    
    // default user user
    const defaultUserUser = userRepo.create({
      firstName: 'User-Olawale',
      lastName: 'Aladeusi',
      email: 'olawalequest@gmail.com',
      phoneNumber: '+234123456789',
      userName: 'olawalequest',
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
      createdBy: defaultRootUser,
      updatedBy: defaultRootUser,
      deleted: false,
      role: UserRole.USER
    });
    defaultUserUser.password = 'defaultPassword123!';
    defaultUserUser.organization = organization;
    await userRepo.save(defaultUserUser);
  }
}

