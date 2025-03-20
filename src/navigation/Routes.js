import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppStack from './AppStack';

export default function Routes() {
    return (
        <NavigationContainer >
           <AppStack />
        </NavigationContainer>
    );
}