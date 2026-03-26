import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import { useSidebar } from './hooks/useSidebar'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useInvestmentGoals } from './hooks/useInvestmentGoals'
import { useBesteiras } from './hooks/useBesteiras'
import { usePaymentStatus } from './hooks/usePaymentStatus'
import Layout from './components/Layout/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import TransactionList from './components/Transactions/TransactionList'
import CategoryManager from './components/Categories/CategoryManager'
import GoalManager from './components/Goals/GoalManager'
import ProfilePage from './components/Profile/ProfilePage'
import LoginScreen from './components/Auth/LoginScreen'
import RegisterScreen from './components/Auth/RegisterScreen'

function AppShell({ currentUser, logout, updateProfile, changePassword }) {
  const { theme, toggleTheme } = useTheme(currentUser.id)
  const { isOpen: sidebarOpen, toggle: toggleSidebar, close: closeSidebar } = useSidebar()
  const [activePage, setActivePage] = useState('dashboard')

  const transactionsState = useTransactions(currentUser.id)
  const categoriesState   = useCategories(currentUser.id)
  const goalsState        = useInvestmentGoals(currentUser.id)
  const besteirasState    = useBesteiras(currentUser.id)
  const paymentStatus     = usePaymentStatus(currentUser.id)

  const shared = { transactionsState, categoriesState, goalsState, besteirasState, paymentStatus }

  return (
    <Layout
      theme={theme}
      toggleTheme={toggleTheme}
      activePage={activePage}
      setActivePage={setActivePage}
      currentUser={currentUser}
      logout={logout}
      sidebarOpen={sidebarOpen}
      onToggleSidebar={toggleSidebar}
      onCloseSidebar={closeSidebar}
      onOpenProfile={() => setActivePage('profile')}
    >
      {activePage === 'dashboard'    && <Dashboard    {...shared} setActivePage={setActivePage} currentUser={currentUser} toggleTheme={toggleTheme} />}
      {activePage === 'transactions' && <TransactionList {...shared} />}
      {activePage === 'categories'   && <CategoryManager {...shared} />}
      {activePage === 'goals'        && <GoalManager   {...shared} />}
      {activePage === 'profile'      && (
        <ProfilePage
          currentUser={currentUser}
          onUpdateProfile={updateProfile}
          onChangePassword={changePassword}
          onBack={() => setActivePage('dashboard')}
        />
      )}
    </Layout>
  )
}

export default function App() {
  const { currentUser, register, login, logout, updateProfile, changePassword } = useAuth()
  const [authScreen, setAuthScreen] = useState('login')

  if (!currentUser) {
    return authScreen === 'login'
      ? <LoginScreen    onLogin={login}       onGoToRegister={() => setAuthScreen('register')} />
      : <RegisterScreen onRegister={register} onGoToLogin={() => setAuthScreen('login')} />
  }

  return (
    <AppShell
      currentUser={currentUser}
      logout={logout}
      updateProfile={updateProfile}
      changePassword={changePassword}
    />
  )
}
