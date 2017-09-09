/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
**/

'use strict';

const {
//crashReporter,  // Submit crash reports to a remote server.
  app,            // Module to control application life.
  globalShortcut, // Detect keyboard events when the application does not have keyboard focus.
  BrowserWindow   // Module to create native browser window.
} = require('electron');

const path = require('path');
const url  = require('url');

// Submit crash reports to a remote server.
// https://github.com/electron/electron/blob/master/docs/api/crash-reporter.md
//crashReporter.start({
//  productName: 'YourName',
//  companyName: 'YourCompany',
//  submitURL: 'https://your-domain.com/url-to-submit',
//  uploadToServer: true
//});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    // Note: For some features you will need the node integration. (e.g. some plugins)
    // Attention: For security reasons, if possible/ if the node integration is not necessary
    //            the node integration should be disabled!!
    // Maybe this should be disabled be default?
    //webPreferences: {
    //  // Turn node integration off.
    //  nodeIntegration: false,
    //  sandbox: true
    //},

    width: 800,
    height: 600,

    // Only hide taskbar and display it on the 'Alt'-Key
    skipTaskbar: true,     // 'skip-taskbar': true,
    autoHideMenuBar: true  // 'auto-hide-menu-bar': true
  });
  // Remove taskbar and add global keyboard shortcuts.
  //mainWindow.setMenu(null);
  addGlobalShortcuts();

  // and load the index.html of the app.
  //console.log(__dirname);
  //console.log(process.cwd());
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


/**
 * Add/extend some common global shortcuts.
**/
let addGlobalShortcuts = function() {
  // Refresh content/page.
  globalShortcut.register('F5', function() {
    mainWindow.reload();
  });

  // Development: Select an element in the page to inspect it
  globalShortcut.register('CmdOrCtrl+Shift+C', function() {
    const win = BrowserWindow.getFocusedWindow();
    const inspect = () => { win.devToolsWebContents.executeJavaScript('DevToolsAPI.enterInspectElementMode()'); };
    if (win.webContents.isDevToolsOpened()) {
      inspect();
    } else {
      win.webContents.on('devtools-opened', inspect);
      win.openDevTools();
    }
  });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.