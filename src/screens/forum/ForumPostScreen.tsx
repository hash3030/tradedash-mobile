import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native'
import { useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors, formatDate } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function ForumPostScreen() {
  const route = useRoute<any>()
  const { id } = route.params
  const [post, setPost] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [replyBody, setReplyBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchPost = async () => {
    const res = await api.get(`/api/forum/posts/${id}`)
    setPost(res.data)
  }

  useEffect(() => { fetchPost(); getUser().then(setUser) }, [id])

  const reply = async () => {
    if (!replyBody.trim()) return
    setSubmitting(true)
    try {
      await api.post(`/api/forum/posts/${id}/replies`, { body: replyBody })
      setReplyBody('')
      fetchPost()
      Toast.show({ type: 'success', text1: 'Reply posted!' })
    } catch { Toast.show({ type: 'error', text1: 'Failed to reply' }) }
    finally { setSubmitting(false) }
  }

  const upvote = async () => {
    await api.patch(`/api/forum/posts/${id}/upvote`)
    fetchPost()
  }

  if (!post) return <View style={s.container}><Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>Loading...</Text></View>

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
      <View style={s.card}>
        <Text style={s.title}>{post.title}</Text>
        <Text style={s.meta}>@{post.user?.firstName} · {formatDate(post.createdAt)} · {post.category?.name}</Text>
        <Text style={s.body}>{post.body}</Text>
        <TouchableOpacity style={s.upvoteBtn} onPress={upvote}>
          <Feather name="thumbs-up" size={14} color={colors.textMuted} />
          <Text style={s.upvoteText}>{post.upvotes} upvotes</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.replyCount}>{post.replies?.length} replies</Text>

      {post.replies?.map((r: any) => (
        <View key={r.id} style={s.reply}>
          <View style={s.replyHeader}>
            <View style={s.avatar}><Text style={s.avatarText}>{r.user?.firstName?.[0]}{r.user?.lastName?.[0]}</Text></View>
            <View>
              <Text style={s.replyUser}>@{r.user?.firstName}</Text>
              <Text style={s.replyDate}>{formatDate(r.createdAt)}</Text>
            </View>
          </View>
          <Text style={s.replyBody}>{r.body}</Text>
        </View>
      ))}

      <View style={s.replyBox}>
        <Text style={s.replyLabel}>Write a reply</Text>
        <TextInput style={[s.replyInput, { height: 80 }]} value={replyBody} onChangeText={setReplyBody}
          placeholder="Share your thoughts..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />
        <TouchableOpacity style={s.replyBtn} onPress={reply} disabled={submitting}>
          <Text style={s.replyBtnText}>{submitting ? 'Posting...' : 'Post reply'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.bg2, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: colors.border },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 6 },
  meta: { fontSize: 11, color: colors.textMuted, marginBottom: 12 },
  body: { fontSize: 13, color: 'rgba(232,230,223,0.8)', lineHeight: 20 },
  upvoteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  upvoteText: { fontSize: 12, color: colors.textMuted },
  replyCount: { fontSize: 12, fontWeight: '500', color: colors.textMuted, marginBottom: 10 },
  reply: { backgroundColor: colors.bg2, borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 0.5, borderColor: colors.border },
  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  avatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontWeight: '600', fontSize: 11 },
  replyUser: { fontSize: 12, fontWeight: '500', color: colors.text },
  replyDate: { fontSize: 10, color: colors.textMuted },
  replyBody: { fontSize: 13, color: 'rgba(232,230,223,0.75)', lineHeight: 19 },
  replyBox: { backgroundColor: colors.bg2, borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 0.5, borderColor: colors.border },
  replyLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 8 },
  replyInput: { backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 10, color: colors.text, fontSize: 14 },
  replyBtn: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 11, alignItems: 'center', marginTop: 10 },
  replyBtnText: { color: colors.accentText, fontWeight: '600', fontSize: 14 },
})
