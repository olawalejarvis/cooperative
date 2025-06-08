import { Router } from 'express';
import { UserController } from '../controllers';
import { adminAuthorization } from '../middleware/adminAuthorization';
import { rootAuthenticateToken } from '../middleware/rootUserAuthorization';

const userRouter = Router();
const userController = new UserController();

userRouter.get('/',
  rootAuthenticateToken,
  adminAuthorization,
  userController.searchUsers
);

export { userRouter };
