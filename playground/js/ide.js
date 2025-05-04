let apiUrl = 'https://siwei.dev/api/vee';

// Initialize Golden Layout
const config = {
  settings: {
    showPopoutIcon: false
  },
  content: [
    {
      type: 'column',
      content: [
        {
          type: 'stack',
          height: 70,
          isClosable: false,
          content: [
            {
              type: 'component',
              componentName: 'editor',
              title: 'HelloWorld.vee',
              componentState: {
                code: `areas = ['game', 'web', 'algorithm']
for area in areas {
    print('Hello, \${area} developers!')
}`,
              },
            }
          ],
        },
        {
          type: 'component',
          componentName: 'output',
          height: 30,
          title: 'Output',
          isClosable: false,
        },
      ],
    },
  ],
};

const myLayout = new GoldenLayout(config, '#layoutContainer');


myLayout.registerComponent('placeholder', function(container, state) {
  container.getElement().html('<div style="padding:20px; color:#777;">No open files. Use File → New to create one.</div>');
});

// Editor Components
myLayout.registerComponent('editor', function (container, state) {
  const editorDiv = document.createElement('div');
  editorDiv.className = 'editor';
  container.getElement().append(editorDiv);

  const editor = ace.edit(editorDiv);
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/typescript');
  editor.setValue(state.code || '', -1);

  editor.setFontSize(18);

  container.editor = editor;
});

// Output Component
myLayout.registerComponent('output', function (container, state) {
  const outputDiv = document.createElement('div');
  outputDiv.className = 'output';
  outputDiv.innerText = 'Output will appear here...';
  container.getElement().append(outputDiv);

  container.outputDiv = outputDiv;
});

myLayout.init();

myLayout.on('beforeItemDestroyed', (item) => {
  if (item.componentName !== 'editor') return;

  // Count how many editors are currently open (including this one)
  const editors = myLayout.root.getItemsByType('component')
    .filter(c => c.componentName === 'editor');

  if (editors.length === 1) {
    // This is the last one — inject placeholder before it's gone
    const parentStack = item.parent;
    parentStack.addChild({
      type: 'component',
      isClosable: false,
      componentName: 'placeholder',
      title: 'Welcome'
    });
  }
});

document.getElementById('newFile').addEventListener('click', () => {
  myLayout.root.contentItems[0].contentItems[0].addChild({
    type: 'component',
    componentName: 'editor',
    title: 'Untitled.vee',
    componentState: { code: '' },
  });

  // Remove placeholder if present
  const placeholder = myLayout.root.getItemsByType('component').find(c => c.componentName === 'placeholder');
  if (placeholder) {
    placeholder.remove();
  }
});

// Run and Compile Buttons
document.getElementById('runButton').addEventListener('click', () => {
  // Find the editor stack (the top half)
  const column = myLayout.root.contentItems[0];
  const editorStack = column.contentItems[0]; // assuming the first item is editor stack

  const activeTab = editorStack.getActiveContentItem();

  if (activeTab && activeTab.componentName === 'editor') {
    const activeEditor = activeTab.container.editor;
    const outputPane = myLayout.root
      .getItemsByType('component')
      .find((c) => c.componentName === 'output');

    let payload = {
      data: {
          source: activeEditor.getValue()
      }
    }

    $.ajax({
        url: apiUrl + `/eval`,
        type: "POST",
        async: true,
        contentType: "application/json",
        data: JSON.stringify(payload),
        // headers: AUTH_HEADERS,
        success: function (data, textStatus, jqXHR) {
            let outputString = [];
            for (let line of data['output']) {
                outputString.push(line)
            }
            outputPane.container.outputDiv.innerText = outputString.join('\n');
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.error('Error:', textStatus, errorThrown);
            outputPane.container.outputDiv.innerText = 'Error: ' + errorThrown;
        }
    });
  } else {
    console.log('No active editor tab found!');
  }
});

document.getElementById('compileButton').addEventListener('click', () => {
  const outputPane = myLayout.root
    .getItemsByType('component')
    .find((c) => c.componentName === 'output');
  outputPane.container.outputDiv.innerText = 'Coming soon...';
});

// Handle window resize
window.addEventListener('resize', () => {
  myLayout.updateSize();
});

