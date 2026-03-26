import { LayoutDashboard, ArrowLeftRight, Tag, Target, X } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'transactions', label: 'Transações',  icon: ArrowLeftRight },
  { id: 'categories',   label: 'Categorias',  icon: Tag },
  { id: 'goals',        label: 'Metas',       icon: Target },
]

export default function Sidebar({ activePage, setActivePage, isOpen, onClose, onNavClick }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-40',
          'lg:relative lg:inset-auto lg:z-auto',
          'flex flex-col',
          'border-r border-earth-200 dark:border-earth-700 bg-earth-50 dark:bg-earth-900',
          'transition-all duration-200 ease-in-out overflow-hidden',
          isOpen
            ? 'w-64 lg:w-52 translate-x-0'
            : 'w-64 lg:w-14 -translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-earth-200 dark:border-earth-700 shrink-0">
          <span className="text-sm font-semibold text-earth-800 dark:text-earth-100">Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <nav className={['flex flex-col gap-0.5 py-4', isOpen ? 'px-3' : 'lg:px-2 px-3'].join(' ')}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activePage === id
            return (
              <button
                key={id}
                onClick={() => { setActivePage(id); onNavClick?.() }}
                title={!isOpen ? label : undefined}
                className={[
                  'flex items-center rounded-xl text-sm font-medium transition-colors w-full',
                  isOpen ? 'gap-3 px-3 py-2.5' : 'px-3 py-2.5 lg:justify-center lg:px-0',
                  active
                    ? 'bg-earth-500 text-white'
                    : 'text-earth-600 dark:text-earth-400 hover:bg-earth-200 dark:hover:bg-earth-800 hover:text-earth-800 dark:hover:text-earth-200',
                ].join(' ')}
              >
                <Icon size={16} className="shrink-0" />
                <span className={isOpen ? '' : 'lg:hidden'}>{label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
