import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { User, UserRole } from '../entity/User';

export class UserSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repo = dataSource.getRepository(User);

    // default user
    const user = repo.create({
      firstName: 'Olawale',
      lastName: 'Aladeusi',
      email: process.env.DEFAULT_USER_EMAIL,
      phoneNumber: process.env.DEFAULT_USER_PHONE,
      userName: process.env.DEFAULT_USER_USERNAME,
      isActive: true,
      deleted: false,
      role: UserRole.SUPERADMIN
    });

    // Set the transient password property so the hook can hash it
    user.password = process.env.DEFAULT_USER_PASSWORD || 'defaultPassword123!';

    await repo.save(user);
  }
}

