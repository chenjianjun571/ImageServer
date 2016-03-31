/**
 * Created by chenjianjun on 15/11/25.
 */
var options = require('../config/options');
var fs = require('fs');
var path = require('path');
var _existsSync = fs.existsSync || path.existsSync,
    nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/,
    nameCountFunc = function (s, index, ext) {
        return ' (' + ((parseInt(index, 10) || 0) + 1) + ')' + (ext || '');
    };

function FileInfo (file) {
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
    this.deleteType = 'DELETE';
}

FileInfo.prototype.initUrl = function (req) {
    if (!this.error) {
        var that = this,
            baseUrl = (options.ssl ? 'https:' : 'http:') +
                '//' + req.headers.host + options.uploadUrl;
        this.url = this.deleteUrl = baseUrl + encodeURIComponent(this.name);
        Object.keys(options.imageVersions).forEach(function (version) {
            if (_existsSync(
                    options.uploadDir + '/' + version + '/' + that.name
                )) {
                that[version + 'Url'] = baseUrl + version + '/' +
                    encodeURIComponent(that.name);
            }
        });
    }
}

FileInfo.prototype.safeName = function () {
    // 防止目录遍历和创建系统隐藏文件 这里可以直接返回一个系统自定义的文件
    this.name = path.basename(this.name).replace(/^\.+/, '');
    while (_existsSync(options.uploadDir + '/' + this.name)) {
        this.name = this.name.replace(nameCountRegexp, nameCountFunc);
    }
}

FileInfo.prototype.validate = function () {
    if (options.minFileSize && options.minFileSize > this.size) {
        this.error = '文件太小';
    }
    if (options.maxFileSize && options.maxFileSize < this.size) {
        this.error = '文件太大';
    }
    if (!options.acceptFileTypes.test(this.type)) {
        this.error = '文件类型不正确';
    }

    // 判读文件后缀是否支持
    if (!options.imageTypes.test(this.name)) {
        this.error = '文件类型不支持';
    }

    return !this.error;
}

// Expose the file info module
module.exports = exports = FileInfo;
