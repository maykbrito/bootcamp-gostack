import { Router } from 'express';
import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Mayk Brito',
    email: 'mayk@brito.net.br',
    password_hash: '123456',
  });

  return res.json(user);
});

export default routes;
