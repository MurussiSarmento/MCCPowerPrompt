# mcc PromptFlow

Extensão Chrome para gerenciamento de prompts com integração AutoHotkey (AHK) via protocolo de URL personalizado.

## 📋 Funcionalidades

- **Repositório de Prompts**: Armazene e organize seus prompts favoritos
- **Busca Inteligente**: Encontre prompts rapidamente por título, conteúdo, tags ou categoria
- **Variáveis Dinâmicas**: Use `{{variavel}}` nos prompts para criar conteúdo personalizado
- **Integração AHK**: Execute prompts via AutoHotkey usando comunicação externa com a extensão Chrome
- **Suporte Multi-Site**: Funciona com ChatGPT, Gemini e Claude
- **Interface Moderna**: Design responsivo com suporte a tema escuro

## 🚀 Sites Suportados

- **ChatGPT** (chat.openai.com)
- **Google Gemini** (gemini.google.com)
- **Claude AI** (claude.ai)

## 📦 Instalação

1. Clone ou baixe este repositório
2. Abra o Chrome e vá para `chrome://extensions/`
3. Ative o "Modo do desenvolvedor"
4. Clique em "Carregar sem compactação"
5. Selecione a pasta da extensão

## 🎯 Como Usar

### Gerenciamento de Prompts

1. **Adicionar Prompt**: Clique no botão "Adicionar Novo" no popup
2. **Editar Prompt**: Clique no botão "Editar" em qualquer prompt
3. **Excluir Prompt**: Clique no botão "Excluir" (com confirmação)
4. **Buscar Prompts**: Use a barra de busca para filtrar por qualquer campo

### Estrutura de Prompt

```json
{
  "id": "uuid-gerado-automaticamente",
  "title": "Título do Prompt",
  "text": "Conteúdo do prompt com {{variáveis}}",
  "tags": ["tag1", "tag2"],
  "category": "Categoria"
}
```

### Variáveis Dinâmicas

Use `{{nome_da_variavel}}` no texto do prompt. Quando injetado, o usuário será solicitado a inserir valores:

```
Crie um artigo sobre {{tópico}} com foco em {{público_alvo}}.
O tom deve ser {{tom}} e ter aproximadamente {{palavras}} palavras.
```

### Integração AutoHotkey

1. **Copiar Código AHK**: Clique no botão "URL AHK" em qualquer prompt
2. **Código Gerado**: Script AHK completo que usa comunicação externa com a extensão
3. **Uso no AHK**: 

```autohotkey
; Código AHK para mcc PromptFlow
; ID do prompt: seu-prompt-id

#SingleInstance Force

F1::
    ; Usar comunicação externa com a extensão Chrome
    Run, chrome.exe --app="javascript:window.opener=null; window.open('', '_self'); window.close(); chrome.runtime.sendMessage('ID_DA_EXTENSAO', {action: 'insertPrompt', promptId: 'seu-prompt-id'}, function(response) { if (response && response.success) { console.log('Prompt enviado com sucesso'); } else { console.error('Erro ao enviar prompt'); } });"
    return
```

## 🔧 Arquitetura Técnica

### Manifest V3
- Service Worker para background script
- Content Scripts para injeção em páginas
- Comunicação externa para integração AHK
- Permissions mínimas necessárias

### Fluxo de Dados

1. **AHK → Comunicação Externa → Background Script**
2. **Popup → Background Script**
3. **Background → Content Script**
4. **Content Script → Página Web**

### Armazenamento

- `chrome.storage.local` para persistência
- Estrutura JSON simples
- Backup automático no storage do Chrome

## 📁 Estrutura de Arquivos

```
mcc-promptflow-extension/
├── manifest.json              # Configuração da extensão
├── icons/                     # Ícones SVG da extensão
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                     # Interface do usuário
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── scripts/                   # Lógica da extensão
│   ├── background.js          # Service Worker
│   └── content.js             # Injeção em páginas
└── README.md                  # Documentação
```

## 🎨 Interface

- **Design Responsivo**: Adapta-se ao tamanho da janela
- **Tema Escuro**: Suporte automático baseado nas preferências do sistema
- **Acessibilidade**: Navegação por teclado e screen readers
- **Feedback Visual**: Animações e estados de hover

## 🔒 Segurança

- **Permissions Mínimas**: Apenas storage, activeTab e scripting
- **Host Permissions**: Limitado aos sites suportados
- **Sanitização**: Escape de HTML para prevenir XSS
- **Validação**: Verificação de dados antes do armazenamento

## 🐛 Solução de Problemas

### Prompt não injeta
1. Verifique se está em um site suportado
2. Recarregue a página
3. Verifique se a textarea está visível

### Botão da extensão não aparece
1. Aguarde alguns segundos após carregar a página
2. Verifique se o content script foi carregado
3. Recarregue a extensão

### Integração AHK não funciona
1. Verifique se a extensão está ativa
2. Verifique se o ID da extensão está correto no script AHK
3. Verifique logs do console do Chrome
4. Certifique-se de que o Chrome está aberto quando executar o script AHK

## 📝 Desenvolvimento

### Requisitos
- Chrome/Chromium 88+
- Manifest V3 support
- ES6+ JavaScript

### Debug
1. Abra DevTools na página da extensão
2. Verifique logs no console
3. Use `chrome://extensions/` para reload

### Contribuição
1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Abra um Pull Request

## 📄 Licença

Este projeto é de uso interno da mcc.

## 🔄 Changelog

### v1.0.0
- Lançamento inicial
- CRUD completo de prompts
- Integração AHK via protocol handler
- Suporte a ChatGPT, Gemini e Claude
- Interface com tema escuro
- Sistema de variáveis dinâmicas

---

**mcc PromptFlow** - Simplifique seu fluxo de trabalho com IA 🚀