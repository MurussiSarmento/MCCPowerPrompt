// ===============================
// Sistema de Internacionalização
// ===============================

// Traduções locais (fallback para when chrome.i18n não funciona dinamicamente)
let currentTranslations = {};

/**
 * Carrega traduções do arquivo JSON correspondente ao idioma
 */
async function loadTranslations(language) {
    try {
        const url = chrome.runtime.getURL(`_locales/${language}/messages.json`);
        console.log('Carregando traduções de:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Converter formato Chrome para formato simples
        currentTranslations = {};
        for (const [key, value] of Object.entries(data)) {
            if (value && value.message) {
                currentTranslations[key] = value.message;
            }
        }
        
        console.log('Traduções carregadas:', Object.keys(currentTranslations).length, 'chaves');
        return currentTranslations;
    } catch (error) {
        console.error('Erro ao carregar traduções:', error);
        // Fallback para chrome.i18n se disponível
        try {
            // Tentar usar chrome.i18n como backup
            currentTranslations = {};
            return null;
        } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
            return null;
        }
    }
}

/**
 * Função auxiliar para obter mensagens traduzidas
 */
function i18n(key, substitutions = null) {
    try {
        // Primeiro tenta usar traduções locais carregadas
        if (currentTranslations && currentTranslations[key]) {
            let message = currentTranslations[key];
            
            // Processar substitutions se existirem
            if (substitutions && Array.isArray(substitutions)) {
                substitutions.forEach((sub, index) => {
                    message = message.replace(`$${index + 1}`, sub);
                });
            }
            
            return message;
        }
        
        // Fallback para chrome.i18n
        if (chrome && chrome.i18n && chrome.i18n.getMessage) {
            const message = chrome.i18n.getMessage(key, substitutions);
            if (message) return message;
        }
        
        // Último fallback: strings hardcoded em português para casos críticos
        const hardcodedFallbacks = {
            'search_placeholder': 'Buscar prompts...',
            'add_new_button': 'Adicionar Novo',
            'settings_button_title': 'Configurações',
            'cancel_button': 'Cancelar',
            'save_button': 'Salvar',
            'no_prompts_found_title': 'Nenhum prompt encontrado',
            'try_adjust_search': 'Tente ajustar sua busca',
            'start_adding_first_prompt': 'Comece adicionando seu primeiro prompt'
        };
        
        return hardcodedFallbacks[key] || key;
    } catch (error) {
        console.error('Erro ao obter mensagem i18n:', key, error);
        return key;
    }
}

/**
 * Atualiza a interface do usuário com as traduções
 */
function updateUI() {
    // Atualizar placeholders
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = i18n('search_placeholder');
    
    const promptText = document.getElementById('promptText');
    if (promptText) promptText.placeholder = i18n('prompt_text_placeholder');
    
    const promptTags = document.getElementById('promptTags');
    if (promptTags) promptTags.placeholder = i18n('tags_placeholder');
    
    const promptCategory = document.getElementById('promptCategory');
    if (promptCategory) promptCategory.placeholder = i18n('category_placeholder');
    
    // Atualizar textos dos botões
    const addNewBtn = document.getElementById('addNewBtn');
    if (addNewBtn) addNewBtn.textContent = i18n('add_new_button');
    
    const configBtn = document.getElementById('configBtn');
    if (configBtn) configBtn.title = i18n('settings_button_title');
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.textContent = i18n('cancel_button');
    
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.textContent = i18n('save_button');
    
    const resetConfigBtn = document.getElementById('resetConfigBtn');
    if (resetConfigBtn) resetConfigBtn.textContent = i18n('reset_default_button');
    
    const exportPromptsBtn = document.getElementById('exportPromptsBtn');
    if (exportPromptsBtn) exportPromptsBtn.textContent = i18n('export_prompts_button');
    
    const importPromptsBtn = document.getElementById('importPromptsBtn');
    if (importPromptsBtn) importPromptsBtn.textContent = i18n('import_prompts_button');
    
    // Atualizar labels
    const labels = {
        'promptTitle': 'title_label',
        'promptText': 'text_label',
        'promptTags': 'tags_label',
        'promptCategory': 'category_label',
        'promptModel': 'specific_model_label',
        'knowledgeBaseFiles': 'knowledge_base_files_label',
        'sapGenAiUrl': 'sap_genai_url_label',
        'defaultModel': 'default_model_label',
        'language': 'language_label',
        'storageType': 'storage_type_label'
    };
    
    Object.entries(labels).forEach(([inputId, messageKey]) => {
        const input = document.getElementById(inputId);
        if (input) {
            const label = document.querySelector(`label[for="${inputId}"]`);
            if (label) {
                label.textContent = i18n(messageKey);
            }
        }
    });
    
    // Atualizar títulos dos modais
    const configModalTitle = document.querySelector('#configModal .modal-header h2');
    if (configModalTitle) configModalTitle.textContent = i18n('settings_modal_title');
    
    // Forçar atualização do título do modal de prompt (se estiver aberto)
    const promptModalTitle = document.querySelector('#promptModal .modal-header h2');
    if (promptModalTitle && !promptModal.classList.contains('hidden')) {
        if (editingPromptId) {
            promptModalTitle.textContent = i18n('edit_prompt_modal_title');
        } else {
            promptModalTitle.textContent = i18n('add_prompt_modal_title');
        }
    }
    
    // Atualizar help texts
    const helpTexts = document.querySelectorAll('.form-help');
    helpTexts.forEach((helpText, index) => {
        const parent = helpText.closest('.form-group');
        if (parent) {
            const input = parent.querySelector('input, select, textarea');
            if (input) {
                switch (input.id) {
                    case 'promptModel':
                        helpText.textContent = i18n('specific_model_help');
                        break;
                    case 'knowledgeBaseFiles':
                        helpText.textContent = i18n('knowledge_base_files_help');
                        break;
                    case 'sapGenAiUrl':
                        helpText.textContent = i18n('sap_genai_url_help');
                        break;
                    case 'defaultModel':
                        helpText.textContent = i18n('default_model_help');
                        break;
                    case 'language':
                        helpText.textContent = i18n('language_help');
                        break;
                    case 'storageType':
                        helpText.textContent = i18n('storage_type_help');
                        break;
                }
            }
        }
    });
    
    // Atualizar opções dos selects
    updateSelectOptions();
    
    // Atualizar textos dos checkboxes de botões visíveis
    const checkboxTexts = [
        { id: 'showCopyPrompt', key: 'button_copy_prompt' },
        { id: 'showCopyAhk', key: 'button_copy_ahk' },
        { id: 'showAutomateSap', key: 'button_automate_sap' },
        { id: 'showEdit', key: 'button_edit' },
        { id: 'showDelete', key: 'button_delete' }
    ];
    
    checkboxTexts.forEach(({ id, key }) => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            const span = checkbox.nextElementSibling;
            if (span && span.tagName === 'SPAN') {
                span.textContent = i18n(key);
            }
        }
    });
    
    // Atualizar label "Botões Visíveis"
    const visibleButtonsLabel = document.querySelector('#showCopyPrompt').closest('.form-group').querySelector('label:first-child');
    if (visibleButtonsLabel) {
        visibleButtonsLabel.textContent = i18n('visible_buttons_label');
    }
    
    // Atualizar help text dos botões visíveis
    const visibleButtonsHelp = document.querySelector('#showCopyPrompt').closest('.form-group').querySelector('.form-help');
    if (visibleButtonsHelp) {
        visibleButtonsHelp.textContent = i18n('visible_buttons_help');
    }
    
    // Atualizar backup section
    const backupLabel = document.querySelector('label[for="storageType"]').parentNode.nextElementSibling?.querySelector('label');
    if (backupLabel && backupLabel.textContent.includes('Backup')) {
        backupLabel.textContent = i18n('backup_restore_label');
    }
    
    const backupHelp = document.querySelector('.backup-controls')?.nextElementSibling;
    if (backupHelp && backupHelp.classList.contains('form-help')) {
        backupHelp.textContent = i18n('backup_restore_help');
    }
    
    // Re-renderizar prompts para atualizar textos
    renderPrompts();
}

/**
 * Atualiza as opções dos selects com traduções
 */
function updateSelectOptions() {
    // Atualizar opções do modelo
    const promptModel = document.getElementById('promptModel');
    if (promptModel) {
        const defaultOption = promptModel.querySelector('option[value=""]');
        if (defaultOption) {
            defaultOption.textContent = i18n('use_default_model_option');
        }
    }
    
    // Atualizar opções do storage
    const storageType = document.getElementById('storageType');
    if (storageType) {
        const localOption = storageType.querySelector('option[value="local"]');
        if (localOption) {
            localOption.textContent = i18n('local_storage_option');
        }
    }
    
    // Atualizar opções de idioma
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        const options = languageSelect.querySelectorAll('option');
        options.forEach(option => {
            switch (option.value) {
                case 'pt_BR':
                    option.textContent = i18n('language_portuguese');
                    break;
                case 'en':
                    option.textContent = i18n('language_english');
                    break;
                case 'es':
                    option.textContent = i18n('language_spanish');
                    break;
                case 'fr':
                    option.textContent = i18n('language_french');
                    break;
            }
        });
    }
}

/**
 * Carrega o idioma atual e atualiza a UI
 */
async function loadCurrentLanguage() {
    try {
        const response = await chrome.runtime.sendMessage({ action: 'getCurrentLanguage' });
        if (response.success) {
            const language = response.language;
            
            // Carregar traduções para o idioma atual
            await loadTranslations(language);
            
            const languageSelect = document.getElementById('language');
            if (languageSelect) {
                languageSelect.value = language;
            }
            
            // Atualizar o atributo lang do HTML
            document.documentElement.lang = language === 'pt_BR' ? 'pt-BR' : 
                                          language === 'en' ? 'en-US' : 
                                          language === 'es' ? 'es-ES' : 
                                          language === 'fr' ? 'fr-FR' : 'pt-BR';
        }
    } catch (error) {
        console.error('Erro ao carregar idioma atual:', error);
    }
}

/**
 * Trata mudança de idioma
 */
async function handleLanguageChange(newLanguage) {
    try {
        const response = await chrome.runtime.sendMessage({ 
            action: 'setLanguage', 
            language: newLanguage 
        });
        
        if (response.success) {
            // Carregar novas traduções
            await loadTranslations(newLanguage);
            
            // Atualizar interface com novas traduções
            updateUI();
            
            // Atualizar o atributo lang do HTML
            document.documentElement.lang = newLanguage === 'pt_BR' ? 'pt-BR' : 
                                          newLanguage === 'en' ? 'en-US' : 
                                          newLanguage === 'es' ? 'es-ES' : 
                                          newLanguage === 'fr' ? 'fr-FR' : 'pt-BR';
        } else {
            alert(i18n('error_saving_config_alert') + (response.error || ''));
        }
    } catch (error) {
        console.error('Erro ao alterar idioma:', error);
        alert(i18n('error_saving_config_alert') + error.message);
    }
}

// Elementos DOM
const searchInput = document.getElementById('searchInput');
const addNewBtn = document.getElementById('addNewBtn');
const configBtn = document.getElementById('configBtn');
const promptsList = document.getElementById('promptsList');
const promptModal = document.getElementById('promptModal');
const configModal = document.getElementById('configModal');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const closeConfigModal = document.getElementById('closeConfigModal');
const promptForm = document.getElementById('promptForm');
const configForm = document.getElementById('configForm');
const cancelBtn = document.getElementById('cancelBtn');
const resetConfigBtn = document.getElementById('resetConfigBtn');
const storageTypeSelect = document.getElementById('storageType');
const exportPromptsBtn = document.getElementById('exportPromptsBtn');
const importPromptsBtn = document.getElementById('importPromptsBtn');
const importPromptsInput = document.getElementById('importPromptsInput');
const knowledgeBaseFilesInput = document.getElementById('knowledgeBaseFiles');
const selectedFilesContainer = document.getElementById('selectedFilesContainer');

// Estado da aplicação
let prompts = [];
let config = {};
let editingPromptId = null;
let selectedFiles = []; // Array para armazenar os arquivos de knowledge base selecionados

// URL padrão do SAP Generative AI
const DEFAULT_SAP_GENAI_URL = 'https://sapit-core-playground-vole.ai-launchpad.prod.eu-central-1.aws.apps.ml.hana.ondemand.com/aic/index.html#/generativeaihub?workspace=sap-genai-xl&resourceGroup=default&/g/promptchat';

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Iniciando popup...');
        
        // Carregar dados básicos
        await Promise.all([
            loadPrompts().catch(err => console.error('Erro loadPrompts:', err)),
            loadConfig().catch(err => console.error('Erro loadConfig:', err))
        ]);
        
        // Carregar idioma (pode falhar, mas não deve quebrar a extensão)
        try {
            await loadCurrentLanguage();
        } catch (error) {
            console.error('Erro ao carregar idioma, usando padrão:', error);
            // Fallback: usar português como padrão
            await loadTranslations('pt_BR').catch(() => {
                console.log('Usando chrome.i18n como fallback');
            });
        }
        
        // Atualizar interface com traduções
        updateUI();
        renderPrompts();
        setupEventListeners();
        
        // Verificar se foi chamado via protocolo AHK
        checkProtocolAction();
        
        console.log('Popup inicializado com sucesso');
    } catch (error) {
        console.error('Erro crítico na inicialização:', error);
        // Tentar continuar mesmo com erro
        try {
            renderPrompts();
            setupEventListeners();
        } catch (fallbackError) {
            console.error('Erro no fallback:', fallbackError);
        }
    }
});

// Carregar prompts do storage
async function loadPrompts() {
    try {
        const result = await chrome.storage.local.get(['prompts']);
        prompts = result.prompts || [];
    } catch (error) {
        console.error('Erro ao carregar prompts:', error);
        prompts = [];
    }
}

// Carregar configurações do storage
async function loadConfig() {
    try {
        const result = await chrome.storage.local.get(['config']);
        config = result.config || {};
        
        // Definir valores padrão se não existirem
        if (!config.sapGenAiUrl) {
            config.sapGenAiUrl = DEFAULT_SAP_GENAI_URL;
        }
        // Forçar armazenamento local
        config.storageType = 'local';
        
        // Configuração padrão dos botões visíveis
        if (!config.visibleButtons) {
            config.visibleButtons = {
                copyPrompt: true,
                copyAhk: false,
                automateSap: false,
                edit: true,
                delete: true
            };
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        config = { 
            sapGenAiUrl: DEFAULT_SAP_GENAI_URL,
            storageType: 'local',
            visibleButtons: {
                copyPrompt: true,
                copyAhk: false,
                automateSap: false,
                edit: true,
                delete: true
            }
        };
    }
}

// Salvar configurações
async function saveConfig() {
    try {
        await chrome.storage.local.set({ config });
        console.log('Configurações salvas:', config);
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
    }
}

// Salvar prompts no storage
async function savePrompts() {
    try {
        await chrome.storage.local.set({ prompts });
    } catch (error) {
        console.error('Erro ao salvar prompts:', error);
    }
}

// Renderizar lista de prompts
function renderPrompts(filteredPrompts = null) {
    const promptsToRender = filteredPrompts || prompts;
    
    if (promptsToRender.length === 0) {
        promptsList.innerHTML = `
            <div class="empty-state">
                <h3>${i18n('no_prompts_found_title')}</h3>
                <p>${filteredPrompts ? i18n('try_adjust_search') : i18n('start_adding_first_prompt')}</p>
            </div>
        `;
        return;
    }
    
    promptsList.innerHTML = promptsToRender.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <div class="prompt-header">
                <h3 class="prompt-title">${escapeHtml(prompt.title)}</h3>
                <div class="prompt-meta">
                    ${prompt.category ? `<span class="prompt-category">${escapeHtml(prompt.category)}</span>` : ''}
                    ${prompt.model ? `<span class="prompt-model">📱 ${escapeHtml(prompt.model)}</span>` : ''}
                </div>
            </div>
            <div class="prompt-text">${escapeHtml(prompt.text)}</div>
            ${prompt.tags && prompt.tags.length > 0 ? `
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="prompt-actions">
                ${generatePromptButtons(prompt.id)}
            </div>
        </div>
    `).join('');
}

/**
 * Gera botões de ação para um prompt baseado na configuração
 */
function generatePromptButtons(promptId) {
    const visibleButtons = config.visibleButtons || {
        copyPrompt: true,
        copyAhk: false,
        automateSap: false,
        edit: false,
        delete: false
    };
    
    let buttons = [];
    
    // Botão para copiar prompt diretamente
    if (visibleButtons.copyPrompt) {
        buttons.push(`
            <button class="btn-small btn-copy-prompt" data-id="${promptId}" data-action="copyPrompt" title="${i18n('copy_prompt_title')}">
                📄 ${i18n('button_copy_prompt')}
            </button>
        `);
    }
    
    // Botão para copiar URL AHK
    if (visibleButtons.copyAhk) {
        buttons.push(`
            <button class="btn-small btn-copy" data-id="${promptId}" data-action="copy" title="${i18n('copy_ahk_url_title')}">
                📋 ${i18n('button_copy_ahk')}
            </button>
        `);
    }
    
    // Botão para automatizar no SAP
    if (visibleButtons.automateSap) {
        buttons.push(`
            <button class="btn-small btn-automate" data-id="${promptId}" data-action="automate" title="${i18n('automate_sap_genai_title')}">
                🤖 ${i18n('button_automate_sap')}
            </button>
        `);
    }
    
    // Botão para editar
    if (visibleButtons.edit) {
        buttons.push(`
            <button class="btn-small btn-edit" data-id="${promptId}" data-action="edit" title="${i18n('edit_title')}">
                ✏️ ${i18n('button_edit')}
            </button>
        `);
    }
    
    // Botão para excluir
    if (visibleButtons.delete) {
        buttons.push(`
            <button class="btn-small btn-delete" data-id="${promptId}" data-action="delete" title="${i18n('delete_title')}">
                🗑️ ${i18n('button_delete')}
            </button>
        `);
    }
    
    return buttons.join('');
}

// Configurar event listeners
function setupEventListeners() {
    // Busca em tempo real
    searchInput.addEventListener('input', handleSearch);
    
    // Modal de prompts
    addNewBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeModalHandler);
    cancelBtn.addEventListener('click', closeModalHandler);
    promptForm.addEventListener('submit', handleFormSubmit);
    
    // Modal de configurações
    configBtn.addEventListener('click', openConfigModal);
    closeConfigModal.addEventListener('click', closeConfigModalHandler);
    resetConfigBtn.addEventListener('click', resetConfig);
    configForm.addEventListener('submit', handleConfigFormSubmit);
    
    // Troca de idioma
    const languageSelect = document.getElementById('language');
    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            handleLanguageChange(e.target.value);
        });
    }
    
    // Configurações de armazenamento
    exportPromptsBtn.addEventListener('click', exportPrompts);
    importPromptsBtn.addEventListener('click', () => importPromptsInput.click());
    importPromptsInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importPrompts(e.target.files[0]);
            e.target.value = ''; // Reset input
        }
    });
    
    // Atualizar o accept do input de importação para incluir arquivos ZIP
    importPromptsInput.setAttribute('accept', '.json,.zip');
    
    // Gerenciamento de arquivos de knowledge base
    knowledgeBaseFilesInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            // Adicionar os arquivos selecionados à lista
            for (const file of e.target.files) {
                // Verificar se o arquivo já existe na lista
                if (!selectedFiles.some(f => f.name === file.name)) {
                    selectedFiles.push(file);
                    addFileToUI(file);
                }
            }
            e.target.value = ''; // Reset input
        }
    });

    
    // Delegação de eventos para botões de ação nos prompts
    promptsList.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        
        const action = button.getAttribute('data-action');
        const id = button.getAttribute('data-id');
        
        if (!id) return;
        
        switch (action) {
            case 'copyPrompt':
                copyPromptText(id);
                break;
            case 'copy':
                copyAhkUrl(id);
                break;
            case 'automate':
                automatePrompt(id);
                break;
            case 'edit':
                editPrompt(id);
                break;
            case 'delete':
                deletePrompt(id);
                break;
        }
    });
    
    // Fechar modais clicando fora
    promptModal.addEventListener('click', (e) => {
        if (e.target === promptModal) {
            closeModalHandler();
        }
    });
    
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            closeConfigModalHandler();
        }
    });
    
    // Esc para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!promptModal.classList.contains('hidden')) {
                closeModalHandler();
            } else if (!configModal.classList.contains('hidden')) {
                closeConfigModalHandler();
            }
        }
    });
}

// Busca em tempo real
function handleSearch() {
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) {
        renderPrompts();
        return;
    }
    
    const filteredPrompts = prompts.filter(prompt => {
        return (
            prompt.title.toLowerCase().includes(query) ||
            prompt.text.toLowerCase().includes(query) ||
            prompt.category?.toLowerCase().includes(query) ||
            prompt.tags?.some(tag => tag.toLowerCase().includes(query))
        );
    });
    
    renderPrompts(filteredPrompts);
}

// Abrir modal para adicionar
function openAddModal() {
    editingPromptId = null;
    modalTitle.textContent = i18n('add_prompt_modal_title');
    promptForm.reset();
    
    // Limpar a lista de arquivos selecionados
    selectedFiles = [];
    selectedFilesContainer.innerHTML = '';
    
    promptModal.classList.remove('hidden');
    document.getElementById('promptTitle').focus();
}

// Abrir modal para editar
function editPrompt(id) {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    
    editingPromptId = id;
    modalTitle.textContent = i18n('edit_prompt_modal_title');
    
    document.getElementById('promptTitle').value = prompt.title;
    document.getElementById('promptText').value = prompt.text;
    document.getElementById('promptTags').value = prompt.tags ? prompt.tags.join(', ') : '';
    document.getElementById('promptCategory').value = prompt.category || '';
    document.getElementById('promptModel').value = prompt.model || '';
    
    console.log('Editando prompt:', {
        id: prompt.id,
        title: prompt.title,
        model: prompt.model,
        category: prompt.category
    });
    console.log('Campo promptModel definido para:', prompt.model || 'vazio');
    
    // Limpar a lista de arquivos selecionados
    selectedFiles = [];
    selectedFilesContainer.innerHTML = '';
    
    // Carregar os arquivos de knowledge base existentes, se houver
    if (prompt.knowledgeBaseFiles && prompt.knowledgeBaseFiles.length > 0) {
        // Converter os arquivos armazenados para objetos File para exibição
        prompt.knowledgeBaseFiles.forEach(file => {
            // Criar um objeto Blob a partir dos dados do arquivo
            const blob = new Blob([file.data], { type: file.type });
            
            // Criar um objeto File a partir do Blob
            const fileObj = new File([blob], file.name, { type: file.type });
            
            // Adicionar o arquivo à lista de arquivos selecionados
            selectedFiles.push(fileObj);
            
            // Adicionar o arquivo à interface
            addFileToUI(fileObj);
        });
    }
    
    promptModal.classList.remove('hidden');
    document.getElementById('promptTitle').focus();
}

// Fechar modal de prompts
function closeModalHandler() {
    promptModal.classList.add('hidden');
    editingPromptId = null;
    promptForm.reset();
    
    // Limpar a lista de arquivos selecionados
    selectedFiles = [];
    selectedFilesContainer.innerHTML = '';
}

// Abrir modal de configurações
async function openConfigModal() {
    // Preencher formulário com valores atuais
    document.getElementById('sapGenAiUrl').value = config.sapGenAiUrl || '';
    document.getElementById('defaultModel').value = config.defaultModel || '';
    storageTypeSelect.value = 'local';
    
    // Carregar configuração dos botões visíveis
    const visibleButtons = config.visibleButtons || {
        copyPrompt: true,
        copyAhk: false,
        automateSap: false,
        edit: false,
        delete: false
    };
    
    document.getElementById('showCopyPrompt').checked = visibleButtons.copyPrompt;
    document.getElementById('showCopyAhk').checked = visibleButtons.copyAhk;
    document.getElementById('showAutomateSap').checked = visibleButtons.automateSap;
    document.getElementById('showEdit').checked = visibleButtons.edit;
    document.getElementById('showDelete').checked = visibleButtons.delete;
    
    // Carregar idioma atual
    await loadCurrentLanguage();
    
    // Mostrar modal
    configModal.classList.remove('hidden');
}

// Fechar modal de configurações
function closeConfigModalHandler() {
    configModal.classList.add('hidden');
    configForm.reset();
}

// Resetar configurações para valores padrão
async function resetConfig() {
    document.getElementById('sapGenAiUrl').value = DEFAULT_SAP_GENAI_URL;
    document.getElementById('defaultModel').value = '';
    storageTypeSelect.value = 'local';
    
    // Resetar checkboxes para configuração padrão
    document.getElementById('showCopyPrompt').checked = true;
    document.getElementById('showCopyAhk').checked = false;
    document.getElementById('showAutomateSap').checked = false;
    document.getElementById('showEdit').checked = false;
    document.getElementById('showDelete').checked = false;
    
    // Resetar configurações no objeto
    config.sapGenAiUrl = DEFAULT_SAP_GENAI_URL;
    config.defaultModel = '';
    config.storageType = 'local';
    config.visibleButtons = {
        copyPrompt: true,
        copyAhk: false,
        automateSap: false,
        edit: false,
        delete: false
    };
    
    await saveConfig();
    
    alert(i18n('config_restored_alert'));
}

// Submeter formulário de configurações
async function handleConfigFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(configForm);
    const sapGenAiUrl = (formData.get('sapGenAiUrl') || '').trim();
    const defaultModel = (formData.get('defaultModel') || '').trim();
    
    // Atualizar configurações
    config.sapGenAiUrl = sapGenAiUrl || DEFAULT_SAP_GENAI_URL;
    config.defaultModel = defaultModel || '';
    config.storageType = 'local';
    
    // Salvar configuração dos botões visíveis
    config.visibleButtons = {
        copyPrompt: document.getElementById('showCopyPrompt').checked,
        copyAhk: document.getElementById('showCopyAhk').checked,
        automateSap: document.getElementById('showAutomateSap').checked,
        edit: document.getElementById('showEdit').checked,
        delete: document.getElementById('showDelete').checked
    };
    
    try {
        // Salvar configurações
        await saveConfig();
        
        // Notificar background script sobre mudança de configuração
        chrome.runtime.sendMessage({ action: 'configUpdated' });
        
        closeConfigModalHandler();
        alert(i18n('config_saved_success'));
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert(i18n('error_saving_config_alert') + error.message);
    }
}









// Exportar prompts para download (formato ZIP com arquivos de knowledge base)
async function exportPrompts() {
    try {
        // Criar um novo objeto JSZip
        const zip = new JSZip();
        
        // Adicionar o arquivo JSON com os prompts
        const dataStr = JSON.stringify(prompts, null, 2);
        zip.file('prompts.json', dataStr);
        
        // Adicionar os arquivos de knowledge base para cada prompt
        for (const prompt of prompts) {
            if (prompt.knowledgeBaseFiles && prompt.knowledgeBaseFiles.length > 0) {
                // Criar uma pasta para os arquivos de knowledge base do prompt
                const folder = zip.folder(`knowledge_base/${prompt.id}`);
                
                // Adicionar cada arquivo ao ZIP
                for (const file of prompt.knowledgeBaseFiles) {
                    folder.file(file.name, file.data);
                }
            }
        }
        
        // Gerar o arquivo ZIP
        const content = await zip.generateAsync({type: 'blob'});
        
        // Criar um link para download
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'prompts_with_knowledge_base.zip';
        a.click();
        
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Erro ao exportar prompts:', error);
        alert(i18n('error_exporting_prompts') + error.message);
    }
}

// Importar prompts de arquivo (formato ZIP com arquivos de knowledge base)
function importPrompts(file) {
    // Verificar se é um arquivo ZIP ou JSON
    if (file.name.endsWith('.json')) {
        // Importar apenas o arquivo JSON
        importPromptsFromJson(file);
    } else if (file.name.endsWith('.zip')) {
        // Importar do arquivo ZIP (prompts + knowledge base)
        importPromptsFromZip(file);
    } else {
        alert(i18n('unsupported_file_format'));
    }
}

// Importar prompts de arquivo JSON
function importPromptsFromJson(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const importedPrompts = JSON.parse(e.target.result);
            
            // Mesclar com prompts existentes (evitar duplicatas por ID)
            const existingIds = new Set(prompts.map(p => p.id));
            const newPrompts = importedPrompts.filter(p => !existingIds.has(p.id));
            
            prompts = [...prompts, ...newPrompts];
            await savePrompts();
            renderPrompts();
            
            alert(i18n('prompts_imported_success', [newPrompts.length.toString()]));
        } catch (error) {
            console.error('Erro ao importar prompts:', error);
            alert(i18n('error_importing_prompts') + error.message);
        }
    };
    reader.readAsText(file);
}

// Importar prompts de arquivo ZIP
async function importPromptsFromZip(file) {
    try {
        // Ler o arquivo ZIP
        const zipData = await JSZip.loadAsync(file);
        
        // Extrair o arquivo prompts.json
        const promptsFile = zipData.file('prompts.json');
        if (!promptsFile) {
            throw new Error('Arquivo prompts.json não encontrado no ZIP');
        }
        
        // Ler e processar o arquivo JSON
        const promptsJson = await promptsFile.async('text');
        const importedPrompts = JSON.parse(promptsJson);
        
        // Processar os arquivos de knowledge base para cada prompt
        for (const prompt of importedPrompts) {
            // Verificar se há arquivos de knowledge base para este prompt
            const knowledgeBasePath = `knowledge_base/${prompt.id}/`;
            const knowledgeBaseFiles = [];
            
            // Buscar todos os arquivos na pasta do prompt
            zipData.folder(knowledgeBasePath).forEach(async (relativePath, file) => {
                if (!file.dir) {
                    // Extrair o conteúdo do arquivo
                    const fileName = relativePath.split('/').pop();
                    const fileData = await file.async('arraybuffer');
                    
                    // Adicionar o arquivo à lista de arquivos do prompt
                    knowledgeBaseFiles.push({
                        name: fileName,
                        data: fileData,
                        size: fileData.byteLength,
                        type: getFileType(fileName)
                    });
                }
            });
            
            // Atualizar o prompt com os arquivos de knowledge base
            if (knowledgeBaseFiles.length > 0) {
                prompt.knowledgeBaseFiles = knowledgeBaseFiles;
            }
        }
        
        // Mesclar com prompts existentes (evitar duplicatas por ID)
        const existingIds = new Set(prompts.map(p => p.id));
        const newPrompts = importedPrompts.filter(p => !existingIds.has(p.id));
        
        prompts = [...prompts, ...newPrompts];
        await savePrompts();
        renderPrompts();
        
        alert(`${newPrompts.length} prompts importados com sucesso!`);
    } catch (error) {
        console.error('Erro ao importar prompts do ZIP:', error);
        alert('Erro ao importar prompts do ZIP: ' + error.message);
    }
}

// Função auxiliar para determinar o tipo de arquivo com base na extensão
function getFileType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    const textExtensions = ['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'css', 'js', 'py', 'java', 'c', 'cpp', 'h', 'php', 'rb', 'pl', 'sql'];
    
    if (textExtensions.includes(extension)) {
        return 'text/plain';
    }
    
    switch (extension) {
        case 'pdf': return 'application/pdf';
        case 'doc': case 'docx': return 'application/msword';
        case 'xls': case 'xlsx': return 'application/vnd.ms-excel';
        case 'ppt': case 'pptx': return 'application/vnd.ms-powerpoint';
        case 'jpg': case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        case 'gif': return 'image/gif';
        case 'svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
}

// Submeter formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(promptForm);
    const title = formData.get('title')?.trim() || '';
    const text = formData.get('text')?.trim() || '';
    const tagsString = formData.get('tags')?.trim() || '';
    const category = formData.get('category')?.trim() || '';
    const model = formData.get('promptModel')?.trim() || '';
    
    console.log('Dados do formulário capturados:', {
        title,
        text: text.substring(0, 50) + '...',
        category,
        model,
        tagsString
    });
    
    if (!title || !text) {
        alert(i18n('title_text_required'));
        return;
    }
    
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // Processar os arquivos de knowledge base selecionados
    const knowledgeBaseFiles = [];
    if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
            // Converter o arquivo para um formato que pode ser armazenado
            const fileData = await readFileAsArrayBuffer(file);
            
            knowledgeBaseFiles.push({
                name: file.name,
                data: fileData,
                size: file.size,
                type: file.type || getFileType(file.name)
            });
        }
    }
    
    const promptData = {
        title,
        text,
        tags,
        category: category || null,
        model: model || null,
        knowledgeBaseFiles: knowledgeBaseFiles.length > 0 ? knowledgeBaseFiles : null
    };
    
    console.log('Dados do prompt a serem salvos:', promptData);
    console.log('Modelo que será salvo:', model || 'null');
    
    if (editingPromptId) {
        // Editar prompt existente
        const index = prompts.findIndex(p => p.id === editingPromptId);
        if (index !== -1) {
            prompts[index] = { ...prompts[index], ...promptData };
        }
    } else {
        // Criar novo prompt
        const newPrompt = {
            id: crypto.randomUUID(),
            ...promptData
        };
        prompts.push(newPrompt);
    }
    
    await savePrompts();
    closeModalHandler();
    
    // Limpar busca se houver
    if (searchInput.value) {
        searchInput.value = '';
    }
    
    // Renderizar prompts apenas uma vez
    renderPrompts();
}

// Função para ler um arquivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e.target.error);
        reader.readAsArrayBuffer(file);
    });
}

// Adicionar arquivo à interface
function addFileToUI(file) {
    // Criar elemento para o arquivo
    const fileItem = document.createElement('div');
    fileItem.className = 'selected-file-item';
    fileItem.dataset.fileName = file.name;
    
    // Adicionar nome do arquivo
    const fileName = document.createElement('span');
    fileName.className = 'selected-file-name';
    fileName.textContent = file.name;
    
    // Adicionar tamanho do arquivo
    const fileSize = document.createElement('span');
    fileSize.className = 'selected-file-size';
    fileSize.textContent = formatFileSize(file.size);
    
    // Adicionar botão de remover
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-file-btn';
    removeBtn.textContent = 'X';
    removeBtn.title = 'Remover arquivo';
    removeBtn.addEventListener('click', () => removeFile(file.name));
    
    // Montar o elemento
    fileItem.appendChild(fileName);
    fileItem.appendChild(fileSize);
    fileItem.appendChild(removeBtn);
    
    // Adicionar à lista
    selectedFilesContainer.appendChild(fileItem);
}

// Remover arquivo da lista
function removeFile(fileName) {
    // Remover da lista de arquivos selecionados
    selectedFiles = selectedFiles.filter(file => file.name !== fileName);
    
    // Remover da interface
    const fileItem = selectedFilesContainer.querySelector(`[data-file-name="${fileName}"]`);
    if (fileItem) {
        fileItem.remove();
    }
}

// Formatar tamanho do arquivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Excluir prompt
async function deletePrompt(id) {
    if (!confirm(i18n('confirm_delete_prompt'))) {
        return;
    }
    
    prompts = prompts.filter(p => p.id !== id);
    await savePrompts();
    
    // Renderizar prompts apenas uma vez
    if (searchInput.value) {
        handleSearch();
    } else {
        renderPrompts();
    }
}

// Copiar texto do prompt diretamente para área de transferência
async function copyPromptText(id) {
    try {
        const prompt = prompts.find(p => p.id === id);
        if (!prompt) return;
        
        await navigator.clipboard.writeText(prompt.text);
        
        // Feedback visual
        const button = document.querySelector(`.btn-copy-prompt[data-id="${id}"]`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = i18n('prompt_copied_feedback');
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Erro ao copiar prompt:', error);
        alert(i18n('error_copying_prompt'));
    }
}

// Copiar código AHK para clipboard
async function copyAhkUrl(id) {
    // Obter ID da extensão
    const extensionId = chrome.runtime.id;
    
    // Código AHK
    const ahkCode = `
; Código para injetar prompt via AHK
; ID do prompt: ${id}

#SingleInstance Force

; Opção 1: Injetar prompt diretamente (F1)
F1::
    ; Usar comunicação externa com a extensão Chrome
    Run, chrome.exe --app="javascript:window.opener=null; window.open('', '_self'); window.close(); chrome.runtime.sendMessage('${extensionId}', {action: 'insertPrompt', promptId: '${id}'}, function(response) { if (response && response.success) { console.log('Prompt enviado com sucesso'); } else { console.error('Erro ao enviar prompt'); } });"
    return

; Opção 2: Automatizar no SAP Generative AI (F2)
F2::
    ; Automatizar prompt no SAP Generative AI
    Run, chrome.exe --app="javascript:window.opener=null; window.open('', '_self'); window.close(); chrome.runtime.sendMessage('${extensionId}', {action: 'automatePrompt', promptId: '${id}'}, function(response) { if (response && response.success) { console.log('Automação iniciada com sucesso'); } else { console.error('Erro ao automatizar prompt'); } });"
    return
`;
    
    try {
        await navigator.clipboard.writeText(ahkCode);
        
        // Feedback visual
        const button = document.querySelector(`.btn-copy[data-id="${id}"]`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = i18n('copied_feedback');
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Erro ao copiar código AHK:', error);
        alert(i18n('error_copying_ahk'));
    }
}

// Verificar se foi chamado via parâmetros de URL
function checkProtocolAction() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const promptId = urlParams.get('id');
    
    if (action === 'insert' && promptId) {
        // Enviar mensagem para background.js para iniciar injeção
        chrome.runtime.sendMessage({
            action: 'injectFromExternal',
            promptId: promptId
        }).catch(error => {
            console.error('Erro ao enviar mensagem para background:', error);
        });
        
        // Fechar popup após enviar comando
        setTimeout(() => {
            window.close();
        }, 100);
    }
}

// Função utilitária para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Função para automatizar prompt no SAP Generative AI
async function automatePrompt(id) {
    try {
        // Enviar mensagem para background.js para iniciar automação
        const response = await chrome.runtime.sendMessage({
            action: 'automatePrompt',
            promptId: id
        });
        
        if (response && response.success) {
            // Feedback visual
            const button = document.querySelector(`.btn-automate[data-id="${id}"]`);
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = i18n('started_feedback');
                button.disabled = true;
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 2000);
            }
            
            // Fechar popup após enviar comando
            setTimeout(() => {
                window.close();
            }, 500);
        } else {
            alert(i18n('error_automating_prompt') + (response?.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro ao automatizar prompt:', error);
        alert(i18n('error_automating_prompt_alt') + error.message);
    }
}

// Tornar funções globais para uso nos event handlers inline
try {
    window.editPrompt = editPrompt;
    window.deletePrompt = deletePrompt;
    window.copyAhkUrl = copyAhkUrl;
    window.automatePrompt = automatePrompt;
    console.log('Funções globais registradas com sucesso');
} catch (error) {
    console.error('Erro ao registrar funções globais:', error);
}