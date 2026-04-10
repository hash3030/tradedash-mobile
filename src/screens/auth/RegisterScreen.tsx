import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Linking } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function RegisterScreen() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()

  const normalisePhone = (p: string) => {
    const digits = p.replace(/\D/g, '')
    if (digits.startsWith('61')) return '+' + digits
    if (digits.startsWith('0')) return '+61' + digits.slice(1)
    return '+61' + digits
  }

  const isValidAusMobile = (p: string) => /^\+614\d{8}$/.test(normalisePhone(p))

  const sendCode = async () => {
    if (!isValidAusMobile(phone)) {
      return Toast.show({ type: 'error', text1: 'Enter a valid Australian mobile (04XX XXX XXX)' })
    }
    setLoading(true)
    try {
      const normalised = normalisePhone(phone)
      await api.post('/api/auth/send-code', { phone: normalised })
      Toast.show({ type: 'success', text1: 'Verification code sent!' })
      navigation.navigate('Verify', { phone: normalised })
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to send code' })
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.logo}>
        <View style={styles.logoMark}><Text style={styles.logoIcon}>⚡</Text></View>
        <Text style={styles.logoText}>Trade<Text style={styles.logoAccent}>dash</Text></Text>
      </View>

      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>Free to join — always</Text>

      <View style={styles.form}>
        <Text style={styles.stepLabel}>Step 1 of 3 — Enter your mobile</Text>
        <Text style={globalStyles.label}>Australian mobile number</Text>
        <TextInput
          style={globalStyles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="04XX XXX XXX"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
        />
        <Text style={styles.hint}>Must start with 04 — Australian mobiles only</Text>

        <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 20 }]} onPress={sendCode} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Sending code...' : 'Send verification code'}</Text>
        </TouchableOpacity>

        <View style={styles.terms}>
          <Text style={styles.termsText}>
            By continuing you agree to Tradedash's{' '}
            <Text style={styles.termsLink} onPress={() => Linking.openURL('https://tradedash.com.au/terms')}>Terms & Conditions</Text>
            {' '}and{' '}
            <Text style={styles.termsLink} onPress={() => Linking.openURL('https://tradedash.com.au/privacy')}>Privacy Policy</Text>.
            You consent to the collection and sharing of your profile information as described in the Privacy Policy.
          </Text>
        </View>

        <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? <Text style={styles.loginLinkAccent}>Log in</Text></Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 24, paddingTop: 60 },
  logo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  logoMark: { width: 36, height: 36, backgroundColor: colors.accent, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: 22, fontWeight: '700', color: colors.text },
  logoAccent: { color: colors.accent },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 28 },
  form: { backgroundColor: colors.bg2, borderRadius: 16, padding: 20, borderWidth: 0.5, borderColor: colors.border },
  stepLabel: { fontSize: 11, color: colors.accent, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  terms: { marginTop: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8 },
  termsText: { fontSize: 11, color: colors.textMuted, lineHeight: 16 },
  termsLink: { color: colors.accent },
  loginLink: { fontSize: 13, color: colors.textMuted },
  loginLinkAccent: { color: colors.accent },
})
