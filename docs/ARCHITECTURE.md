# Documento de Arquitetura

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Este documento descreve a arquitetura da extensão mcc PromptFlow, detalhando seus componentes, interações, fluxos de dados e decisões de design.

### Índice

1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [Componentes Principais](#componentes-principais)
3. [Fluxos de Dados](#fluxos-de-dados)
4. [Modelo de Dados](#modelo-de-dados)
5. [Decisões de Arquitetura](#decisões-de-arquitetura)
6. [Considerações de Segurança](#considerações-de-segurança)
7. [Limitações e Restrições](#limitações-e-restrições)
8. [Evolução da Arquitetura](#evolução-da-arquitetura)

## Visão Geral da Arquitetura

A extensão mcc PromptFlow segue a arquitetura padrão de extensões Chrome com Manifest V3, composta por três componentes principais que se comunicam entre si para fornecer a funcionalidade completa da extensão.

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                      Chrome Extension                           │
│                                                                 │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐      │
│  │    Popup    │◄────►│  Background │◄────►│   Content   │      │
│  │  (UI/UX)    │      │   Script    │      │   Script    │      │
│  └─────────────┘      └─────────────┘      └─────────────┘      │
│         ▲                     ▲                    ▲             │
└─────────┼─────────────────────┼────────────────────┼─────────────┘
          │                     │                    │
          ▼                     ▼                    ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Chrome      │      │  External   │      │  Webpage    │
│  Storage     │      │  Scripts    │      │  DOM        │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Princípios de Design

1. **Separação de Responsabilidades**: Cada componente tem um propósito bem definido
2. **Comunicação Assíncrona**: Interações entre componentes são realizadas de forma assíncrona
3. **Armazenamento Local**: Dados persistidos localmente no navegador do usuário
4. **Segurança por Design**: Implementação de práticas seguras desde o início
5. **Extensibilidade**: Arquitetura que permite adição de novas funcionalidades

## Componentes Principais

### Popup (Interface do Usuário)

**Responsabilidades**:
- Fornecer interface para gerenciamento de prompts
- Permitir busca, adição, edição e exclusão de prompts
- Configurar preferências da extensão
- Iniciar a injeção de prompts

**Tecnologias**:
- HTML5
- CSS3 (com variáveis para temas)
- JavaScript (ES6+)
- JSZip (para manipulação de arquivos)

**Arquivos Principais**:
- `popup/popup.html`: Estrutura da interface
- `popup/popup.css`: Estilos e temas
- `popup/popup.js`: Lógica da interface e interação com o usuário
- `popup/jszip.min.js`: Biblioteca para manipulação de arquivos ZIP

**Interações**:
- Comunica-se com o Background Script para operações de armazenamento e injeção
- Manipula diretamente o Chrome Storage para algumas operações

### Background Script

**Responsabilidades**:
- Orquestrar a comunicação entre componentes
- Gerenciar mensagens internas e externas
- Coordenar a injeção de prompts
- Gerenciar permissões e configurações

**Tecnologias**:
- JavaScript (ES6+)
- Chrome Extension API

**Arquivos Principais**:
- `scripts/background.js`: Script principal de background

**Interações**:
- Recebe mensagens do Popup e do Content Script
- Recebe mensagens externas (AutoHotkey)
- Envia comandos para o Content Script
- Acessa o Chrome Storage para persistência de dados

### Content Script

**Responsabilidades**:
- Detectar campos de texto nas páginas suportadas
- Injetar prompts nos campos de texto
- Processar variáveis dinâmicas
- Monitorar mudanças no DOM

**Tecnologias**:
- JavaScript (ES6+)
- DOM API
- MutationObserver

**Arquivos Principais**:
- `scripts/content.js`: Script injetado nas páginas web

**Interações**:
- Recebe comandos do Background Script
- Manipula o DOM da página web
- Envia resultados de volta para o Background Script

## Fluxos de Dados

### Fluxo de Gerenciamento de Prompts

1. **Adicionar Prompt**:
   ```
   Popup (UI) → popup.js → chrome.storage.local → Atualização da UI
   ```

2. **Editar Prompt**:
   ```
   Popup (UI) → popup.js → chrome.storage.local → Atualização da UI
   ```

3. **Excluir Prompt**:
   ```
   Popup (UI) → popup.js → chrome.storage.local → Atualização da UI
   ```

4. **Buscar Prompts**:
   ```
   Popup (UI) → popup.js → Filtro Local → Atualização da UI
   ```

### Fluxo de Injeção de Prompts via Popup

1. **Injeção Iniciada pelo Usuário**:
   ```
   Popup (UI) → popup.js → chrome.runtime.sendMessage → background.js → chrome.tabs.sendMessage → content.js → Injeção no DOM
   ```

2. **Processamento de Variáveis**:
   ```
   Popup (UI) → Coleta de Valores → popup.js → chrome.runtime.sendMessage → background.js → chrome.tabs.sendMessage → content.js → Substituição de Variáveis → Injeção no DOM
   ```

### Fluxo de Injeção de Prompts via AHK

1. **Injeção Iniciada por Script Externo**:
   ```
   AutoHotkey → chrome.runtime.onMessageExternal → background.js → chrome.storage.local → background.js → chrome.tabs.sendMessage → content.js → Injeção no DOM
   ```

### Fluxo de Configuração

1. **Atualização de Configurações**:
   ```
   Popup (UI) → popup.js → chrome.storage.local → chrome.runtime.sendMessage → background.js → Atualização de Estado
   ```

2. **Exportação de Prompts**:
   ```
   Popup (UI) → popup.js → chrome.storage.local → Conversão para JSON → Download do Arquivo
   ```

3. **Importação de Prompts**:
   ```
   Popup (UI) → Seleção de Arquivo → popup.js → Parsing do JSON → chrome.storage.local → Atualização da UI
   ```

## Modelo de Dados

### Estrutura de Prompts

```javascript
{
  id: "string", // Identificador único do prompt
  title: "string", // Título do prompt
  text: "string", // Texto do prompt (pode conter variáveis)
  tags: ["string"], // Tags para categorização
  category: "string", // Categoria do prompt
  files: [ // Arquivos de knowledge base
    {
      name: "string", // Nome do arquivo
      content: "string", // Conteúdo do arquivo (base64 ou texto)
      type: "string" // Tipo MIME do arquivo
    }
  ],
  createdAt: "number", // Timestamp de criação
  updatedAt: "number" // Timestamp de atualização
}
```

### Estrutura de Configurações

```javascript
{
  sapGenerativeAiUrl: "string", // URL do SAP Generative AI
  storageType: "string", // Tipo de armazenamento (local, sync, etc.)
  theme: "string", // Tema da interface (light, dark, auto)
  defaultCategory: "string", // Categoria padrão para novos prompts
  customSettings: { // Configurações adicionais
    // Pares chave-valor para configurações personalizadas
  }
}
```

### Armazenamento

**Chrome Storage Local**:
- `prompts`: Array de objetos de prompt
- `config`: Objeto de configuração
- `lastSync`: Timestamp da última sincronização (para uso futuro)

## Decisões de Arquitetura

### Manifest V3

**Decisão**: Utilizar Manifest V3 para a extensão.

**Justificativa**:
- Conformidade com as diretrizes mais recentes do Chrome
- Melhor segurança e isolamento
- Preparação para o futuro (V2 será descontinuado)

**Implicações**:
- Limitações no uso de background scripts persistentes
- Necessidade de adaptar a comunicação para service workers
- Restrições em algumas APIs anteriormente disponíveis

### Armazenamento Local

**Decisão**: Utilizar `chrome.storage.local` para persistência de dados.

**Justificativa**:
- Dados acessíveis apenas pela extensão
- Não requer permissões adicionais
- Suporte a objetos complexos
- Não há necessidade de sincronização entre dispositivos na versão atual

**Implicações**:
- Dados limitados ao dispositivo atual
- Limitação de tamanho (5MB por padrão)
- Necessidade de gerenciar manualmente exportação/importação

### Comunicação Baseada em Mensagens

**Decisão**: Utilizar o sistema de mensagens do Chrome para comunicação entre componentes.

**Justificativa**:
- Padrão recomendado para extensões Chrome
- Suporte a comunicação assíncrona
- Isolamento de contextos

**Implicações**:
- Necessidade de gerenciar callbacks e promises
- Overhead de serialização/deserialização
- Complexidade adicional em fluxos que envolvem múltiplos componentes

### Detecção de Campos de Texto

**Decisão**: Utilizar seletores específicos para cada plataforma suportada, com fallback para detecção genérica.

**Justificativa**:
- Maior precisão na detecção do campo correto
- Adaptação às peculiaridades de cada plataforma
- Robustez através de fallbacks

**Implicações**:
- Necessidade de manter seletores atualizados
- Complexidade adicional no código
- Potencial para falhas se as plataformas mudarem significativamente

### Processamento de Variáveis

**Decisão**: Processar variáveis no formato `{{variavel}}` no momento da injeção.

**Justificativa**:
- Sintaxe familiar (similar a templates)
- Fácil identificação visual no texto
- Flexibilidade para diferentes tipos de substituição

**Implicações**:
- Necessidade de parser para identificar variáveis
- Interface adicional para coleta de valores
- Potencial para conflitos com conteúdo que usa sintaxe similar

## Considerações de Segurança

### Permissões Mínimas

**Implementação**:
- Solicitação apenas das permissões estritamente necessárias
- Host permissions limitadas aos domínios suportados
- Justificativa clara para cada permissão

**Benefícios**:
- Redução da superfície de ataque
- Maior confiança do usuário
- Conformidade com as melhores práticas

### Sanitização de Conteúdo

**Implementação**:
- Escape de HTML em conteúdo exibido
- Validação de formato JSON para importação/exportação
- Filtragem de caracteres potencialmente perigosos

**Benefícios**:
- Prevenção de ataques XSS
- Proteção contra injeção de código malicioso
- Integridade dos dados

### Comunicação Segura

**Implementação**:
- Validação rigorosa de mensagens recebidas
- Verificação de origem para mensagens externas
- Uso de canais seguros fornecidos pelo Chrome

**Benefícios**:
- Proteção contra spoofing e manipulação
- Isolamento de contextos
- Controle de acesso a funcionalidades

### Armazenamento Seguro

**Implementação**:
- Uso de `chrome.storage.local` para isolamento
- Não armazenamento de dados sensíveis
- Validação de dados antes do armazenamento

**Benefícios**:
- Proteção contra acesso não autorizado
- Integridade dos dados armazenados
- Conformidade com princípios de privacidade

## Limitações e Restrições

### Limitações Técnicas

1. **Tamanho de Armazenamento**:
   - `chrome.storage.local` limitado a 5MB por padrão
   - Pode ser insuficiente para grande número de prompts ou arquivos

2. **Compatibilidade de Navegadores**:
   - Atualmente limitado ao Chrome e navegadores baseados em Chromium
   - Não compatível com Firefox, Safari, etc.

3. **Detecção de Campos de Texto**:
   - Dependente da estrutura DOM das plataformas suportadas
   - Pode falhar se as plataformas mudarem significativamente

4. **Processamento de Variáveis**:
   - Limitado a substituições simples
   - Sem suporte para lógica condicional ou loops

### Restrições de Design

1. **Interface do Popup**:
   - Tamanho limitado da janela do popup
   - Necessidade de interface compacta mas funcional

2. **Background Service Worker**:
   - Tempo de vida limitado (pode ser terminado pelo navegador)
   - Necessidade de design resiliente a reinicializações

3. **Integração com AHK**:
   - Limitada pela segurança do Chrome
   - Requer protocolo de URL personalizado

4. **Permissões**:
   - Balanceamento entre funcionalidade e segurança
   - Necessidade de justificar cada permissão solicitada

## Evolução da Arquitetura

### Melhorias de Curto Prazo

1. **Modularização**:
   - Dividir arquivos grandes em módulos menores
   - Implementar sistema de importação/exportação de módulos
   - Melhorar a manutenibilidade e testabilidade

2. **Tratamento de Erros**:
   - Implementar estratégia consistente de tratamento de erros
   - Adicionar logging estruturado
   - Melhorar feedback ao usuário

3. **Configuração Centralizada**:
   - Criar sistema de configuração centralizado
   - Remover valores hardcoded
   - Facilitar adaptação a mudanças

### Melhorias de Médio Prazo

1. **Sistema de Plugins**:
   - Implementar arquitetura extensível via plugins
   - Permitir adição de novas funcionalidades sem modificar o core
   - Facilitar contribuições de terceiros

2. **Sincronização**:
   - Adicionar suporte a `chrome.storage.sync`
   - Implementar sincronização entre dispositivos
   - Gerenciar conflitos de sincronização

3. **Processamento Avançado de Variáveis**:
   - Suporte a lógica condicional
   - Suporte a loops e iterações
   - Templates mais poderosos

### Visão de Longo Prazo

1. **Arquitetura Multi-Plataforma**:
   - Adaptar para suportar múltiplos navegadores
   - Abstrair APIs específicas do Chrome
   - Implementar adaptadores para diferentes ambientes

2. **Backend Opcional**:
   - Adicionar suporte a backend para armazenamento remoto
   - Implementar autenticação e autorização
   - Permitir compartilhamento de prompts entre usuários

3. **Integração com IA**:
   - Adicionar suporte a geração e refinamento de prompts via IA
   - Implementar análise de prompts para sugestões
   - Categorização automática e tagging

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc

Este documento é uma visão viva da arquitetura e será atualizado conforme o sistema evolui e novas decisões são tomadas.