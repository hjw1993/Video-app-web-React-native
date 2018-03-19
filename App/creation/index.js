import React, { Component } from 'react';
import Mock from 'mockjs'
import { Alert, 
  AppRegistry, 
  Button, 
  StyleSheet, 
  View,
  Text,
  TabBarIOS,
  ListView,
  Image,
  TouchableHighlight,
  ActivityIndicator,
  RefreshControl,
  Dimensions  } from 'react-native';
  var AlertIOS=React.AlertIOS
var config  = require('../common/config')
var request = require('../common/request')
var Detail = require('./detail')
import Icon from 'react-native-vector-icons/Ionicons'

var width= Dimensions.get('window').width
var cachedResults={

  nextPage:1,
  items:[],
  total:0
}




class Item extends React.Component{


  constructor(props) {
    super(props);
    var row=this.props.row
    
    this.state = {
      up:row.voted,
      row:this.props.row
      };
    }

  _up()
  {
    var that=this
    var up=this.state.up
    var row=this.state.row 
    var url=config.api.base+config.api.up
    var body ={
      id: row._id,
      up:up?'yes':'no',
      accessToken:'abc'
    }
    request.post(url,body)
      .then(function(data){
        if(data&&data.success)
        {
          that.setState({
            up:!up
          })
        }
        else
        {
          AlertIOS.alert('Not working!')
        }
      }
      )
      .catch(function(err)
      {
        console.log(err)
      }
      ) 
  }
  render()
  {
    var row=this.state.row
    return (
      <TouchableHighlight onPress={this.props.onSelect}>
      <View style={styles.item}>
        <Text style={styles.title}>{row.title}</Text>
        <Image
            style={styles.thumb}
         source={{uri:row.thumb}}
        />

        <Icon
        name='ios-play'
        size={28}
        style={styles.play} /> 
         

          <View style={styles.itemFooter}>
              
               <View style={styles.handleBox}>
                <Icon
                  name={ this.state.up? 'ios-heart' : 'ios-heart-outline'}
                  size={28}
                  style={[styles.up,this.state.up?null:styles.down]}
                  onPress={this._up.bind(this)} />

               <Text style={styles.handleText} onPress={this._up.bind(this)}> Like</Text>
               </View>
               
               <View style={styles.handleBox}>
                <Icon
                  name='ios-chatbubbles-outline'
                  size={28}
                  style={styles.comment} />
                <Text style={styles.handleText}> Comment</Text>
              </View>

          </View>
          </View>
        </TouchableHighlight>
        )
  }
}

class Record extends React.Component{
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      isLoadingTail: false,
      isRefreshing:false,
      dataSource: ds.cloneWithRows([  ]),
      num:2
      };
  }


  




  _renderRow(row)
  {
    return(
      <Item key={row._id} 
      onSelect={()=>this._loadPage(row)} 
      row={row} />
          )
  }

  componentDidMount(){
      this._fetchData(1);
    }


  _fetchMoreData()
  {

    console.log(this.state);
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
    
    

  request.get(config.api.base+ config.api.creations,{
    accessToken:'abc',
    page: page
    })

    .then((data) => {
     
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
        <View style={styles.loadingMore}><Text style={styles.loadingText}>No more videos</Text></View>
        )
    }
   
    if(!this.state.isLoadingTail)return <View style={styles.loadingMore}/>
      
       
    return    <ActivityIndicator size="small" style={styles.loadingMore}/>
        
      
    }

  _onRefresh()
  {
    if(this.state.isRefreshing||!this.hasMore())
      return
    
    this._fetchData(0)
  }


  _loadPage(row)
  {
    this.props.navigator.push({
      title:'detail',
      component:Detail,
      passProps:{
        data:row
      }
    })
  }

  render()
  {
    return(
    <View style={styles.container}>
    <View style={styles.header}>
    <Text style={styles.headerContent}> 视频列表 </Text>
    
    </View>
    <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow.bind(this)}
        renderFooter={this._renderFooter.bind(this)}
        onEndReached={this._fetchMoreData.bind(this)}
        onEndReachedThreshold={20}//离底部多高预加载
        enableEmptySections={true}
        refreshControl={
          <RefreshControl
            refreshing={this.state.isRefreshing}
            onRefresh={this._onRefresh.bind(this)}
            tintColor='#ff6600'
            title='Loading...'
          />}
        showsVerticalScrollIndicator={false}
        automaticallyAdjustContentInsets={false}
      /> 
    </View>
    );

  }


}





const styles = StyleSheet.create({
  container: {
    flex:1,
    
    backgroundColor: '#F5FCFF',
    
  },
  header: {
    
    paddingTop: 25,
    paddingBottom: 15,
    backgroundColor: 'red'
  },
  headerContent: {
    
    textAlign: 'center',
    fontWeight:'600',
    fontSize: 16,
    color:'white'

  },
  item:{
    width:width,
    backgroundColor:'#fff',
    marginBottom:10
  },
  title:{
    padding:10, 
    
    fontSize:15,
    fontWeight:'600',
    color:'#333'

  },
  thumb:{
    width:width,
    height:width*0.56,
    resizeMode:'cover'
  },
  itemFooter:{
    flexDirection:'row',
    justifyContent:'space-between',
    width:width,
    
    backgroundColor:'#eee'
  },
  handleBox:
  {
    padding:10,
    flexDirection:'row',
    width:width/2-0.5,
    justifyContent:'space-between',
    backgroundColor:'#fff'
  },
  play:{
      position:'absolute',
      bottom:46,
      right:14,
      width:46,
      height:46,
      paddingTop:9,
      paddingLeft:18,
      backgroundColor:'transparent',
      borderColor:'#fff',
      borderWidth:1,
      borderRadius:23 
    },
    handleText:{
      paddingLeft:12,
      fontSize:18,
      color:'green'
    },
    up:{
      fontSize:22,
      color:'red'
    },
    down:{
      fontSize:22,
      color:'#333'
    },
    comment:{
      fontSize:22,
      color:'#333'
    },
    loadingMore:{
      marginVertical:20
    },
    loadingText:{
      color:'#777',
      textAlign:'center'
    }
  

  
});

module.exports=Record