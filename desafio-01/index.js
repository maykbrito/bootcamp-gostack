const express = require('express');

const server = express();

server.use(express.json());

// database in memorian (haha)
const projects = [];

// middlewares
const checkIdExists = (req, res, next) => {
  const { id } = req.params;
  const project = projects.filter(proj => proj.id === id);
  if (project.length === 0) return res.send({ error: 'id inexistente' });
  next();
};

const idExists = (req, res, next) => {
  const { id } = req.body;
  const project = projects.filter(proj => proj.id === id);
  if (project.length > 0)
    return res.send({ error: 'id existente. cadastre outro id' });
  next();
};

let countRequests = 0;
server.use((req, res, next) => {
  countRequests += 1;
  console.log(`Total de requisições: ${countRequests}`);
  next();
});

// projects

const getProjectById = id => projects.filter(project => project.id === id);

server.post('/projects', idExists, (req, res) => {
  const { id, title } = req.body;

  const project = {
    id,
    title,
    tasks: [],
  };

  projects.push(project);

  return res.json(projects);
});

server.get('/projects', (req, res) => res.json(projects));

server.get('/projects/:id', checkIdExists, (req, res) =>
  res.json(projects.filter(({ id }) => id === req.params.id))
);

server.put('/projects/:id', checkIdExists, (req, res) => {
  const { title } = req.body;

  projects.map(project => {
    if (project.id === req.params.id) project.title = title;
    return true;
  });

  return res.json(getProjectById(req.params.id));
});

server.delete('/projects/:id', checkIdExists, (req, res) => {
  const project = getProjectById(req.params.id);
  projects.splice(projects.indexOf(project[0]), 1);
  return res.send({ message: 'success' });
});

// tasks
server.post('/projects/:id/tasks', checkIdExists, (req, res) => {
  const { title } = req.body;

  projects.map(project => {
    if (project.id === req.params.id) project.tasks.push(title);
    return true;
  });

  return res.json(getProjectById(req.params.id));
});

server.listen(3000);
