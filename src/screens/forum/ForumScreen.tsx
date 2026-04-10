import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import api from '@/lib/api'
import { colors, formatDate } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function ForumScreen() {
  const [categories, setCategories] = useState<any[]>([])
  const [posts, setPosts] = useState<any[]>([])
  const [activeSlug, setActiveSlug] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const navigation = useNavigation<any>()

  useEffect(() => {
    api.get('/api/forum/categories').then(r => setCategories(r.data))
    fetchPosts('')
  }, [])

  const fetchPosts = async (slug: string) => {
    try {
      const params = slug ? { categorySlug: slug } : {}
      const res = await api.get('/api/forum/posts', { params })
      setPosts(res.data.posts || [])
      setActiveSlug(slug)
    } catch {} finally { setRefreshing(false) }
  }

  return (
    <View style={s.container}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabs} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
        {[{ slug: '', name: 'All' }, ...categories].map(cat => (
          <TouchableOpacity key={cat.slug} onPress={() => fetchPosts(cat.slug)}
            style={[s.tab, activeSlug === cat.slug && s.tabActive]}>
            <Text style={[s.tabText, activeSlug === cat.slug && s.tabTextActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPosts(activeSlug) }} tintColor={colors.accent} />}
        ListEmptyComponent={<Text style={s.empty}>No posts yet. Be the first!</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.post} onPress={() => navigation.navigate('ForumPost', { id: item.id })} activeOpacity={0.8}>
            <View style={s.postHeader}>
              <View style={s.avatar}><Text style={s.avatarText}>{item.user?.firstName?.[0]}{item.user?.lastName?.[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.postTitle}>{item.title}</Text>
                <Text style={s.postMeta}>@{item.user?.username || item.user?.firstName} · {formatDate(item.createdAt)}</Text>
              </View>
              {item.isPinned && <Feather name="bookmark" size={14} color={colors.accent} />}
            </View>
            <View style={s.postFooter}>
              <View style={s.stat}><Feather name="message-square" size={12} color={colors.textMuted} /><Text style={s.statText}>{item._count?.replies}</Text></View>
              <View style={s.stat}><Feather name="thumbs-up" size={12} color={colors.textMuted} /><Text style={s.statText}>{item.upvotes}</Text></View>
              {item.category && <View style={s.catBadge}><Text style={s.catText}>{item.category.name}</Text></View>}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabs: { borderBottomWidth: 0.5, borderBottomColor: colors.border, paddingVertical: 10, maxHeight: 52 },
  tab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: colors.bg2, borderWidth: 0.5, borderColor: colors.border },
  tabActive: { backgroundColor: 'rgba(245,158,11,0.15)', borderColor: colors.accent },
  tabText: { fontSize: 12, color: colors.textMuted },
  tabTextActive: { color: colors.accent, fontWeight: '500' },
  post: { backgroundColor: colors.bg2, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontWeight: '600', fontSize: 12 },
  postTitle: { fontSize: 14, fontWeight: '500', color: colors.text, lineHeight: 20 },
  postMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 12, color: colors.textMuted },
  catBadge: { marginLeft: 'auto' as any, backgroundColor: colors.bg3, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 10, color: colors.textMuted },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
})
