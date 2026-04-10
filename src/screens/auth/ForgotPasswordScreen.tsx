import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import Toast from 'react-native-toast-message'
import { useNavigation } from '@react-navigation/native'
import api from '@/lib/api'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'phone' | 'code' | 'reset'>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()

  const normalise = (p: string) => {
    const d = p.replace(/\D/g, '')
    if (d.startsWith('61')) return '+' + d
    if (d.startsWith('0')) return '+61' + d.slice(1)
    return '+61' + d
  }

  const sendCode = async () => {
    setLoading(true)
    try {
      await api.post('/api/auth/forgot-password', { phone: normalise(phone) })
      Toast.show({ type: 'success', text1: 'Reset code sent!' })
      setStep('code')
    } catch (err: any) { Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed' }) }
    finally { setLoading(false) }
  }

  const resetPassword = async () => {
    if (password !== confirm) return Toast.show({ type: 'error', text1: 'Passwords do not match' })
    setLoading(true)
    try {
      await api.post('/api/auth/reset-password', { phone: normalise(phone), code, newPassword: password })
      Toast.show({ type: 'success', text1: 'Password reset! Please log in.' })
      navigation.navigate('Login')
    } catch (err: any) { Toast.show({ type: 'error', text1: err.response?.data?.error || 'Reset failed' }) }
    finally { setLoading(false) }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Reset password</Text>

      {step === 'phone' && <>
        <Text style={globalStyles.label}>Your mobile number</Text>
        <TextInput style={globalStyles.input} value={phone} onChangeText={setPhone} placeholder="04XX XXX XXX" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 16 }]} onPress={sendCode} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Sending...' : 'Send reset code'}</Text>
        </TouchableOpacity>
      </>}

      {step === 'code' && <>
        <Text style={s.sub}>Enter the code sent to {phone}</Text>
        <TextInput style={[globalStyles.input, s.codeInput]} value={code} onChangeText={setCode} placeholder="000000" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={6} textAlign="center" />
        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 16 }]} onPress={() => setStep('reset')} disabled={code.length !== 6}>
          <Text style={globalStyles.btnPrimaryText}>Continue</Text>
        </TouchableOpacity>
      </>}

      {step === 'reset' && <>
        <Text style={globalStyles.label}>New password</Text>
        <TextInput style={globalStyles.input} value={password} onChangeText={setPassword} placeholder="Min 8 chars" placeholderTextColor={colors.textMuted} secureTextEntry />
        <View style={{ height: 12 }} />
        <Text style={globalStyles.label}>Confirm new password</Text>
        <TextInput style={globalStyles.input} value={confirm} onChangeText={setConfirm} placeholder="Repeat password" placeholderTextColor={colors.textMuted} secureTextEntry />
        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 16 }]} onPress={resetPassword} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Resetting...' : 'Set new password'}</Text>
        </TouchableOpacity>
      </>}
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, marginBottom: 20 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 16 },
  codeInput: { fontSize: 24, letterSpacing: 10, paddingVertical: 14 },
})
