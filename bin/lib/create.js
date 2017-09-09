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

const Q            = require('Q');
const fs           = require('fs');
const shell        = require('shelljs');
const args         = process.argv;
const path         = require('path');
const ROOT         = path.join(__dirname, '..', '..');
const check_reqs   = require('./check_reqs');
const eventSetup   = require('./../templates/project/cordova/lib/event-log');
const ConfigParser = require('cordova-common').ConfigParser;
const {
  RequirementError,
  DirectoryAlreadyExistsError
} = require('./../templates/project/cordova/lib/errors');


/**
 * Display create command help.
**/
exports.help = function() {
  let events = eventSetup();
  events.emit('log', 'Usage: create <path_to_new_project> <package_name> <project_name>');
  events.emit('log', '    <path_to_new_project>: Path to your new Cordova electron project');
  events.emit('log', '    <package_name>: Package name, following reverse-domain style convention');
  events.emit('log', '    <project_name>: Project name');
};

/**
 * Create electron project.
 *
 * @param {String}        [project_path='CordovaExample']              - Electron project directory.
 * @param {String}        [package_name='org.apache.cordova.example']  - Electron project package name.
 * @param {String}        [project_name='CordovaExample']              - Electron project name.
 * @param {Object|Array}  [options]                                    - Create options.
 * @param {EventEmitter}  [events]                                     - An EventEmitter instance to log events/messages.
 * @param {Api}           [api]                                        - Api.js instance
 *
 * @returns {Promise}
**/
exports.run = function(project_path, package_name, project_name, options, events, api) {
  if (api) events = eventSetup(events || api.events);
  else events = eventSetup(events);
  //events.emit('verbose', 'create.run ' + JSON.stringify(argv));
  let d = Q.defer();

  // Set default values for path, package and name
  project_path = typeof project_path !== 'undefined' ? project_path : 'CordovaExample';
  package_name = typeof package_name !== 'undefined' ? package_name : 'org.apache.cordova.example';
  project_name = typeof project_name !== 'undefined' ? project_name : 'CordovaExample';

  events.emit('verbose', 
    'project_path: \'' + project_path + '\'; ' +
    'package_name: \'' + package_name + '\'; ' +
    'project_name: \'' + project_name + '\''
  );
  
  // Check if project already exists
  if (fs.existsSync(project_path)) {
    d.reject(new DirectoryAlreadyExistsError(project_path, 'Project already exists! Delete and recreate'));
  }
  else {
    // Check that requirements are met and proper targets are installed
    check_reqs.run()
    .then(function(responseText) {      
      events.emit('log', 'Creating Electron project. Path: ' + path.relative(process.cwd(), project_path));

      // copy template directory
      shell.cp('-r', path.join(ROOT, 'bin', 'templates', 'project', 'www'), project_path);

      // create cordova/lib if it does not exist yet
      if (!fs.existsSync(path.join(project_path, 'cordova', 'lib'))) {
        shell.mkdir('-p', path.join(project_path, 'cordova', 'lib'));
      }

      // copy required node_modules
      shell.cp('-r', path.join(ROOT, 'node_modules'), path.join(project_path, 'cordova'));

      // copy check_reqs file
      shell.cp(path.join(ROOT, 'bin', 'lib', 'check_reqs.js'), path.join(project_path, 'cordova', 'lib'));

      // config.xml
      let configFile = path.join(project_path, 'config.xml');
      shell.cp(path.resolve(__dirname, './../templates/project/cordova/defaults.xml'), configFile);
      let config = new ConfigParser(configFile);
      config.setPackageName(package_name);
      config.setName(project_name);
      config.write();
      

      let platform_www = path.join(project_path, 'platform_www');

      // copy cordova-js-src directory
      shell.cp('-rf', path.join(ROOT, 'cordova-js-src'), platform_www);

      // copy cordova js file to platform_www
      shell.cp(path.join(ROOT, 'cordova-lib', 'cordova.js'), platform_www);

      // copy cordova-js-src directory
      shell.cp('-rf', path.join(ROOT, 'cordova-js-src'), platform_www);


      // copy electron directory (e.g. main.js)
      shell.cp('-r', path.join(ROOT, 'bin', 'templates', 'project', 'electron', '*'), path.join(project_path, 'electron-js'));


      // copy cordova directory
      shell.cp('-r', path.join(ROOT, 'bin', 'templates', 'project', 'cordova'), project_path); 
      [
        'run',
        'build',
        'clean',
        'version'
      ].forEach(function(f) {
        shell.chmod(755, path.join(project_path, 'cordova', f));
      });

      d.resolve();

    }, function(error) {
      // check_reqs.run() failed.
      d.reject(error || new RequirementError('Please make sure you meet the software requirements.'));
    });
  }

 return d.promise;
}
