/**
 * Created by chenjianjun on 15/11/25.
 */
var path = require('path');
var basePath = path.resolve(__dirname, '..');

module.exports = {
    tmpDir: basePath + '/tmp',
    publicDir: basePath + '/public',
    uploadDir: basePath + '/public/images',
    uploadUrl: '/images/',
    minFileSize: 1,
    maxFileSize: 10485760, // 10MB
    maxPostSize: 10485760, // 10MB
    acceptFileTypes: /.+/i,
    imageTypes: /\.(jpe?g|png)$/i,
    imageVersions: {
        'thumbnails': {
            width: 80,
            height: 80
        }
    },
    accessControl: {
        allowOrigin: '*',
        allowMethods: 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: 'Content-Type, Content-Range, Content-Disposition'
    },
    /*
     ssl: {
     key: '',
     cert: ''
     }
     */
    nodeStatic: {
        cache: 3600
    },
    port: 8888, // 服务器监听端口
};
