import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import typeDefs from './src/schema';
import resolvers from './src/resolvers';
import cors from 'cors';
import models, { sequelize } from './src/models';

const app = express();

app.use(cors());

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async () => ({
    models,
    me: await models.User.findByLogin('Moe'),
  }),
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
};
