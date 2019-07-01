import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import PasswordResetController from './app/controllers/PasswordResetController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);
routes.post('/password/reset', PasswordResetController.index);
routes.post('/password/reset/:token', PasswordResetController.update);

routes.use(authMiddleware);
routes.put('/users', UserController.update);

export default routes;
