// Content Script - Executa nas páginas dos sites suportados
// Responsável por detectar textareas e injetar prompts

// Estado do content script
let isInitialized = false;
let targetTextarea = null;
let extensionButton = null;

// Inicialização
function initialize() {
    if (isInitialized) return;
    
    console.log('mcc PromptFlow: Inicializando content script em', window.location.hostname);
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupContentScript);
    } else {
        setupContentScript();
    }
    
    isInitialized = true;
}

// Configurar content script
function setupContentScript() {
    // Detectar e monitorar textarea principal
    detectAndMonitorTextarea();
    
    // Configurar listener para mensagens do background
    setupMessageListener();
    
    console.log('mcc PromptFlow: Content script configurado');
}

// Detectar textarea principal baseado no site
function detectAndMonitorTextarea() {
    const hostname = window.location.hostname;
    let selectors = [];
    
    // Seletores específicos para cada site
    switch (hostname) {
        case 'chat.openai.com':
            selectors = [
                '#prompt-textarea',
                'textarea[placeholder*="Message"]',
                'textarea[data-id="root"]',
                'div[contenteditable="true"][data-id="root"]',
                'textarea'
            ];
            break;
            
        case 'gemini.google.com':
            selectors = [
                'div[contenteditable="true"][data-placeholder]',
                'textarea[placeholder*="Enter a prompt"]',
                'div[contenteditable="true"]',
                'textarea'
            ];
            break;
            
        case 'claude.ai':
            selectors = [
                'div[contenteditable="true"][placeholder]',
                'textarea[placeholder*="Talk to Claude"]',
                'div[contenteditable="true"]',
                'textarea'
            ];
            break;
            
        case 'sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com':
            selectors = [
                'textarea.ace_text-input',
                'div.ace_content',
                'div[contenteditable="true"]',
                'textarea'
            ];
            break;
            
        default:
            // Fallback genérico
            selectors = [
                'textarea',
                'div[contenteditable="true"]',
                'input[type="text"]'
            ];
    }
    
    // Tentar encontrar textarea
    findTextarea(selectors);
    
    // Monitorar mudanças no DOM (para SPAs)
    const observer = new MutationObserver(() => {
        if (!targetTextarea || !document.contains(targetTextarea)) {
            findTextarea(selectors);
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Encontrar textarea usando seletores
function findTextarea(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && isValidTextarea(element)) {
            setTargetTextarea(element);
            return;
        }
    }
    
    // Se não encontrou, tentar novamente em 1 segundo
    setTimeout(() => {
        if (!targetTextarea) {
            findTextarea(selectors);
        }
    }, 1000);
}

// Verificar se elemento é uma textarea válida
function isValidTextarea(element) {
    // Verificar se é visível
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
    }
    
    // Verificar se tem tamanho razoável
    const rect = element.getBoundingClientRect();
    if (rect.width < 100 || rect.height < 30) {
        return false;
    }
    
    // Verificar se não está desabilitado
    if (element.disabled || element.readOnly) {
        return false;
    }
    
    return true;
}

// Definir textarea alvo e adicionar botão
function setTargetTextarea(textarea) {
    if (targetTextarea === textarea) return;
    
    targetTextarea = textarea;
    console.log('mcc PromptFlow: Textarea detectada', textarea);
    
    // Remover botão anterior se existir
    if (extensionButton) {
        extensionButton.remove();
    }
    
    // Adicionar botão da extensão
    addExtensionButton();
}

// Adicionar botão/ícone da extensão
function addExtensionButton() {
    if (!targetTextarea) return;
    
    // Criar botão
    extensionButton = document.createElement('button');
    extensionButton.innerHTML = '🚀';
    extensionButton.title = 'mcc PromptFlow - Abrir extensão';
    extensionButton.style.cssText = `
        position: absolute;
        z-index: 10000;
        width: 32px;
        height: 32px;
        border: 2px solid #007bff;
        border-radius: 50%;
        background: #007bff;
        color: white;
        font-size: 16px;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
    `;
    
    // Hover effect
    extensionButton.addEventListener('mouseenter', () => {
        extensionButton.style.transform = 'scale(1.1)';
        extensionButton.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    });
    
    extensionButton.addEventListener('mouseleave', () => {
        extensionButton.style.transform = 'scale(1)';
        extensionButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    });
    
    // Click para abrir popup
    extensionButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Enviar mensagem para abrir popup
        chrome.runtime.sendMessage({ action: 'openPopup' }).catch(() => {
            // Fallback: tentar abrir via chrome.action
            console.log('Abrindo popup via fallback');
        });
    });
    
    // Posicionar botão
    positionButton();
    
    // Adicionar ao DOM
    document.body.appendChild(extensionButton);
    
    // Reposicionar quando textarea muda de tamanho
    const resizeObserver = new ResizeObserver(() => {
        positionButton();
    });
    resizeObserver.observe(targetTextarea);
    
    // Reposicionar no scroll
    window.addEventListener('scroll', positionButton);
    window.addEventListener('resize', positionButton);
}

// Posicionar botão próximo à textarea
function positionButton() {
    if (!extensionButton || !targetTextarea) return;
    
    const rect = targetTextarea.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    // Posicionar no canto superior direito da textarea
    extensionButton.style.left = (rect.right + scrollX - 40) + 'px';
    extensionButton.style.top = (rect.top + scrollY + 8) + 'px';
}

// Configurar listener para mensagens do background
function setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('Content script recebeu mensagem:', message);
        
        switch (message.action) {
            case 'injectPrompt':
                handlePromptInjection(message.text);
                sendResponse({ success: true });
                break;
                
            case 'ping':
                sendResponse({ success: true, status: 'ready' });
                break;
                
            case 'automatePrompt':
                // Verificar se estamos na página do SAP Generative AI
                console.log('Content script recebeu solicitação de automação');
                
                // Verificar se o script de automação está disponível
                if (typeof window.automatePromptUsage === 'function') {
                    console.log('Função automatePromptUsage encontrada, chamando diretamente');
                    // Se a função está disponível, chamar diretamente
                    window.automatePromptUsage(message.promptId)
                        .then(result => sendResponse(result))
                        .catch(error => sendResponse({ success: false, error: error.message }));
                } else {
                    console.warn('Função automatePromptUsage não encontrada');
                    // Informar que o script de automação não está disponível
                    sendResponse({ 
                        success: false, 
                        error: 'Script de automação não carregado. Por favor, tente novamente.' 
                    });
                }
                break;
                
            default:
                console.warn('Ação não reconhecida:', message.action);
                sendResponse({ success: false, error: 'Ação não reconhecida' });
        }
        
        return true; // Indica resposta assíncrona
    });
}

// Injetar prompt na textarea com substituição de variáveis
async function handlePromptInjection(promptText) {
    try {
        console.log('Iniciando injeção de prompt:', promptText.substring(0, 50) + '...');
        
        if (!targetTextarea) {
            throw new Error('Textarea não encontrada');
        }
        
        // Processar variáveis no prompt
        const processedText = await processPromptVariables(promptText);
        
        // Injetar texto na textarea
        await injectTextIntoTextarea(processedText);
        
        console.log('Prompt injetado com sucesso');
        
    } catch (error) {
        console.error('Erro ao injetar prompt:', error);
        alert('Erro ao injetar prompt: ' + error.message);
    }
}

// Processar variáveis {{variavel}} no prompt
async function processPromptVariables(text) {
    // Encontrar todas as variáveis no formato {{variavel}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = [];
    let match;
    
    while ((match = variableRegex.exec(text)) !== null) {
        const variableName = match[1].trim();
        if (!variables.includes(variableName)) {
            variables.push(variableName);
        }
    }
    
    // Se não há variáveis, retornar texto original
    if (variables.length === 0) {
        return text;
    }
    
    // Solicitar valores para cada variável
    let processedText = text;
    
    for (const variable of variables) {
        const value = prompt(`Insira o valor para: ${variable}`);
        
        // Se usuário cancelou, interromper processo
        if (value === null) {
            throw new Error('Injeção cancelada pelo usuário');
        }
        
        // Substituir todas as ocorrências da variável
        const variablePattern = new RegExp(`\\{\\{\\s*${variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\}\\}`, 'g');
        processedText = processedText.replace(variablePattern, value || '');
    }
    
    return processedText;
}

// Injetar texto na textarea
async function injectTextIntoTextarea(text) {
    if (!targetTextarea) {
        throw new Error('Textarea não encontrada');
    }
    
    // Focar na textarea
    targetTextarea.focus();
    
    // Aguardar um pouco para garantir foco
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Diferentes métodos dependendo do tipo de elemento
    if (targetTextarea.tagName.toLowerCase() === 'textarea' || targetTextarea.tagName.toLowerCase() === 'input') {
        // Textarea ou input tradicional
        const currentValue = targetTextarea.value || '';
        const newValue = currentValue + (currentValue ? '\n\n' : '') + text;
        
        targetTextarea.value = newValue;
        
        // Posicionar cursor no final
        targetTextarea.selectionStart = targetTextarea.selectionEnd = newValue.length;
        
    } else if (targetTextarea.contentEditable === 'true') {
        // Div contenteditable
        const currentContent = targetTextarea.textContent || '';
        const newContent = currentContent + (currentContent ? '\n\n' : '') + text;
        
        targetTextarea.textContent = newContent;
        
        // Posicionar cursor no final
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(targetTextarea);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    // Disparar eventos para notificar a aplicação
    const events = ['input', 'change', 'keyup'];
    events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        targetTextarea.dispatchEvent(event);
    });
    
    // Evento especial para React/Vue (se necessário)
    if (targetTextarea._valueTracker) {
        targetTextarea._valueTracker.setValue('');
    }
}

// Inicializar quando script carrega
initialize();

// Log para debug
console.log('mcc PromptFlow: Content script carregado em', window.location.hostname);