import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import Constants from 'expo-constants';
import { FlatList } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';
import { useSubscription, useMutation } from '@apollo/react-hooks';
import { lineHeight, majorThird } from '../styles/typography';
import {
  white,
  background,
  emptyConponentTextColor,
  indigo,
  todoContainerColor,
} from '../styles/colors';
import Todo from '../components/Todo';
import { subscriptions, mutations } from '../graphql';

export default function MyTodos() {
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);
  const [showTodoCreatorInput, setShowTodoCreatorInput] = useState(false);
  const [todoDraftText, setTodoDraftText] = useState('');

  const todosSubscriptionView = showCompletedTodos
    ? subscriptions.AllTodos
    : subscriptions.IncompleteTodos;

  const { data: todosData, loading } = useSubscription(todosSubscriptionView, {
    variables: { userId: Constants.installationId },
  });

  const [createTodo] = useMutation(mutations.CreateTodo);

  const todos: { completed: boolean; text: String; id: String }[] = todosData?.todos ?? [];

  const isEmpty = todos.length === 0;

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior="padding" enabled>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>My Todos</Text>
          {loading ? (
            <ActivityIndicator color={indigo} />
          ) : (
            <TouchableOpacity
              hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
              onPress={() => setShowCompletedTodos(s => !s)}>
              <Feather name={showCompletedTodos ? 'eye-off' : 'eye'} size={24} color={white} />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          alwaysBounceVertical={!isEmpty}
          data={showCompletedTodos ? todos : todos.filter(t => t.completed === false)}
          ListHeaderComponent={() => <View style={styles.listItemSeparator} />}
          ListFooterComponent={() => <View style={styles.listItemSeparator} />}
          ItemSeparatorComponent={() => <View style={styles.listItemSeparator} />}
          keyExtractor={item => `${item.id}`}
          renderItem={({ item }) => <Todo {...item} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyComponentContainer}>
              <Text style={styles.emptyComponentText}>No Todos</Text>
            </View>
          )}
        />

        {showTodoCreatorInput ? (
          <View style={styles.todoDraftContainer}>
            <TextInput
              autoFocus
              placeholderTextColor="#89809A"
              placeholder="New Todo"
              multiline
              onBlur={() => {
                setShowTodoCreatorInput(false);
              }}
              onChangeText={t => setTodoDraftText(t)}
              value={todoDraftText}
              selectionColor="#8549FC"
              style={styles.todoDraftText}
            />
            <TouchableOpacity
              style={styles.saveTodoButtonContainer}
              onPress={async () => {
                if (todoDraftText.trim().length > 0) {
                  const { errors } = await createTodo({
                    variables: { text: todoDraftText.trim(), userId: Constants.installationId },
                  });

                  if (errors) {
                    console.log(errors);
                  }

                  setTodoDraftText('');
                  setShowTodoCreatorInput(false);
                }
              }}>
              <Text style={styles.saveTodoButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.newTodoButtonContainer}
            onPress={() => {
              setShowTodoCreatorInput(true);
            }}>
            <Text style={styles.newTodoButtonText}>New Todo</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: background,
    flex: 1,
    height: '100%',
    paddingTop: Constants.statusBarHeight + 20,
  },
  emptyComponentContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyComponentText: {
    color: emptyConponentTextColor,
    fontFamily: 'Inter',
    fontSize: majorThird(2),
  },
  header: {
    color: white,
    fontFamily: 'Inter Bold',
    fontSize: majorThird(4),
    lineHeight: lineHeight(majorThird(4), 1),
    marginTop: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  listItemSeparator: {
    height: 20,
  },
  newTodoButtonContainer: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: indigo,
    borderRadius: 8,
    justifyContent: 'center',
    margin: 20,
    paddingVertical: 16,
  },
  newTodoButtonText: {
    color: white,
    fontFamily: 'Inter Medium',
    fontSize: majorThird(1),
  },
  saveTodoButtonContainer: {
    alignSelf: 'center',
    backgroundColor: indigo,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveTodoButtonText: {
    color: white,
    fontFamily: 'Inter Medium',
    fontSize: majorThird(0),
  },
  todoDraftContainer: {
    backgroundColor: todoContainerColor,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  todoDraftText: {
    color: white,
    fontFamily: 'Inter',
    fontSize: majorThird(0),
    lineHeight: lineHeight(majorThird(0), 1.4),
    paddingTop: 0,
    textAlignVertical: 'top',
  },
});
