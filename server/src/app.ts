import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './data-source';
import { setRoutes } from './routes/index';
import { User } from './entity/User';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize routes
setRoutes(app);

// Example endpoint to test DB connection
app.get('/users', async (req, res) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

// Initialize TypeORM and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error('Error during Data Source initialization', err);
  });