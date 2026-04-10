import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function DetailsScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { userType } = route.params
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getUser().then(u => {
      if (u) { setFirstName(u.firstName || ''); setLastName(u.lastName || ''); setEmail(u.email || ''); setPhone(u.phone || '') }
    })
  }, [])

  const next = async () => {
    if (!firstName || !lastName) return Toast.show({ type: 'error', text1: 'Please enter your name' })
    setLoading(true)
    try {
      await api.post('/api/onboarding/confirm-details', { firstName, lastName, email })
      navigation.navigate(userType === 'WORKER' ? 'WorkerProfile' : 'HirerProfile')
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed' })
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Confirm your details</Text>
      <Text style={styles.sub}>Please check your information below</Text>

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
      <Text style={globalStyles.label}>Phone number (your login)</Text>
      <TextInput style={[globalStyles.input, { opacity: 0.5 }]} value={phone} editable={false} />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Email (optional)</Text>
      <TextInput style={globalStyles.input} value={email} onChangeText={setEmail} placeholder="your@email.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

      <View style={styles.btns}>
        <TouchableOpacity style={[globalStyles.btnSecondary, { flex: 1, marginRight: 8 }]} onPress={() => navigation.goBack()}>
          <Text style={globalStyles.btnSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.btnPrimary, { flex: 1 }]} onPress={next} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Saving...' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingTop: 16 },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  row: { flexDirection: 'row' },
  btns: { flexDirection: 'row', marginTop: 24 },
})
