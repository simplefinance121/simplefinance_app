import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import API from '../config'
import { colors } from '../theme'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const navigation = useNavigation()

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: '請輸入電子郵件' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      Toast.show({ type: 'success', text1: data.message })
      setSent(true)
    } catch {
      Toast.show({ type: 'error', text1: '發送失敗，請稍後再試。' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.content}>
        <Text style={styles.title}>忘記密碼</Text>
        <Text style={styles.subtitle}>輸入您的電子郵件以重設密碼</Text>

        {sent ? (
          <View style={styles.sentContainer}>
            <Text style={styles.sentText}>
              如果此電子郵件已註冊，重設連結已發送至您的信箱。請查看您的電子郵件。
            </Text>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.btnPrimaryText}>返回登入</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>電子郵件</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="請輸入您的電子郵件"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
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
                  <Text style={styles.btnPrimaryText}> 發送中...</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>發送重設連結</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
              <Text style={styles.linkText}>返回登入</Text>
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
  sentContainer: { alignItems: 'center' },
  sentText: { fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 22 },
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
  linkBtn: { alignItems: 'center', marginTop: 20 },
  linkText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
})
