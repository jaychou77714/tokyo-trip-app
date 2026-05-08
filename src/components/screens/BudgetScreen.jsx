import React, { useState, useEffect, useMemo } from 'react'
import { Plus, Trash2, ArrowLeft, TrendingUp, Receipt, Users } from 'lucide-react'
import { Button, Modal, Input, Textarea, Select, EditorialHeader, EmptyState } from '../Common'
import {
  listExpenses, saveExpense, deleteExpense,
  listTaxFree, saveTaxFree, deleteTaxFree
} from '../../lib/storage'
import { EXPENSE_CATEGORIES } from '../../data/categories'
import { getJpyToTwdRate } from '../../lib/exchange'
import dayjs from 'dayjs'

export default function BudgetScreen({ trips, selectedTripId, onSelectTrip, onBack, showToast }) {
  const trip = trips.find(t => t.id === selectedTripId) || trips[0]

  if (!trip) {
    return (
      <div className="paper-bg min-h-screen pb-24 px-5 pt-12 max-w-3xl mx-auto">
        <EditorialHeader jp="家計簿" zh="BUDGET & SETTLEMENT" accent="04" />
        <EmptyState icon="¥" title="尚無行程" desc="請先建立行程才能記帳" />
      </div>
    )
  }

  return <BudgetForTrip trip={trip} trips={trips} onSelectTrip={onSelectTrip} showToast={showToast} />
}

function BudgetForTrip({ trip, trips, onSelectTrip, showToast }) {
  const [tab, setTab] = useState('expenses') // expenses | tax | settle
  const [expenses, setExpenses] = useState([])
  const [taxFree, setTaxFree] = useState([])
  const [editingExp, setEditingExp] = useState(null)
  const [editingTax, setEditingTax] = useState(null)
  const [rate, setRate] = useState(0.21)

  useEffect(() => {
    getJpyToTwdRate().then(setRate)
    loadAll()
  }, [trip])

  async function loadAll() {
    const [exp, tax] = await Promise.all([listExpenses(trip.id), listTaxFree(trip.id)])
    setExpenses(exp)
    setTaxFree(tax)
  }

  // ===== 統計 =====
  const totalJpy = expenses.reduce((s, e) => s + (parseFloat(e.amount_jpy) || 0), 0)
  const totalTwd = totalJpy * rate

  const byCategory = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      const cat = e.category || 'other'
      if (!map[cat]) map[cat] = 0
      map[cat] += parseFloat(e.amount_jpy) || 0
    })
    return EXPENSE_CATEGORIES.map(c => ({ ...c, amount: map[c.id] || 0 }))
      .filter(c => c.amount > 0)
      .sort((a, b) => b.amount - a.amount)
  }, [expenses])

  const byDay = useMemo(() => {
    const map = {}
    expenses.forEach(e => {
      if (!e.date) return
      if (!map[e.date]) map[e.date] = 0
      map[e.date] += parseFloat(e.amount_jpy) || 0
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [expenses])

  const totalTax = taxFree.reduce((s, t) => s + (parseFloat(t.amount_jpy) || 0), 0)

  // ===== 分帳結算演算法 =====
  const settlement = useMemo(() => calculateSettlement(expenses), [expenses])

  return (
    <div className="paper-bg min-h-screen pb-24">
      <div className="px-5 pt-12 pb-4 max-w-4xl mx-auto">
        <EditorialHeader jp="家計簿" zh="BUDGET & SETTLEMENT" accent="04" />

        {/* 行程切換 */}
        {trips.length > 1 && (
          <div className="mb-4">
            <select
              value={trip.id}
              onChange={(e) => onSelectTrip(e.target.value)}
              className="px-3 py-2 bg-white/60 border border-sumi/15 text-sm"
            >
              {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        )}

        {/* 總覽卡片 */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <SummaryCard label="總支出" value={`¥${totalJpy.toLocaleString()}`} sub={`≈ NT$ ${Math.round(totalTwd).toLocaleString()}`} accent="primary" />
          <SummaryCard label="退稅金額" value={`¥${totalTax.toLocaleString()}`} sub={`${taxFree.length} 筆 · 滿 ¥5,000 可退`} />
          <SummaryCard label="即時匯率" value={rate.toFixed(4)} sub="JPY → TWD" />
        </div>

        {/* 分頁 */}
        <div className="flex gap-1 mb-4 border-b border-sumi/15">
          <TabBtn active={tab === 'expenses'} onClick={() => setTab('expenses')} icon={<Receipt size={13} />}>花費</TabBtn>
          <TabBtn active={tab === 'tax'} onClick={() => setTab('tax')} icon={<TrendingUp size={13} />}>退稅</TabBtn>
          <TabBtn active={tab === 'settle'} onClick={() => setTab('settle')} icon={<Users size={13} />}>分帳結算</TabBtn>
        </div>

        {/* 內容 */}
        {tab === 'expenses' && (
          <ExpensesTab
            expenses={expenses}
            byCategory={byCategory}
            byDay={byDay}
            rate={rate}
            onAdd={() => setEditingExp({})}
            onEdit={(e) => setEditingExp(e)}
            onDelete={async (e) => {
              await deleteExpense(e.id, trip.id)
              showToast('已刪除', 'success')
              loadAll()
            }}
          />
        )}

        {tab === 'tax' && (
          <TaxTab
            items={taxFree}
            rate={rate}
            onAdd={() => setEditingTax({})}
            onEdit={(t) => setEditingTax(t)}
            onDelete={async (t) => {
              await deleteTaxFree(t.id, trip.id)
              showToast('已刪除', 'success')
              loadAll()
            }}
          />
        )}

        {tab === 'settle' && <SettleTab settlement={settlement} rate={rate} expenses={expenses} />}
      </div>

      <ExpenseEditModal
        open={editingExp !== null}
        item={editingExp}
        onClose={() => setEditingExp(null)}
        onSave={async (form) => {
          await saveExpense({ ...editingExp, ...form }, trip.id)
          setEditingExp(null)
          showToast('已儲存', 'success')
          loadAll()
        }}
      />

      <TaxEditModal
        open={editingTax !== null}
        item={editingTax}
        onClose={() => setEditingTax(null)}
        onSave={async (form) => {
          await saveTaxFree({ ...editingTax, ...form }, trip.id)
          setEditingTax(null)
          showToast('已儲存', 'success')
          loadAll()
        }}
      />
    </div>
  )
}

function SummaryCard({ label, value, sub, accent }) {
  return (
    <div className={`p-3 ${accent === 'primary' ? 'bg-sumi text-kinari' : 'bg-white/60 border border-sumi/10'}`}>
      <div className={`text-[10px] tracking-wider uppercase ${accent === 'primary' ? 'opacity-70' : 'text-usuzumi'}`}>{label}</div>
      <div className="font-display font-bold text-base mt-0.5">{value}</div>
      <div className={`text-[10px] mt-0.5 ${accent === 'primary' ? 'opacity-60' : 'text-usuzumi'}`}>{sub}</div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm flex items-center gap-1.5 border-b-2 transition-colors ${
        active ? 'border-shu text-shu' : 'border-transparent text-usuzumi hover:text-sumi'
      }`}
    >
      {icon} {children}
    </button>
  )
}

function ExpensesTab({ expenses, byCategory, byDay, rate, onAdd, onEdit, onDelete }) {
  return (
    <div>
      {/* 分類統計 */}
      {byCategory.length > 0 && (
        <div className="mb-5 bg-white/40 p-4 border border-sumi/10">
          <h4 className="text-[11px] tracking-widest uppercase text-usuzumi mb-3">分類占比</h4>
          <div className="space-y-2">
            {byCategory.map(c => {
              const total = byCategory.reduce((s, x) => s + x.amount, 0)
              const pct = total > 0 ? (c.amount / total * 100) : 0
              return (
                <div key={c.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{c.emoji} {c.name}</span>
                    <span className="font-mono">¥{c.amount.toLocaleString()} <span className="text-usuzumi">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-1 bg-sumi/5">
                    <div className="h-full" style={{ width: `${pct}%`, background: c.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <h4 className="font-display font-bold text-sm">支出紀錄</h4>
        <Button variant="shu" size="sm" onClick={onAdd}><Plus size={14} /> 新增</Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState icon="¥" title="尚無紀錄" />
      ) : (
        <div className="space-y-1.5">
          {expenses.map(exp => {
            const cat = EXPENSE_CATEGORIES.find(c => c.id === exp.category)
            return (
              <div
                key={exp.id}
                className="group flex items-center gap-3 bg-white/50 hover:bg-white/80 border border-sumi/10 p-3 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: cat?.color + '20', color: cat?.color }}
                >
                  {cat?.emoji}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(exp)}>
                  <div className="text-sm truncate">{exp.description || cat?.name}</div>
                  <div className="text-[11px] text-usuzumi">
                    {exp.date && dayjs(exp.date).format('M/D')}
                    {exp.paid_by && ` · 付款人：${exp.paid_by}`}
                    {exp.split_among?.length > 0 && ` · ${exp.split_among.length} 人均分`}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display font-bold text-sm">¥{parseFloat(exp.amount_jpy).toLocaleString()}</div>
                  <div className="text-[10px] text-usuzumi font-mono">NT$ {Math.round(exp.amount_jpy * rate).toLocaleString()}</div>
                </div>
                <button onClick={() => onDelete(exp)} className="opacity-0 group-hover:opacity-100 text-shu p-1">
                  <Trash2 size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TaxTab({ items, rate, onAdd, onEdit, onDelete }) {
  const total = items.reduce((s, t) => s + parseFloat(t.amount_jpy || 0), 0)
  const eligible = total >= 5000

  return (
    <div>
      <div className={`mb-4 p-4 ${eligible ? 'bg-[#7a8a5a]/10 border-[#7a8a5a]' : 'bg-shu/5 border-shu/30'} border`}>
        <div className="flex items-baseline justify-between">
          <span className="text-xs tracking-wider uppercase text-usuzumi">免稅累計</span>
          <span className="font-display font-bold text-xl">¥{total.toLocaleString()}</span>
        </div>
        <div className="text-[11px] text-usuzumi mt-1">
          {eligible
            ? `✓ 已達 ¥5,000 退稅門檻（消耗品）`
            : `差 ¥${(5000 - total).toLocaleString()} 達退稅門檻`}
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h4 className="font-display font-bold text-sm">退稅商品</h4>
        <Button variant="shu" size="sm" onClick={onAdd}><Plus size={14} /> 新增</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="🎫" title="尚無退稅紀錄" />
      ) : (
        <div className="space-y-1.5">
          {items.map(item => (
            <div key={item.id} className="group flex items-center gap-3 bg-white/50 hover:bg-white/80 border border-sumi/10 p-3">
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(item)}>
                <div className="text-sm">{item.store_name || '未命名店家'}</div>
                <div className="text-[11px] text-usuzumi">{item.date && dayjs(item.date).format('M/D')} · {item.notes || '消耗品'}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-sm">¥{parseFloat(item.amount_jpy).toLocaleString()}</div>
              </div>
              <button onClick={() => onDelete(item)} className="opacity-0 group-hover:opacity-100 text-shu p-1">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SettleTab({ settlement, rate, expenses }) {
  const { perPerson, transfers, allMembers } = settlement
  if (allMembers.length === 0) {
    return <EmptyState icon="👥" title="尚無分帳資料" desc="請在花費紀錄中填入「付款人」與「分擔成員」" />
  }

  return (
    <div>
      <div className="bg-white/40 border border-sumi/10 p-4 mb-4">
        <h4 className="text-[11px] tracking-widest uppercase text-usuzumi mb-3">每人應付/應收</h4>
        <div className="space-y-2">
          {Object.entries(perPerson).sort((a, b) => b[1] - a[1]).map(([name, balance]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span>{name}</span>
              <span className={`font-mono font-bold ${balance > 0 ? 'text-[#7a8a5a]' : balance < 0 ? 'text-shu' : 'text-usuzumi'}`}>
                {balance > 0 ? '應收 ' : balance < 0 ? '應付 ' : ''}¥{Math.abs(Math.round(balance)).toLocaleString()}
                <span className="text-usuzumi ml-1">({balance > 0 ? '+' : ''}NT$ {Math.round(balance * rate).toLocaleString()})</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <h4 className="font-display font-bold text-sm mb-3">最少轉帳建議</h4>
      {transfers.length === 0 ? (
        <div className="bg-[#7a8a5a]/10 border border-[#7a8a5a]/30 p-4 text-sm text-center">
          ✓ 帳目已平，無需轉帳
        </div>
      ) : (
        <div className="space-y-2">
          {transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/60 border border-sumi/10 p-3">
              <span className="font-display font-bold">{t.from}</span>
              <span className="text-shu">→</span>
              <span className="font-display font-bold">{t.to}</span>
              <span className="ml-auto font-mono font-bold text-sm">
                ¥{Math.round(t.amount).toLocaleString()}
                <span className="text-[10px] text-usuzumi ml-1">(NT$ {Math.round(t.amount * rate).toLocaleString()})</span>
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="text-[11px] text-usuzumi mt-4 leading-relaxed">
        ※ 演算法以「最少轉帳次數」原則計算。<br />
        ※ 僅統計有填入「付款人」與「分擔成員」的花費。
      </div>
    </div>
  )
}

function ExpenseEditModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState({})
  const [splitMembersStr, setSplitMembersStr] = useState('')

  useEffect(() => {
    if (item) {
      setForm({
        date: item.date || dayjs().format('YYYY-MM-DD'),
        category: item.category || 'food',
        amount_jpy: item.amount_jpy || '',
        description: item.description || '',
        paid_by: item.paid_by || '',
      })
      setSplitMembersStr((item.split_among || []).join(', '))
    }
  }, [item])

  const handleSubmit = () => {
    const split = splitMembersStr.split(/[,，、\s]+/).map(s => s.trim()).filter(Boolean)
    onSave({
      ...form,
      amount_jpy: parseFloat(form.amount_jpy) || 0,
      split_among: split,
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={item?.id ? '編輯花費' : '新增花費'}>
      <div className="px-5 py-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Input label="日期" type="date" value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select
            label="分類"
            value={form.category || 'food'}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={EXPENSE_CATEGORIES.map(c => ({ value: c.id, label: `${c.emoji} ${c.name}` }))}
          />
        </div>
        <Input label="金額（日幣 ¥）" type="number" inputMode="decimal"
          placeholder="例：1500" value={form.amount_jpy || ''}
          onChange={(e) => setForm({ ...form, amount_jpy: e.target.value })} />
        <Input label="說明" placeholder="例：一蘭拉麵 + 啤酒"
          value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div className="border-t border-sumi/10 pt-3 mt-3">
          <div className="text-[11px] text-usuzumi mb-2 tracking-wider uppercase">分帳設定（可空白）</div>
          <Input label="付款人（誰先墊的？）" placeholder="例：哈利"
            value={form.paid_by || ''} onChange={(e) => setForm({ ...form, paid_by: e.target.value })} />
          <Input label="分擔成員（用逗號或頓號分隔）" placeholder="例：哈利, 太郎, 花子"
            value={splitMembersStr} onChange={(e) => setSplitMembersStr(e.target.value)} className="mt-2" />
          <p className="text-[10px] text-usuzumi mt-1">空白＝個人花費（不分帳）</p>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={handleSubmit}>儲存</Button>
        </div>
      </div>
    </Modal>
  )
}

function TaxEditModal({ open, item, onClose, onSave }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (item) setForm({
      date: item.date || dayjs().format('YYYY-MM-DD'),
      store_name: item.store_name || '',
      amount_jpy: item.amount_jpy || '',
      notes: item.notes || '',
    })
  }, [item])

  return (
    <Modal open={open} onClose={onClose} title={item?.id ? '編輯退稅' : '新增退稅紀錄'}>
      <div className="px-5 py-4 space-y-3">
        <Input label="日期" type="date" value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input label="店家" placeholder="例：Don Quijote 新宿東口店"
          value={form.store_name || ''} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
        <Input label="金額（含稅，日幣 ¥）" type="number" inputMode="decimal"
          value={form.amount_jpy || ''} onChange={(e) => setForm({ ...form, amount_jpy: e.target.value })} />
        <Input label="備註（消耗品 / 一般物品）"
          value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="shu" onClick={() => onSave({ ...form, amount_jpy: parseFloat(form.amount_jpy) || 0 })}>儲存</Button>
        </div>
      </div>
    </Modal>
  )
}

// ===== 分帳結算演算法（最少轉帳次數）=====
function calculateSettlement(expenses) {
  const balances = {} // { name: number }，正=該收回，負=要付出
  const allMembersSet = new Set()

  expenses.forEach(exp => {
    const amount = parseFloat(exp.amount_jpy) || 0
    const paidBy = exp.paid_by?.trim()
    const splitAmong = (exp.split_among || []).map(s => s.trim()).filter(Boolean)
    if (!paidBy || splitAmong.length === 0 || amount === 0) return

    allMembersSet.add(paidBy)
    splitAmong.forEach(m => allMembersSet.add(m))

    // 付款人多收 amount
    balances[paidBy] = (balances[paidBy] || 0) + amount

    // 每人應分擔
    const share = amount / splitAmong.length
    splitAmong.forEach(m => {
      balances[m] = (balances[m] || 0) - share
    })
  })

  const allMembers = Array.from(allMembersSet)

  // 計算最少轉帳：用兩端逼近法
  const debtors = [] // { name, amount } 應付（balance < 0）
  const creditors = [] // { name, amount } 應收（balance > 0）
  Object.entries(balances).forEach(([name, b]) => {
    if (b < -0.01) debtors.push({ name, amount: -b })
    else if (b > 0.01) creditors.push({ name, amount: b })
  })
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  const transfers = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount)
    transfers.push({ from: debtors[i].name, to: creditors[j].name, amount: pay })
    debtors[i].amount -= pay
    creditors[j].amount -= pay
    if (debtors[i].amount < 0.01) i++
    if (creditors[j].amount < 0.01) j++
  }

  return { perPerson: balances, transfers, allMembers }
}
