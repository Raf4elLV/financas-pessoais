import { useState } from 'react'
import { Plus, Trash2, Tag, Lock } from 'lucide-react'
import Card from '../UI/Card'
import EmptyState from '../UI/EmptyState'

const TYPE_LABELS = {
  income:           { label: 'Receita',          color: 'text-positive dark:text-positive-dark bg-positive-light dark:bg-positive-darkbg' },
  fixed_expense:    { label: 'Despesa Fixa',      color: 'text-earth-600 dark:text-earth-300 bg-earth-100 dark:bg-earth-700' },
  variable_expense: { label: 'Despesa Variável',  color: 'text-negative dark:text-negative-dark bg-negative-light dark:bg-negative-darkbg' },
}

const TYPE_OPTIONS = [
  { value: 'income',           label: 'Receita' },
  { value: 'fixed_expense',    label: 'Despesa Fixa' },
  { value: 'variable_expense', label: 'Despesa Variável' },
]

export default function CategoryManager({ categoriesState }) {
  const { categories, addCategory, removeCategory } = categoriesState
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('variable_expense')
  const [filterType, setFilterType] = useState('all')
  const [error, setError] = useState('')

  const filtered = filterType === 'all' ? categories : categories.filter(c => c.type === filterType)

  function handleAdd(e) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    const exists = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.type === newType)
    if (exists) { setError('Categoria já existe para esse tipo.'); return }
    addCategory({ name: trimmed, type: newType })
    setNewName('')
    setError('')
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">Categorias</h1>
        <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">{categories.length} categorias cadastradas</p>
      </div>

      {/* Formulário de nova categoria */}
      <Card>
        <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-4">Nova Categoria</p>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <input
              className="w-full px-3 py-2 text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-earth-50 dark:bg-earth-700 text-earth-800 dark:text-earth-100 placeholder-earth-400 focus:outline-none focus:border-earth-400 transition-colors"
              placeholder="Nome da categoria"
              value={newName}
              onChange={e => { setNewName(e.target.value); setError('') }}
              required
            />
            {error && <p className="text-xs text-negative mt-1">{error}</p>}
          </div>
          <select
            className="px-3 py-2 text-sm rounded-xl border border-earth-200 dark:border-earth-600 bg-earth-50 dark:bg-earth-700 text-earth-800 dark:text-earth-100 focus:outline-none focus:border-earth-400 transition-colors"
            value={newType}
            onChange={e => setNewType(e.target.value)}
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-earth-500 hover:bg-earth-600 text-white text-sm font-medium rounded-xl transition-colors shrink-0"
          >
            <Plus size={14} />
            Adicionar
          </button>
        </form>
      </Card>

      {/* Filtro */}
      <div className="flex rounded-xl border border-earth-200 dark:border-earth-700 overflow-hidden bg-earth-50 dark:bg-earth-800 w-fit">
        {[{ value: 'all', label: 'Todas' }, ...TYPE_OPTIONS].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-2 text-xs font-medium transition-colors
              ${filterType === f.value
                ? 'bg-earth-500 text-white'
                : 'text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-200'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <EmptyState icon={Tag} title="Nenhuma categoria" description="Adicione categorias usando o formulário acima" />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-earth-100 dark:divide-earth-700">
            {filtered.map(cat => {
              const config = TYPE_LABELS[cat.type]
              return (
                <div key={cat.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-earth-50 dark:hover:bg-earth-700/50 transition-colors">
                  <Tag size={14} className="text-earth-400 dark:text-earth-500 shrink-0" />
                  <span className="flex-1 text-sm text-earth-700 dark:text-earth-300">{cat.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}>
                    {config.label}
                  </span>
                  {cat.isDefault ? (
                    <Lock size={13} className="text-earth-300 dark:text-earth-600 shrink-0" title="Categoria padrão" />
                  ) : (
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="p-1.5 rounded-lg text-earth-300 dark:text-earth-600 hover:text-negative dark:hover:text-negative-dark hover:bg-earth-100 dark:hover:bg-earth-700 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
