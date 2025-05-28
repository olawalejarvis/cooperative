import { Router } from 'express';
import { userRouter } from './UserRoute';

export function setRoutes(app: Router) {
    // default route
    app.get('/', (req, res) => res.send('Hello, World!'));


    // User routes
    app.use('/v1/users', userRouter);


    // Add more routes as needed
}
