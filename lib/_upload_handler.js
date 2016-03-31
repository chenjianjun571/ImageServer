/**
 * Created by chenjianjun on 15/11/25.
 */
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var options = require('../config/options');
var formidable = require('formidable');
var FileInfo = require('./_file_info');

function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
}

function UploadHandler (req, res, callback) {
    this.req = req;
    this.res = res;
    this.callback = callback;
}

/**
 * Get all upload files
 *
 */
UploadHandler.prototype.get = function () {
    var handler = this,
        files = [];

    fs.readdir(options.uploadDir, function (err, list) {
        if(list) {
            list.forEach(function (name) {
                var stats = fs.statSync(options.uploadDir + '/' + name),
                  fileInfo;

                if (stats.isFile() && name[0] !== '.') {
                    fileInfo = new FileInfo({
                        name: name,
                        size: stats.size
                    });
                    fileInfo.initUrl(handler.req);
                    files.push(fileInfo);
                }
            });
        }
        handler.callback({files: files});
    });
}


UploadHandler.prototype.getFiles = function () {
    var handler = this,
        files = [];

    fs.readdir(options.uploadDir, function (err, list) {
        list.forEach(function (name) {
            var stats = fs.statSync(options.uploadDir + '/' + name),
                fileInfo;
            if (stats.isFile() && name[0] !== '.') {
                fileInfo = new FileInfo({
                    name: options.uploadDir + '/' + name,
                    size: stats.size
                });
                fileInfo.initUrl(handler.req);
                files.push(fileInfo);
            }
        });
        handler.callback({files: files});
    });
}




/**
 * Post a new file
 *
 */
UploadHandler.prototype.post = function () {
    var handler = this;
    var form = new formidable.IncomingForm();
    var tmpFiles = [];
    var map = {};
    var files = [];
    var counter = 1;
    var redirect;
    var thumb;
    var finish = function () {
            counter -= 1;
            if (!counter) {
                files.forEach(function (fileInfo) {
                    fileInfo.initUrl(handler.req);
                });
                handler.callback({files: files}, redirect);
            }
        };

    form.uploadDir = options.tmpDir;
    form.on('fileBegin', function (name, file) {
        tmpFiles.push(file.path);
        var fileInfo = new FileInfo(file, handler.req, true);
        map[path.basename(file.path)] = fileInfo;
        fileInfo.safeName();
        files.push(fileInfo);
    }).on('field', function (name, value) {
        switch(name) {
            case 'redirect':
                redirect = value;
                break;
            case 'thumb':
                thumb = value;
                break;
        }
    }).on('file', function (name, file) {
        var fileInfo = map[path.basename(file.path)];
        fileInfo.size = file.size;
        if (!fileInfo.validate()) {
            fs.unlink(file.path);
            return;
        }
        fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);

        if (thumb === 'true') {
            if (options.imageTypes.test(fileInfo.name)) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    counter += 1;
                    var opts = options.imageVersions[version];
                    //gm(options.uploadDir + '/' + fileInfo.name)
                    //    .resize(opts.width, opts.height, '%')
                    //    .write(options.uploadDir + '/' + version + '/' + fileInfo.name, finish);

                    gm(options.uploadDir + '/' + fileInfo.name)
                        .resize(opts.width, opts.height, '!').autoOrient()
                        .write(options.uploadDir + '/' + version + '/' + fileInfo.name, finish);
                });
            }
        }

    }).on('aborted', function () {
        tmpFiles.forEach(function (file) {
            fs.unlink(file);
        });
    }).on('progress', function (bytesReceived) {
        if (bytesReceived > options.maxPostSize) {
            handler.req.socket.destroy();
            tmpFiles.forEach(function (file) {
                fs.unlink(file);
            });
        }
    }).on('error', function (e) {
        tmpFiles.forEach(function (file) {
            fs.unlink(file);
        });
        console.log(e);
    }).on('end', finish).parse(handler.req);
}

/**
 * Delete files
 *
 */
UploadHandler.prototype.destroy = function () {
    var handler = this,
        fileName;

    if (handler.req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) {
        fileName = path.basename(decodeURIComponent(handler.req.url));
        if (fileName[0] !== '.') {
            fs.unlink(options.uploadDir + '/' + fileName, function (err) {
                Object.keys(options.imageVersions).forEach(function (version) {
                    fs.unlink(options.uploadDir + '/' + version + '/' + fileName);
                });
                handler.callback({success: !err});
            });
            return;
        }
    }
    handler.callback({success: false});
}

// Expose upload handler
module.exports = exports = UploadHandler;
