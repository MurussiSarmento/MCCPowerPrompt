// Script para automatizar o uso de prompts no SAP Generative AI
// Este script verifica se estamos no chat correto, caso contrário abre a URL configurada,
// injeta o prompt e o arquivo de knowledge base

// Função para detectar automaticamente o seletor correto para o textarea
async function detectTextareaSelector() {
    console.log('Detectando automaticamente o seletor para o textarea...');
    
    // Tentar encontrar qualquer elemento de entrada de texto
    const textInputElement = await findAnyTextInputElement();
    
    if (textInputElement) {
        // Criar um seletor específico baseado no elemento encontrado
        let detectedSelector = '';
        
        if (textInputElement.id) {
            detectedSelector = `#${textInputElement.id}`;
        } else if (textInputElement.className) {
            // Converter classes em um seletor CSS
            const classes = textInputElement.className.split(' ')
                .filter(c => c.trim() !== '')
                .map(c => `.${c}`)
                .join('');
            
            if (classes) {
                detectedSelector = `${textInputElement.tagName.toLowerCase()}${classes}`;
            }
        }
        
        if (detectedSelector) {
            console.log(`Seletor detectado automaticamente: ${detectedSelector}`);
            
            // Armazenar o seletor detectado para uso futuro
            window.SAP_TEXTAREA_SELECTOR = detectedSelector;
            
            // Salvar o seletor no storage local para uso em sessões futuras
            try {
                await chrome.storage.local.set({ 'SAP_TEXTAREA_SELECTOR': detectedSelector });
                console.log('Seletor salvo no storage local');
            } catch (error) {
                console.warn('Não foi possível salvar o seletor no storage:', error);
            }
            
            return detectedSelector;
        }
    }
    
    console.log('Não foi possível detectar automaticamente o seletor');
    return null;
}

// Verificar se o script já foi inicializado para evitar duplicação
if (window.sapAutomationScriptInitialized) {
    console.log('Script de automação SAP já inicializado, pulando inicialização');
} else {
    console.log('Inicializando script de automação SAP pela primeira vez');
    
    // Definir seletores globais
    window.SAP_TEXTAREA_SELECTOR = '#__area17-inner';
    window.SAP_FILE_UPLOAD_BUTTON_SELECTOR = '#__xmlview0--imageUploader-fu_button-img';
    
    // Tentar carregar o seletor salvo anteriormente
    try {
        chrome.storage.local.get(['SAP_TEXTAREA_SELECTOR'], function(result) {
            if (result.SAP_TEXTAREA_SELECTOR) {
                console.log(`Seletor carregado do storage: ${result.SAP_TEXTAREA_SELECTOR}`);
                window.SAP_TEXTAREA_SELECTOR = result.SAP_TEXTAREA_SELECTOR;
            } else {
                // Se não houver seletor salvo, tentar detectar automaticamente
                console.log('Nenhum seletor salvo encontrado, tentando detectar automaticamente...');
                detectTextareaSelector().then(selector => {
                    if (selector) {
                        console.log(`Usando seletor detectado: ${selector}`);
                    }
                });
            }
        });
    } catch (error) {
        console.warn('Erro ao carregar seletor do storage:', error);
    }
    
    // Marcar script como inicializado
    window.sapAutomationScriptInitialized = true;
    
    console.log('Seletores SAP definidos:', {
        textarea: window.SAP_TEXTAREA_SELECTOR,
        uploadButton: window.SAP_FILE_UPLOAD_BUTTON_SELECTOR
    });
}

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
        // Lista de possíveis seletores para o textarea do SAP Generative AI
         const possibleSelectors = [
             '#__area17-inner',                // Seletor atual
             '#__area4-inner',                 // Seletor antigo
             '[id^="__area"][id$="-inner"]',   // Qualquer área com padrão SAP
             'textarea[placeholder*="Insira"]', // Textarea com placeholder em português
             'textarea[placeholder*="Ask"]',   // Textarea com placeholder em inglês
             'textarea[aria-label*="chat"]',   // Textarea com aria-label contendo "chat"
             'div[contenteditable="true"]',    // Elemento editável
             'textarea',                       // Qualquer textarea
             '#__xmlview0--chatTextArea-inner', // Outro possível seletor
             '.sapMInputBaseInner',            // Classe SAP para inputs
             '.sapMTextAreaInner',             // Classe SAP para textareas
             '[role="textbox"]',               // Elemento com role textbox
             '[aria-multiline="true"]'         // Elemento multiline
         ];
        
        // Tentar cada seletor até encontrar um que funcione
        let textarea = null;
        for (const selector of possibleSelectors) {
            try {
                console.log(`Tentando encontrar textarea com seletor: ${selector}`);
                textarea = await waitForElement(selector, 10000);
                if (textarea) {
                    console.log(`Textarea encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Seletor ${selector} não encontrou o elemento`);
            }
        }
        
        // Se não encontrou com os seletores padrão, usar a função de busca agressiva
        if (!textarea) {
            console.log('Nenhum elemento encontrado com seletores padrão, tentando busca agressiva...');
            textarea = await findAnyTextInputElement();
            
            if (!textarea) {
                throw new Error('Não foi possível encontrar o textarea em nenhum dos seletores testados');
            }
            
            console.log('Elemento encontrado com busca agressiva:', {
                tagName: textarea.tagName,
                id: textarea.id,
                className: textarea.className
            });
        }
        
        // Focar no textarea
        textarea.focus();
        
        console.log('Injetando texto no elemento:', {
            tagName: textarea.tagName,
            id: textarea.id,
            className: textarea.className,
            isContentEditable: textarea.isContentEditable
        });
        
        // Injetar texto - método depende do tipo de elemento
        if (textarea.isContentEditable) {
            // Para elementos contentEditable
            textarea.innerHTML = text;
        } else if (textarea.tagName === 'TEXTAREA' || textarea.tagName === 'INPUT') {
            // Para elementos textarea ou input
            
            // Limpar o conteúdo atual
            textarea.value = '';
            
            // Método 1: Definir value diretamente
            textarea.value = text;
            
            // Método 2: Simular digitação caractere por caractere
            try {
                for (let i = 0; i < text.length; i++) {
                    const char = text.charAt(i);
                    textarea.value += char;
                    
                    // Disparar evento de input para cada caractere
                    const inputEvent = new InputEvent('input', {
                        bubbles: true,
                        cancelable: true,
                        data: char
                    });
                    textarea.dispatchEvent(inputEvent);
                }
                console.log('Simulação de digitação concluída');
            } catch (e) {
                console.warn('Erro ao simular digitação:', e);
                // Fallback para o método direto
                textarea.value = text;
            }
        } else {
            // Tentar ambos os métodos
            try {
                textarea.value = text;
            } catch (e) {
                console.warn('Erro ao definir value, tentando innerHTML:', e);
                textarea.innerHTML = text;
            }
        }
        
        // Disparar eventos para notificar a aplicação
        const events = ['input', 'change', 'keyup'];
        events.forEach(eventType => {
            try {
                const event = new Event(eventType, { bubbles: true, cancelable: true });
                textarea.dispatchEvent(event);
                console.log(`Evento ${eventType} disparado com sucesso`);
            } catch (e) {
                console.warn(`Erro ao disparar evento ${eventType}:`, e);
            }
        });
        
        // Tentar também simular digitação
        try {
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                data: text
            });
            textarea.dispatchEvent(inputEvent);
            console.log('InputEvent disparado com sucesso');
        } catch (e) {
            console.warn('Erro ao disparar InputEvent:', e);
        }
        
        // Tentar simular pressionar Enter
        try {
            const enterEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13
            });
            textarea.dispatchEvent(enterEvent);
            console.log('Evento de tecla Enter disparado');
        } catch (e) {
            console.warn('Erro ao simular pressionar Enter:', e);
        }
        
        // Tentar encontrar e clicar no botão de envio
        try {
            // Lista de possíveis seletores para o botão de envio
            const sendButtonSelectors = [
                'button[aria-label="Enviar"]',
                'button[aria-label="Send"]',
                'button.sapMBtnInner',
                'button:has(span.sapMBtnContent)',
                'button.sapMBtn:not([disabled])',
                'button[title*="Enviar"]',
                'button[title*="Send"]',
                'button:has(svg)',
                'button[type="submit"]',
                'span.sapMBtnInner',
                'span.sapMBtnContent',
                '[role="button"]'
            ];
            
            // Tentar cada seletor
            for (const selector of sendButtonSelectors) {
                const sendButton = document.querySelector(selector);
                if (sendButton) {
                    console.log(`Botão de envio encontrado com seletor: ${selector}`);
                    sendButton.click();
                    console.log('Botão de envio clicado');
                    break;
                }
            }
        } catch (e) {
            console.warn('Erro ao clicar no botão de envio:', e);
        }
        
        console.log('Prompt injetado com sucesso');
    } catch (error) {
        console.error('Erro ao injetar prompt:', error);
        throw error;
    }
}

// Função para selecionar modelo automaticamente
async function selectModel(modelName = 'Mistral Large Instruct (2407)') {
    try {
        console.log(`Iniciando seleção automática do modelo: ${modelName}`);
        
        // Função auxiliar para encontrar elementos por texto
        const findElementByText = (selector, text) => {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (element.textContent && element.textContent.includes(text)) {
                    return element;
                }
            }
            return null;
        };
        
        // Primeiro, tentar encontrar o botão inicial para trocar modelo
        const modelNameSelectors = [
            '#__xmlview1--modelName-inner',
            '[id*="modelName-inner"]',
            'span[dir="auto"]'
        ];
        
        let modelNameButton = null;
        for (const selector of modelNameSelectors) {
            try {
                console.log(`Tentando encontrar botão de nome do modelo com seletor: ${selector}`);
                modelNameButton = document.querySelector(selector);
                if (modelNameButton) {
                    console.log(`Botão de nome do modelo encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Seletor ${selector} não encontrou o botão de nome do modelo`);
            }
        }
        
        // Se não encontrou pelos seletores diretos, tentar buscar por texto
        if (!modelNameButton) {
            console.log('Tentando encontrar botão de nome do modelo por texto...');
            modelNameButton = findElementByText('span', 'Mistral') || findElementByText('span', 'Large') || findElementByText('span', modelName);
            if (modelNameButton) {
                console.log('Botão de nome do modelo encontrado por texto');
            }
        }
        
        if (!modelNameButton) {
            console.log('Botão de nome do modelo não encontrado, tentando encontrar botão de configurações...');
        }
        
        // Tentar encontrar o botão de configurações/settings
        const settingsButtonSelectors = [
            '#__xmlview1--settingsButton-inner',
            '[id*="settingsButton-inner"]',
            'span.sapMBtnInner.sapMBtnHoverable.sapMFocusable.sapMBtnIconFirst.sapMBtnTransparent',
            'span:has(span[data-sap-ui-icon-content])',
            'button[aria-label*="settings"]',
            'button[aria-label*="configurações"]',
            'span.sapMBtnInner:has(.sapUiIcon)',
            '.sapMBtnInner.sapMBtnTransparent'
        ];
        
        let settingsButton = null;
        for (const selector of settingsButtonSelectors) {
            try {
                console.log(`Tentando encontrar botão de configurações com seletor: ${selector}`);
                settingsButton = document.querySelector(selector);
                if (settingsButton) {
                    console.log(`Botão de configurações encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Seletor ${selector} não encontrou o botão de configurações`);
            }
        }
        
        // Se encontrou o botão de nome do modelo, clicar nele primeiro
        if (modelNameButton) {
            console.log('Clicando no botão de nome do modelo...');
            modelNameButton.click();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Se encontrou o botão de configurações, clicar nele
        if (settingsButton) {
            console.log('Clicando no botão de configurações...');
            settingsButton.click();
            await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar mais tempo para o menu abrir
        } else {
            throw new Error('Botão de configurações não encontrado');
        }
        
        // Aguardar o menu de seleção de modelo aparecer
        console.log('Aguardando menu de seleção de modelo carregar...');
        
        // Aguardar um pouco mais para o menu carregar
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Tentar encontrar todos os modelos disponíveis com seletores mais amplos
        const modelSelectors = [
            'div[id*="llmGridList"]',
            'div[class*="FlexBox"]', 
            'div[data-sap-ui*="CatalogUi"]',
            '.sapMFlexBox',
            '.sapUiFlexBox',
            'div[role="option"]',
            'div[role="listitem"]',
            '.sapMListItem',
            'div[class*="Item"]',
            'div[class*="Card"]'
        ];
        
        let allModels = [];
        for (const selector of modelSelectors) {
            const elements = document.querySelectorAll(selector);
            allModels = [...allModels, ...elements];
        }
        
        console.log(`Encontrados ${allModels.length} possíveis elementos de modelo`);
        
        let modelSelected = false;
        
        // Procurar pelo modelo específico
        for (const modelElement of allModels) {
            const textContent = modelElement.textContent || modelElement.innerText || '';
            console.log(`Verificando elemento com texto: ${textContent.substring(0, 100)}...`);
            
            // Verificar se o texto contém o nome do modelo (busca mais flexível)
            const modelWords = modelName.split(' ');
            const containsAllWords = modelWords.every(word => 
                textContent.toLowerCase().includes(word.toLowerCase())
            );
            
            if (containsAllWords || textContent.includes(modelName)) {
                console.log(`✅ Modelo encontrado! Clicando no elemento...`);
                console.log(`Texto do elemento: ${textContent}`);
                modelElement.click();
                modelSelected = true;
                break;
            }
        }
        
        if (!modelSelected) {
            console.log('⚠️ Modelo não encontrado nos elementos principais, tentando busca alternativa...');
            
            // Tentar uma abordagem mais agressiva - procurar por qualquer elemento clicável que contenha o nome do modelo
            const clickableSelectors = [
                'div[role="button"]',
                'div[tabindex]',
                'span[role="button"]',
                'button',
                'a',
                '.sapMBtn',
                '.sapUiBtn',
                '[onclick]',
                '[data-sap-ui]'
            ];
            
            let allClickableElements = [];
            for (const selector of clickableSelectors) {
                const elements = document.querySelectorAll(selector);
                allClickableElements = [...allClickableElements, ...elements];
            }
            
            console.log(`Procurando em ${allClickableElements.length} elementos clicáveis...`);
            
            for (const element of allClickableElements) {
                const textContent = element.textContent || element.innerText || '';
                
                // Verificar se o elemento está visível e contém o modelo
                if (element.offsetParent !== null && textContent.trim()) {
                    const modelWords = modelName.split(' ');
                    const containsAllWords = modelWords.every(word => 
                        textContent.toLowerCase().includes(word.toLowerCase())
                    );
                    
                    if (containsAllWords || textContent.includes(modelName)) {
                        console.log(`✅ Modelo encontrado em elemento clicável alternativo!`);
                        console.log(`Elemento:`, element.tagName, element.className);
                        console.log(`Texto: ${textContent.substring(0, 100)}...`);
                        element.click();
                        modelSelected = true;
                        break;
                    }
                }
            }
        }
        
        if (modelSelected) {
            console.log(`Modelo ${modelName} selecionado com sucesso!`);
            // Aguardar um pouco para a seleção ser processada
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Tentar encontrar e clicar em um botão de confirmação/aplicar
            const confirmButtonSelectors = [
                'button.sapMBtn[type="Emphasized"]',
                'button.sapMBtnEmphasized',
                'span.sapMBtnInner',
                'button.sapMBtn'
            ];
            
            let confirmButtonFound = false;
            
            // Primeiro tentar pelos seletores diretos
            for (const selector of confirmButtonSelectors) {
                try {
                    const confirmButton = document.querySelector(selector);
                    if (confirmButton) {
                        console.log(`Botão de confirmação encontrado com seletor: ${selector}`);
                        confirmButton.click();
                        confirmButtonFound = true;
                        break;
                    }
                } catch (e) {
                    console.log(`Erro ao tentar clicar no botão de confirmação: ${e}`);
                }
            }
            
            // Se não encontrou, tentar buscar por texto
            if (!confirmButtonFound) {
                const confirmTexts = ['Aplicar', 'Apply', 'OK', 'Confirmar', 'Save', 'Salvar'];
                for (const text of confirmTexts) {
                    const confirmButton = findElementByText('button', text) || findElementByText('span', text);
                    if (confirmButton) {
                        console.log(`Botão de confirmação encontrado por texto: ${text}`);
                        // Se for um span, tentar clicar no botão pai
                        const buttonToClick = confirmButton.tagName === 'SPAN' ? confirmButton.closest('button') || confirmButton : confirmButton;
                        buttonToClick.click();
                        confirmButtonFound = true;
                        break;
                    }
                }
            }
        } else {
            console.warn(`❌ Modelo ${modelName} não encontrado na lista de modelos disponíveis`);
            
            // Diagnóstico: listar todos os elementos com texto para debug
            console.log('=== DIAGNÓSTICO: Elementos disponíveis ===');
            const allElements = document.querySelectorAll('*');
            const elementsWithText = [];
            
            for (const element of allElements) {
                const text = element.textContent || element.innerText || '';
                if (text.trim() && text.length > 5 && text.length < 200) {
                    elementsWithText.push({
                        tag: element.tagName,
                        class: element.className,
                        id: element.id,
                        text: text.trim().substring(0, 100)
                    });
                }
            }
            
            console.log('Elementos com texto encontrados:', elementsWithText.slice(0, 20)); // Mostrar apenas os primeiros 20
            console.log('=== FIM DO DIAGNÓSTICO ===');
        }
        
    } catch (error) {
        console.error('Erro ao selecionar modelo:', error);
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
        
        // Lista de possíveis seletores para o botão de upload
        const possibleUploadSelectors = [
            '#__xmlview0--imageUploader-fu_button-img',  // Seletor original
            'input[type="file"]',                     // Input de arquivo
            'button[aria-label*="upload"]',           // Botão com aria-label contendo "upload"
            'button[title*="upload"]',                // Botão com title contendo "upload"
            'button:has(svg)',                         // Botão com ícone SVG
            '#__xmlview0--fileUploader-fu_button-img', // Outro possível seletor
            'button.sapMBtn'                           // Qualquer botão SAP
        ];
        
        // Tentar cada seletor até encontrar um que funcione
        let uploadButton = null;
        for (const selector of possibleUploadSelectors) {
            try {
                console.log(`Tentando encontrar botão de upload com seletor: ${selector}`);
                uploadButton = await waitForElement(selector, 10000);
                if (uploadButton) {
                    console.log(`Botão de upload encontrado com seletor: ${selector}`);
                    break;
                }
            } catch (e) {
                console.log(`Seletor ${selector} não encontrou o botão de upload`);
            }
        }
        
        if (!uploadButton) {
            throw new Error('Não foi possível encontrar o botão de upload em nenhum dos seletores testados');
        }
        
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
function waitForElement(selector, timeout = 30000) {
    return new Promise((resolve, reject) => {
        console.log(`Aguardando elemento com seletor: ${selector} (timeout: ${timeout}ms)`);
        
        // Verificar se o elemento já existe
        const element = document.querySelector(selector);
        if (element) {
            console.log(`Elemento encontrado imediatamente: ${selector}`);
            resolve(element);
            return;
        }
        
        // Função para verificar periodicamente
        const checkInterval = 1000; // 1 segundo
        let elapsedTime = 0;
        let checkCount = 0;
        
        // Função para verificar se um elemento está visível
        const isElementVisible = (el) => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0' && 
                   el.offsetWidth > 0 && 
                   el.offsetHeight > 0;
        };
        
        const intervalId = setInterval(() => {
            const element = document.querySelector(selector);
            if (element) {
                console.log(`Elemento encontrado após ${elapsedTime}ms: ${selector}`);
                clearInterval(intervalId);
                clearTimeout(timeoutId);
                if (observer) observer.disconnect();
                resolve(element);
                return;
            }
            
            elapsedTime += checkInterval;
            checkCount++;
            console.log(`Ainda aguardando elemento ${selector} (${elapsedTime}ms decorridos)`);
            
            // Registrar todos os elementos na página para diagnóstico
            if (elapsedTime % 5000 === 0) { // A cada 5 segundos
                console.log('=== DIAGNÓSTICO DE ELEMENTOS ===');
                const allElements = document.querySelectorAll('*');
                console.log(`Total de elementos: ${allElements.length}`);
                
                // Registrar textareas e elementos editáveis
                const textareas = document.querySelectorAll('textarea');
                console.log(`Textareas encontradas: ${textareas.length}`);
                textareas.forEach((ta, i) => {
                    console.log(`Textarea ${i}:`, {
                        id: ta.id,
                        class: ta.className,
                        placeholder: ta.placeholder,
                        visible: isElementVisible(ta) ? 'sim' : 'não'
                    });
                });
                
                const editables = document.querySelectorAll('[contenteditable="true"]');
                console.log(`Elementos editáveis encontrados: ${editables.length}`);
                editables.forEach((el, i) => {
                    console.log(`Editável ${i}:`, {
                        tagName: el.tagName,
                        id: el.id || 'sem id',
                        className: el.className || 'sem classe',
                        visible: isElementVisible(el) ? 'sim' : 'não'
                    });
                });
                
                // Listar elementos SAP específicos
                const sapElements = document.querySelectorAll('[id^="__area"], .sapMInputBaseInner, .sapMTextAreaInner');
                console.log(`Elementos SAP específicos: ${sapElements.length}`);
                sapElements.forEach((el, i) => {
                    console.log(`Elemento SAP ${i}:`, {
                        tagName: el.tagName,
                        id: el.id || 'sem id',
                        className: el.className || 'sem classe',
                        visible: isElementVisible(el) ? 'sim' : 'não'
                    });
                });
            }
        }, checkInterval);
        
        // Configurar timeout
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (observer) observer.disconnect();
            console.error(`Timeout (${timeout}ms) esperando pelo elemento: ${selector}`);
            
            // Tentar encontrar qualquer elemento de entrada de texto como fallback
            if (selector.includes('textarea') || 
                selector.includes('input') || 
                selector.includes('contenteditable') || 
                selector.includes('textbox') || 
                selector.includes('-inner')) {
                console.log('Tentando encontrar elemento alternativo como fallback...');
                findAnyTextInputElement().then(alternativeElement => {
                    if (alternativeElement) {
                        console.log('Elemento alternativo encontrado como fallback:', {
                            tagName: alternativeElement.tagName,
                            id: alternativeElement.id || 'sem id',
                            className: alternativeElement.className || 'sem classe'
                        });
                        resolve(alternativeElement);
                        return;
                    }
                    reject(new Error(`Timeout esperando pelo elemento: ${selector}`));
                });
            } else {
                reject(new Error(`Timeout esperando pelo elemento: ${selector}`));
            }
        }, timeout);
        
        // Observar mudanças no DOM
        let observer = null;
        try {
            observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`Elemento encontrado por MutationObserver: ${selector}`);
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    obs.disconnect();
                    resolve(element);
                }
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true
            });
        } catch (error) {
            console.error('Erro ao configurar MutationObserver:', error);
            // Continuar com o método de intervalo apenas
        }
    });
}

// Função para encontrar qualquer elemento de entrada de texto na página
async function findAnyTextInputElement() {
    console.log('Procurando por qualquer elemento de entrada de texto na página...');
    
    // Lista de seletores para elementos de entrada de texto
    const selectors = [
        'textarea',
        'input[type="text"]',
        'div[contenteditable="true"]',
        '[role="textbox"]',
        '[aria-multiline="true"]',
        // Seletores específicos do SAP
        '[id$="-inner"]',
        '.sapMInputBaseInner',
        '.sapMTextAreaInner'
    ];
    
    // Procurar por todos os elementos que correspondem aos seletores
    const allPossibleElements = [];
    
    for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        console.log(`Encontrados ${elements.length} elementos com seletor: ${selector}`);
        
        elements.forEach(el => {
            // Verificar se o elemento está visível
            const style = window.getComputedStyle(el);
            const isVisible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
            
            if (isVisible) {
                allPossibleElements.push({
                    element: el,
                    selector: selector,
                    isTextarea: el.tagName === 'TEXTAREA',
                    isContentEditable: el.isContentEditable,
                    isVisible: isVisible,
                    placeholder: el.placeholder || '',
                    id: el.id || '',
                    className: el.className || ''
                });
            }
        });
    }
    
    console.log(`Total de ${allPossibleElements.length} elementos de entrada de texto encontrados`);
    
    // Ordenar elementos por prioridade (textareas primeiro, depois elementos com placeholder)
    allPossibleElements.sort((a, b) => {
        if (a.isTextarea && !b.isTextarea) return -1;
        if (!a.isTextarea && b.isTextarea) return 1;
        if (a.placeholder && !b.placeholder) return -1;
        if (!a.placeholder && b.placeholder) return 1;
        return 0;
    });
    
    // Retornar o primeiro elemento encontrado ou null
    return allPossibleElements.length > 0 ? allPossibleElements[0].element : null;
}

// Função principal para automatizar o uso de prompts
async function automatePromptUsage(promptId) {
    try {
        console.log('Iniciando automação de prompt com ID:', promptId);
        
        // Verificar se estamos no chat do SAP Generative AI
        const isInSapChat = await checkIfInSapChat();
        console.log('Está no chat SAP?', isInSapChat);
        
        // Se não estamos no chat, abrir nova aba
        if (!isInSapChat) {
            console.log('Não estamos no chat SAP, abrindo nova aba...');
            await openSapChat();
        }
        
        // Buscar prompt no storage
        console.log('Buscando prompt no storage...');
        const result = await chrome.storage.local.get(['prompts']);
        const prompts = result.prompts || [];
        const prompt = prompts.find(p => p.id === promptId);
        
        if (!prompt) {
            throw new Error('Prompt não encontrado');
        }
        
        console.log('Prompt encontrado:', {
            id: prompt.id,
            title: prompt.title,
            textLength: prompt.text.length,
            model: prompt.model,
            hasFiles: prompt.knowledgeBaseFiles && prompt.knowledgeBaseFiles.length > 0
        });
        
        console.log('Modelo específico do prompt:', prompt.model || 'não definido');
        
        // Obter configurações para modelo padrão
        const config = await new Promise(resolve => {
            chrome.storage.local.get(['config'], (result) => {
                resolve(result.config || {});
            });
        });
        
        // Determinar qual modelo usar: específico do prompt > padrão das configurações > Mistral Large Instruct (2407)
        let modelToUse = 'Mistral Large Instruct (2407)'; // fallback padrão
        
        console.log('=== ANÁLISE DE SELEÇÃO DE MODELO ===');
        console.log('Modelo do prompt:', prompt?.model || 'não definido');
        console.log('Modelo padrão das configurações:', config.defaultModel || 'não definido');
        console.log('Modelo fallback:', modelToUse);
        
        if (prompt && prompt.model) {
            modelToUse = prompt.model;
            console.log('✅ USANDO modelo específico do prompt:', modelToUse);
        } else if (config.defaultModel) {
            modelToUse = config.defaultModel;
            console.log('✅ USANDO modelo padrão das configurações:', modelToUse);
        } else {
            console.log('✅ USANDO modelo padrão fallback:', modelToUse);
        }
        
        console.log('=== MODELO FINAL SELECIONADO:', modelToUse, '===');
        
        // Tentar selecionar o modelo automaticamente
        try {
            console.log(`Tentando selecionar modelo: ${modelToUse}`);
            await selectModel(modelToUse);
            console.log('Modelo selecionado com sucesso');
        } catch (modelError) {
            console.warn('Erro ao selecionar modelo, continuando com o modelo atual:', modelError);
            // Não interromper o processo se a seleção do modelo falhar
        }
        
        // Aguardar um pouco após a seleção do modelo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Tentar detectar o seletor correto antes de injetar o texto
        console.log('Tentando detectar o seletor correto...');
        const detectedSelector = await detectTextareaSelector();
        
        if (detectedSelector) {
            console.log(`Usando seletor detectado: ${detectedSelector}`);
        } else {
            console.log('Usando seletor padrão:', window.SAP_TEXTAREA_SELECTOR);
        }
        
        // Tentar injetar o texto
        let injectionSuccess = false;
        
        try {
            // Primeira tentativa: usar a função injectPromptText
            console.log('Tentativa 1: Usando função injectPromptText...');
            await injectPromptText(prompt.text);
            injectionSuccess = true;
            console.log('Texto injetado com sucesso usando injectPromptText');
        } catch (error1) {
            console.warn('Falha na tentativa 1:', error1);
            
            try {
                // Segunda tentativa: usar o seletor detectado diretamente
                console.log('Tentativa 2: Usando seletor detectado diretamente...');
                const textarea = document.querySelector(window.SAP_TEXTAREA_SELECTOR);
                
                if (textarea) {
                    console.log('Elemento encontrado com seletor detectado');
                    textarea.focus();
                    textarea.value = prompt.text;
                    
                    // Disparar eventos
                    const events = ['input', 'change', 'keyup'];
                    events.forEach(eventType => {
                        const event = new Event(eventType, { bubbles: true });
                        textarea.dispatchEvent(event);
                    });
                    
                    injectionSuccess = true;
                    console.log('Texto injetado com sucesso usando seletor detectado');
                } else {
                    throw new Error('Elemento não encontrado com seletor detectado');
                }
            } catch (error2) {
                console.warn('Falha na tentativa 2:', error2);
                
                // Terceira tentativa: usar findAnyTextInputElement
                console.log('Tentativa 3: Usando findAnyTextInputElement...');
                const textInputElement = await findAnyTextInputElement();
                
                if (textInputElement) {
                    console.log('Elemento de entrada de texto encontrado:', {
                        tagName: textInputElement.tagName,
                        id: textInputElement.id,
                        className: textInputElement.className
                    });
                    
                    // Focar no elemento
                    textInputElement.focus();
                    
                    // Injetar texto
                    if (textInputElement.isContentEditable) {
                        textInputElement.innerHTML = prompt.text;
                    } else {
                        textInputElement.value = prompt.text;
                    }
                    
                    // Disparar eventos
                    const events = ['input', 'change', 'keyup'];
                    events.forEach(eventType => {
                        const event = new Event(eventType, { bubbles: true });
                        textInputElement.dispatchEvent(event);
                    });
                    
                    // Simular pressionamento de Enter
                    const enterEvent = new KeyboardEvent('keydown', {
                        bubbles: true,
                        cancelable: true,
                        keyCode: 13,
                        which: 13,
                        key: 'Enter'
                    });
                    textInputElement.dispatchEvent(enterEvent);
                    
                    injectionSuccess = true;
                    console.log('Texto injetado com sucesso usando método alternativo');
                } else {
                    throw new Error('Não foi possível encontrar nenhum elemento de entrada de texto na página');
                }
            }
        }
        
        if (!injectionSuccess) {
            throw new Error('Todas as tentativas de injeção de texto falharam');
        }
        
        // Se o prompt tem arquivos de knowledge base, fazer upload
        if (prompt.knowledgeBaseFiles && prompt.knowledgeBaseFiles.length > 0) {
            console.log('Prompt tem arquivos de knowledge base, fazendo upload...');
            await uploadKnowledgeBaseFile(promptId);
        }
        
        console.log('Automação concluída com sucesso');
        return { success: true, message: 'Prompt automatizado com sucesso' };
    } catch (error) {
        console.error('Erro ao automatizar uso de prompt:', error);
        return { success: false, error: error.message };
    }
}

// Exportar função principal
window.automatePromptUsage = automatePromptUsage;

// Verificar se o listener já foi adicionado para evitar duplicação
if (!window.sapAutomationListenerAdded) {
    // Listener para mensagens do background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log('SAP Automation recebeu mensagem:', message);
        
        if (message.action === 'automatePrompt') {
            console.log('Iniciando automação do prompt:', message.promptId);
            automatePromptUsage(message.promptId)
                .then(result => {
                    console.log('Resultado da automação:', result);
                    sendResponse(result);
                })
                .catch(error => {
                    console.error('Erro na automação:', error);
                    sendResponse({ success: false, error: error.message });
                });
            return true; // Indica resposta assíncrona
        }
    });
    
    // Marcar que o listener foi adicionado
    window.sapAutomationListenerAdded = true;
}

// Marcar que o script foi carregado
window.sapAutomationScriptInjected = true;

console.log('Script de automação do SAP Generative AI carregado');