import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  SectionList,
  StyleSheet,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';
import Colors from '../../constants/Colors';

const TimerApp = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalVisibleComplete, setModalVisibleComplete] = useState(false);
  const [timers, setTimers] = useState([]);
  const [timerName, setTimerName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [otherCategory, setOtherCategory] = useState('');
  const [runningTimers, setRunningTimers] = useState({});
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [halfwayAlertEnabled, setHalfwayAlertEnabled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [completedTimer, setCompletedTimer] = useState(null);

  const styles = getStyles(isDarkMode);

  const saveDarkModeState = async (value) => {
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving dark mode state:', error);
    }
  };

  const loadDarkModeState = async () => {
    try {
      const value = await AsyncStorage.getItem('isDarkMode');
      if (value !== null) {
        setIsDarkMode(JSON.parse(value));
      }
    } catch (error) {
      console.error('Error loading dark mode state:', error);
    }
  };

  useEffect(() => {
    loadDarkModeState();
  }, []);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    saveDarkModeState(newDarkModeState);
  };

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


  const categories = ['All', ...new Set(timers.map(timer => timer.category))];

  const filteredTimers =
    selectedCategory === 'All'
      ? timers
      : timers.filter(timer => timer.category === selectedCategory);

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

  const addTimer = () => {
    const selectedCategory = category === 'Others' ? otherCategory : category;

  if (!timerName) {
    Alert.alert(
      "Missing Timer Name",
      "Please enter a name for the Task.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
    return; 
  }

  if (!duration) {
    Alert.alert(
      "Missing Duration",
      "Please enter a Duration for the Task.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
    return; 
  }

  if (!selectedCategory) {
    Alert.alert(
      "Missing Category",
      "Please select or enter a category for the Task.",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
    return; 
  }
    if (timerName && duration && selectedCategory) {
      const newTimer = {
        id: Date.now(),
        name: timerName,
        duration: parseInt(duration),
        remainingTime: parseInt(duration),
        category: selectedCategory,
        isRunning: false,
        completed: false,
        halfwayAlertEnabled,
      };
      setTimers([...timers, newTimer]);
      resetForm();
    }
  };


  const startTimer = (id) => {
    const updatedTimers = timers.map((timer) => {
      if (timer.id === id && !runningTimers[id]) {
        const interval = setInterval(() => {
          setTimers((prevTimers) =>
            prevTimers.map((t) => {
              if (t.id === id) {
                const updatedTime = t.remainingTime > 0 ? t.remainingTime - 1 : 0;

                console.log(`Timer ${id} - Remaining Time: ${updatedTime}`);

                if (t.halfwayAlertEnabled && updatedTime === Math.floor(t.duration / 2)) {
                  Toast.show(`You're halfway through the timer "${t.name}"!`);
                }

                if (updatedTime === 0) {
                  clearInterval(interval);
                  setRunningTimers((prev) => {
                    const updatedTimers = { ...prev };
                    delete updatedTimers[id];
                    return updatedTimers;
                  });
                  setModalVisibleComplete(true);
                  setCompletedTimer(t?.name);
                  saveCompletedTimer(t);
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

  const resetForm = () => {
    setTimerName('');
    setDuration('');
    setCategory('');
    setOtherCategory('');
    setModalVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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
        saveCompletedTimer(timer);
        setTimers((prevTimers) =>
          prevTimers.map((t) =>
            t.id === timer.id ? { ...t, completed: true } : t
          )
        );
      });
    }
  }, [timers]);




  const renderTimerItem = ({ item }) => {
    const progress = 1 - item.remainingTime / item.duration;
    const percentage = Math.floor(progress * 100);

    return (
      <View style={styles.timerItem}>
        <View style={{ flex: 1, width: '100%' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={[styles.timerText1]}>
              {item.name}
            </Text>
            <Text style={[styles.timerText, { fontSize: percentage === 100 ? 16 : 24 }]}>
              {percentage === 100 ? 'Completed' : `${formatTime(item.remainingTime)}`}
            </Text>
          </View>
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
        {
          percentage === 100 ? null :
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
        }

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


  const startAllTimersInCategory = (category) => {
    const categoryTimers = timers.filter((timer) => timer.category === category);
  
    categoryTimers.forEach((timer) => {
      if (!runningTimers[timer.id]) {
        console.log(`Starting timer with ID: ${timer.id}`); // Log when a timer starts
  
        const interval = setInterval(() => {
          setTimers((prevTimers) => {
            const updatedTimers = prevTimers.map((t) =>
              t.id === timer.id
                ? {
                    ...t,
                    remainingTime: t.remainingTime > 0 ? t.remainingTime - 1 : 0,
                  }
                : t
            );
  
            // Check if the current timer has finished
            const currentTimer = updatedTimers.find((t) => t.id === timer.id);
            if (currentTimer.remainingTime <= 0) {
              console.log(`Timer with ID: ${timer.id} has finished.`); // Log when a timer finishes
              setModalVisibleComplete(true);
              setCompletedTimer(timer?.name);
              clearInterval(interval);
              setRunningTimers((prev) => {
                const updatedRunningTimers = { ...prev };
                delete updatedRunningTimers[timer.id];
                return updatedRunningTimers;
              });
            } else {
              console.log(`Timer with ID: ${timer.id} has ${currentTimer.remainingTime} seconds remaining.`); // Log remaining time
            }
  
            return updatedTimers;
          });
        }, 1000);
  
        setRunningTimers((prev) => ({ ...prev, [timer.id]: interval }));
      }
    });
  
    setTimers((prevTimers) =>
      prevTimers.map((timer) =>
        timer.category === category ? { ...timer, isRunning: true } : timer
      )
    );
  
    console.log(`All timers in category "${category}" have been started.`); // Log when all timers in the category are started
  };

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
      <View style={{ backgroundColor: Colors.primary, height: '19%' }}>
        <View style={{ flexDirection: 'row', justifyContent: "space-between", marginTop: '2%', marginRight: '5%' }}>
          <Text style={[styles.greeting, { color: isDarkMode ? Colors.white : Colors.white }]}>
            Hello! 👋
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: "space-between", gap: 5 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('HistoryScreen')}
              style={styles.darkModeButton}>
              <Octicons
                name="history"
                size={26}
                color={isDarkMode ? '#FFD700' : Colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => toggleDarkMode()}
              style={styles.darkModeButton}>
              <Icon name={isDarkMode ? 'sun-o' : 'moon-o'} size={24} color={isDarkMode ? '#FFD700' : Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          style={[styles.picker, { color: isDarkMode ? '#FFD700' : Colors.primary }]}
          dropdownIconColor={isDarkMode ? '#FFD700' : Colors.primary}
        >
          {categories.map((category, index) => (
            <Picker.Item
              key={index}
              label={category}
              value={category}
              color={isDarkMode ? 'black' : Colors.primary}
            />
          ))}
        </Picker>

      </View>

      <View style={styles.container1}>
        <SectionList
          sections={groupTimersByCategory()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, section }) =>
            !collapsedCategories[section.category] ? renderTimerItem({ item }) : null
          }
          renderSectionHeader={renderSectionHeader}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No timers available. Add a new timer to get started!</Text>
            </View>
          )}
        />

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}>
          <AntDesign name="plus" size={24} color="white" />
        </TouchableOpacity>

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

              <RNPickerSelect
                onValueChange={(value) => setCategory(value)}
                items={categoryOptions}
                style={pickerSelectStyles}
                value={category}
                placeholder={{ label: 'Select a Category', value: '' }}
              />

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
              </View>
              <TouchableOpacity
                style={styles.graycircle1}
                onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={22} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={modalVisibleComplete} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent1}>
              <Ionicons
                name="checkmark-done-circle-sharp"
                size={106}
                color={Colors.green}
              />
              <View style={{ marginBottom: '5%', alignItems: 'center', justifyContent: "center" }}>

                <Text style={styles.modalHeader}>Congratulations! 🎉</Text>
                <Text style={styles.timerNameText}>You’ve successfully completed the {completedTimer}!</Text>
                <Text style={styles.timerNameText}>Great job staying focused and achieving your goal. Keep up the amazing work! 💪</Text>
              </View>

              <TouchableOpacity
                style={styles.graycircle1}
                onPress={() => setModalVisibleComplete(false)}>
                <AntDesign name="close" size={22} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const getStyles = (isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDarkMode ? '#333' : Colors.lightBlue,
  },
  container1: {
    flex: 1,
    padding: '3%',
    backgroundColor: isDarkMode ? '#333' : Colors.lightBlue,
  },
  picker: {
    height: 50,
    width: '90%',
    marginBottom: 16,
    backgroundColor: isDarkMode ? '#333' : Colors.lightBlue,
    alignSelf: "center",
    marginTop: '4%'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: '5%',
    backgroundColor: isDarkMode ? '#444' : 'white',
    borderRadius: 13,
    paddingHorizontal: '4%',
    paddingVertical: '5%',
    elevation: 5,
    marginVertical: '12%',
    marginHorizontal: '4%',
    justifyContent: 'center',
  },
  modalContent1: {
    backgroundColor: isDarkMode ? '#444' : 'white',
    borderRadius: 13,
    elevation: 5,
    marginVertical: '12%',
    marginHorizontal: '3%',
    justifyContent: 'center',
    alignItems: "center"
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: '5%',
    color: isDarkMode ? '#fff' : '#000',
  },
  input: {
    height: 40,
    borderColor: isDarkMode ? '#555' : '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
    color: isDarkMode ? '#fff' : '#000',
    backgroundColor: isDarkMode ? '#555' : '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3%',
    marginBottom: 8,
    backgroundColor: isDarkMode ? '#444' : 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flex: 1

  },
  timerText: {
    fontSize: 26,
    color: isDarkMode ? '#fff' : '#333',
    fontWeight: '600'
  },
  timerText1: {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#333',
    fontWeight: '600',
    width: '70%'
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginTop: '3%',
    overflow: 'hidden',
    flex: 1
  },
  percentageText: {
    fontSize: 12,
    color: isDarkMode ? '#fff' : '#333',
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '3%',
    paddingHorizontal: '3%',
    backgroundColor: isDarkMode ? '#555' : '#e0e8fe',
    borderRadius: 5,
    marginBottom: '5%',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDarkMode ? '#fff' : '#333',
  },
  toggleIcon: {
    fontSize: 16,
    color: '#666',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '3%',
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
  darkModeButton: {
    padding: 10,
    borderRadius: 20,
    borderRadius: 17,
    paddingHorizontal: 18,
    paddingVertical: 15,
    backgroundColor: isDarkMode ? '#555' : '#e0e8fe',
  },
  toggleLabel: {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#333',
  }, addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  }, greeting: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    marginLeft: '4.5%'
  }, graycircle1: {
    width: 35,
    height: 35,
    borderRadius: 19,
    backgroundColor: '#F3F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 10,
    right: 12
  }, timerNameText: {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: isDarkMode ? '#fff' : '#888',
    textAlign: 'center',
    marginTop: 20,
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
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ccc',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  }
});


export default TimerApp;