import jwt from 'jsonwebtoken';
import express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import typeDefs from './src/schema';
import resolvers from './src/resolvers';
import cors from 'cors';
import models, { sequelize } from './src/models';

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
  context: async ({ req }) => {
    const me = await getMe(req);
    return {
      models,
      me,
      secret: process.env.SECRET,
    };
  },
});

server.applyMiddleware({ app, path: '/graphql'});

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if(eraseDatabaseOnSync) {
    createUsersWithMessages();
  }
  app.listen({ port: 8000 }, () => {
    console.log('Apollo Server on http://localhost:8000/graphaql');
  });
});

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: 'Moe',
      email: 'moe@sadoon.com',
      role: 'ADMIN',
      password: 'password',
      messages: [
        {
          text: 'First seeded comment',
        },
        {
          text: 'Second seeded comment',
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
        { text: 'Joe"s comment' },
      ],
    },
    {
      include: [models.Message],
    },
  );
};
