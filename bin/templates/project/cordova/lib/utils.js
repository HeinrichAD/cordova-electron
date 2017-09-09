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

const fs         = require('fs');
const path       = require('path');
const shell      = require('shelljs');
const eventSetup = require('./event-log');
const {
  DirectoryNotFoundError,
  FileNotFoundError,
  Error
} = require('./errors');
const {
  ConfigParser,
  PlatformJson
} = require('cordova-common');

const PLATFORM_NAME = 'electron';


/**
 * @class
 * Electron project utility class.
 *
 * @param {String}        [platform=PLATFORM_NAME]   - Platform name.
 * @param {String}        platformRoot               - Electron platform root path.
 * @param {EventEmitter}  [events]                   - An EventEmitter instance to log events/messages.
 * @param {Object}        [obj]                      - This object will be merged with the new Utility class object.
 * @param {Boolean}       [validate=true]            - Validate properties/data.
**/
let Utils = function(platform, platformRoot, events, obj, validate=true) {
  let self = this;

  //----- Utils methods -----\\

  /**
   * Check if all paths and objects are valid.
   *
   * @param {Boolean}  [throwable=false]   - If true and if anything is not valid an error will be thrown.
   *
   * @returns {Boolean}
  **/
  self.isValid = function(throwable = false) {
    let result = true;

    result = result && self.dirExists(self.platformRoot,        throwable, 'Platform root directory not found.');
    result = result && self.dirExists(self.platformWww,         throwable, 'Platform www directory not found.');
    result = result && self.dirExists(self.appRoot,             throwable, 'App root directory not found.');
    result = result && self.dirExists(self.appWww,              throwable, 'App www directory not found.');
    result = result && self.dirExists(self.platformTemplateWww, throwable, 'Platform template www directory (\'platform_www\') not found.');

    // throwable: false; After platform create there is no platform.json available.
    result = result && self.fileExists(self.platformJsonFile,   false,     'Platform json file not found.');
    result = result && self.isObjectEmpty(self.platformJson,    false,     'Platform json file object is empty.');

    result = result && self.fileExists(self.platformConfigFile, throwable, 'Platform config file not found.');
    result = result && self.fileExists(self.appJsonFile,        throwable, 'App json file not found.');
    result = result && self.fileExists(self.appConfigFile,      throwable, 'App config file not found.');

    result = result && self.isObjectEmpty(self.platformConfig,  throwable, 'Platform config file object is empty.');
    result = result && self.isObjectEmpty(self.appPackageJson,  throwable, 'App package.json file object is empty.');
    result = result && self.isObjectEmpty(self.appConfig,       throwable, 'App config file object is empty.');

    return result;
  };

  /**
   * Check if directory exists.
   *
   * @param {String}   dir                 - Directory path.
   * @param {Boolean}  [throwable=false]   - If true and if anything is not valid an error will be thrown.
   * @param {String}   [msg=false]         - If an error will be thrown this will be passed as error message.
   *
   * @returns {Boolean}
  **/
  self.dirExists = function(dir, throwable = false, msg = null) {
    let result = fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    if (!result && throwable) {
      throw new DirectoryNotFoundError(dir, msg);
    }
    return result;
  };

  /**
   * Check if file exists.
   *
   * @param {String}   file                - File path.
   * @param {Boolean}  [throwable=false]   - If true and if anything is not valid an error will be thrown.
   * @param {String}   [msg=false]         - If an error will be thrown this will be passed as error message.
   *
   * @returns {Boolean}
  **/
  self.fileExists = function(file, throwable = false, msg = null) {
    let result = fs.existsSync(file) && fs.statSync(file).isFile();
    if (!result && throwable) {
      throw new FileNotFoundError(file, msg);
    }
    return result;
  };

  /**
   * Check if object is empty or undefined.
   *
   * @param {String}   file                - File path.
   * @param {Boolean}  [throwable=false]   - If true and if anything is not valid an error will be thrown.
   * @param {String}   [msg=false]         - If an error will be thrown this will be passed as error message.
   *
   * @returns {Boolean}
  **/
  self.isObjectEmpty = function(obj, throwable = false, msg = null) {
    // Maybe ECMA 5+ solution?
    // Object.keys(obj).length === 0 && obj.constructor === Object
    // obj.constructor === Object due to Object.keys(new Date()).length returns 0

    let result = true; // Default: object is empty or undefined.

    if (obj) {
      for(var prop in obj) {
        if(obj.hasOwnProperty(prop));
          return false;
      }

      result = JSON.stringify(obj) === JSON.stringify({});
    }

    if (result && throwable) {
      throw new Error(msg);
    }

    return result;
  };


  /**
   * Update/sync app www and platform www directories.
  **/
  self.updateWww = function() {
    // Not necessary due to the fact that cordova will call Api.clean() before build, run, etc.
    //self.cleanupWww();

    // Copy over stock platform www assets (cordova.js, main.js, ...)
    shell.cp('-rf', path.join(self.platformTemplateWww, '*'), self.platformWww);

    // Copy over all default eletron files.
    shell.cp('-rf', path.join(self.electronJs, '*'), self.platformWww);

    // Copy over all customized eletron files.
    if (self.dirExists(self.electronJsCustomizedDir)) {
      shell.cp('-rf', path.join(self.electronJsCustomizedDir, '*'), self.platformWww);
    }

    // Copy over all app www assets (overwriting template files)
    shell.cp('-rf', path.join(self.appWww, '*'), self.platformWww);
  };

  /**
   * Cleanup platform www directory.
  **/
  self.cleanupWww = function() {
    shell.rm('-rf', self.platformWww);
    shell.mkdir(self.platformWww);
  };

  /**
   * Backup customized files if exist.
   *
   * @param {String}   [backupPath]   - Path to backup directory.
  **/
  self.backupCustomizedFiles = function(backupPath) {
    if (self.dirExists(self.electronJsCustomizedDir)) {
      backupPath = backupPath || getBackupPath();
      shell.mkdir('-p', backupPath);
      shell.cp('-rf', path.join(self.electronJsCustomizedDir, '*'), backupPath);
    }
  };

  /**
   * Restore customized files backup is exists.
   *
   * @param {String}   [backupPath]     - Path to backup directory.
   * @param {Boolean}  [cleanup=true]   - If true the backup directory will be removed after restore; 
   *                                      otherwise the backup directory will be left.
  **/
  self.restoreCustomizedFilesBackup = function(backupPath, cleanup = true) {
    backupPath = backupPath || getBackupPath();
    if (self.dirExists(backupPath)) {
      shell.mkdir('-p', self.electronJsCustomizedDir);
      shell.cp('-rf', path.join(backupPath, '*'), self.electronJsCustomizedDir);

      if (cleanup) {
        shell.rm('-rf', backupPath);
      }
    }
  };

  /**
   * Get backup directory path.
   *
   * @returns {String}  - Full path to backup directory.
  **/
  let getBackupPath = function() {
    // ejcb: electron js customized backup in short
    return path.join(self.platformRoot, './../tmp/ejcb');
  }

  /**
   * Try to fetch current run intention.
   *
   * Possible intentions which could be fetched.
   *   - run    `cordova run electron`
   *   - build  `cordova build electron`
   *   - clean  `cordova clean electron`
   *
   * @returns {String}  - One of the possible intentions: 'run', 'build', 'clean'; otherwise null.
  **/
  self.tryFetchAction = function() {
    if (process.argv.indexOf('run')   != -1) return 'run';
    if (process.argv.indexOf('build') != -1) return 'build';
    if (process.argv.indexOf('clean') != -1) return 'clean';
    return null;
  };

  //----- End of Utils methods -----\\



  //----- PluginHandler Constructor logic -----\\

  self.events = eventSetup(events);

  self.platformRoot            = platformRoot || path.join(__dirname, './../..');
  self.platform                = platform || PLATFORM_NAME; // || path.basename(self.platformRoot)
  
  self.platformWww             = path.join(self.platformRoot, 'www');
  self.platformTemplateWww     = path.join(self.platformRoot, 'platform_www');
  self.platformRes             = path.join(self.platformRoot, 'res');
  self.appRoot                 = path.join(self.platformRoot, './../..');
  self.appWww                  = path.join(self.appRoot,      'www');
  self.platformBuildDir        = path.join(self.platformRoot, 'build');
  self.electronJs              = path.join(self.platformRoot, 'electron-js');
  self.electronJsCustomizedDir = path.join(self.platformRoot, 'electron-js-customized');

  self.platformJsonFile        = path.join(self.platformRoot, self.platform + '.json');
  self.platformJson            = PlatformJson.load(self.platformRoot, self.platform);
  self.platformConfigFile      = path.join(self.platformRoot, 'config.xml');
  self.platformConfig          = new ConfigParser(self.platformConfigFile);

  self.appJsonFile             = path.join(self.appRoot, 'package.json');
  self.appPackageJson          = PlatformJson.load(self.appRoot, 'package');
  self.appConfigFile           = path.join(self.appRoot, 'config.xml');
  self.appConfig               = new ConfigParser(self.appConfigFile);

  self.version                 = require('./../version');

  self.locations = {
    platformRootDir:  self.platformRoot,
    root:             self.platformRoot, //self.appRoot,
    www:              self.appWww,
    res:              self.platformRes,
    configXml:        self.platformConfigFile,
    defaultConfigXml: '',  // ToDo
    build:            self.platformBuildDir,

    // NOTE: Due to platformApi spec we need to return relative paths here
    cordovaJs:    'bin/templates/project/assets/www/cordova.js',
    cordovaJsSrc: 'cordova-js-src'
  };

  if (validate) {
    self.isValid(true);
  }

  if (obj) obj = Object.assign(obj, this);

  //----- End of PluginHandler Constructor logic -----\\
};


Utils.PLATFORM_NAME = PLATFORM_NAME;
module.exports = Utils;
