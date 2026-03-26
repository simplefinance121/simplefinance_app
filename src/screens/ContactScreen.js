import { useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, Linking, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'
import { colors } from '../theme'

export default function ContactScreen() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sending, setSending] = useState(false)
  const insets = useSafeAreaInsets()

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      Toast.show({ type: 'error', text1: '請填寫所有欄位' })
      return
    }
    setSending(true)
    try {
      // Use a simple fetch to EmailJS REST API
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: 'service_r5tkpmj',
          template_id: 'template_5pqkio3',
          user_id: '-OqOdX_57LHgr1Ycv',
          template_params: {
            from_name: form.name,
            from_email: form.email,
            message: form.message,
          },
        }),
      })
      if (res.ok) {
        Toast.show({ type: 'success', text1: '感謝您的訊息！我們會盡快回覆。' })
        setForm({ name: '', email: '', message: '' })
      } else {
        Toast.show({ type: 'error', text1: '發送失敗，請稍後再試。' })
      }
    } catch {
      Toast.show({ type: 'error', text1: '發送失敗，請稍後再試或直接透過社群媒體聯繫我們。' })
    } finally {
      setSending(false)
    }
  }

  const openLink = (url) => Linking.openURL(url)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.heroTitle}>聯繫我們</Text>
        <Text style={styles.heroSubtitle}>與我們的團隊取得聯絡</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>您的姓名</Text>
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
          <Text style={styles.label}>訊息</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.message}
            onChangeText={(text) => setForm({ ...form, message: text })}
            placeholder="請輸入您的訊息"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>
        <TouchableOpacity
          style={[styles.btnPrimary, sending && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={sending}
        >
          <Text style={styles.btnPrimaryText}>{sending ? '發送中...' : '提交'}</Text>
        </TouchableOpacity>

        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>社群媒體</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('https://discord.gg/7GyMhAsb')}>
              <Text style={styles.socialBtnText}>Discord</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('https://www.facebook.com/Simple-Finance-103142032169547')}>
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} onPress={() => openLink('https://www.instagram.com/simplefinance.tw/')}>
              <Text style={styles.socialBtnText}>Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    backgroundColor: colors.dark,
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '700', marginBottom: 8 },
  heroSubtitle: { color: '#a8b2d1', fontSize: 15 },
  section: { padding: 24 },
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
  textarea: { height: 120 },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  socialSection: { marginTop: 32, alignItems: 'center' },
  socialTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
  socialLinks: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  socialBtnText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
})
