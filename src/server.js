'use strict';
//=============================================================================
/**
 * Module dependencies
 */
//=============================================================================
const
    http = require('http'),
    app = require('./app');
//=============================================================================
/**
 * HTTP server instance
 */
//=============================================================================
const server = http.createServer(app);
//=============================================================================
/**
 * Module variables
 */
//=============================================================================
const port = app.get('port');
console.log(port);
//=============================================================================
/**
 * Bind server to port
 */
//=============================================================================
server.listen(port, () => {
    return console.log('Server up on port ' + port);
});
//=============================================================================
/**
 * Conditionally export module
 */
//=============================================================================
if(require.main != module) {
    module.exports = server;
}
//=============================================================================
