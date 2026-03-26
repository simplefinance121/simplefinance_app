import { useEffect, useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import Toast from 'react-native-toast-message'
import { useAuth } from '../context/AuthContext'
import API from '../config'
import { colors } from '../theme'

const ADMIN_EMAIL = 'simplefinance.com@gmail.com'
const TX_PAGE_SIZE = 10

function fmtAmount(v) {
  const n = Number(v)
  if (n < 1) return `$${n.toFixed(2)}`
  return `$${Math.round(n).toLocaleString()}`
}

export default function AdminScreen() {
  const { user: authUser, token, logout } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [transactions, setTransactions] = useState({})
  const [txForm, setTxForm] = useState({ type: 'deposit', amount: '', date: '' })
  const [txSaving, setTxSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [currencySaving, setCurrencySaving] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [txPage, setTxPage] = useState({})
  const navigation = useNavigation()

  useEffect(() => {
    if (!authUser || authUser.email !== ADMIN_EMAIL) {
      return
    }
    fetchUsers()
  }, [authUser])

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.message || '載入失敗')
        return
      }
      setUsers(await res.json())
    } catch {
      setError('載入用戶列表失敗')
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (userId) => {
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setTransactions((prev) => ({ ...prev, [userId]: data }))
      }
    } catch { /* ignore */ }
  }

  const toggleExpand = (userId) => {
    if (expandedId === userId) {
      setExpandedId(null)
    } else {
      setExpandedId(userId)
      fetchTransactions(userId)
      setTxPage((prev) => ({ ...prev, [userId]: 1 }))
    }
    setTxForm({ type: 'deposit', amount: '', date: '' })
  }

  const updateUserAssets = (userId, newAssets) => {
    setUsers(users.map((u) => (u._id === userId ? { ...u, assets: newAssets } : u)))
  }

  const saveAssets = async (userId) => {
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/assets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assets: Number(editValue) }),
      })
      if (!res.ok) {
        const data = await res.json()
        Toast.show({ type: 'error', text1: data.message || '更新失敗' })
        return
      }
      const updated = await res.json()
      updateUserAssets(userId, updated.assets)
      setEditingId(null)
      setEditValue('')
    } catch {
      Toast.show({ type: 'error', text1: '更新資產失敗' })
    } finally {
      setSaving(false)
    }
  }

  const addTransaction = async (userId) => {
    if (!txForm.amount || !txForm.date) {
      Toast.show({ type: 'error', text1: '請填寫金額和日期' })
      return
    }
    setTxSaving(true)
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: txForm.type, amount: Number(txForm.amount), date: txForm.date }),
      })
      if (!res.ok) {
        const data = await res.json()
        Toast.show({ type: 'error', text1: data.message || '新增失敗' })
        return
      }
      const data = await res.json()
      updateUserAssets(userId, data.updatedAssets)
      await fetchTransactions(userId)
      setTxForm({ type: 'deposit', amount: '', date: '' })
    } catch {
      Toast.show({ type: 'error', text1: '新增交易記錄失敗' })
    } finally {
      setTxSaving(false)
    }
  }

  const deleteTransaction = (txId, userId) => {
    Alert.alert('確認', '確定要刪除此交易記錄嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          setDeleting(txId)
          try {
            const res = await fetch(`${API}/api/admin/transactions/${txId}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            })
            if (!res.ok) {
              const data = await res.json()
              Toast.show({ type: 'error', text1: data.message || '刪除失敗' })
              return
            }
            const data = await res.json()
            updateUserAssets(userId, data.updatedAssets)
            await fetchTransactions(userId)
          } catch {
            Toast.show({ type: 'error', text1: '刪除交易記錄失敗' })
          } finally {
            setDeleting(null)
          }
        },
      },
    ])
  }

  const updateCurrency = async (userId, currency) => {
    setCurrencySaving(userId)
    try {
      const res = await fetch(`${API}/api/admin/users/${userId}/currency`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currency }),
      })
      if (!res.ok) {
        const data = await res.json()
        Toast.show({ type: 'error', text1: data.message || '更新失敗' })
        return
      }
      setUsers(users.map((u) => (u._id === userId ? { ...u, currency } : u)))
      Toast.show({ type: 'success', text1: `幣別已更新為 ${currency}` })
    } catch {
      Toast.show({ type: 'error', text1: '更新幣別失敗' })
    } finally {
      setCurrencySaving(null)
    }
  }

  if (!authUser) {
    return <View style={{ flex: 1, backgroundColor: colors.dark }} />
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const filteredUsers = users
    .filter((u) => u.email !== ADMIN_EMAIL)
    .filter((u) => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    })
    .sort((a, b) => (b.assets || 0) - (a.assets || 0))

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>管理後台</Text>
        <Text style={styles.headerSubtitle}>管理所有用戶的資產數據</Text>
      </View>

      <View style={styles.content}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.searchInput}
          placeholder="搜尋用戶姓名或電子郵件..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {filteredUsers.map((u) => (
          <View key={u._id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{u.name}</Text>
              <Text style={styles.userEmail}>{u.email}</Text>
              <View style={styles.userAssetRow}>
                <Text style={styles.userAssetLabel}>資產：</Text>
                {editingId === u._id ? (
                  <TextInput
                    style={styles.editInput}
                    value={editValue}
                    onChangeText={setEditValue}
                    keyboardType="numeric"
                    autoFocus
                  />
                ) : (
                  <Text style={styles.userAssetValue}>{fmtAmount(u.assets || 0)}</Text>
                )}
                <Text style={styles.currencyLabel}> ({u.currency || 'USD'})</Text>
              </View>
            </View>

            {/* Currency selector */}
            <View style={styles.currencyRow}>
              {['USD', 'AUD', 'TWD'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyBtn, (u.currency || 'USD') === c && styles.currencyBtnActive]}
                  onPress={() => updateCurrency(u._id, c)}
                  disabled={currencySaving === u._id}
                >
                  <Text style={[styles.currencyBtnText, (u.currency || 'USD') === c && styles.currencyBtnTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              {editingId === u._id ? (
                <>
                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveAssets(u._id)} disabled={saving}>
                    <Text style={styles.saveBtnText}>{saving ? '儲存中...' : '儲存'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setEditingId(null); setEditValue('') }}>
                    <Text style={styles.cancelBtnText}>取消</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => { setEditingId(u._id); setEditValue(String(u.assets || 0)) }}
                  >
                    <Text style={styles.editBtnText}>編輯資產</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.expandBtn} onPress={() => toggleExpand(u._id)}>
                    <Text style={styles.expandBtnText}>{expandedId === u._id ? '收起' : '入金/出金'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Expanded transaction section */}
            {expandedId === u._id && (
              <View style={styles.expandedSection}>
                <Text style={styles.expandedTitle}>新增入金/出金紀錄</Text>
                <View style={styles.txFormRow}>
                  <View style={styles.txTypeRow}>
                    <TouchableOpacity
                      style={[styles.txTypeBtn, txForm.type === 'deposit' && styles.txTypeBtnActive]}
                      onPress={() => setTxForm({ ...txForm, type: 'deposit' })}
                    >
                      <Text style={[styles.txTypeBtnText, txForm.type === 'deposit' && styles.txTypeBtnTextActive]}>入金</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.txTypeBtn, txForm.type === 'withdrawal' && styles.txTypeBtnActive]}
                      onPress={() => setTxForm({ ...txForm, type: 'withdrawal' })}
                    >
                      <Text style={[styles.txTypeBtnText, txForm.type === 'withdrawal' && styles.txTypeBtnTextActive]}>出金</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.txInput}
                    placeholder="金額"
                    placeholderTextColor={colors.textMuted}
                    value={txForm.amount}
                    onChangeText={(t) => setTxForm({ ...txForm, amount: t })}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={styles.txInput}
                    placeholder="日期 (YYYY-MM-DD)"
                    placeholderTextColor={colors.textMuted}
                    value={txForm.date}
                    onChangeText={(t) => setTxForm({ ...txForm, date: t })}
                  />
                  <TouchableOpacity
                    style={[styles.saveBtn, txSaving && { opacity: 0.6 }]}
                    onPress={() => addTransaction(u._id)}
                    disabled={txSaving}
                  >
                    <Text style={styles.saveBtnText}>{txSaving ? '新增中...' : '新增'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.expandedTitle}>交易紀錄</Text>
                {transactions[u._id]?.length > 0 ? (() => {
                  const allTx = transactions[u._id]
                  const page = txPage[u._id] || 1
                  const totalPages = Math.ceil(allTx.length / TX_PAGE_SIZE)
                  const pageTx = allTx.slice((page - 1) * TX_PAGE_SIZE, page * TX_PAGE_SIZE)
                  return (
                    <>
                      {pageTx.map((tx) => (
                        <View key={tx._id} style={styles.txRow}>
                          <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString('zh-TW')}</Text>
                          <Text style={[styles.txType, tx.type === 'deposit' ? styles.depositText : styles.withdrawalText]}>
                            {tx.type === 'deposit' ? '入金' : '出金'}
                          </Text>
                          <Text style={styles.txAmount}>{fmtAmount(tx.amount)}</Text>
                          <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => deleteTransaction(tx._id, u._id)}
                            disabled={deleting === tx._id}
                          >
                            <Text style={styles.deleteBtnText}>{deleting === tx._id ? '...' : '刪除'}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {totalPages > 1 && (
                        <View style={styles.paginationRow}>
                          <TouchableOpacity
                            disabled={page <= 1}
                            onPress={() => setTxPage((prev) => ({ ...prev, [u._id]: page - 1 }))}
                          >
                            <Text style={[styles.pageBtn, page <= 1 && { color: colors.textMuted }]}>‹</Text>
                          </TouchableOpacity>
                          <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                          <TouchableOpacity
                            disabled={page >= totalPages}
                            onPress={() => setTxPage((prev) => ({ ...prev, [u._id]: page + 1 }))}
                          >
                            <Text style={[styles.pageBtn, page >= totalPages && { color: colors.textMuted }]}>›</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )
                })() : (
                  <Text style={styles.emptyText}>尚無交易紀錄</Text>
                )}
              </View>
            )}
          </View>
        ))}

        {users.length === 0 && !error && <Text style={styles.emptyText}>目前沒有用戶</Text>}

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => logout()}
        >
          <Text style={styles.logoutBtnText}>登出</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: colors.dark,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerTitle: { color: colors.white, fontSize: 24, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { color: '#a8b2d1', fontSize: 14 },
  content: { padding: 16 },
  errorText: {
    backgroundColor: colors.errorBg,
    color: colors.error,
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: { marginBottom: 8 },
  userName: { fontSize: 16, fontWeight: '700', color: colors.text },
  userEmail: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  userAssetRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  userAssetLabel: { fontSize: 14, color: colors.textSecondary },
  userAssetValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  currencyLabel: { fontSize: 13, color: colors.textMuted },
  editInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 15,
    width: 120,
    color: colors.text,
  },
  currencyRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  currencyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundGray,
  },
  currencyBtnActive: { backgroundColor: colors.primary },
  currencyBtnText: { fontSize: 13, color: colors.textSecondary },
  currencyBtnTextActive: { color: colors.white },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  editBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  expandBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  expandBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  saveBtn: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: colors.backgroundGray,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelBtnText: { color: colors.textSecondary, fontSize: 13 },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  expandedTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
  txFormRow: { gap: 8, marginBottom: 16 },
  txTypeRow: { flexDirection: 'row', gap: 8 },
  txTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.backgroundGray,
  },
  txTypeBtnActive: { backgroundColor: colors.primary },
  txTypeBtnText: { fontSize: 13, color: colors.textSecondary },
  txTypeBtnTextActive: { color: colors.white },
  txInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.text,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 8,
  },
  txDate: { flex: 1, fontSize: 13, color: colors.text },
  txType: { fontSize: 13, width: 40 },
  depositText: { color: colors.deposit },
  withdrawalText: { color: colors.withdrawal },
  txAmount: { fontSize: 13, color: colors.text, width: 80 },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtnText: { color: colors.error, fontSize: 12 },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, gap: 16 },
  pageBtn: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  pageInfo: { fontSize: 14, color: colors.textSecondary },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: 16 },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutBtnText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
})
