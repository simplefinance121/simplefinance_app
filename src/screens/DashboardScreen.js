import { useEffect, useState, useMemo, useRef } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Dimensions, ActivityIndicator, PanResponder, StyleSheet } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText } from 'react-native-svg'
import { useAuth } from '../context/AuthContext'
import API from '../config'
import { colors } from '../theme'

const PAGE_SIZE = 7
const CHART_HEIGHT = 220
const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 55 }

function getChartWidth() {
  return Dimensions.get('window').width - 64
}

export default function DashboardScreen() {
  const { user: authUser, token, logout, updateUser } = useAuth()
  const route = useRoute()
  const viewUserId = route?.params?.viewUserId
  const isAdminView = !!viewUserId
  const [user, setUser] = useState(isAdminView ? null : authUser)
  const [transactions, setTransactions] = useState([])
  const [interestRecords, setInterestRecords] = useState([])
  const [txPage, setTxPage] = useState(1)
  const [intPage, setIntPage] = useState(1)
  const [referralBonusRecords, setReferralBonusRecords] = useState([])
  const [refBonusPage, setRefBonusPage] = useState(1)
  const [totalYears, setTotalYears] = useState(5)
  const [loading, setLoading] = useState(true)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!authUser || !token) return
    if (!isAdminView) setUser(authUser)
    fetchData()
  }, [authUser, token, viewUserId])

  const fetchData = async () => {
    if (!token) return
    try {
      if (isAdminView) {
        const res = await fetch(`${API}/api/admin/users/${viewUserId}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!mountedRef.current) return
        if (res.ok) {
          const data = await res.json()
          if (mountedRef.current) {
            setUser(data.user)
            setTransactions(data.transactions || [])
            setInterestRecords(data.interestRecords || [])
            setReferralBonusRecords(data.referralBonusRecords || [])
          }
        }
        return
      }

      const [meRes, txRes, intRes, refBonusRes] = await Promise.all([
        fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/auth/me/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/auth/me/interest`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API}/api/auth/me/referral-bonus`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      if (!mountedRef.current) return

      if (meRes.ok) {
        const meData = await meRes.json()
        if (meData?.user && mountedRef.current) {
          setUser(meData.user)
          updateUser(meData.user)
        }
      }
      if (txRes.ok && mountedRef.current) {
        const txData = await txRes.json()
        if (Array.isArray(txData)) setTransactions(txData)
      }
      if (intRes.ok && mountedRef.current) {
        const intData = await intRes.json()
        if (Array.isArray(intData)) setInterestRecords(intData)
      }
      if (refBonusRes.ok && mountedRef.current) {
        const refData = await refBonusRes.json()
        if (Array.isArray(refData)) setReferralBonusRecords(refData)
      }
    } catch {
      // ignore
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }

  const assets = user ? (user.assets || 0) : 0
  const earnings = user ? (user.allTimeEarnings || 0) : 0
  const currency = user ? (user.currency || 'USD') : 'USD'
  const interestRate = user?.interestRate ?? 7

  const fmt = (v) => {
    const n = Number(v)
    if (n < 1) return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    return `$${Math.round(n).toLocaleString()}`
  }

  const yearOptions = [1, 3, 5, 10, 20]
  const projectionDays = 365 * totalYears

  const chartData = useMemo(() => {
    if (!assets && transactions.length === 0) return null
    const DAY_MS = 24 * 60 * 60 * 1000
    const dailyRate = Math.pow(interestRate / 100 + 1, 1 / 365) - 1
    const allValues = []
    const allDates = []

    const allRecords = [
      ...transactions.map(t => ({ date: new Date(t.date), amount: t.amount, type: t.type })),
      ...interestRecords.map(t => ({ date: new Date(t.date), amount: t.amount, type: 'interest' })),
    ].sort((a, b) => a.date - b.date)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let hDays = 0
    if (allRecords.length > 0) {
      const firstDate = new Date(allRecords[0].date)
      firstDate.setHours(0, 0, 0, 0)
      hDays = Math.floor((today - firstDate) / DAY_MS)

      const txByDay = {}
      for (const rec of allRecords) {
        const d = new Date(rec.date)
        d.setHours(0, 0, 0, 0)
        const key = d.getTime()
        if (!txByDay[key]) txByDay[key] = []
        txByDay[key].push(rec)
      }

      let balance = 0
      for (let day = 0; day <= hDays; day++) {
        const currentDate = new Date(firstDate.getTime() + day * DAY_MS)
        const key = currentDate.getTime()
        if (txByDay[key]) {
          for (const rec of txByDay[key]) {
            if (rec.type === 'deposit') balance += rec.amount
            else if (rec.type === 'withdrawal') balance -= rec.amount
            else balance += rec.amount
          }
        }
        allValues.push(Math.round(balance * 100) / 100)
        allDates.push(currentDate)
      }
    }

    for (let day = 1; day <= projectionDays; day++) {
      allValues.push(Math.round(assets * Math.pow(1 + dailyRate, day)))
      allDates.push(new Date(today.getTime() + day * DAY_MS))
    }

    // Sample ~50 points
    const totalPoints = allValues.length
    const step = Math.max(1, Math.floor(totalPoints / 50))
    const values = []
    const dates = []
    for (let i = 0; i < totalPoints; i += step) {
      values.push(allValues[i])
      dates.push(allDates[i])
    }
    if (values[values.length - 1] !== allValues[allValues.length - 1]) {
      values.push(allValues[allValues.length - 1])
      dates.push(allDates[allDates.length - 1])
    }

    return { values, dates }
  }, [assets, projectionDays, transactions, interestRecords, interestRate])

  if (!authUser) return (
    <View style={{ flex: 1, backgroundColor: colors.dark }} />
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  if (!user) return (
    <View style={{ flex: 1, backgroundColor: colors.dark }} />
  )

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} scrollEnabled={scrollEnabled}>
      {/* Stats Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        {isAdminView && (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backBtnText}>← 返回管理後台</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.welcome}>歡迎回來，{user.name}</Text>
        <Text style={styles.headerTitle}>資產與收益</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{fmt(assets)}</Text>
            <Text style={styles.statLabel}>客戶資產 ({currency})</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={[styles.statValue, earnings >= 0 ? styles.positive : styles.negative]}>
              {earnings >= 0 ? '+' : ''}{fmt(earnings)}
            </Text>
            <Text style={styles.statLabel}>累計收益 ({currency})</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Chart */}
        {chartData && chartData.values.length > 1 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>資產成長趨勢 (年化 {interestRate}% 複利)</Text>
            <View style={styles.yearBtns}>
              {yearOptions.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearBtn, totalYears === y && styles.yearBtnActive]}
                  onPress={() => setTotalYears(y)}
                >
                  <Text style={[styles.yearBtnText, totalYears === y && styles.yearBtnTextActive]}>
                    {y}年
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <AreaChart data={chartData} onTouchStart={() => setScrollEnabled(false)} onTouchEnd={() => setScrollEnabled(true)} />
            <Text style={styles.chartNote}>
              * 歷史資料為實際資產紀錄，未來預估基於年化 {interestRate}% 每日複利計算，實際報酬可能因市場波動而有所不同。
            </Text>
          </View>
        )}

        {/* Transactions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>入金 / 出金紀錄</Text>
          {transactions.length > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>日期</Text>
                <Text style={[styles.tableHeaderText, { flex: 0.6 }]}>類型</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>金額 ({currency})</Text>
              </View>
              {transactions.slice((txPage - 1) * PAGE_SIZE, txPage * PAGE_SIZE).map((tx) => (
                <View key={tx._id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {new Date(tx.date).toLocaleDateString('zh-TW')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 0.6 }, tx.type === 'deposit' ? styles.depositText : styles.withdrawalText]}>
                    {tx.type === 'deposit' ? '入金' : '出金'}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }, tx.type === 'deposit' ? styles.depositText : styles.withdrawalText]}>
                    {tx.type === 'deposit' ? '+' : '-'}{fmt(tx.amount)}
                  </Text>
                </View>
              ))}
              {transactions.length > PAGE_SIZE && (
                <Pagination current={txPage} total={Math.ceil(transactions.length / PAGE_SIZE)} onChange={setTxPage} />
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>尚無入金/出金紀錄</Text>
          )}
        </View>

        {/* Interest */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>每日利息紀錄</Text>
          {interestRecords.length > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>日期</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>利息 ({currency})</Text>
              </View>
              {interestRecords.slice((intPage - 1) * PAGE_SIZE, intPage * PAGE_SIZE).map((rec) => (
                <View key={rec._id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {new Date(rec.date).toLocaleDateString('zh-TW')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }, styles.interestText]}>
                    +{fmt(rec.amount)}
                  </Text>
                </View>
              ))}
              {interestRecords.length > PAGE_SIZE && (
                <Pagination current={intPage} total={Math.ceil(interestRecords.length / PAGE_SIZE)} onChange={setIntPage} />
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>尚無利息紀錄</Text>
          )}
        </View>

        {/* Referral Bonus Interest */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>推薦獎勵利息</Text>
          {referralBonusRecords.length > 0 ? (
            <>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>日期</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>來源</Text>
                <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>獎勵 ({currency})</Text>
              </View>
              {referralBonusRecords.slice((refBonusPage - 1) * PAGE_SIZE, refBonusPage * PAGE_SIZE).map((rec) => (
                <View key={rec._id} style={styles.tableRow}>
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {new Date(rec.date).toLocaleDateString('zh-TW')}
                  </Text>
                  <Text style={[styles.tableCell, { flex: 1 }]}>{rec.fromUserName || '推薦用戶'}</Text>
                  <Text style={[styles.tableCell, { flex: 1, textAlign: 'right' }, styles.referralText]}>
                    +{fmt(rec.amount)}
                  </Text>
                </View>
              ))}
              {referralBonusRecords.length > PAGE_SIZE && (
                <Pagination current={refBonusPage} total={Math.ceil(referralBonusRecords.length / PAGE_SIZE)} onChange={setRefBonusPage} />
              )}
            </>
          ) : (
            <Text style={styles.emptyText}>目前尚無推薦獎勵</Text>
          )}
        </View>

        {/* Logout (hidden in admin view) */}
        {!isAdminView && (
          <TouchableOpacity style={styles.logoutBtn} onPress={() => logout()}>
            <Text style={styles.logoutBtnText}>登出</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

function niceNum(range, round) {
  const exp = Math.floor(Math.log10(range))
  const frac = range / Math.pow(10, exp)
  let nice
  if (round) {
    if (frac < 1.5) nice = 1
    else if (frac < 3) nice = 2
    else if (frac < 7) nice = 5
    else nice = 10
  } else {
    if (frac <= 1) nice = 1
    else if (frac <= 2) nice = 2
    else if (frac <= 5) nice = 5
    else nice = 10
  }
  return nice * Math.pow(10, exp)
}

function AreaChart({ data, onTouchStart, onTouchEnd }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const chartWidth = getChartWidth()
  const { values, dates } = data
  const drawWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right
  const drawHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom

  // Compute nice Y-axis scale starting from 0
  const rawMax = Math.max(...values)
  const tickCount = 5
  const niceRange = niceNum(rawMax, false)
  const tickSpacing = niceNum(niceRange / (tickCount - 1), true)
  const niceMax = Math.ceil(rawMax / tickSpacing) * tickSpacing
  const minVal = 0
  const maxVal = niceMax || 1
  const range = maxVal

  const getX = (i) => CHART_PADDING.left + (i / (values.length - 1)) * drawWidth
  const getY = (v) => CHART_PADDING.top + drawHeight - ((v - minVal) / range) * drawHeight

  const getIndexFromX = (touchX) => {
    const x = touchX - CHART_PADDING.left
    const idx = Math.round((x / drawWidth) * (values.length - 1))
    return Math.max(0, Math.min(values.length - 1, idx))
  }

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      onTouchStart?.()
      const x = evt.nativeEvent.locationX
      setActiveIndex(getIndexFromX(x))
    },
    onPanResponderMove: (evt) => {
      const x = evt.nativeEvent.locationX
      setActiveIndex(getIndexFromX(x))
    },
    onPanResponderRelease: () => {
      setActiveIndex(null)
      onTouchEnd?.()
    },
    onPanResponderTerminate: () => {
      setActiveIndex(null)
      onTouchEnd?.()
    },
  }), [values.length, drawWidth])

  // Build line path
  let linePath = `M ${getX(0)} ${getY(values[0])}`
  for (let i = 1; i < values.length; i++) {
    const prevX = getX(i - 1)
    const prevY = getY(values[i - 1])
    const currX = getX(i)
    const currY = getY(values[i])
    const cpX = (prevX + currX) / 2
    linePath += ` C ${cpX} ${prevY}, ${cpX} ${currY}, ${currX} ${currY}`
  }

  // Build fill path (close to bottom)
  const fillPath = linePath +
    ` L ${getX(values.length - 1)} ${CHART_PADDING.top + drawHeight}` +
    ` L ${getX(0)} ${CHART_PADDING.top + drawHeight} Z`

  // Y-axis ticks using nice round numbers
  const yTicks = []
  for (let v = 0; v <= niceMax; v += tickSpacing) {
    yTicks.push({ val: v, y: getY(v) })
  }

  const formatYLabel = (v) => {
    if (v === 0) return '$0'
    if (v >= 1000000) return `$${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`
    if (v >= 1000) return `$${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
    return `$${Math.round(v)}`
  }

  const formatTooltipValue = (v) => {
    const n = Number(v)
    if (n < 1) return `$${n.toFixed(2)}`
    return `$${Math.round(n).toLocaleString()}`
  }

  // X-axis labels (~5 labels)
  const xLabels = []
  const labelStep = Math.max(1, Math.floor(values.length / 5))
  for (let i = 0; i < values.length; i += labelStep) {
    const d = dates[i]
    const label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`
    xLabels.push({ x: getX(i), label })
  }

  // Crosshair data
  const crossX = activeIndex !== null ? getX(activeIndex) : 0
  const crossY = activeIndex !== null ? getY(values[activeIndex]) : 0
  const crossDate = activeIndex !== null ? dates[activeIndex] : null
  const crossValue = activeIndex !== null ? values[activeIndex] : 0

  const formatDate = (d) => {
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
  }

  // Position tooltip inside chart near the crosshair
  const tooltipWidth = 140
  let tooltipX = activeIndex !== null ? crossX - tooltipWidth / 2 : 0
  if (tooltipX < 4) tooltipX = 4
  if (tooltipX + tooltipWidth > chartWidth - 4) tooltipX = chartWidth - tooltipWidth - 4
  const tooltipY = 4

  return (
    <View style={{ position: 'relative' }}>
      <View {...panResponder.panHandlers}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#4a6cf7" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#4a6cf7" stopOpacity="0.02" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <Line
              key={i}
              x1={CHART_PADDING.left}
              y1={tick.y}
              x2={chartWidth - CHART_PADDING.right}
              y2={tick.y}
              stroke="#f0f0f0"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <Path d={fillPath} fill="url(#areaGrad)" />

          {/* Line */}
          <Path d={linePath} fill="none" stroke="#4a6cf7" strokeWidth={2.5} />

          {/* Crosshair */}
          {activeIndex !== null && (
            <>
              {/* Vertical line */}
              <Line
                x1={crossX}
                y1={CHART_PADDING.top}
                x2={crossX}
                y2={CHART_PADDING.top + drawHeight}
                stroke="#4a6cf7"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.7}
              />
              {/* Horizontal line */}
              <Line
                x1={CHART_PADDING.left}
                y1={crossY}
                x2={chartWidth - CHART_PADDING.right}
                y2={crossY}
                stroke="#4a6cf7"
                strokeWidth={1}
                strokeDasharray="4 3"
                opacity={0.7}
              />
              {/* Dot */}
              <Path
                d={`M ${crossX - 6} ${crossY} a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0`}
                fill="#4a6cf7"
              />
              <Path
                d={`M ${crossX - 3} ${crossY} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
                fill="#fff"
              />
            </>
          )}

          {/* Y-axis labels */}
          {yTicks.map((tick, i) => (
            <SvgText
              key={i}
              x={CHART_PADDING.left - 8}
              y={tick.y + 4}
              fontSize={10}
              fill="#999"
              textAnchor="end"
            >
              {formatYLabel(tick.val)}
            </SvgText>
          ))}

          {/* X-axis labels */}
          {xLabels.map((item, i) => (
            <SvgText
              key={i}
              x={item.x}
              y={CHART_HEIGHT - 6}
              fontSize={10}
              fill="#999"
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          ))}
        </Svg>
      </View>

      {/* Tooltip overlay inside chart */}
      {activeIndex !== null && (
        <View style={[chartStyles.tooltip, { left: tooltipX, top: tooltipY }]} pointerEvents="none">
          <Text style={chartStyles.tooltipDate}>{formatDate(crossDate)}</Text>
          <Text style={chartStyles.tooltipValue}>資產 {formatTooltipValue(crossValue)}</Text>
        </View>
      )}
    </View>
  )
}

const chartStyles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    width: 140,
    backgroundColor: 'rgba(26, 26, 46, 0.92)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tooltipDate: {
    color: '#a8b2d1',
    fontSize: 11,
    textAlign: 'center',
  },
  tooltipValue: {
    color: '#4ade80',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
})

function Pagination({ current, total, onChange }) {
  const maxVisible = 5
  let startPage = Math.max(1, current - Math.floor(maxVisible / 2))
  let endPage = startPage + maxVisible - 1
  if (endPage > total) {
    endPage = total
    startPage = Math.max(1, endPage - maxVisible + 1)
  }
  const pages = []
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  return (
    <View style={pStyles.container}>
      <TouchableOpacity disabled={current <= 1} onPress={() => onChange(1)} style={pStyles.btn}>
        <Text style={[pStyles.btnText, current <= 1 && pStyles.disabled]}>首頁</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={current <= 1} onPress={() => onChange(current - 1)} style={pStyles.btn}>
        <Text style={[pStyles.btnText, current <= 1 && pStyles.disabled]}>‹</Text>
      </TouchableOpacity>
      {pages.map((p) => (
        <TouchableOpacity key={p} onPress={() => onChange(p)} style={[pStyles.btn, p === current && pStyles.active]}>
          <Text style={[pStyles.btnText, p === current && pStyles.activeText]}>{p}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity disabled={current >= total} onPress={() => onChange(current + 1)} style={pStyles.btn}>
        <Text style={[pStyles.btnText, current >= total && pStyles.disabled]}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity disabled={current >= total} onPress={() => onChange(total)} style={pStyles.btn}>
        <Text style={[pStyles.btnText, current >= total && pStyles.disabled]}>末頁</Text>
      </TouchableOpacity>
    </View>
  )
}

const pStyles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', marginTop: 16, gap: 4 },
  btn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.backgroundGray },
  btnText: { fontSize: 14, color: colors.text },
  active: { backgroundColor: colors.primary },
  activeText: { color: colors.white },
  disabled: { color: colors.textMuted },
})

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundGray },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark },
  header: {
    backgroundColor: colors.dark,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  welcome: { color: '#a8b2d1', fontSize: 14, marginBottom: 4 },
  headerTitle: { color: colors.white, fontSize: 24, fontWeight: '700', marginBottom: 20 },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 12,
  },
  backBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCard: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, height: 40, backgroundColor: '#333' },
  statValue: { color: colors.white, fontSize: 22, fontWeight: '700' },
  statLabel: { color: '#a8b2d1', fontSize: 12, marginTop: 4 },
  positive: { color: '#4ade80' },
  negative: { color: '#f87171' },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 12 },
  yearBtns: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  yearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.backgroundGray,
  },
  yearBtnActive: { backgroundColor: colors.primary },
  yearBtnText: { fontSize: 13, color: colors.textSecondary },
  yearBtnTextActive: { color: colors.white },
  chartNote: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 16 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableHeaderText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableCell: { fontSize: 14, color: colors.text },
  depositText: { color: colors.deposit },
  withdrawalText: { color: colors.withdrawal },
  interestText: { color: colors.interest },
  referralText: { color: '#f59e0b' },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  logoutBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutBtnText: { color: colors.primary, fontSize: 16, fontWeight: '600' },
})
