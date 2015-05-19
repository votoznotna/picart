'use strict';
/**
 * Created by User on 2/15/2015.
 */

var  _ = require('lodash');
var users = require('../app/controllers/users.server.controller');
var exhibition =  require('../app/controllers/exhibition.server.controller');

var getUrl = function(req, res, next) {

    if(/application\/json/.test(req.get('accept'))){
            next();
    } else {
/*        var url = req.url;
        var urls = url.split("/");
        var last = _.last(urls);
        urls = _.without(urls, last);
        url = urls.join("/") + "/#!/" + last; //remove the hash if you want to make it html5mode;*/
        res.redirect('/#!' + req.url);
    }
}

module.exports = function(app) {

    app.get('/exhibition', getUrl);
    app.get('/player', getUrl);
    app.get('/signin', getUrl);
    app.get('/signup', getUrl);
    app.get('/password/forgot', users.requiresLogin, exhibition.hasAuthorization, getUrl);
    app.get('/exhibition/create', users.requiresLogin, exhibition.hasAuthorization, getUrl);
    app.get('/settings/profile', users.requiresLogin, exhibition.hasAuthorization, getUrl);
    app.get('/settings/password', users.requiresLogin, exhibition.hasAuthorization, getUrl);
    app.get('/exhibition/:exhibitId/edit', users.requiresLogin, exhibition.hasAuthorization, getUrl);
    app.get('/exhibition/:exhibitId', users.requiresLogin, exhibition.hasAuthorization, getUrl);
}
