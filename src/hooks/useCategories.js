import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_CATEGORIES } from '../data/defaultCategories'

function fromRow(row) {
  return {
    id:        row.id,
    name:      row.name,
    type:      row.type,
    isDefault: row.is_default,
  }
}

export function useCategories(userId) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!userId) return

    supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(async ({ data }) => {
        if (data && data.length > 0) {
          setCategories(data.map(fromRow))
        } else {
          // Seed default categories for new user
          const rows = DEFAULT_CATEGORIES.map(c => ({
            id:         c.id,
            user_id:    userId,
            name:       c.name,
            type:       c.type,
            is_default: c.isDefault,
          }))
          await supabase.from('categories').insert(rows)
          setCategories(DEFAULT_CATEGORIES)
        }
      })
  }, [userId])

  const addCategory = useCallback(async (category) => {
    const newCat = {
      id:        crypto.randomUUID(),
      isDefault: false,
      ...category,
    }
    setCategories(prev => [...prev, newCat])
    const { error } = await supabase.from('categories').insert({
      id:         newCat.id,
      user_id:    userId,
      name:       newCat.name,
      type:       newCat.type,
      is_default: false,
    })
    if (error) {
      console.error('Erro ao salvar categoria:', error)
      setCategories(prev => prev.filter(c => c.id !== newCat.id))
    }
    return newCat
  }, [userId])

  const removeCategory = useCallback(async (id) => {
    setCategories(prev => prev.filter(c => c.id !== id))
    const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', userId)
    if (error) console.error('Erro ao remover categoria:', error)
  }, [userId])

  const getCategoriesByType = useCallback((type) =>
    categories.filter(c => c.type === type)
  , [categories])

  const getCategoryById = useCallback((id) =>
    categories.find(c => c.id === id)
  , [categories])

  return { categories, addCategory, removeCategory, getCategoriesByType, getCategoryById }
}
