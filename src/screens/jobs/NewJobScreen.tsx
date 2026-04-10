import React, { useState, useRef } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import * as Location from 'expo-location'
import Toast from 'react-native-toast-message'
import api from '@/lib/api'
import { colors, TRADES, STATES } from '@/lib/utils'
import { globalStyles } from '@/lib/theme'
import { Feather } from '@expo/vector-icons'

export default function NewJobScreen() {
  const navigation = useNavigation<any>()
  const [title, setTitle] = useState('')
  const [tradeType, setTradeType] = useState('ELECTRICIAN')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [budgetType, setBudgetType] = useState('fixed')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [address, setAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [state, setState] = useState('VIC')
  const [postcode, setPostcode] = useState('')
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const [photos, setPhotos] = useState<any[]>([])
  const [locating, setLocating] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const useMyLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync()
    if (status !== 'granted') return Toast.show({ type: 'error', text1: 'Location permission needed' })
    setLocating(true)
    try {
      const loc = await Location.getCurrentPositionAsync({})
      setLat(loc.coords.latitude)
      setLng(loc.coords.longitude)
      const geocode = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude })
      if (geocode[0]) {
        const g = geocode[0]
        setAddress(`${g.streetNumber || ''} ${g.street || ''}`.trim())
        setSuburb(g.suburb || g.city || '')
        setState(g.region?.toUpperCase().substring(0, 3) || 'VIC')
        setPostcode(g.postalCode || '')
        Toast.show({ type: 'success', text1: 'Location loaded!' })
      }
    } catch { Toast.show({ type: 'error', text1: 'Could not get location' }) }
    finally { setLocating(false) }
  }

  const pickPhoto = async () => {
    if (photos.length >= 6) return Toast.show({ type: 'error', text1: 'Maximum 6 photos' })
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.8 })
    if (!result.canceled) {
      const newPhotos = result.assets.slice(0, 6 - photos.length)
      setPhotos(prev => [...prev, ...newPhotos])
    }
  }

  const submit = async () => {
    if (!title || !description || !budget || !date || !address || !suburb || !postcode) {
      return Toast.show({ type: 'error', text1: 'Please fill in all required fields' })
    }
    setSubmitting(true)
    try {
      let photoUrls: string[] = []
      if (photos.length > 0) {
        const formData = new FormData()
        photos.forEach(p => formData.append('photos', { uri: p.uri, name: 'photo.jpg', type: 'image/jpeg' } as any))
        const uploadRes = await api.post('/api/uploads/photos', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        photoUrls = uploadRes.data.urls || []
      }
      const res = await api.post('/api/jobs', { title, tradeType, description, budget, budgetType, date, startTime, address, suburb, state, postcode, lat, lng, photoUrls })
      Toast.show({ type: 'success', text1: 'Job posted!', text2: `Code: ${res.data.jobCode}` })
      navigation.goBack()
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err.response?.data?.error || 'Failed to post job' })
    } finally { setSubmitting(false) }
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={globalStyles.sectionTitle}>Job details</Text>
      <Text style={globalStyles.label}>Job title *</Text>
      <TextInput style={globalStyles.input} value={title} onChangeText={setTitle} placeholder="e.g. Commercial fit-out — Level 3 carpenter" placeholderTextColor={colors.textMuted} />
      <View style={{ height: 12 }} />
      <Text style={globalStyles.label}>Description *</Text>
      <TextInput style={[globalStyles.input, { height: 90 }]} value={description} onChangeText={setDescription} placeholder="Describe the job, requirements, tools needed..." placeholderTextColor={colors.textMuted} multiline textAlignVertical="top" />
      <View style={{ height: 12 }} />
      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={globalStyles.label}>Budget</Text>
          <TextInput style={globalStyles.input} value={budget} onChangeText={setBudget} placeholder="e.g. 4200" placeholderTextColor={colors.textMuted} keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.label}>Date *</Text>
          <TextInput style={globalStyles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textMuted} />
        </View>
      </View>

      <View style={{ height: 20 }} />
      <View style={s.locationHeader}>
        <Text style={globalStyles.sectionTitle}>Location</Text>
        <TouchableOpacity style={s.locationBtn} onPress={useMyLocation} disabled={locating}>
          {locating ? <ActivityIndicator size="small" color={colors.accent} /> : <Feather name="map-pin" size={13} color={colors.accent} />}
          <Text style={s.locationBtnText}>{locating ? 'Locating...' : 'Use my location'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={globalStyles.label}>Street address *</Text>
      <TextInput style={globalStyles.input} value={address} onChangeText={setAddress} placeholder="123 Collins St" placeholderTextColor={colors.textMuted} />
      <View style={{ height: 10 }} />
      <View style={s.row}>
        <View style={{ flex: 2, marginRight: 8 }}>
          <Text style={globalStyles.label}>Suburb *</Text>
          <TextInput style={globalStyles.input} value={suburb} onChangeText={setSuburb} placeholder="Melbourne" placeholderTextColor={colors.textMuted} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={globalStyles.label}>State</Text>
          <TextInput style={globalStyles.input} value={state} onChangeText={setState} placeholder="VIC" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={3} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={globalStyles.label}>Postcode *</Text>
          <TextInput style={globalStyles.input} value={postcode} onChangeText={setPostcode} placeholder="3000" placeholderTextColor={colors.textMuted} keyboardType="number-pad" maxLength={4} />
        </View>
      </View>

      <View style={{ height: 20 }} />
      <Text style={globalStyles.sectionTitle}>Photos (up to 6)</Text>
      <TouchableOpacity style={s.photoBtn} onPress={pickPhoto}>
        <Feather name="upload" size={18} color={colors.textMuted} />
        <Text style={s.photoBtnText}>{photos.length}/6 photos added · Tap to add more</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[globalStyles.btnPrimary, { marginTop: 24 }]} onPress={submit} disabled={submitting}>
        <Text style={globalStyles.btnPrimaryText}>{submitting ? 'Posting...' : 'Post job'}</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, paddingBottom: 40 },
  row: { flexDirection: 'row' },
  locationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0.5, borderColor: 'rgba(245,158,11,0.3)' },
  locationBtnText: { fontSize: 12, color: colors.accent },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderStyle: 'dashed' as any, borderColor: colors.border, borderRadius: 10, padding: 16, justifyContent: 'center' },
  photoBtnText: { fontSize: 13, color: colors.textMuted },
})
