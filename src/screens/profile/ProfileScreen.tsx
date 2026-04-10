import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { getUser, clearAuth } from '@/lib/auth'
import { colors, planColor } from '@/lib/utils'
import { Feather } from '@expo/vector-icons'
import { API_URL } from '@/lib/api'

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const navigation = useNavigation<any>()

  useEffect(() => {
    api.get('/api/auth/me').then(r => {
      setUser(r.data)
    }).catch(() => getUser().then(setUser))
  }, [])

  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') return Toast.show({ type: 'error', text1: 'Camera roll permission needed' })

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    })

    if (result.canceled) return
    setUploading(true)
    try {
      const uri = result.assets[0].uri
      const filename = uri.split('/').pop() || 'avatar.jpg'
      const formData = new FormData()
      formData.append('avatar', { uri, name: filename, type: 'image/jpeg' } as any)
      const res = await api.post('/api/uploads/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setUser((u: any) => ({ ...u, avatarUrl: res.data.url }))
      Toast.show({ type: 'success', text1: 'Profile photo updated!' })
    } catch { Toast.show({ type: 'error', text1: 'Upload failed' }) }
    finally { setUploading(false) }
  }

  const logout = async () => {
    Alert.alert('Log out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => {
        await clearAuth()
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] })
      }},
    ])
  }

  if (!user) return <View style={s.container} />

  const score = user.workerProfile?.profileScore || 0

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      {/* Avatar */}
      <View style={s.avatarSection}>
        <TouchableOpacity onPress={pickAndUploadAvatar} style={s.avatarWrap}>
          {user.avatarUrl ? (
            <Image source={{ uri: `${API_URL}${user.avatarUrl}` }} style={s.avatar} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Text style={s.avatarInitials}>{user.firstName?.[0]}{user.lastName?.[0]}</Text>
            </View>
          )}
          <View style={s.cameraBtn}>
            {uploading ? <Text style={{ fontSize: 10, color: colors.accentText }}>...</Text> : <Feather name="camera" size={14} color={colors.accentText} />}
          </View>
        </TouchableOpacity>
        <View style={s.userInfo}>
          <Text style={s.name}>{user.firstName} {user.lastName}</Text>
          <Text style={s.phone}>{user.phone}</Text>
          <View style={[s.planBadge, { backgroundColor: `${planColor(user.plan)}22` }]}>
            <Text style={[s.planText, { color: planColor(user.plan) }]}>{user.plan} plan</Text>
          </View>
        </View>
      </View>

      {/* Profile score (workers) */}
      {user.userType === 'WORKER' && (
        <View style={s.card}>
          <View style={s.scoreRow}>
            <Text style={s.scoreLabel}>Profile score</Text>
            <Text style={s.scoreVal}>{score}/10</Text>
          </View>
          <View style={s.scoreBar}>
            <View style={[s.scoreBarFill, { width: `${score * 10}%` }]} />
          </View>
          <Text style={s.scoreHint}>{score < 5 ? 'Incomplete — add more details to be found by hirers' : score < 8 ? 'Good — a few more fields will boost your visibility' : 'Excellent — your profile is complete!'}</Text>
        </View>
      )}

      {/* Actions */}
      {[
        { icon: 'edit', label: 'Edit profile', onPress: () => {} },
        { icon: 'file-text', label: 'My applications', onPress: () => {} },
        { icon: 'star', label: 'Upgrade plan', onPress: () => {} },
        { icon: 'help-circle', label: 'Contact support', onPress: () => {} },
        { icon: 'shield', label: 'Privacy policy', onPress: () => {} },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={s.menuItem} onPress={item.onPress} activeOpacity={0.7}>
          <Feather name={item.icon as any} size={18} color={colors.textMuted} />
          <Text style={s.menuLabel}>{item.label}</Text>
          <Feather name="chevron-right" size={16} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[s.menuItem, { marginTop: 8 }]} onPress={logout}>
        <Feather name="log-out" size={18} color={colors.red} />
        <Text style={[s.menuLabel, { color: colors.red }]}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  avatarSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: colors.accent },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(245,158,11,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { fontSize: 24, fontWeight: '600', color: colors.accent },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, backgroundColor: colors.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  userInfo: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 2 },
  phone: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  planBadge: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  planText: { fontSize: 11, fontWeight: '500' },
  card: { backgroundColor: colors.bg2, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: colors.border },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  scoreLabel: { fontSize: 13, color: colors.text, fontWeight: '500' },
  scoreVal: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  scoreBar: { height: 6, backgroundColor: colors.bg3, borderRadius: 3, marginBottom: 8 },
  scoreBarFill: { height: 6, backgroundColor: colors.accent, borderRadius: 3 },
  scoreHint: { fontSize: 11, color: colors.textMuted },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bg2, borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 0.5, borderColor: colors.border },
  menuLabel: { fontSize: 14, color: colors.text },
})
