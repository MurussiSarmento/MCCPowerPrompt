# Especificações Técnicas

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

### Arquitetura Geral

O **mcc PromptFlow** é desenvolvido como uma extensão para navegadores Chrome/Chromium utilizando o Manifest V3. A arquitetura da extensão é composta por três componentes principais:

1. **Interface do Usuário (UI)**: Implementada como um popup da extensão.
2. **Background Script**: Service Worker que gerencia a comunicação e orquestração.
3. **Content Script**: Injetado nas páginas dos sites suportados para interação com o DOM.

### Tecnologias Utilizadas

- **JavaScript (ES6+)**: Linguagem principal de desenvolvimento
- **HTML5/CSS3**: Para a interface do usuário
- **Chrome Extension API**: Para funcionalidades específicas de extensão
- **JSZip**: Biblioteca para manipulação de arquivos ZIP
- **Manifest V3**: Especificação atual para extensões Chrome

### Estrutura de Arquivos

```
mcc-promptflow-extension/
├── manifest.json              # Configuração da extensão
├── icons/                     # Ícones da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # Interface do usuário
│   ├── popup.html             # Estrutura HTML do popup
│   ├── popup.css              # Estilos CSS
│   ├── popup.js               # Lógica da interface do usuário
│   └── jszip.min.js           # Biblioteca para manipulação de arquivos ZIP
├── scripts/                   # Lógica da extensão
│   ├── background.js          # Service Worker (background)
│   └── content.js             # Script de injeção em páginas
└── docs/                      # Documentação
    ├── PRD.md                 # Documento de Requisitos do Produto
    ├── TECHNICAL_SPECS.md     # Especificações Técnicas (este documento)
    ├── CONTRIBUTING.md        # Guia de Contribuição
    └── ROADMAP.md             # Roadmap de Desenvolvimento
```

### Componentes Detalhados

#### 1. Manifest.json

O arquivo `manifest.json` define as configurações da extensão, incluindo:

- Metadados (nome, versão, descrição)
- Permissões necessárias
- Host permissions para sites suportados
- Configuração do service worker
- Configuração do popup
- Configuração dos content scripts
- Configuração de comunicação externa

#### 2. Interface do Usuário (Popup)

A interface do usuário é implementada como um popup da extensão, com os seguintes arquivos:

- **popup.html**: Estrutura HTML do popup, incluindo:
  - Lista de prompts
  - Modal para adicionar/editar prompts
  - Modal de configurações
  - Formulários e controles

- **popup.css**: Estilos CSS do popup, incluindo:
  - Variáveis CSS para temas claro e escuro
  - Estilos responsivos
  - Animações e transições
  - Layout e componentes visuais

- **popup.js**: Lógica JavaScript do popup, incluindo:
  - Gerenciamento de estado
  - Manipulação do DOM
  - Comunicação com o background script
  - Armazenamento e recuperação de dados
  - Processamento de eventos de usuário

#### 3. Background Script

O `background.js` é implementado como um service worker (Manifest V3) e é responsável por:

- Gerenciar a comunicação entre popup e content scripts
- Receber mensagens externas (AHK)
- Gerenciar configurações
- Orquestrar a injeção de prompts
- Gerenciar o ciclo de vida da extensão

Principais funções:

- `chrome.runtime.onMessage.addListener()`: Recebe mensagens do popup ou content script
- `chrome.runtime.onMessageExternal.addListener()`: Recebe mensagens externas (AHK)
- `getConfiguredUrls()`: Obtém as URLs configuradas do storage
- `handleProtocolInjection()`: Gerencia a injeção de prompts via protocolo
- `handleGetPromptById()`: Recupera um prompt específico pelo ID

#### 4. Content Script

O `content.js` é injetado nas páginas dos sites suportados e é responsável por:

- Detectar campos de texto adequados para injeção
- Monitorar mudanças no DOM
- Injetar prompts nos campos de texto
- Processar variáveis dinâmicas

Principais funções:

- `initialize()`: Inicializa o content script
- `setupContentScript()`: Configura o content script
- `detectAndMonitorTextarea()`: Detecta e monitora o textarea principal
- `findTextarea()`: Encontra o textarea adequado para injeção
- `injectPrompt()`: Injeta o prompt no textarea
- `processVariables()`: Processa variáveis dinâmicas no prompt

### Fluxo de Dados

#### 1. Armazenamento de Prompts

Os prompts são armazenados no `chrome.storage.local` com a seguinte estrutura:

```javascript
{
  prompts: [
    {
      id: "uuid-gerado-automaticamente",
      title: "Título do Prompt",
      text: "Conteúdo do prompt com {{variáveis}}",
      tags: ["tag1", "tag2"],
      category: "Categoria",
      knowledgeBase: [/* arquivos base64 */]
    },
    // mais prompts...
  ],
  config: {
    sapGenAiUrl: "https://...",
    storageType: "local"
  }
}
```

#### 2. Injeção de Prompts via Popup

1. Usuário seleciona um prompt no popup
2. Popup envia mensagem para o background script: `{action: 'injectPrompt', promptId: 'id'}`
3. Background script recupera o prompt do storage
4. Background script envia mensagem para o content script ativo: `{action: 'injectPrompt', prompt: promptObj}`
5. Content script processa o prompt (variáveis, etc.)
6. Content script injeta o texto no campo de texto da página

#### 3. Injeção de Prompts via AHK

1. Script AHK envia mensagem externa para a extensão: `{action: 'insertPrompt', promptId: 'id'}`
2. Background script recebe a mensagem via `chrome.runtime.onMessageExternal`
3. Background script recupera o prompt do storage
4. Background script identifica a aba ativa com site suportado
5. Background script envia mensagem para o content script: `{action: 'injectPrompt', prompt: promptObj}`
6. Content script processa o prompt (variáveis, etc.)
7. Content script injeta o texto no campo de texto da página

### Processamento de Variáveis

1. Content script identifica variáveis no formato `{{variavel}}` usando regex
2. Para cada variável encontrada, content script cria um input no modal de variáveis
3. Usuário preenche os valores das variáveis
4. Content script substitui as variáveis pelos valores fornecidos
5. Content script injeta o texto final no campo de texto

### Segurança e Permissões

#### Permissões Utilizadas

- **storage**: Para armazenar prompts e configurações
- **activeTab**: Para interagir com a aba ativa
- **scripting**: Para injetar scripts nas páginas
- **downloads**: Para exportar prompts
- **fileSystemWrite**: Para operações de arquivo

#### Host Permissions

A extensão solicita permissões apenas para os domínios das plataformas suportadas:

```json
"host_permissions": [
  "https://chat.openai.com/*",
  "https://gemini.google.com/*",
  "https://claude.ai/*",
  "https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/*",
  "https://graph.microsoft.com/*"
]
```

### Considerações de Desempenho

- O background script é implementado como service worker, que é carregado sob demanda e descarregado quando inativo.
- Os content scripts são injetados apenas nas páginas dos sites suportados.
- A busca de prompts é otimizada para resposta em tempo real.
- O armazenamento local é limitado a 5MB por domínio no Chrome.

### Limitações Técnicas

- O Manifest V3 impõe restrições ao uso de background scripts persistentes.
- A comunicação entre extensão e páginas é limitada por razões de segurança.
- O armazenamento local é limitado em tamanho e não é sincronizado entre dispositivos.
- A detecção de campos de texto em sites dinâmicos pode ser desafiadora devido a mudanças frequentes no DOM.

### Testes

#### Testes Manuais

- Teste de funcionalidade em cada plataforma suportada
- Teste de responsividade em diferentes tamanhos de janela
- Teste de tema escuro/claro
- Teste de integração AHK

#### Testes Automatizados (Futuros)

- Testes unitários para funções críticas
- Testes de integração para fluxos principais
- Testes de regressão para garantir compatibilidade com atualizações

### Considerações para Desenvolvimento Futuro

- Migração para uma arquitetura mais modular usando frameworks como React
- Implementação de sincronização com serviços de nuvem
- Adição de suporte a mais plataformas de IA
- Implementação de sistema de templates com lógica condicional
- Adição de histórico de uso de prompts

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc