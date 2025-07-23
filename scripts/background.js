// Background script - Service Worker para Manifest V3
// Este é o orquestrador principal da extensão

// ===============================
// Sistema de Internacionalização
// ===============================

/**
 * Obtém o idioma atual do usuário
 * Prioridade: 1. Configuração salva, 2. Idioma do navegador, 3. Padrão (pt-BR)
 */
async function getCurrentLanguage() {
    try {
        const result = await chrome.storage.local.get(['language']);
        if (result.language) {
            return result.language;
        }
        
        // Se não há configuração salva, detectar idioma do navegador
        const browserLang = chrome.i18n.getUILanguage();
        
        // Mapear idiomas suportados (usando formato de diretório)
        const supportedLanguages = ['pt_BR', 'en', 'es', 'fr'];
        
        // Tentar encontrar correspondência exata
        if (supportedLanguages.includes(browserLang)) {
            return browserLang;
        }
        
        // Tentar encontrar correspondência por código de idioma (ex: en-US -> en)
        const langCode = browserLang.split('-')[0];
        
        // Mapeamento especial para português
        if (langCode === 'pt') {
            return 'pt_BR';
        }
        
        const mappedLang = supportedLanguages.find(lang => lang.startsWith(langCode));
        
        if (mappedLang) {
            return mappedLang;
        }
        
        // Padrão para português brasileiro
        return 'pt_BR';
    } catch (error) {
        console.error('Erro ao detectar idioma:', error);
        return 'pt_BR';
    }
}

/**
 * Define o idioma da extensão
 */
async function setLanguage(language) {
    try {
        await chrome.storage.local.set({ language: language });
        console.log('Idioma definido para:', language);
        
        // Notificar todas as abas abertas sobre mudança de idioma
        const tabs = await chrome.tabs.query({});
        tabs.forEach(tab => {
            try {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'languageChanged',
                    language: language
                });
            } catch (error) {
                // Ignora erros para abas que não têm content script
            }
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao definir idioma:', error);
        return false;
    }
}

/**
 * Função auxiliar para obter mensagem traduzida com fallback
 */
function getI18nMessage(key, substitutions = null) {
    try {
        const message = chrome.i18n.getMessage(key, substitutions);
        return message || key; // Retorna a chave se não encontrar tradução
    } catch (error) {
        console.error('Erro ao obter mensagem i18n:', key, error);
        return key;
    }
}

// Listener para mensagens do popup ou content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
        console.log(getI18nMessage('background_received_message'), message);
    } catch (error) {
        console.log('Background recebeu mensagem:', message);
    }
    
    switch (message.action) {
        case 'injectFromExternal':
            handleProtocolInjection(message.promptId, sendResponse);
            break;
            
        case 'getPromptById':
            handleGetPromptById(message.promptId, sendResponse);
            break;
            
        case 'configUpdated':
            console.log(getI18nMessage('config_updated_reloading_urls'));
            // Recarregar as URLs suportadas
            getConfiguredUrls().then(urls => {
                console.log(getI18nMessage('supported_urls_updated'), urls);
            });
            break;
            
        case 'requestFileSystemPermission':
            // A permissão fileSystem não é permitida para extensões, apenas para aplicativos empacotados
            // Informar que a API File System Access será usada sem permissão específica
            console.log(getI18nMessage('filesystem_api_no_permission'));
            sendResponse({ success: true, message: getI18nMessage('filesystem_api_no_permission_needed') });
            break;
            
        case 'automatePrompt':
            handleAutomatePrompt(message.promptId, sendResponse);
            break;
            
        case 'getCurrentLanguage':
            getCurrentLanguage().then(language => {
                sendResponse({ success: true, language: language });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            break;
            
        case 'setLanguage':
            setLanguage(message.language).then(success => {
                sendResponse({ success: success });
            }).catch(error => {
                sendResponse({ success: false, error: error.message });
            });
            break;
            
        default:
            console.warn(getI18nMessage('unrecognized_action'), message.action);
            sendResponse({ success: false, error: getI18nMessage('unrecognized_action') });
    }
    
    return true; // Indica resposta assíncrona
});

// Listener para mensagens externas (de scripts AHK)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    console.log('Background recebeu mensagem externa:', message, 'de:', sender);
    
    switch (message.action) {
        case 'insertPrompt':
            handleProtocolInjection(message.promptId, sendResponse);
            break;
            
        case 'automatePrompt':
            handleAutomatePrompt(message.promptId, sendResponse);
            break;
            
        default:
            console.warn('Ação externa não reconhecida:', message.action);
            sendResponse({ success: false, error: 'Ação não reconhecida' });
    }
    
    return true; // Indica resposta assíncrona
});

/**
 * Manipula a automação de prompts no SAP Generative AI
 */
async function handleAutomatePrompt(promptId, sendResponse) {
    try {
        console.log(getI18nMessage('starting_automation_for_prompt'), promptId);
        
        // 1. Buscar prompt no storage
        const prompt = await getPromptFromStorage(promptId);
        if (!prompt) {
            console.error(getI18nMessage('prompt_not_found_error'), promptId);
            if (sendResponse) sendResponse({ success: false, error: getI18nMessage('prompt_not_found') });
            return;
        }
        
        console.log(getI18nMessage('prompt_found'), prompt.title);
        
        // 2. Verificar se já existe uma aba com o SAP Generative AI aberta
        const result = await chrome.storage.local.get(['config']);
        const config = result.config || {};
        const sapGenAiUrl = config.sapGenAiUrl || 'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/aic/index.html';
        
        // Buscar todas as abas abertas
        const tabs = await chrome.tabs.query({});
        
        // Verificar se alguma aba corresponde à URL do SAP Generative AI
        let sapTab = tabs.find(tab => tab.url && tab.url.startsWith(sapGenAiUrl.split('#')[0]));
        
        if (sapTab) {
            // Se já existe uma aba aberta, ativar ela
            await chrome.tabs.update(sapTab.id, { active: true });
        } else {
            // Se não existe, abrir nova aba
            sapTab = await chrome.tabs.create({ url: sapGenAiUrl });
            
            // Aguardar um tempo para a página carregar
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
        
        // 3. Verificar se o script já foi injetado e injetar apenas se necessário
        try {
            // Primeiro, verificar se o script já foi injetado
            const checkResult = await chrome.scripting.executeScript({
                target: { tabId: sapTab.id },
                func: () => window.sapAutomationScriptInjected === true
            });
            
            const scriptAlreadyInjected = checkResult[0]?.result === true;
            
            if (!scriptAlreadyInjected) {
                console.log('Injetando script de automação...');
                await chrome.scripting.executeScript({
                    target: { tabId: sapTab.id },
                    files: ['scripts/sapai-automation.js']
                });
                
                // Marcar o script como injetado
                await chrome.scripting.executeScript({
                    target: { tabId: sapTab.id },
                    func: () => { window.sapAutomationScriptInjected = true; }
                });
            } else {
                console.log('Script de automação já injetado, pulando injeção');
            }
        } catch (error) {
            console.error('Erro ao verificar/injetar script:', error);
            // Em caso de erro, tentar injetar o script de qualquer forma
            await chrome.scripting.executeScript({
                target: { tabId: sapTab.id },
                files: ['scripts/sapai-automation.js']
            });
        }
        
        // 4. Aguardar um pouco para o script carregar
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 5. Enviar mensagem para o script de automação
        await chrome.tabs.sendMessage(sapTab.id, {
            action: 'automatePrompt',
            promptId: promptId
        });
        
        console.log('Automação iniciada com sucesso');
        if (sendResponse) sendResponse({ success: true, message: 'Automação iniciada com sucesso' });
        
    } catch (error) {
        console.error('Erro durante automação:', error);
        showNotification('Erro', 'Falha ao automatizar prompt');
        if (sendResponse) sendResponse({ success: false, error: error.message || 'Falha ao automatizar prompt' });
    }
}

/**
 * Obtém as URLs configuradas do storage
 * Se não existirem, retorna as URLs padrão
 */
async function getConfiguredUrls() {
    try {
        const result = await chrome.storage.local.get(['config']);
        const config = result.config || {};
        
        // URLs padrão
        const defaultUrls = [
            'https://chat.openai.com/*',
            'https://gemini.google.com/*',
            'https://claude.ai/*'
        ];
        
        // Verificar se existe URL do SAP Generative AI configurada
        if (config.sapGenAiUrl) {
            // Adicionar URL do SAP Generative AI
            const sapUrl = config.sapGenAiUrl.endsWith('/*') ? 
                config.sapGenAiUrl : 
                `${config.sapGenAiUrl}/*`;
                
            return [...defaultUrls, sapUrl];
        }
        
        // Se não existe configuração, adicionar URL padrão do SAP Generative AI
        return [...defaultUrls, 'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/*'];
    } catch (error) {
        console.error('Erro ao obter URLs configuradas:', error);
        return [
            'https://chat.openai.com/*',
            'https://gemini.google.com/*',
            'https://claude.ai/*',
            'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/*'
        ];
    }
}

// Nota: O listener para mensagens externas já está definido acima

/**
 * Fluxo principal: Injeta prompt via comunicação externa ou popup
 * 1. Recebe promptId do popup.js ou mensagem externa
 * 2. Busca o prompt no storage
 * 3. Encontra aba ativa compatível
 * 4. Envia prompt para content.js da aba
 */
async function handleProtocolInjection(promptId, sendResponse) {
    try {
        console.log('Iniciando injeção para prompt:', promptId);
        
        // 1. Buscar prompt no storage
        const prompt = await getPromptFromStorage(promptId);
        if (!prompt) {
            console.error(getI18nMessage('prompt_not_found_error'), promptId);
            if (sendResponse) sendResponse({ success: false, error: getI18nMessage('prompt_not_found') });
            return;
        }
        
        console.log(getI18nMessage('prompt_found'), prompt.title);
        
        // 2. Encontrar aba ativa compatível
        const targetTab = await findCompatibleActiveTab();
        if (!targetTab) {
            console.error('Nenhuma aba compatível encontrada');
            showNotification('Erro', 'Abra uma das páginas suportadas (ChatGPT, Gemini ou Claude)');
            if (sendResponse) sendResponse({ success: false, error: 'Nenhuma aba compatível encontrada' });
            return;
        }
        
        console.log('Aba compatível encontrada:', targetTab.url);
        
        // 3. Enviar prompt para content script
        await injectPromptIntoTab(targetTab.id, prompt.text);
        
        console.log('Prompt injetado com sucesso');
        if (sendResponse) sendResponse({ success: true, message: 'Prompt injetado com sucesso' });
        
    } catch (error) {
        console.error('Erro durante injeção:', error);
        showNotification('Erro', 'Falha ao injetar prompt');
        if (sendResponse) sendResponse({ success: false, error: error.message || 'Falha ao injetar prompt' });
    }
}

/**
 * Busca prompt específico no storage
 */
async function getPromptFromStorage(promptId) {
    try {
        const result = await chrome.storage.local.get(['prompts']);
        const prompts = result.prompts || [];
        return prompts.find(prompt => prompt.id === promptId);
    } catch (error) {
        console.error('Erro ao buscar prompt no storage:', error);
        return null;
    }
}

/**
 * Encontra aba ativa que seja compatível com a extensão
 * Verifica se a URL corresponde aos host_permissions
 */
async function findCompatibleActiveTab() {
    try {
        // URLs suportadas conforme manifest.json
        const supportedUrls = await getConfiguredUrls();
        
        console.log('URLs suportadas:', supportedUrls);
        
        // Buscar todas as abas ativas
        const tabs = await chrome.tabs.query({ active: true });
        
        // Encontrar primeira aba que corresponda aos padrões suportados
        for (const tab of tabs) {
            if (isUrlSupported(tab.url, supportedUrls)) {
                return tab;
            }
        }
        
        // Se não encontrou aba ativa, buscar qualquer aba compatível
        const allTabs = await chrome.tabs.query({});
        for (const tab of allTabs) {
            if (isUrlSupported(tab.url, supportedUrls)) {
                // Ativar a aba encontrada
                await chrome.tabs.update(tab.id, { active: true });
                await chrome.windows.update(tab.windowId, { focused: true });
                return tab;
            }
        }
        
        return null;
    } catch (error) {
        console.error('Erro ao buscar aba compatível:', error);
        return null;
    }
}

/**
 * Verifica se uma URL é suportada pela extensão
 */
function isUrlSupported(url, supportedPatterns) {
    if (!url) return false;
    
    return supportedPatterns.some(pattern => {
        // Converter padrão de manifest para regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\./g, '\\.');
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(url);
    });
}

/**
 * Injeta prompt na aba especificada via content script
 */
async function injectPromptIntoTab(tabId, promptText) {
    try {
        // Verificar se o content script está carregado
        await ensureContentScriptLoaded(tabId);
        
        // Enviar mensagem para content script
        await chrome.tabs.sendMessage(tabId, {
            action: 'injectPrompt',
            text: promptText
        });
        
    } catch (error) {
        console.error('Erro ao injetar prompt na aba:', error);
        throw error;
    }
}

/**
 * Garante que o content script está carregado na aba
 */
async function ensureContentScriptLoaded(tabId) {
    try {
        // Tentar fazer ping no content script
        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (error) {
        // Se falhou, content script não está carregado
        // Injetar manualmente (fallback)
        console.log('Content script não encontrado, injetando manualmente...');
        
        try {
            await chrome.scripting.executeScript({
                target: { tabId },
                files: ['scripts/content.js']
            });
            
            // Aguardar um pouco para o script carregar
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (injectionError) {
            console.error('Erro ao injetar content script:', injectionError);
            throw new Error('Não foi possível carregar o content script');
        }
    }
}

/**
 * Handler para buscar prompt por ID (usado por content script se necessário)
 */
async function handleGetPromptById(promptId, sendResponse) {
    try {
        const prompt = await getPromptFromStorage(promptId);
        sendResponse({ success: true, prompt });
    } catch (error) {
        console.error('Erro ao buscar prompt:', error);
        sendResponse({ success: false, error: error.message });
    }
}

/**
 * Mostra notificação para o usuário
 */
function showNotification(title, message) {
    if (chrome.notifications) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: title,
            message: message
        });
    } else {
        console.log(`Notificação: ${title} - ${message}`);
    }
}

// Listener para instalação/atualização da extensão
chrome.runtime.onInstalled.addListener((details) => {
    console.log('mcc PromptFlow instalado/atualizado:', details.reason);
    
    if (details.reason === 'install') {
        // Primeira instalação - pode inicializar dados padrão se necessário
        console.log('Primeira instalação da extensão');
    }
});

// Listener para quando a extensão é iniciada
chrome.runtime.onStartup.addListener(() => {
    console.log('mcc PromptFlow iniciado');
});

// Log para debug
console.log('Background script mcc PromptFlow carregado');