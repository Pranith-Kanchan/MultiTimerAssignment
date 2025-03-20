import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Button, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs'; // Import react-native-fs

const HistoryScreen = ({ navigation }) => {
  const [completedTimers, setCompletedTimers] = useState([]);

  // Load completed timers on mount
  useEffect(() => {
    loadCompletedTimers();
  }, []);

  // Load completed timers from AsyncStorage
  const loadCompletedTimers = async () => {
    try {
      const savedCompletedTimers = await AsyncStorage.getItem('completedTimers');
      if (savedCompletedTimers !== null) {
        setCompletedTimers(JSON.parse(savedCompletedTimers));
      }
    } catch (error) {
      console.error('Failed to load completed timers:', error);
    }
  };

  // Delete all logs
  const deleteLogs = async () => {
    try {
      Alert.alert(
        'Delete Logs',
        'Are you sure you want to delete all logs?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.removeItem('completedTimers'); // Clear AsyncStorage
              setCompletedTimers([]); // Clear the state
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Failed to delete logs:', error);
    }
  };

  // Export timer history as a JSON file
  const exportHistory = async () => {
    try {
      const jsonData = JSON.stringify(completedTimers, null, 2); // Convert data to JSON string
      const fileName = 'timer_history.json';
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Path to save the file

      // Write the JSON data to the file
      await RNFS.writeFile(filePath, jsonData, 'utf8');

      // Show success message
      Alert.alert(
        'Export Successful',
        `Timer history has been exported to ${filePath}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to export history:', error);
      Alert.alert(
        'Export Failed',
        'An error occurred while exporting the timer history.',
        [{ text: 'OK' }]
      );
    }
  };

  // Render a completed timer item
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.timerName}>{item.name}</Text>
      <Text style={styles.completionTime}>Completed at: {item.completionTime}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Button
        title="View History"
        onPress={() => navigation.goBack()} // Navigate back to the previous screen
      />
      <Text style={styles.header}>Completed Timers</Text>
      {completedTimers.length > 0 ? (
        <FlatList
          data={completedTimers}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <Text style={styles.noTimersText}>No completed timers yet.</Text>
      )}
      <Button
        title="Delete Logs"
        onPress={deleteLogs} // Call the deleteLogs function
        color="red" // Optional: Make the button red for emphasis
      />
      <Button
        title="Export History"
        onPress={exportHistory} // Call the exportHistory function
        color="green" // Optional: Make the button green for emphasis
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  item: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completionTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noTimersText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default HistoryScreen;