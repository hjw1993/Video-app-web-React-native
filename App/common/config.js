'use strict'

module.exports={
header:{
	method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  
}
},
api:{
	base2:'http://localhost:1234/',
	base:'http://rap.taobao.org/mockjs/30886/',
	creations:'api/creations',
	up:'api/up',
	comment:'api/comments',
	signup:'api/u/signup',
	verify:'api/u/verify',
	signature:'api/signature',
	update:'api/u/update',
	video:'api/creations/video',
	audio:'api/creations/audio'
}
}