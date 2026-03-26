import { ScrollView, View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export default function TermsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text style={styles.heading}>投資警語</Text>
      <Text style={styles.body}>
        本網站所提供之資訊、系統架構說明與技術解決方案內容僅供參考、技術交流與學術研究之用，不構成任何形式的投資建議、買賣要約、招攬或推薦。
      </Text>
      <Text style={styles.body}>
        金融商品交易（包括但不限於國內外股票、期貨、選擇權、虛擬貨幣等）具有高度風險，價格波動劇烈，可能導致部分或全部本金損失，甚至超過原始投資金額。
      </Text>
      <Text style={styles.body}>
        使用者在使用本公司提供之軟體、系統或策略模型時，應審慎評估自身財務狀況、風險承受能力與投資目標，並於必要時尋求獨立合格財務顧問之建議。
      </Text>
      <Text style={styles.body}>
        Simple Finance 提供資訊技術服務與系統開發，不參與客戶之任何投資決策，亦不保證獲利或對任何交易結果、數據準確性負擔法律責任。所有交易決策所產生之損益，概由投資人自行承擔。
      </Text>

      <Text style={styles.heading}>防詐騙聲明</Text>
      <Text style={styles.body}>
        本公司近期接獲通報，有不肖人士或集團冒用「Simple Finance」名義，透過社群媒體、通訊軟體或偽造網站，從事非法集資、假投資真詐財、代客操作、報明牌、提供投資建議或招攬投顧會員等詐騙行為。
      </Text>
      <Text style={styles.body}>
        特此嚴正聲明：本公司專注於金融科技服務與系統開發，絕無提供任何形式之代操、集資投資或個別有價證券推薦顧問服務。上述行為皆非經本公司授權，任何相關資訊皆為假借本公司名義之詐騙行為。
      </Text>
      <Text style={styles.body}>
        若您接獲可疑訊息，請務必提高警覺切勿輕信，並請立即透過本公司官方聯繫管道查證，以免受騙上當。
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16, marginTop: 12 },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 12 },
})
