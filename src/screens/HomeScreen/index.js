import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Button,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';


const TimerApp = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [timers, setTimers] = useState([]);
  const [timerName, setTimerName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [runningTimers, setRunningTimers] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [halfwayAlertEnabled, setHalfwayAlertEnabled] = useState(false);

  // console.log('=============timers=======================');
  // console.log(JSON.stringify(timers,null,2));
  // console.log('====================================');

  const saveCompletedTimer = async (timer) => {
    try {
      const completedTimers = await AsyncStorage.getItem('completedTimers');
      let updatedCompletedTimers = [];
      if (completedTimers !== null) {
        updatedCompletedTimers = JSON.parse(completedTimers);
      }
      updatedCompletedTimers.push({
        id: timer.id,
        name: timer.name,
        completionTime: new Date().toLocaleString(),
      });
      await AsyncStorage.setItem('completedTimers', JSON.stringify(updatedCompletedTimers));
    } catch (error) {
      console.error('Failed to save completed timer:', error);
    }
  };

  useEffect(() => {
    return () => {
      Object.values(runningTimers).forEach((interval) => clearInterval(interval));
    };
  }, [runningTimers]);


  // Get unique categories from timers
  const categories = ['All', ...new Set(timers.map(timer => timer.category))];

  // Filter timers based on the selected category
  const filteredTimers =
    selectedCategory === 'All'
      ? timers
      : timers.filter(timer => timer.category === selectedCategory);

  // Predefined categories
  const categoryOptions = [
    { label: 'Workout', value: 'Workout' },
    { label: 'Study', value: 'Study' },
    { label: 'Break', value: 'Break' },
    { label: 'Others', value: 'Others' },
  ];

  const saveTimers = async (timers) => {
    try {
      await AsyncStorage.setItem('timers', JSON.stringify(timers));
    } catch (error) {
      console.error('Failed to save timers:', error);
    }
  };

  const loadTimers = async () => {
    try {
      const savedTimers = await AsyncStorage.getItem('timers');
      if (savedTimers !== null) {
        setTimers(JSON.parse(savedTimers));
      }
    } catch (error) {
      console.error('Failed to load timers:', error);
    }
  };

  useEffect(() => {
    loadTimers();
  }, []);

  useEffect(() => {
    saveTimers(timers);
  }, [timers]);

  // Add Timer
  const addTimer = () => {
    const selectedCategory = category === 'Others' ? otherCategory : category;
    if (timerName && duration && selectedCategory) {
      const newTimer = {
        id: Date.now(),
        name: timerName,
        duration: parseInt(duration),
        remainingTime: parseInt(duration),
        category: selectedCategory,
        isRunning: false,
        completed: false,
        halfwayAlertEnabled, // Add this property
      };
      setTimers([...timers, newTimer]);
      resetForm();
    }
  };


  // Start Timer
  const startTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && !runningTimers[id]) {
        const interval = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === id) {
                const updatedTime = t.remainingTime > 0 ? t.remainingTime - 1 : 0;

                // Trigger halfway alert
                if (t.halfwayAlertEnabled && t.remainingTime === Math.floor(t.duration / 2)) {
                  Toast.show(`You're halfway through the timer "${t.name}"!`);
                }

                // Stop the timer when remainingTime hits 0
                if (updatedTime === 0) {
                  clearInterval(interval);
                  setRunningTimers((prev) => {
                    const updatedTimers = { ...prev };
                    delete updatedTimers[id];
                    return updatedTimers;
                  });
                  saveCompletedTimer(t); // Save the completed timer
                }

                return {
                  ...t,
                  remainingTime: updatedTime,
                  completed: updatedTime <= 0,
                };
              }
              return t;
            })
          );
        }, 1000);
        setRunningTimers((prev) => ({ ...prev, [id]: interval }));
        return { ...timer, isRunning: true };
      }
      return timer;
    });
    setTimers(updatedTimers);
  };

  // Pause Timer
  const pauseTimer = (id) => {
    if (runningTimers[id]) {
      clearInterval(runningTimers[id]);
      setRunningTimers((prev) => {
        const updatedTimers = { ...prev };
        delete updatedTimers[id];
        return updatedTimers;
      });
      setTimers((prevTimers) =>
        prevTimers.map((timer) =>
          timer.id === id ? { ...timer, isRunning: false } : timer
        )
      );
    }
  };

  // Reset Timer
  const resetTimer = (id) => {
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.id === id
          ? { ...timer, remainingTime: timer.duration, isRunning: false, completed: false }
          : timer
      )
    );
    pauseTimer(id);
  };

  // Delete Timer
  const deleteTimer = (id) => {
    if (runningTimers[id]) {
      clearInterval(runningTimers[id]);
    }
    setTimers(timers.filter((timer) => timer.id !== id));
    setRunningTimers((prev) => {
      const updatedTimers = { ...prev };
      delete updatedTimers[id];
      return updatedTimers;
    });
  };

  // Reset Form
  const resetForm = () => {
    setTimerName('');
    setDuration('');
    setCategory('');
    setOtherCategory('');
    setModalVisible(false);
  };

  // Format Time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Group Timers by Category
  const groupTimersByCategory = () => {
    const groupedTimers = filteredTimers.reduce((acc, timer) => {
      if (!acc[timer.category]) {
        acc[timer.category] = [];
      }
      acc[timer.category].push(timer);
      return acc;
    }, {});
    return Object.keys(groupedTimers).map((category) => ({
      category,
      data: groupedTimers[category],
    }));
  };

  // Toggle Collapse/Expand Category
  const toggleCategory = (category) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    const completedTimers = timers.filter((timer) => timer.remainingTime === 0 && !timer.completed);
    if (completedTimers.length > 0) {
      completedTimers.forEach((timer) => {
        console.log('Timer completed:', timer);
        saveCompletedTimer(timer); // Save the completed timer
        setTimers((prevTimers) =>
          prevTimers.map((t) =>
            t.id === timer.id ? { ...t, completed: true } : t
          )
        );
      });
    }
  }, [timers]); // Run this effect whenever `timers` changes

  // Render Timer Item
const renderTimerItem = ({ item }) => {
  const progress = 1 - item.remainingTime / item.duration;
  const percentage = Math.floor(progress * 100);

  return (
    <View style={styles.timerItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.timerText}>{item.name}</Text>
        <Text style={styles.timerText}>
          {percentage === 100 ? 'Completed' : `Remaining: ${formatTime(item.remainingTime)}`}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View
            style={{
              width: `${percentage}%`,
              backgroundColor: percentage === 100 ? 'green' : '#007BFF',
              height: '100%',
            }}
          />
        </View>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonRow}>
        {item.isRunning ? (
          <TouchableOpacity
            onPress={() => pauseTimer(item.id)}
            style={styles.iconButton}>
            <Icon name="pause" size={20} color="#FF6347" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => startTimer(item.id)}
            style={styles.iconButton}>
            <Icon name="play" size={20} color="#4CAF50" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => resetTimer(item.id)}
          style={styles.iconButton}>
          <Icon name="refresh" size={20} color="#007BFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteTimer(item.id)}
          style={styles.iconButton}>
          <Icon name="trash" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
  // Render Section Header
  const renderSectionHeader = ({ section }) => (
    <View>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={() => toggleCategory(section.category)}>
        <Text style={styles.categoryTitle}>{section.category}</Text>
        <Text style={styles.toggleIcon}>
          {collapsedCategories[section.category] ? '▼' : '▲'}
        </Text>
      </TouchableOpacity>

      {/* Category-Level Controls */}
      {!collapsedCategories[section.category] && (
        <View style={styles.categoryButtons}>
          <TouchableOpacity
            onPress={() => startAllTimersInCategory(section.category)}
            style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>Start All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => pauseAllTimersInCategory(section.category)}
            style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>Pause All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => resetAllTimersInCategory(section.category)}
            style={styles.categoryButton}>
            <Text style={styles.categoryButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Start All Timers in a Category
  const startAllTimersInCategory = (category) => {
    const categoryTimers = timers.filter((timer) => timer.category === category);

    categoryTimers.forEach((timer) => {
      if (!runningTimers[timer.id]) {
        const interval = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) =>
              t.id === timer.id
                ? {
                  ...t,
                  remainingTime: t.remainingTime > 0 ? t.remainingTime - 1 : 0,
                }
                : t
            )
          );

          // Check if the remaining time has reached 0
          const currentTimer = timers.find((t) => t.id === timer.id);
          if (currentTimer.remainingTime <= 0) {
            clearInterval(interval);
            setRunningTimers((prev) => {
              const updatedTimers = { ...prev };
              delete updatedTimers[timer.id];
              return updatedTimers;
            });
          }
        }, 1000);
        setRunningTimers((prev) => ({ ...prev, [timer.id]: interval }));
      }
    });

    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category ? { ...timer, isRunning: true } : timer
      )
    );
  };

  // Pause All Timers in a Category
  const pauseAllTimersInCategory = (category) => {
    const categoryTimers = timers.filter((timer) => timer.category === category);

    categoryTimers.forEach((timer) => {
      if (runningTimers[timer.id]) {
        clearInterval(runningTimers[timer.id]);
        setRunningTimers((prev) => {
          const updatedTimers = { ...prev };
          delete updatedTimers[timer.id];
          return updatedTimers;
        });
      }
    });

    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category ? { ...timer, isRunning: false } : timer
      )
    );
  };

  // Reset All Timers in a Category
  const resetAllTimersInCategory = (category) => {
    pauseAllTimersInCategory(category);

    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category
          ? { ...timer, remainingTime: timer.duration, isRunning: false }
          : timer
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Category Picker */}
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category} value={category} />
        ))}
      </Picker>

      {/* Add Timer Button */}
      <Button title="Add Timer" onPress={() => setModalVisible(true)} />
      <Button
        title="View History"
        onPress={() => navigation.navigate('HistoryScreen')}
      />

      {/* Timer List with Grouping */}
      <SectionList
        sections={groupTimersByCategory()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, section }) =>
          !collapsedCategories[section.category] ? renderTimerItem({ item }) : null
        }
        renderSectionHeader={renderSectionHeader}
      />

      {/* Add Timer Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Add New Timer</Text>
            <TextInput
              placeholder="Timer Name"
              value={timerName}
              onChangeText={setTimerName}
              style={styles.input}
            />
            <TextInput
              placeholder="Duration (seconds)"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Category Dropdown */}
            <RNPickerSelect
              onValueChange={(value) => setCategory(value)}
              items={categoryOptions}
              style={pickerSelectStyles}
              value={category}
              placeholder={{ label: 'Select a Category', value: '' }}
            />

            {/* Other Category Input */}
            {category === 'Others' && (
              <TextInput
                placeholder="Enter Custom Category"
                value={otherCategory}
                onChangeText={setOtherCategory}
                style={styles.input}
              />
            )}

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Enable Halfway Alert</Text>
              <Switch
                value={halfwayAlertEnabled}
                onValueChange={setHalfwayAlertEnabled}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={halfwayAlertEnabled ? '#007BFF' : '#f4f3f4'}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={addTimer} style={styles.buttonStyle}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[styles.buttonStyle, { backgroundColor: 'red' }]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonStyle: {
    flex: 1,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  timerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  timerText: {
    fontSize: 16,
    color: '#333',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: 8,
    overflow: 'hidden',
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  categoryButton: {
    padding: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }, toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

export default TimerApp;