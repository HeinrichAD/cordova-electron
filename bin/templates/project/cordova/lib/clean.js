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
const fs         = require('fs');
const shell      = require('shelljs');
const path       = require('path');
const Utils      = require('./utils');
const eventSetup = require('./event-log');


/**
 * Display clean command help.
**/
exports.help = function(args) {
  let events = eventSetup();
  events.emit('log', 'Implement Help');
};

/**
 * Clean electron project.
 * Wipe out platform build and cleanup platform www directory.
 *
 * @param {object|Array}  [options]  - Clean options.   e.g.: {"verbose":true,"argv":[],"fetch":true}
 * @param {EventEmitter}  [events]   - 
 * @param {Api}           [api]      - Api.js instance
 *
 * @returns {Promise}
**/
exports.run = function(options, events, api) {
  //let utils = (api) ? api : new Utils(Utils.PLATFORM_NAME, path.join(__dirname, './../..'), events);
  let utils = (api) ? api : new Utils(null, null, events);
  //let utils = (api) ? api : new Utils();
  events = utils.events;
  //events.emit('verbose', 'clean.run ' + JSON.stringify(arguments));
  let d = Q.defer();

  events.emit('log', 'Cleaning electron project.');

  // Cleanup platform www.
  utils.cleanupWww();

  // Wipe out platform build.
  if (fs.existsSync(utils.platformBuildDir)) {
    shell.rm('-rf', utils.platformBuildDir);
  }

  return d.promise;
};
