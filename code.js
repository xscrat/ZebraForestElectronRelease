/**
 * Blockly Demos: Code
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
  'en': 'English',
  'zh-hans': '简体中文',
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = ['ar', 'fa', 'he', 'lki'];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

const { dialog } = require('electron').remote;
const fs = require('fs');
Code.pythonEditor = null;
Code.curFileName = '';
Code.isBlocklyModified = false;
Code.isPythonModified = false;
Code.serial = '';
Code.isClientsPanelInitialized = false;
Code.codePrefix = 'from bm import bm\n' +
  'bm_master=bm.bm()\n' +
  'bm_clients=bm_master.get_clients()\n';

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'zh-hans';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on App Engine Storage or in session/local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  if (defaultXml) {
    // Load the editor with default starting blocks.
    var xml = Blockly.Xml.textToDom(defaultXml);
    Blockly.Xml.domToWorkspace(xml, Code.workspace);
  }
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['blocks', 'python'];

Code.selected = 'blocks';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName, shouldGenerateCode=true) {
  // If the XML tab was open, save and render the content.
  if (document.getElementById('tab_python').className == 'tabon') {
    if (Code.isPythonModified) {
      let options  = {
        buttons: ['否', '是'],
        message: '切换到Block会清除python代码的修改，是否继续?'
      }
      let response = dialog.showMessageBoxSync(options)
      if (response != 1) {
        return
      }
    }
  }

  if (document.getElementById('tab_blocks').className == 'tabon') {
    Code.workspace.setVisible(false);
  }
  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    document.getElementById('tab_' + name).className = 'taboff';
    if (name == 'python' && Code.pythonEditor) {
      Code.pythonEditor.getWrapperElement().style.visibility = 'hidden';
    } else {
      document.getElementById('content_' + name).style.visibility = 'hidden';
    }
  }

  // Select the active tab.
  Code.selected = clickedName;
  document.getElementById('tab_' + clickedName).className = 'tabon';
  // Show the selected pane.
  if (clickedName == 'python' && Code.pythonEditor) {
    Code.pythonEditor.getWrapperElement().style.visibility = 'visible';
  } else {
    document.getElementById('content_' + clickedName).style.visibility = 'visible';
  }

  if (shouldGenerateCode) {
    Code.renderContent();
  }
  if (clickedName == 'blocks') {
    Code.workspace.setVisible(true);
  }
  Blockly.svgResize(Code.workspace);
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  var content = document.getElementById('content_' + Code.selected);
  if (content.id == 'content_python') {
    var code = Code.codePrefix + Blockly.Python.workspaceToCode(Code.workspace);
    Code.pythonEditor.getDoc().setValue(code);
    Code.isPythonModified = false;
  }
};

/**
 * Check whether all blocks in use have generator functions.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.checkAllGeneratorFunctionsDefined = function(generator) {
  var blocks = Code.workspace.getAllBlocks(false);
  var missingBlockGenerators = [];
  for (var i = 0; i < blocks.length; i++) {
    var blockType = blocks[i].type;
    if (!generator[blockType]) {
      if (missingBlockGenerators.indexOf(blockType) === -1) {
        missingBlockGenerators.push(blockType);
      }
    }
  }

  var valid = missingBlockGenerators.length == 0;
  if (!valid) {
    var msg = 'The generator code for the following blocks not specified for '
        + generator.name_ + ':\n - ' + missingBlockGenerators.join('\n - ');
    Blockly.alert(msg);  // Assuming synchronous. No callback.
  }
  return valid;
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.initLanguage();

  Code.pythonEditor = CodeMirror.fromTextArea(document.getElementById("content_python"), {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    mode: 'python',
  });
  Code.pythonEditor.on('change', function(editor, change) {
    Code.isPythonModified = true;
  })

  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
    var bBox = Code.getBBox_(container);
    var el = document.getElementById('content_blocks');
    el.style.top = bBox.y + 'px';
    el.style.left = bBox.x + 'px';
    // Height and width need to be set, read back, then set again to
    // compensate for scrollbars.
    el.style.height = bBox.height + 'px';
    el.style.height = (2 * bBox.height - el.offsetHeight) + 'px';
    el.style.width = bBox.width + 'px';
    el.style.width = (2 * bBox.width - el.offsetWidth) + 'px';

    Code.pythonEditor.setSize(bBox.width, bBox.height)
    Code.pythonEditor.refresh()

    // Make the 'Blocks' tab line up with the toolbox.
    if (Code.workspace && Code.workspace.toolbox_.width) {
      document.getElementById('tab_blocks').style.minWidth =
          (Code.workspace.toolbox_.width - 38) + 'px';
          // Account for the 19 pixel margin and on each side.
      document.getElementById('tab_python').style.minWidth =
          (Code.workspace.toolbox_.width - 38) + 'px';
    }
  };
  window.addEventListener('resize', onresize, false);

  // The toolbox XML specifies each category name using Blockly's messaging
  // format (eg. `<category name="%{BKY_CATLOGIC}">`).
  // These message keys need to be defined in `Blockly.Msg` in order to
  // be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
  // been defined for each language to import each category name message
  // into `Blockly.Msg`.
  // TODO: Clean up the message files so this is done explicitly instead of
  // through this for-loop.
  for (var messageKey in MSG) {
    if (messageKey.indexOf('cat') == 0) {
      Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
  }

  // Construct the toolbox XML, replacing translated variable names.
  var toolboxText = document.getElementById('toolbox').outerHTML;
  toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g,
      function(m, p1, p2) {return p1 + MSG[p2];});
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);

  Code.workspace = Blockly.inject('content_blocks',
      {grid:
          {spacing: 25,
           length: 3,
           colour: '#ccc',
           snap: true},
       media: 'blockly/media/',
       rtl: rtl,
       toolbox: toolboxXml,
       zoom:
           {controls: true,
            wheel: true}
      });

  Code.loadBlocks('');

  if ('BlocklyStorage' in window) {
    // Hook a save function onto unload.
    BlocklyStorage.backupOnUnload(Code.workspace);
  }

  Code.tabClick(Code.selected);

  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name,
        function(name_) {return function() {Code.tabClick(name_);};}(name));
  }

  Code.workspace.addChangeListener(function(event) {
    if (event.toJson()['type'] == 'finished_loading') {
      Code.isBlocklyModified = false;
    } else {
      Code.isBlocklyModified = true;
    }
  });

  Code.bindClick('new', function() {
    if (!Code.trySaveFirst()) {
      return;
    }
    Code.workspace.clear();
    Code.pythonEditor.getDoc().setValue('');
    Code.isBlocklyModified = false;
    Code.isPythonModified = false;
    Code.curFileName = "";
    Code.tabClick('blocks', false);
    Code.refreshDocumentTitle();
  });

  Code.bindClick('open', function() {
    if (!Code.trySaveFirst()) {
      return;
    }
    Code.openBlocklyFile();
  });

  Code.bindClick('save', function() {
    Code.saveBlockly();
  });

  Code.bindClick('saveAs', function() {
    Code.saveBlockly(true);
  });

  Code.bindClick('setting', function() {
    const {remote} = require('electron');
    let win = new remote.BrowserWindow({
      width: 200,
      height: 200,
      frame: false,
      parent: remote.getCurrentWindow(),
      modal: false,
      webPreferences: {
        nodeIntegration: true
      },
    })

    var theUrl = `file://${__dirname}/setting.html`
    win.loadURL(theUrl);
    // win.webContents.openDevTools()
  });

  Code.bindClick('run', function() {
    Code.runPython();
  });

  onresize();
  Blockly.svgResize(Code.workspace);

  Code.isBlocklyModified = false;
  Code.refreshDocumentTitle();

  const { ipcRenderer } = require('electron');
  ipcRenderer.on('message', (event, message) => {
    Code.serial = message;
  });

  setInterval(() => {
    const { spawn } = require('child_process');
    const getClientProcess = spawn('python3', ['bm.py', 'get_clients']);
    getClientProcess.stdout.on('data', function(data) {
      gCurrentClients = JSON.parse(data);
      if (!Code.isClientsPanelInitialized) {
        Code.isClientsPanelInitialized = true;
        Code.getClientsInfo();
      }
    });
  }, 2000);

};

Code.getClientsInfo = function() {
  const { spawn } = require('child_process');
  const getClientsInfoProcess = spawn('python3', ['bm.py', 'get_clients_info', JSON.stringify(gCurrentClients)]);
  getClientsInfoProcess.stdout.on('data', function(data) {
    var clientsInfo = JSON.parse(data);
    var clientsInfoHTML = '<table width="90%"><tr class="blankRowLarge"><td width="100%"></td></tr>';
    for (var i = 0; i < clientsInfo.length; i++) {
      clientsInfoHTML += '<tr><td>';
      clientsInfoHTML += '<table class="spriteInfoTable">';
      var clientConnectionStatusText = '斑码妈妈连接状态:';
      var imageElement = '';
      if (clientsInfo[i][1]) {
        clientConnectionStatusText += '已连接';
        imageElement = '<img src="images/green_circle.png"></img>';
      } else {
        clientConnectionStatusText += '未连接';
        imageElement = '<img src="images/red_circle.png"></img>';
      }
      clientsInfoHTML += '<tr><td>' + clientConnectionStatusText + '</td>' + 
                         '<td>' + imageElement + '</td></tr>';
      clientsInfoHTML += '</table></td></tr>';
      clientsInfoHTML += '<tr class="blankRow"><td></td></tr>';
    }
    clientsInfoHTML += '<tr class="blankRowLarge"><td></td></tr>';
    for (var i = 0; i < clientsInfo.length; i++) {
      clientsInfoHTML += '<tr><td>';
      clientsInfoHTML += '<table class="spriteInfoTable">';
      clientsInfoHTML += '<tr><td>' + '精灵编号: ' + clientsInfo[i][0] + '</td></tr>';
      clientsInfoHTML += '<tr><td>' + '精灵电量: ' + clientsInfo[i][2] + '</td></tr>';
      clientsInfoHTML += '<tr><td>' + '精灵序列:xxxxxxxx</td></tr>';
      clientsInfoHTML += '</table>';
      clientsInfoHTML += '</td></tr>';
      clientsInfoHTML += '<tr class="blankRow"><td></td></tr>';
    }
    clientsInfoHTML += '<tr class="blankRow"><td></td></tr>'
    clientsInfoHTML += '</table>';

    document.getElementById('clients_panel').innerHTML = clientsInfoHTML;
  });
}

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
  // Set the HTML's language and direction.
  var rtl = Code.isRtl();
  document.dir = rtl ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', Code.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }

  document.getElementById('tab_blocks').textContent = MSG['blocks'];
};

/**
 * Execute the user's code.
 * Just a quick and dirty eval.  Catch infinite loops.
 */
Code.runPython = function() {
  var generator = Blockly.Python;
  var editorCode = Code.pythonEditor.getDoc().getValue();
  var code = '';
  if (!editorCode) {
    if (Code.checkAllGeneratorFunctionsDefined(generator)) {
      code = Code.codePrefix + generator.workspaceToCode(Code.workspace);
    } else {
      alert('转换python代码失败');
      return false;
    }
  } else {
    code = editorCode;
  }

  var platform = window.navigator.platform;
  var child_process = require('child_process');
  if (platform.indexOf('Win') != -1) {
    child_process.exec("start cmd.exe /K python3 -c ".concat("'", code, "'"));
  } else {
    fs.writeFileSync('tmp.py', code, 'utf-8');
    fs.chmodSync('tmp.py', '755');
    var command = "python3 tmp.py"
    child_process.exec("gnome-terminal -e 'bash -c \"" + command + ";bash\"'");
  }
};

/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Code.workspace.getAllBlocks(false).length;
  if (count < 2 ||
      window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
    Code.workspace.clear();
    if (window.location.hash) {
      window.location.hash = '';
    }
  }
};

Code.refreshDocumentTitle = function() {
  var displayFileName = '未命名';
  if (Code.curFileName) {
    displayFileName = Code.curFileName;
  }
  document.title = '斑码妈妈-' + displayFileName;
  document.getElementById('title').textContent = document.title;
}

Code.trySaveFirst = function() {
  var needSave = false;
  if (Code.curFileName) {
    needSave = Code.isBlocklyModified || Code.isPythonModified;
  } else {
    var curBlocksCount = Code.workspace.getAllBlocks(false).length;
    if (curBlocksCount > 0) {
      needSave = true;
    }
  }

  if (needSave) {
    let options  = {
      buttons: ['取消', '否', '是'],
      message: '是否先保存当前文档?'
    }
    let response = dialog.showMessageBoxSync(options)
    if (response == 2) {
      if (!Code.saveBlockly()) {
        return false;
      }
    } else if (response == 0) {
      return false;
    }
  }
  return true;
}

Code.doSaveBlockly = function(filename) {
  if (!filename) {
    alert("Filename is empty");
  }
  var xml = Blockly.Xml.workspaceToDom(Code.workspace);
  var xml_text = Blockly.Xml.domToText(xml);
  try {
    fs.writeFileSync(filename + '.bmk', xml_text, 'utf-8');
  } catch(e) {
    alert('保存文件失败!');
    return false;
  }
  var pythonFilename = filename + '.py'
  var generator = Blockly.Python;
  var editorCode = Code.pythonEditor.getDoc().getValue();
  var saveCode = '';
  if (!editorCode) {
    if (Code.checkAllGeneratorFunctionsDefined(generator)) {
      saveCode = Code.codePrefix + generator.workspaceToCode(Code.workspace);
    } else {
      alert('转换python代码失败');
      return false;
    }
  } else {
    saveCode = editorCode;
  }
  try {
    fs.writeFileSync(pythonFilename, saveCode, 'utf-8');
  } catch (e) {
    alert('保存py文件失败');
    return false;
  }
  Code.curFileName = filename;
  Code.isBlocklyModified = false;
  Code.isPythonModified = false;
  Code.refreshDocumentTitle();
  return true;
}

Code.saveBlockly = function(isSaveAs=false) {
  if (!Code.curFileName || isSaveAs) {
    const path = require('path');
    const options = {
      'filters':[
        {name: 'Blockly and Python', extensions: ['bmk', 'py']}
      ],
      'defaultPath': path.join(`${__dirname}`, '../'),
    };
    dialog.showSaveDialog(null, options, function(filename) {
      if (filename === undefined) {
          return false;
      }
      filename = filename.split('.')[0]
      return Code.doSaveBlockly(filename)
    });
  } else {
    return Code.doSaveBlockly(Code.curFileName);
  }
}

Code.openBlocklyFile = function() {
  const path = require('path');
  const options = {
    'filters':[
      {name: 'Blockly', extensions: ['bmk']},
      {name: 'Python', extensions: ['py']},
    ],
    'defaultPath': path.join(`${__dirname}`, '../'),
  };
  dialog.showOpenDialog(null, options, function(filenames) {
    if (filenames === undefined) {
        return false;
    }
    fs.readFile(filenames[0], 'utf-8', function(err, data) {
      if (err) {
          alert("读取文件错误");
          return;
      }
      var filenameFull = filenames[0];
      Code.workspace.clear();
      Code.pythonEditor.getDoc().setValue('');
      if (filenameFull.endsWith('bmk')) {
        Code.tabClick('blocks', false);
        var xml = Blockly.Xml.textToDom(data);
        Blockly.Xml.domToWorkspace(xml, Code.workspace);
        Code.isBlocklyModified = false;
        Code.isPythonModified = false;
      } else {
        Code.tabClick('python', false);
        Code.pythonEditor.getDoc().setValue(data);
        Code.isBlocklyModified = false;
        Code.isPythonModified = true;
      }
      Code.curFileName = filenameFull.split('.')[0];
      Code.refreshDocumentTitle();
    });
  });
}

// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="blockly/msg/js/' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);
