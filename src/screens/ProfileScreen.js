import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { useAuth } from '../context/AuthContext'
import API from '../config'
import { colors } from '../theme'

export default function ProfileScreen() {
  const { user, token, updateUser } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)

  const hasChanges = name.trim() !== user?.name || email.trim() !== user?.email

  const handleSave = async () => {
    if (!hasChanges) return
    if (!name.trim()) { Toast.show({ type: 'error', text1: '姓名不能為空' }); return }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: 'error', text1: '請提供有效的電子郵件' }); return
    }

    setSaving(true)
    try {
      const updates = {}
      if (name.trim() !== user?.name) updates.name = name.trim()
      if (email.trim() !== user?.email) updates.email = email.trim()

      const res = await fetch(`${API}/api/auth/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) { Toast.show({ type: 'error', text1: data.message || '更新失敗' }); return }

      updateUser(data.user)
      Toast.show({ type: 'success', text1: '個人資料已更新' })
      navigation.goBack()
    } catch {
      Toast.show({ type: 'error', text1: '更新失敗，請稍後再試' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>個人資料</Text>
        <Text style={styles.headerSub}>修改您的姓名或電子郵件</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>姓名</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="請輸入姓名"
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
          </View>

          <View style={[styles.field, { marginBottom: 0 }]}>
            <Text style={styles.label}>電子郵件</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="請輸入電子郵件"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, (!hasChanges || saving) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving
            ? <ActivityIndicator color={colors.white} size="small" />
            : <Text style={styles.saveBtnText}>儲存變更</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  header: {
    backgroundColor: colors.dark,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  backBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  headerTitle: { color: colors.white, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSub: { color: '#a8b2d1', fontSize: 14 },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  field: { marginBottom: 20 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#fafafa',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
})
