# Relatório de Bugs — Finanças Pessoais

Registro formal dos defeitos identificados e corrigidos no projeto.
Útil como referência de QA e portfólio de testes.

---

## BUG-001 · Card do tutorial mudando de posição

| Campo | Detalhe |
|---|---|
| **Módulo** | Onboarding / Tutorial |
| **Severidade** | Médio |
| **Tipo** | Visual / UX |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Criar uma nova conta
2. Observar o tutorial de primeiro acesso
3. Clicar em "Próximo" para avançar entre os passos

**Resultado obtido:**
O card com os textos e botões do tutorial mudava de posição a cada passo (aparecia no centro, no rodapé ou no topo da tela), causando uma experiência visual inconsistente.

**Resultado esperado:**
O card deve permanecer fixo no centro da tela durante todo o tutorial.

**Causa raiz:**
A lógica de posicionamento do card dependia de onde o elemento destacado (spotlight) estava na tela — se no topo, o card ia para baixo; se embaixo, subia. Isso causava o "salto" visual.

**Correção aplicada:**
Removida a lógica condicional de posicionamento. O card passou a usar `position: fixed` centralizado (`flex items-center justify-center`) independentemente do passo.

---

## BUG-002 · Borda de foco (spotlight ring) desalinhada no tutorial

| Campo | Detalhe |
|---|---|
| **Módulo** | Onboarding / Tutorial |
| **Severidade** | Médio |
| **Tipo** | Visual |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Acessar o tutorial de primeiro acesso
2. Avançar para qualquer passo que destaca um elemento (passos 2, 3 ou 4)
3. Observar a borda marrom ao redor do elemento destacado

**Resultado obtido:**
A borda marrom (spotlight ring) aparecia deslocada em relação ao elemento que deveria destacar — sempre abaixo do elemento real.

**Resultado esperado:**
A borda deve envolver exatamente o elemento destacado.

**Causa raiz (1):** O componente era renderizado dentro do DOM do Dashboard, dentro de um contêiner `flex` com `overflow`. No Chrome, elementos com `position: fixed` filhos de contêineres flex com `overflow` podem ter o *containing block* alterado, deslocando o posicionamento.

**Causa raiz (2):** O `scrollIntoView` usava animação `smooth`, e a medição das coordenadas do elemento (`getBoundingClientRect`) acontecia antes da animação terminar, capturando uma posição intermediária incorreta.

**Correção aplicada:**
- Uso de `createPortal` para renderizar o overlay diretamente no `<body>`, eliminando qualquer influência dos ancestrais.
- Substituição de `scrollIntoView({ behavior: 'smooth' })` por `behavior: 'instant'`.
- Substituição de `setTimeout(60ms)` por dois `requestAnimationFrame` encadeados, garantindo que o browser pintou o layout antes de medir o elemento.

---

## BUG-003 · "Conta criada em" exibindo INVALID DATE

| Campo | Detalhe |
|---|---|
| **Módulo** | Perfil do usuário |
| **Severidade** | Baixo |
| **Tipo** | Funcional / Dados |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Fazer login
2. Acessar a página de perfil
3. Observar o texto "Conta criada em" no cabeçalho

**Resultado obtido:**
`Conta criada em Invalid Date`

**Resultado esperado:**
`Conta criada em 27/03/2026` (data real de criação da conta)

**Causa raiz:**
A função `rowToUser` em `useAuth.js`, responsável por mapear os dados do banco para o objeto de usuário, não incluía o campo `created_at` da tabela `profiles`. O campo `currentUser.createdAt` era `undefined`, e `new Date(undefined)` resulta em `Invalid Date`.

**Correção aplicada:**
Adicionado `createdAt: profile.created_at` ao mapeamento em `rowToUser`.

---

## BUG-004 · Validação de senha inconsistente na tela de segurança

| Campo | Detalhe |
|---|---|
| **Módulo** | Perfil / Segurança |
| **Severidade** | Baixo |
| **Tipo** | Funcional / UX |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Acessar Perfil → Segurança
2. Observar o campo "Nova senha"

**Resultado obtido:**
O componente `PasswordRequirements` exibia "No mínimo 6 caracteres", mas a validação do formulário aceitava senhas com apenas 4 caracteres (o botão era habilitado com 4 chars).

**Resultado esperado:**
Validação, placeholder e indicador visual devem ser consistentes: mínimo de 6 caracteres (requisito do Supabase).

**Causa raiz:**
A validação no `PasswordSection` usava `form.next.length < 4`, enquanto o componente `PasswordRequirements` (compartilhado) exibia o requisito de 6 caracteres.

**Correção aplicada:**
Alterada a validação, o placeholder e o estado `disabled` do botão para usar 6 como valor mínimo em todo o formulário.

---

## BUG-005 · Ausência de aviso sobre e-mail de verificação no cadastro

| Campo | Detalhe |
|---|---|
| **Módulo** | Autenticação / Cadastro |
| **Severidade** | Baixo |
| **Tipo** | UX / Informação |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Acessar a tela de cadastro
2. Preencher os dados com um e-mail qualquer (ex: teste@teste.com)
3. Clicar em "Criar Conta"

**Resultado obtido:**
Nenhum aviso de que seria enviado um e-mail de verificação. Usuários podiam usar e-mails inválidos ou inexistentes sem entender por que o login falhava depois.

**Resultado esperado:**
Um aviso próximo ao campo de e-mail informando que um link de verificação será enviado e que é necessário usar um endereço real.

**Correção aplicada:**
Adicionada uma linha informativa abaixo do campo de e-mail no formulário de cadastro.

---

## BUG-006 · Botão de logout não funcionava

| Campo | Detalhe |
|---|---|
| **Módulo** | Autenticação / Header |
| **Severidade** | Alto |
| **Tipo** | Funcional |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Fazer login normalmente
2. Clicar no ícone de logout no cabeçalho

**Resultado obtido:**
Nada acontecia. O usuário permanecia logado e não era redirecionado para a tela de login.

**Resultado esperado:**
O usuário deve ser desconectado e redirecionado para a tela de login.

**Causa raiz:**
A função `logout` chamava `supabase.auth.signOut()` (que pode falhar silenciosamente em caso de erro de rede), mas não forçava a limpeza do estado local `currentUser`. Se o evento `SIGNED_OUT` não disparasse corretamente, o estado ficava com o usuário ainda logado.

**Correção aplicada:**
Adicionado `setCurrentUser(null)` explícito após `signOut()`, garantindo o logout mesmo que a chamada ao Supabase falhe.

---

## BUG-007 · Aplicação travava no carregamento após F5 (página em branco)

| Campo | Detalhe |
|---|---|
| **Módulo** | Autenticação / Bootstrap |
| **Severidade** | Crítico |
| **Tipo** | Funcional / Performance |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Fazer login
2. Pressionar F5 para recarregar a página
3. Aguardar

**Resultado obtido:**
A aplicação ficava exibindo o spinner de carregamento indefinidamente. Nenhum conteúdo era renderizado. O problema ocorria no Chrome com sessão ativa, mas não em aba anônima (sem sessão armazenada).

**Resultado esperado:**
Após o F5, a aplicação deve restaurar a sessão e carregar o dashboard normalmente.

**Causa raiz:**
O Supabase JS v2 introduziu o evento `INITIAL_SESSION` (disparado ao restaurar sessão na página), mas o código só tratava `SIGNED_IN`. No carregamento, `INITIAL_SESSION` era ignorado, e `setAuthLoading(false)` dependia exclusivamente do `getSession()` resolver. Se o token estivesse expirado e a requisição de refresh de rede falhasse ou demorasse, o estado `authLoading` ficava `true` para sempre.

**Correção aplicada:**
- Removido o `getSession()` como fonte primária.
- `onAuthStateChange` passou a ser a fonte única de estado, tratando `INITIAL_SESSION` corretamente.
- Adicionado safety timer de 8 segundos: se nenhum evento resolver o loading, ele é liberado automaticamente.

---

## BUG-008 · Login travava na tela ("Entrando..." permanente)

| Campo | Detalhe |
|---|---|
| **Módulo** | Autenticação / Login |
| **Severidade** | Crítico |
| **Tipo** | Funcional / Performance |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Acessar a tela de login
2. Inserir credenciais válidas
3. Clicar em "Entrar"

**Resultado obtido:**
O botão ficava exibindo "Entrando..." indefinidamente. O usuário não conseguia fazer login.

**Resultado esperado:**
Após inserir credenciais válidas, o usuário deve ser redirecionado ao dashboard em poucos segundos.

**Causa raiz:**
Descoberta ao inspecionar o código-fonte do Supabase JS v2 (`GoTrueClient.js`, linha 3916):
```js
await x.callback(event, session) // Supabase awaita o callback
```
O método `_notifyAllSubscribers` do Supabase **aguarda o retorno de cada callback** antes de continuar. Como o callback `onAuthStateChange` era `async` e continha `await fetchProfile(...)` (chamada de rede ao banco), o `signInWithPassword` ficava bloqueado esperando o perfil carregar — ou para sempre se houvesse timeout.

**Correção aplicada:**
Separação em dois blocos independentes:
1. `onAuthStateChange` — callback **síncrono**, zero awaits, apenas grava o usuário auth no estado.
2. `useEffect([authUser?.id])` — busca o perfil de forma assíncrona e independente, sem bloquear operações de auth.

---

## BUG-009 · Tutorial reexibido após limpar cache do navegador

| Campo | Detalhe |
|---|---|
| **Módulo** | Onboarding / Tutorial |
| **Severidade** | Médio |
| **Tipo** | Funcional / Persistência |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Concluir o tutorial de primeiro acesso
2. Limpar os dados do site no navegador (cache / site data)
3. Fazer login novamente

**Resultado obtido:**
O tutorial era exibido novamente, como se fosse o primeiro acesso.

**Resultado esperado:**
O tutorial deve aparecer apenas uma vez por usuário, independentemente de limpeza de cache.

**Causa raiz:**
O flag de "tutorial já visto" era armazenado em `localStorage` com a chave `fin_onboarded_<userId>`. O `localStorage` é apagado junto com o cache do navegador.

**Correção aplicada:**
- Adicionada coluna `onboarded boolean default false` na tabela `profiles` do Supabase.
- O flag passou a ser persistido no banco de dados, vinculado à conta do usuário.
- A função `markOnboarded` atualiza o banco e o estado local (`currentUser`) simultaneamente, evitando reexibição ao navegar entre páginas na mesma sessão.

---

## BUG-010 · Tutorial reexibido ao voltar para o Dashboard

| Campo | Detalhe |
|---|---|
| **Módulo** | Onboarding / Tutorial |
| **Severidade** | Médio |
| **Tipo** | Funcional / Estado |
| **Status** | ✅ Corrigido |

**Passos para reproduzir:**
1. Concluir ou pular o tutorial
2. Navegar para outra página (ex: Transações)
3. Voltar para o Dashboard

**Resultado obtido:**
O tutorial era exibido novamente.

**Resultado esperado:**
O tutorial não deve reaparecer após ser concluído ou pulado.

**Causa raiz:**
A função `dismiss()` atualizava o banco de dados (Supabase), mas não atualizava o objeto `currentUser` no estado do React. Quando o usuário voltava ao Dashboard, o componente `OnboardingTutorial` era remontado e lia `currentUser.onboarded` (ainda `false` em memória), exibindo o tutorial novamente.

**Correção aplicada:**
A função `markOnboarded` passou a executar `setCurrentUser(u => ({ ...u, onboarded: true }))` junto com a atualização no banco, mantendo o estado local sincronizado com o banco de dados.

---

*Documento gerado em 27/03/2026 · Projeto: Finanças Pessoais*
