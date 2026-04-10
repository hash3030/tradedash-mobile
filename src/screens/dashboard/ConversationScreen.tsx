import React, { useEffect, useState, useRef } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import { useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function ConversationScreen() {
  const route = useRoute<any>()
  const { conversationId } = route.params
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [convo, setConvo] = useState<any>(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  useEffect(() => {
    getUser().then(setUser)
    api.get(`/api/messages/${conversationId}`).then(res => {
      setConvo(res.data)
      setMessages(res.data.messages || [])
    })
  }, [conversationId])

  const send = async () => {
    if (!body.trim()) return
    setSending(true)
    try {
      const res = await api.post('/api/messages', { conversationId, body })
      setMessages(m => [...m, res.data.message])
      setBody('')
      setTimeout(() => listRef.current?.scrollToEnd(), 100)
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to send' })
    } finally { setSending(false) }
  }

  const isPending = convo?.status === 'PENDING'

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {isPending && (
        <View style={s.pendingBanner}>
          <Feather name="lock" size={13} color={colors.accent} />
          <Text style={s.pendingText}>Messaging locked until hirer accepts your application</Text>
        </View>
      )}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd()}
        ListEmptyComponent={<Text style={s.empty}>No messages yet</Text>}
        renderItem={({ item }) => {
          const isMine = item.senderId === user?.id
          return (
            <View style={[s.bubble, isMine ? s.bubbleMine : s.bubbleTheirs]}>
              <Text style={[s.bubbleText, isMine ? s.bubbleTextMine : s.bubbleTextTheirs]}>{item.body}</Text>
            </View>
          )
        }}
      />
      {!isPending && (
        <View style={s.inputRow}>
          <TextInput style={s.input} value={body} onChangeText={setBody} placeholder="Type a message..." placeholderTextColor={colors.textMuted} multiline />
          <TouchableOpacity style={[s.sendBtn, { opacity: body.trim() ? 1 : 0.4 }]} onPress={send} disabled={sending || !body.trim()}>
            <Feather name="send" size={18} color={colors.accentText} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  pendingBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(245,158,11,0.1)', borderBottomWidth: 0.5, borderBottomColor: colors.border, padding: 12 },
  pendingText: { fontSize: 12, color: colors.accent, flex: 1 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 10, marginBottom: 8 },
  bubbleMine: { backgroundColor: colors.accent, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: colors.bg2, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextMine: { color: colors.accentText },
  bubbleTextTheirs: { color: colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopWidth: 0.5, borderTopColor: colors.border, gap: 8 },
  input: { flex: 1, backgroundColor: colors.bg2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, color: colors.text, fontSize: 14, maxHeight: 100, borderWidth: 0.5, borderColor: colors.border },
  sendBtn: { width: 40, height: 40, backgroundColor: colors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
})
