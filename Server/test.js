
var koa = require('koa');
var Router = require('koa-router');
const convert = require('koa-convert');
var myRouter = new Router();
var app=new koa()
myRouter.get('/u', convert(function *(next) {
  this.response.body = 'Hello World!';
  yield next
}));
app.use(function*(next)
{
	this.response.body = 'no routes';
	yield next
})
app.use(myRouter.routes());

app.listen(3000);