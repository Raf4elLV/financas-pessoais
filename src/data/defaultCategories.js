export const DEFAULT_CATEGORIES = [
  // Receitas
  { id: 'cat-salario',       name: 'Salário',              type: 'income',           isDefault: true },
  { id: 'cat-freelance',     name: 'Freelance',            type: 'income',           isDefault: true },
  { id: 'cat-investimentos', name: 'Investimentos',        type: 'income',           isDefault: true },
  { id: 'cat-outros-rend',   name: 'Outros Rendimentos',   type: 'income',           isDefault: true },

  // Despesas Fixas
  { id: 'cat-aluguel',       name: 'Aluguel/Financiamento',type: 'fixed_expense',    isDefault: true },
  { id: 'cat-internet',      name: 'Internet',             type: 'fixed_expense',    isDefault: true },
  { id: 'cat-energia',       name: 'Energia',              type: 'fixed_expense',    isDefault: true },
  { id: 'cat-agua',          name: 'Água',                 type: 'fixed_expense',    isDefault: true },
  { id: 'cat-saude-plano',   name: 'Plano de Saúde',       type: 'fixed_expense',    isDefault: true },
  { id: 'cat-academia',      name: 'Academia',             type: 'fixed_expense',    isDefault: true },
  { id: 'cat-streaming',     name: 'Streaming/Assinaturas',type: 'fixed_expense',    isDefault: true },
  { id: 'cat-telefone',      name: 'Telefone',             type: 'fixed_expense',    isDefault: true },

  // Despesas Variáveis
  { id: 'cat-cartao',        name: 'Cartão de Crédito',    type: 'variable_expense', isDefault: true },
  { id: 'cat-alimentacao',   name: 'Alimentação',          type: 'variable_expense', isDefault: true },
  { id: 'cat-delivery',      name: 'Restaurante/Delivery', type: 'variable_expense', isDefault: true },
  { id: 'cat-transporte',    name: 'Transporte',           type: 'variable_expense', isDefault: true },
  { id: 'cat-lazer',         name: 'Lazer',                type: 'variable_expense', isDefault: true },
  { id: 'cat-saude-var',     name: 'Saúde',                type: 'variable_expense', isDefault: true },
  { id: 'cat-vestuario',     name: 'Vestuário',            type: 'variable_expense', isDefault: true },
  { id: 'cat-educacao',      name: 'Educação',             type: 'variable_expense', isDefault: true },
  { id: 'cat-farmacia',      name: 'Farmácia',             type: 'variable_expense', isDefault: true },
  { id: 'cat-outros-var',    name: 'Outros',               type: 'variable_expense', isDefault: true },
]
