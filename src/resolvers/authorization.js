import { ForbiddenError } from 'apollo-server';
import { combineResolvers, skip } from 'graphql-resolvers';

// Simple authentication that checks if "me" exists
export const isAuthenticated = (parent, args, { me }) =>
  me ? skip : new ForbiddenError('Not authenticated as user');

export const isMessageOwner = async(parent, { id }, { me, models }) => {
  const message = await models.Message.findByPk(id, { raw: true });

  if (message.userId !== me.id) {
    throw new ForbiddenError('Not authorised as owner');
  }
  return skip;
};

export const isAdmin = combineResolvers(
  isAuthenticated,
  (parent, args, { me: { role } }) => 
    role === 'ADMIN' ? skip : new ForbiddenError('Not authortised as Admin'),
);