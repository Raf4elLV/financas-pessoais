import { useState, useCallback } from 'react'
import { loadCategories, saveCategories } from '../utils/storage'
import { DEFAULT_CATEGORIES } from '../data/defaultCategories'

export function useCategories(userId) {
  const [categories, setCategories] = useState(() => {
    const stored = loadCategories(userId)
    if (stored !== null) {
      if (!stored.find(c => c.id === 'cat-cartao')) {
        const migrated = [
          ...stored,
          { id: 'cat-cartao', name: 'Cartão de Crédito', type: 'variable_expense', isDefault: true },
        ]
        saveCategories(userId, migrated)
        return migrated
      }
      return stored
    }
    saveCategories(userId, DEFAULT_CATEGORIES)
    return DEFAULT_CATEGORIES
  })

  const addCategory = useCallback((category) => {
    const newCat = {
      id: crypto.randomUUID(),
      isDefault: false,
      ...category,
    }
    setCategories(prev => {
      const next = [...prev, newCat]
      saveCategories(userId, next)
      return next
    })
    return newCat
  }, [userId])

  const removeCategory = useCallback((id) => {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id)
      saveCategories(userId, next)
      return next
    })
  }, [userId])

  const getCategoriesByType = useCallback((type) => {
    return categories.filter(c => c.type === type)
  }, [categories])

  const getCategoryById = useCallback((id) => {
    return categories.find(c => c.id === id)
  }, [categories])

  return { categories, addCategory, removeCategory, getCategoriesByType, getCategoryById }
}
