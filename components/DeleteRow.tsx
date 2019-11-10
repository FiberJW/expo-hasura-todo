import React, { Component } from 'react';
import { Animated, StyleSheet, Text, View, I18nManager } from 'react-native';

import { RectButton } from 'react-native-gesture-handler';

import Swipeable from 'react-native-gesture-handler/Swipeable';
import { majorThird } from '../styles/typography';
import { white } from '../styles/colors';

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
}

export default class DeleteRow extends Component<Props, {}> {
  _swipeableRow = null;

  renderRightAction = (text, color, x, progress) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });

    const pressHandler = () => {
      this.props.onDelete();
      this.close();
    };

    return (
      <Animated.View style={[styles.rightActionContainer, { transform: [{ translateX: trans }] }]}>
        <RectButton style={[styles.rightAction, { backgroundColor: color }]} onPress={pressHandler}>
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  renderRightActions = progress => (
    <View style={styles.rightActions}>
      {this.renderRightAction('Delete', '#dd2c00', 192, progress)}
    </View>
  );

  updateRef = ref => {
    this._swipeableRow = ref;
  };

  close = () => {
    this._swipeableRow.close();
  };

  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={1}
        rightThreshold={40}
        renderRightActions={this.renderRightActions}>
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  actionText: {
    color: white,
    fontFamily: 'Inter SemiBold',
    fontSize: majorThird(0),
  },
  rightAction: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 20,
  },
  rightActionContainer: { flex: 1 },
  rightActions: { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row', width: 192 },
});
