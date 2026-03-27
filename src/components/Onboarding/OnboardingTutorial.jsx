import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Sparkles, PlusCircle, Bell, Moon, Sun,
  ChevronRight, ChevronLeft, X,
} from 'lucide-react'

const STEPS = [
  {
    targetId: null,
    Icon: Sparkles,
    iconBg: 'bg-earth-100 dark:bg-earth-700',
    iconColor: 'text-earth-500 dark:text-earth-300',
    title: 'bem-vindo às suas finanças!',
    description:
      'Organize receitas, despesas, metas e lembretes — tudo de forma simples e visual. Vamos te mostrar o essencial em 4 passos.',
  },
  {
    targetId: 'btn-nova-transacao',
    Icon: PlusCircle,
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    title: 'Adicione suas transações',
    description:
      'Clique neste botão para registrar receitas, despesas fixas (aluguel, internet) ou variáveis (mercado, lazer). Você também pode criar compras parceladas aqui dentro.',
  },
  {
    targetId: 'card-lembretes',
    Icon: Bell,
    iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-500 dark:text-amber-400',
    title: 'Nunca esqueça uma conta',
    description:
      'Este card mostra seus compromissos recorrentes e avisa quando estão próximos de vencer. Confirme cada pagamento com um clique para acompanhar o saldo confirmado do mês.',
  },
  {
    targetId: 'btn-toggle-theme',
    Icon: Moon,
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    title: 'Tema claro ou escuro',
    description:
      'Alterne entre tema claro e escuro a qualquer momento. Sua preferência é salva automaticamente.',
    hasThemeDemo: true,
  },
]

const SPOTLIGHT_PAD = 10

export default function OnboardingTutorial({ userId, userName, isOnboarded, toggleTheme, onDismiss }) {
  const [visible, setVisible] = useState(!isOnboarded)
  const [step, setStep]       = useState(0)
  const [targetRect, setTargetRect] = useState(null)

  const current = STEPS[step]
  const isLast  = step === STEPS.length - 1

  // Measure target element after layout settles (double RAF = two frames after scroll)
  const updateRect = useCallback(() => {
    const id = current.targetId
    if (!id) { setTargetRect(null); return }
    const el = document.getElementById(id)
    if (!el) { setTargetRect(null); return }
    setTargetRect(el.getBoundingClientRect())
  }, [current.targetId])

  useEffect(() => {
    setTargetRect(null)
    if (!current.targetId) return

    const el = document.getElementById(current.targetId)
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' })

    // Wait two animation frames so the browser has painted after the scroll
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(updateRect) })

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [step, current.targetId, updateRect])

  if (!visible) return null

  function dismiss() {
    onDismiss(userId)
    setVisible(false)
  }

  function goTo(i) { setStep(i) }
  function next() { if (!isLast) setStep(s => s + 1); else dismiss() }
  function prev() { if (step > 0) setStep(s => s - 1) }

  // ── Tutorial card ────────────────────────────────────────────────────────
  const TutorialCard = (
    <div
      className="bg-white dark:bg-earth-800 rounded-2xl shadow-2xl border border-earth-100 dark:border-earth-700 w-full max-w-sm overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* Step dots + close */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Ir para passo ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-earth-500'
                  : i < step
                  ? 'w-1.5 bg-earth-300 dark:bg-earth-500'
                  : 'w-1.5 bg-earth-200 dark:bg-earth-600'
              }`}
            />
          ))}
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 -mr-1 rounded-xl text-earth-400 hover:text-earth-600 dark:hover:text-earth-200 hover:bg-earth-100 dark:hover:bg-earth-700 transition-colors"
          aria-label="Fechar tutorial"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex gap-4 px-5 pt-4 pb-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${current.iconBg}`}>
          <current.Icon size={22} className={current.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-earth-800 dark:text-earth-100 mb-1.5 leading-snug capitalize">
            {step === 0 ? `${userName}, ` : ''}{current.title}
          </h3>
          <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed">
            {current.description}
          </p>
          {current.hasThemeDemo && (
            <button
              onClick={toggleTheme}
              className="mt-3 flex items-center gap-1.5 text-xs font-medium text-earth-500 dark:text-earth-400 border border-earth-200 dark:border-earth-600 hover:border-earth-400 dark:hover:border-earth-400 hover:text-earth-700 dark:hover:text-earth-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Sun size={12} />
              Testar tema agora
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-t border-earth-100 dark:border-earth-700">
        <div className="flex-1">
          {step === 0 ? (
            <button
              onClick={dismiss}
              className="text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
            >
              Pular tutorial
            </button>
          ) : (
            <button
              onClick={prev}
              className="flex items-center gap-1 text-xs text-earth-400 dark:text-earth-500 hover:text-earth-600 dark:hover:text-earth-300 transition-colors"
            >
              <ChevronLeft size={13} /> Anterior
            </button>
          )}
        </div>
        <button
          onClick={next}
          className="flex items-center gap-1.5 px-4 py-2 bg-earth-500 hover:bg-earth-600 active:bg-earth-700 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          {isLast ? 'Começar!' : 'Próximo'}
          {!isLast && <ChevronRight size={13} />}
        </button>
      </div>
    </div>
  )

  // Render via portal directly into <body> so no ancestor CSS affects fixed positioning
  return createPortal(
    <>
      {/* ── Backdrop ───────────────────────────────────────────────────── */}
      {targetRect ? (
        <svg
          style={{
            position: 'fixed', inset: 0,
            width: '100vw', height: '100vh',
            zIndex: 40, pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <defs>
            <mask id="onb-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - SPOTLIGHT_PAD}
                y={targetRect.top  - SPOTLIGHT_PAD}
                width={targetRect.width  + SPOTLIGHT_PAD * 2}
                height={targetRect.height + SPOTLIGHT_PAD * 2}
                rx="14"
                fill="black"
              />
            </mask>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.64)" mask="url(#onb-mask)" />
        </svg>
      ) : (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          className="bg-black/60 backdrop-blur-sm"
          onClick={dismiss}
        />
      )}

      {/* ── Spotlight ring ─────────────────────────────────────────────── */}
      {targetRect && (
        <div
          style={{
            position: 'fixed',
            top:    targetRect.top    - SPOTLIGHT_PAD,
            left:   targetRect.left   - SPOTLIGHT_PAD,
            width:  targetRect.width  + SPOTLIGHT_PAD * 2,
            height: targetRect.height + SPOTLIGHT_PAD * 2,
            zIndex: 40,
            borderRadius: 14,
            pointerEvents: 'none',
            boxShadow: '0 0 0 2.5px #A89078, 0 0 0 5px rgba(168,144,120,0.25)',
          }}
        />
      )}

      {/* ── Tutorial card ──────────────────────────────────────────────── */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 50, pointerEvents: 'none' }}
        className="flex items-center justify-center p-4"
      >
        <div style={{ pointerEvents: 'auto' }} className="w-full max-w-sm">
          {TutorialCard}
        </div>
      </div>
    </>,
    document.body
  )
}
