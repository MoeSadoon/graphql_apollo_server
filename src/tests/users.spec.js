import { expect } from 'chai';
import * as userApi from './api';

describe('users', () => {
  describe('user(id: String!): User', () => {
    it('returns a user when can be found', async () => {
      // arrange
      const expectedResult = {
        data: {
          user: {
            id: '1',
            username: 'Moe',
            email: "moe@sadoon.com",
            role: 'ADMIN',
          },
        },
      };
      // act
      const result = await userApi.user({ id: "1" });
      // assert
      expect(result.data).to.eql(expectedResult);
    });
    it('returns null when a user cannot be found', async () => {
      // arrange
      const expectedResult = {
        data: {
          user: null
        }
      };
      // act
      const result = await userApi.user({ id: "999" });
      // assert
      expect(result.data).to.eql(expectedResult);
    });
  });
  
  describe('deleteUser(id: String!): Boolean!', () => {
    it('returns an error because only admins can delete a user', async () => {
      // arrange and act
      const { 
        data: { 
          data: { 
            signIn: { token }, 
          },
        },
      } = await userApi.signIn({
        login: 'Joe',
        password: 'password'
      });
      const { data: { errors }} = await userApi.deleteUser({ id: 1 }, token);
      // assert
      expect(errors[0].message).to.eql('Not authorised as Admin.');
    });
  });
});