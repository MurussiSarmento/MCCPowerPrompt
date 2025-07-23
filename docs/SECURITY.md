# Guia de Segurança

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Este documento descreve as considerações de segurança, melhores práticas e diretrizes para garantir o desenvolvimento e uso seguro da extensão mcc PromptFlow.

### Índice

1. [Modelo de Ameaças](#modelo-de-ameaças)
2. [Permissões e Privilégios](#permissões-e-privilégios)
3. [Armazenamento de Dados](#armazenamento-de-dados)
4. [Comunicação](#comunicação)
5. [Injeção de Conteúdo](#injeção-de-conteúdo)
6. [Validação e Sanitização](#validação-e-sanitização)
7. [Melhores Práticas para Desenvolvedores](#melhores-práticas-para-desenvolvedores)
8. [Melhores Práticas para Usuários](#melhores-práticas-para-usuários)
9. [Processo de Relatório de Vulnerabilidades](#processo-de-relatório-de-vulnerabilidades)
10. [Atualizações de Segurança](#atualizações-de-segurança)

## Modelo de Ameaças

O modelo de ameaças identifica potenciais riscos de segurança para a extensão:

### Ameaças Potenciais

1. **Acesso não autorizado a prompts armazenados**
   - Impacto: Exposição de informações potencialmente sensíveis
   - Mitigação: Armazenamento local com acesso restrito

2. **Injeção de código malicioso via prompts**
   - Impacto: Execução de código não autorizado
   - Mitigação: Sanitização de conteúdo e validação de entrada

3. **Interceptação de comunicação entre componentes**
   - Impacto: Vazamento de informações ou manipulação de dados
   - Mitigação: Comunicação segura entre componentes da extensão

4. **Exploração de permissões excessivas**
   - Impacto: Acesso não autorizado a recursos do navegador
   - Mitigação: Princípio do privilégio mínimo

5. **Manipulação de dados durante importação/exportação**
   - Impacto: Corrupção de dados ou injeção de conteúdo malicioso
   - Mitigação: Validação rigorosa de arquivos importados

## Permissões e Privilégios

A extensão segue o princípio do privilégio mínimo, solicitando apenas as permissões estritamente necessárias para seu funcionamento:

### Permissões Utilizadas

- **storage**: Para armazenar prompts e configurações localmente
- **activeTab**: Para interagir com a aba ativa (injeção de prompts)
- **scripting**: Para injetar scripts nas páginas suportadas
- **downloads**: Para exportar prompts como arquivos JSON
- **fileSystemWrite**: Para operações de arquivo (knowledge base)

### Host Permissions

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

### Justificativa das Permissões

- **storage**: Necessário para persistência de dados entre sessões
- **activeTab**: Necessário para injetar prompts no campo de texto ativo
- **scripting**: Necessário para detectar e interagir com elementos da página
- **downloads**: Necessário para exportar prompts como arquivos
- **fileSystemWrite**: Necessário para manipular arquivos de knowledge base

## Armazenamento de Dados

### Dados Armazenados

A extensão armazena os seguintes dados localmente:

1. **Prompts**: Título, texto, tags, categoria e arquivos anexados
2. **Configurações**: URL do SAP Generative AI e preferências de armazenamento

### Mecanismo de Armazenamento

- Todos os dados são armazenados no `chrome.storage.local`
- Os dados não são sincronizados entre dispositivos
- Os dados não são enviados para servidores externos

### Segurança do Armazenamento

- O `chrome.storage.local` é isolado por origem, acessível apenas pela extensão
- Os dados são armazenados no perfil do usuário do navegador
- O acesso aos dados requer as permissões apropriadas

### Retenção e Exclusão de Dados

- Os dados persistem até que o usuário os exclua manualmente
- A desinstalação da extensão remove todos os dados armazenados
- O usuário pode exportar e excluir todos os dados a qualquer momento

## Comunicação

### Comunicação Interna

A comunicação entre os componentes da extensão (popup, background, content) é realizada através da API `chrome.runtime.sendMessage` e `chrome.tabs.sendMessage`, que são mecanismos seguros fornecidos pelo Chrome.

### Comunicação Externa

A extensão suporta comunicação externa limitada para integração com AutoHotkey:

- Implementada via `chrome.runtime.onMessageExternal`
- Restrita a ações específicas (injeção de prompts)
- Validação rigorosa de mensagens recebidas

### Isolamento de Contexto

- O content script opera em um contexto isolado da página
- O background script opera em um contexto isolado do navegador
- A comunicação entre contextos é controlada e validada

## Injeção de Conteúdo

### Mecanismo de Injeção

A extensão injeta prompts em campos de texto nas plataformas suportadas:

1. O content script detecta o campo de texto apropriado
2. O texto do prompt é processado (variáveis substituídas)
3. O texto é injetado no campo usando métodos seguros (`.value` e eventos)

### Riscos de Injeção

- **Cross-Site Scripting (XSS)**: Mitigado através de sanitização
- **Injeção de Eventos**: Controlada através de eventos sintéticos seguros
- **Manipulação do DOM**: Limitada a elementos específicos e validados

### Mitigações

- Sanitização de conteúdo antes da injeção
- Uso de métodos seguros para manipulação do DOM
- Validação de elementos alvo antes da injeção

## Validação e Sanitização

### Validação de Entrada

A extensão valida todas as entradas do usuário:

- Campos de formulário (título, texto, tags, categoria)
- Variáveis dinâmicas
- Arquivos importados
- Mensagens externas

### Sanitização de Conteúdo

A extensão sanitiza conteúdo para prevenir injeção de código malicioso:

- Escape de HTML em conteúdo exibido
- Validação de formato JSON para importação/exportação
- Filtragem de caracteres potencialmente perigosos

### Validação de Arquivos

A extensão valida arquivos de knowledge base e importação:

- Verificação de tipo MIME
- Limite de tamanho
- Validação de estrutura (para arquivos JSON)

## Melhores Práticas para Desenvolvedores

### Desenvolvimento Seguro

1. **Princípio do Privilégio Mínimo**
   - Solicite apenas as permissões estritamente necessárias
   - Limite o escopo das host permissions

2. **Validação de Entrada**
   - Valide todas as entradas do usuário
   - Não confie em dados externos sem validação

3. **Sanitização de Saída**
   - Sanitize conteúdo antes de exibi-lo ou injetá-lo
   - Use métodos seguros para manipulação do DOM

4. **Comunicação Segura**
   - Valide mensagens recebidas
   - Limite a comunicação externa a ações específicas

5. **Armazenamento Seguro**
   - Não armazene dados sensíveis
   - Use mecanismos de armazenamento apropriados

### Revisão de Código

1. **Revisão de Segurança**
   - Realize revisões de segurança regulares
   - Use ferramentas de análise estática

2. **Testes de Segurança**
   - Teste cenários de abuso
   - Verifique permissões e privilégios

3. **Documentação**
   - Documente considerações de segurança
   - Mantenha um registro de decisões de segurança

## Melhores Práticas para Usuários

### Uso Seguro

1. **Verificação de Permissões**
   - Verifique as permissões solicitadas pela extensão
   - Conceda apenas as permissões necessárias

2. **Conteúdo Sensível**
   - Evite armazenar informações sensíveis em prompts
   - Tenha cuidado ao compartilhar arquivos de exportação

3. **Importação de Arquivos**
   - Importe apenas arquivos de fontes confiáveis
   - Verifique o conteúdo antes de importar

4. **Integração AHK**
   - Revise o código AHK gerado antes de usá-lo
   - Execute scripts AHK apenas de fontes confiáveis

### Relatório de Problemas

1. **Relatório de Bugs**
   - Relate bugs de segurança conforme o processo definido
   - Forneça informações detalhadas sobre o problema

2. **Atualizações**
   - Mantenha a extensão atualizada
   - Verifique regularmente por atualizações

## Processo de Relatório de Vulnerabilidades

### Relatório Responsável

Se você descobrir uma vulnerabilidade de segurança na extensão mcc PromptFlow, por favor, siga estas diretrizes para relatá-la de forma responsável:

1. **Não divulgue publicamente** a vulnerabilidade antes que ela tenha sido corrigida
2. **Envie um relatório detalhado** para a equipe de segurança em [email de segurança]
3. **Inclua passos para reproduzir** o problema
4. **Forneça informações sobre o ambiente** (navegador, versão da extensão, sistema operacional)

### Processo de Resposta

1. A equipe de segurança confirmará o recebimento do relatório em até 48 horas
2. Uma avaliação inicial será realizada para verificar a vulnerabilidade
3. A equipe trabalhará em uma correção e manterá você informado sobre o progresso
4. Após a correção, a equipe lançará uma atualização e reconhecerá sua contribuição (se desejado)

## Atualizações de Segurança

### Processo de Atualização

1. **Atualizações Regulares**
   - A extensão será atualizada regularmente para corrigir vulnerabilidades
   - As atualizações de segurança terão prioridade sobre novas funcionalidades

2. **Comunicação de Atualizações**
   - As atualizações de segurança serão comunicadas claramente
   - Notas de lançamento incluirão informações sobre correções de segurança

3. **Verificação de Atualizações**
   - O Chrome verifica automaticamente atualizações de extensões
   - Os usuários são incentivados a manter a extensão atualizada

### Histórico de Segurança

Um registro de vulnerabilidades corrigidas e atualizações de segurança será mantido e disponibilizado para referência.

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc

Este documento é uma diretriz viva e será atualizado conforme novas considerações de segurança surgirem ou as práticas recomendadas evoluírem.