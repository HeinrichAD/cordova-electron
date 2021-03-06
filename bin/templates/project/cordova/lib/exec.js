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

const child_process = require('child_process');
const Q             = require('q');
const eventSetup    = require('./event-log');


/**
 * Executes the command specified.
 *
 * @param  {string}        cmd        - Command to execute.
 * @param  {string}        [opt_cwd]  - Current working directory.
 * @param  {Q.defer}       [d]        - Deferred promise object.
 * @param  {EventEmitter}  [events]   - An EventEmitter instance to log events/messages.
 *
 * @returns {Q}  Promise a promise that either resolves with the stdout, or rejects with an error message and the stderr.
**/
module.exports = function(cmd, opt_cwd, d, events) {
  events = eventSetup(events);
  d = d || Q.defer();

  try {
    child_process.exec(cmd, {cwd: opt_cwd, maxBuffer: 1024000}, function(err, stdout, stderr) {
      if (err) {
        d.reject(new Error('Error executing "' + cmd + '": ' + stderr));
      }
      else {
        d.resolve(stdout);
      }
    });
  } catch(e) {
    events.emit('error', e.message);
    d.reject(e);
  }

  return d.promise;
};
