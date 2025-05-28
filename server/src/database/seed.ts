import { AppDataSource } from './data-source';
import { runSeeders } from 'typeorm-extension';
import { UserSeeder } from '../seeds/UserSeeder';

/**
 * Run the seeders to populate the database with initial data.
 * Pass "--clear" as a command-line argument to delete all rows from tables before seeding.
 * Usage:
 * node seed.js --clear
 */
(async () => {
  const shouldClear = process.argv.includes('--clear');
  try {
    await AppDataSource.initialize();
    
    if (shouldClear) {
      console.log('Clearing all user and transaction rows...');
      await AppDataSource.query('TRUNCATE TABLE "user_transaction", "user" CASCADE');
    }

    await runSeeders(AppDataSource, {
      seeds: [UserSeeder],
    });
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error during database seeding:', error);
    process.exit(1);
  }
})();
