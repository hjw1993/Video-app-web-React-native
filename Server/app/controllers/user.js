'use strict'
var mongoose = require('mongoose')
var xss = require('xss')
var User = mongoose.model('User')
var uuid=require('uuid')
const convert = require('koa-convert');



exports.signup = convert(function *(next){
	var username =this.request.body.username
	var password =this.request.body.password

	
	var user = yield User.findOne({
		username:username
	}).exec()

	console.log(user)
	if(!user)
	{
		var token=uuid.v4()
		user = new User({
			username:username,
			accessToken:token,
			password:password,
			nickname:'hjw',
			avatar:"http://assets.lfcimages.com/images/international/thumb-no-image-3.jpg"


		})
	}
	else{

		this.body={
		success:false,
		err:'Username has been used'
	}
	return next
	}


	console.log(user)
	try{
		console.log('saveing!')
	yield user.save()
	}
	catch(e)
	{
		console.log(e)
		this.body={
			success:false
		}
		return 
	}
	
	this.body={
		success:true
	}
	return next
})

exports.verify = convert(function *(next){
	var username =this.request.body.username
	var password =this.request.body.password
	if(!username||!password)
	{
		this.body={
			success:false,
			err:'No password or Username'
		}
		return next
	}
	var user=yield User.findOne({
		username:username,
		password:password
	}).exec()
	if(user)
	{
		user.verified=true
		user = yield user.save()
		this.body={
		success:true,
		data:{
			nickname:user.nickname,
			accessToken:user.accessToken,
			avatar:user.avatar
		}
	}
	}
	else
	{
		this.body={
		success:false,
		err:'Username or password wrong'
	}
	}
})

exports.update = convert(function *(next){
	var body = this.request.body
	var user = this.session.user


	
	var fields = 'avatar,gender,age,nickname'.split(',')
	fields.forEach(function(field)
	{
		if(body[field])
		{
			user[field]=xss(body[field].trim())
		}
	})
	user = yield user.save()//存储改变
	this.body={
		success:true,
		data:{
			nickname:user.nickname,
			accessToken:user.accessToken,
			avatar:user.avatar,
			age:user.age,
			gender:user.gender
		}
	}
})


