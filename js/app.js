const STORAGE_KEY = 'post-generator-data';
const TAGS_KEY = 'post-generator-tags';
const MAX_TAG_HISTORY = 20;

let easyMDE;
let generatedContent = '';

function init() {
    initEditor();
    initTheme();
    initDateTime();
    loadFromStorage();
    initEventListeners();
    updateReadTime();
    updateEditorTheme(localStorage.getItem('theme') || 'light');
    renderTagHistory();
}

function initDateTime() {
    const now = new Date();
    // Round up to next 5-minute block
    const minutes = now.getMinutes();
    const roundedMinutes = (5 - (minutes % 5)) % 5;
    now.setMinutes(now.getMinutes() + roundedMinutes);
    
    const dateStr = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('date-input').value = dateStr;
    document.getElementById('time-input').value = `${hours}:${mins}`;
}

function setNow() {
    const now = new Date();
    
    const dateStr = now.toISOString().split('T')[0];
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('date-input').value = dateStr;
    document.getElementById('time-input').value = `${hours}:${mins}`;
    saveToStorage();
}

function initEditor() {
    easyMDE = new EasyMDE({
        element: document.getElementById('editor'),
        placeholder: 'Write your post content here...',
        spellChecker: false,
        status: false,
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'code', 'quote', 'unordered-list', 'ordered-list', '|',
            'link', 'image', 'table', '|',
            'preview', 'side-by-side', 'fullscreen', '|',
            'undo', 'redo'
        ],
        sideBySideFullscreen: false,
        renderingConfig: {
            codeSyntaxHighlighting: true,
        }
    });
    
    easyMDE.codemirror.on('change', () => {
        updateReadTime();
        saveToStorage();
    });
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle .icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function initEventListeners() {
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    document.getElementById('title').addEventListener('input', saveToStorage);
    document.getElementById('teaser').addEventListener('input', saveToStorage);
    document.getElementById('tags').addEventListener('input', saveToStorage);
    document.getElementById('date-input').addEventListener('input', saveToStorage);
    document.getElementById('time-input').addEventListener('input', saveToStorage);
    document.getElementById('now-btn').addEventListener('click', setNow);
    
    document.getElementById('generate-btn').addEventListener('click', generatePost);
    document.getElementById('download-btn').addEventListener('click', downloadPost);
    document.getElementById('reset-btn').addEventListener('click', showConfirmModal);
    
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('close-confirm').addEventListener('click', closeConfirmModal);
    document.getElementById('cancel-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('confirm-btn').addEventListener('click', confirmReset);
    
    document.getElementById('close-error').addEventListener('click', closeErrorModal);
    document.getElementById('error-ok-btn').addEventListener('click', closeErrorModal);
    
    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
    document.getElementById('download-modal-btn').addEventListener('click', downloadPost);
    
    document.getElementById('output-modal').addEventListener('click', (e) => {
        if (e.target.id === 'output-modal') closeModal();
    });
    
    document.getElementById('confirm-modal').addEventListener('click', (e) => {
        if (e.target.id === 'confirm-modal') closeConfirmModal();
    });
    
    document.getElementById('error-modal').addEventListener('click', (e) => {
        if (e.target.id === 'error-modal') closeErrorModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            closeConfirmModal();
            closeErrorModal();
        }
    });
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
    updateEditorTheme(next);
}

function updateEditorTheme(theme) {
    const cmElement = easyMDE.codemirror;
    const wrapper = cmElement.getWrapperElement();
    
    if (theme === 'dark') {
        wrapper.style.backgroundColor = '#1a1a2e';
        wrapper.style.color = '#e9ecef';
        document.querySelector('.editor-toolbar').style.background = '#0f0f23';
        document.querySelector('.editor-toolbar').style.borderColor = '#3a3a5c';
        
        cmElement.setOption('styleSelectedText', false);
    } else {
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.color = '#212529';
        document.querySelector('.editor-toolbar').style.background = '#f7f7f7';
        document.querySelector('.editor-toolbar').style.borderColor = '#ced4da';
        
        cmElement.setOption('styleSelectedText', false);
    }
}

function updateReadTime() {
    const content = easyMDE.value();
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    if (words === 0) {
        document.getElementById('read-time').textContent = '— min read';
        return;
    }
    const minutes = Math.max(1, Math.ceil(words / 200));
    document.getElementById('read-time').textContent = `${minutes} min read`;
}

function saveToStorage() {
    const data = {
        title: document.getElementById('title').value,
        teaser: document.getElementById('teaser').value,
        tags: document.getElementById('tags').value,
        content: easyMDE.value(),
        date: document.getElementById('date-input').value,
        time: document.getElementById('time-input').value
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadFromStorage() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            document.getElementById('title').value = data.title || '';
            document.getElementById('teaser').value = data.teaser || '';
            document.getElementById('tags').value = data.tags || '';
            document.getElementById('date-input').value = data.date || '';
            document.getElementById('time-input').value = data.time || '';
            easyMDE.value(data.content || '');
            updateReadTime();
        } catch (e) {
            console.error('Failed to load saved data:', e);
        }
    }
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function escapeYaml(str) {
    return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function generatePost() {
    const title = document.getElementById('title').value.trim();
    const teaser = document.getElementById('teaser').value.trim();
    const tags = document.getElementById('tags').value.trim();
    const content = easyMDE.value();
    
    if (!title) {
        showErrorModal('Please enter a title');
        return;
    }
    
    const dateInput = document.getElementById('date-input');
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    const timeInput = document.getElementById('time-input').value;
    const datetime = timeInput ? `${date}T${timeInput}:00Z` : new Date().toISOString();
    
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readTime = words === 0 ? '1 min read' : `${Math.max(1, Math.ceil(words / 200))} min read`;
    
    const tagList = tags 
        ? tags.split(',').map(t => t.trim()).filter(t => t).map(t => `"${escapeYaml(t)}"`).join(', ')
        : '';
    
    const frontmatter = `---
headline: "${escapeYaml(title)}"
date: "${date}"
datetime: "${datetime}"
readTime: "${readTime}"
teaser: "${escapeYaml(teaser)}"
tags: [${tagList}]
---`;

    const body = content.trim() 
        ? content 
        : '';
    
    generatedContent = `${frontmatter}\n\n${body}`;
    
    addTagsToHistory(tags);
    
    document.getElementById('output-preview').textContent = generatedContent;
    document.getElementById('output-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('output-modal').classList.add('hidden');
}

function showConfirmModal() {
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}

function showErrorModal(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.remove('hidden');
}

function closeErrorModal() {
    document.getElementById('error-modal').classList.add('hidden');
}

function confirmReset() {
    closeConfirmModal();
    
    document.getElementById('title').value = '';
    document.getElementById('teaser').value = '';
    document.getElementById('tags').value = '';
    easyMDE.value('');
    updateReadTime();
    initDateTime();
    localStorage.removeItem(STORAGE_KEY);
    generatedContent = '';
}

function copyToClipboard() {
    const btn = document.getElementById('copy-btn');
    const original = btn.textContent;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(generatedContent).then(() => {
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = original, 2000);
        }).catch(() => {
            fallbackCopy(btn, original);
        });
    } else {
        fallbackCopy(btn, original);
    }
}

function fallbackCopy(btn, original) {
    const ta = document.createElement('textarea');
    ta.value = generatedContent;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
        document.execCommand('copy');
        btn.textContent = 'Copied!';
    } catch (e) {
        btn.textContent = 'Copy failed';
    }
    document.body.removeChild(ta);
    setTimeout(() => btn.textContent = original, 2000);
}

function downloadPost() {
    // Always regenerate from current form state
    const title = document.getElementById('title').value.trim();
    if (!title) {
        showErrorModal('Please enter a title');
        return;
    }

    if (!generatedContent) generatePost();
    if (!generatedContent) return;

    const slug = generateSlug(title);
    const date = document.getElementById('date-input').value || new Date().toISOString().split('T')[0];
    const filename = `${date}-${slug}.md`;
    
    const blob = new Blob([generatedContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    closeModal();
}

function resetForm() {
    if (!confirm('Clear all fields? This cannot be undone.')) return;
    
    document.getElementById('title').value = '';
    document.getElementById('teaser').value = '';
    document.getElementById('tags').value = '';
    easyMDE.value('');
    updateReadTime();
    initDateTime();
    localStorage.removeItem(STORAGE_KEY);
    generatedContent = '';
}

// --- Tag History ---

function loadTagHistory() {
    try {
        return JSON.parse(localStorage.getItem(TAGS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveTagHistory(tags) {
    localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
}

function addTagsToHistory(rawTags) {
    const newTags = rawTags.split(',').map(t => t.trim()).filter(t => t);
    if (!newTags.length) return;

    let history = loadTagHistory();
    // Put new tags at the front, remove duplicates
    history = [
        ...newTags.filter(t => !history.includes(t)),
        ...history
    ].slice(0, MAX_TAG_HISTORY);
    saveTagHistory(history);
    renderTagHistory();
}

function renderTagHistory() {
    const history = loadTagHistory();
    const container = document.getElementById('tag-history');
    const chips = document.getElementById('tag-chips');

    if (!history.length) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    chips.innerHTML = '';

    history.forEach(tag => {
        const chip = document.createElement('span');
        chip.className = 'tag-chip';
        chip.title = `Add "${tag}"`;

        const label = document.createElement('span');
        label.textContent = tag;
        label.addEventListener('click', () => addTagToInput(tag));

        const remove = document.createElement('span');
        remove.className = 'tag-chip-remove';
        remove.textContent = '×';
        remove.title = 'Remove from history';
        remove.addEventListener('click', (e) => {
            e.stopPropagation();
            removeTagFromHistory(tag);
        });

        chip.appendChild(label);
        chip.appendChild(remove);
        chips.appendChild(chip);
    });
}

function addTagToInput(tag) {
    const input = document.getElementById('tags');
    const existing = input.value.split(',').map(t => t.trim()).filter(t => t);
    if (!existing.includes(tag)) {
        existing.push(tag);
        input.value = existing.join(', ');
        saveToStorage();
    }
}

function removeTagFromHistory(tag) {
    const history = loadTagHistory().filter(t => t !== tag);
    saveTagHistory(history);
    renderTagHistory();
}

document.addEventListener('DOMContentLoaded', init);
