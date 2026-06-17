import { useState, useEffect, useCallback } from 'react'
import { balanceApi, type BalanceInfo } from '@/lib/api'

const EMPTY: BalanceInfo = { amount: 0, transactions: [] }

export function useBalance(authed: boolean) {
  const [info, setInfo]       = useState<BalanceInfo>(EMPTY)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!authed) { setInfo(EMPTY); return }
    setLoading(true)
    balanceApi.me()
      .then(setInfo)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [authed])

  useEffect(() => { refresh() }, [refresh])

  const topup = async (amount: number) => {
    const res = await balanceApi.topup(amount, 'Пополнение баланса')
    setInfo(prev => ({ ...prev, amount: res.amount }))
    refresh()
    return res
  }

  const spend = async (amount: number, reason: string) => {
    const res = await balanceApi.spend(amount, reason)
    setInfo(prev => ({ ...prev, amount: res.amount }))
    return res
  }

  return { amount: info.amount, transactions: info.transactions, loading, refresh, topup, spend }
}
