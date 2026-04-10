import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function TypeScreen() {
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation<any>()

  const select = async (userType: 'WORKER' | 'HIRER') => {
    setLoading(true)
    try {
      await api.post('/api/onboarding/type', { userType })
      const user = await getUser()
      navigation.navigate('OnboardingDetails', { userType })
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed' })
    } finally { setLoading(false) }
  }

  return (
    <View style={s.container}>
      <View style={s.logo}>
        <View style={s.logoMark}><Text style={{ fontSize: 22 }}>⚡</Text></View>
        <Text style={s.logoText}>Trade<Text style={s.logoAccent}>dash</Text></Text>
      </View>
      <Text style={s.title}>How will you use Tradedash?</Text>
      <Text style={s.subtitle}>Choose your primary role. You can always update this later.</Text>

      {loading ? <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} /> : (
        <View style={s.cards}>
          <TouchableOpacity style={s.card} onPress={() => select('WORKER')} activeOpacity={0.8}>
            <View style={s.cardIcon}><Feather name="tool" size={28} color={colors.accent} /></View>
            <Text style={s.cardTitle}>Looking for work</Text>
            <Text style={s.cardSub}>I am seeking job opportunities in the trades industry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.card} onPress={() => select('HIRER')} activeOpacity={0.8}>
            <View style={s.cardIcon}><Feather name="briefcase" size={28} color={colors.accent} /></View>
            <Text style={s.cardTitle}>Hiring workers</Text>
            <Text style={s.cardSub}>I need to find suitable tradespeople for my projects</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'center' },
  logo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  logoMark: { width: 40, height: 40, backgroundColor: colors.accent, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoText: { fontSize: 24, fontWeight: '700', color: colors.text },
  logoAccent: { color: colors.accent },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: 32 },
  cards: { gap: 14 },
  card: { backgroundColor: colors.bg2, borderRadius: 16, padding: 24, borderWidth: 0.5, borderColor: colors.border },
  cardIcon: { width: 52, height: 52, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 6 },
  cardSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18 },
})
