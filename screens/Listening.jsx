import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform, Linking} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import QRCode from 'react-native-qrcode-svg';
import BackgroundTimer from 'react-native-background-timer';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import {sessionIDAtom , decodedTokenSelector , tokenAtom,nameSelector , emailAddressSelector , avatarUrlSelector} from './atoms';
import {useRecoilState, useRecoilStateLoadable, useRecoilValue} from "recoil";
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { Share } from 'react-native';
import {ImageDBURLAtom, motherServerAtom} from './atoms';
import messaging, { requestPermission } from '@react-native-firebase/messaging';
import OpenAPIClientAxios from 'openapi-client-axios';
import {fetchFile, uploadFile} from './tunnel'
import axios from "axios"
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function ImageDispatcher({imageDBURL,authtoken,sID}) {
  console.log("DURING ID " , imageDBURL)
  let motherServerUrl = useRecoilValue(motherServerAtom)

  const requestPermissions = async () => {
    try {
        // Request camera permission
        const cameraResult = await request(PERMISSIONS.ANDROID.CAMERA); // Use PERMISSIONS.IOS.CAMERA for iOS
        handlePermissionResult(cameraResult, 'Camera');

        // Request storage permission
        const storageResult = await request(Platform.Version >= 33 ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE); // Use PERMISSIONS.IOS.PHOTO_LIBRARY for iOS
        handlePermissionResult(storageResult, 'Storage');
    } catch (error) {
        console.error('Permission request error:', error);
    }
  };
  useEffect(()=> {
    requestPermissions()
  })
  const handlePermissionResult = (result, permissionType) => {
    switch (result) {
        case RESULTS.GRANTED:
            console.log(`${permissionType} permission granted`);
            break;
        case RESULTS.DENIED:
            console.log(`${permissionType} permission denied`);
            break;
        case RESULTS.BLOCKED:
            Alert.alert(
                `${permissionType} Permission Blocked`,
                `You need to enable ${permissionType} permission in settings.`,
                [{ text: 'OK' }]
            );
            break;
        default:
            break;
    }
  };


  async function poll() {
    let lastTS =  await AsyncStorage.getItem("lastts")
    lastTS = Number(lastTS)
    try {
      console.log("FETCHING IMAGES AFTER TS: "+lastTS)
      photos = await CameraRoll.getPhotos({
        first: 10,
        assetType: 'Photos',
        fromTime: lastTS
      });

    }
    catch (error) {
      console.log("PHOTO QUERY ERROR " , error)
      photos.edges = [];
    }
    console.log("PHOTOS " , photos.length)
    console.log("ID POLL " ,photos.edges.map(a=> a.node.image.uri))
    for (let i = 0; i < photos.edges.length; i++) {
      //TODO: REQUEST TO PHOTON IMAGEDB SERVER
      let resp =null
      try {
        resp = await uploadFile(imageDBURL,photos.edges[i],sID,authtoken)

      }
      catch(err) {
        console.log(err)
      }

      let imageid = resp.hash
      console.log(motherServerUrl+"/upload" ,authtoken)
      try{
        await axios.post(motherServerUrl+"/upload", {"imageID": imageid , "sessionID" : sID}, {
          headers: {
            'Authorization': authtoken
          }
        })
        console.log("Updated Main Server about file upload")
      }
      catch(err) {
        console.log(err)
      }

      //client.upload_upload_post(null,{"imageID" : imageid , "sessionID" : sID},{"Authorization" : authtoken})


    }
    AsyncStorage.setItem("lastts" , (Date.now()+100).toString());
  }


  useEffect(() => {
    const interval = BackgroundTimer.setInterval(() => {
      poll();
    }, 10000);
    return () => BackgroundTimer.clearInterval(interval);
  }, []);


  return <></>
}

function ImageReceiver({imageDBURL,authtoken,sID}) {
  useEffect(() => {
    const unsubscribe = messaging().setBackgroundMessageHandler(async remoteMessage => {
      //TODO: REQUEST TO PHOTON IMAGEDB SERVER
      console.log('RECIEVED FCM MESSAGE: ', remoteMessage);
      let imageid = remoteMessage.data.imageID
      fetchFile("blah",imageid,sID,authtoken)
    });
    const unsubscribe2 = messaging().onMessage(async remoteMessage => {
      //TODO: REQUEST TO PHOTON IMAGEDB SERVER
      console.log('RECIEVED FCM MESSAGE: ', remoteMessage);
      let imageid = remoteMessage.data.imageID
      fetchFile("blah",imageid,sID,authtoken)
    });
    
    return () => {
      unsubscribe2();
    };
  }, []);


  return <></>
}



function Sync(props) {
  return <>
    <ImageDispatcher imageDBURL={props.imageDBurl} authtoken={props.authtoken} sID={props.sID}/>
    <ImageReceiver imageDBURL={props.imageDBurl} authtoken={props.authtoken} sID={props.sID}/>
  </>
}


function FriendCard({inp,authtoken,sid}) {

  return (
    <>
      <View className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mb-5 w-full flex-row justify-between">
        <Text className="text-black text-lg">
          {inp}
        </Text>
        <Button icon="send" mode="text" textColor='black' onPress={() => {
          console.log("SEND INVITE PRESSED " , inp,sid,authtoken)
          axios.post("https://photon.garvit.tech/invite",{"username" : inp , "SessionID" : sid} ,  { headers: { Authorization: authtoken } })
        }} >
          Send Invite
        </Button>
      </View>

    </>
  );
}

export default function ListeningScreen(props) {
  const [sID , setSID] = useRecoilState(sessionIDAtom)
  const [decodedToken , setDecodedToken] = useRecoilState(decodedTokenSelector)
  const [authtoken , setToken] = useRecoilState(tokenAtom)
  const [name , setName] = useRecoilState(nameSelector)
  const [emailAddress , setEmailAddress] = useRecoilState(emailAddressSelector)
  const [avatarUrl , setAvatarUrl] = useRecoilState(avatarUrlSelector)
  const navigation = useNavigation();
  const [qrVisible, setQRVisible] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [inviteLink, setInviteLink] = useState('');
  const [imageDBURL, setImageDBURL] = useRecoilStateLoadable(ImageDBURLAtom);
  const [apiState,setApiState] = useState(null)
  const [motherServerURL, setMotherServerUrl] = useRecoilState(motherServerAtom)

  const [friendList, SetFriendList] = useState([])
  useEffect(() => {
    async function fetchfriends(){
      let resp = await axios.get(`${motherServerURL}/friend`, { headers: { Authorization: authtoken } })

      SetFriendList(resp.data.users)
      console.log("Friends ",resp.data.users)

    }
    fetchfriends()

  } , [SetFriendList])

  const shareInviteLink = async () => {
    if (inviteLink) {
      try {
        await Share.share({
          message: `${name} Invited you to their Phot.ON Session: ${inviteLink}`,
        });
      } catch (error) {
        console.error('Error sharing invite link:', error);
      }
    }
  };

  useEffect(() => {
    setInviteLink(`${motherServerURL}/invite?sessionID=${sID}`) //TODO: CHANGE INVITE LINK
    AsyncStorage.setItem("lastts", Date.now().toString());
    AsyncStorage.setItem("imagelookup", "{}");
  }, []);

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      e.preventDefault();
      Alert.alert(
        "",
        "Are you sure you want to end the Listener Thread?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("Cancel Pressed"),
          },
          {
            text: "End Listener",
            onPress: () => {

              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: true }
      );
    });
    return unsubscribe;
  }, [navigation]);


  return (
    <>
      <View style={styles.container} className="bg-white">
        <Text style={styles.header} className="mt-10">Session ID: {sID.slice(0,3)}...</Text>
        <View className="display-flex flex-row mt-5">
          <Button icon="qrcode" mode="text" textColor='black' onPress={() => setQRVisible(!qrVisible)}>
            <Text className="text-black text-lg">Show QR Code</Text>
          </Button>
          <Button icon="link" mode="text" textColor='black' onPress={shareInviteLink}>
            <Text className="text-black text-lg">Share Invite Link</Text>
          </Button>
        </View>

        <View className="bg-white mt-20 p-4 rounded-lg flex-1 shadow-lg border border-yellow-300 mb-5 w-full">
          <Text className="text-black text-2xl mb-10 text-center">
            Invite Friends
          </Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {friendList.length == 0 ? <Text className="text-black text-center">You Have No Friends 🤣</Text>  : friendList.map((a) => <FriendCard inp={a} authtoken={authtoken} sid={sID} />)}
          </ScrollView>
        </View>
        <Modal isVisible={qrVisible} onBackButtonPress={() => setQRVisible(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} className="bg-white">
            <QRCode
              logoSize={500}
              value={inviteLink}
              size={300}
            />
            <Text style={styles.texty1} className="mt-4 text-black">
              Press Back to Close QR Code
            </Text>
          </View>
        </Modal>
        <Sync imgDBurl = {imageDBURL} authtoken = {authtoken} sID = {sID}/>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  texty: {
    fontFamily: "Rubik-Regular",
    fontSize: 20,
    textAlign: 'center',
  },
  texty1: {
    fontFamily: "Rubik-Regular",
    fontSize: 18,
    textAlign: 'center',
    justifyContent: 'center',
  },
    texty2: {
    fontFamily: "Rubik-Black",
    fontSize: 18,
    textAlign: 'center',
    justifyContent: 'center',
  },
  texty3: {
    fontFamily: "Rubik-Black",
    fontSize: 15,
    textAlign: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
  },
  qrCodeContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4169e1',  // Royal blue color
    padding: 8,  // Reduced padding
    borderRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  button: {
    color: "rgba(0,0,0,1)",
    fontSize: 17,
    textAlign: "center",
    fontFamily : "Roboto",
    padding: 4,
  },
  header:{
    fontFamily: "Roboto",
    fontSize: 40,
    textAlign: "center",
    color: "rgba(0,0,0,1)",
    padding: 4,
  },
  concatbox : {
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    borderRadius: 3,
    paddingLeft: 20,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    shadowColor: "rgba(179,179,179,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
    elevation: 5,
    shadowOpacity: 0.82,
    shadowRadius: 0,
    overflow: "visible",
  },
  icon: {
    marginRight: 10,
  },
  concatbox1 : {
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 3,
    paddingLeft: 10,
    paddingRight: 10,
  },
  textInput: {
    height: 30,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 8,
    width:"100%",
    paddingHorizontal: 10,
    leftMargin:2,
    borderRadius:3,
    fontSize:15,
    justifyContent:"center",
    textAlign: "center"
  },
  button: {
    color: "rgba(0,0,0,1)",
    fontSize: 17,
    textAlign: "center",
    fontFamily : "Rubik-Regular",
    padding: 2,
  },
  header:{
    fontFamily: "Rubik-Black",
    fontSize: 40,
    textAlign: "center",
    color: "rgba(0,0,0,1)",
    padding: 4,
  },
  container1: {
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,1)",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    borderRadius: 3,
    paddingLeft: 8,
    paddingRight: 0,
    borderWidth: 1,
    borderColor: "#e3e3e3",
    shadowColor: "rgba(179,179,179,1)",
    shadowOffset: {
      width: 3,
      height: 3
    },
  }
});
