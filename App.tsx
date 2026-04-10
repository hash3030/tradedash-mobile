import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Toast from 'react-native-toast-message'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Navigation from '@/navigation'
import { getUser } from '@/lib/auth'

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing app...')

        // Timeout protection (3s)
        const timeout = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 3000)
        )

        const user = await Promise.race([getUser(), timeout])

        console.log('User result:', user)

        if (!user) {
          setInitialRoute('Login')
        } else if (!user.onboardingComplete) {
          setInitialRoute('OnboardingType')
        } else {
          setInitialRoute('MainTabs')
        }
      } catch (error) {
        console.error('getUser failed:', error)
        setInitialRoute('Login') // fallback so app never freezes
      }
    }

    init()
  }, [])

  // 👇 Loading screen instead of blank freeze
  if (!initialRoute) {
    return (
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" />
      </GestureHandlerRootView>
    )
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Navigation initialRoute={initialRoute} />
      <Toast />
    </GestureHandlerRootView>
  )
}
