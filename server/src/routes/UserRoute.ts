import { Router } from 'express';
import { UserController } from '../controllers';
import { authenticateToken } from '../middleware/authenticateToken';
import { adminAuthorization } from '../middleware/adminAuthorization';
import { rootUserAuthorization } from '../middleware/rootUserAuthorization';

const userRouter = Router();
const userController = new UserController();

userRouter.post('/', authenticateToken, adminAuthorization, userController.createUser);
userRouter.post('/login', userController.loginUser);
userRouter.post('/logout', authenticateToken, userController.logoutUser);
userRouter.get('/me', authenticateToken, userController.getMe);
userRouter.get('/', authenticateToken, adminAuthorization, userController.searchUsers);


export { userRouter };
