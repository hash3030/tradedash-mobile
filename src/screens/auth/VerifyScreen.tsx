import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function VerifyScreen() {
  const route = useRoute<any>()
  const { phone } = route.params
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [step, setStep] = useState<'code' | 'details'>('code')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()

  const verifyCode = async () => {
    if (code.length !== 6) return Toast.show({ type: 'error', text1: 'Enter the 6-digit code' })
    setLoading(true)
    try {
      await api.post('/api/auth/verify-code', { phone, code })
      Toast.show({ type: 'success', text1: 'Phone verified!' })
      setStep('details')
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Invalid code' })
    } finally { setLoading(false) }
  }

  const validatePassword = (p: string) =>
    p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p)

  const complete = async () => {
    if (!firstName || !lastName) return Toast.show({ type: 'error', text1: 'Please enter your name' })
    if (!validatePassword(password)) return Toast.show({ type: 'error', text1: 'Password needs 8+ chars, uppercase, lowercase and number' })
    if (password !== confirmPassword) return Toast.show({ type: 'error', text1: 'Passwords do not match' })
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', { phone, password, firstName, lastName, agreedToTerms: true })
      const { setAuth } = await import('@/lib/auth')
      await setAuth(res.data.token, res.data.user)
      navigation.reset({ index: 0, routes: [{ name: 'OnboardingType' }] })
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Registration failed' })
    } finally { setLoading(false) }
  }

  const resend = async () => {
    try {
      await api.post('/api/auth/resend-code', { phone })
      Toast.show({ type: 'success', text1: 'New code sent!' })
    } catch { Toast.show({ type: 'error', text1: 'Failed to resend' }) }
  }

  if (step === 'code') return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Verify your number</Text>
      <Text style={styles.subtitle}>We sent a 6-digit code to {phone}</Text>
      <TextInput
        style={[globalStyles.input, styles.codeInput]}
        value={code} onChangeText={setCode}
        placeholder="000000" placeholderTextColor={colors.textMuted}
        keyboardType="number-pad" maxLength={6}
        textAlign="center"
      />
      <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 16 }]} onPress={verifyCode} disabled={loading || code.length !== 6}>
        <Text style={globalStyles.btnPrimaryText}>{loading ? 'Verifying...' : 'Verify code'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ marginTop: 12, alignItems: 'center' }} onPress={resend}>
        <Text style={styles.resendLink}>Resend code</Text>
      </TouchableOpacity>
    </ScrollView>
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Complete your account</Text>
      <Text style={styles.subtitle}>Just a few more details</Text>
      <View style={styles.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={globalStyles.label}>First name</Text>
          <TextInput style={globalStyles.input} value={firstName} onChangeText={setFirstName} placeholder="Dan" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.label}>Last name</Text>
          <TextInput style={globalStyles.input} value={lastName} onChangeText={setLastName} placeholder="Smith" placeholderTextColor={colors.textMuted} />
        </View>
      </View>
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Password (min 8 chars, uppercase, lowercase, number)</Text>
      <TextInput style={globalStyles.input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Confirm password</Text>
      <TextInput style={globalStyles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" placeholderTextColor={colors.textMuted} secureTextEntry />
      <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 20 }]} onPress={complete} disabled={loading}>
        <Text style={globalStyles.btnPrimaryText}>{loading ? 'Creating account...' : 'Create account'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginBottom: 24 },
  codeInput: { fontSize: 28, letterSpacing: 12, paddingVertical: 16 },
  row: { flexDirection: 'row' },
  resendLink: { fontSize: 13, color: colors.accent },
})
