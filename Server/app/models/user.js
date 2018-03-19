'use strict'
const convert = require('koa-convert')
var mongoose= require('mongoose')

var UserSchema = new mongoose.Schema({
	username:{
		unique:true,
		type:String
	},
	areaCode:String,
	password:String,
	verified:{
		type:Boolean,
		default:false
	},
	gender:String,
	nickname:String,
	accessToken:String,
	avatar:String,
	age:String,
	meta:{
		creatAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
})

UserSchema.pre('save',convert(function*(next){
	if(this.isNew)
	{
		 this.meta.updateAt = Date.now()
	}
	return next
}))


var UserModel = mongoose.model('User', UserSchema)//第一个表名，第二个参数

module.exports = UserModel