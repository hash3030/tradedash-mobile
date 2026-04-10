import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import * as SecureStore from 'expo-secure-store'
import api from '@/lib/api'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

export default function HirerProfileScreen() {
  const navigation = useNavigation<any>()
  const [companyName, setCompanyName] = useState('')
  const [abn, setAbn] = useState('')
  const [industry, setIndustry] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!companyName) return Toast.show({ type: 'error', text1: 'Company name is required' })
    if (!abn || abn.replace(/\s/g, '').length < 11) return Toast.show({ type: 'error', text1: 'ABN must be at least 11 digits' })
    setLoading(true)
    try {
      await api.post('/api/onboarding/hirer-profile', { companyName, abn, industry, contactPhone, contactEmail, preferredComms: [] })
      const u = await SecureStore.getItemAsync('td_user')
      if (u) {
        const parsed = JSON.parse(u)
        parsed.onboardingComplete = true
        await SecureStore.setItemAsync('td_user', JSON.stringify(parsed))
      }
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to save' })
    } finally { setLoading(false) }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Company profile</Text>
      <Text style={s.sub}>Tell us about your hiring requirements</Text>

      <Text style={globalStyles.label}>Company name *</Text>
      <TextInput style={globalStyles.input} value={companyName} onChangeText={setCompanyName} placeholder="BuildJet Pty Ltd" placeholderTextColor={colors.textMuted} />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>ABN * (at least 11 digits)</Text>
      <TextInput style={globalStyles.input} value={abn} onChangeText={setAbn} placeholder="XX XXX XXX XXX" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Industry</Text>
      <TextInput style={globalStyles.input} value={industry} onChangeText={setIndustry} placeholder="e.g. Construction" placeholderTextColor={colors.textMuted} />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Contact phone</Text>
      <TextInput style={globalStyles.input} value={contactPhone} onChangeText={setContactPhone} placeholder="04XX XXX XXX" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Contact email</Text>
      <TextInput style={globalStyles.input} value={contactEmail} onChangeText={setContactEmail} placeholder="jobs@company.com" placeholderTextColor={colors.textMuted} keyboardType="email-address" autoCapitalize="none" />

      <View style={s.btns}>
        <TouchableOpacity style={[globalStyles.btnSecondary, { flex: 1, marginRight: 8 }]} onPress={() => navigation.goBack()}>
          <Text style={globalStyles.btnSecondaryText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[globalStyles.btnPrimary, { flex: 1 }]} onPress={save} disabled={loading}>
          <Text style={globalStyles.btnPrimaryText}>{loading ? 'Saving...' : 'Complete profile'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginBottom: 20 },
  btns: { flexDirection: 'row', marginTop: 24 },
})
