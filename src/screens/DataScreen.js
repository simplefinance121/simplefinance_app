import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export default function DataScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.section}>
        <View style={styles.aumDisplay}>
          <Text style={styles.aumValue}>$1,347,911.73 USD</Text>
          <Text style={styles.aumNote}>數據定期更新，反映目前管理之資產規模。</Text>
        </View>
      </View>

      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>營運概況</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusCard}>
            <Text style={styles.statusValue}>37</Text>
            <Text style={styles.statusLabel}>合作用戶</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusValue}>$36,430.05</Text>
            <Text style={styles.statusLabel}>平均配置金額</Text>
          </View>
          <View style={styles.statusCard}>
            <Text style={styles.statusValue}>$73,174.91</Text>
            <Text style={styles.statusLabel}>風險準備金</Text>
          </View>
        </View>
        <Text style={styles.updatedText}>最後更新：09/07/2023</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.desc}>
          以上為目前管理之資產配置概覽，數據定期更新。所有數據僅供參考，不構成任何投資建議或承諾。
        </Text>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>邀請制服務</Text>
        <Text style={styles.ctaSubtitle}>本平台僅供現有私人客戶使用，新客戶請聯絡客服了解加入方式。</Text>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { padding: 24 },
  sectionGray: { backgroundColor: colors.backgroundGray, padding: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 20 },
  aumDisplay: { alignItems: 'center', paddingVertical: 20 },
  aumValue: { fontSize: 26, fontWeight: '700', color: colors.primary, marginBottom: 12 },
  aumNote: { fontSize: 14, color: colors.textSecondary },
  statusGrid: { gap: 12 },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusValue: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
  statusLabel: { fontSize: 14, color: colors.textSecondary },
  updatedText: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16 },
  desc: { fontSize: 14, color: colors.textSecondary, lineHeight: 22, textAlign: 'center' },
  ctaSection: {
    backgroundColor: colors.dark,
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: { color: colors.white, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  ctaSubtitle: { color: '#a8b2d1', fontSize: 14, textAlign: 'center', lineHeight: 22 },
})
