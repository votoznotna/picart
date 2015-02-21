'use strict';

module.exports = {
	app: {
		title: 'picart',
		description: 'Full-Stack JavaScript with MongoDB, Express, AngularJS, and Node.js',
		keywords: 'MongoDB, Express, AngularJS, Node.js'
	},
	recaptcha: {
		siteKey: process.env.RECAPTCHA_SITE_KEY,
		secretKey: process.env.RECAPTCHA_SECRET_KEY
	},
	urlRoot:  process.env.URL_ROOT  || '/modules/exhibition/pictures/thumbs/',
	dataRoot: process.env.DATA_ROOT,
	picMaxWidth: 2000,
	picMinWidth: 400,
	mongolabApiKey: process.env.MONGOLAB_API_KEY,
	picturesRoot: '../../public/modules/exhibition/pictures',
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				//'public/lib/jquery-ui/jquery-ui.js',
				//'public/lib/angularjs-imageupload-directive/public/javascripts/imageupload.js',
				'public/lib/ng-device-detector/ng-device-detector.js',
				'public/lib/angular-grecaptcha/grecaptcha.js'
			]
		},
		css: [
			'public/modules/**/css/*.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js',
			'public/modules/*/*[!tests]*/*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};
