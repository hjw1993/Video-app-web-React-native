'use strict'

const convert = require('koa-convert')
var mongoose = require('mongoose')
var Video = mongoose.model('Video')
var Audio = mongoose.model('Audio')
var config = require('../../config/config')
var cloudinary = require('cloudinary')
var Promise = require('bluebird')
//合并音频和视频
function AsyncMedia(video,audio)
{
	
	cloudinary.config(
		config.CLOUDINARY
		)
	if(!video||!video.public_id||!audio||!audio.public_id)
	{
		return
	}

	
	var video_public_id = video.public_id.replace('/', ':')
	var audio_public_id = audio.public_id.replace('/', ':')
	
	console.log(audio)
	var VideoName = video_public_id.replace('/','_') + '.mov'
	var videoURL = 'http://res.cloudinary.com/dv4ssorek/video/upload/l_video:'+audio_public_id+'/'+video.public_id+".mov"
	var thumbName= video_public_id.replace('/','_')+'.jpg'
	var thumbURL='http://res.cloudinary.com/dv4ssorek/video/upload/'+video_public_id+'.jpg'
	// VideoURL= 'http://res.cloudinary.com/dv4ssorek/video/upload/'+video.public_id
	// audioURL='http://res.cloudinary.com/dv4ssorek/video/upload/'+audio.public_id
	// sample :http://res.cloudinary.com/dv4ssorek/video/upload/l_video:audio:p54ehy2uf9ygoe38kdbd/video/ho8zi67uyg1ro8axkxdn.mp4
	
	console.log(videoURL)
	cloudinary.v2.uploader.upload(videoURL, 
        { resource_type: "video" ,
    	format:"mov",
    	folder:'work'
    	// transformation:[{overlay: 'audio: ym91rwtieiknc3ekx5nu'}]
		},
        function(error, result) { console.log(result);
        console.log(error) })
 	
}


exports.audio = convert(function*(next)
{
	var body = this.request.body 
	var audioData = body.audio
	var videoId = body.videoId
	var user = this.session.user
	
	if(typeof audioData ==='string')
	{
		audioData=JSON.parse(audioData)
	}

	if(!audioData||!audioData.public_id)
	{
		this.body={
			success:false,
			err:'uploading fail'
		}
		return next
	}
	var audio = yield Audio.findOne({
		public_id:audioData.public_id

	}).exec()

	var video = yield Video.findOne({
		_id:videoId

	}).exec()

	if(!audio)
	{
		var _audio = {
			author:user._id,
			public_id:audioData.public_id,
			detail:audioData
		}
		if(video)
		{
			_audio.video=video._id
		}

		audio= new Audio(_audio)

		audio = yield audio.save()
	}
	AsyncMedia(video,audio)
	this.body = {
		success:true,
		data:audio._id
	}

})



exports.video = convert(function*(next)
{
	var body = this.request.body 
	var videoData = body.video
	var user = this.session.user
	if(typeof videoData ==='string')
	{
		videoData=JSON.parse(videoData)
	}
	console.log(videoData)
	if(!videoData||!videoData.public_id)
	{
		this.body={
			success:false,
			err:'uploading fail'
		}
		return next
	}
	var video = yield Video.findOne({
		public_id:videoData.public_id
	}).exec()
	if(!video)
	{
		var _video = {
			author:user._id,
			public_id:videoData.public_id,
			detail:videoData
		}
		

		video= new Video(_video)

		video = yield video.save()
	}
	this.body = {
		success:true,
		data:video._id
	}
	return next


})