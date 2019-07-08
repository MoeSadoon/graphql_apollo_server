import jwt from 'jsonwebtoken';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import typeDefs from './src/schema';
import resolvers from './src/resolvers';
import cors from 'cors';
import models, { sequelize } from './src/models';
import http from 'http';
import DataLoader from 'dataloader';

const batchUsers = async (keys, models) => {
  const users = await models.User.findAll({
    where: {
      id: {
        $in: keys,
      },
    },
  });

  return keys.map(key => users.find(user => user.id === key));
};

const app = express();

app.use(cors());

const getMe = async (req) => {
  const token = req.headers['x-token'];

  if(token) {
    try {
      return await jwt.verify(token, process.env.SECRET)
    } catch(error) {
      throw new AuthenticationError('Your session has expired. Please login again');
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return { models }
    }
    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys => batchUsers(keys, models)),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql'});

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const isTest = !!process.env.TEST_DATABASE;

sequelize.sync({ force: isTest }).then(async () => {
  if(isTest) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphaql');
  });
});

const createUsersWithMessages = async (date) => {
  await models.User.create(
    {
      username: 'Moe',
      email: 'moe@sadoon.com',
      role: 'ADMIN',
      password: 'password',
      messages: [
        {
          text: 'First seeded comment',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          text: 'Second seeded comment',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message]
    }
  );

  await models.User.create(
    {
      username: 'Joe',
      email: 'joe@bloggs.com',
      password: 'password',
      messages: [
        { 
          text: 'Joe"s comment',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );

  await models.User.create(
    {
      username: 'Jane',
      email: 'jane@done.com',
      password: 'password',
      messages: [
        { 
          text: 'Janes"s comment',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Message],
    },
  );
};
