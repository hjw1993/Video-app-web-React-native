import React, { Component } from 'react';
import { Alert, 
  AppRegistry, 
  Button,
  StyleSheet, 
  View,
  Text,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Image,
  ListView,
  TextInput,
  Modal,
  AlertIOS,
  TabBarIOS } from 'react-native';
var width= Dimensions.get('window').width
import Icon from 'react-native-vector-icons/Ionicons'
var config  = require('../common/config')
var request = require('../common/request')
var Video =require('react-native-video').default

var cachedResults={

  nextPage:1,
  items:[],
  total:0
}

class Detail extends React.Component{
	constructor(props) {
    super(props);
 	var data=this.props.data
 	const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      data:data,
      rate:1,
      muted:false,
      resizeMode:'contain',
      repeat:false,
      videoReady:false,
      videoProgress:0.01,
      videoTotal:0,
      curTime:0,
      playing:false,
      videoEnd:false,
      paused:false,
      videoCorrect:true,
      dataSource: ds.cloneWithRows([  ]),
      isLoadingTail:false,
      isRefreshing:false,
      //modal
      animationType:'noen',
      modalVisible:false,
      isSending:false,
      content:''

      };
  }


  _fetchMoreData()
  {

    
    var has=cachedResults.items.length !== cachedResults.total ;
    if(!this.hasMore()|| this.state.isLoadingTail)
    {
          return;
    }
    var page= cachedResults.nextPage;
    this._fetchData(page);

  }


  hasMore()
  {
      return cachedResults.items.length !== cachedResults.total ;

  }


  _fetchData(page) 
  {

    var that=this
    if(page==0)
    {
      this.setState({
      isRefreshing:true
    		})
    }
    else{
    this.setState({
          isLoadingTail:true,
          
        })
  		}	
    
    

  request.get(config.api.base+ config.api.comment,{
    accessToken:'abc',
    creation:123,
    page:page
    })

    .then((data) => {

     	console.log(data)
     	console.log(page)
      if(data.success){
        var items =cachedResults.items.slice()
        if(page!==0)
        {
          cachedResults.nextPage+=1
          items=items.concat(data.data)
        }
        else
        {
          items=data.data.concat(items)
          console.log('refreshed')
        }
        
        cachedResults.items=items
        cachedResults.total=data.total
        setTimeout(function(){
          if(page!==0)
          {
          that.setState({
          isLoadingTail:false,
          dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })


          } 
          else
          {
            that.setState({
          isRefreshing:false,
          dataSource:that.state.dataSource.cloneWithRows(cachedResults.items)
          })
          }
      }
        ,200 )
        
        
      }
    })
    .catch((error) => {
      if(page!==0){
       this.setState({
        isLoadingTail:false
       })
     }
     else
     {
      this.setState({
        isRefreshing:false
       })
     }
      console.error(error);
    });
    console.log(this.state);
    }


  _renderFooter()
  {
    if(!this.hasMore()&&cachedResults.total!==0)
    {
      return(
        <View style={styles.loadingMore}><Text style={styles.loadingText}>No more comments</Text></View>
        )
    }
   
    if(!this.state.isLoadingTail)return <View style={styles.loadingMore}/>
      
       
    return    <ActivityIndicator size="small" style={styles.loadingMore}/>
        
      
    }

  		_onLoadSatrt(){
  			console.log('start')
  		}
	    _onLoad(){
	    	console.log('load')
	    }
	    _onProgress(data){
	    	var duration=data.playableDuration
	    	if(!this.state.videoReady)
	    	{
	    		console.log('change')
	    		this.setState({
	    			playing:true,
	    			videoTotal:duration,
	    			videoReady:true,
	    			
	    		})
	    	}

	    	
	    	var curTime=data.currentTime
	    	var percent= Number((curTime/duration).toFixed(2))

	    	this.setState({

	    		curTime:Number((curTime).toFixed(2)),
	    		videoProgress:percent

	    	})
	    	
	    	
	    }
	    _onEnd(){
	    	console.log('end')
	    	this.setState({
	    		videoProgress:1,
	    		videoReady:false,
	    		playing:false,
	    		videoEnd:true
	    	})
	    }
    	_onError(e){
    		console.log(e)
    		console.log('err')
    		this.setState({
    			videoCorrect:false
    		})
    	}	

	_back()
	{
		this.props.navigator.pop()
			
	}
	_replay()
	{
		this.setState({
			videoEnd:false
		})
		this.refs.videoPlayer.seek(0)
	}
	_pause()
	{
		console.log('paused')
		this.setState({
			
			paused:true
		})
		
		console.log(this.state.paused)
	}
	_resume()
	{
		console.log('resume')
		this.setState({

			paused:false
		})
		
	}

	componentDidMount()
	{
		this._fetchData(1)
	}

	
	_renderRow(row)
	{
		return(
			<View key={row._id} style={styles.replyBox}>
				<Image style={styles.replyAvatar} source={{uri:row.replyBy.
					avatar}}/>
        		<View style={styles.reply}>
        		<Text style={styles.replyNickname}>{row.replyBy.nickname}</Text>
        		<Text style={styles.replyContent}>{row.content}</Text> 
        		</View>
			</View>
			)
	}
	_focus()
	{
			this._setModalVisible(true)
	}
	_blur()
	{

	}

	_setModalVisible(isVisible)
	{
		this.setState({
			modalVisible:isVisible,
			content:'',
			paused:isVisible
		})
		if(isVisible)
		{
			this.setState({
				paused:true
			})
		}
		else
		{
			this.setState({
				paused:false
			})
		}
	}
	_closeModal()
	{
		this._setModalVisible(false)
	}
	_renderHeader()
	{
		var data=this.props.data
		return(
		<View style={styles.listheader}>

		<View style={styles.infobox}>
        	<Image style={styles.avatar} source={{uri:data.author.
        		avatar}}/>
        	<View style={styles.dcrBox}>
        		<Text style={styles.nickname}>{data.author.nickname}</Text>
        		<Text style={styles.title}>{data.title}</Text> 
        	</View>
        </View>
        <View style={styles.commentBox}>
        	<View style={styles.comment}>
        		
        		<TextInput 
        			placeholder='Add a public comment'
        			style={styles.content}
        			multiline={true}
        			onFocus={this._focus.bind(this)}
        		/>
        	</View>
        </View>
        <View style={styles.commentsArea}>
        	<Text style={styles.commentsHeader}>Comments</Text>
        </View>
        </View>
        	)
	}

	_submit()
	{
		var that=this
		if(!this.state.content)
		{
			return AlertIOS.alert('Empty comments')
		}
		if(this.state.isSending)
		{
			return AlertIOS.alert('Processing Submitting!')
		}
		this.setState({
			isSending:true
		},function()
		{
			var body={
				accessToken:'abc',
				creation:'123',
				content:that.state.content
			}
			var url=config.api.base+config.api.comment
			request.post(url,body)
			.then(function(data)
			{
				if(data&&data.success)
				{
					var items = cachedResults.items.slice()

					items=[{
						content:that.state.content,
						replyBy:{
							nickname:'movie',
							avatar:'https://1tvs492zptzq380hni2k8x8p-wpengine.netdna-ssl.com/wp-content/uploads/2017/03/422770-fc-liverpool-logo.jpg'
						},
						_id:"123"

					}].concat(items)
					

					cachedResults.items=items
					
					cachedResults.total+=1
					console.log(cachedResults.total)
					that.setState({
						isSending:false,
						dataSource:that.state.dataSource.cloneWithRows(items)
					})
					that._setModalVisible(false)
				}
			})
			.catch((err)=>
			{
				console.log(err)
				that.setState({
					isSending:false
				})
				that._setModalVisible(false)
				AlertIOS.alert('Something wrong')
			})
		})


	}
  render()
  {
  	var data = this.props.data
    
  	
    return(
    <View style={styles.container}>


    <View style={styles.header}>
	 <TouchableOpacity style=
    		{styles.popBack} onPress={this._back.bind(this)}>
    	<Icon name='ios-arrow-back' style={styles.backIcon} />
    	<Text style={styles.backText}>Back</Text>	
    		
    			
    		
    </TouchableOpacity>
    <Text style={styles.headerTitle} numberOfLines={1}>Video Page
    </Text>
    </View>



    
    <View style={styles.videoBox}>
    <Video 
    	ref='videoPlayer' 
    	source={{uri:data.video}}
    	style={styles.video}
    	volume={3}
    	paused={this.state.paused}
    	rate={this.state.rate}
    	muted={this.state.muted}
    	resizeMode={this.state.resizeMode}
    	repeat={this.repeat}

    	onLoadStart={this._onLoadSatrt}
    	onLoad={this._onLoad.bind(this)}
    	onProgress={this._onProgress.bind(this)}
    	onEnd={this._onEnd.bind(this)}
    	onError={this._onError.bind(this)}
    />
    	{
    		!this.state.videoCorrect && <Text style={styles.failtext}>
    		Something wrong with the video!</Text>
    	}

    	{
    		!this.state.videoReady&&<ActivityIndicator size="small" color='#ee735c'
    		style={styles.loading}/>
    	}

    	{
    		this.state.videoEnd?
    		<Icon onPress={this._replay.bind(this)}
    				name='ios-play'
    				size={48}
    				style={styles.playIcon}/>
    		:null
    	}

    	
    		
    		<TouchableOpacity style=
    		{styles.pauseBtn} onPress={this._pause.bind(this)}>
    		
    		{this.state.paused?<Icon name='ios-play'
    			style={styles.resumeIcon} size={48}
    			onPress={this._resume.bind(this)}/>:<Text></Text>
    		}
    			
    		
    		</TouchableOpacity>

    	
    	
    	<View style={styles.progressBox}>
    		<View style={[styles.progressBar,{width:width*
    			this.state.videoProgress}]}>

    		</View>
    	</View>
    	
    	</View>
    	
        

        <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow.bind(this)}
        renderFooter={this._renderFooter.bind(this)}
        renderHeader={this._renderHeader.bind(this)}
        onEndReached={this._fetchMoreData.bind(this)}
        onEndReachedThreshold={20}//离底部多高预加载
        enableEmptySections={true}
        
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
         /> 
         <Modal 
         		animationType={'fade'}
         		visible={this.state.modalVisible}
         		onRequestClose={()=>{this._setModalVisible(false).bind(this)}}>
         <View style={styles.modalContainer}>
         	<Icon
         		onPress={this._closeModal.bind(this)}
         		name='ios-close-outline'
         		style={styles.closeIcon}
         	/>
         	<View style={styles.commentBox}>
        	<View style={styles.comment}>
        		
        		<TextInput 
        			placeholder='Add a public comment'
        			style={styles.content}
        			multiline={true}
        			onFocus={this._focus.bind(this)}
        			onBlur={this._blur.bind(this)}
        			defaultValue={this.state.content}
        			onChangeText={(text)=>{
        				this.setState({
        					content:text
        				})
        			}}
        		/>
        	</View>
        	</View>
        	<Button style={styles.submitBtn} title="Submit" onPress={this._submit.bind(this)}/>
        	
         </View>
         </Modal>
        
    </View>
    );

  }


}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },

  videoBox:{
  	width:width,
  	height:width*0.56,
  	backgroundColor:'#000',
  	marginBottom:2
  },
  video:{
  	width:width,
  	height:width*0.56,
  	backgroundColor:'#000',
  },
  loading:{
  	position:'absolute',
  	left:0,
  	top:80,
  	width:width,
  	alignSelf:'center',
  	backgroundColor:'transparent'

  },
  progressBox:{
  	width:width,
  	height:2,
  	backgroundColor:'#ccc'

  },
  progressBar:{
  	height:2,
  	width:1,
  	backgroundColor:'red' 
  },
  playIcon:{
  	position:'absolute',
      top:100,
      left:width/2-30,
      width:60,
      height:60,
      paddingTop:8,
      paddingLeft:20,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:30 ,
      color:'#ed7b66'
  },
  pauseBtn:{
  	 width:width,
  	 height:60,
  	 position:'absolute',
  	 left:0,
  	 top:0



  },
  resumeIcon:{
  	  width:60,
      height:60,
      paddingTop:8,
      paddingLeft:20,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:30 ,
      color:'#ed7b66',
      alignSelf:'center'
  },
  failtext:{
  	position:'absolute',
  	left:0,
  	top:90,
  	width:width,
  	textAlign:'center',
  	color:'white',
  	backgroundColor:'transparent'
  },
  header:{
  	width:width,
  	flexDirection:'row',
  	justifyContent:'center',
  	alignItems:'center',
  	height:64,
  	paddingTop:20,
  	paddingLeft:10,
  	paddingRight:10,
  	borderBottomWidth:1,
  	borderColor:'black',
  	backgroundColor:'white',
  },
  popBack:{
  	position:'absolute',
  	left:12,
  	top:32,
  	width:50,
  	flexDirection:'row',
  	alignItems:'center'
  },
  headerTitle:{
  	width:width-120,
  	textAlign:'center'
  },
  backIcon:{
  	color:'#999',
  	fontSize:20,
  	marginRight:5,

  },
  backText:{
  	color:'#999'
  },
  infobox:{
  	width:width,
  	flexDirection:'row',
  	justifyContent:'center',
  	marginTop:10,
  	marginRight:20
  },
  avatar:{
  	width:60,
  	height:60,
  	marginRight:10,
  	marginLeft:10,
  	borderRadius:30

  },
  dcrBox:{
  	flex:1
  },
  nickname:{
  	fontSize:18

  },
  title:{
  	marginTop:8,
  	marginRight:10,
  	fontSize:16,
  	color:'#666'
  },
  replyBox:{
  	flexDirection:'row',
  	justifyContent:'flex-start',
  	marginTop:10,

  },
  replyAvatar:{
  	width:40,
  	height:40,
  	marginRight:10,
  	marginLeft:10,
  	borderRadius:20
  },
  replyNickname:{
  	color:'#666'

  },
  replyContent:{
  	marginTop:4,
  	color:'#666'
  },
  reply:{
  	flex:1,
  	marginRight:10
  },
  loadingMore:{
      marginVertical:20
    },
    loadingText:{
      color:'#777',
      textAlign:'center'
    },
   listheader:{
   	marginTop:10,
   	width:width
   	
   },
   commentBox:{
   	marginTop:10,
   	marginBottom:10,
   	padding:8,
   	width:width
   },
   content:{
   	paddingLeft:2,
   	color:'#333',
   	borderWidth:1,
   	borderColor:'#ddd',
   	borderRadius:3,
   	fontSize:14,
   	height:80
   },
   commentsHeader:{
   		paddingLeft:10,
   		paddingBottom:2
   },
   commentsArea:{
   		borderBottomWidth:1,
   		borderBottomColor:'#eee'

   },
   modalContainer:{
   	flex:1,
   	paddingTop:45,
   	backgroundColor:'#fff',

   },
   closeIcon:{
   	alignSelf:'center',
   	fontSize:30,
   	color:'#ee753c'
   },
   submitBtn:{
   	width:width - 20,
   	padding:16,
   	marginTop:20,
   	marginBottom:20,
   	borderWidth:1,
   	borderColor:'#ee735c',
   	borderRadius:4,
   	color:'red',
   	fontSize:18
   }





  
});

module.exports=Detail