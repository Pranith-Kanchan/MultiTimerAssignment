import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Colors from '../../constants/Colors';
import {AnimatedFAB} from 'react-native-paper';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import CircularProgress from 'react-native-circular-progress-indicator';

const Dashboard = ({navigation}) => {
  return (
    <View style={styles.container}>
      <View style={styles.HeadersStyle}>
        <Text style={styles.subtitle}>Wellcome</Text>
        <Text style={styles.title}>Good afternoon, Alex</Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fabStyle: {
    position: 'absolute',
    right: '4%',
    bottom: '5%',
    backgroundColor: Colors.primary,
    borderRadius: 30,
  },
});

export default Dashboard;
