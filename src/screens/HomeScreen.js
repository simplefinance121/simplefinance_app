import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme'

const features = [
  { icon: '📈', title: '專業量化策略', desc: '運用多元量化模型與套利策略，追求穩健的投資報酬，歷史年化報酬可達 7%' },
  { icon: '🪪', title: '完全透明', desc: '透過專屬 App 隨時查看您的資產狀況與收益明細，所有數據即時更新' },
  { icon: '🔒', title: '風險控管', desc: '透過量化交易、ETF 套利、套期保值、跨市場套利等多元策略分散風險' },
  { icon: '💎', title: '靈活配置', desc: '彈性的資產配置方案，可依需求調整投資組合與資金運用' },
]

const currencies = ['USDT', 'USD', 'USDC', 'TWD']

export default function HomeScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.heroTag}>智能投資 · 量化策略 · 資產配置</Text>
        <Text style={styles.heroTitle}>讓您的資產穩定增值</Text>
        <Text style={styles.heroSubtitle}>
          透過專業量化策略與多元套利組合，提供優質的資產管理與配置方案
        </Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.statValue}>7%</Text>
            <Text style={styles.statLabel}>歷史年化報酬*</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>即時資產追蹤</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>了解方案</Text>
        </TouchableOpacity>
        <Text style={styles.heroDisclaimer}>*過往績效不代表未來收益，投資涉及風險</Text>
      </View>

      {/* Why Choose Us */}
      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>為什麼選擇我們</Text>
        <Text style={styles.sectionSubtitle}>
          在當今充滿挑戰和機遇的金融世界中，每個人都夢想實現財務自由和穩定。Simple Finance 透過專業的量化投資策略與技術，為用戶提供優質的資產配置方案。
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
        <Text style={styles.sectionTitle}>歷史年化報酬可達 7%</Text>
        <Text style={styles.sectionSubtitle}>透過推薦計畫還可獲得額外回饋</Text>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('Referral')}>
          <Text style={styles.btnOutlineText}>了解更多</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>過往績效不保證未來表現，實際收益可能因市場波動而有所不同</Text>
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
        <Text style={styles.ctaTitle}>探索適合您的投資方案</Text>
        <Text style={styles.ctaSubtitle}>與我們的團隊聯繫，了解更多詳情</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>聯繫我們</Text>
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
