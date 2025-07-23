# Guia de Testes

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Este documento descreve a estratégia de testes, procedimentos e casos de teste para garantir a qualidade e confiabilidade da extensão mcc PromptFlow.

### Índice

1. [Estratégia de Testes](#estratégia-de-testes)
2. [Ambiente de Testes](#ambiente-de-testes)
3. [Tipos de Testes](#tipos-de-testes)
4. [Casos de Teste](#casos-de-teste)
5. [Procedimentos de Teste](#procedimentos-de-teste)
6. [Relatório de Bugs](#relatório-de-bugs)
7. [Automação de Testes](#automação-de-testes)
8. [Métricas de Qualidade](#métricas-de-qualidade)

## Estratégia de Testes

A estratégia de testes para a extensão mcc PromptFlow é baseada em uma abordagem em camadas, cobrindo desde testes unitários até testes de integração e testes de aceitação do usuário.

### Objetivos

1. **Garantir Funcionalidade**: Verificar se todas as funcionalidades da extensão operam conforme esperado
2. **Assegurar Compatibilidade**: Testar a extensão em diferentes versões do Chrome e em diferentes plataformas
3. **Validar Segurança**: Verificar se a extensão segue as melhores práticas de segurança
4. **Confirmar Usabilidade**: Avaliar a experiência do usuário e a facilidade de uso
5. **Verificar Performance**: Garantir que a extensão tenha um desempenho aceitável

### Abordagem

1. **Testes Manuais**: Para funcionalidades de UI e fluxos de usuário
2. **Testes Automatizados**: Para componentes críticos e regressão
3. **Testes de Integração**: Para verificar a interação entre componentes
4. **Testes de Compatibilidade**: Para garantir funcionamento em diferentes ambientes
5. **Testes de Segurança**: Para identificar vulnerabilidades potenciais

## Ambiente de Testes

### Configurações de Hardware

- **Desktops**: Diferentes configurações de CPU e memória
- **Notebooks**: Diferentes modelos e configurações

### Configurações de Software

- **Sistema Operacional**:
  - Windows 10/11
  - macOS (versões recentes)
  - Linux (distribuições populares)

- **Navegador**:
  - Google Chrome (versões estável, beta e dev)
  - Chromium (para testes de compatibilidade)
  - Edge (baseado em Chromium)

- **Extensões Conflitantes**:
  - Testar com outras extensões populares instaladas
  - Verificar conflitos potenciais

### Ferramentas de Teste

- **Depuração**: Chrome DevTools
- **Automação**: Selenium, Puppeteer
- **Testes Unitários**: Jest, Mocha
- **Análise Estática**: ESLint, Chrome Extension Linter

## Tipos de Testes

### Testes Unitários

Testes focados em componentes individuais da extensão:

- **Funções Utilitárias**: Funções de processamento de variáveis, sanitização, etc.
- **Manipulação de Dados**: Funções de armazenamento, recuperação e manipulação de prompts
- **Lógica de Negócio**: Regras e processamento específicos do domínio

### Testes de Integração

Testes que verificam a interação entre diferentes componentes:

- **Comunicação entre Scripts**: Background, Content e Popup
- **Interação com Storage**: Armazenamento e recuperação de dados
- **Integração com AHK**: Comunicação externa via protocolo de URL

### Testes de Interface

Testes focados na interface do usuário:

- **Renderização**: Verificar se a UI é renderizada corretamente
- **Interatividade**: Testar botões, campos, modais, etc.
- **Responsividade**: Verificar comportamento em diferentes tamanhos de janela
- **Acessibilidade**: Testar navegação por teclado, contraste, etc.

### Testes de Compatibilidade

Testes para garantir funcionamento em diferentes ambientes:

- **Versões do Chrome**: Testar em diferentes versões do navegador
- **Sistemas Operacionais**: Windows, macOS, Linux
- **Configurações de Hardware**: Diferentes especificações de máquina

### Testes de Performance

Testes para avaliar o desempenho da extensão:

- **Tempo de Carregamento**: Medir tempo de inicialização da extensão
- **Uso de Memória**: Monitorar consumo de memória durante uso
- **Responsividade da UI**: Verificar tempos de resposta da interface
- **Operações em Lote**: Testar com grande número de prompts

### Testes de Segurança

Testes para identificar vulnerabilidades potenciais:

- **Validação de Entrada**: Testar com entradas maliciosas
- **Permissões**: Verificar uso adequado de permissões
- **Sanitização**: Testar escape de HTML e outras medidas
- **Comunicação Externa**: Verificar validação de mensagens externas

## Casos de Teste

### Gerenciamento de Prompts

#### TC-001: Adicionar Novo Prompt

**Objetivo**: Verificar se um novo prompt pode ser adicionado corretamente

**Passos**:
1. Abrir o popup da extensão
2. Clicar no botão "Adicionar Novo"
3. Preencher os campos (título, texto, tags, categoria)
4. Clicar em "Salvar"

**Resultado Esperado**: O prompt é adicionado à lista e aparece na interface

#### TC-002: Editar Prompt Existente

**Objetivo**: Verificar se um prompt existente pode ser editado corretamente

**Passos**:
1. Abrir o popup da extensão
2. Clicar no ícone de edição de um prompt existente
3. Modificar os campos desejados
4. Clicar em "Salvar"

**Resultado Esperado**: As alterações são salvas e refletidas na interface

#### TC-003: Excluir Prompt

**Objetivo**: Verificar se um prompt pode ser excluído corretamente

**Passos**:
1. Abrir o popup da extensão
2. Clicar no ícone de exclusão de um prompt existente
3. Confirmar a exclusão

**Resultado Esperado**: O prompt é removido da lista e não aparece mais na interface

#### TC-004: Buscar Prompts

**Objetivo**: Verificar se a funcionalidade de busca filtra corretamente os prompts

**Passos**:
1. Abrir o popup da extensão
2. Digitar um termo de busca no campo de busca

**Resultado Esperado**: Apenas prompts que correspondem ao termo de busca são exibidos

### Variáveis Dinâmicas

#### TC-005: Definir Variáveis em Prompt

**Objetivo**: Verificar se variáveis podem ser definidas em um prompt

**Passos**:
1. Abrir o popup da extensão
2. Adicionar ou editar um prompt
3. Incluir variáveis no formato `{{variavel}}` no texto
4. Salvar o prompt

**Resultado Esperado**: O prompt é salvo com as variáveis intactas

#### TC-006: Substituir Variáveis na Injeção

**Objetivo**: Verificar se as variáveis são substituídas corretamente durante a injeção

**Passos**:
1. Abrir o popup da extensão
2. Selecionar um prompt com variáveis
3. Clicar para injetar o prompt
4. Preencher os valores das variáveis no modal
5. Confirmar a injeção

**Resultado Esperado**: O prompt é injetado com as variáveis substituídas pelos valores fornecidos

### Injeção de Prompts

#### TC-007: Injetar Prompt via Popup

**Objetivo**: Verificar se um prompt pode ser injetado via popup

**Passos**:
1. Abrir uma plataforma suportada (ChatGPT, Gemini, Claude, SAP)
2. Abrir o popup da extensão
3. Selecionar um prompt
4. Clicar para injetar

**Resultado Esperado**: O texto do prompt é injetado no campo de texto da plataforma

#### TC-008: Injetar Prompt via AHK

**Objetivo**: Verificar se um prompt pode ser injetado via AutoHotkey

**Passos**:
1. Abrir uma plataforma suportada
2. Executar um script AHK que envia um comando para a extensão
3. Verificar se o prompt é injetado

**Resultado Esperado**: O texto do prompt é injetado no campo de texto da plataforma

### Knowledge Base

#### TC-009: Anexar Arquivo à Knowledge Base

**Objetivo**: Verificar se arquivos podem ser anexados a um prompt

**Passos**:
1. Abrir o popup da extensão
2. Adicionar ou editar um prompt
3. Clicar em "Adicionar Arquivo"
4. Selecionar um arquivo
5. Salvar o prompt

**Resultado Esperado**: O arquivo é anexado ao prompt e listado na interface

#### TC-010: Remover Arquivo da Knowledge Base

**Objetivo**: Verificar se arquivos podem ser removidos de um prompt

**Passos**:
1. Abrir o popup da extensão
2. Editar um prompt com arquivos anexados
3. Clicar no ícone de remoção de um arquivo
4. Salvar o prompt

**Resultado Esperado**: O arquivo é removido do prompt e não aparece mais na lista

### Configurações

#### TC-011: Alterar URL do SAP Generative AI

**Objetivo**: Verificar se a URL do SAP Generative AI pode ser alterada

**Passos**:
1. Abrir o popup da extensão
2. Clicar no botão "Configurações"
3. Alterar a URL do SAP Generative AI
4. Salvar as configurações

**Resultado Esperado**: A nova URL é salva e utilizada para injeção no SAP

#### TC-012: Exportar Prompts

**Objetivo**: Verificar se os prompts podem ser exportados corretamente

**Passos**:
1. Abrir o popup da extensão
2. Clicar no botão "Configurações"
3. Clicar em "Exportar Prompts"

**Resultado Esperado**: Um arquivo JSON contendo todos os prompts é baixado

#### TC-013: Importar Prompts

**Objetivo**: Verificar se os prompts podem ser importados corretamente

**Passos**:
1. Abrir o popup da extensão
2. Clicar no botão "Configurações"
3. Clicar em "Importar Prompts"
4. Selecionar um arquivo JSON válido

**Resultado Esperado**: Os prompts do arquivo são importados e aparecem na lista

## Procedimentos de Teste

### Testes Manuais

1. **Preparação**:
   - Instalar a extensão em um ambiente limpo
   - Configurar o ambiente conforme necessário
   - Preparar dados de teste (prompts, arquivos, etc.)

2. **Execução**:
   - Seguir os casos de teste definidos
   - Registrar resultados e observações
   - Capturar screenshots ou vídeos quando relevante

3. **Verificação**:
   - Comparar resultados com os esperados
   - Identificar discrepâncias ou problemas
   - Documentar bugs encontrados

### Testes de Regressão

1. **Quando Executar**:
   - Após correções de bugs
   - Após implementação de novas funcionalidades
   - Antes de lançamentos

2. **O Que Testar**:
   - Funcionalidades afetadas pelas mudanças
   - Funcionalidades críticas
   - Áreas propensas a regressões

3. **Como Documentar**:
   - Registrar quais testes foram executados
   - Documentar resultados e problemas encontrados
   - Atualizar casos de teste conforme necessário

### Testes de Aceitação

1. **Participantes**:
   - Usuários finais
   - Stakeholders
   - Equipe de desenvolvimento

2. **Cenários**:
   - Fluxos completos de uso
   - Cenários do mundo real
   - Casos de uso específicos

3. **Feedback**:
   - Coletar impressões e sugestões
   - Identificar problemas de usabilidade
   - Avaliar satisfação geral

## Relatório de Bugs

### Formato do Relatório

Ao relatar um bug, inclua as seguintes informações:

1. **Título**: Breve descrição do problema
2. **Descrição**: Detalhes sobre o bug encontrado
3. **Passos para Reproduzir**: Sequência de ações para reproduzir o bug
4. **Resultado Atual**: O que acontece quando o bug ocorre
5. **Resultado Esperado**: O que deveria acontecer
6. **Ambiente**: Detalhes sobre o ambiente de teste
   - Versão do Chrome
   - Sistema operacional
   - Versão da extensão
7. **Severidade**: Crítica, Alta, Média, Baixa
8. **Prioridade**: Urgente, Alta, Normal, Baixa
9. **Anexos**: Screenshots, vídeos, logs, etc.

### Exemplo de Relatório

```
Título: Falha ao injetar prompt com variáveis no ChatGPT

Descrição: Ao tentar injetar um prompt que contém variáveis no ChatGPT, o texto é injetado com as variáveis não substituídas (formato {{variavel}}).

Passos para Reproduzir:
1. Abrir chat.openai.com
2. Abrir o popup da extensão
3. Selecionar um prompt que contenha variáveis (ex: "Olá {{nome}}")
4. Clicar para injetar
5. Preencher o valor da variável (ex: nome = "João")
6. Confirmar a injeção

Resultado Atual: O texto "Olá {{nome}}" é injetado no campo de texto do ChatGPT.

Resultado Esperado: O texto "Olá João" deveria ser injetado no campo de texto do ChatGPT.

Ambiente:
- Chrome 115.0.5790.170
- Windows 11
- Extensão mcc PromptFlow v1.0.0

Severidade: Média
Prioridade: Alta

Anexos: [screenshot.png]
```

## Automação de Testes

### Testes Unitários

**Ferramentas Recomendadas**:
- Jest
- Mocha + Chai

**Componentes a Testar**:
- Funções utilitárias
- Processamento de variáveis
- Manipulação de dados

**Exemplo de Teste Unitário (Jest)**:

```javascript
// Teste para a função de processamento de variáveis
describe('processVariables', () => {
  test('substitui variáveis pelos valores fornecidos', () => {
    const text = 'Olá {{nome}}, bem-vindo ao {{plataforma}}!';
    const variables = {
      nome: 'João',
      plataforma: 'ChatGPT'
    };
    
    const result = processVariables(text, variables);
    
    expect(result).toBe('Olá João, bem-vindo ao ChatGPT!');
  });
  
  test('mantém variáveis não fornecidas intactas', () => {
    const text = 'Olá {{nome}}, bem-vindo ao {{plataforma}}!';
    const variables = {
      nome: 'João'
    };
    
    const result = processVariables(text, variables);
    
    expect(result).toBe('Olá João, bem-vindo ao {{plataforma}}!');
  });
});
```

### Testes de Integração

**Ferramentas Recomendadas**:
- Puppeteer
- Selenium WebDriver
- Chrome Extension Testing Library

**Cenários a Testar**:
- Comunicação entre componentes
- Fluxos completos de uso
- Interação com o Chrome Storage

**Exemplo de Teste de Integração (Puppeteer)**:

```javascript
describe('Injeção de Prompt', () => {
  let browser;
  let page;
  
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
    
    page = await browser.newPage();
    await page.goto('https://chat.openai.com');
    // Configuração adicional...
  });
  
  afterAll(async () => {
    await browser.close();
  });
  
  test('injeta prompt no ChatGPT', async () => {
    // Abrir popup da extensão
    const extensionPopup = await getExtensionPopup(browser);
    
    // Selecionar e injetar um prompt
    await extensionPopup.click('#prompt-item-0');
    await extensionPopup.click('#inject-button');
    
    // Verificar se o texto foi injetado no ChatGPT
    const textareaValue = await page.evaluate(() => {
      return document.querySelector('#prompt-textarea').value;
    });
    
    expect(textareaValue).toBe('Texto do prompt esperado');
  });
});
```

### CI/CD para Testes

**Ferramentas Recomendadas**:
- GitHub Actions
- Travis CI
- CircleCI

**Configuração Sugerida**:
- Executar testes unitários em cada commit
- Executar testes de integração em PRs e antes de releases
- Gerar relatórios de cobertura de código

**Exemplo de Configuração (GitHub Actions)**:

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  integration-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request' || github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm ci
      - name: Run integration tests
        run: npm run test:integration
```

## Métricas de Qualidade

### Cobertura de Código

**Objetivo**: Medir a porcentagem do código coberta pelos testes

**Ferramentas**:
- Jest Coverage
- Istanbul

**Metas**:
- Cobertura de linhas: > 80%
- Cobertura de branches: > 70%
- Cobertura de funções: > 90%

### Densidade de Bugs

**Objetivo**: Medir a quantidade de bugs por linha de código ou por funcionalidade

**Cálculo**:
- Bugs por 1000 linhas de código
- Bugs por funcionalidade

**Metas**:
- < 1 bug por 1000 linhas de código
- < 0.5 bugs por funcionalidade

### Tempo Médio de Resolução

**Objetivo**: Medir o tempo médio para resolver bugs reportados

**Cálculo**:
- Tempo entre relatório do bug e correção

**Metas**:
- Bugs críticos: < 24 horas
- Bugs de alta prioridade: < 3 dias
- Bugs de média prioridade: < 7 dias
- Bugs de baixa prioridade: < 30 dias

### Satisfação do Usuário

**Objetivo**: Medir a satisfação dos usuários com a extensão

**Métodos**:
- Pesquisas de satisfação
- Feedback direto
- Avaliações na Chrome Web Store

**Metas**:
- Avaliação média > 4.5/5
- > 90% de feedback positivo

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc

Este documento é um guia vivo e será atualizado conforme novos testes são desenvolvidos e a extensão evolui.