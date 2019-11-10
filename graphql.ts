import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { ApolloLink, split } from 'apollo-link';
import { getMainDefinition } from 'apollo-utilities';
import gql from 'graphql-tag';

const HTTP_ENDPOINT = 'https://expo-hasura-todo.herokuapp.com/v1/graphql';
const WS_ENDPOINT = 'wss://expo-hasura-todo.herokuapp.com/v1/graphql';

const httpLink = new HttpLink({
  uri: HTTP_ENDPOINT,
});

const wsLink = new WebSocketLink({
  uri: WS_ENDPOINT,
  options: {
    reconnect: true,
  },
});

const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query);
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
  },
  wsLink,
  httpLink
);
export const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
          console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    link,
  ]),
  cache: new InMemoryCache(),
});

const IncompleteTodos = gql`
  subscription IncompleteTodos($userId: uuid!) {
    todos(where: { completed: { _eq: false }, user_id: { _eq: $userId } }) {
      completed
      text
      id
    }
  }
`;

const AllTodos = gql`
  subscription AllTodos($userId: uuid!) {
    todos(where: { user_id: { _eq: $userId } }) {
      completed
      text
      id
    }
  }
`;

const CreateTodo = gql`
  mutation CreateTodo($text: String!, $userId: uuid!) {
    insert_todos(objects: { text: $text, user_id: $userId }) {
      affected_rows
    }
  }
`;

const UpdateTodo = gql`
  mutation UpdateTodo($id: Int!, $text: String!, $completed: Boolean!) {
    update_todos(where: { id: { _eq: $id } }, _set: { text: $text, completed: $completed }) {
      affected_rows
    }
  }
`;

const DeleteTodo = gql`
  mutation DeleteTodo($id: Int!) {
    delete_todos(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const Subscriptions = {
  IncompleteTodos,
  AllTodos,
};

export const Mutations = {
  CreateTodo,
  UpdateTodo,
  DeleteTodo,
};
