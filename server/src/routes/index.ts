import { Router } from 'express';
import { userRouter } from './UserRoute';
import { organizationRouter } from './OrganizationRoute';
import { transactionRouter } from './UserTransactionRoute';

export function setRoutes(app: Router) {
    // default route
    app.get('/', (req, res) => res.send('Hello, World!'));


    // User routes
    app.use('/v1/users', userRouter);

    // Transaction routes
    app.use('/v1/transactions', transactionRouter);


    // Organization routes
    app.use('/v1/organizations', organizationRouter);


    // Add more routes as needed
}
