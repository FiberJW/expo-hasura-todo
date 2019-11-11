import gql from 'graphql-tag';

export const IncompleteTodos = gql`
  subscription IncompleteTodos($userId: uuid!) {
    todos(where: { completed: { _eq: false }, user_id: { _eq: $userId } }) {
      completed
      text
      id
    }
  }
`;

export const AllTodos = gql`
  subscription AllTodos($userId: uuid!) {
    todos(where: { user_id: { _eq: $userId } }) {
      completed
      text
      id
    }
  }
`;
