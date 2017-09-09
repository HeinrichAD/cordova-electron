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

const Q          = require('Q');
const path       = require('path');
const fs         = require('fs');
const clean      = require('./clean');
const shell      = require('shelljs');
const check_reqs = require('./check_reqs');
const eventSetup = require('./event-log');
const Utils      = require('./utils');
//const builder    = require("electron-builder")
//const Platform   = builder.Platform
const {
  RequirementError,
  NotImplementedError
} = require('./errors');


/**
 * Display build command help.
**/
exports.help = function() {
  let events = eventSetup();
  events.emit('log', 'Implement Help'); // DoTo
};

/**
 * Build electron project.
 *
 * Two possibilities:
 *   - build called to run the project (`cordova run electron`)
 *       Build will only prepare/ sync app www and platform www.
 *   - build called to build the project      // ToDo
 *       - create runable files               // ToDo
 *       - create zip file with project data  // ToDo
 *
 * @param {Object|Array}  [options]  - Build options.   e.g.: {"verbose":true,"argv":[],"fetch":true}
 * @param {EventEmitter}  [events]   - An EventEmitter instance to log events/messages.
 * @param {Api}           [api]      - Api.js instance
 *
 * @returns {Promise}
**/
exports.run = function(options, events, api) {
  //let utils = (api) ? api : new Utils(Utils.PLATFORM_NAME, path.join(__dirname, './../..'), events);
  let utils = (api) ? api : new Utils(null, null, events);
  //let utils = (api) ? api : new Utils();
  events = utils.events;
  let d = Q.defer();

  check_reqs.run(events, api)
  .then(function(responseText) {
    //let utils = Utils.getUtils(events, api);
    let action = utils.tryFetchAction() || 'build';

    events.emit('log', 'Sync app www and platform www.');
    utils.updateWww();

    if (action == 'run') {
      d.resolve(); // Nothing else to do.
    }
    else { // build
      events.emit('log', 'Building electron project.');
      buildApps(d, events, utils);
    }

  }, function(error) {
    d.reject(error || new RequirementError('Please make sure you meet the software requirements.'));
  });

 return d.promise;
};


/**
 * Create runable files and a zip file with all project data.
 *
 * @param  {Q.defer}       d        - Deferred promise object.
 * @param  {EventEmitter}  events   - An EventEmitter instance to log events/messages.
 * @param  {Utils}         utils    - Electron utils object instance.
 *
 * @returns {Promise}
**/
let buildApps = function(d, events, utils) {
  if (!fs.existsSync(utils.platformBuildDir)) {
    shell.mkdir('-p', utils.platformBuildDir);
  }

  // ToDo:
  // https://www.electron.build/
  // https://github.com/electron-userland/electron-builder/wiki/electron-builder
  // Or maybe: https://github.com/electron/windows-installer
  d.reject(new NotImplementedError('Building electron project is still on the todo list.'));

  //// Promise is returned
  //return builder.build({
  //  //config: {
  //  // "//": "build options, see https://goo.gl/ZhRfla"
  //  //}
  //});
};
