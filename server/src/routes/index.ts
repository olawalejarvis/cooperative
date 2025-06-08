import { Router } from 'express';
import { userRouter } from './UserRoute';
import { organizationRouter } from './OrganizationRoute';
import { orgTransactionRouter } from './OrganizationTransactionRoute';
import { orgUserRouter } from './OrganizationUserRoute';

export function setRoutes(app: Router) {
	// default route
	app.get('/', (req, res) => res.send('Hello, World!'));

	// User routes
	app.use('/v1/users', userRouter);

	// Organization routes - org, orgUser and orgTransaction
	app.use('/v1/organizations', organizationRouter);
	app.use('/v1/organizations', orgUserRouter);
	app.use('/v1/organizations', orgTransactionRouter);

	// Add more routes as needed
}
