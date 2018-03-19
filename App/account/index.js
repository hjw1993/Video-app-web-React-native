import React, { Component } from 'react';
import { Alert, 
  AppRegistry, 
  
  StyleSheet, 
  View,
  Text,
  TabBarIOS,
  TouchableOpacity,
  Image,
  AsyncStorage ,
  AlertIOS,
  Modal,
  TextInput,

  Dimensions } from 'react-native';
import { Button } from 'react-native-elements'
var ImagePicker = require('react-native-image-picker')
var Progress  =require('react-native-progress')
var request = require('../common/request')

var config = require('../common/config')
var photo_options = {
  title: 'Select Photo',
  cancelButtonTitle:'Cancel',
  takePhotoButtonTitle:'Take a picture',
  chooseFromLibraryButtonTitle:'Select photo album',
  quality:0.75,
  allowsEditing:true,
  noData:false,
  customButtons: [
    {name: 'fb', title: 'Choose Photo from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
}
var sha1 = require('sha1');
var CLOUDINARY = {
  cloud_name:'dv4ssorek',  
  api_key: '429911751375821',  
  api_secret: 'JAQy16dbMlo3i6xPoWMxkez-l8M',  
  
  base:'http://res.cloudinary.com/dv4ssorek',
  image:'https://api.cloudinary.com/v1_1/dv4ssorek/image/upload',
  video:'https://api.cloudinary.com/v1_1/dv4ssorek/video/upload',
  audio:'https://api.cloudinary.com/v1_1/dv4ssorek/raw/upload'
}
import Icon from 'react-native-vector-icons/Ionicons'

var width= Dimensions.get('window').width






class Account extends React.Component{
  constructor(props) {
    super(props);
  var user=this.props.data || {}
  
    this.state = {
          user:user,
          avatarProgress:0,
          avatarUploading:false,
          modalVisible:false
      };
  }

  avatar(id,type)
  {
    if(id.indexOf('http')>-1)
    {
      return id
    }
    if(id.indexOf('data:image')>-1)
    {
      return id
    }
      return CLOUDINARY.base+'/'+type+'/upload/'+id
    
    
  }

  _edit()
  {
    this.setState({
      modalVisible:true
    })
  }
  _closeModal()
  {
    this.setState({
      modalVisible:false
    })
  }


  componentDidMount()
  {
    var that=this
    AsyncStorage.getItem('user')
      .then((data)=>{
        var user
        if(data){
         user=JSON.parse(data )
        }
        console.log('work')
        if(user&&user.accessToken)
        {
           
          console.log('work')
          that.setState({
            user:user
          })
        }
      })
     
  }

  _pickPhoto()
  {
    var that = this

    ImagePicker.showImagePicker(photo_options,(res)=>{
      if(res.didCancel)
      {
        return
      }
      console.log(res)
      var avatarData='data:image/jpeg;base64,' +res.data
      var timestamp=Date.now()
      var tags = 'app,avatar'
      var folder='avatar'
      var signatureURL = config.api.base+ config.api.signature
      var accessToken=this.state.user.accessToken
      var signature='folder='+folder+'&tags='+tags+
      '&timestamp='+timestamp+CLOUDINARY.api_secret
      signature=sha1(signature)

      request.post(signatureURL,{
        accessToken:accessToken,
        timestamp:timestamp,
        type:'avatar'
      })
      .catch((err)=>{
        console.log(err)
      }).then((data)=>{
                if(data&&data.success)
        {

          
          
          
          
            
            
            var body=new FormData()
            body.append('folder',folder)
            body.append('signature',signature)
            body.append('tags',tags)
            body.append('api_key',CLOUDINARY.api_key)
            
            body.append('file',avatarData)
            body.append('timestamp',timestamp)
            // var body={
            //   folder:folder,
            //   signature:signature,
            // tags:tags,
            // api_key:CLOUDINARY.api_key,
            // resource_type:'image',
            // file:avatarData,
            // timestamp:timestamp
            // }
            
            that._upload(body)
        }
      })
    })
  }

  _upload(body)
  {
    var that=this
    this.setState({
      avatarUploading:true,
      avatarProgress:0
    })
    var xhr = new XMLHttpRequest()

    var url= CLOUDINARY.image

    xhr.open('POST',url)

    xhr.onload  = ()=>{

      if(xhr.status!==200)
      {
        AlertIOS.alert('Failed')
        console.log(xhr.responseText)
        return
      }
      if(!xhr.responseText)
      {
        AlertIOS.alert('Failed')
        return
      }
      var response
      try{
        response=JSON.parse(xhr.response)
      }
      catch(e)
      {
        console.log(e)

      }
      if(response&&response.public_id)
      {
        
        var user = this.state.user
        user.avatar= response.public_id

        that.setState({
          avatarUploading:false,
          avatarProgress:0,
          user:user

        })
        that._asyncUser(true)
      }
    }
    
    if(xhr.upload)
    {
      xhr.upload.onprogress = (event)=>{
        if(event.lengthComputable)
        {
          var percent  = Number((event.loaded / event.total).toFixed(2))
          that.setState({
            avatarProgress:percent
          })
        }
      }
    }
    xhr.send(body)
    console.log(xhr)
  }

  _asyncUser(isAvatar)
  {
    var that=this
    var user= that.state.user

    if(user &&user.accessToken)
    {
      var url=config.api.base + config.api.update

      console.log(user)
      request.post(url,user)
      .then((data)=>{
        if(data&&data.success)
        {

          var user =data.data
          if(isAvatar)
          {
          AlertIOS.alert('Avatar Updating success!')
          }
          that.setState({
            user:user
          },function()
          {
            this._closeModal()
            AsyncStorage.setItem('user',JSON.stringify(user))
          })
        }
      }).catch((e)=>{
        console.log(e)
      })

    }
  }

_changeUserState(key,value)
{
    var user= this.state.user

    user[key]=value
    console.log(key,value)
    this.setState({
      user:user
    })
}

_submit()
{
  this._asyncUser(false)
}

_logout()
{
  this.props.logout()
}

  render()
  {
    var user=this.state.user
    
    return(
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toobarTitle}>My Account</Text>
        <Text style={styles.toobarEdit} onPress={this._edit.bind(this)}>Edit</Text>
      </View>
      { 
        user.avatar?
         <TouchableOpacity style={styles.avatarContainer} onPress={this._pickPhoto.bind(this)}> 
          <View style={styles.avatarContainer}>
            <View style={styles.avatarBox}>
            {
              this.state.avatarUploading?
              <Progress.Circle size={75} 
              showsText={true} 
              //indeterminate={true} 
              progress={this.state.avatarProgress}
              color={'#ee735c'}
              />:
              <Image 
                  source={{uri:this.avatar(user.avatar,'image')}}

                  style={styles.avatar}/>
            }

            </View>
            <Text style={styles.avatarTip}>Change your photo</Text>
            </View>

          </TouchableOpacity>

      
        :
        <View style={styles.avatarContainer}> 
          <Text style={styles.avatarTip}>Add a photo</Text>
            <TouchableOpacity style={styles.avatarBox} onPress={this._pickPhoto.bind(this)}>
            { 
              this.state.avatarUploading?
              <Progress.Circle size={75} 
              showsText={true} 
              
              progress={this.state.avatarProgress}
              color={'#ee735c'}
              />:
              <Icon 
                name='ion-ios-plus'
                style={styles.plusIcon}/>
            }

            </TouchableOpacity>

        </View>
      }
      <Modal
      animationType={'slide'}
      visible={this.state.modalVisible}>
      <View style={styles.modalContainer}>
        <Icon 
          name='ios-close'
          style={styles.closeIcon}
            onPress={this._closeModal.bind(this)}
          />
          <View style={styles.fieldItem}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              placeholder={'input your Nickname'}
              style={styles.inputField}
              autoCapitalize={'none'}
              defaultValue={user.nickname}
              onChangeText={(text)=>{
                this._changeUserState('nickname',text)
              }}
            />
          </View>
         

          <View style={styles.fieldItem}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              placeholder={'input your Nickname'}
              style={styles.inputField}
              autoCapitalize={'none'}
              defaultValue={user.age}
              onChangeText={(text)=>{
                this._changeUserState('age',text)
              }}
            />
          </View>
           <View style={styles.fieldItem}>
            <Text style={styles.label}>Gender</Text>
            <Icon.Button
              name='ios-male'   style={[styles.gender,
                this.state.user.gender=='male'&&styles.genderChecked]}  onPress={()=>{this._changeUserState('gender','male')}}>Male</Icon.Button>
              <Icon.Button
              name='ios-female' style={[styles.gender,
                this.state.user.gender=='female'&&styles.genderChecked]} onPress={()=>{this._changeUserState('gender','female')}}>Female</Icon.Button>

          </View>
          
          <Button title={'Submit'} onPress={this._submit.bind(this)}/>
      </View>
      
         
      </Modal>
      <Button title={'Log out'} onPress={this._logout.bind(this)}/>
    </View>
    );

  }


}


const styles = StyleSheet.create({
  container: {
    flex: 1,
   
  },
  toolbar:{
    flexDirection:'row',
    paddingTop:25,
    paddingBottom:12,
    backgroundColor:'#ee735c',

  },
  toobarTitle:{
    flex:1,
    fontSize:16,
    color:'#fff',
    textAlign:'center',
    fontWeight:'600'
  },
  avatarContainer:{
    width:width,
    height:140,
    alignItems:'center',
    justifyContent:'center',
    backgroundColor:'#666'
  },
  avatarBox:{
    marginTop:15,
    alignItems:'center',
    justifyContent:'center'
  },
  plusIcon:{
    padding:20,
    paddingLeft:25,
    paddingRight:25,
    color:'#999',
    fontSize:20,
    backgroundColor:'#fff',
    borderRadius:8
  },
   avatar:{
    width:60,
    height:60,
    marginRight:10,
    marginLeft:10,
    borderRadius:30

  },
  avatarTip:{
    color:'#fff',
    backgroundColor:'transparent',
    fontSize:14
  },
  toobarEdit:{
    position:'absolute',
    right:10,
    top:26,
    color:'#fff',
    textAlign:'right',
    fontWeight:'600',
    fontSize:14
  },
  modalContainer:{
    flex:1,
    paddingTop:50,
    backgroundColor:'#fff'
  },
  fieldItem:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:50,
    paddingLeft:15,
    paddingRight:15,
    borderColor:'#eee',
    borderBottomWidth:1 
  },
  label:{
    color:'#ccc',
    marginRight:10,

  },
  inputField:{
    height:49,
    flex:1,
    color:'#666',
    fontSize:14
  },
  closeIcon:{
    position:'absolute',
    width:40,
    height:40,
    fontSize:32,
    right:20,
    top:30,
    color:'#ee735c'
  },
  gender:{
    backgroundColor:'#ccc'
  },
  genderChecked:{
    backgroundColor:'red'
  },
  btn_submit:{
    
    
   flex:0,
    width:width/2
    
    
  },
  btn_submit_container:{
    marginTop:26,
    alignSelf:'center',
    width:width/2,
    borderRadius:4,
    backgroundColor:'#ee735c',
    borderColor:'#ee733c'
    

  }



});

module.exports=Account