import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Feather } from '@expo/vector-icons'
import { colors } from '@/lib/utils'

// Auth screens
import LoginScreen from '@/screens/auth/LoginScreen'
import RegisterScreen from '@/screens/auth/RegisterScreen'
import VerifyScreen from '@/screens/auth/VerifyScreen'
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen'

// Onboarding
import OnboardingTypeScreen from '@/screens/onboarding/TypeScreen'
import OnboardingDetailsScreen from '@/screens/onboarding/DetailsScreen'
import WorkerProfileScreen from '@/screens/onboarding/WorkerProfileScreen'
import HirerProfileScreen from '@/screens/onboarding/HirerProfileScreen'

// Main app
import JobsScreen from '@/screens/jobs/JobsScreen'
import JobDetailScreen from '@/screens/jobs/JobDetailScreen'
import NewJobScreen from '@/screens/jobs/NewJobScreen'
import ForumScreen from '@/screens/forum/ForumScreen'
import ForumPostScreen from '@/screens/forum/ForumPostScreen'
import DashboardScreen from '@/screens/dashboard/DashboardScreen'
import MessagesScreen from '@/screens/dashboard/MessagesScreen'
import ConversationScreen from '@/screens/dashboard/ConversationScreen'
import ProfileScreen from '@/screens/profile/ProfileScreen'

export type RootStackParamList = {
  Login: undefined
  Register: undefined
  Verify: { phone: string }
  ForgotPassword: undefined
  OnboardingType: undefined
  OnboardingDetails: { userType: string }
  WorkerProfile: undefined
  HirerProfile: undefined
  MainTabs: undefined
  JobDetail: { id: string }
  NewJob: undefined
  ForumPost: { id: string }
  Conversation: { conversationId: string; name: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator()

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 16 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.bg },
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarStyle: { backgroundColor: colors.bg2, borderTopColor: colors.border, borderTopWidth: 0.5 },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: { fontSize: 11 },
      headerStyle: { backgroundColor: colors.bg },
      headerTintColor: colors.text,
      headerTitleStyle: { fontWeight: '600' as const },
      headerShadowVisible: false,
    }}>
      <Tab.Screen name="Jobs" component={JobsScreen}
        options={{ title: 'Browse jobs', tabBarIcon: ({ color }) => <Feather name="briefcase" size={20} color={color} /> }} />
      <Tab.Screen name="Forum" component={ForumScreen}
        options={{ title: 'Forum', tabBarIcon: ({ color }) => <Feather name="message-circle" size={20} color={color} /> }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen}
        options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Feather name="grid" size={20} color={color} /> }} />
      <Tab.Screen name="Messages" component={MessagesScreen}
        options={{ title: 'Messages', tabBarIcon: ({ color }) => <Feather name="mail" size={20} color={color} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={20} color={color} /> }} />
    </Tab.Navigator>
  )
}

export default function Navigation({ initialRoute }: { initialRoute: string }) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute as any} screenOptions={screenOptions}>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Verify" component={VerifyScreen} options={{ title: 'Verify phone' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset password' }} />
        <Stack.Screen name="OnboardingType" component={OnboardingTypeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OnboardingDetails" component={OnboardingDetailsScreen} options={{ title: 'Your details' }} />
        <Stack.Screen name="WorkerProfile" component={WorkerProfileScreen} options={{ title: 'Worker profile' }} />
        <Stack.Screen name="HirerProfile" component={HirerProfileScreen} options={{ title: 'Company profile' }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} options={{ title: 'Job details' }} />
        <Stack.Screen name="NewJob" component={NewJobScreen} options={{ title: 'Post a job' }} />
        <Stack.Screen name="ForumPost" component={ForumPostScreen} options={{ title: 'Discussion' }} />
        <Stack.Screen name="Conversation" component={ConversationScreen} options={({ route }) => ({ title: (route.params as any).name })} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
