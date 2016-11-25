#!/usr/bin/env node

/**********
 * Globals
 **********/

// Pre-existing Cordova npm modules
var deferral, path, cwd;

// Npm dependencies
var logger,
    fs,
    _,
    fileUtils;

// Other globals
var hooksPath;

var restoreBackups = (function(){

    /**********************
     * Internal properties
     *********************/
    var restoreBackups = {}, context, projectName, logFn, settings;

    var PLATFORM_CONFIG_FILES = {
        "ios":{
            "{projectName}-Info.plist": "{projectName}/{projectName}-Info.plist",
            "project.pbxproj": "{projectName}.xcodeproj/project.pbxproj",
            "build.xcconfig": "cordova/build.xcconfig",
            "build-extras.xcconfig": "cordova/build-extras.xcconfig",
            "build-debug.xcconfig": "cordova/build-debug.xcconfig",
            "build-release.xcconfig": "cordova/build-release.xcconfig"
        },
        "android":{
            "AndroidManifest.xml": "AndroidManifest.xml"
        }
    };

    /*********************
     * Internal functions
     *********************/

    function restorePlatformBackups(platform){
        var configFiles = PLATFORM_CONFIG_FILES[platform],
            backupFile, backupFileName, backupFilePath, backupFileExists, targetFilePath;

        logger.verbose("Checking to see if there are backups to restore...");
        for(backupFile in configFiles){
            backupFileName = parseProjectName(backupFile);
            backupFilePath = path.join(cwd, 'plugins', context.opts.plugin.id, "backup", platform, backupFileName);
            backupFileExists = fileUtils.fileExists(backupFilePath);
            if(backupFileExists){
                targetFilePath = path.join(cwd, 'platforms', platform, parseProjectName(configFiles[backupFile]));
                fileUtils.copySync(backupFilePath, targetFilePath);
                logFn("Restored backup of '"+backupFileName+"' to :"+targetFilePath);
            }
        }
    }

    function parseProjectName(fileName){
        return fileName.replace(/{(projectName)}/g, projectName);
    }

    // Script operations are complete, so resolve deferred promises
    function complete(){
        deferral.resolve();
    }

    /*************
     * Public API
     *************/
    restoreBackups.loadDependencies = function(ctx){
        fs = require('fs'),
        _ = require('lodash'),
        fileUtils = require(path.resolve(hooksPath, "fileUtils.js"))(ctx);
        logger.verbose("Loaded module dependencies");
        restoreBackups.init(ctx);
    };

    restoreBackups.init = function(ctx){
        context = ctx;

        projectName = fileUtils.getProjectName();
        logFn = context.hook === "before_plugin_uninstall" ? logger.log : logger.verbose;

        settings = fileUtils.getSettings();
        if(typeof(settings.autorestore) === "undefined" || settings.autorestore === "false"){
            logger.log("Skipping auto-restore of config file backup(s)");
            complete();
            return;
        }

        // go through each of the platform directories
        var platforms = _.filter(fs.readdirSync('platforms'), function (file) {
            return fs.statSync(path.resolve('platforms', file)).isDirectory();
        });
        _.each(platforms, function (platform, index) {
            platform = platform.trim().toLowerCase();
            try{
                restorePlatformBackups(platform);
                if(index === platforms.length - 1){
                    logger.verbose("Finished restoring backups");
                    complete();
                }
            }catch(e){
                var msg = "Error restoring backups for platform '"+platform+"': "+ e.message;
                logger.error(msg);
                if(settings.stoponerror){
                    deferral.reject(msg);
                }
            }
        });
    };

    return restoreBackups;
})();

module.exports = function(ctx) {
    deferral = ctx.requireCordovaModule('q').defer();
    path = ctx.requireCordovaModule('path');
    cwd = path.resolve();

    hooksPath = path.resolve(ctx.opts.projectRoot, "plugins", ctx.opts.plugin.id, "hooks");
    logger = require(path.resolve(hooksPath, "logger.js"))(ctx);
    logger.verbose("Running restoreBackups.js");
    try{
        restoreBackups.loadDependencies(ctx);
    }catch(e){
        logger.warn("Error loading dependencies ("+e.message+") - attempting to resolve");
        require(path.resolve(hooksPath, "resolveDependencies.js"))(ctx).then(restoreBackups.loadDependencies.bind(this, ctx));
    }

    return deferral.promise;
};