import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Camera, X, User, Lock, CheckCircle } from 'lucide-react'
import Card from '../UI/Card'
import AvatarDisplay from '../Auth/AvatarDisplay'
import PhoneInput from '../UI/PhoneInput'
import PasswordInput from '../UI/PasswordInput'
import PasswordRequirements from '../UI/PasswordRequirements'
import ImageCropModal from '../UI/ImageCropModal'
import { INPUT_CLASS, LABEL_CLASS, BTN_PRIMARY } from '../../utils/ui'

function SuccessBanner({ message }) {
  if (!message) return null
  return (
    <div className="flex items-center gap-2 text-xs text-positive dark:text-positive-dark bg-positive-light dark:bg-positive-darkbg px-3 py-2 rounded-lg">
      <CheckCircle size={13} />
      {message}
    </div>
  )
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <p className="text-xs text-negative dark:text-negative-dark bg-negative-light dark:bg-negative-darkbg px-3 py-2 rounded-lg">
      {message}
    </p>
  )
}

function PersonalInfoSection({ currentUser, onUpdateProfile }) {
  const [form, setForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
  })
  const [avatar, setAvatar]   = useState(currentUser.avatar || null)
  const [cropSrc, setCropSrc] = useState(null)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    setForm({ name: currentUser.name, email: currentUser.email, phone: currentUser.phone || '' })
    setAvatar(currentUser.avatar || null)
  }, [currentUser])

  function handleAvatarFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropSrc(URL.createObjectURL(file))
  }

  function handleCropConfirm(base64) { setAvatar(base64) }

  function handleCropClose() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    const result = onUpdateProfile({ name: form.name, email: form.email, phone: form.phone, avatar })
    if (!result.ok) { setError(result.error); return }
    setSuccess('Perfil atualizado com sucesso.')
  }

  const previewUser = { ...currentUser, name: form.name, avatar }

  return (
    <>
      <Card>
        <div className="flex items-center gap-2 mb-5">
          <User size={15} className="text-earth-500 dark:text-earth-400" />
          <h2 className="text-sm font-semibold text-earth-700 dark:text-earth-300">Informações Pessoais</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="relative">
              <AvatarDisplay user={previewUser} size={80} />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-earth-500 hover:bg-earth-600 text-white flex items-center justify-center transition-colors"
              >
                <Camera size={13} />
              </button>
            </div>
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar(null)}
                className="flex items-center gap-1 text-xs text-earth-400 hover:text-negative transition-colors"
              >
                <X size={11} /> Remover foto
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          </div>

          <div>
            <label className={LABEL_CLASS}>Nome completo</label>
            <input
              className={INPUT_CLASS}
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>E-mail</label>
            <input
              className={INPUT_CLASS}
              type="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>Telefone (opcional)</label>
            <PhoneInput value={form.phone} onChange={v => setForm(p => ({ ...p, phone: v }))} />
          </div>

          <ErrorBanner message={error} />
          <SuccessBanner message={success} />

          <button type="submit" className={`${BTN_PRIMARY} w-full`}>Salvar alterações</button>
        </form>
      </Card>

      <ImageCropModal
        isOpen={!!cropSrc}
        imageSrc={cropSrc}
        onClose={handleCropClose}
        onConfirm={handleCropConfirm}
      />
    </>
  )
}

function PasswordSection({ onChangePassword }) {
  const [form, setForm]     = useState({ current: '', next: '', confirm: '' })
  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.next.length < 6)          { setError('A nova senha deve ter pelo menos 6 caracteres.'); return }
    if (form.next !== form.confirm)    { setError('As senhas não coincidem.'); return }
    const result = onChangePassword({ currentPassword: form.current, newPassword: form.next })
    if (!result.ok) { setError(result.error); return }
    setSuccess('Senha alterada com sucesso.')
    setForm({ current: '', next: '', confirm: '' })
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-5">
        <Lock size={15} className="text-earth-500 dark:text-earth-400" />
        <h2 className="text-sm font-semibold text-earth-700 dark:text-earth-300">Segurança</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={LABEL_CLASS}>Senha atual</label>
          <PasswordInput
            name="current-password"
            autoComplete="current-password"
            value={form.current}
            onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className={LABEL_CLASS}>Nova senha</label>
          <PasswordInput
            name="new-password"
            autoComplete="new-password"
            value={form.next}
            onChange={e => setForm(p => ({ ...p, next: e.target.value }))}
            placeholder="Mínimo 6 caracteres"
            required
          />
          <PasswordRequirements value={form.next} />
        </div>

        <div>
          <label className={LABEL_CLASS}>Confirmar nova senha</label>
          <PasswordInput
            name="confirm-password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            required
          />
          <PasswordRequirements showConfirm value={form.next} confirmValue={form.confirm} />
        </div>

        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <button
          type="submit"
          disabled={form.next.length < 6 || form.next !== form.confirm || !form.current}
          className={`${BTN_PRIMARY} w-full`}
        >
          Alterar senha
        </button>
      </form>
    </Card>
  )
}

export default function ProfilePage({ currentUser, onUpdateProfile, onChangePassword, onBack }) {
  return (
    <div className="space-y-5 max-w-xl mx-auto">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-800 transition-colors"
          title="Voltar"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-earth-800 dark:text-earth-100">Meu Perfil</h1>
          <p className="text-xs text-earth-400 dark:text-earth-500 mt-0.5">
            Conta criada em {new Date(currentUser.createdAt).toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <PersonalInfoSection currentUser={currentUser} onUpdateProfile={onUpdateProfile} />
      <PasswordSection onChangePassword={onChangePassword} />
    </div>
  )
}
