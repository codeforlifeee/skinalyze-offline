import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import SplashScreenComponent from './components/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import ClinicianDashboard from './src/screens/ClinicianDashboard';
import PatientDashboard from './src/screens/PatientDashboard';
import CameraScreen from './src/screens/CameraScreen';
import DiagnosisResultScreen from './src/screens/DiagnosisResultScreen';
import PatientDetailsScreen from './src/screens/PatientDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setUserType(null);
  };

  if (showSplash) {
    return <SplashScreenComponent />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#0369a1',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen
                {...props}
                onLoginSuccess={handleLoginSuccess}
                onUserTypeChange={handleUserTypeChange}
              />
            )}
          </Stack.Screen>
        ) : userType === 'clinician' ? (
          <>
            <Stack.Screen
              name="Dashboard"
              component={ClinicianDashboard}
              options={{
                title: 'SAGAlyze - Clinician',
                headerRight: () => (
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={{ marginRight: 10 }}
                  >
                    <Text style={{ color: '#ef4444', fontWeight: '600' }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="PatientDetails"
              component={PatientDetailsScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                title: 'Capture Image',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="DiagnosisResult"
              component={DiagnosisResultScreen}
              options={{
                title: 'Diagnosis Result',
                headerShown: false,
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="PatientDashboard"
            component={PatientDashboard}
            options={{
              title: 'SAGAlyze - Patient',
              headerRight: () => (
                <TouchableOpacity
                  onPress={handleLogout}
                  style={{ marginRight: 10 }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '600' }}>
                    Logout
                  </Text>
                </TouchableOpacity>
              ),
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
