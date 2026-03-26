import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { colors } from './src/theme'

import LoginScreen from './src/screens/LoginScreen'
import SignupScreen from './src/screens/SignupScreen'
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen'
import ResetPasswordScreen from './src/screens/ResetPasswordScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import AdminScreen from './src/screens/AdminScreen'

const Stack = createNativeStackNavigator()
const ADMIN_EMAIL = 'simplefinance.com@gmail.com'

function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark }}>
        <Text style={{ color: colors.white, fontSize: 18 }}>Simple Finance</Text>
      </View>
    )
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.dark },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '600' },
        headerBackTitle: '返回',
      }}
    >
      {user ? (
        // Logged in
        user.email === ADMIN_EMAIL ? (
          <Stack.Screen name="Admin" component={AdminScreen} options={{ title: '管理後台', headerShown: false }} />
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: '我的資產', headerShown: false }} />
        )
      ) : (
        // Not logged in
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: '註冊' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: '忘記密碼' }} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: '重設密碼' }} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  )
}
