import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Text } from 'react-native';
import {
  ChatBubbleOvalLeftIcon,
  ClockIcon,
  HomeIcon,
  UserIcon,
} from 'react-native-heroicons/outline';

import MessagesPage from '../blog'; // Create or import
import HistoryPage from '../history'; // Create or import
import SettingsPage from '../profile'; // Create or import
import UserDashboard from '../userdb';

const Tab = createBottomTabNavigator();

const UserBottomTabs = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 60,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <HomeIcon color={color} size={24} />;
            case 'Messages':
              return <ChatBubbleOvalLeftIcon color={color} size={24} />;
            case 'History':
              return <ClockIcon color={color} size={24} />;
            case 'Settings':
              return <UserIcon color={color} size={24} />;
            default:
              return null;
          }
        },
        tabBarLabel: ({ color }) => {
          let label = route.name;
          return <Text style={{ fontSize: 10, color }}>{label}</Text>;
        },
        tabBarActiveTintColor: '#EC3237', // Primary
        tabBarInactiveTintColor: '#9CA3AF', // Gray
      })}
    >
      <Tab.Screen name="Home" component={UserDashboard} />
      <Tab.Screen name="Messages" component={MessagesPage} />
      <Tab.Screen name="History" component={HistoryPage} />
      <Tab.Screen name="Settings" component={SettingsPage} />
    </Tab.Navigator>
  );
};

export default UserBottomTabs;
