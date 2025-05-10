// Initialize Ace editor
const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/typescript");
editor.setFontSize(16);
editor.setValue(`areas = ['game', 'web', 'algorithm']
for area in areas {
print('Hello, \${area} developers!')
}`);

// Initialize state tracking
let activeTab = null;
const tabs = document.getElementById('tabs');
const tabContents = new Map(); // Store tab contents
const tabCompiledStates = new Map(); // Store compiled pane states for each tab
const tabCompiledContents = new Map(); // Store compiled code content for each tab

function createTab(title, content = '') {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.draggable = true;
    tab.innerHTML = `
        <span class="title">${title}</span>
        <span class="close">&times;</span>
    `;
    
    // Store the content for this tab
    tabContents.set(tab, content);
    
    tab.addEventListener('click', () => {
        setActiveTab(tab);
    });

    tab.querySelector('.close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab);
    });

    // Add double-click handler for renaming
    const titleSpan = tab.querySelector('.title');
    titleSpan.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const input = document.createElement('input');
        input.type = 'text';
        input.value = titleSpan.textContent;
        input.className = 'title-edit';
        
        input.addEventListener('blur', () => {
            const newTitle = input.value.trim() || 'Untitled.vee';
            titleSpan.textContent = newTitle;
            input.remove();
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur();
            } else if (e.key === 'Escape') {
                input.value = titleSpan.textContent;
                input.blur();
            }
        });

        input.addEventListener('click', (e) => {
            e.stopPropagation();
        });

        titleSpan.textContent = '';
        titleSpan.appendChild(input);
        input.focus();
        input.select();
    });

    // Add drag and drop event listeners
    tab.addEventListener('dragstart', (e) => {
        tab.classList.add('dragging');
        e.dataTransfer.setData('text/plain', ''); // Required for Firefox
        e.dataTransfer.effectAllowed = 'move';
    });

    tab.addEventListener('dragend', () => {
        tab.classList.remove('dragging');
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over'));
    });

    tab.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingTab = document.querySelector('.dragging');
        if (draggingTab !== tab) {
            tab.classList.add('drag-over');
        }
    });

    tab.addEventListener('dragleave', () => {
        tab.classList.remove('drag-over');
    });

    tab.addEventListener('drop', (e) => {
        e.preventDefault();
        tab.classList.remove('drag-over');
        const draggingTab = document.querySelector('.dragging');
        if (draggingTab && draggingTab !== tab) {
            const tabs = Array.from(document.querySelectorAll('.tab:not(.home-tab)'));
            const draggingIndex = tabs.indexOf(draggingTab);
            const dropIndex = tabs.indexOf(tab);

            if (draggingIndex < dropIndex) {
                tab.parentNode.insertBefore(draggingTab, tab.nextSibling);
            } else {
                tab.parentNode.insertBefore(draggingTab, tab);
            }
        }
    });

    return tab;
}

function setActiveTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Save current editor content and compiled pane state to previous tab if exists
    if (activeTab) {
        tabContents.set(activeTab, editor.getValue());
        tabCompiledStates.set(activeTab, document.getElementById('compiledPane').style.display);
        tabCompiledContents.set(activeTab, document.getElementById('compiledCode').textContent);
    }
    
    // Load content for the new active tab
    if (tab.classList.contains('home-tab')) {
        document.getElementById('editor').style.display = 'none';
        document.getElementById('welcomePage').style.display = 'flex';
        document.getElementById('compiledPane').style.display = 'none';
        // Disable run and compile buttons
        document.getElementById('runButton').disabled = true;
        document.getElementById('compileButton').disabled = true;
    } else {
        document.getElementById('editor').style.display = 'block';
        document.getElementById('welcomePage').style.display = 'none';
        editor.setValue(tabContents.get(tab) || '');
        // Restore compiled pane state and content for this tab
        document.getElementById('compiledPane').style.display = tabCompiledStates.get(tab) || 'none';
        document.getElementById('compiledCode').textContent = tabCompiledContents.get(tab) || '';
        // Move cursor to the start of the document without selecting text
        editor.gotoLine(1, 0);
        editor.clearSelection();
        // Enable run and compile buttons
        document.getElementById('runButton').disabled = false;
        document.getElementById('compileButton').disabled = false;
    }
    activeTab = tab;
}

function closeTab(tab) {
    if (tab.classList.contains('home-tab')) return;
    
    if (document.querySelectorAll('.tab:not(.home-tab)').length === 1) {
        // If this is the last tab, show welcome page
        tab.remove();
        setActiveTab(document.querySelector('.home-tab'));
    } else {
        // If we're closing the active tab, activate the next tab
        if (tab === activeTab) {
            const nextTab = tab.nextElementSibling || tab.previousElementSibling;
            setActiveTab(nextTab);
        }
        tabContents.delete(tab);
        tabCompiledStates.delete(tab);
        tabCompiledContents.delete(tab);
        tab.remove();
    }
}

// Initialize the first tab with content
const homeTab = document.querySelector('.home-tab');
const initialTab = document.querySelector('.tab:not(.home-tab)');
tabContents.set(initialTab, editor.getValue());
activeTab = initialTab;

// Add event listeners to the home tab
homeTab.addEventListener('click', () => {
    setActiveTab(homeTab);
});

// Add event listeners to the initial tab
initialTab.addEventListener('click', () => {
    setActiveTab(initialTab);
});

initialTab.querySelector('.close').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(initialTab);
});

// Set initial state
setActiveTab(initialTab);

// Add click handlers for sample code
document.querySelectorAll('.sample').forEach(sample => {
    sample.addEventListener('click', () => {
        const code = sample.getAttribute('data-code');
        const title = sample.querySelector('h2').textContent + '.vee';
        const tab = createTab(title, code);
        tabs.appendChild(tab);
        setActiveTab(tab);
        document.getElementById('editor').style.display = 'block';
        document.getElementById('welcomePage').style.display = 'none';
    });
});

// Button handlers
document.getElementById('newFile').addEventListener('click', () => {
    const tab = createTab('Untitled.vee');
    tabs.appendChild(tab);
    setActiveTab(tab);
    editor.setValue('');
    // Hide welcome page and show editor
    document.getElementById('editor').style.display = 'block';
    document.getElementById('welcomePage').style.display = 'none';
});

document.getElementById('runButton').addEventListener('click', () => {
    const output = document.getElementById('output');
    output.textContent = 'Running...';
    output.className = 'output';

    $.ajax({
        url: 'https://siwei.dev/api/vee/eval',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            data: {
                source: editor.getValue()
            }
        }),
        success: function(data) {
            output.textContent = data.output.join('\n');
            output.className = 'output success';
        },
        error: function(jqXHR, textStatus, errorThrown) {
            output.textContent = 'Error: ' + errorThrown;
            output.className = 'output error';
        }
    });
});

document.getElementById('compileButton').addEventListener('click', () => {
    const output = document.getElementById('output');
    const compiledPane = document.getElementById('compiledPane');
    const compiledCode = document.getElementById('compiledCode');
    
    output.textContent = 'Compiling...';
    output.className = 'output';
    compiledPane.style.display = 'none'; // Hide compiled pane while compiling

    $.ajax({
        url: 'https://siwei.dev/api/vee/compile',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            data: {
                source: editor.getValue()
            }
        }),
        success: function(data) {
            output.textContent = 'Compilation successful';
            output.className = 'output success';
            const compiledContent = data.output.join('\n');
            compiledCode.textContent = compiledContent;
            compiledPane.style.display = 'flex';
            // Store the compiled content for the current tab
            if (activeTab) {
                tabCompiledContents.set(activeTab, compiledContent);
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            output.textContent = 'Error: ' + errorThrown;
            output.className = 'output error';
            compiledPane.style.display = 'none';
        }
    });
});

// Add close handler for compiled pane
document.querySelector('.compiled-pane-close').addEventListener('click', () => {
    document.getElementById('compiledPane').style.display = 'none';
});

// Add copy handler for compiled code
document.querySelector('.copy-button').addEventListener('click', () => {
    const compiledCode = document.getElementById('compiledCode').textContent;
    navigator.clipboard.writeText(compiledCode).then(() => {
        const copyButton = document.querySelector('.copy-button');
        copyButton.classList.add('copied');
        setTimeout(() => {
            copyButton.classList.remove('copied');
        }, 2000);
    });
});

// Handle window resize
window.addEventListener('resize', () => {
    editor.resize();
});

// Handle output panel resizing
const resizeHandle = document.getElementById('resizeHandle');
const output = document.getElementById('output');
const welcomePage = document.getElementById('welcomePage');
let isResizing = false;
let startY;
let startHeight;

resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startY = e.clientY;
    startHeight = output.offsetHeight;
    document.body.style.cursor = 'ns-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const deltaY = startY - e.clientY;
    const newHeight = Math.min(Math.max(startHeight + deltaY, 50), window.innerHeight * 0.8);
    output.style.height = `${newHeight}px`;
    
    // Always update welcome page position and height
    welcomePage.style.height = `calc(100% - 41px - ${newHeight}px - 5px - 49px)`;
    welcomePage.style.bottom = `${newHeight + 5}px`;
    
    editor.resize();
});

document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
});
