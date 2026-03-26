import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import API from '../config'
import { colors } from '../theme'

export default function SignupScreen() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigation = useNavigation()

  const handleSubmit = async () => {
    setError('')

    if (form.name.trim().length < 1 || form.name.trim().length > 50) {
      setError('姓名長度需為 1-50 字元')
      return
    }
    if (form.password.length < 8) {
      setError('密碼長度至少需 8 位')
      return
    }
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(form.password)) {
      setError('密碼需包含英文字母和數字')
      return
    }
    if (form.password !== form.confirm) {
      setError('密碼不一致，請重新輸入。')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message)
        return
      }

      Toast.show({ type: 'success', text1: '註冊成功！請登入您的帳戶。' })
      navigation.navigate('Login')
    } catch {
      setError('註冊失敗，請稍後再試。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.title}>註冊</Text>
        <Text style={styles.subtitle}>建立您的 Simple Finance 帳戶</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.formGroup}>
          <Text style={styles.label}>姓名</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            placeholder="請輸入您的姓名"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>電子郵件</Text>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            placeholder="請輸入您的電子郵件"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>密碼</Text>
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
          <Text style={styles.label}>確認密碼</Text>
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
              <Text style={styles.btnPrimaryText}> 註冊中...</Text>
            </View>
          ) : (
            <Text style={styles.btnPrimaryText}>註冊</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>已有帳戶？</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>立即登入</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  error: {
    backgroundColor: colors.errorBg,
    color: colors.error,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
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
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20, gap: 4 },
  switchText: { fontSize: 14, color: colors.textSecondary },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
})
