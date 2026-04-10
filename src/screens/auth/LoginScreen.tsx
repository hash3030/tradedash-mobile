import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { useAuth } from '@/hooks/useAuth'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function LoginScreen() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()
  const { login: doLogin } = useAuth()

  const normalisePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '')
    if (digits.startsWith('61')) return '+' + digits
    if (digits.startsWith('0')) return '+61' + digits.slice(1)
    return phone
  }

  const handleLogin = async () => {
    if (!login || !password) return Toast.show({ type: 'error', text1: 'Please enter your phone number and password' })
    setLoading(true)
    try {
      const loginVal = login.includes('@') ? login.trim() : normalisePhone(login)
      const user = await doLogin(loginVal, password)
      if (!user.onboardingComplete) {
        navigation.reset({ index: 0, routes: [{ name: 'OnboardingType' }] })
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Login failed' })
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Logo */}
      <View style={styles.logo}>
        <View style={styles.logoMark}>
          <Text style={styles.logoIcon}>⚡</Text>
        </View>
        <Text style={styles.logoText}>Trade<Text style={styles.logoAccent}>dash</Text></Text>
      </View>

      <Text style={styles.title}>Welcome back</Text>
      <Text style={styles.subtitle}>Log in with your mobile number</Text>

      <View style={styles.form}>
        <Text style={globalStyles.label}>Mobile number or email</Text>
        <TextInput
          style={globalStyles.input}
          value={login}
          onChangeText={setLogin}
          placeholder="0412 345 678"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={{ height: 14 }} />

        <View style={styles.passwordRow}>
          <Text style={globalStyles.label}>Password</Text>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotLink}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={globalStyles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />

        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 20 }]} onPress={handleLogin} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Logging in...' : 'Log in'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.signupLink}>No account? <Text style={styles.signupLinkAccent}>Sign up free</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  logo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  logoMark: { width: 40, height: 40, backgroundColor: colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoIcon: { fontSize: 20 },
  logoText: { fontSize: 24, fontWeight: '700', color: colors.text },
  logoAccent: { color: colors.accent },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  form: { backgroundColor: colors.bg2, borderRadius: 16, padding: 20, borderWidth: 0.5, borderColor: colors.border },
  passwordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  forgotLink: { fontSize: 12, color: colors.accent },
  signupLink: { fontSize: 13, color: colors.textMuted },
  signupLinkAccent: { color: colors.accent },
})
