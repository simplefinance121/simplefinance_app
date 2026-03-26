import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme'

const strategies = [
  { title: 'ETF 套利', desc: '利用 ETF 及其成分股之間的價格差異執行套利交易，透過同時購買低估的資產並賣出高估的 ETF，捕捉市場定價偏差的機會。' },
  { title: '套期保值套利', desc: '利用同標的於期貨市場和現貨市場之間價格不一致的機會套利，透過對沖操作降低市場波動帶來的影響。' },
  { title: '跨市場套利', desc: '利用同標的於全球金融市場之間價格的不一致性進行交易，涉及不同國家的股票、債券或其他金融工具。' },
  { title: '搬磚套利', desc: '尋找不同交易平台間資產價格的差異，透過同步買賣操作捕捉跨平台的價差機會。' },
  { title: '期現套利', desc: '利用永續合約的資金費率機制，透過在現貨市場和期貨市場同時進行相反方向的交易，鎖定資金費率收益。' },
]

export default function AboutScreen() {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.heroTitle}>關於 Simple Finance</Text>
        <Text style={styles.heroSubtitle}>
          我們是一家專注於量化投資技術的金融科技公司，致力於為用戶提供專業的資產配置方案
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我們的使命</Text>
        <Text style={styles.sectionSubtitle}>
          運用科技與數據驅動的投資策略，讓專業的資產管理不再遙不可及
        </Text>
        <Text style={styles.bodyText}>
          在當今這個充滿挑戰和機遇的金融世界中，每個人都夢想實現財務自由和穩定。
        </Text>
        <Text style={styles.bodyText}>
          Simple Finance 在這一目標上是您的理想夥伴，透過創新的量化投資技術與透明的資產管理機制，為用戶打造優質的投資體驗。我們深知，真正的財富管理不僅關乎數字的增加，更在於為您創造一個更加穩定和繁榮的未來。
        </Text>
      </View>

      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>我們的投資策略</Text>
        <Text style={styles.sectionSubtitle}>
          運用多元量化策略，透過數據分析與模型驅動追求穩健報酬
        </Text>
        {strategies.map((s, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{s.title}</Text>
            <Text style={styles.cardDesc}>{s.desc}</Text>
          </View>
        ))}
        <Text style={styles.disclaimer}>
          以上策略說明僅供參考，實際操作會依市場狀況調整，所有投資皆涉及風險
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>安全與合規</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>專業團隊管理</Text>
          <Text style={styles.cardDesc}>由資本市場、金融科技及網路安全領域的專業人士組成核心團隊</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>風險管理機制</Text>
          <Text style={styles.cardDesc}>建立完善的風控體系與資產保全機制，持續監控投資組合風險</Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>了解更多投資方案</Text>
        <Text style={styles.ctaSubtitle}>與我們的團隊聯繫，找到適合您的資產配置</Text>
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
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  heroSubtitle: { color: '#a8b2d1', fontSize: 15, textAlign: 'center', lineHeight: 22 },
  section: { padding: 24 },
  sectionGray: { backgroundColor: colors.backgroundGray, padding: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 12 },
  sectionSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  bodyText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 12 },
  card: {
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
  cardTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  disclaimer: { color: colors.textLight, fontSize: 12, textAlign: 'center', marginTop: 8 },
  ctaSection: {
    backgroundColor: colors.dark,
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: { color: colors.white, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  ctaSubtitle: { color: '#a8b2d1', fontSize: 15, textAlign: 'center', marginBottom: 24 },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  btnPrimaryText: { color: colors.white, fontSize: 16, fontWeight: '600' },
})
