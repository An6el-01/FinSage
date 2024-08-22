import React from 'react';
import { View, StyleSheet } from 'react-native';

const colors = {
  primary: '#FCB900',
  progressBackground: '#E0E0E0',
};

const styles = StyleSheet.create({
  progressBarContainer: {
    height: 17,
    borderRadius: 5,
    backgroundColor: colors.progressBackground,
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 10,
    position: 'relative',
  },
  progress: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});

interface ProgressBarProps {
  progress: number; // Progress value between 0 and 1
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progress,
          { width: `${progress * 100}%` },
        ]}
      />
    </View>
  );
};

export default ProgressBar;
