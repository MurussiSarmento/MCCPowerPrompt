# Guia de Instalação e Uso

## mcc PromptFlow - Extensão para Gerenciamento de Prompts

Este guia fornece instruções detalhadas para instalar, configurar e usar a extensão mcc PromptFlow.

### Índice

1. [Requisitos](#requisitos)
2. [Instalação](#instalação)
3. [Configuração Inicial](#configuração-inicial)
4. [Uso Básico](#uso-básico)
5. [Funcionalidades Avançadas](#funcionalidades-avançadas)
6. [Integração com AutoHotkey](#integração-com-autohotkey)
7. [Solução de Problemas](#solução-de-problemas)
8. [Perguntas Frequentes](#perguntas-frequentes)

## Requisitos

- **Navegador**: Chrome/Chromium 88+ (Edge, Brave, Opera e outros navegadores baseados em Chromium também são compatíveis)
- **Sistema Operacional**: Windows, macOS ou Linux
- **Permissões**: A extensão requer permissões para acessar os sites suportados

## Instalação

### Método 1: Instalação a partir do Repositório

1. **Clone ou baixe o repositório**
   ```bash
   git clone https://github.com/mcc/mcc-promptflow.git
   ```
   Ou baixe o ZIP do repositório e extraia para uma pasta local.

2. **Abra o Chrome e acesse a página de extensões**
   - Digite `chrome://extensions/` na barra de endereços
   - Ou vá para Menu → Mais ferramentas → Extensões

3. **Ative o Modo do desenvolvedor**
   - Ative a chave "Modo do desenvolvedor" no canto superior direito

4. **Carregue a extensão**
   - Clique no botão "Carregar sem compactação"
   - Navegue até a pasta onde você clonou/extraiu o repositório
   - Selecione a pasta raiz da extensão e clique em "Selecionar pasta"

5. **Verifique a instalação**
   - A extensão deve aparecer na lista de extensões instaladas
   - O ícone da extensão deve aparecer na barra de ferramentas do Chrome

### Método 2: Instalação a partir da Chrome Web Store (Futuro)

1. **Acesse a página da extensão na Chrome Web Store**
   - [Link para a extensão na Chrome Web Store] (a ser adicionado quando disponível)

2. **Clique em "Adicionar ao Chrome"**

3. **Confirme a instalação**
   - Clique em "Adicionar extensão" no diálogo de confirmação

4. **Verifique a instalação**
   - O ícone da extensão deve aparecer na barra de ferramentas do Chrome

## Configuração Inicial

Após a instalação, é recomendável configurar a extensão para atender às suas necessidades:

1. **Abra a extensão**
   - Clique no ícone da extensão na barra de ferramentas do Chrome

2. **Acesse as configurações**
   - Clique no ícone de engrenagem (⚙️) no canto superior direito do popup

3. **Configure a URL do SAP Generative AI** (se aplicável)
   - Se você utiliza o SAP Generative AI, insira a URL correta no campo correspondente
   - A URL padrão é `https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/aic/index.html#/generativeaihub?workspace=sap-genai-xl&resourceGroup=default&/g/promptchat`

4. **Salve as configurações**
   - Clique no botão "Salvar"

## Uso Básico

### Gerenciamento de Prompts

#### Adicionar um Novo Prompt

1. Abra a extensão clicando no ícone na barra de ferramentas
2. Clique no botão "Adicionar Novo"
3. Preencha os campos do formulário:
   - **Título**: Nome descritivo para o prompt
   - **Texto**: Conteúdo do prompt (pode incluir variáveis no formato `{{nome_da_variavel}}`)
   - **Tags**: Palavras-chave separadas por vírgula para facilitar a busca
   - **Categoria**: Grupo ao qual o prompt pertence
   - **Arquivos de Knowledge Base** (opcional): Arquivos para anexar ao prompt
4. Clique em "Salvar"

#### Editar um Prompt

1. Abra a extensão
2. Localize o prompt que deseja editar
3. Clique no botão "Editar" (ícone de lápis)
4. Modifique os campos conforme necessário
5. Clique em "Salvar"

#### Excluir um Prompt

1. Abra a extensão
2. Localize o prompt que deseja excluir
3. Clique no botão "Excluir" (ícone de lixeira)
4. Confirme a exclusão no diálogo de confirmação

#### Buscar Prompts

1. Abra a extensão
2. Digite termos de busca na caixa de pesquisa
3. A lista de prompts será filtrada em tempo real
4. A busca considera título, texto, tags e categoria

### Uso de Prompts

#### Injetar um Prompt

1. Navegue para uma plataforma suportada (ChatGPT, Gemini, Claude, SAP Generative AI)
2. Abra a extensão
3. Localize o prompt desejado
4. Clique no botão "Injetar" (ícone de seta)
5. Se o prompt contém variáveis, preencha os valores solicitados
6. O texto do prompt será inserido no campo de texto da plataforma

#### Copiar um Prompt

1. Abra a extensão
2. Localize o prompt desejado
3. Clique no botão "Copiar" (ícone de cópia)
4. O texto do prompt será copiado para a área de transferência

## Funcionalidades Avançadas

### Variáveis Dinâmicas

Você pode criar prompts com variáveis dinâmicas usando a sintaxe `{{nome_da_variavel}}`:

```
Crie um artigo sobre {{tópico}} com foco em {{público_alvo}}.
O tom deve ser {{tom}} e ter aproximadamente {{palavras}} palavras.
```

Quando você injetar este prompt, a extensão solicitará que você preencha os valores para `tópico`, `público_alvo`, `tom` e `palavras`.

### Knowledge Base

Você pode anexar arquivos como base de conhecimento aos seus prompts:

1. Ao adicionar ou editar um prompt, use o campo "Arquivos de Knowledge Base"
2. Selecione os arquivos que deseja anexar
3. Os arquivos selecionados serão exibidos abaixo do campo
4. Estes arquivos serão exportados junto com os prompts

### Backup e Restauração

#### Exportar Prompts

1. Abra a extensão
2. Clique no ícone de engrenagem (⚙️) para acessar as configurações
3. Na seção "Backup e Restauração", clique em "Exportar Prompts"
4. Um arquivo JSON será baixado contendo todos os seus prompts

#### Importar Prompts

1. Abra a extensão
2. Clique no ícone de engrenagem (⚙️) para acessar as configurações
3. Na seção "Backup e Restauração", clique em "Importar Prompts"
4. Selecione o arquivo JSON contendo os prompts
5. Confirme a importação

## Integração com AutoHotkey

A extensão pode ser integrada com AutoHotkey para automatizar a injeção de prompts:

### Gerar Código AHK

1. Abra a extensão
2. Localize o prompt desejado
3. Clique no botão "URL AHK" (ícone de código)
4. Um código AHK será gerado e copiado para a área de transferência

### Usar o Código AHK

1. Crie um novo script AutoHotkey ou adicione o código a um script existente
2. O código gerado terá a seguinte estrutura:

```autohotkey
; Código AHK para mcc PromptFlow
; ID do prompt: seu-prompt-id

#SingleInstance Force

F1::
    ; Usar comunicação externa com a extensão Chrome
    Run, chrome.exe --app="javascript:window.opener=null; window.open('', '_self'); window.close(); chrome.runtime.sendMessage('ID_DA_EXTENSAO', {action: 'insertPrompt', promptId: 'seu-prompt-id'}, function(response) { if (response && response.success) { console.log('Prompt enviado com sucesso'); } else { console.error('Erro ao enviar prompt'); } });"
    return
```

3. Substitua `F1` pela tecla de atalho desejada
4. Salve o script com extensão `.ahk`
5. Execute o script
6. Pressione a tecla de atalho definida para injetar o prompt

## Solução de Problemas

### Prompt não injeta

**Problema**: Você clica no botão "Injetar", mas o prompt não aparece no campo de texto.

**Soluções**:
1. Verifique se está em um site suportado (ChatGPT, Gemini, Claude, SAP Generative AI)
2. Recarregue a página e tente novamente
3. Verifique se o campo de texto está visível na tela
4. Tente clicar no campo de texto antes de injetar o prompt
5. Verifique se a extensão tem permissão para acessar o site

### Botão da extensão não aparece

**Problema**: O botão da extensão não aparece na barra de ferramentas do Chrome.

**Soluções**:
1. Verifique se a extensão está instalada em `chrome://extensions/`
2. Clique no ícone de quebra-cabeça na barra de ferramentas e fixe a extensão
3. Reinicie o Chrome
4. Reinstale a extensão

### Integração AHK não funciona

**Problema**: O script AHK não injeta o prompt quando a tecla de atalho é pressionada.

**Soluções**:
1. Verifique se a extensão está ativa no Chrome
2. Verifique se o ID da extensão está correto no script AHK
3. Verifique se o Chrome está aberto quando você executa o script
4. Verifique os logs do console do Chrome para erros
5. Tente executar o script como administrador

### Problemas de importação/exportação

**Problema**: Não consegue importar ou exportar prompts.

**Soluções**:
1. Verifique se o arquivo JSON de importação tem o formato correto
2. Verifique se tem permissão para baixar arquivos no navegador
3. Tente usar um arquivo JSON exportado anteriormente pela extensão
4. Verifique se há espaço suficiente no armazenamento local do navegador

## Perguntas Frequentes

### Quantos prompts posso armazenar?

O limite é determinado pelo armazenamento local do Chrome, que é de aproximadamente 5MB por domínio. Isso permite armazenar centenas de prompts de texto simples, mas o limite pode ser atingido mais rapidamente se anexar muitos arquivos de knowledge base.

### Os prompts são sincronizados entre dispositivos?

Atualmente, não. Os prompts são armazenados apenas no navegador local. Use a funcionalidade de exportar/importar para transferir prompts entre dispositivos.

### A extensão funciona offline?

Sim, a extensão funciona offline para gerenciar prompts. No entanto, para injetar prompts, você precisa estar online e acessando uma das plataformas suportadas.

### Posso compartilhar prompts com outros usuários?

Atualmente, o compartilhamento direto não é suportado. Você pode exportar seus prompts para um arquivo JSON e compartilhar este arquivo com outros usuários, que podem então importá-lo.

### A extensão coleta ou envia meus dados?

Não. A extensão armazena todos os dados localmente no seu navegador e não envia nenhuma informação para servidores externos. Os prompts e configurações são privados e permanecem no seu dispositivo.

### Como posso contribuir para o desenvolvimento?

Consulte o [Guia de Contribuição](CONTRIBUTING.md) para informações sobre como contribuir para o desenvolvimento da extensão.

---

**Documento criado em:** [Data atual]
**Última atualização:** [Data atual]
**Autor:** Equipe mcc

Se você tiver dúvidas adicionais ou precisar de suporte, entre em contato com a equipe de desenvolvimento.