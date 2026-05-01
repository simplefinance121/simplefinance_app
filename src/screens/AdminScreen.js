import { useEffect, useState } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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
  const [interestRecords, setInterestRecords] = useState({})
  const [referralBonusRecords, setReferralBonusRecords] = useState({})
  const [txForm, setTxForm] = useState({ type: 'deposit', amount: '', date: '' })
  const [txSaving, setTxSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [currencySaving, setCurrencySaving] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [txPage, setTxPage] = useState({})
  const [txFilter, setTxFilter] = useState({})
  const [deletingUser, setDeletingUser] = useState(null)
  const [referralModal, setReferralModal] = useState(null)
  const [referralData, setReferralData] = useState(null)
  const [referralLoading, setReferralLoading] = useState(false)
  const [editingBonusRate, setEditingBonusRate] = useState(false)
  const [bonusRateValue, setBonusRateValue] = useState('')
  const [bonusRateSaving, setBonusRateSaving] = useState(false)
  const [interestRateModal, setInterestRateModal] = useState(null)
  const [interestRateValue, setInterestRateValue] = useState('')
  const [interestRateSaving, setInterestRateSaving] = useState(false)
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

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
      const [txRes, intRes, refRes] = await Promise.all([
        fetch(`${API}/api/admin/users/${userId}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/admin/users/${userId}/interest`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/api/admin/users/${userId}/referral-bonus`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (txRes.ok) {
        const data = await txRes.json()
        setTransactions((prev) => ({ ...prev, [userId]: data }))
      }
      if (intRes.ok) {
        const data = await intRes.json()
        setInterestRecords((prev) => ({ ...prev, [userId]: data }))
      }
      if (refRes.ok) {
        const data = await refRes.json()
        setReferralBonusRecords((prev) => ({ ...prev, [userId]: data }))
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
      setTxFilter((prev) => ({ ...prev, [userId]: 'deposit' }))
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
      const currentUser = users.find((u) => u._id === userId)
      const currentAssets = currentUser?.assets || 0
      const amount = Number(txForm.amount)
      const newAssets = data.updatedAssets !== undefined
        ? data.updatedAssets
        : txForm.type === 'deposit' ? currentAssets + amount : currentAssets - amount
      updateUserAssets(userId, newAssets)
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

  const deleteUser = (user) => {
    Alert.alert(
      '刪除用戶',
      `確定要刪除用戶「${user.name}」（${user.email}）嗎？\n\n此操作將刪除該用戶的所有資料（交易紀錄、利息、推薦獎勵等），且無法復原。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            setDeletingUser(user._id)
            try {
              const res = await fetch(`${API}/api/admin/users/${user._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
              if (!res.ok) {
                const data = await res.json()
                Toast.show({ type: 'error', text1: data.message || '刪除失敗' })
                return
              }
              setUsers(users.filter((u) => u._id !== user._id))
              if (expandedId === user._id) setExpandedId(null)
              Toast.show({ type: 'success', text1: `已刪除用戶「${user.name}」` })
            } catch {
              Toast.show({ type: 'error', text1: '刪除用戶失敗' })
            } finally {
              setDeletingUser(null)
            }
          },
        },
      ]
    )
  }

  const openReferralModal = async (user) => {
    setReferralModal(user)
    setReferralData(null)
    setEditingBonusRate(false)
    setReferralLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/users/${user._id}/referrals`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setReferralData(await res.json())
      } else {
        Toast.show({ type: 'error', text1: '取得推薦制度資料失敗' })
        setReferralModal(null)
      }
    } catch {
      Toast.show({ type: 'error', text1: '取得推薦制度資料失敗' })
      setReferralModal(null)
    } finally {
      setReferralLoading(false)
    }
  }

  const saveBonusRate = async () => {
    if (bonusRateValue === '' || isNaN(Number(bonusRateValue))) {
      Toast.show({ type: 'error', text1: '請輸入有效的百分比' })
      return
    }
    setBonusRateSaving(true)
    try {
      const res = await fetch(`${API}/api/admin/users/${referralModal._id}/referral-bonus-rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rate: Number(bonusRateValue) }),
      })
      if (!res.ok) {
        const data = await res.json()
        Toast.show({ type: 'error', text1: data.message || '更新失敗' })
        return
      }
      setReferralData((prev) => ({
        ...prev,
        referralBonusRate: Number(bonusRateValue),
        referees: prev.referees.map((r) => ({ ...r, bonusPercent: Number(bonusRateValue) })),
      }))
      setEditingBonusRate(false)
      Toast.show({ type: 'success', text1: '推薦獎勵百分比已更新' })
    } catch {
      Toast.show({ type: 'error', text1: '更新推薦獎勵百分比失敗' })
    } finally {
      setBonusRateSaving(false)
    }
  }

  const saveInterestRate = async () => {
    if (interestRateValue === '' || isNaN(Number(interestRateValue))) {
      Toast.show({ type: 'error', text1: '請輸入有效的利率' })
      return
    }
    setInterestRateSaving(true)
    try {
      const res = await fetch(`${API}/api/admin/users/${interestRateModal._id}/interest-rate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rate: Number(interestRateValue) }),
      })
      if (!res.ok) {
        const data = await res.json()
        Toast.show({ type: 'error', text1: data.message || '更新失敗' })
        return
      }
      setUsers(users.map((u) => u._id === interestRateModal._id ? { ...u, interestRate: Number(interestRateValue) } : u))
      setInterestRateModal(null)
      Toast.show({ type: 'success', text1: '利率已更新' })
    } catch {
      Toast.show({ type: 'error', text1: '更新利率失敗' })
    } finally {
      setInterestRateSaving(false)
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
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
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
              {u.referralCode && (
                <Text style={styles.userReferral}>推薦碼：{u.referralCode}</Text>
              )}
              {u.referredBy && (
                <Text style={styles.userReferral}>推薦人：{u.referredBy}</Text>
              )}
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
                  <TouchableOpacity
                    style={styles.viewBtn}
                    onPress={() => navigation.navigate('UserDashboard', { viewUserId: u._id })}
                  >
                    <Text style={styles.viewBtnText}>查看</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.referralBtn} onPress={() => openReferralModal(u)}>
                    <Text style={styles.referralBtnText}>推薦制度</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.expandBtn} onPress={() => toggleExpand(u._id)}>
                    <Text style={styles.expandBtnText}>{expandedId === u._id ? '收起' : '詳細資料'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.interestBtn}
                    onPress={() => {
                      setInterestRateModal(u)
                      setInterestRateValue(String(u.interestRate || 7))
                    }}
                  >
                    <Text style={styles.interestBtnText}>利率 {u.interestRate || 7}%</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteUserBtn}
                    onPress={() => deleteUser(u)}
                    disabled={deletingUser === u._id}
                  >
                    <Text style={styles.deleteUserBtnText}>{deletingUser === u._id ? '刪除中...' : '刪除用戶'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

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

                <View style={styles.txFilterRow}>
                  {[
                    { key: 'deposit', label: '入金' },
                    { key: 'withdrawal', label: '出金' },
                    { key: 'interest', label: '利息' },
                    { key: 'referral', label: '推薦獎勵' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={[styles.txFilterBtn, (txFilter[u._id] || 'deposit') === f.key && styles.txFilterBtnActive]}
                      onPress={() => {
                        setTxFilter((prev) => ({ ...prev, [u._id]: f.key }))
                        setTxPage((prev) => ({ ...prev, [u._id]: 1 }))
                      }}
                    >
                      <Text style={[styles.txFilterBtnText, (txFilter[u._id] || 'deposit') === f.key && styles.txFilterBtnTextActive]}>
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {(() => {
                  const filter = txFilter[u._id] || 'deposit'
                  let list = []
                  let showDelete = false
                  let typeLabel = ''
                  let typeStyle = null

                  if (filter === 'deposit') {
                    list = (transactions[u._id] || []).filter((tx) => tx.type === 'deposit')
                    showDelete = true
                    typeLabel = '入金'
                    typeStyle = styles.depositText
                  } else if (filter === 'withdrawal') {
                    list = (transactions[u._id] || []).filter((tx) => tx.type === 'withdrawal')
                    showDelete = true
                    typeLabel = '出金'
                    typeStyle = styles.withdrawalText
                  } else if (filter === 'interest') {
                    list = interestRecords[u._id] || []
                    typeLabel = '利息'
                    typeStyle = styles.interestText
                  } else if (filter === 'referral') {
                    list = referralBonusRecords[u._id] || []
                    typeLabel = '推薦獎勵'
                    typeStyle = styles.referralText
                  }

                  if (list.length === 0) {
                    return <Text style={styles.emptyText}>尚無{typeLabel}紀錄</Text>
                  }

                  const page = txPage[u._id] || 1
                  const totalPages = Math.ceil(list.length / TX_PAGE_SIZE)
                  const pageItems = list.slice((page - 1) * TX_PAGE_SIZE, page * TX_PAGE_SIZE)

                  return (
                    <>
                      {pageItems.map((tx) => (
                        <View key={tx._id} style={styles.txRow}>
                          <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString('zh-TW')}</Text>
                          <Text style={[styles.txType, typeStyle]}>
                            {filter === 'referral' ? `來自 ${tx.fromUserName || '推薦用戶'}` : typeLabel}
                          </Text>
                          <Text style={[styles.txAmount, typeStyle]}>
                            {filter === 'withdrawal' ? '-' : '+'}{fmtAmount(tx.amount)}
                          </Text>
                          {showDelete ? (
                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => deleteTransaction(tx._id, u._id)}
                              disabled={deleting === tx._id}
                            >
                              <Text style={styles.deleteBtnText}>{deleting === tx._id ? '...' : '刪除'}</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.deletePlaceholder} />
                          )}
                        </View>
                      ))}
                      {totalPages > 1 && (
                        <View style={styles.paginationRow}>
                          <TouchableOpacity disabled={page <= 1} onPress={() => setTxPage((prev) => ({ ...prev, [u._id]: page - 1 }))}>
                            <Text style={[styles.pageBtn, page <= 1 && { color: colors.textMuted }]}>‹</Text>
                          </TouchableOpacity>
                          <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                          <TouchableOpacity disabled={page >= totalPages} onPress={() => setTxPage((prev) => ({ ...prev, [u._id]: page + 1 }))}>
                            <Text style={[styles.pageBtn, page >= totalPages && { color: colors.textMuted }]}>›</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </>
                  )
                })()}
              </View>
            )}
          </View>
        ))}

        {users.length === 0 && !error && <Text style={styles.emptyText}>目前沒有用戶</Text>}

        <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
          <Text style={styles.logoutBtnText}>登出</Text>
        </TouchableOpacity>
      </View>

      {/* Referral Modal */}
      <Modal
        visible={!!referralModal}
        transparent
        animationType="fade"
        onRequestClose={() => setReferralModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{referralModal?.name} — 推薦制度</Text>
              <TouchableOpacity onPress={() => setReferralModal(null)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              {referralLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
              ) : referralData ? (
                <>
                  <View style={styles.bonusRateRow}>
                    <Text style={styles.bonusRateLabel}>推薦獎勵%數：</Text>
                    {editingBonusRate ? (
                      <View style={styles.bonusRateEdit}>
                        <TextInput
                          style={styles.bonusRateInput}
                          value={bonusRateValue}
                          onChangeText={setBonusRateValue}
                          keyboardType="numeric"
                          autoFocus
                        />
                        <Text style={styles.bonusRatePercent}>%</Text>
                        <TouchableOpacity style={styles.saveBtn} onPress={saveBonusRate} disabled={bonusRateSaving}>
                          <Text style={styles.saveBtnText}>{bonusRateSaving ? '儲存中...' : '儲存'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingBonusRate(false)} disabled={bonusRateSaving}>
                          <Text style={styles.cancelBtnText}>取消</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.bonusRateDisplay}>
                        <Text style={styles.bonusRateValue}>{referralData.referralBonusRate}%</Text>
                        <TouchableOpacity
                          style={styles.smallEditBtn}
                          onPress={() => {
                            setEditingBonusRate(true)
                            setBonusRateValue(String(referralData.referralBonusRate))
                          }}
                        >
                          <Text style={styles.smallEditBtnText}>修改</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  <Text style={styles.modalSubtitle}>被推薦人</Text>
                  {referralData.referees.length > 0 ? (
                    <View style={styles.modalTable}>
                      <View style={styles.modalTableHeader}>
                        <Text style={[styles.modalTableHeaderText, { flex: 1 }]}>被推薦人名</Text>
                        <Text style={[styles.modalTableHeaderText, { flex: 1, textAlign: 'right' }]}>獎勵%數</Text>
                      </View>
                      {referralData.referees.map((r, i) => (
                        <View key={i} style={styles.modalTableRow}>
                          <Text style={[styles.modalTableCell, { flex: 1 }]}>{r.name}</Text>
                          <Text style={[styles.modalTableCell, { flex: 1, textAlign: 'right' }]}>{r.bonusPercent}%</Text>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>無被推薦人</Text>
                  )}

                  <Text style={styles.modalSubtitle}>推薦人</Text>
                  {referralData.referrer ? (
                    <View style={styles.modalTable}>
                      <View style={styles.modalTableHeader}>
                        <Text style={[styles.modalTableHeaderText, { flex: 1 }]}>人名</Text>
                      </View>
                      <View style={styles.modalTableRow}>
                        <Text style={[styles.modalTableCell, { flex: 1 }]}>{referralData.referrer.name}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.emptyText}>無推薦人</Text>
                  )}
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Interest Rate Modal */}
      <Modal
        visible={!!interestRateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setInterestRateModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{interestRateModal?.name} — 利率設定</Text>
              <TouchableOpacity onPress={() => setInterestRateModal(null)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.interestRateLabel}>年利率 (%)</Text>
              <TextInput
                style={styles.interestRateInput}
                value={interestRateValue}
                onChangeText={setInterestRateValue}
                keyboardType="numeric"
                autoFocus
              />
              <View style={styles.interestRateActions}>
                <TouchableOpacity style={styles.saveBtn} onPress={saveInterestRate} disabled={interestRateSaving}>
                  <Text style={styles.saveBtnText}>{interestRateSaving ? '儲存中...' : '儲存'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setInterestRateModal(null)} disabled={interestRateSaving}>
                  <Text style={styles.cancelBtnText}>取消</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  userReferral: { fontSize: 12, color: '#f59e0b', marginTop: 2 },
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
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  editBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  viewBtn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  referralBtn: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  referralBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  expandBtn: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  expandBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  interestBtn: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  interestBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  deleteUserBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteUserBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
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
  txFilterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  txFilterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundGray,
  },
  txFilterBtnActive: { backgroundColor: colors.primary },
  txFilterBtnText: { fontSize: 13, color: colors.textSecondary },
  txFilterBtnTextActive: { color: colors.white },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: 8,
  },
  txDate: { flex: 1, fontSize: 13, color: colors.text },
  txType: { fontSize: 13, flex: 1 },
  depositText: { color: colors.deposit },
  withdrawalText: { color: colors.withdrawal },
  interestText: { color: colors.interest },
  referralText: { color: '#f59e0b' },
  txAmount: { fontSize: 13, color: colors.text, width: 90, textAlign: 'right' },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  deleteBtnText: { color: colors.error, fontSize: 12 },
  deletePlaceholder: { width: 0 },
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.text, flex: 1 },
  modalClose: { fontSize: 28, color: colors.textMuted, lineHeight: 28, paddingHorizontal: 8 },
  modalBody: { padding: 20 },
  modalSubtitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  bonusRateRow: { marginBottom: 12 },
  bonusRateLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  bonusRateDisplay: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bonusRateValue: { fontSize: 18, fontWeight: '700', color: colors.primary },
  bonusRateEdit: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  bonusRateInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 15,
    width: 80,
    color: colors.text,
  },
  bonusRatePercent: { fontSize: 16, color: colors.text },
  smallEditBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  smallEditBtnText: { color: colors.white, fontSize: 12, fontWeight: '600' },
  modalTable: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalTableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundGray,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalTableHeaderText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  modalTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  modalTableCell: { fontSize: 14, color: colors.text },
  interestRateLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  interestRateInput: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  interestRateActions: { flexDirection: 'row', gap: 8 },
})
