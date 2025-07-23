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
    await Promise.all([
        loadPrompts(),
        loadConfig()
    ]);
    
    renderPrompts();
    setupEventListeners();
    
    // Verificar se foi chamado via protocolo AHK
    checkProtocolAction();
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
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        config = { 
            sapGenAiUrl: DEFAULT_SAP_GENAI_URL,
            storageType: 'local'
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
                <h3>Nenhum prompt encontrado</h3>
                <p>${filteredPrompts ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro prompt'}</p>
            </div>
        `;
        return;
    }
    
    promptsList.innerHTML = promptsToRender.map(prompt => `
        <div class="prompt-item" data-id="${prompt.id}">
            <div class="prompt-header">
                <h3 class="prompt-title">${escapeHtml(prompt.title)}</h3>
                ${prompt.category ? `<span class="prompt-category">${escapeHtml(prompt.category)}</span>` : ''}
            </div>
            <div class="prompt-text">${escapeHtml(prompt.text)}</div>
            ${prompt.tags && prompt.tags.length > 0 ? `
                <div class="prompt-tags">
                    ${prompt.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <div class="prompt-actions">
                <button class="btn-small btn-copy" data-id="${prompt.id}" data-action="copy" title="Copiar URL AHK">
                    📋 URL AHK
                </button>
                <button class="btn-small btn-edit" data-id="${prompt.id}" data-action="edit" title="Editar">
                    ✏️ Editar
                </button>
                <button class="btn-small btn-delete" data-id="${prompt.id}" data-action="delete" title="Excluir">
                    🗑️ Excluir
                </button>
            </div>
        </div>
    `).join('');
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
            case 'copy':
                copyAhkUrl(id);
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
    modalTitle.textContent = 'Adicionar Prompt';
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
    modalTitle.textContent = 'Editar Prompt';
    
    document.getElementById('promptTitle').value = prompt.title;
    document.getElementById('promptText').value = prompt.text;
    document.getElementById('promptTags').value = prompt.tags ? prompt.tags.join(', ') : '';
    document.getElementById('promptCategory').value = prompt.category || '';
    
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
function openConfigModal() {
    // Preencher formulário com valores atuais
    document.getElementById('sapGenAiUrl').value = config.sapGenAiUrl || '';
    storageTypeSelect.value = 'local';
    
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
    storageTypeSelect.value = 'local';
    
    // Resetar configurações no objeto
    config.sapGenAiUrl = DEFAULT_SAP_GENAI_URL;
    config.storageType = 'local';
    
    await saveConfig();
    
    alert('Configurações restauradas para o padrão!');
}

// Submeter formulário de configurações
async function handleConfigFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(configForm);
    const sapGenAiUrl = formData.get('sapGenAiUrl').trim();
    
    // Atualizar configurações
    config.sapGenAiUrl = sapGenAiUrl || DEFAULT_SAP_GENAI_URL;
    config.storageType = 'local';
    
    try {
        // Salvar configurações
        await saveConfig();
        
        // Notificar background script sobre mudança de configuração
        chrome.runtime.sendMessage({ action: 'configUpdated' });
        
        closeConfigModalHandler();
        alert('Configurações salvas com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Erro ao salvar configurações: ' + error.message);
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
        alert('Erro ao exportar prompts: ' + error.message);
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
        alert('Formato de arquivo não suportado. Use .json ou .zip');
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
            
            alert(`${newPrompts.length} prompts importados com sucesso!`);
        } catch (error) {
            console.error('Erro ao importar prompts:', error);
            alert('Erro ao importar prompts: ' + error.message);
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
    const title = formData.get('title').trim();
    const text = formData.get('text').trim();
    const tagsString = formData.get('tags').trim();
    const category = formData.get('category').trim();
    
    if (!title || !text) {
        alert('Título e texto são obrigatórios!');
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
        knowledgeBaseFiles: knowledgeBaseFiles.length > 0 ? knowledgeBaseFiles : null
    };
    
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
    renderPrompts();
    closeModalHandler();
    
    // Limpar busca se houver
    if (searchInput.value) {
        searchInput.value = '';
        handleSearch();
    }
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
    if (!confirm('Tem certeza que deseja excluir este prompt?')) {
        return;
    }
    
    prompts = prompts.filter(p => p.id !== id);
    await savePrompts();
    renderPrompts();
    
    // Atualizar busca se houver
    if (searchInput.value) {
        handleSearch();
    }
}

// Copiar código AHK para clipboard
async function copyAhkUrl(id) {
    // Criar código AHK que usa chrome.runtime.sendMessage para comunicação externa
    const extensionId = chrome.runtime.id;
    const ahkCode = `
; Código AHK para mcc PromptFlow
; ID do prompt: ${id}

#SingleInstance Force

F1::
    ; Usar comunicação externa com a extensão Chrome
    Run, chrome.exe --app="javascript:window.opener=null; window.open('', '_self'); window.close(); chrome.runtime.sendMessage('${extensionId}', {action: 'insertPrompt', promptId: '${id}'}, function(response) { if (response && response.success) { console.log('Prompt enviado com sucesso'); } else { console.error('Erro ao enviar prompt'); } });"
    return
`;
    
    try {
        await navigator.clipboard.writeText(ahkCode);
        
        // Feedback visual
        const button = document.querySelector(`.btn-copy[data-id="${id}"]`);
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '✅ Copiado!';
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Erro ao copiar código AHK:', error);
        alert('Erro ao copiar código AHK para o clipboard');
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

// Tornar funções globais para uso nos event handlers inline
try {
    window.editPrompt = editPrompt;
    window.deletePrompt = deletePrompt;
    window.copyAhkUrl = copyAhkUrl;
    console.log('Funções globais registradas com sucesso');
} catch (error) {
    console.error('Erro ao registrar funções globais:', error);
}