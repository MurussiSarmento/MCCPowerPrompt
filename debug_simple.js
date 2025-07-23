// Debug simples para a extensão
console.log('=== DEBUG EXTENSÃO ===');

// Testar se chrome APIs estão disponíveis
console.log('chrome.runtime:', !!chrome.runtime);
console.log('chrome.i18n:', !!chrome.i18n);
console.log('chrome.storage:', !!chrome.storage);

// Testar chrome.i18n.getMessage
try {
    const msg = chrome.i18n.getMessage('extension_description');
    console.log('chrome.i18n.getMessage funciona:', msg);
} catch (error) {
    console.error('Erro chrome.i18n.getMessage:', error);
}

// Testar chrome.runtime.getURL
try {
    const url = chrome.runtime.getURL('_locales/pt_BR/messages.json');
    console.log('URL gerada:', url);
} catch (error) {
    console.error('Erro chrome.runtime.getURL:', error);
}

// Testar fetch
async function testFetch() {
    try {
        const url = chrome.runtime.getURL('_locales/pt_BR/messages.json');
        const response = await fetch(url);
        console.log('Fetch response:', response.status, response.statusText);
        
        const data = await response.json();
        console.log('Dados carregados:', Object.keys(data).length, 'chaves');
    } catch (error) {
        console.error('Erro no fetch:', error);
    }
}

testFetch();