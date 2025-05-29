import { Router } from 'express';
import { userRouter } from './UserRoute';
import { organizationRouter } from './OrganizationRoute';

export function setRoutes(app: Router) {
    // default route
    app.get('/', (req, res) => res.send('Hello, World!'));


    // User routes
    app.use('/v1/users', userRouter);


    // Organization routes
    app.use('/v1/organizations', organizationRouter);


    // Add more routes as needed
}
