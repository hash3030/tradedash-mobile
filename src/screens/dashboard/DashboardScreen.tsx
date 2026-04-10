import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { getUser } from '@/lib/auth'
import { colors } from '@/lib/utils'

export default function DashboardScreen() {
  const [user, setUser] = useState<any>(null)
  const navigation = useNavigation<any>()

  useEffect(() => { getUser().then(setUser) }, [])

  const isWorker = user?.userType === 'WORKER'

  const workerActions = [
    { icon: 'briefcase', label: 'Browse jobs', sub: 'Find work near you', onPress: () => navigation.navigate('Jobs') },
    { icon: 'message-circle', label: 'Messages', sub: 'Your conversations', onPress: () => navigation.navigate('Messages') },
    { icon: 'user', label: 'My profile', sub: 'Update your profile', onPress: () => navigation.navigate('Profile') },
    { icon: 'star', label: 'Upgrade plan', sub: `Current: ${user?.plan}`, onPress: () => {} },
  ]

  const hirerActions = [
    { icon: 'plus-circle', label: 'Post a job', sub: 'Find the right tradie', onPress: () => navigation.navigate('NewJob') },
    { icon: 'list', label: 'My jobs', sub: 'Manage listings', onPress: () => {} },
    { icon: 'message-circle', label: 'Messages', sub: 'Your conversations', onPress: () => navigation.navigate('Messages') },
    { icon: 'user', label: 'My profile', sub: 'Update company profile', onPress: () => navigation.navigate('Profile') },
  ]

  const actions = isWorker ? workerActions : hirerActions

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.greeting}>
        <Text style={s.greetingText}>Hi, {user?.firstName} 👋</Text>
        <Text style={s.planBadge}>{user?.plan || 'FREE'} plan</Text>
      </View>

      <View style={s.grid}>
        {actions.map((a, i) => (
          <TouchableOpacity key={i} style={s.tile} onPress={a.onPress} activeOpacity={0.7}>
            <View style={s.tileIcon}>
              <Feather name={a.icon as any} size={22} color={colors.accent} />
            </View>
            <Text style={s.tileLabel}>{a.label}</Text>
            <Text style={s.tileSub}>{a.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 20, fontWeight: '600', color: colors.text },
  planBadge: { fontSize: 11, color: colors.accent, backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '47%', backgroundColor: colors.bg2, borderRadius: 14, padding: 16, borderWidth: 0.5, borderColor: colors.border },
  tileIcon: { width: 42, height: 42, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  tileLabel: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 3 },
  tileSub: { fontSize: 11, color: colors.textMuted },
})
