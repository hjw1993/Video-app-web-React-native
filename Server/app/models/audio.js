'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed
const convert = require('koa-convert')

var AudioSchema = new Schema({

	author:{
		type:ObjectId,
		ref:'User'
	},
	video:{
		type:ObjectId,
		ref:'Video'
	},
	public_id:String,
	detail:Mixed,
	meta:{
		createAt:{
			type:Date,
			default:Date.now()
		},
		updateAt:{
			type:Date,
			default:Date.now()
		}
	}
})
AudioSchema.pre('save',function(){
	if(this.isNew){
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else
	{
		this.meta.createAt=Date.now()
	}
	return
})

module.exports = mongoose.model('Audio',AudioSchema)