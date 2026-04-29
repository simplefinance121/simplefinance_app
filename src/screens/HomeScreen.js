import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme'

const features = [
  { icon: '📈', title: '專屬服務', desc: '為現有私人客戶提供量身打造的帳戶管理服務' },
  { icon: '🪪', title: '完全透明', desc: '透過專屬 App 隨時查看您的帳戶狀況與明細，所有數據即時更新' },
  { icon: '🔒', title: '資料安全', desc: '採用業界標準加密與身份驗證機制，保障您的帳戶資料安全' },
  { icon: '💎', title: '專人諮詢', desc: '客戶有任何疑問皆可聯絡客服或您的專屬聯絡人協助處理' },
]

const currencies = ['USDT', 'USD', 'USDC', 'TWD']

export default function HomeScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.heroTag}>邀請制 · 私人客戶平台</Text>
        <Text style={styles.heroTitle}>私人客戶資產管理平台</Text>
        <Text style={styles.heroSubtitle}>
          Simple Finance 為現有私人客戶提供專屬的資產管理服務。本平台採邀請制，不接受公開申請。
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.statValue}>邀請制</Text>
            <Text style={styles.statLabel}>僅限現有客戶</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>帳戶查詢服務</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>聯絡客服諮詢</Text>
        </TouchableOpacity>
        <Text style={styles.heroDisclaimer}>本平台僅供現有客戶使用，新用戶請聯絡客服了解加入方式</Text>
      </View>

      {/* Why Choose Us */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>服務特色</Text>
        <Text style={styles.sectionSubtitle}>
          Simple Finance 為現有私人客戶提供專屬的帳戶管理平台，協助客戶隨時掌握自身帳戶狀況。
        </Text>
        {features.map((f, i) => (
          <View key={i} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Performance */}
      <View style={styles.sectionRate}>
        <Text style={styles.sectionTitle}>為現有客戶提供專屬服務</Text>
        <Text style={styles.sectionSubtitle}>現有客戶可透過 App 隨時查看帳戶狀況。新客戶請聯絡客服了解加入方式。</Text>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnOutlineText}>聯絡客服諮詢</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>本平台採邀請制，僅限現有私人客戶使用</Text>
      </View>

      {/* Currencies */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>支援幣別</Text>
        <View style={styles.currencyGrid}>
          {currencies.map((c) => (
            <View key={c} style={styles.currencyCard}>
              <Text style={styles.currencyText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>邀請制服務</Text>
        <Text style={styles.ctaSubtitle}>本平台僅限現有客戶使用，新客戶請聯絡客服了解加入方式</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>聯絡客服諮詢</Text>
        </TouchableOpacity>
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
  heroTag: { color: colors.primary, fontSize: 14, marginBottom: 12 },
  heroTitle: { color: colors.white, fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  heroSubtitle: { color: '#a8b2d1', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  heroStats: { flexDirection: 'row', gap: 40, marginBottom: 24 },
  heroStat: { alignItems: 'center' },
  statValue: { color: colors.white, fontSize: 28, fontWeight: '700' },
  statLabel: { color: '#a8b2d1', fontSize: 13, marginTop: 4 },
  heroDisclaimer: { color: '#666', fontSize: 12, marginTop: 16 },
  sectionGray: { backgroundColor: colors.backgroundGray, padding: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
  sectionSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIcon: { fontSize: 32, marginBottom: 8 },
  featureTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 8 },
  featureDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  sectionRate: { padding: 24, alignItems: 'center' },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  btnOutlineText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
  disclaimer: { color: colors.textLight, fontSize: 12, textAlign: 'center', marginTop: 8 },
  currencyGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  currencyCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  currencyText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  ctaSection: {
    backgroundColor: colors.dark,
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: { color: colors.white, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  ctaSubtitle: { color: '#a8b2d1', fontSize: 15, textAlign: 'center', marginBottom: 24 },
})
