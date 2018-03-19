import React, { Component } from 'react';
import { Alert, 
  AppRegistry, 
  Button, 
  StyleSheet, 
  View,
  Text,
  TabBarIOS,
  TextInput,
  AlertIOS,
  Modal,
  TouchableOpacity
   } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons'
import CountdownCircle from 'react-native-countdown-circle'
var config  = require('../common/config')
var request = require('../common/request')

class Login extends React.Component{
	constructor(props) {
    super(props);
 	var data=this.props.data
 	
    this.state = {
      Username:'',
      codeSent:false,
      password:'',
      countingDone:false,
      modalVisible:false,
      //signup
      s_username:'',
      s_password:'',
      s_password_re:'',
      s_nickname:'',
      s_gender:''
      };
  }
  _showVerifyCode()
  {
  	this.setState({
  		codeSent:true
  	})
  }



  _submit()
  {
  	var that=this
  	var password=this.state.password
  	var username=this.state.username
  	if(!username||!password)
  	{
  		AlertIOS.alert('username or password can not be empty!')
  		return
  	} 
  	var body={
  		username:username,
  		password:password
  	}
  	var verifyUrl=config.api.base2+config.api.verify
  	console.log(verifyUrl)
  	request.post(verifyUrl,body)
  	.then((data)=>{
      console.log(data)
  		if(data&&data.success)
  		{
  			this.props.afterLogin(data.data)
  		}
  		else
  		{
  			AlertIOS.alert('username or password is wrong')
  		}
  	})
  	.catch((err)=>{
  		console.log(err)
  		AlertIOS.alert('Something wrong!')
  	})
  }



  _sentVerifyCode()
  {
  	var that=this
  	var phoneNumber=this.state.phoneNumber
  	if(!phoneNumber)
  	{
  		AlertIOS.alert('Phone number can not be empty!')
  		return
  	} 
  	var body={
  		phoneNumber:phoneNumber
  	}
  	var signupUrl=config.api.base+config.api.signup

  	request.post(signupUrl,body)
  	.then((data)=>{
  		if(data&&data.success)
  		{
  			that._showVerifyCode()
  			that.setState({
  				countingDone:false
  			})
  		}
  		else
  		{
  			AlertIOS.alert('Verify Code is wrong')
  		}
  	})
  	.catch((err)=>{
  		AlertIOS.alert('Please check Internet connection')
  	})
  }

  _countingDone()
  {
  	this.setState({
  		countingDone:true
  	})
  }
  _signup()
  {
      this.setState({
        modalVisible:true
      })
  }
  s_submit()
  {
    var that=this
    if(this.state.s_nickname&&this.state.s_username&&this.state.s_password_re&&this.state.s_password)

    {
      if(this.state.s_password!==this.state.s_password_re)
      {
        AlertIOS.alert('Password should be Identical')
        return
      }
      var signupURL= config.api.base2+config.api.signup
      console.log(signupURL)
      request.post(signupURL,{
        nickname:this.state.s_nickname,
        password:this.state.s_password_re,
        username:this.state.s_username
      }).catch((err)=>{
        console.log(err)
      }).
      then((data)=>{
        if(data&&data.success)
        {
          console.log(data)

        
        }
        else
        {
          console.log(data)
          AlertIOS.alert('Username has been used')
        }
      })
     
    }
    else
    {
      AlertIOS.alert('Something missing')
    }
   
    this.s_cancel()

    return
  }
  s_cancel()
  {
    this.setState({
      modalVisible:false
    })
  }
  render()
  {
    return(
    <View style={styles.container}>
    	<View style={styles.signupBox}>
    		<Text style={styles.title}>Login</Text>
    		<TextInput 
        			placeholder='Username'
        			
        			onChangeText={(text)=>{
        				this.setState({
        					username:text
        				})
        			}}
        			autoCapitalize={'none'}
        			autoCorrect={false}
        			keyboardType={'number-pad'}
        			style={styles.inputField}
        	/>
        	
        		
            <View style={styles.passwordBox}>
              <TextInput 
              placeholder='Password'
              
              onChangeText={(text)=>{
                this.setState({
                  password:text
                })
              }}
              autoCapitalize={'none'}
              autoCorrect={false}
              defaultValue={this.state.password}
              keyboardType={'number-pad'}
              style={styles.inputField}
              />

            </View>
          <View style={styles.buttonBox}>
        	<Button title={'Submit'} onPress={this._submit.bind(this)}/>
          <Button title={'Sign up'} onPress={this._signup.bind(this)}/>
        	</View>
    	</View>


        <Modal
          animationType={'slide'}
          visible={this.state.modalVisible}>
        <View style={styles.inputForm}>
           <TextInput 
              placeholder='Username'
              
              onChangeText={(text)=>{
                this.setState({
                  s_username:text
                })
              }}
              autoCapitalize={'none'}
              autoCorrect={false}
              defaultValue={this.state.s_username}
              keyboardType={'number-pad'}
              style={styles.s_input}
              />
             <TextInput 
              placeholder='Password'
               secureTextEntry={true}
              onChangeText={(text)=>{
                this.setState({
                  s_password:text
                })
              }}
              autoCapitalize={'none'}
              autoCorrect={false}
              defaultValue={''}
              keyboardType={'number-pad'}
              style={styles.s_input}
              />
              <TextInput 
              placeholder='Enter password again'
               secureTextEntry={true}
              onChangeText={(text)=>{
                this.setState({
                  s_password_re:text
                })
              }}
              autoCapitalize={'none'}
              autoCorrect={false}
              defaultValue={''}
              keyboardType={'number-pad'}
              style={styles.s_input}
              /> 
              <TextInput 
              placeholder='Nickname'
             
              onChangeText={(text)=>{
                this.setState({
                  s_nickname:text
                })
              }}
              autoCapitalize={'none'}
              autoCorrect={false}
              defaultValue={''}
              keyboardType={'number-pad'}
              style={styles.s_input}
              /> 
              <View style={styles.s_buttonBox}>
                <TouchableOpacity style={styles.sign_up_submit} onPress={this.s_submit.bind(this)}><Icon name='ios-play' size={28}/><Text>submit</Text></TouchableOpacity>
                <TouchableOpacity style={styles.sign_up_cancel} onPress={this.s_cancel.bind(this)}><Text>cancel</Text></TouchableOpacity>
              </View>
        </View>

      </Modal>

    </View>
    );

  }


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding:10,
    backgroundColor: '#f9f9f9',
  },
  signupBox:{
  	marginTop:30,
  },
  title:{
  	marginBottom:20,
  	color:'#333',
  	fontSize:20,
  	textAlign:'center'
  },
  inputField:{
  	
  	height:60,
  	padding:5,
  	color:'#666',
  	fontSize:16,
  	backgroundColor:'#fff',
  	borderRadius:4,
  	marginBottom:5,
  	borderWidth:1
  },
  passwordBox:{
  	marginTop:10,
  	
  	justifyContent:'space-between'
  },
  countBtn:{
  	width:110,
  	height:40,
  	padding:10,
  	marginLeft:8,
  	backgroundColor:'transparent',
  	borderColor:'#ee735c',
  	textAlign:'left',
  	fontWeight:'600',
  	
  	borderRadius:2
  },
  buttonBox:{
    flexDirection: 'row' ,
    justifyContent:  'center'
  },
   s_input:{
    marginTop: 5,
    height:60,
    padding:5,
    color:'#666',
    fontSize:16,
    backgroundColor:'#fff',
    borderRadius:4,
    marginBottom:5,
    borderWidth:1
  },
  s_buttonBox:{
    flexDirection: 'row',
    justifyContent:  'space-between' ,
    margin: 10
  },
  sign_up_submit:{
    flexDirection: 'row',
    backgroundColor: 'skyblue',
    alignItems:  'center' ,
    borderRadius: 4,
    borderWidth: 1 ,
    padding: 2
  }
  
});

module.exports=Login