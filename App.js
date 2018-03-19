import React, { Component } from 'react';
import { Alert, 
  AppRegistry, 
  Button, 
  StyleSheet, 
  View,
  Text,
  TabBarIOS,
  NavigatorIOS,
  AsyncStorage  } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'


import Login from './App/account/login.js'
import Account from './App/account/index.js'
import Edit from './App/edit/index.js'
import Record from './App/creation/index.js'

var createReactClass = require('create-react-class');









class App extends Component{
  // getDefaultProps() {
  //   console.log('son', 'getDefaultProps')
  // }
  // getInitialState() {
  //   console.log('son', 'getInitialState')
  //   return {
  //     times: this.props.times
  //   }
  // }
  constructor(props) {
    super(props);
    this.state = {
      user:null,
      selectedTab: 'Record',
      logined:false
  };
  }

  setTab(tabId) {
    this.setState({selectedTab: tabId});
  }
  componentDidMount()
  {
    this._asyncAppstatus()
  }

  _asyncAppstatus()
  {
    var that=this 
    AsyncStorage.getItem('user')
      .then((data)=>
      {
        var user
        var newState={}
        if(data){
          user =JSON.parse(data)
        }
        if(user &&user.accessToken)
        {
          newState.user=user
          newState.logined=true
        }
        else
        {
          newState.logined=false
        }
        that.setState(newState)
      })
  }
  _afterLogin(user)
  {
    var that=this
    user = JSON.stringify(user)
      AsyncStorage.setItem('user',user)
      .then(function()
      {
        that.setState({
          logined:true,
          user:user
        })
      })
  }
  _logout()
  {
    AsyncStorage.removeItem('user')
    this.setState({
      logined:false,
      user:null
    })
  }

  render() {
    if(!this.state.logined)
    {
      return <Login afterLogin={this._afterLogin.bind(this)}/>
    }
    return (
      <TabBarIOS tintColor="red">
        <Icon.TabBarItem
          iconName="ios-videocam-outline"
          selectedIconName='ios-videocam'
          selected={this.state.selectedTab === 'Record'}
          onPress={() => this.setState({selectedTab:'Record'})}>
          <NavigatorIOS 
            initialRoute={{
              title:'视频页面',
              component:Record,
            
            
            }}
            navigationBarHidden={true}
           
            style={{flex: 1}}
            />
        </Icon.TabBarItem>

        <Icon.TabBarItem
          iconName="ios-recording-outline"
          selectedIconName='ios-recording'
          selected={this.state.selectedTab === 'Edit'}
          onPress={() => this.setState({selectedTab:'Edit'})}>
          <Edit/>
        </Icon.TabBarItem>

        <Icon.TabBarItem
          iconName="ios-more-outline"
          selectedIconName='ios-more'
          selected={this.state.selectedTab === 'Account'}
          onPress={() => this.setTab('Account')}>
          <Account user={this.state.user}logout={this._logout.bind(this)}/>
        </Icon.TabBarItem>
      </TabBarIOS>
    );
  }
}





  



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
   tabContent: {
    flex: 1,
    alignItems: 'center'
  },
  tabText: {
    margin: 50,
    fontSize: 40
  }
});
module.exports=App
