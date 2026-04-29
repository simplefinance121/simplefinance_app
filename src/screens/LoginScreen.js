import { useState, useEffect } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../context/AuthContext'
import API from '../config'
import { colors } from '../theme'

const ADMIN_EMAIL = 'simplefinance.com@gmail.com'
const INVITE_CODE = 'SimpleInvest'
const INVITE_FLAG_KEY = 'invite_validated'

export default function LoginScreen() {
  const [form, setForm] = useState({ email: '', password: '', inviteCode: '' })
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsInviteCode, setNeedsInviteCode] = useState(true)
  const navigation = useNavigation()
  const { login, saveCredentials, clearCredentials, getRememberedCredentials } = useAuth()
  const insets = useSafeAreaInsets()

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const validated = await AsyncStorage.getItem(INVITE_FLAG_KEY)
    if (validated === 'true') setNeedsInviteCode(false)
    await loadSavedCredentials()
  }

  const loadSavedCredentials = async () => {
    const creds = await getRememberedCredentials()
    if (creds) {
      setForm((prev) => ({ ...prev, email: creds.email, password: creds.password }))
      setRememberMe(true)
    }
  }

  const handleSubmit = async () => {
    if (loading) return
    if (!form.email || !form.password) {
      setError('請填寫所有欄位')
      return
    }
    if (needsInviteCode) {
      if (!form.inviteCode) {
        setError('請輸入邀請碼')
        return
      }
      if (form.inviteCode !== INVITE_CODE) {
        setError('邀請碼錯誤，請聯絡客服取得邀請碼')
        return
      }
    }
    setError('')
    setLoading(true)

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const text = await res.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setError('伺服器回應錯誤')
        return
      }

      if (!res.ok) {
        setError(data.message || '登入失敗')
        return
      }

      if (rememberMe) {
        await saveCredentials(form.email, form.password)
      } else {
        await clearCredentials()
      }

      if (needsInviteCode) {
        await AsyncStorage.setItem(INVITE_FLAG_KEY, 'true')
      }

      await login(data.user, data.token)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('連線逾時，請確認網路連線後再試。')
      } else {
        setError(`登入失敗: ${err.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={[styles.brandSection, { paddingTop: insets.top + 60 }]}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
            <Text style={styles.brandName}>Simple Finance</Text>
            <Text style={styles.brandTagline}>專業量化投資技術服務</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>歡迎回來</Text>
            <Text style={styles.formSubtitle}>
              {needsInviteCode ? '本平台採邀請制，首次登入請輸入邀請碼' : '登入您的帳戶'}
            </Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {needsInviteCode && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>邀請碼</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🎟️</Text>
                  <TextInput
                    style={styles.input}
                    value={form.inviteCode}
                    onChangeText={(text) => setForm({ ...form, inviteCode: text })}
                    placeholder="請輸入邀請碼"
                    placeholderTextColor="#aaa"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <Text style={styles.inviteHint}>沒有邀請碼？請聯絡客服諮詢</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>電子郵件</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  value={form.email}
                  onChangeText={(text) => setForm({ ...form, email: text })}
                  placeholder="請輸入您的電子郵件"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>密碼</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  value={form.password}
                  onChangeText={(text) => setForm({ ...form, password: text })}
                  placeholder="請輸入您的密碼"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.rememberBtn}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>記住我</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>忘記密碼？</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.btnPrimary, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.white} size="small" />
                  <Text style={styles.btnPrimaryText}>  登入中...</Text>
                </View>
              ) : (
                <Text style={styles.btnPrimaryText}>登入</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnOutlineText}>建立新帳戶</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} Simple Finance</Text>
            <Text style={styles.footerDisclaimer}>
              本服務內容僅供參考，不構成投資建議。所有投資皆涉及風險。
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  // Brand Header
  brandSection: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 16,
  },
  brandName: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  brandTagline: {
    color: '#7b8ab8',
    fontSize: 14,
  },
  // Form Card
  formCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 36,
    paddingBottom: 24,
    flex: 1,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 15,
    color: colors.textMuted,
    marginBottom: 28,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fb',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#eef0f4',
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
  },
  inviteHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    marginLeft: 2,
  },
  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -8,
  },
  rememberBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    backgroundColor: '#f8f9fb',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  rememberText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  forgotText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  btnPrimary: {
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
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#eef0f4',
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13,
    marginHorizontal: 16,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  // Footer
  footer: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 28,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  footerDisclaimer: {
    color: '#ccc',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
})
