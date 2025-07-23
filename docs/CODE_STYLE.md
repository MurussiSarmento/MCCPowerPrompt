# Guia de Estilo de Código

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Este documento define os padrões e convenções de codificação a serem seguidos no desenvolvimento da extensão mcc PromptFlow, visando manter a consistência, legibilidade e manutenibilidade do código.

### Índice

1. [Princípios Gerais](#princípios-gerais)
2. [Convenções de Nomenclatura](#convenções-de-nomenclatura)
3. [Formatação](#formatação)
4. [JavaScript](#javascript)
5. [HTML](#html)
6. [CSS](#css)
7. [Comentários e Documentação](#comentários-e-documentação)
8. [Controle de Versão](#controle-de-versão)
9. [Testes](#testes)
10. [Ferramentas Recomendadas](#ferramentas-recomendadas)

## Princípios Gerais

### Clareza e Legibilidade

- Escreva código para humanos, não apenas para máquinas
- Priorize a clareza sobre a brevidade
- Evite otimizações prematuras que comprometam a legibilidade

### Consistência

- Siga as convenções estabelecidas neste documento
- Mantenha o estilo consistente em todo o projeto
- Quando em dúvida, siga o estilo do código existente

### Manutenibilidade

- Escreva código modular e reutilizável
- Evite duplicação de código (DRY - Don't Repeat Yourself)
- Prefira soluções simples e diretas

### Segurança

- Valide todas as entradas do usuário
- Sanitize conteúdo antes de exibi-lo ou injetá-lo
- Siga as melhores práticas de segurança para extensões Chrome

## Convenções de Nomenclatura

### Geral

- Use nomes descritivos que revelem a intenção
- Evite abreviações, exceto as amplamente conhecidas
- Mantenha a consistência com as convenções da plataforma

### Arquivos e Diretórios

- Use nomes em minúsculas para arquivos e diretórios
- Separe palavras com hífens em nomes de arquivos (kebab-case)
- Use extensões apropriadas (.js, .html, .css)

Exemplos:
```
popup.js
content-script.js
background.js
popup.html
popup.css
```

### JavaScript

#### Variáveis e Funções

- Use camelCase para variáveis e funções
- Use nomes descritivos que indiquem o propósito
- Prefixe booleanos com `is`, `has`, `should`, etc.

Exemplos:
```javascript
let currentPrompt;
let isModalOpen;
let hasSelectedFiles;

function savePrompt() { ... }
function handleButtonClick() { ... }
function isValidInput(input) { ... }
```

#### Constantes

- Use UPPER_SNAKE_CASE para constantes
- Declare constantes no topo do arquivo ou escopo

Exemplos:
```javascript
const MAX_PROMPTS = 100;
const DEFAULT_CATEGORY = "General";
const API_ENDPOINTS = {
  OPENAI: "https://chat.openai.com",
  GEMINI: "https://gemini.google.com"
};
```

#### Classes

- Use PascalCase para nomes de classes
- Use substantivos ou frases nominais

Exemplos:
```javascript
class PromptManager { ... }
class FileUploader { ... }
class DOMHelper { ... }
```

### HTML

#### IDs

- Use camelCase para IDs
- Seja específico e descritivo

Exemplos:
```html
<div id="promptsList"></div>
<button id="addNewBtn"></button>
<input id="searchInput" type="text">
```

#### Classes CSS

- Use kebab-case para classes CSS
- Use nomes que descrevam o propósito, não a aparência

Exemplos:
```html
<div class="prompt-item"></div>
<button class="action-button primary"></button>
<div class="modal-container"></div>
```

#### Atributos de Dados

- Use kebab-case para atributos de dados
- Prefixe com `data-`

Exemplos:
```html
<div data-prompt-id="123"></div>
<button data-action="delete"></button>
<span data-category="ai"></span>
```

### CSS

#### Variáveis CSS

- Use kebab-case para variáveis CSS
- Agrupe variáveis relacionadas com prefixos

Exemplos:
```css
:root {
  --color-primary: #3498db;
  --color-secondary: #2ecc71;
  --spacing-small: 8px;
  --spacing-medium: 16px;
  --font-size-normal: 14px;
  --font-size-large: 18px;
}
```

#### Classes

- Use kebab-case para classes
- Siga uma metodologia consistente (BEM, SMACSS, etc.)

Exemplos (usando BEM):
```css
.prompt-item { ... }
.prompt-item__title { ... }
.prompt-item__actions { ... }
.prompt-item--selected { ... }
```

## Formatação

### Indentação

- Use 2 espaços para indentação (não tabs)
- Mantenha a indentação consistente em todo o projeto

### Comprimento de Linha

- Limite linhas a 80-100 caracteres quando possível
- Quebre linhas longas de forma lógica

### Espaçamento

- Use espaços após vírgulas e em torno de operadores
- Use linhas em branco para separar blocos lógicos de código
- Não use múltiplas linhas em branco consecutivas

### Chaves

- Coloque chaves de abertura na mesma linha da declaração
- Coloque chaves de fechamento em uma nova linha

Exemplo:
```javascript
function example() {
  if (condition) {
    // código
  } else {
    // mais código
  }
}
```

### Ponto e Vírgula

- Use ponto e vírgula no final de cada declaração
- Não confie na inserção automática de ponto e vírgula

## JavaScript

### Declaração de Variáveis

- Prefira `const` para variáveis que não serão reatribuídas
- Use `let` para variáveis que serão reatribuídas
- Evite `var`
- Declare uma variável por linha

Exemplo:
```javascript
const maxPrompts = 100;
let currentIndex = 0;
let isLoading = false;
```

### Funções

- Prefira funções nomeadas a funções anônimas
- Use arrow functions para callbacks curtos
- Mantenha funções pequenas e focadas em uma única responsabilidade

Exemplo:
```javascript
// Função nomeada
function savePrompt(prompt) {
  // implementação
}

// Arrow function para callback
element.addEventListener('click', () => {
  handleClick();
});
```

### Promises e Async/Await

- Prefira async/await a encadeamento de .then()
- Sempre trate erros com try/catch ou .catch()
- Evite promises aninhadas

Exemplo:
```javascript
// Bom
async function loadPrompts() {
  try {
    const result = await chrome.storage.local.get('prompts');
    return result.prompts || [];
  } catch (error) {
    console.error('Error loading prompts:', error);
    return [];
  }
}

// Evitar
function loadPrompts() {
  return chrome.storage.local.get('prompts')
    .then(result => {
      return result.prompts || [];
    })
    .catch(error => {
      console.error('Error loading prompts:', error);
      return [];
    });
}
```

### Manipulação do DOM

- Cache referências a elementos DOM frequentemente acessados
- Use métodos modernos (querySelector, addEventListener)
- Minimize manipulações diretas do DOM

Exemplo:
```javascript
// Cache de elementos DOM
const promptsList = document.querySelector('#promptsList');
const addButton = document.querySelector('#addNewBtn');

// Adicionar event listeners
addButton.addEventListener('click', handleAddClick);

// Criar e adicionar elementos
function createPromptElement(prompt) {
  const element = document.createElement('div');
  element.className = 'prompt-item';
  element.textContent = prompt.title;
  return element;
}

function renderPrompts(prompts) {
  promptsList.innerHTML = '';
  prompts.forEach(prompt => {
    const element = createPromptElement(prompt);
    promptsList.appendChild(element);
  });
}
```

### Tratamento de Erros

- Use try/catch para operações que podem falhar
- Forneça mensagens de erro descritivas
- Registre erros no console para depuração

Exemplo:
```javascript
async function savePrompt(prompt) {
  try {
    await chrome.storage.local.set({ 'currentPrompt': prompt });
    return true;
  } catch (error) {
    console.error('Error saving prompt:', error);
    showErrorMessage('Não foi possível salvar o prompt. Tente novamente.');
    return false;
  }
}
```

## HTML

### Estrutura

- Use HTML5 doctype
- Inclua atributos lang e charset
- Organize o código em seções lógicas

Exemplo:
```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>mcc PromptFlow</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <header>
    <!-- Conteúdo do cabeçalho -->
  </header>
  
  <main>
    <!-- Conteúdo principal -->
  </main>
  
  <footer>
    <!-- Conteúdo do rodapé -->
  </footer>
  
  <script src="popup.js"></script>
</body>
</html>
```

### Semântica

- Use elementos HTML semânticos (header, nav, main, section, etc.)
- Evite divs desnecessários
- Use atributos ARIA quando necessário para acessibilidade

Exemplo:
```html
<header>
  <h1>mcc PromptFlow</h1>
  <nav>
    <button aria-label="Adicionar Novo Prompt">+</button>
    <button aria-label="Configurações">⚙️</button>
  </nav>
</header>

<main>
  <section class="prompts-container">
    <h2>Seus Prompts</h2>
    <ul id="promptsList" role="list"></ul>
  </section>
</main>
```

### Formulários

- Use labels para todos os campos de formulário
- Associe labels com campos usando o atributo for
- Inclua atributos de validação apropriados

Exemplo:
```html
<form id="promptForm">
  <div class="form-group">
    <label for="promptTitle">Título</label>
    <input type="text" id="promptTitle" name="title" required>
  </div>
  
  <div class="form-group">
    <label for="promptText">Texto</label>
    <textarea id="promptText" name="text" required></textarea>
  </div>
  
  <div class="form-group">
    <label for="promptTags">Tags (separadas por vírgula)</label>
    <input type="text" id="promptTags" name="tags">
  </div>
  
  <button type="submit">Salvar</button>
</form>
```

## CSS

### Organização

- Organize o CSS em seções lógicas com comentários
- Agrupe propriedades relacionadas
- Siga uma ordem consistente para propriedades

Exemplo:
```css
/* Variáveis */
:root {
  --color-primary: #3498db;
  --color-text: #333;
  --spacing-base: 8px;
}

/* Reset e Estilos Globais */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  line-height: 1.5;
  color: var(--color-text);
}

/* Componentes */
.button {
  padding: var(--spacing-base);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Layout */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-base) * 2;
}
```

### Seletores

- Mantenha seletores simples e específicos
- Evite seletores excessivamente aninhados
- Prefira classes a IDs para estilização

Exemplo:
```css
/* Bom */
.prompt-item {
  margin-bottom: 8px;
}

.prompt-item__title {
  font-weight: bold;
}

/* Evitar */
#promptsList div div h3 {
  font-weight: bold;
}
```

### Media Queries

- Use media queries para design responsivo
- Agrupe media queries relacionadas
- Considere uma abordagem mobile-first

Exemplo:
```css
/* Estilos base (mobile-first) */
.container {
  padding: 8px;
}

/* Tablets */
@media (min-width: 768px) {
  .container {
    padding: 16px;
  }
}

/* Desktops */
@media (min-width: 1024px) {
  .container {
    padding: 24px;
    max-width: 1200px;
  }
}
```

## Comentários e Documentação

### Comentários de Código

- Use comentários para explicar "por quê", não "o quê"
- Mantenha comentários atualizados com o código
- Evite comentários óbvios ou redundantes

Exemplo:
```javascript
// Bom: explica o motivo
// Usamos setTimeout para evitar conflitos com a animação de fechamento
setTimeout(() => {
  modal.remove();
}, 300);

// Ruim: apenas descreve o código
// Define o valor como 100
const maxPrompts = 100;
```

### Documentação de Funções

- Use JSDoc para documentar funções e classes
- Inclua descrição, parâmetros e valor de retorno
- Documente exceções e comportamentos especiais

Exemplo:
```javascript
/**
 * Salva um prompt no armazenamento local.
 * 
 * @param {Object} prompt - O objeto prompt a ser salvo
 * @param {string} prompt.id - ID único do prompt
 * @param {string} prompt.title - Título do prompt
 * @param {string} prompt.text - Texto do prompt
 * @param {string[]} [prompt.tags] - Tags associadas ao prompt
 * @param {string} [prompt.category] - Categoria do prompt
 * @returns {Promise<boolean>} - True se salvo com sucesso, False caso contrário
 * @throws {Error} - Se o prompt for inválido
 */
async function savePrompt(prompt) {
  // implementação
}
```

### Comentários de Seção

- Use comentários de seção para dividir arquivos longos
- Seja consistente com o formato dos comentários de seção

Exemplo:
```javascript
//=============================================================================
// Inicialização e Configuração
//=============================================================================

let prompts = [];
let currentPrompt = null;

//=============================================================================
// Manipulação de Prompts
//=============================================================================

function addPrompt() { ... }
function editPrompt() { ... }
function deletePrompt() { ... }
```

## Controle de Versão

### Mensagens de Commit

- Use mensagens claras e descritivas
- Siga um formato consistente
- Referencie issues ou tickets quando aplicável

Formato recomendado:
```
<tipo>(<escopo>): <descrição>

<corpo>

<rodapé>
```

Onde:
- `<tipo>` é um dos seguintes: feat, fix, docs, style, refactor, test, chore
- `<escopo>` é opcional e indica a parte do código afetada
- `<descrição>` é uma descrição concisa da mudança
- `<corpo>` é opcional e fornece detalhes adicionais
- `<rodapé>` é opcional e contém referências a issues ou breaking changes

Exemplos:
```
feat(popup): adicionar funcionalidade de busca de prompts

Implementa a busca de prompts por título, tags e conteúdo.

Resolve #123
```

```
fix(content): corrigir detecção de textarea no ChatGPT

Atualiza o seletor para se adaptar às mudanças na interface do ChatGPT.
```

### Branches

- Use nomes descritivos para branches
- Siga um padrão consistente
- Mantenha branches atualizados com a branch principal

Formato recomendado:
```
<tipo>/<descrição>
```

Onde:
- `<tipo>` é um dos seguintes: feature, bugfix, hotfix, docs, refactor
- `<descrição>` é uma descrição curta e descritiva usando kebab-case

Exemplos:
```
feature/prompt-search
bugfix/chatgpt-textarea-detection
docs/update-readme
refactor/popup-component
```

## Testes

### Estrutura de Testes

- Organize testes em uma estrutura que espelhe o código fonte
- Agrupe testes relacionados
- Nomeie arquivos de teste de forma consistente

Exemplo:
```
src/
  popup/
    popup.js
  scripts/
    background.js
    content.js
tests/
  popup/
    popup.test.js
  scripts/
    background.test.js
    content.test.js
```

### Nomenclatura de Testes

- Use nomes descritivos que indicam o que está sendo testado
- Siga um formato consistente

Exemplo:
```javascript
describe('savePrompt', () => {
  it('deve salvar um prompt válido com sucesso', () => {
    // teste
  });
  
  it('deve retornar false quando o prompt é inválido', () => {
    // teste
  });
  
  it('deve lançar erro quando o armazenamento não está disponível', () => {
    // teste
  });
});
```

### Mocks e Stubs

- Use mocks para simular dependências externas
- Documente o comportamento esperado dos mocks
- Restaure mocks após os testes

Exemplo:
```javascript
describe('loadPrompts', () => {
  beforeEach(() => {
    // Mock da API chrome.storage.local
    chrome.storage.local.get = jest.fn().mockImplementation((key, callback) => {
      callback({ prompts: [{ id: '1', title: 'Test' }] });
    });
  });
  
  afterEach(() => {
    // Restaurar o mock
    jest.restoreAllMocks();
  });
  
  it('deve carregar prompts do armazenamento', async () => {
    const prompts = await loadPrompts();
    expect(prompts).toHaveLength(1);
    expect(prompts[0].title).toBe('Test');
  });
});
```

## Ferramentas Recomendadas

### Linting e Formatação

- **ESLint**: Para análise estática de código JavaScript
- **Prettier**: Para formatação consistente de código
- **HTMLHint**: Para validação de HTML
- **Stylelint**: Para linting de CSS

### Configuração Recomendada

#### ESLint

```json
{
  "extends": ["eslint:recommended"],
  "env": {
    "browser": true,
    "es6": true,
    "webextensions": true
  },
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": "warn",
    "no-console": ["warn", { "allow": ["error", "warn"] }],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "indent": ["error", 2]
  }
}
```

#### Prettier

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

### Editores e IDEs

- **Visual Studio Code**: Com extensões para ESLint, Prettier, etc.
- **WebStorm**: Com suporte integrado para linting e formatação
- **Sublime Text**: Com plugins para linting e formatação

### Extensões Recomendadas para VS Code

- ESLint
- Prettier - Code formatter
- HTMLHint
- Stylelint
- Chrome Extension Developer Tools
- JavaScript (ES6) code snippets
- Live Server

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc

Este documento é um guia vivo e será atualizado conforme as práticas e ferramentas evoluem.