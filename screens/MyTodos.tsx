import React, { useState, useRef } from 'react';
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
  uncheckedBoxBorderColor,
  checkedBoxColor,
} from '../styles/colors';
import DeleteRow from '../components/DeleteRow';
import { Subscriptions, Mutations } from '../graphql';

function Todo({ text: defaultText, completed: defaultCompleted, id }) {
  const [text, setText] = useState(defaultText);
  const [completed, setCompleted] = useState(defaultCompleted);
  const [showLoader, setShowLoader] = useState(false);
  const [updateTodo] = useMutation(Mutations.UpdateTodo);
  const [deleteTodo] = useMutation(Mutations.DeleteTodo);

  return (
    <DeleteRow
      onDelete={async () => {
        const { errors } = await deleteTodo({
          variables: {
            id,
          },
        });

        if (errors) alert(JSON.stringify(errors));
      }}>
      <View style={styles.todoContainer}>
        {showLoader ? (
          <ActivityIndicator color={indigo} style={styles.todoActivityIndicator} />
        ) : (
          <TouchableOpacity
            onPress={async () => {
              setCompleted(!completed);
              const { errors } = await updateTodo({
                variables: {
                  id,
                  text,
                  completed: !defaultCompleted,
                },
              });

              if (errors) alert(JSON.stringify(errors));
            }}
            style={[styles.todoCheckBox, completed ? styles.todoCheckBoxCompleted : null]}>
            {completed ? <View style={styles.todoCheckBoxCenter} /> : null}
          </TouchableOpacity>
        )}
        <TextInput
          placeholder="New Todo"
          multiline
          onChangeText={t => setText(t)}
          onBlur={async () => {
            setShowLoader(true);
            const { errors } = await updateTodo({
              variables: {
                id,
                text,
                completed,
              },
            });

            setShowLoader(false);
            if (errors) alert(JSON.stringify(errors));
          }}
          placeholderTextColor="#89809A"
          selectionColor="#8549FC"
          style={styles.todoText}
          value={text}
        />
      </View>
    </DeleteRow>
  );
}

export default function IndexScreen() {
  const [showCompletedTodos, setShowCompletedTodos] = useState(false);
  const [showTodoCreatorInput, setShowTodoCreatorInput] = useState(false);
  const [todoDraftText, setTodoDraftText] = useState('');

  const todoDraftInputRef = useRef(null);

  const todosSubscriptionView = showCompletedTodos
    ? Subscriptions.AllTodos
    : Subscriptions.IncompleteTodos;

  const { data: todosData, loading } = useSubscription(todosSubscriptionView, {
    variables: { userId: Constants.installationId },
  });

  const [createTodo] = useMutation(Mutations.CreateTodo);

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
          contentContainerStyle={styles.todosList}
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
              ref={todoDraftInputRef}
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
  keyboardAvoidingView: { flex: 1 },
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
  todoActivityIndicator: {
    height: 24,
    marginRight: 16,
    width: 24,
  },
  todoCheckBox: {
    alignItems: 'center',
    borderColor: uncheckedBoxBorderColor,
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginRight: 16,
    width: 24,
  },
  todoCheckBoxCenter: {
    backgroundColor: checkedBoxColor,
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  todoCheckBoxCompleted: {
    borderColor: checkedBoxColor,
  },
  todoContainer: {
    backgroundColor: todoContainerColor,
    borderRadius: 8,
    flexDirection: 'row',
    marginHorizontal: 20,
    padding: 16,
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
  todoText: {
    color: white,
    fontFamily: 'Inter',
    fontSize: majorThird(0),
    lineHeight: lineHeight(majorThird(0), 1.4),
    marginTop: -2,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  todosList: {
    flex: 1,
  },
});
