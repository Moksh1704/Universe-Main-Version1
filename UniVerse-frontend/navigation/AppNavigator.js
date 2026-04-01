import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import GetStartedScreen from '../screens/GetStartedScreen';
import { RegSelectionScreen, StudentRegScreen, FacultyRegScreen, LoginScreen } from '../screens/AuthScreens';
import HomeScreen from '../screens/HomeScreen';
import FeedScreen from '../screens/FeedScreen';
import EventsScreen from '../screens/EventsScreen';
import NavigationScreen from '../screens/NavigationScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import CareerScreen from '../screens/CareerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import TimetableScreen from '../screens/TimetableScreen';
import StudentBottomTabBar from '../components/StudentBottomTabBar';
import FacultyBottomTabBar from '../components/FacultyBottomTabBar';

const Stack = createStackNavigator();
const StudentTab = createBottomTabNavigator();
const FacultyTab = createBottomTabNavigator();

function StudentTabNavigator() {
  return (
    <StudentTab.Navigator
      tabBar={props => <StudentBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <StudentTab.Screen name="Home"       component={HomeScreen}       initialParams={{ role: 'student' }} />
      <StudentTab.Screen name="Attendance" component={AttendanceScreen} initialParams={{ role: 'student' }} />
      <StudentTab.Screen name="Feed"       component={FeedScreen} />
      <StudentTab.Screen name="Events"     component={EventsScreen} />
      <StudentTab.Screen name="Navigation" component={NavigationScreen} />
    </StudentTab.Navigator>
  );
}

function FacultyTabNavigator() {
  return (
    <FacultyTab.Navigator
      tabBar={props => <FacultyBottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="Timetable"
    >
      <FacultyTab.Screen name="Timetable"  component={TimetableScreen}  initialParams={{ role: 'faculty' }} />
      <FacultyTab.Screen name="Attendance" component={AttendanceScreen} initialParams={{ role: 'faculty' }} />
      <FacultyTab.Screen name="Profile"    component={ProfileScreen}    initialParams={{ role: 'faculty' }} />
    </FacultyTab.Navigator>
  );
}

function MainApp({ route }) {
  const role = route?.params?.role || 'student';
  return role === 'faculty' ? <FacultyTabNavigator /> : <StudentTabNavigator />;
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="GetStarted"
        screenOptions={{ headerShown: false, gestureEnabled: true }}
      >
        {/* GetStarted contains the video + all UI — no separate IntroScreen */}
        <Stack.Screen name="GetStarted"   component={GetStartedScreen} />
        <Stack.Screen name="RegSelection" component={RegSelectionScreen} />
        <Stack.Screen name="StudentReg"   component={StudentRegScreen} />
        <Stack.Screen name="FacultyReg"   component={FacultyRegScreen} />
        <Stack.Screen name="Login"        component={LoginScreen} />
        <Stack.Screen name="MainApp"      component={MainApp} />
        <Stack.Screen name="Profile" component={ProfileScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}
