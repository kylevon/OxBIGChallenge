import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InputScreen from './screens/InputScreen';
import EntriesScreen from './screens/EntriesScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import { FoodProvider } from './contexts/FoodContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <FoodProvider>
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Record Food"
          screenOptions={{
            tabBarLabelPosition: 'below-icon',
          }}
        >
          <Tab.Screen name="Journal" component={EntriesScreen} />
          <Tab.Screen name="Record Food" component={InputScreen} />
          <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </FoodProvider>
  );
}
