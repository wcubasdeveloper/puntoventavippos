'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var core$1 = require('@angular/core');
var core = require('@ionic-native/core');

var AppVersion = /** @class */ (function (_super) {
    tslib.__extends(AppVersion, _super);
    function AppVersion() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AppVersion.prototype.getAppName = function () { return core.cordova(this, "getAppName", {}, arguments); };
    AppVersion.prototype.getPackageName = function () { return core.cordova(this, "getPackageName", {}, arguments); };
    AppVersion.prototype.getVersionCode = function () { return core.cordova(this, "getVersionCode", {}, arguments); };
    AppVersion.prototype.getVersionNumber = function () { return core.cordova(this, "getVersionNumber", {}, arguments); };
    AppVersion.pluginName = "AppVersion";
    AppVersion.plugin = "cordova-plugin-app-version";
    AppVersion.pluginRef = "cordova.getAppVersion";
    AppVersion.repo = "https://github.com/whiteoctober/cordova-plugin-app-version";
    AppVersion.platforms = ["Android", "iOS", "Windows"];
    AppVersion.decorators = [
        { type: core$1.Injectable }
    ];
    return AppVersion;
}(core.IonicNativePlugin));

exports.AppVersion = AppVersion;
