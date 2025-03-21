import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, Alert, TouchableOpacity, SectionList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import Colors from '../../constants/Colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const HistoryScreen = ({ navigation }) => {
    const [completedTimers, setCompletedTimers] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load dark mode state and completed timers on mount
    useEffect(() => {
        loadDarkModeState();
        loadCompletedTimers();
    }, []);

    // Load dark mode state from AsyncStorage
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

    // Export timer history as a JSON file
    const exportHistory = async () => {
        try {
            const jsonData = JSON.stringify(completedTimers, null, 2);
            const fileName = 'timer_history.json';
            const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

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

    // Group completed timers by date
    const groupTimersByDate = () => {
        const groupedTimers = {};
        completedTimers.forEach(timer => {
            const date = timer.completionTime.split('T')[0]; // Extract the date part
            if (!groupedTimers[date]) {
                groupedTimers[date] = [];
            }
            groupedTimers[date].push(timer);
        });

        // Convert the grouped timers into an array for SectionList
        return Object.keys(groupedTimers).map(date => ({
            title: date,
            data: groupedTimers[date],
        }));
    };

    // Render a completed timer item
    const renderItem = ({ item }) => (
        <View style={[styles.item, isDarkMode && styles.itemDark]}>
            <Text style={[styles.timerName, isDarkMode && styles.textDark]}>{item.name}</Text>
            <Text style={[styles.completionTime, isDarkMode && styles.textDark]}>Completed at: {item.completionTime}</Text>
        </View>
    );

    // Render a section header
    const renderSectionHeader = ({ section: { title } }) => (
        <View style={[styles.sectionHeader, isDarkMode && styles.sectionHeaderDark]}>
            <Text style={[styles.sectionHeaderText, isDarkMode && styles.textDark]}>{title}</Text>
        </View>
    );

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <View style={[styles.container1, isDarkMode && styles.container1Dark]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.darkModeButton}>
                    <Ionicons
                        name="arrow-back"
                        size={26}
                        color={isDarkMode ? '#FFD700' : 'white'}
                    />
                </TouchableOpacity>
                <Text style={[styles.headerText, isDarkMode && styles.textDark]}>Completed Tasks</Text>
                <TouchableOpacity
                    onPress={() => exportHistory()}
                    style={styles.darkModeButton}>
                    <AntDesign
                        name="clouddownloado"
                        size={30}
                        color={isDarkMode ? '#FFD700' : 'white'}
                    />
                </TouchableOpacity>
            </View>

            {completedTimers.length > 0 ? (
                <SectionList
                    sections={groupTimersByDate()}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    keyExtractor={(item) => item.id.toString()}
                />
            ) : (
                <Text style={[styles.noTimersText, isDarkMode && styles.textDark]}>No completed timers yet.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.lightBlue,
    },
    containerDark: {
        backgroundColor: '#121212',
    },
    container1: {
        padding: 16,
        backgroundColor: Colors.primary,
        height: '8%',
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
    },
    container1Dark: {
        backgroundColor: '#1F1F1F',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
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
    itemDark: {
        backgroundColor: '#333',
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
    textDark: {
        color: '#FFFFFF',
    },
    noTimersText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    sectionHeader: {
        backgroundColor: '#F0F0F0',
        padding: 10,
    },
    sectionHeaderDark: {
        backgroundColor: '#1F1F1F',
    },
    sectionHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default HistoryScreen;