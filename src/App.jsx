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
import ForgotPasswordScreen from './components/Auth/ForgotPasswordScreen'
import ResetPasswordScreen from './components/Auth/ResetPasswordScreen'

// ── Clear legacy localStorage data (one-time migration) ───────────────────
;(function clearLegacyStorage() {
  if (localStorage.getItem('fin_migrated_v1')) return
  const LEGACY_KEYS = ['fin_users', 'fin_session']
  LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
  // Clear per-user keys (pattern: fin_*_<uuid>), preserving active settings
  Object.keys(localStorage)
    .filter(k => k.startsWith('fin_') && !k.startsWith('fin_onboarded_') && !k.startsWith('fin_settings_'))
    .forEach(k => localStorage.removeItem(k))
  localStorage.setItem('fin_migrated_v1', '1')
})()

// ── Loading spinner ────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div className="min-h-screen bg-earth-50 dark:bg-earth-900 flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-earth-200 dark:border-earth-700 border-t-earth-500 animate-spin" />
    </div>
  )
}

// ── Authenticated shell ────────────────────────────────────────────────────
function AppShell({ currentUser, logout, updateProfile, changePassword, markOnboarded }) {
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
      {activePage === 'dashboard'    && <Dashboard    {...shared} setActivePage={setActivePage} currentUser={currentUser} toggleTheme={toggleTheme} onMarkOnboarded={markOnboarded} />}
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

// ── Root ───────────────────────────────────────────────────────────────────
export default function App() {
  const {
    currentUser,
    authLoading,
    authEvent,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    markOnboarded,
  } = useAuth()

  const [authScreen, setAuthScreen] = useState('login') // 'login' | 'register' | 'forgot'

  if (authLoading) return <Spinner />

  // Password recovery flow (triggered by email link)
  if (authEvent === 'PASSWORD_RECOVERY') {
    return <ResetPasswordScreen onResetPassword={resetPassword} />
  }

  if (currentUser) {
    return (
      <AppShell
        currentUser={currentUser}
        logout={logout}
        updateProfile={updateProfile}
        changePassword={changePassword}
        markOnboarded={markOnboarded}
      />
    )
  }

  if (authScreen === 'register') {
    return <RegisterScreen onRegister={register} onGoToLogin={() => setAuthScreen('login')} />
  }
  if (authScreen === 'forgot') {
    return <ForgotPasswordScreen onForgotPassword={forgotPassword} onGoToLogin={() => setAuthScreen('login')} />
  }
  return (
    <LoginScreen
      onLogin={login}
      onGoToRegister={() => setAuthScreen('register')}
      onGoToForgotPassword={() => setAuthScreen('forgot')}
    />
  )
}
