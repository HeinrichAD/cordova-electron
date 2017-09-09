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
 *
 ***************************************************************
 * This file is found by cordova-lib when you attempt to
 * 'cordova platform add PATH' where path is this repo.
**/
'use strict';

const shell         = require('shelljs');
const path          = require('path');
const fs            = require('fs');
const setupEvents   = require('./lib/event-log');
const Utils         = require('./lib/utils');
const PluginHandler = require('./lib/pluginHandler');

const {
  PlatformJson
} = require('cordova-common');

const PLATFORM_NAME        = 'electron';
const PROJECT_DEFAULT_NAME = 'HelloCordova';
const PROJECT_DEFAULT_ID   = 'io.cordova.hellocordova';


/**
 * @class  Electron project platform api class.
 *
 * @param {String}        platform         - Platform name.
 * @param {String}        platformRootDir  - Full path to the platform root directroy.
 * @param {EventEmitter}  [events]         - An EventEmitter instance to log events/messages.
 *
 * e.g.
 *   {  
 *     "platform":"electron",
 *     "platformRootDir":".../MyApp/platforms/eletron",
 *     "events":{ ... }
 *   }
**/
function Api (platform, platformRootDir, events) {
  this.events = setupEvents(events);
  //this.events.emit('verbose', '++ new Api ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ new Api ++ ' + JSON.stringify({'platform': platform, 'platformRootDir': platformRootDir, 'events': events}));
  //this.events.emit('verbose', __dirname);

  new Utils(platform, platformRootDir, events, this);
  //this.events.emit('verbose', '' + JSON.stringify(this, null, 2));
}

/**
 * Create electron project platform.
 *
 * @param {String}        dest       - Full path to platform destination.
 * @param {Object}        [config]   - Project configuration like name and package name.
 * @param {Object|Array}  [options]  - Create objects for the create script.
 * @param {EventEmitter}  [events]   - An EventEmitter instance to log events/messages.
 *
 * @returns {Promise}
 *
 * e.g.
 * {
 *   "dest":".../MyApp/platforms/eletron",
 *   "config":{
 *     "path":".../MyApp/config.xml",
 *     "doc":{
 *       "_root":{ ... }
 *     },
 *     "cdvNamespacePrefix":"cdv"
 *   },
 *   "options":{
 *     "platformDetails":{
 *       "libDir":".../MyApp/node_modules/cordova-electron",
 *       "platform":"electron",
 *       "version":"0.0.1"
 *     },
 *     "link":false
 *   },
 *   "events":{ ... }
 * }
**/
Api.createPlatform = function (dest, config, options, events) {
  events = setupEvents(events);
  //events.emit('verbose', '++ createPlatform ++ ' + JSON.stringify(arguments));
  //events.emit('verbose', '++ createPlatform ++ ' + JSON.stringify({'dest': dest, 'config': config, 'options': options, 'events': events}));

  const creator = require('./../../../lib/create');  // ToDo: /bin/lib/create
  let name = PROJECT_DEFAULT_NAME;
  let id = PROJECT_DEFAULT_ID;
  if (config) {
    name = config.name();
    id = config.packageName();
  }

  let result;
  try {
    let self = this;
    // we create the project using our scripts in this platform
    result = creator.run(dest, id, name, options, events, self)
      .then(function () {
        // after platform is created we return Api instance based on new Api.js location
        // Api.js has been copied to the new project
        // This is required to correctly resolve paths in the future api calls
        let PlatformApi = require(path.resolve(dest, 'cordova/Api'));
        return new PlatformApi(PLATFORM_NAME, dest, events);
      });
  } catch (e) {
    events.emit('error', 'createPlatform is not callable from the eletron project API.');
    throw (e);
  }
  return result;
};

/**
 * Update electron project platform.
 *
 * @param {String}        dest       - Path to platform destination.
 * @param {Object|Array}  [options]  - Create objects for the update script.
 * @param {EventEmitter}  [events]   - An EventEmitter instance to log events/messages.
 *
 * @returns {Promise}
**/
Api.updatePlatform = function (dest, options, events) {
  //events = setupEvents(events);
  //events.emit('verbose', '++ updatePlatform ++ ' + JSON.stringify(arguments));
  //events.emit('verbose', '++ updatePlatform ++ ' + JSON.stringify({'dest': dest, 'options': options, 'events': events}));
  return Promise.resolve(); // TODO

  // ToDo:
  // Backup and restore 'electron-js-customized' directory.
};

/**
 * Get electron project platform information/data.
 *
 * @returns {Object}
**/
Api.prototype.getPlatformInfo = function () {
  //this.events.emit('verbose', '++ getPlatformInfo ++ ' + JSON.stringify(arguments));
  return {
    'locations'    : this.locations,
    'root'         : this.platformRoot,
    'name'         : this.platform,
    'version'      : this.version,
    'projectConfig': this.config
  };
};

/**
 * Prepare electron platform.
 *
 * @param {String}        cordovaProject    - Full path to project directory.
 * @param {Object|Array}  [options]         - 
 *
 * @returns {Promise}
**/
Api.prototype.prepare = function (cordovaProject, options) {
  //this.events.emit('verbose', '++ prepare ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ prepare ++ ' + JSON.stringify({'cordovaProject': cordovaProject, 'options': options}));
  return Promise.resolve(); // TODO
};

/**
 * Add plugin to electron platform.
 *
 * @param {PluginInfo}    pluginInfo        - 
 * @param {Object|Array}  [installOptions]  - 
 *
 * @returns {Promise}
**/
Api.prototype.addPlugin = function (pluginInfo, installOptions) {
  //this.events.emit('verbose', '++ addPlugin ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ addPlugin ++ ' + JSON.stringify({'pluginInfo': pluginInfo, 'installOptions': installOptions}));
  let self = this;
  let pluginHndl = new PluginHandler(self);
  return pluginHndl.addPlugin(pluginInfo, installOptions);
};

/**
 * Remove plugin from electron platform.
 *
 * @param {PluginInfo}    pluginInfo          - 
 * @param {Object|Array}  [uninstallOptions]  - 
 *
 * @returns {Promise}
**/
Api.prototype.removePlugin = function (pluginInfo, uninstallOptions) {
  //this.events.emit('verbose', '++ removePlugin ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ removePlugin ++ ' + JSON.stringify({'plugin': plugin, 'uninstallOptions': uninstallOptions}));
  let self = this;
  let pluginHndl = new PluginHandler(self);
  return pluginHndl.removePlugin(pluginInfo, uninstallOptions);
};

/**
 * Build electron project.
 *
 * @param {Object|Array}  [buildOptions]  - Build options for lib/build script.   e.g.: {"verbose":true,"argv":[],"fetch":true}
 *
 * @returns {Promise}
**/
Api.prototype.build = function (buildOptions) {
  //this.events.emit('verbose', '++ build ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ build ++ ' + JSON.stringify({'buildOptions': buildOptions}));
  let self = this;
  return require('./lib/build').run(buildOptions, this.events, self);
};

/**
 * Build electron project.
 *
 * @param {Object|Array}  [runOptions]  - Run options for lib/run script.
 *
 * @returns {Promise}
**/
Api.prototype.run = function (runOptions) {
  //this.events.emit('verbose', '++ run ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ run ++ ' + JSON.stringify({'runOptions': runOptions}));
  let self = this;
  return require('./lib/run').run(runOptions, this.events, self);
};

/**
 * Build electron project.
 *
 * @param {Object|Array}  [cleanOptions]  - Clean options for lib/clean script.
 *
 * @returns {Promise}
**/
Api.prototype.clean = function (cleanOptions) {
  //this.events.emit('verbose', '++ clean ++ ' + JSON.stringify(arguments));
  //this.events.emit('verbose', '++ clean ++ ' + JSON.stringify({'cleanOptions': cleanOptions}));
  let self = this;
  return require('./lib/clean').run(cleanOptions, this.events, self);
};

/**
 * Check electron project requirements.
 *
 * @returns {Promise}
**/
Api.prototype.requirements = function () {
  //this.events.emit('verbose', '++ requirements ++');
  let self = this;  
  return require('./lib/check_reqs').run(this.events, self);
};

module.exports = Api;
