import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import API from '../config'
import { colors } from '../theme'

export default function ResetPasswordScreen() {
  const route = useRoute()
  const token = route.params?.token || ''
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigation = useNavigation()

  const handleSubmit = async () => {
    if (form.password.length < 8) {
      Toast.show({ type: 'error', text1: '密碼長度至少需 8 位' })
      return
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
      Toast.show({ type: 'error', text1: '密碼需包含英文字母和數字' })
      return
    }
    if (form.password !== form.confirm) {
      Toast.show({ type: 'error', text1: '密碼不一致，請重新輸入。' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        Toast.show({ type: 'error', text1: data.message })
        return
      }

      Toast.show({ type: 'success', text1: data.message })
      setSuccess(true)
    } catch {
      Toast.show({ type: 'error', text1: '重設密碼失敗，請稍後再試。' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.title}>重設密碼</Text>
        <Text style={styles.subtitle}>請設定您的新密碼</Text>

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>密碼已成功重設！</Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.btnPrimaryText}>前往登入</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>新密碼</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(text) => setForm({ ...form, password: text })}
                placeholder="請設定密碼（至少 8 位，含英文和數字）"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>確認新密碼</Text>
              <TextInput
                style={styles.input}
                value={form.confirm}
                onChangeText={(text) => setForm({ ...form, confirm: text })}
                placeholder="請再次輸入密碼"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.btnPrimaryText}> 重設中...</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>重設密碼</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  successContainer: { alignItems: 'center' },
  successText: { fontSize: 16, color: colors.textSecondary, marginBottom: 24 },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.white,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
})
