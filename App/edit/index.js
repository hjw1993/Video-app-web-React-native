import React, { Component } from 'react';
import { Alert, 
  AppRegistry, 
  Button, 
  StyleSheet, 
  View,
  Text,
  TabBarIOS,
  TouchableOpacity,
  Dimensions,
  AsyncStorage,
  ProgressViewIOS,
  AlertIOS,
  Image,
  Platform,
  Picker,
  PermissionsAndroid } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'
var Video =require('react-native-video').default
import Icon from 'react-native-vector-icons/Ionicons'
var width= Dimensions.get('window').width
var height= Dimensions.get('window').height
var  ImagePicker= require('react-native-image-picker')
var config  = require('../common/config')
var request = require('../common/request')
import CountdownCircle from 'react-native-countdown-circle'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
var Sound = require('react-native-sound')
var Progress  =require('react-native-progress')
var video_options = {
  title: 'Select Video',
  cancelButtonTitle:'Cancel',
  takePhotoButtonTitle:'luzhi 10 secs',
  chooseFromLibraryButtonTitle:'Select video album',
 
  videoQuality:'medium',
  mediaType:'video',
  durationLimit:10,
  noData:false,
  
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


 


class Edit extends React.Component{
  constructor(props) {
    super(props);
  var user=this.props.data || {}
  
    this.state = {
          previewVideo:null,
         
          modalVisible:false,
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
          user:user,
          isLoadingTail:false,
          isRefreshing:false,

          videoUploadProgress:0.01,
          videoUploaded:true,
          videoUploading:false,
          //countdown
          counting:false,
          recording:false,
          //audio
          audioPath: AudioUtils.DocumentDirectoryPath + '/movie.aac',
          audioPlaying:false,
          recordDone:false,

          audioUploadProgress:0.01,
          audioUploaded:true,
          audioUploading:false,
          audio:null,
          videoId:null,
          audioId:null,

          language:null,
          audioItems:null

      };
  }
  _getToken(type)
  {
    var signatureURL=config.api.base2 +config.api.signature

    var accessToken = this.state.user.accessToken
    var timestamp= Date.now()
    return request.post(signatureURL,{
      accessToken:accessToken,
      type:type,
      timestamp:timestamp
    }).catch((err)=>{
      console.log(err)
    })
  }
  //audio
  prepareRecordingPath(audioPath){
      AudioRecorder.prepareRecordingAtPath(audioPath, {
        SampleRate: 22050,
        Channels: 1,
        AudioQuality: "High",
        AudioEncoding: "aac",
        AudioEncodingBitRate: 32000
      });
    }
  _preview()
  {
    if(this.state.audioPlaying)
    {
      AudioRecorder.stopPlaying()
    }
    this.setState({
      videoProgress:0,
      audioPlaying:true
    })
    
    var sound = new Sound(this.state.audioPath, '', (error) => {
          if (error) {
            console.log('failed to load the sound', error);
          }
          else
          {
            sound.play()
          }
        })
    // sound.play((success) => {
    //         if (success) {
    //           console.log('successfully finished playing');
    //         } else {
    //           console.log('playback failed due to audio decoding errors');
    //         }
    //       })
    this.refs.videoPlayer.seek(0)
    
  }
  _uploadAudio()
  {
    var that = this
    
    this.setState({
                  audioUploading:true,
                  audioUploadProgress:0.01
                })
      var timestamp=Date.now()
        var tags = 'app,audio'
        var folder='audio'
        var signatureURL = config.api.base2+ config.api.signature
        var accessToken=this.state.user.accessToken
        
      this._getToken('audio').catch((err)=>{
        console.log(err)
      }).then((data)=>{
        if(data&&data.success)
        {
        let task = RNFetchBlob.fetch(
                  'POST',
                  CLOUDINARY.video,
                  {},
                  [{
                    name : 'file',
                    filename : 'movie.aac',
                    data: RNFetchBlob.wrap(that._makeUri(this.state.audioPath)),
                  },
                  {name:'signature',data:data.data},
                  {
                    name:'tags',data:tags
                  },
                  {
                    name:'folder',data:folder
                  },
                  {
                    name:'api_key',data:CLOUDINARY.api_key
                  },
                  {
                    name:'timestamp',data:timestamp
                  }])

                task.uploadProgress((written, total) => {
                    
                  var percent  = Number((written / total).toFixed(2))
                  console.log(percent)
                  that.setState({
                    audioUploadProgress:percent
                    })
                })
                 
                task.then((res) => {
                  console.log('res: ', res)
                  that.setState({
                  audioUploading:false,
                  audioUploaded:true,
                  audio:res
                  

                  })
                   var audio=res
                  var updateURL=config.api.base2+config.api.audio
                  


                  var updateBody={
                    videoId:this.state.videoId,
                    audio:audio.data,
                    accessToken:this.state.user.accessToken
                  }
                  
                  request.post(updateURL,updateBody).
                  catch((err)=>{
                    console.log(err)
                  }).
                  then((data)=>{
                    if(data&&data.success)
                    {
                      that.setState({
                        audioId:data.data
                      })
                      
                    }
                    else
                    {
                      
                      AlertIOS.alert("audio Uploading failed")
                    }
                  })

                })
                .catch((err) => {
                  AlertIOS.alert('Fail to upload your video')
                  console.log('err: ', err)
                })  

            }
      })

   
     
              
  }


  _initAudio()
  {

    

        this.prepareRecordingPath(this.state.audioPath);

        AudioRecorder.onProgress = (data) => {
          this.setState({currentTime: Math.floor(data.currentTime)});
        };

        AudioRecorder.onFinished = (data) => {
          // Android callback comes in the form of a promise instead.
          if (Platform.OS === 'ios') {
            this._finishRecording(data.status === "OK", data.audioFileURL);
          }
        };
      

  }
  _finishRecording(didSucceed, filePath) {
      this.setState({ finished: didSucceed });
      console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
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

      this._initAudio()
     
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
  _onEnd()
  {
        console.log('end')
        this.setState({
          
          videoReady:false,
          playing:false,
          videoEnd:true
        })
        if(this.state.recording)
        {
          this.setState({
            videoProgress:1,
            recording:false,
            recordDone:true
          })
          AudioRecorder.stopRecording()
        }
  }
      _onError(e){
        console.log(e)
        console.log('err')
        this.setState({
          videoCorrect:false
        })
      } 


  _makeUri(str)
  {
      if(str.startsWith('file://'))
        return str.substring(7)
      return str
  }
  _pickVideo()
  {
    
    var that = this

    ImagePicker.showImagePicker(video_options,(res)=>{
      console.log(res)
      if(res.didCancel)
      {
        return
      }
      var uri = res.uri
      that.setState({
        previewVideo:uri
      })
      that.setState({
                    videoUploading:true,
                    videoUploaded:false,
                    videoUploadProgress:0.01
                  })
     
      var timestamp=Date.now()
      var tags = 'app,video'
      var folder='video'
      var videoURL = config.api.base2+ config.api.video
      var accessToken=this.state.user.accessToken
      
      that._getToken('video')
      .catch((err)=>{
        console.log(err)
      }).then((data)=>{
            console.log(data)
                if(data&&data.success)
            {

              var body={
                  tags:tags,
                    folder:folder,
                  timestamp:timestamp,
                  signature:data.data,
                  res:res
                    }
                that._upload(data.data,body)
            }
      })
    })
  
  }


  _upload(signature,body)
  {
    console.log('upload')
    var that=this
    var updateURL=config.api.base2+config.api.video
    
    let task = RNFetchBlob.fetch(
                  'POST',
                  CLOUDINARY.video,
                  {},
                  [{
                    name : 'file',
                    filename : body.res.fileName,
                    data: RNFetchBlob.wrap(that._makeUri(body.res.uri)),
                  },
                  {name:'signature',data:signature},
                  {
                    name:'tags',data:body.tags
                  },
                  {
                    name:'folder',data:body.folder
                  },
                  {
                    name:'api_key',data:CLOUDINARY.api_key
                  },
                  {
                    name:'timestamp',data:body.timestamp
                  }])
                
                task.uploadProgress((written, total) => {
                    
                  var percent  = Number((written / total).toFixed(2))
                  console.log(percent)
                  that.setState({
                    videoUploadProgress:percent
                    })
                })
                 
                task.then((res) => {
                  console.log('res: ', res)
                  that.setState({
                  videoUploading:false,
                  videoUploaded:true,
                  video:res

                  })
                  var updateURL=config.api.base2+config.api.video
                  var video=res
                  request.post(updateURL,{
                    video:video.data,
                    accessToken:this.state.user.accessToken
                  }).
                  catch((err)=>{
                    console.log(err)
                  }).
                  then((data)=>{
                    if(data&&data.success)
                    {
                      that.setState({
                        videoId:data.data
                      })
                    }
                    else
                    {
                      console.log(data)
                      AlertIOS.alert("Video Uploading failed")
                    }
                  })


                })
                .catch((err) => {
                  AlertIOS.alert('Fail to upload your video')
                  console.log('err: ', err)
                })
  }
  _counting()
  {
    if(!this.state.counting&&!this.state.recording)
    {
    this.setState({
      counting:true,
      paused:true
    })
    
    }
  }
  
  _record()
  {
      this.setState({
      counting:false,
      recording:true,
      videoProgress:0,
      paused:false,
      recordDone:false
          })
      AudioRecorder.startRecording()
      this.refs.videoPlayer.seek(0)
  }

  render()
  {

    return(
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.toobarTitle}>
          {this.state.previewVideo? 'Press the Button to make a audio'
          :
          'Make a audio for your video'}
          </Text>
        <Text style={styles.toobarExtra} onPress={this._pickVideo.bind(this)}>Change a video</Text>
      </View>

      <View style={styles.page}>
        {
          this.state.previewVideo
                ?<View style={styles.videoContainer}>
                  <View style={styles.videoBox}>
                     <Video 
                        ref='videoPlayer' 
                        source={{uri:this.state.previewVideo}}
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
                        !this.state.videoUploaded&&this.state.videoUploading?
                        <View style={styles.progressTipBox}>
                          <ProgressViewIOS style={styles.progressBar}
                            progressTintColor='#ee735c'  progress={this.state.videoUploadProgress}
                            />
                            <Text style = {styles.progressTip}>
                              {(this.state.videoUploadProgress * 100).toFixed(2)}% Your video has been uploaded 
                            </Text>
                        </View>
                        :
                        null
                        
                      }
                      {
                        this.state.recording||this.state.audioPlaying?
                        <View style={styles.progressTipBox}>
                          <ProgressViewIOS style={styles.progressBar}
                            progressTintColor='#ee735c'  progress={this.state.videoProgress}
                            />
                            {
                              this.state.recording?
                            <Text style = {styles.progressTip}>
                              Your voice is being recorded
                            </Text>
                            :
                            null
                            }
                        </View>
                        :null
                      }
                      {
                        this.state.recordDone?
                        <View style={styles.previewBox}>
                          <Icon name='ios-play' style={styles.previewIcon} onPress={this._preview.bind(this)}/>
                          <Text style={styles.previewText}>Preview</Text>
                        </View>
                        :
                        null
                      } 
                    </View>
                  </View>

                  :
                  <TouchableOpacity style={styles.uploadContainer}
                  onPress={this._pickVideo.bind(this)}>
                  <View style={styles.uploadBox}>
                    
                    <Text style={styles.uploadTitle}>Upload the video</Text>
                    <Text style={styles.uploadDesc}>No longger than 20 secs</Text>
                  </View>
                  </TouchableOpacity>
        }


          {
            this.state.videoUploaded?
            <View style={styles.recordBox}>
              <View style={[styles.recordIconBox,this.state.recording&&styles.recordOn]}>
              {
                this.state.counting&&!this.state.recording?
                <CountdownCircle
                    seconds={3}
                    radius={30}
                    borderWidth={8}
                    color="#ff003f"
                    bgColor="#fff"
                    updateText={(elapsedSecs, totalSecs) => {
                      if(totalSecs - elapsedSecs===1)
                          return 'Go!'
                      return (totalSecs - elapsedSecs).toString()}}
                    textStyle={{ fontSize: 20 }}
                    onTimeElapsed={this._record.bind(this)}
                />
                :
                <View>
                <TouchableOpacity onPress={this._counting.bind(this)} >
                  <Icon name='ios-mic' size={18}style={styles.recordIcon}/>
                </TouchableOpacity>
                
                </View>
              }
               
                
          </View>
          
          </View>
        
          :
          null
          }
          <View style={styles.Pickerbox}>
            <Picker
                  selectedValue={this.state.language}
                  onValueChange={(itemValue, itemIndex) => this.setState({language: itemValue})}>
                  {this.state.audioItems}
            </Picker>
          </View>
          {
                this.state.videoUploaded&&this.state.recordDone?
               <View style={styles.uploadAudioBox}>
                <Text style={styles.uploadAudioText}
                  onPress={this._uploadAudio.bind(this)}>Next step</Text>
              
                    {
                      this.state.audioUploading?
                        <Progress.Circle size={60} 
                        showsText={true} 
                        //indeterminate={true} 
                        progress={this.state.audioUploadProgress}
                        color={'#ee735c'}
                        />
                        :null
                    }
                </View>
                :null
          }

    </View>
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
  page:{
    flex:1,
    alignItems:'center'
  },
  uploadContainer:{
   
    width:width - 40,
    paddingBottom:10,
    borderWidth:1,
    borderColor:'#ee735c',
    marginTop: 90,
    borderRadius:6,
    backgroundColor:'#fff',
    height:100
  },
  uploadTitle:{
    
    textAlign:'center',
    fontSize:16,
    color:'#000'
  },
  uploadDesc:{
    color:'#999',
    textAlign:'center',
    fontSize:12
  },
  uploadIcon:{
    width:110,
    resizeMode:'contain'
  },
  uploadBox:{
    flex:1,
    
    alignItems:'center'
  },
  videoContainer:{
    width:width,
    justifyContent:'center',
    alignItems:'flex-start'
  },
  videoBox:{
    width:width,
    height:height*0.6,

  },
  video:{
    width:width,
    height:height*0.6,
    backgroundColor:'#333'

  },
  progressTipBox:{
    position: 'absolute',
    left: 0,
    bottom: 20,
    width:width,
    height:30,
    backgroundColor: 'rgba(244,244,244,0.65)' 
  },
  progressTip:{
    color:'#333',
    width:width-10,
    padding: 5
  },
  progressBar:{
    width:width
  },
  recordBox:{
    width:width,
    height:60,
    alignItems:'center' 
  },
  recordIconBox:{
    width:68,
    height:68,
    borderRadius:34,
    backgroundColor: '#ee735c',
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center' ,
    justifyContent: 'center' ,
    marginTop:-30
  },
  recordIcon:{
    fontSize:58,
    backgroundColor: 'transparent',
    color:'#fff'
  },
  countBtn:{
    fontSize:32,
    fontWeight:'600',
    color:'#fff'
  },
  recordOn:{
    backgroundColor: '#ccc'
  },
  previewBox:{
    width:80,
    height:30,
    position: 'absolute',
    right:10,
    bottom:10,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius: 3,
    flexDirection: 'row' ,
    justifyContent:  'center' ,
    alignItems:  'center' 
  },
  previewIcon:{
    marginRight: 5,
    fontSize:20,
    color:'#ee735c'
  },
  previewText:{
    fontSize:20,
    color:'#ee735c' 
  }
  ,
  uploadAudioBox:{
    width:width,
    height:60,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center'
  },
  uploadAudioText:{
    width:width-20,
    padding:5,
    borderWidth: 1,
    borderColor: '#ee735c',
    borderRadius:5,
    textAlign:'center',
    fontSize:30,
    color:'#ee735c'
  },
  Pickerbox:{
    width:width-20
  }
});

module.exports=Edit