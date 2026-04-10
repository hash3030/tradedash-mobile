import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Linking, Alert, TextInput, Modal } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser } from '@/lib/auth'
import { colors, tradeLabel, formatBudget, formatDate } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'
import { API_URL } from '@/lib/api'

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || 'https://tradedash.com.au'

export default function JobDetailScreen() {
  const route = useRoute<any>()
  const { id } = route.params
  const [job, setJob] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [coverNote, setCoverNote] = useState('')
  const [showApply, setShowApply] = useState(false)
  const [showWA, setShowWA] = useState(false)
  const [applying, setApplying] = useState(false)
  const navigation = useNavigation<any>()

  useEffect(() => {
    api.get(`/api/jobs/${id}`).then(r => setJob(r.data))
    getUser().then(u => setUser(u))
  }, [id])

  const apply = async () => {
    if (!user) return navigation.navigate('Login')
    setApplying(true)
    try {
      await api.post('/api/applications', { jobId: job.id, coverNote })
      Toast.show({ type: 'success', text1: 'Application sent!', text2: 'Check messages once the hirer accepts.' })
      setShowApply(false)
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to apply' })
    } finally { setApplying(false) }
  }

  const openWhatsApp = () => {
    if (!user) return navigation.navigate('Login')
    setShowWA(true)
  }

  const confirmWhatsApp = () => {
    const profileUrl = `${SITE_URL}/jobseeker/public/${user?.id}?jobId=${job?.id}`
    const msg = encodeURIComponent(`Hi, I am interested in your job on Tradedash (${job.jobCode}).\n\nView my profile: ${profileUrl}\n\nMy contact: ${user?.phone}`)
    const hirerPhone = job?.user?.phone?.replace(/\+/g, '').replace(/\s/g, '')
    Linking.openURL(`https://wa.me/${hirerPhone}?text=${msg}`)
    setShowWA(false)
  }

  const copyCode = () => {
    Toast.show({ type: 'success', text1: `Job code ${job.jobCode} copied` })
  }

  if (!job) return <View style={s.container}><Text style={s.loading}>Loading...</Text></View>

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={s.card}>
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={s.badges}>
              <View style={s.tradeBadge}><Text style={s.tradeBadgeText}>{tradeLabel(job.tradeType)}</Text></View>
              <TouchableOpacity style={s.codeBadge} onPress={copyCode}>
                <Text style={s.codeText}>{job.jobCode}</Text>
                <Feather name="copy" size={9} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={s.title}>{job.title}</Text>
          </View>
          <View style={s.budgetBox}>
            <Text style={s.budget}>{formatBudget(job.budget, job.budgetType)}</Text>
            <Text style={s.budgetType}>{job.budgetType === 'hourly' ? 'per hour' : 'fixed'}</Text>
          </View>
        </View>

        <View style={s.metaRow}>
          <Feather name="map-pin" size={12} color={colors.textMuted} />
          <Text style={s.metaText}>{job.address}, {job.suburb} {job.state}</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name="clock" size={12} color={colors.textMuted} />
          <Text style={s.metaText}>{formatDate(job.date)} · {job.startTime}</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name="users" size={12} color={colors.textMuted} />
          <Text style={s.metaText}>{job._count?.applications} applicants</Text>
        </View>

        <Text style={s.description}>{job.description}</Text>

        {/* Photos */}
        {job.photos?.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {job.photos.map((p: any) => (
              <Image key={p.id} source={{ uri: `${API_URL}${p.url}` }} style={s.photo} />
            ))}
          </ScrollView>
        )}

        {/* Apply buttons */}
        {user?.id !== job.userId && (
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.btnWA, { flex: 1, marginRight: 8 }]} onPress={openWhatsApp}>
              <Feather name="message-circle" size={15} color="#fff" />
              <Text style={s.btnWAText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btnApply, { flex: 1 }]} onPress={() => setShowApply(true)}>
              <Text style={s.btnApplyText}>Apply now</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Hirer */}
      <View style={s.card}>
        <Text style={s.sectionLabel}>Posted by</Text>
        <View style={s.hirerRow}>
          <View style={s.avatar}><Text style={s.avatarText}>{job.user?.firstName?.[0]}{job.user?.lastName?.[0]}</Text></View>
          <View>
            <Text style={s.hirerName}>{job.user?.hirerProfile?.companyName || `${job.user?.firstName} ${job.user?.lastName}`}</Text>
            {job.user?.isVerified && <Text style={s.verified}>✓ Verified hirer</Text>}
          </View>
        </View>
      </View>

      {/* Apply modal */}
      <Modal visible={showApply} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Apply for this job</Text>
            <Text style={s.modalLabel}>Cover note (optional)</Text>
            <TextInput style={[s.modalInput, { height: 100 }]} value={coverNote} onChangeText={setCoverNote}
              placeholder="Describe your experience..." placeholderTextColor={colors.textMuted}
              multiline textAlignVertical="top" />
            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.bg3 }]} onPress={() => setShowApply(false)}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.accent }]} onPress={apply} disabled={applying}>
                <Text style={{ color: colors.accentText, fontWeight: '600', fontSize: 14 }}>{applying ? 'Sending...' : 'Send application'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* WhatsApp modal */}
      <Modal visible={showWA} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>Confirm WhatsApp Redirection</Text>
            <Text style={s.modalSub}>You will be redirected to WhatsApp with your message pre-filled. You will need to manually send it once WhatsApp opens.</Text>
            <View style={s.phoneBox}>
              <Text style={s.phoneLabel}>My contact: </Text>
              <Text style={s.phoneVal}>{user?.phone}</Text>
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: colors.bg3 }]} onPress={() => setShowWA(false)}>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.modalBtn, { backgroundColor: '#16a34a' }]} onPress={confirmWhatsApp}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Open WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  loading: { color: colors.textMuted, textAlign: 'center', marginTop: 40 },
  card: { backgroundColor: colors.bg2, borderRadius: 12, margin: 12, marginBottom: 4, padding: 16, borderWidth: 0.5, borderColor: colors.border },
  headerRow: { flexDirection: 'row', marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 8, flexWrap: 'wrap' },
  tradeBadge: { backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  tradeBadgeText: { fontSize: 10, color: colors.accent },
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bg3, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { fontSize: 10, color: colors.textMuted, fontFamily: 'monospace' },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, flex: 1 },
  budgetBox: { alignItems: 'flex-end', marginLeft: 8 },
  budget: { fontSize: 16, fontWeight: '700', color: colors.accent },
  budgetType: { fontSize: 10, color: colors.textMuted },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  metaText: { fontSize: 12, color: colors.textMuted },
  description: { fontSize: 13, color: 'rgba(232,230,223,0.7)', lineHeight: 20, marginTop: 12 },
  photo: { width: 120, height: 90, borderRadius: 8, marginRight: 8 },
  actionRow: { flexDirection: 'row', marginTop: 16 },
  btnWA: { backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnWAText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnApply: { backgroundColor: colors.accent, borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  btnApplyText: { color: colors.accentText, fontWeight: '600', fontSize: 14 },
  sectionLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  hirerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(245,158,11,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontWeight: '600', fontSize: 14 },
  hirerName: { fontSize: 14, fontWeight: '500', color: colors.text },
  verified: { fontSize: 11, color: colors.teal, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: colors.bg2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderWidth: 0.5, borderColor: colors.border },
  modalTitle: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
  modalSub: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 16 },
  modalLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 6 },
  modalInput: { backgroundColor: colors.bg3, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, color: colors.text, fontSize: 14 },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  phoneBox: { backgroundColor: colors.bg3, borderRadius: 8, padding: 12, marginBottom: 4 },
  phoneLabel: { fontSize: 12, color: colors.textMuted },
  phoneVal: { fontSize: 13, color: colors.text, fontWeight: '500' },
  accentText: colors.accentText,
})
