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


let MyError = function(msg) {
  Error.call(this, msg);
  this.name = 'Error';
  this.message = msg;
  this.toString = function() {
    return this.msg;
  };
};
MyError.prototype = Error.prototype;

let RequirementError = function(msg) {
  MyError.call(this, msg);
  this.name = 'RequirementError';
  this.message = msg;
};
RequirementError.prototype = Error.prototype;

// path: [private]: file, directory, ...
let IOError = function (path, msg) {
  MyError.call(this, msg);
  this.name = 'IOError';
  this.message = msg;
  this.toString = function() {
    return this.msg + " path: '" + path + "'";
  };
};
IOError.prototype = Error.prototype;

let DirectoryAlreadyExistsError = function(dir, msg) {
  IOError.call(this, dir, msg);
  this.name = 'DirectoryAlreadyExistsError';
  this.message = msg;
  this.dir = dir;
};
DirectoryAlreadyExistsError.prototype = Error.prototype;

let DirectoryNotFoundError = function(dir, msg) {
  IOError.call(this, dir, msg);
  this.name = 'DirectoryNotFoundError';
  this.message = msg;
  this.dir = dir;
};
DirectoryNotFoundError.prototype = Error.prototype;

let FileAlreadyExistsError = function(file, msg) {
  IOError.call(this, file, msg);
  this.name = 'FileAlreadyExistsError';
  this.message = msg;
  this.file = file;
};
FileAlreadyExistsError.prototype = Error.prototype;

let FileNotFoundError = function(file, msg) {
  MyError.call(this, msg);
  this.name = 'FileNotFoundError';
  this.message = msg;
  this.file = file;
};
FileNotFoundError.prototype = Error.prototype;

let NotImplementedError = function(msg) {
  MyError.call(this, msg);
  this.name = 'NotImplementedError';
  this.message = msg;
};
NotImplementedError.prototype = Error.prototype;


module.exports = {
  Error:                       MyError,
  RequirementError:            RequirementError,
  IOError:                     IOError,
  DirectoryAlreadyExistsError: DirectoryAlreadyExistsError,
  DirectoryNotFoundError:      DirectoryNotFoundError,
  FileAlreadyExistsError:      FileAlreadyExistsError,
  FileNotFoundError:           FileNotFoundError,
  NotImplementedError:         NotImplementedError
};
