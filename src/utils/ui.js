/**
 * Classes CSS reutilizáveis para inputs, labels e botões.
 * Centraliza o estilo para evitar repetição e facilitar manutenção.
 */

// text-base (16px) no mobile evita o zoom automático do iOS Safari em inputs com font-size < 16px.
// sm:text-sm mantém a aparência compacta em telas maiores.
export const INPUT_CLASS =
  'w-full px-3 py-2 text-base sm:text-sm rounded-xl border border-earth-200 dark:border-earth-600 ' +
  'bg-earth-50 dark:bg-earth-700 text-earth-800 dark:text-earth-100 ' +
  'placeholder-earth-400 focus:outline-none focus:border-earth-400 ' +
  'dark:focus:border-earth-500 transition-colors'

export const LABEL_CLASS =
  'block text-xs font-medium text-earth-600 dark:text-earth-400 mb-1'

export const BTN_PRIMARY =
  'flex-1 py-3 sm:py-2.5 text-sm font-medium text-white bg-earth-500 hover:bg-earth-600 ' +
  'active:bg-earth-700 disabled:opacity-60 rounded-xl transition-colors'

export const BTN_SECONDARY =
  'flex-1 py-3 sm:py-2.5 text-sm font-medium text-earth-600 dark:text-earth-400 ' +
  'bg-earth-100 dark:bg-earth-700 hover:bg-earth-200 dark:hover:bg-earth-600 ' +
  'active:bg-earth-200 dark:active:bg-earth-600 rounded-xl transition-colors'
