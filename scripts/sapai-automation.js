// Script para automatizar o uso de prompts no SAP Generative AI
// Este script verifica se estamos no chat correto, caso contrário abre a URL configurada,
// injeta o prompt e o arquivo de knowledge base

// Seletores para o SAP Generative AI
const SAP_TEXTAREA_SELECTOR = '#__area4-inner';
const SAP_FILE_UPLOAD_BUTTON_SELECTOR = '#__xmlview0--imageUploader-fu_button-img';

// Função para verificar se estamos no chat do SAP Generative AI
async function checkIfInSapChat() {
    try {
        // Verificar se a URL atual corresponde à URL configurada
        const result = await chrome.storage.local.get(['config']);
        const config = result.config || {};
        
        // URL do SAP Generative AI
        const sapGenAiUrl = config.sapGenAiUrl || 'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/aic/index.html#/generativeaihub?workspace=sap-genai-xl&resourceGroup=default&/g/promptchat';
        
        // Verificar se a URL atual começa com a URL configurada
        const currentUrl = window.location.href;
        return currentUrl.startsWith(sapGenAiUrl.split('#')[0]);
    } catch (error) {
        console.error('Erro ao verificar URL do SAP Generative AI:', error);
        return false;
    }
}

// Função para abrir o chat do SAP Generative AI
async function openSapChat() {
    try {
        // Obter URL configurada
        const result = await chrome.storage.local.get(['config']);
        const config = result.config || {};
        
        // URL do SAP Generative AI
        const sapGenAiUrl = config.sapGenAiUrl || 'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/aic/index.html#/generativeaihub?workspace=sap-genai-xl&resourceGroup=default&/g/promptchat';
        
        // Abrir nova aba com a URL
        await chrome.tabs.create({ url: sapGenAiUrl });
        
        // Aguardar um tempo para a página carregar
        return new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
        console.error('Erro ao abrir chat do SAP Generative AI:', error);
        throw error;
    }
}

// Função para injetar prompt no textarea
async function injectPromptText(text) {
    try {
        // Aguardar o textarea estar disponível
        const textarea = await waitForElement(SAP_TEXTAREA_SELECTOR);
        
        // Focar no textarea
        textarea.focus();
        
        // Injetar texto
        textarea.value = text;
        
        // Disparar eventos para notificar a aplicação
        const events = ['input', 'change', 'keyup'];
        events.forEach(eventType => {
            const event = new Event(eventType, { bubbles: true, cancelable: true });
            textarea.dispatchEvent(event);
        });
        
        console.log('Prompt injetado com sucesso');
    } catch (error) {
        console.error('Erro ao injetar prompt:', error);
        throw error;
    }
}

// Função para fazer upload do arquivo de knowledge base
async function uploadKnowledgeBaseFile(promptId) {
    try {
        // Buscar prompt no storage
        const result = await chrome.storage.local.get(['prompts']);
        const prompts = result.prompts || [];
        const prompt = prompts.find(p => p.id === promptId);
        
        if (!prompt || !prompt.knowledgeBaseFiles || prompt.knowledgeBaseFiles.length === 0) {
            console.log('Prompt não possui arquivos de knowledge base');
            return;
        }
        
        // Aguardar o botão de upload estar disponível
        const uploadButton = await waitForElement(SAP_FILE_UPLOAD_BUTTON_SELECTOR);
        
        // Criar um arquivo temporário a partir dos dados do knowledge base
        const file = prompt.knowledgeBaseFiles[0]; // Usar o primeiro arquivo
        const blob = new Blob([file.data], { type: file.type });
        const fileObj = new File([blob], file.name, { type: file.type });
        
        // Criar um input de arquivo temporário
        const input = document.createElement('input');
        input.type = 'file';
        input.style.display = 'none';
        document.body.appendChild(input);
        
        // Criar um DataTransfer e adicionar o arquivo
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileObj);
        input.files = dataTransfer.files;
        
        // Simular clique no botão de upload
        uploadButton.click();
        
        // Aguardar um pouco para o diálogo de upload abrir
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Tentar encontrar o input de arquivo real
        const fileInputs = document.querySelectorAll('input[type="file"]');
        if (fileInputs.length > 0) {
            // Usar o último input de arquivo encontrado (provavelmente o que acabou de ser aberto)
            const realInput = fileInputs[fileInputs.length - 1];
            
            // Atribuir o arquivo ao input real
            const realDataTransfer = new DataTransfer();
            realDataTransfer.items.add(fileObj);
            realInput.files = realDataTransfer.files;
            
            // Disparar evento de change
            const changeEvent = new Event('change', { bubbles: true });
            realInput.dispatchEvent(changeEvent);
            
            console.log('Arquivo de knowledge base enviado com sucesso');
        } else {
            throw new Error('Input de arquivo não encontrado');
        }
        
        // Limpar o input temporário
        document.body.removeChild(input);
    } catch (error) {
        console.error('Erro ao fazer upload do arquivo de knowledge base:', error);
        throw error;
    }
}

// Função auxiliar para aguardar um elemento estar disponível no DOM
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        // Verificar se o elemento já existe
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        // Configurar timeout
        const timeoutId = setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout esperando pelo elemento: ${selector}`));
        }, timeout);
        
        // Observar mudanças no DOM
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                clearTimeout(timeoutId);
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// Função principal para automatizar o uso de prompts
async function automatePromptUsage(promptId) {
    try {
        // Verificar se estamos no chat do SAP Generative AI
        const isInSapChat = await checkIfInSapChat();
        
        // Se não estamos no chat, abrir nova aba
        if (!isInSapChat) {
            await openSapChat();
        }
        
        // Buscar prompt no storage
        const result = await chrome.storage.local.get(['prompts']);
        const prompts = result.prompts || [];
        const prompt = prompts.find(p => p.id === promptId);
        
        if (!prompt) {
            throw new Error('Prompt não encontrado');
        }
        
        // Injetar texto do prompt
        await injectPromptText(prompt.text);
        
        // Se o prompt tem arquivos de knowledge base, fazer upload
        if (prompt.knowledgeBaseFiles && prompt.knowledgeBaseFiles.length > 0) {
            await uploadKnowledgeBaseFile(promptId);
        }
        
        return { success: true, message: 'Prompt automatizado com sucesso' };
    } catch (error) {
        console.error('Erro ao automatizar uso de prompt:', error);
        return { success: false, error: error.message };
    }
}

// Exportar função principal
window.automatePromptUsage = automatePromptUsage;

// Listener para mensagens do background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'automatePrompt') {
        automatePromptUsage(message.promptId)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Indica resposta assíncrona
    }
});

console.log('Script de automação do SAP Generative AI carregado');