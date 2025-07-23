# Guia de Contribuição

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Obrigado por considerar contribuir para o mcc PromptFlow! Este documento fornece diretrizes e instruções para contribuir com o desenvolvimento da extensão.

### Índice

1. [Código de Conduta](#código-de-conduta)
2. [Como Começar](#como-começar)
3. [Ambiente de Desenvolvimento](#ambiente-de-desenvolvimento)
4. [Fluxo de Trabalho](#fluxo-de-trabalho)
5. [Padrões de Código](#padrões-de-código)
6. [Testes](#testes)
7. [Documentação](#documentação)
8. [Submissão de Pull Requests](#submissão-de-pull-requests)
9. [Relatório de Bugs](#relatório-de-bugs)
10. [Sugestão de Melhorias](#sugestão-de-melhorias)

### Código de Conduta

Este projeto segue um código de conduta que todos os contribuidores devem respeitar. Por favor, leia o [Código de Conduta](CODE_OF_CONDUCT.md) antes de contribuir.

### Como Começar

1. **Fork do repositório**: Faça um fork do repositório para sua conta GitHub.
2. **Clone o repositório**: Clone o fork para sua máquina local.
   ```bash
   git clone https://github.com/seu-usuario/mcc-promptflow.git
   cd mcc-promptflow
   ```
3. **Adicione o upstream**: Configure o repositório original como upstream.
   ```bash
   git remote add upstream https://github.com/mcc/mcc-promptflow.git
   ```

### Ambiente de Desenvolvimento

#### Requisitos

- Chrome/Chromium 88+
- Editor de código (recomendado: Visual Studio Code)
- Git

#### Configuração

1. **Instalar a extensão no Chrome**:
   - Abra o Chrome e vá para `chrome://extensions/`
   - Ative o "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta da extensão

2. **Desenvolvimento**:
   - Edite os arquivos conforme necessário
   - Para testar as alterações, atualize a extensão no Chrome:
     - Vá para `chrome://extensions/`
     - Clique no ícone de atualização (↻) na extensão
     - Ou clique no botão "Atualizar" no card da extensão

### Fluxo de Trabalho

1. **Crie uma branch**: Crie uma branch para sua contribuição.
   ```bash
   git checkout -b feature/nome-da-feature
   ```
   ou
   ```bash
   git checkout -b fix/nome-do-bug
   ```

2. **Faça suas alterações**: Implemente suas alterações seguindo os padrões de código.

3. **Commit das alterações**: Faça commit das suas alterações com mensagens claras.
   ```bash
   git commit -m "feat: adiciona suporte para nova plataforma X"
   ```
   ou
   ```bash
   git commit -m "fix: corrige detecção de textarea no site Y"
   ```

4. **Push para o fork**: Envie suas alterações para o seu fork.
   ```bash
   git push origin feature/nome-da-feature
   ```

5. **Crie um Pull Request**: Abra um Pull Request do seu fork para o repositório original.

### Padrões de Código

#### Estilo de Código

- Use 2 espaços para indentação
- Use ponto e vírgula no final das declarações
- Use aspas simples para strings
- Siga o estilo camelCase para nomes de variáveis e funções
- Use comentários para explicar código complexo

#### Convenções de Commit

Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Alterações na documentação
- `style`: Alterações que não afetam o significado do código (espaços em branco, formatação, etc)
- `refactor`: Refatoração de código
- `perf`: Melhorias de desempenho
- `test`: Adição ou correção de testes
- `chore`: Alterações no processo de build ou ferramentas auxiliares

Exemplo:
```
feat: adiciona suporte para plataforma Bard
```

### Testes

#### Testes Manuais

Antes de submeter um Pull Request, teste manualmente suas alterações:

1. **Funcionalidade básica**: Verifique se a extensão ainda funciona corretamente
2. **Novas funcionalidades**: Teste completamente qualquer nova funcionalidade
3. **Correções de bugs**: Verifique se o bug foi realmente corrigido
4. **Regressão**: Verifique se suas alterações não quebraram outras funcionalidades
5. **Plataformas suportadas**: Teste em todas as plataformas afetadas pelas alterações

#### Testes Automatizados (Futuros)

No futuro, implementaremos testes automatizados. Por enquanto, concentre-se em testes manuais completos.

### Documentação

- Atualize a documentação quando adicionar, alterar ou remover funcionalidades
- Mantenha o README.md atualizado
- Documente novas funcionalidades nos arquivos de documentação apropriados
- Use comentários no código para explicar partes complexas

### Submissão de Pull Requests

1. **Título**: Use um título claro e descritivo seguindo as convenções de commit
2. **Descrição**: Inclua uma descrição detalhada das alterações
3. **Referências**: Referencie issues relacionadas usando `#numero-da-issue`
4. **Checklist**: Inclua uma checklist do que foi feito/testado

Exemplo de descrição de PR:
```
## Descrição
Adiciona suporte para a plataforma Bard (Google AI).

## Alterações
- Adiciona detecção de textarea no Bard
- Adiciona seletores específicos para o Bard
- Atualiza a documentação

## Issues relacionadas
Resolve #42

## Checklist
- [x] Testado no Chrome
- [x] Documentação atualizada
- [x] Código segue os padrões do projeto
```

### Relatório de Bugs

Se encontrar um bug, crie uma issue com as seguintes informações:

1. **Título**: Descrição concisa do problema
2. **Descrição**: Descrição detalhada do bug
3. **Passos para reproduzir**: Lista numerada de passos para reproduzir o bug
4. **Comportamento esperado**: O que deveria acontecer
5. **Comportamento atual**: O que está acontecendo
6. **Ambiente**: Versão do Chrome, sistema operacional, etc
7. **Screenshots**: Se aplicável

### Sugestão de Melhorias

Para sugerir melhorias, crie uma issue com as seguintes informações:

1. **Título**: Descrição concisa da melhoria
2. **Descrição**: Descrição detalhada da melhoria
3. **Motivação**: Por que esta melhoria é necessária/útil
4. **Implementação sugerida**: Se tiver ideias sobre como implementar
5. **Alternativas consideradas**: Outras abordagens que poderiam ser usadas

---

Agradecemos sua contribuição para tornar o mcc PromptFlow melhor! Se tiver dúvidas, não hesite em entrar em contato com a equipe de desenvolvimento.

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc