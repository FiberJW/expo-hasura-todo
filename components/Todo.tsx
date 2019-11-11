import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useMutation } from '@apollo/react-hooks';
import { lineHeight, majorThird } from '../styles/typography';
import {
  white,
  indigo,
  todoContainerColor,
  uncheckedBoxBorderColor,
  checkedBoxColor,
} from '../styles/colors';
import DeleteRow from './DeleteRow';
import { mutations } from '../graphql';

export default function Todo({ text: defaultText, completed: defaultCompleted, id }) {
  const [text, setText] = useState(defaultText);
  const [completed, setCompleted] = useState(defaultCompleted);
  const [showLoader, setShowLoader] = useState(false);
  const [updateTodo] = useMutation(mutations.UpdateTodo);
  const [deleteTodo] = useMutation(mutations.DeleteTodo);

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

const styles = StyleSheet.create({
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
  todoText: {
    color: white,
    fontFamily: 'Inter',
    fontSize: majorThird(0),
    lineHeight: lineHeight(majorThird(0), 1.4),
    marginTop: -2,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
});
