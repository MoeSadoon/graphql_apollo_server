import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated, isMessageOwner } from './authorization';

export default {
  Query: {
    message: async (parent, { id }, { models }) => {
      return await models.findByPk(id);
    },
    messages: async (parent, args, { models }) => {
      return await models.findAll();
    },
  },
  Mutation: {
    createMessage: combineResolvers( 
      isAuthenticated, // custom authentication middleware
      async (parent, { text }, { me, models }) => {
        try {
          return await models.Message.create({
            text,
            userId: me.id,
          });
        } catch(error) {
          throw new Error(error);
        }
      }
    ),
    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
       return await models.Message.destroy({
         where: { id }
       });
     },
    )
  },
  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findByPk(message.userId)
    },
  },
};
