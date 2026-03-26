import { useState, useRef } from 'react'
import { Wallet, Camera, X, Sun, Moon } from 'lucide-react'
import AvatarDisplay from './AvatarDisplay'
import PhoneInput from '../UI/PhoneInput'
import PasswordInput from '../UI/PasswordInput'
import PasswordRequirements from '../UI/PasswordRequirements'
import ImageCropModal from '../UI/ImageCropModal'
import EmailVerificationScreen from './EmailVerificationScreen'
import { INPUT_CLASS, LABEL_CLASS } from '../../utils/ui'

export default function RegisterScreen({ onRegister, onGoToLogin }) {
  const [form, setForm]               = useState({ name: '', email: '', phone: '', password: '' })
  const [avatarBase64, setAvatarBase64] = useState(null)
  const [cropSrc, setCropSrc]         = useState(null)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [verifyEmail, setVerifyEmail] = useState(null) // email to verify
  const fileRef = useRef()

  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  function toggleTheme() {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', next === 'dark')
      return next
    })
  }

  function set(field, value) { setForm(p => ({ ...p, [field]: value })) }

  function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropSrc(URL.createObjectURL(file))
  }

  function handleCropConfirm(base64) { setAvatarBase64(base64) }

  function handleCropClose() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    const result = await onRegister({ ...form, avatarBase64 })
    setLoading(false)
    if (!result.ok) { setError(result.error); return }
    setVerifyEmail(form.email)
  }

  if (verifyEmail) {
    return <EmailVerificationScreen email={verifyEmail} onGoToLogin={onGoToLogin} />
  }

  const previewUser = { id: 'preview', name: form.name || 'Novo', avatar: avatarBase64 }

  return (
    <div className="min-h-screen relative bg-earth-50 dark:bg-earth-900 flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg text-earth-500 hover:text-earth-700 dark:text-earth-400 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
        title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-earth-500 flex items-center justify-center mb-3">
            <Wallet size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100 tracking-tight">Criar conta</h1>
          <p className="text-sm text-earth-400 dark:text-earth-500 mt-1">Preencha seus dados para começar</p>
        </div>

        <div className="bg-white dark:bg-earth-800 rounded-2xl border border-earth-200 dark:border-earth-700 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3 pb-1">
              <div className="relative">
                <AvatarDisplay user={previewUser} size={72} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-earth-500 hover:bg-earth-600 text-white flex items-center justify-center transition-colors"
                >
                  <Camera size={11} />
                </button>
              </div>
              {avatarBase64 && (
                <button
                  type="button"
                  onClick={() => setAvatarBase64(null)}
                  className="flex items-center gap-1 text-xs text-earth-400 hover:text-negative transition-colors"
                >
                  <X size={11} /> Remover foto
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
            </div>

            {/* Nome */}
            <div>
              <label className={LABEL_CLASS}>Nome completo</label>
              <input
                className={INPUT_CLASS}
                name="name"
                autoComplete="name"
                placeholder="Maria Silva"
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Email + Telefone */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={LABEL_CLASS}>E-mail</label>
                <input
                  className={INPUT_CLASS}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className={LABEL_CLASS}>Telefone (opcional)</label>
                <PhoneInput value={form.phone} onChange={v => set('phone', v)} />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className={LABEL_CLASS}>Senha</label>
              <PasswordInput
                name="new-password"
                autoComplete="new-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <PasswordRequirements value={form.password} />
            </div>

            {error && (
              <p className="text-xs text-negative dark:text-negative-dark bg-negative-light dark:bg-negative-darkbg px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || form.password.length < 6}
              className="w-full py-2.5 text-sm font-medium text-white bg-earth-500 hover:bg-earth-600 disabled:opacity-60 rounded-xl transition-colors"
            >
              {loading ? 'Criando...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-xs text-earth-400 dark:text-earth-500 mt-5">
            Já tem conta?{' '}
            <button onClick={onGoToLogin} className="text-earth-600 dark:text-earth-300 font-medium hover:underline">
              Entrar
            </button>
          </p>
        </div>
      </div>

      <ImageCropModal
        isOpen={!!cropSrc}
        imageSrc={cropSrc}
        onClose={handleCropClose}
        onConfirm={handleCropConfirm}
      />
    </div>
  )
}
