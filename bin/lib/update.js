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

const Q      = require('Q');
const create = require('./create');
const fs     = require('fs');
const shell  = require('shelljs');
const events = require('./../templates/project/cordova/lib/event-log')();
const Utils  = require('./../templates/project/cordova/lib/utils');
const {
  DirectoryNotFoundError
} = require('./../templates/project/cordova/lib/errors');


/**
 * Display create command help.
**/
module.exports.help = function () {
  events.emit('log', 'WARNING : Make sure to back up your project before updating!');
  events.emit('log', 'Usage: update PathToProject');
  events.emit('log', '    PathToProject : The path the project you would like to update.');
  events.emit('log', 'examples:');
  events.emit('log', '    update C:\\Users\\anonymous\\Desktop\\MyProject');
};

/**
 * Update electron project.
 *
 * @param {Object|Array}  argv  - Update options.   -> NOTE: argv[2] has to be the project path. <- ?? ToDo ??
 *
 * @returns {Promise}
**/
module.exports.run = function (argv) {
  //events.emit('verbose', 'update.run ' + JSON.stringify(argv));
  let d = Q.defer();
  var projectPath = argv[2];
  if (!fs.existsSync(projectPath)) {
    // if specified project path is not valid then reject promise
    d.reject(new DirectoryNotFoundError(projectPath, "Electron platform not found."));
  }
  else {
    let utils = new Utils(null, projectPath, events);
    let customizedFilesExists = utils.dirExists(utils.electronJsCustomizedDir);

    // Backup 'electron-js-customized' directory.
    if (customizedFilesExists) {
      events.emit('log', 'Backup \'electron-js-customized\' directory.');
      utils.backupCustomizedFiles();
    }

    events.emit('log', 'Removing existing electron platform.');
    shellfatal(shell.rm, '-rf', projectPath);

    // Create platform again.
    create.run(projectPath)
    .then(function(responseText) {
      // Restore 'electron-js-customized' directory backup.
      if (customizedFilesExists) {
        events.emit('log', 'Restore \'electron-js-customized\' directory backup.');
        utils.restoreCustomizedFilesBackup();
      }

      d.resolve(responseText);

    }, function(error) {
      d.reject(error);
    });
  }
  return d.promise;
};

/**
 * Run shell command in fatal modus.
 *
 * @param {Object|Array}  shellFunc  - Shell command with arguments.
 *
 * @returns {Object}  - Shell command result.
**/
function shellfatal(shellFunc) {
  let slicedArgs = Array.prototype.slice.call(arguments, 1);
  try {
    shell.config.fatal = true;
    var returnVal = shellFunc.apply(shell, slicedArgs);
  }   
  finally {
    shell.config.fatal = false;
  }
  return returnVal;
}
