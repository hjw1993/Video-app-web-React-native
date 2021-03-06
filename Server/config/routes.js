'use strict'

var Router = require('koa-router')
var User = require('../app/controllers/user')
var App = require('../app/controllers/app')
var Creation = require('../app/controllers/creation')
module.exports = function()
{
	var router = new Router(
	{
		prefix:'/api'
	})
	router.post('/u/signup',App.hasBody,User.signup)
	router.post('/u/verify',App.hasBody,User.verify)
	router.post('/u/update',App.hasToken,App.hasBody,User.update)
	router.post('/signature',App.hasToken,App.hasBody,App.signature)
	router.post('/creations/video',App.hasBody,App.hasToken,Creation.video)
	router.post('/creations/audio',App.hasBody,App.hasToken,Creation.audio)
	return router
}