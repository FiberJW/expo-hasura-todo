import gql from 'graphql-tag';

export const CreateTodo = gql`
  mutation CreateTodo($text: String!, $userId: uuid!) {
    insert_todos(objects: { text: $text, user_id: $userId }) {
      affected_rows
    }
  }
`;

export const UpdateTodo = gql`
  mutation UpdateTodo($id: Int!, $text: String!, $completed: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { text: $text, completed: $completed }) {
      affected_rows
    }
  }
`;

export const DeleteTodo = gql`
  mutation DeleteTodo($id: Int!) {
    delete_todos(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;
