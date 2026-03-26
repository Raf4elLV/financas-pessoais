import Header from './Header'
import Sidebar from './Sidebar'

export default function Layout({
  theme, toggleTheme,
  activePage, setActivePage,
  currentUser, logout,
  sidebarOpen, onToggleSidebar, onCloseSidebar,
  onOpenProfile,
  children,
}) {
  function handleNavClick() {
    if (window.innerWidth < 1024) onCloseSidebar()
  }

  return (
    <div className="flex flex-col h-screen bg-earth-50 dark:bg-earth-900 text-earth-800 dark:text-earth-100">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        currentUser={currentUser}
        logout={logout}
        onMenuToggle={onToggleSidebar}
        onOpenProfile={onOpenProfile}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          isOpen={sidebarOpen}
          onClose={onCloseSidebar}
          onNavClick={handleNavClick}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
