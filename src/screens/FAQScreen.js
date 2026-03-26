import { useState } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme'

const faqData = {
  '一般': [
    { q: 'Simple Finance 是什麼？', a: '我們是一家成立於 2020 年的金融科技公司，透過量化投資策略與技術，為用戶提供專業的資產配置方案。自成立以來，歷經多次市場波動，持續為用戶提供穩健的資產管理服務。' },
    { q: 'Simple Finance 的服務對象？', a: '我們的服務面向有資產配置需求的個人用戶，歡迎與我們聯繫了解詳情。' },
    { q: '團隊背景是什麼？', a: '我們的團隊由資本市場、金融科技及網路安全領域的專業人士組成。' },
    { q: '如何開始使用？', a: '請透過聯繫頁面與我們的團隊取得聯繫，我們將為您說明方案詳情與流程。' },
    { q: '如何追蹤資產狀況？', a: '透過專屬 App 即可隨時查看您的資產配置與收益狀況，所有數據即時更新。' },
  ],
  '投資策略': [
    { q: '主要採用什麼策略？', a: '核心策略為 ETF 折溢價套利。ETF 在次級市場有「市價」，在初級市場可申購或贖回「淨值」，當市價與淨值出現差距（折價或溢價）達到一定幅度時，我們會透過初級與次級市場同時進行低買高賣的套利操作。' },
    { q: 'ETF 套利的原理是什麼？', a: '當 ETF 市價高於淨值（溢價）時，可在初級市場以淨值申購並在次級市場以較高市價賣出；反之折價時則反向操作。這種策略利用的是市場定價偏差，而非市場方向，因此受市場漲跌的影響較低。' },
    { q: '除了 ETF 套利還有哪些策略？', a: '我們也運用套期保值套利（期貨與現貨間的價差）、跨市場套利（同標的在不同市場的價差，如台積電在台股與美股的價差）、搬磚套利（不同平台間的價差）及期現套利（利用永續合約資金費率機制）等多元策略。' },
    { q: '市場大跌時會受影響嗎？', a: '我們的策略主要依靠市場的折溢價差與定價偏差獲利，而非依賴市場方向。在市場急漲急跌時，折溢價差反而可能擴大，提供更多套利機會。自 2020 年以來，我們已成功經歷多次市場劇烈波動。' },
    { q: '投資是否有風險？', a: '所有投資皆涉及風險，過往績效不代表未來表現。我們透過多元策略與風控機制管理風險，但無法保證收益。建議您依自身財務狀況審慎評估。' },
  ],
  '帳戶與資金': [
    { q: '支援哪些幣別？', a: '目前支援 USDT、USD、USDC 及 TWD。' },
    { q: '可以隨時取回資金嗎？', a: '是的，您可以隨時提出資金調整需求，我們了解資金靈活性對於個人財務管理的重要性。我們將會在最多三個工作天內將資金戶轉入指定帳戶。' },
    { q: '歷史報酬表現如何？', a: '歷史年化報酬可達 7%，收益每日累計，為您的資產提供穩定的年化收益。' },
    { q: '如何調整投資配置？', a: '您可以隨時與我們的團隊聯繫，依需求調整您的投資組合。' },
  ],
  '安全 & 隱私': [
    { q: '如何保障資產安全？', a: '我們建立完善的風控體系與資產保全機制，並持續監控投資組合風險。策略本身以套利為主，降低對市場方向的依賴。' },
    { q: '資料如何保護？', a: '所有用戶資料均透過加密技術與安全協議保護，存儲於符合國際安全標準的伺服器中。' },
    { q: '誰可以存取我的資訊？', a: '僅經授權的團隊成員可存取必要的用戶資訊，且受嚴格的隱私政策規範。' },
  ],
}

const tabs = Object.keys(faqData)

export default function FAQScreen() {
  const [activeTab, setActiveTab] = useState('一般')
  const [openIndex, setOpenIndex] = useState(null)
  const insets = useSafeAreaInsets()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.heroTitle}>常見問答</Text>
      </View>

      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.tabActive]}
                onPress={() => { setActiveTab(tab); setOpenIndex(null) }}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {faqData[activeTab].map((item, i) => (
          <View key={i} style={styles.faqItem}>
            <TouchableOpacity style={styles.faqQuestion} onPress={() => setOpenIndex(openIndex === i ? null : i)}>
              <Text style={styles.faqQuestionText}>{item.q}</Text>
              <Text style={styles.faqArrow}>{openIndex === i ? '−' : '+'}</Text>
            </TouchableOpacity>
            {openIndex === i && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{item.a}</Text>
              </View>
            )}
          </View>
        ))}
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
  heroTitle: { color: colors.white, fontSize: 26, fontWeight: '700' },
  section: { padding: 24 },
  tabsScroll: { marginBottom: 20 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 14, color: colors.textSecondary },
  tabTextActive: { color: colors.white, fontWeight: '600' },
  faqItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: { fontSize: 15, fontWeight: '600', color: colors.text, flex: 1, marginRight: 12 },
  faqArrow: { fontSize: 20, color: colors.primary, fontWeight: '600' },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 16 },
  faqAnswerText: { fontSize: 14, color: colors.textSecondary, lineHeight: 22 },
})
