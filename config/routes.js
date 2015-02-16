/**
 * Created by User on 2/15/2015.
 */

var  _ = require('lodash');

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
    app.get('/exhibition/create', getUrl);
    app.get('/settings/profile', getUrl);
    app.get('/settings/password', getUrl);
}
