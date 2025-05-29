import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User, UserRole } from '../entity/User';
import { Organization } from '../entity/Organization';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const userRepo = dataSource.getRepository(User);
    const orgRepo = dataSource.getRepository(Organization);

    // default user
    const user = userRepo.create({
      firstName: 'Olawale',
      lastName: 'Aladeusi',
      email: process.env.DEFAULT_USER_EMAIL,
      phoneNumber: process.env.DEFAULT_USER_PHONE,
      userName: process.env.DEFAULT_USER_USERNAME,
      isActive: true,
      deleted: false,
      role: UserRole.ROOT_USER
    });

    // Set the transient password property so the hook can hash it
    user.password = process.env.DEFAULT_USER_PASSWORD || 'defaultPassword123!';
    
    // default organization
    const organization = orgRepo.create({
      name: 'Default Organization',
      createdBy: user,
      logoUrl: 'https://example.com/logo.png',
      isActive: true,
      deleted: false
    });

    // Save organization first to ensure createdBy is set correctly
    await orgRepo.save(organization);
    
    // Set the organization for the user
    user.organization = organization;
    // Save the user
    await userRepo.save(user);
  }
}

