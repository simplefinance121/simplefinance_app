import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors } from '../theme'

export default function ReferralScreen() {
  const navigation = useNavigation()

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.section}>
        <Text style={styles.bodyText}>
          本平台採邀請制，現有客戶可透過專屬邀請碼介紹符合資格的朋友加入。
        </Text>
        <Text style={styles.bodyText}>
          詳細制度與資格條件請聯絡客服諮詢。
        </Text>
      </View>

      <View style={styles.sectionGray}>
        <Text style={styles.sectionTitle}>制度說明</Text>
        <View style={styles.card}>
          <Text style={styles.cardHighlight}>推薦獎勵制度</Text>
          <Text style={styles.cardDesc}>聯絡客服諮詢</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardHighlight}>邀請制</Text>
          <Text style={styles.cardDesc}>僅限現有客戶推薦合適的朋友加入本平台</Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>了解更多制度詳情</Text>
        <Text style={styles.ctaSubtitle}>請聯絡客服取得完整制度說明與邀請碼</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('ContactTab')}>
          <Text style={styles.btnPrimaryText}>聯絡客服諮詢</Text>
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
