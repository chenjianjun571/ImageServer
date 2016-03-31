/**
 * Created by chenjianjun on 15/11/25.
 */
var requestHandler = require('./lib/_request_handler');
var options = require('./config/options');
var https = require('https');
var http = require('http');

if (options.ssl) {
    https.createServer(options.ssl, requestHandler).listen(options.port);
} else {
    http.createServer(requestHandler).listen(options.port);
}
