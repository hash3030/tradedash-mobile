import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import api from '@/lib/api'
import { colors, TRADES, STATES, tradeLabel, formatBudget, formatDate } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'

export default function JobsScreen() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [trade, setTrade] = useState('')
  const [total, setTotal] = useState(0)
  const navigation = useNavigation<any>()

  const fetchJobs = useCallback(async () => {
    try {
      const params: any = { limit: 30 }
      if (search) params.search = search
      if (trade) params.trade = trade
      const res = await api.get('/api/jobs', { params })
      setJobs(res.data.jobs)
      setTotal(res.data.total)
    } catch {} finally { setLoading(false); setRefreshing(false) }
  }, [search, trade])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const onRefresh = () => { setRefreshing(true); fetchJobs() }

  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('JobDetail', { id: item.id })} activeOpacity={0.8}>
      <View style={styles.cardHeader}>
        <Text style={styles.jobTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.budget}>{formatBudget(item.budget, item.budgetType)}</Text>
      </View>
      <View style={styles.meta}>
        <Feather name="map-pin" size={11} color={colors.textMuted} />
        <Text style={styles.metaText}>{item.suburb}, {item.state}</Text>
        <Text style={styles.dot}>·</Text>
        <Feather name="clock" size={11} color={colors.textMuted} />
        <Text style={styles.metaText}>{formatDate(item.date)}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <View style={styles.tags}>
        <View style={styles.tradeBadge}><Text style={styles.tradeBadgeText}>{tradeLabel(item.tradeType)}</Text></View>
        {item.user?.isVerified && <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓ Verified</Text></View>}
        <View style={styles.codeBadge}><Text style={styles.codeText}>{item.jobCode}</Text></View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Feather name="search" size={15} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search jobs, trades, locations..."
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={fetchJobs}
        />
        {search !== '' && <TouchableOpacity onPress={() => setSearch('')}><Feather name="x" size={15} color={colors.textMuted} /></TouchableOpacity>}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={item => item.id}
          renderItem={renderJob}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListHeaderComponent={<Text style={styles.resultCount}>{total} jobs found</Text>}
          ListEmptyComponent={<Text style={styles.empty}>No jobs found. Try changing your search.</Text>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', margin: 12, backgroundColor: colors.bg2, borderRadius: 10, paddingHorizontal: 12, borderWidth: 0.5, borderColor: colors.border },
  searchInput: { flex: 1, height: 40, color: colors.text, fontSize: 14 },
  resultCount: { fontSize: 11, color: colors.textMuted, marginBottom: 8 },
  card: { backgroundColor: colors.bg2, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  jobTitle: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text, marginRight: 8 },
  budget: { fontSize: 14, fontWeight: '600', color: colors.accent },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  metaText: { fontSize: 11, color: colors.textMuted },
  dot: { color: colors.textMuted, fontSize: 11 },
  description: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 10 },
  tags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  tradeBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  tradeBadgeText: { fontSize: 10, color: colors.accent },
  verifiedBadge: { backgroundColor: 'rgba(13,148,136,0.15)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  verifiedText: { fontSize: 10, color: colors.teal },
  codeBadge: { backgroundColor: colors.bg3, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
})
