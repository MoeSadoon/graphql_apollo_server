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
    createMessage: async (parent, { text }, { me, models }) => {
      return await models.Message.create({
        text,
        userId: me.id,
      });
    },
    deleteMessage: async (parent, { id }, { models }) => {
      return await models.Message.destroy({
        where: { id }
      });
    },
  },
  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findByPk(message.userId)
    },
  },
};
