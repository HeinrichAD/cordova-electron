# Cordova Electron

Build apps for Mac OSX, Windows and Linux using [Electron](http://electron.atom.io/).


# Table of contents
- [Goals](#goals)
- [Usage](#usage)
    - [Alternative](#alternative)
- [ToDo List](#todo-list)


# Goals

Desktop targeted deployment.


# Usage

```shell
clone repository
move to cordova project directroy
cordova -d platform add <relativ-path-to-cloned-repository>
cordova -d run electron`
```

## Alternative
```shell
npm install
./bin/create helloworld
cd helloworld
./cordova/run
```


# ToDo List

- [x] `bin/create`
- [ ] `bin/update`
- [ ] ?? `bin/check_reqs`
- [ ] `bin/templates/project/cordova/build`
- [x] `bin/templates/project/cordova/clean`
- [ ] ?? `bin/templates/project/cordova/log`
- [ ] ?? `bin/templates/project/cordova/emulate`
- [x] `bin/templates/project/cordova/run`
- [x] `bin/templates/project/cordova/version`
- [x] `bin/templates/www`
- [ ] Api: Plugin handling with browser platform fallback
- [ ] Api: prepare
- [ ] Api: update

- [x] `add eletron to platformsConfig.json in cordova-lib`
- [x] `cordova-plugin-device for electron`
