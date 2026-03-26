import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../theme'

export default function ReferralScreen() {
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.section}>
        <Text style={styles.bodyText}>
          推薦朋友加入即可獲得額外回饋，同時支持我們的社群一起成長。
        </Text>
        <Text style={styles.bodyText}>
          用戶不僅是我們最珍貴的夥伴，更是我們的成長動力。
        </Text>
      </View>

      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>回饋制度</Text>
        <View style={styles.card}>
          <Text style={styles.cardHighlight}>10%</Text>
          <Text style={styles.cardDesc}>可獲得被推薦用戶投資收益的 10% 作為推薦回饋</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHighlight}>年度回饋</Text>
          <Text style={styles.cardDesc}>從推薦的用戶開始使用的當天起，每年持續獲得回饋</Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>了解更多方案詳情</Text>
        <Text style={styles.ctaSubtitle}>歡迎與我們的團隊聯繫</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>聯繫我們</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: { padding: 24 },
  sectionGray: { backgroundColor: colors.backgroundGray, padding: 24 },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 20 },
  bodyText: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 8 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHighlight: { fontSize: 28, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  cardDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
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
