import React from 'react';
import {SafeAreaView} from 'react-native';
import Dashboard from './src/screens/Dashboard';

const App = () => {
  const [loading, setLoading] = React.useState(true);

  return (
      <SafeAreaView style={{flex: 1}}>
          <Dashboard />
      </SafeAreaView>
  );
};

export default App;
