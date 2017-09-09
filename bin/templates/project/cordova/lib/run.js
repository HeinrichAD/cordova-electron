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
const spawn      = require('child_process').spawn;
const path       = require('path');
const electron   = require('electron-prebuilt');
const check_reqs = require('./check_reqs');
const Utils      = require('./utils');
const eventSetup = require('./event-log');
const {
  RequirementError
} = require('./errors');


/**
 * Display run command help.
**/
exports.help = function() {
  let events = eventSetup();
  events.emit('log', 'Implement Help');
};

/**
 * Run electron project.
 *
 * @param {object|Array}  [options]  - Run options.   e.g.: {"verbose":true,"argv":[],"fetch":true}
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
  //events.emit('verbose', 'run.run ' + JSON.stringify(arguments));
  let d = Q.defer();

  check_reqs.run()
  .then(function(responseText) {
    // Sync app www and platform www?
    // If you use `cordova run electron` the files are already in sync
    // due the fact that cordova called build before run.
    if (options.update || options.sync) {
      events.emit('verbose', 'Sync app www and platform www.');
      utils.updateWww();
    }

    // Start.
    events.emit('log', 'Starting electron project.');
    spawn(electron, [path.join(utils.platformWww, 'main.js')]);

  }, function(error) {
    d.reject(error || new RequirementError('Please make sure you meet the software requirements.'));
  });

 return d.promise;
};
