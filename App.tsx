import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Navigation from '@/navigation'
import { getUser } from '@/lib/auth'

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    getUser().then(user => {
      if (!user) {
        setInitialRoute('Login')
      } else if (!user.onboardingComplete) {
        setInitialRoute('OnboardingType')
      } else {
        setInitialRoute('MainTabs')
      }
    })
  }, [])

  if (!initialRoute) return null

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Navigation initialRoute={initialRoute} />
      <Toast />
    </GestureHandlerRootView>
  )
}
