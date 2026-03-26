import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useBesteiras(userId) {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    if (!userId) return
    supabase
      .from('user_preferences')
      .select('besteiras_config')
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (data?.besteiras_config) setConfig(data.besteiras_config)
      })
  }, [userId])

  const saveConfig = useCallback(async (newConfig) => {
    setConfig(newConfig)
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, besteiras_config: newConfig, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    if (error) console.error('Erro ao salvar configuração:', error)
  }, [userId])

  const clearConfig = useCallback(async () => {
    setConfig(null)
    await supabase
      .from('user_preferences')
      .upsert({ user_id: userId, besteiras_config: null, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  }, [userId])

  return { config, saveConfig, clearConfig }
}
