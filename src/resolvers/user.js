export default {
  Query: {
    user: async (parent, { id }, { models }) => {
      return await models.User.findByPk(id);
    },
    users: async (parent, args, { models }) => {
      return await models.User.findAll();
    },
    me: async (parent, args, { me, models }) => {
      return await models.User.findByPk(me.id);
    },
  },
  User: {
    messages: async(user, args, { models }) => {
      return await models.Message.findAll({
        where: { userId: user.id },
      });
    },
  },
};