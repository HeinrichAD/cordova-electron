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

const Q     = require('Q');
const path  = require('path');
const fs    = require('fs');
const shell = require('shelljs');
const {
  ActionStack,
  PluginInfoProvider
} = require('cordova-common');
const PlatformMunger = require('cordova-common').ConfigChanges.PlatformMunger;

const PLATFORM_NAME          = 'electron';
const FALLBACK_PLATFORM_NAME = 'browser';
const PROJECT_DEFAULT_ID     = 'io.cordova.hellocordova';


/**
 * @class
 * PluginHandler class to outsource the plugin handling from the Api class.
 *
 * @param  {Api}  - Valid Api.js instance
**/
let PluginHandler = function(api) {
  //api.events.emit('verbose', '++ addPlugin ++ ' + JSON.stringify(arguments));
  //api.events.emit('verbose', '++ addPlugin ++ ' + JSON.stringify({'api': api}));

  let self = this;


  //----- PluginHandler methods -----\\
  
  /**
   * Get root directory which should be used.
   *
   * @returns  {String}  - Full path of the root directory.
  **/
  let root_dir = function () {
    return api.platformRoot;
  }

  /**
   * Get www directory which should be used.
   *
   * @param {Boolean}  usePlatformWww  - If true the www directory of the platform will be used; otherwise the app www directory.
   *
   * @returns  {String}  - Full path of the www directory.
  **/
  let www_dir = function (usePlatformWww) {
    return (usePlatformWww) ? api.platformWww : api.appWww;
  };

  /**
   * Get package name.
   *
   * @returns  {String}
  **/
  let package_name = function () {
    return api.appConfig.packageName() || PROJECT_DEFAULT_ID;
  };

  let _handler = {
    'js-module': {
      install: function (jsModule, plugin_dir, plugin_id, www_dir) {
        // Copy the plugin's files into the www directory.
        let moduleSource = path.resolve(plugin_dir, jsModule.src);
        // Get module name based on existing 'name' attribute or filename
        // Must use path.extname/path.basename instead of path.parse due to CB-9981
        let moduleName = plugin_id + '.' + (jsModule.name || path.basename(jsModule.src, path.extname(jsModule.src)));

        // Read in the file, prepend the cordova.define, and write it back out.
        let scriptContent = fs.readFileSync(moduleSource, 'utf-8').replace(/^\ufeff/, ''); // Window BOM
        if (moduleSource.match(/.*\.json$/)) {
            scriptContent = 'module.exports = ' + scriptContent;
        }
        scriptContent = 'cordova.define("' + moduleName + '", function(require, exports, module) { ' + scriptContent + '\n});\n';

        let moduleDestination = path.resolve(www_dir, 'plugins', plugin_id, jsModule.src);
        shell.mkdir('-p', path.dirname(moduleDestination));
        fs.writeFileSync(moduleDestination, scriptContent, 'utf-8');
      },
      uninstall: function (jsModule, www_dir, plugin_id) {
        let pluginRelativePath = path.join('plugins', plugin_id, jsModule.src);
        // common.removeFileAndParents(www_dir, pluginRelativePath);
        api.events.emit('log', 'js-module uninstall called : ' + pluginRelativePath);
      }
    },

    'source-file': {
      install: function (obj, plugin_dir, project_dir, plugin_id, options) {
        // let dest = path.join(obj.targetDir, path.basename(obj.src));
        // common.copyFile(plugin_dir, obj.src, project_dir, dest);
        api.events.emit('log', 'install called');
      },
      uninstall: function (obj, project_dir, plugin_id, options) {
        // let dest = path.join(obj.targetDir, path.basename(obj.src));
        // common.removeFile(project_dir, dest);
        api.events.emit('log', 'uninstall called');
      }
    },

    'header-file': {
      install: function (obj, plugin_dir, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'header-fileinstall is not supported for browser');
      },
      uninstall: function (obj, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'header-file.uninstall is not supported for browser');
      }
    },

    'resource-file': {
      install: function (obj, plugin_dir, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'resource-file.install is not supported for browser');
      },
      uninstall: function (obj, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'resource-file.uninstall is not supported for browser');
      }
    },

    'framework': {
      install: function (obj, plugin_dir, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'framework.install is not supported for browser');
      },
      uninstall: function (obj, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'framework.uninstall is not supported for browser');
      }
    },

    'lib-file': {
      install: function (obj, plugin_dir, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'lib-file.install is not supported for browser');
      },
      uninstall: function (obj, project_dir, plugin_id, options) {
        api.events.emit('verbose', 'lib-file.uninstall is not supported for browser');
      }
    }
  };

  /**
   * Get plugin installer function.
   *
   * @param  {String}  type  - Installer type
   *    [ 'js-module', 'source-file', 'header-file', 'resource-file', 'framework', 'lib-file' ]
   *
   * @returns {Function}
  **/
  let getInstaller = function (type) {
    return function (item, plugin_dir, plugin_id, options, project) {
      let installer = _handler[type];

      if (!installer) {
        api.events.emit('log', 'unrecognized type ' + type);

      } else {
        let wwwDest = www_dir(options.usePlatformWww);
        if (type === 'asset') {
          installer.install(item, plugin_dir, wwwDest);
        } else if (type === 'js-module') {
          installer.install(item, plugin_dir, plugin_id, wwwDest);
        } else {
          installer.install(item, plugin_dir, root_dir(), plugin_id, options, project);
        }
      }
    };
  };

  /**
   * Get plugin uninstaller function.
   *
   * @param  {String}  type  - Uninstaller type
   *    [ 'js-module', 'source-file', 'header-file', 'resource-file', 'framework', 'lib-file' ]
   *
   * @returns {Function}
  **/
  let getUninstaller = function (type) {
    return function (item, plugin_dir, plugin_id, options, project) {
      let installer = _handler[type];

      if (!installer) {
        api.events.emit('log', 'browser plugin uninstall: unrecognized type, skipping : ' + type);

      } else {
        let wwwDest = www_dir(options.usePlatformWww);
        if (['asset', 'js-module'].indexOf(type) > -1) {
          return installer.uninstall(item, wwwDest, plugin_id);
        } else {
          return installer.uninstall(item, root_dir(), plugin_id, options, project);
        }
      }
    };
  };

  /**
   * Get platform name which should be used for the plugin installation.
   * If exists use electron plugin version otherwise try to use browser plugin version but display a warning.
   *
   * @returns {String}
  **/
  let getPlatform = function (pluginInfo, d) {
    if (pluginInfo.getPlatformsArray().indexOf(PLATFORM_NAME) !== -1) {
      return PLATFORM_NAME;
    }
    else if(pluginInfo.getPlatformsArray().indexOf(FALLBACK_PLATFORM_NAME) !== -1) {
      api.events.emit('warn', 'Plugin \'' + pluginInfo.name + '\' does not contains an explicit version for electron. Browser version will be tried to use.')
      return FALLBACK_PLATFORM_NAME; // Try 'browser' as fallback.
    }
    else {
      d.reject(new Error('Plugin \'' + pluginInfo.name + '\' does not support either platforms electron and browser.'));
      return null;
    }
  };

  /**
   * Removes the specified modules from list of installed modules and updates platform_json and cordova_plugins.js on disk.
   *
   * @param   {String}      platform   - Plugin platform name.
   * @param   {PluginInfo}  plugin     - PluginInfo instance for plugin, which modules needs to be added.
   * @param   {String}      targetDir  - The directory, where updated cordova_plugins.js should be written to.
   */
  let addModulesInfo = function (platform, plugin, targetDir) {
    let installedModules = api.platformJson.root.modules || [];
    let installedPaths = installedModules.map(function (installedModule) {
        return installedModule.file;
    });

    let modulesToInstall = plugin.getJsModules(platform)
    .filter(function (moduleToInstall) {
      return installedPaths.indexOf(moduleToInstall.file) === -1;
    }).map(function (moduleToInstall) {
      let moduleName = plugin.id + '.' + (moduleToInstall.name || moduleToInstall.src.match(/([^\/]+)\.js/)[1]);
      let obj = {
        file: ['plugins', plugin.id, moduleToInstall.src].join('/'), /* eslint no-useless-escape : 0 */
        id: moduleName,
        pluginId: plugin.id
      };
      if (moduleToInstall.clobbers.length > 0) {
        obj.clobbers = moduleToInstall.clobbers.map(function (o) { return o.target; });
      }
      if (moduleToInstall.merges.length > 0) {
        obj.merges = moduleToInstall.merges.map(function (o) { return o.target; });
      }
      if (moduleToInstall.runs) {
        obj.runs = true;
      }

      return obj;
    });

    api.platformJson.root.modules = installedModules.concat(modulesToInstall);
    if (!api.platformJson.root.plugin_metadata) {
      api.platformJson.root.plugin_metadata = {};
    }
    api.platformJson.root.plugin_metadata[plugin.id] = plugin.version;

    writePluginModules(targetDir);
    api.platformJson.save();
  };

  /**
   * Fetches all installed modules, generates cordova_plugins contents and writes it to file.
   *
   * @param   {String}  targetDir  - Directory, where write cordova_plugins.js to.
   *   Ususally it is either <platform>/www or <platform>/platform_www directories.
   */
  let writePluginModules = function (targetDir) {
    // Write out moduleObjects as JSON wrapped in a cordova module to cordova_plugins.js
    let final_contents = 'cordova.define(\'cordova/plugin_list\', function(require, exports, module) {\n';
    final_contents += 'module.exports = ' + JSON.stringify(api.platformJson.root.modules, null, '    ') + ';\n';
    final_contents += 'module.exports.metadata = \n';
    final_contents += '// TOP OF METADATA\n';
    final_contents += JSON.stringify(api.platformJson.root.plugin_metadata || {}, null, '    ') + '\n';
    final_contents += '// BOTTOM OF METADATA\n';
    final_contents += '});'; // Close cordova.define.

    shell.mkdir('-p', targetDir);
    fs.writeFileSync(path.join(targetDir, 'cordova_plugins.js'), final_contents, 'utf-8');
  };

  /**
   * Removes the specified modules from list of installed modules and updates platform_json and cordova_plugins.js on disk.
   *
   * @param   {String}      platform   - Plugin platform name.
   * @param   {PluginInfo}  plugin     - PluginInfo instance for plugin, which modules needs to be removed.
   * @param   {String}      targetDir  - The directory, where updated cordova_plugins.js should be written to.
   */
  let removeModulesInfo = function (platform, plugin, targetDir) {
    let installedModules = api.platformJson.root.modules || [];
    let modulesToRemove = plugin.getJsModules(platform)
      .map(function (jsModule) {
        return ['plugins', plugin.id, jsModule.src].join('/');
      });

    let updatedModules = installedModules
      .filter(function (installedModule) {
        return (modulesToRemove.indexOf(installedModule.file) === -1);
      });

    api.platformJson.root.modules = updatedModules;
    if (api.platformJson.root.plugin_metadata) {
      delete api.platformJson.root.plugin_metadata[plugin.id];
    }

    writePluginModules(targetDir);
    api.platformJson.save();
  };

  /**
   * Add plugin to electron platform.
   *
   * @param {PluginInfo}    pluginInfo        - 
   * @param {Object|Array}  [installOptions]  - 
   *
   * @returns {Promise}
  **/
  self.addPlugin = function(pluginInfo, installOptions) {
    let d = Q.defer();

    if (!pluginInfo) {
      return d.reject(new Error('The parameter is incorrect. The first parameter should be valid PluginInfo instance'));
    }

    installOptions = installOptions || {};
    installOptions.variables = installOptions.variables || {};
    // CB-10108 platformVersion option is required for proper plugin installation
    installOptions.platformVersion = installOptions.platformVersion || api.version;
    // Add PACKAGE_NAME variable into vars
    installOptions.variables.PACKAGE_NAME = installOptions.variables.PACKAGE_NAME || package_name();

    // If exists use electron plugin version otherwise try browser plugin version but display a warning.
    let platform = getPlatform(pluginInfo, d);
    if (!platform) return d.promise;

    let actions = new ActionStack();

    // gather all files needs to be handled during install
    pluginInfo.getFilesAndFrameworks(platform)
    .concat(pluginInfo.getAssets(platform))
    .concat(pluginInfo.getJsModules(platform))
    .forEach(function (item) {
      actions.push(actions.createAction(
        getInstaller(item.itemType),   [item, pluginInfo.dir, pluginInfo.id, installOptions, api.platformConfig],
        getUninstaller(item.itemType), [item, pluginInfo.dir, pluginInfo.id, installOptions, api.platformConfig])
      );
    });

    // run through the action stack
    return actions.process(platform, root_dir())
    .then(function () {
      if (api.platformConfig) {
        api.platformConfig.write();
      }

      munger
      // Ignore passed `is_top_level` option since platform itself doesn't know
      // anything about managing dependencies - it's responsibility of caller.
      .add_plugin_changes(pluginInfo, installOptions.variables, /* is_top_level= */true, /* should_increment= */true)
      .save_all();

      let targetDir = www_dir(installOptions.usePlatformWww);
      addModulesInfo(platform, pluginInfo, targetDir);
    });
  };

  /**
   * Remove plugin from electron platform.
   *
   * @param {PluginInfo}    pluginInfo          - 
   * @param {Object|Array}  [uninstallOptions]  - 
   *
   * @returns {Promise}
  **/
  self.removepluginInfo = function(pluginInfo, uninstallOptions) {
    let d = Q.defer();
    // If exists use electron pluginInfo version otherwise try browser pluginInfo version but display a warning.
    let platform = getPlatform(pluginInfo, d);
    if (!platform) return d.promise;
    let actions = new ActionStack();

    uninstallOptions = uninstallOptions || {};
    // CB-10108 platformVersion option is required for proper pluginInfo installation
    uninstallOptions.platformVersion = uninstallOptions.platformVersion || api.version;

    // queue up pluginInfo files
    pluginInfo.getFilesAndFrameworks(platform)
    .concat(pluginInfo.getAssets(platform))
    .concat(pluginInfo.getJsModules(platform))
    .forEach(function (item) {
      actions.push(actions.createAction(
        getUninstaller(item.itemType), [item, pluginInfo.dir, pluginInfo.id, uninstallOptions, api.platformConfig],
        getInstaller(item.itemType),   [item, pluginInfo.dir, pluginInfo.id, uninstallOptions, api.platformConfig])
      );
    });

    // run through the action stack
    return actions.process(platform, root_dir())
    .then(function () {
      if (api.platformConfig) {
        api.platformConfig.write();
      }

      munger
      // Ignore passed `is_top_level` option since platform itself doesn't know
      // anything about managing dependencies - it's responsibility of caller.
      .remove_pluginInfo_changes(pluginInfo, /* is_top_level= */true)
      .save_all();

      let targetDir = www_dir(uninstallOptions.usePlatformWww);
      removeModulesInfo(platform, pluginInfo, targetDir);
      // Remove stale pluginInfo directory
      // TODO: this should be done by pluginInfo files uninstaller
      shell.rm('-rf', path.resolve(root_dir(), 'pluginInfos', pluginInfo.id));
    });
  };

  //----- End of PluginHandler methods -----\\



  //----- PluginHandler Constructor logic -----\\

  let pluginInfoProvider = new PluginInfoProvider();
  let munger = new PlatformMunger(api.platform, root_dir(), api.platformJson, pluginInfoProvider);

  //----- End of PluginHandler Constructor logic -----\\
};


module.exports = PluginHandler;
