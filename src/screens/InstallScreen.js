import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from 'react-native'
import { colors } from '../theme'

export default function InstallScreen({ onContinue }) {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web') {
      onContinue()
      return
    }

    const ua = navigator.userAgent
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !window.MSStream)

    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    setInstalling(true)
    try {
      installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice
      if (outcome === 'accepted') {
        onContinue()
      } else {
        setInstallPrompt(null)
      }
    } finally {
      setInstalling(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>Simple Finance</Text>
        <Text style={styles.subtitle}>您的專屬資產管理平台</Text>

        <View style={styles.divider} />

        {installPrompt ? (
          // Android / Chrome: native install prompt
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>安裝應用程式</Text>
            <Text style={styles.sectionDesc}>
              一鍵安裝到主畫面，隨時快速查看您的資產。
            </Text>
            <TouchableOpacity
              style={[styles.installBtn, installing && styles.installBtnDisabled]}
              onPress={handleInstall}
              disabled={installing}
            >
              <Text style={styles.installBtnText}>
                {installing ? '安裝中...' : '📲  立即安裝'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : isIOS ? (
          // iOS Safari: manual steps
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>加入主畫面</Text>
            <Text style={styles.sectionDesc}>只需三步，像 App 一樣使用：</Text>
            <View style={styles.steps}>
              <Step n="1" text="點擊底部" highlight="分享按鈕" suffix=" （↑ 方框圖示）" />
              <Step n="2" text="選擇" highlight="「加入主畫面」" />
              <Step n="3" text="點擊右上角" highlight="「新增」" />
            </View>
          </View>
        ) : (
          // Desktop or other — just continue
          <View style={styles.section}>
            <Text style={styles.sectionDesc}>
              在手機的 Safari 或 Chrome 開啟此網址，即可安裝到主畫面。
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.skipBtn} onPress={onContinue}>
          <Text style={styles.skipText}>先在瀏覽器使用 →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function Step({ n, text, highlight, suffix }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepBadgeText}>{n}</Text>
      </View>
      <Text style={styles.stepText}>
        {text} <Text style={styles.stepHighlight}>{highlight}</Text>
        {suffix ? suffix : ''}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  icon: {
    width: 88,
    height: 88,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a8b2d1',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 24,
  },
  section: {
    width: '100%',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#a8b2d1',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  installBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  installBtnDisabled: {
    opacity: 0.6,
  },
  installBtnText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  steps: {
    width: '100%',
    gap: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepBadgeText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    color: '#a8b2d1',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  stepHighlight: {
    color: colors.white,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 24,
    paddingVertical: 8,
  },
  skipText: {
    color: '#a8b2d1',
    fontSize: 13,
  },
})
