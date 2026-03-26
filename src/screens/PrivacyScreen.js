import { ScrollView, Text, StyleSheet } from 'react-native'
import { colors } from '../theme'

export default function PrivacyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
      <Text style={styles.heading}>資料蒐集與使用</Text>
      <Text style={styles.body}>
        Simple Finance 重視您的隱私權。我們僅蒐集提供服務所必要之個人資料，包括姓名、電子郵件及聯繫方式等，並僅用於帳戶管理、客戶服務及法規遵循之目的。
      </Text>

      <Text style={styles.heading}>資料保護</Text>
      <Text style={styles.body}>
        所有用戶資料均存儲於符合國際安全標準之加密伺服器中，並採用多重安全協議保護。我們定期進行安全稽核，確保您的資料受到妥善保護。
      </Text>

      <Text style={styles.heading}>資料分享</Text>
      <Text style={styles.body}>
        除法律要求或經您明確同意外，本公司不會將您的個人資料提供予任何第三方。我們絕不會出售或交換用戶個人資訊。
      </Text>

      <Text style={styles.heading}>用戶權利</Text>
      <Text style={styles.body}>
        您有權隨時查閱、更正或要求刪除您的個人資料。如需行使上述權利，請透過我們的聯繫管道與我們聯繫。
      </Text>

      <Text style={styles.heading}>政策更新</Text>
      <Text style={styles.body}>
        本隱私政策可能因法規變動或服務調整而更新。更新後之政策將公告於本頁面，建議您定期查閱以了解最新內容。
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heading: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16, marginTop: 12 },
  body: { fontSize: 15, color: colors.textSecondary, lineHeight: 24, marginBottom: 12 },
})
