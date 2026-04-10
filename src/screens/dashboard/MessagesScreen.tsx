import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function MessagesScreen() {
  const [convos, setConvos] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<any>()

  const fetchConvos = async () => {
    try {
      const [u, res] = await Promise.all([getUser(), api.get('/api/messages/conversations')])
      setUser(u)
      setConvos(Array.isArray(res.data) ? res.data : [])
    } catch {} finally { setRefreshing(false) }
  }

  useEffect(() => { fetchConvos() }, [])

  const other = (convo: any) => convo.participants?.find((p: any) => p.id !== user?.id)
  const getName = (convo: any) => {
    const o = other(convo)
    return o?.hirerProfile?.companyName || `${o?.firstName || ''} ${o?.lastName || ''}`.trim()
  }

  return (
    <View style={s.container}>
      <FlatList
        data={convos}
        keyExtractor={item => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConvos() }} tintColor={colors.accent} />}
        ListEmptyComponent={
          <View style={s.empty}>
            <Feather name="mail" size={40} color={colors.textMuted} />
            <Text style={s.emptyText}>No conversations yet</Text>
            <Text style={s.emptySubText}>Apply to a job to start messaging</Text>
          </View>
        }
        renderItem={({ item }) => {
          const o = other(item)
          const lastMsg = item.messages?.[0]?.body || 'No messages yet'
          const isPending = item.status === 'PENDING'
          return (
            <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Conversation', { conversationId: item.id, name: getName(item) })} activeOpacity={0.7}>
              <View style={s.avatar}>
                <Text style={s.avatarText}>{o?.firstName?.[0]}{o?.lastName?.[0]}</Text>
              </View>
              <View style={s.info}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{getName(item)}</Text>
                  {isPending && <View style={s.pendingBadge}><Text style={s.pendingText}>Pending</Text></View>}
                </View>
                <Text style={s.lastMsg} numberOfLines={1}>{isPending ? '🔒 Waiting for hirer to accept' : lastMsg}</Text>
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '500', color: colors.textMuted, marginTop: 12 },
  emptySubText: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(245,158,11,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { color: colors.accent, fontWeight: '600', fontSize: 15 },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  name: { fontSize: 14, fontWeight: '500', color: colors.text },
  pendingBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  pendingText: { fontSize: 10, color: colors.accent },
  lastMsg: { fontSize: 12, color: colors.textMuted },
})
