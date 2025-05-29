import { Router, Request, Response, NextFunction } from 'express';
import { UserController } from '../controllers';
import { authenticateToken } from '../middleware/authenticateToken';

const userRouter = Router();
const userController = new UserController();

userRouter.post('/', userController.createUser);
userRouter.post('/login', userController.loginUser);
userRouter.post('/logout', userController.logoutUser);
userRouter.get('/me', authenticateToken, userController.getMe);
userRouter.get('/', authenticateToken, userController.searchUsers);


export { userRouter };
