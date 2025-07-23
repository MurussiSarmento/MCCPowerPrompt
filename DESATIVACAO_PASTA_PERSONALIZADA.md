# Desativação da Funcionalidade de Pasta Personalizada

## Resumo das Alterações

A funcionalidade de pasta personalizada foi completamente removida da extensão mcc PromptFlow para resolver problemas de compatibilidade e simplificar o uso. A extensão agora utiliza exclusivamente o armazenamento local do Chrome.

## Arquivos Modificados

### 1. popup/popup.html
- **Removido**: Opção "Pasta Personalizada" do select de tipo de armazenamento
- **Mantido**: Apenas "Armazenamento Local (Chrome)" como opção
- **Removido**: Elementos relacionados à seleção de pasta (`folderGroup`, `selectedFolder`, `chooseFolderBtn`)
- **Atualizado**: Texto de ajuda para refletir apenas o armazenamento local

### 2. popup/popup.js
- **Removidas as seguintes funções**:
  - `handleStorageTypeChange()` - Gerenciava exibição do grupo de pasta
  - `chooseFolder()` - Seleção de pasta via File System Access API
  - `loadPromptsFromFolder()` - Carregamento de prompts da pasta local
  - `savePromptsToFolder()` - Salvamento de prompts na pasta local

- **Removidas as seguintes variáveis**:
  - `folderHandle` - Handle da pasta selecionada
  - Referências DOM: `folderGroup`, `chooseFolderBtn`, `selectedFolderInput`

- **Modificadas as seguintes funções**:
  - `loadConfig()` - Força `storageType` para 'local'
  - `loadPrompts()` - Usa exclusivamente `chrome.storage.local`
  - `savePrompts()` - Usa exclusivamente `chrome.storage.local`
  - `openConfigModal()` - Remove lógica de pasta personalizada
  - `resetConfig()` - Remove configurações de pasta
  - `handleConfigFormSubmit()` - Remove validações de pasta

- **Removidos os seguintes event listeners**:
  - `storageTypeSelect.addEventListener('change', handleStorageTypeChange)`
  - `chooseFolderBtn.addEventListener('click', chooseFolder)`
  - `folderHelpBtn.addEventListener('click', ...)`

## Funcionalidades Mantidas

✅ **Exportar Prompts**: Funciona normalmente, gerando arquivo JSON para download
✅ **Importar Prompts**: Funciona normalmente, carregando prompts de arquivo JSON
✅ **Armazenamento Local**: Todos os prompts são salvos no `chrome.storage.local`
✅ **Todas as outras funcionalidades**: Adicionar, editar, excluir, buscar prompts

## Benefícios da Mudança

1. **Simplicidade**: Interface mais limpa e fácil de usar
2. **Compatibilidade**: Elimina problemas com File System Access API
3. **Confiabilidade**: Sem erros de permissão ou acesso a pastas
4. **Manutenção**: Código mais simples e fácil de manter

## Migração de Dados

Usuários que utilizavam pasta personalizada podem:
1. Exportar seus prompts usando a função "Exportar Prompts"
2. Os prompts serão automaticamente migrados para o armazenamento local
3. Usar "Importar Prompts" se necessário para restaurar backups

## Data da Modificação

**Data**: 22 de Janeiro de 2025
**Motivo**: Resolver problema "Operação cancelada pelo usuário" e simplificar a extensão
**Status**: ✅ Concluído - Funcionalidades de exportar/importar testadas e funcionando