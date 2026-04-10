import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import * as SecureStore from 'expo-secure-store'
import api from '@/lib/api'
import { colors } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'

const SKILLS = ['Bricklaying','Plumbing','Roof Plumbing','Formwork','Concrete','Demolition','Drainage','Electrical','Excavation','Carpentry','Landscaping','Plastering','Painting','Tiling','Fencing','General Labour','Steel Fixing','Scaffolding','Cleaning','Welding']

export default function WorkerProfileScreen() {
  const navigation = useNavigation<any>()
  const [skills, setSkills] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [experienceLevel, setExperienceLevel] = useState('')
  const [availability, setAvailability] = useState('')
  const [suburb, setSuburb] = useState('')
  const [postcode, setPostcode] = useState('')
  const [state, setState] = useState('VIC')
  const [loading, setLoading] = useState(false)

  const toggleSkill = (s: string) => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const save = async () => {
    if (skills.length === 0) return Toast.show({ type: 'error', text1: 'Select at least one skill' })
    setLoading(true)
    try {
      await api.post('/api/onboarding/worker-profile', { bio, skills, experienceLevel: experienceLevel || null, availability: availability || null, suburb, postcode, state })
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
      <Text style={s.title}>Worker profile</Text>
      <Text style={s.sub}>Tell hirers about your skills and experience</Text>

      <Text style={globalStyles.label}>Bio</Text>
      <TextInput style={[globalStyles.input, { height: 80 }]} value={bio} onChangeText={setBio} placeholder="Briefly describe your experience..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />

      <View style={{ height: 16 }} />
      <Text style={globalStyles.sectionTitle}>Skills (select at least 1) *</Text>
      <View style={s.skills}>
        {SKILLS.map(skill => (
          <TouchableOpacity key={skill} onPress={() => toggleSkill(skill)}
            style={[s.skill, skills.includes(skill) && s.skillActive]}>
            <Text style={[s.skillText, skills.includes(skill) && s.skillTextActive]}>{skill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 16 }} />
      <Text style={globalStyles.label}>Suburb</Text>
      <TextInput style={globalStyles.input} value={suburb} onChangeText={setSuburb} placeholder="e.g. Frankston" placeholderTextColor={colors.textMuted} />
      <View style={{ height: 12 }} />
      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={globalStyles.label}>Postcode</Text>
          <TextInput style={globalStyles.input} value={postcode} onChangeText={setPostcode} placeholder="3199" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={4} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.label}>State</Text>
          <TextInput style={globalStyles.input} value={state} onChangeText={setState} placeholder="VIC" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={3} />
        </View>
      </View>

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
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skill: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border },
  skillActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: colors.accent },
  skillText: { fontSize: 12, color: colors.textMuted },
  skillTextActive: { color: colors.accent },
  row: { flexDirection: 'row' },
  btns: { flexDirection: 'row', marginTop: 24 },
})
