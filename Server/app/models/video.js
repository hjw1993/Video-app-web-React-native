'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed
const convert = require('koa-convert')

var VideoSchema = new Schema({

	author:{
		type:ObjectId,
		ref:'User'
	},
	
	public_id:String,
	detail:Schema.Types.Mixed,
	meta:{
		createAt:{
			type:Date,
			default:Date.now
		},
		updateAt:{
			type:Date,
			default:Date.now
		}
	}
})
VideoSchema.pre('save',function(){
	
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now
	}
	else
	{
		this.meta.createAt=Date.now
	}
	return 
})

module.exports = mongoose.model('Video',VideoSchema)