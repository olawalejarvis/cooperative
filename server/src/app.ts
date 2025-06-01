import 'reflect-metadata';
import express from 'express';
import { AppDataSource } from './database/data-source';
import { setRoutes } from './routes/index';
import { User } from './entity/User';
import * as dotenv from 'dotenv';
import { getLogger } from './services/logger';
import { responseErrorInterceptor } from './middleware/responseErrorInterceptor';
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const logger = getLogger('app');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:5173', // Vite dev server
  'https://your-production-frontend.com' // Replace with your production domain
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies/authorization headers
}));

// Initialize routes
setRoutes(app);

// Example endpoint to test DB connection
app.get('/users', async (req, res) => {
  const users = await AppDataSource.getRepository(User).find();
  res.json(users);
});

// Add error-handling middleware as the last middleware
app.use(responseErrorInterceptor);

// Initialize TypeORM and start server
AppDataSource.initialize()
  .then(() => {
    logger.info('Data Source has been initialized!');

    app.listen(PORT, () => {
      logger.info(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err: unknown) => {
    logger.error(`Error during Data Source initialization: ${err}`);
  });
