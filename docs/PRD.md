# Documento de Requisitos do Produto (PRD)

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

### Visão Geral

O **mcc PromptFlow** é uma extensão para navegadores Chrome/Chromium que permite aos usuários gerenciar, organizar e utilizar prompts em plataformas de IA generativa. A extensão oferece uma interface amigável para armazenar prompts e injetá-los diretamente nas interfaces de chat de várias plataformas de IA, além de contar com integração com AutoHotkey (AHK) para automação de fluxos de trabalho.

### Objetivos do Produto

1. **Simplificar o gerenciamento de prompts**: Permitir que usuários armazenem, organizem e acessem facilmente seus prompts para uso em plataformas de IA.

2. **Aumentar a produtividade**: Reduzir o tempo gasto reescrevendo prompts frequentemente utilizados.

3. **Padronizar prompts**: Garantir consistência no uso de prompts em toda a organização.

4. **Facilitar a automação**: Integrar com ferramentas de automação como AutoHotkey para criar fluxos de trabalho eficientes.

5. **Suportar múltiplas plataformas**: Funcionar com as principais plataformas de IA generativa do mercado.

### Público-Alvo

- **Usuários internos da mcc**: Funcionários que utilizam plataformas de IA generativa em suas atividades diárias.
- **Desenvolvedores**: Profissionais que utilizam IA para auxiliar no desenvolvimento de software.
- **Profissionais de conteúdo**: Redatores, marketers e criadores de conteúdo que utilizam IA para gerar textos.
- **Analistas de dados**: Profissionais que utilizam IA para análise e interpretação de dados.

### Plataformas Suportadas

- **ChatGPT** (chat.openai.com)
- **Google Gemini** (gemini.google.com)
- **Claude AI** (claude.ai)
- **SAP Generative AI** (sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com)

### Requisitos Funcionais

#### 1. Gerenciamento de Prompts

- **RF1.1**: O sistema deve permitir adicionar novos prompts com título, texto, tags e categoria.
- **RF1.2**: O sistema deve permitir editar prompts existentes.
- **RF1.3**: O sistema deve permitir excluir prompts.
- **RF1.4**: O sistema deve permitir buscar prompts por título, conteúdo, tags ou categoria.
- **RF1.5**: O sistema deve permitir organizar prompts por categorias e tags.
- **RF1.6**: O sistema deve permitir anexar arquivos como base de conhecimento aos prompts.

#### 2. Variáveis Dinâmicas

- **RF2.1**: O sistema deve permitir criar prompts com variáveis dinâmicas usando a sintaxe `{{nome_da_variavel}}`.
- **RF2.2**: O sistema deve solicitar ao usuário o preenchimento das variáveis ao injetar um prompt.
- **RF2.3**: O sistema deve substituir as variáveis pelos valores fornecidos pelo usuário.

#### 3. Injeção de Prompts

- **RF3.1**: O sistema deve detectar automaticamente campos de texto em plataformas suportadas.
- **RF3.2**: O sistema deve injetar o texto do prompt no campo de texto da plataforma.
- **RF3.3**: O sistema deve processar as variáveis dinâmicas antes da injeção.

#### 4. Integração com AutoHotkey

- **RF4.1**: O sistema deve permitir a comunicação externa com scripts AutoHotkey.
- **RF4.2**: O sistema deve fornecer um mecanismo para que scripts AHK possam injetar prompts específicos.
- **RF4.3**: O sistema deve gerar código AHK para facilitar a integração.

#### 5. Backup e Restauração

- **RF5.1**: O sistema deve permitir exportar todos os prompts para um arquivo JSON.
- **RF5.2**: O sistema deve permitir importar prompts a partir de um arquivo JSON.
- **RF5.3**: O sistema deve manter a integridade dos dados durante o processo de importação/exportação.

#### 6. Configurações

- **RF6.1**: O sistema deve permitir configurar a URL do SAP Generative AI.
- **RF6.2**: O sistema deve permitir selecionar o tipo de armazenamento (atualmente apenas local).
- **RF6.3**: O sistema deve permitir restaurar as configurações padrão.

### Requisitos Não-Funcionais

#### 1. Usabilidade

- **RNF1.1**: A interface deve ser intuitiva e fácil de usar.
- **RNF1.2**: A extensão deve suportar tema escuro, adaptando-se às preferências do sistema.
- **RNF1.3**: A interface deve ser responsiva e se adaptar ao tamanho da janela.
- **RNF1.4**: A extensão deve fornecer feedback visual para ações do usuário.

#### 2. Desempenho

- **RNF2.1**: A extensão deve carregar em menos de 2 segundos.
- **RNF2.2**: A busca de prompts deve ser em tempo real, com resposta imediata.
- **RNF2.3**: A injeção de prompts deve ocorrer em menos de 1 segundo após a seleção.

#### 3. Segurança

- **RNF3.1**: A extensão deve solicitar apenas as permissões mínimas necessárias.
- **RNF3.2**: A extensão deve limitar as permissões de host apenas aos sites suportados.
- **RNF3.3**: A extensão deve realizar sanitização de dados para prevenir XSS.
- **RNF3.4**: A extensão deve validar todos os dados antes do armazenamento.

#### 4. Compatibilidade

- **RNF4.1**: A extensão deve ser compatível com Chrome/Chromium 88+.
- **RNF4.2**: A extensão deve seguir as especificações do Manifest V3.
- **RNF4.3**: A extensão deve funcionar em sistemas Windows, macOS e Linux.

#### 5. Manutenibilidade

- **RNF5.1**: O código deve seguir boas práticas de desenvolvimento.
- **RNF5.2**: O código deve ser modular e bem documentado.
- **RNF5.3**: A extensão deve incluir logs para facilitar a depuração.

### Fluxos de Usuário

#### 1. Adicionar Novo Prompt

1. Usuário clica no botão "Adicionar Novo"
2. Sistema exibe modal com formulário
3. Usuário preenche título, texto, tags e categoria
4. Usuário pode adicionar arquivos de knowledge base (opcional)
5. Usuário clica em "Salvar"
6. Sistema valida os dados
7. Sistema armazena o prompt
8. Sistema atualiza a lista de prompts

#### 2. Injetar Prompt

1. Usuário navega para uma plataforma suportada
2. Usuário abre a extensão
3. Usuário busca o prompt desejado (opcional)
4. Usuário clica no botão "Injetar" do prompt
5. Se o prompt contém variáveis, sistema exibe modal para preenchimento
6. Usuário preenche as variáveis
7. Sistema processa o prompt, substituindo as variáveis
8. Sistema injeta o texto no campo de texto da plataforma

#### 3. Integração com AHK

1. Usuário seleciona um prompt
2. Usuário clica no botão "URL AHK"
3. Sistema gera código AHK
4. Usuário copia o código
5. Usuário incorpora o código em seu script AHK
6. Ao executar o script AHK, o prompt é injetado na plataforma ativa

### Limitações e Restrições

- A extensão funciona apenas em navegadores baseados em Chromium que suportam Manifest V3.
- A integração AHK funciona apenas no Windows.
- O armazenamento atual é limitado ao storage local do navegador.
- A extensão requer permissões para acessar os sites suportados.

### Métricas de Sucesso

- **Adoção**: Número de usuários ativos da extensão.
- **Engajamento**: Frequência de uso da extensão.
- **Eficiência**: Tempo economizado na redação de prompts.
- **Satisfação**: Feedback dos usuários sobre a usabilidade da extensão.

### Roadmap Futuro

#### Versão 1.1
- Melhorias na interface do usuário
- Suporte a mais plataformas de IA
- Melhorias no sistema de variáveis dinâmicas

#### Versão 1.2
- Sincronização com serviços de armazenamento em nuvem
- Sistema de templates com lógica condicional
- Histórico de uso de prompts

#### Versão 2.0
- Compartilhamento de prompts entre usuários
- Integração direta com APIs de IA
- Suporte a extensões de outros navegadores

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc