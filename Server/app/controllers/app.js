const convert = require('koa-convert')
var mongoose = require('mongoose')

var User = mongoose.model('User')
var config = require('../../config/config')
var sha1=require('sha1')




exports.signature = convert(function *(next){

	var body = this.request.body
	var type = body.type
	var timestamp = body.timestamp
	var folder
	var tags

	if(type === 'avatar')
	{
		folder= 'avatar'
		tags = 'app,avatar'
	}
	else if(type==='video')
	{
		folder= 'video'
		tags = 'app,video'
	}
	else if(type==='audio')
	{
		folder= 'audio'
		tags = 'app,audio'
	}


	var signature='folder='+folder+'&tags='+tags+
	'&timestamp='+timestamp+config.CLOUDINARY.api_secret
    signature=sha1(signature)
	this.body={
		success:true,
		data:signature
	}
})
exports.hasToken = convert(function *(next)
{
	console.log('this is token')
	var accessToken = this.query.accessToken
	if(!accessToken)
	{
	var accessToken = this.request.body.accessToken
	}
	if(!accessToken)
	{
		this.body={
			success:false,
			err:'Lost Token'
		}
		return next
	}
	var user = yield User.findOne({
		accessToken:accessToken
	}).exec()
	if(!user)
	{
		this.body={
			success:false,
			err:'Has not login in '
		}
		return next
	}
	this.session = this.session||{}
	this.session.user = user

	yield next
})


exports.hasBody = convert(function *(next)
{
	console.log('this is body')
	var body = this.request.body||{}
	if(!body||Object.keys(body).length===0)
	{
		this.body={
			success:false,
			err:'Something missing'
		}
		return next
	}
	yield next
})