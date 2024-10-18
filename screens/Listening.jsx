
import React, { useState, useEffect , useRef} from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity  ,Alert} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import BackgroundTimer from 'react-native-background-timer';
import { useNavigation } from '@react-navigation/native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilValue, useSetRecoilState , useRecoilState } from 'recoil';
import {userIDAtom , sessionIDAtom , motherServerAtom, LastTSAtom} from './atoms'
import RNFS from 'react-native-fs';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';



function Sync({AisPolling}) {

  const [IDisPolling , IDsetIsPolling] = useState(true)
  const [IRisPolling , IRsetIsPolling] = useState(true)
  const [RHisPolling , RHsetIsPolling] = useState(true)



  useEffect(() => {
    if(!AisPolling) {
      IDsetIsPolling(false)
      IRsetIsPolling(false)
      RHsetIsPolling(false)
      return;
    }
  },[AisPolling])

  return <>
    <ImageDispatcher isPolling={IDisPolling} />
    <ImageReceiver isPolling={IRisPolling} />
    <RequestHandler isPolling={RHisPolling}/>
  </>
}

function ImageDispatcher({isPolling , intrv}) {

  let photos = {}
  const serverUrl = useRecoilValue(motherServerAtom)
  const relayServerUrl = useRecoilValue(relayServerAtom)
  const relayServerKey = useRecoilValue(relayServerKeyAtom)
  const keypair = useRecoilValue(keyPairAtom)
  const sID = useRecoilValue(sessionIDAtom)
  const uID = useRecoilValue(userIDAtom)
  const sessionPass = useRecoilValue(sessionPassAtom)
  const authblob = useRecoilValue(authblobSelector)
  const [setIntervalID , SetsetIntervalID] = useState(0)

  if (!intrv) intrv=30000
  if (isPolling == null) isPolling = true

  async function poll() {
    let lastTS =  await AsyncStorage.getItem("lastts")
    lastTS = Number(lastTS)
    if(!isPolling){
      return;
    }
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
    console.log("ID POLL" ,photos.edges.map(a=> a.node.image.uri))
    for (let i = 0; i < photos.edges.length; i++) {

      let hash = "null" // TODO DO HASHING PROPERLY
      let res = await mserver.appendIMG(serverUrl , authblob , uID,hash, photos.edges[i].node.image.fileSize , sID)

      let ilstr = await AsyncStorage.getItem("imagelookup")
      let ImageLookup = JSON.parse(ilstr)
      ImageLookup[res.image._id] = photos.edges[i]
      AsyncStorage.setItem("imagelookup", JSON.stringify(ImageLookup) )
      console.log(JSON.stringify(ImageLookup).toString())
    }
    
    AsyncStorage.setItem("lastts" , (Date.now()+100).toString());
  }

  useEffect(() => {
    console.log("ID SET INTERVAL MOUNTED " , isPolling)
    SetsetIntervalID(BackgroundTimer.setInterval(() => poll(), intrv))
    //SetsetIntervalID(0)
  }, [])

  useEffect(() => {
    if(!isPolling) BackgroundTimer.clearInterval(setIntervalID)
  } , [isPolling , setIntervalID])

  return null;
}

function ImageReceiver({ intrv , isPolling}) {
  if (!intrv) intrv = 30000
  if (isPolling == null) isPolling = true
  const serverUrl = useRecoilValue(motherServerAtom)
  const relayServerUrl = useRecoilValue(relayServerAtom)
  const relayServerKey = useRecoilValue(relayServerKeyAtom)
  const keypair = useRecoilValue(keyPairAtom)
  const sID = useRecoilValue(sessionIDAtom)
  const uID = useRecoilValue(userIDAtom)
  const sessionPass = useRecoilValue(sessionPassAtom)
  const authblob = useRecoilValue(authblobSelector)
  const [setIntervalID , SetsetIntervalID] = useState(0)

  async function pollIR() {
    let ilstr = await AsyncStorage.getItem("imagelookup")
    let ImageLookup = JSON.parse(ilstr)
    if (!isPolling) return;

    let res = await mserver.sessionMetaData(serverUrl , authblob , uID , sID)


    console.log("IR POLL" , JSON.stringify(res.images.map(a=> a._id)).toString())
    console.log("IMAGE LOOKUP" , Object.keys(ImageLookup))
    for (let i = 0; i < res.images.length; i++) {
      if(! ImageLookup[res.images[i]._id]) {
        await mserver.createPR(serverUrl , authblob, uID , res.images[i].seed[res.images[i].seed.length-1]._id, "UploadImage "+res.images[i]._id , sID)
        ImageLookup[res.images[i]._id] = "Incomplete Transfer"
        console.log(`IR POLLER SET ${res.images[i]._id} TO PLACEHOLDER` ,ImageLookup )
      }
    }

    AsyncStorage.setItem("imagelookup", JSON.stringify(ImageLookup) )
  }

  useEffect(() => {
    console.log("IR SET INTERVAL MOUNTED " , isPolling)
    SetsetIntervalID(BackgroundTimer.setInterval(pollIR, intrv))
  }, [])

  useEffect(() => {
    if(!isPolling) BackgroundTimer.clearInterval(setIntervalID)
  } , [isPolling , setIntervalID])

  return null;
}

function RequestHandler({intrv, isPolling}) {
  const serverUrl = useRecoilValue(motherServerAtom)
  const relayServerUrl = useRecoilValue(relayServerAtom)
  const relayServerKey = useRecoilValue(relayServerKeyAtom)
  const keypair = useRecoilValue(keyPairAtom)
  const sID = useRecoilValue(sessionIDAtom)
  const uID = useRecoilValue(userIDAtom)
  const sessionPass = useRecoilValue(sessionPassAtom)
  const authblob = useRecoilValue(authblobSelector)
  if (!intrv) intrv = 30000
  if (isPolling == null) isPolling = true
  const [setIntervalID , SetsetIntervalID] = useState(0)


  async function pollRH() {
    let ilstr = await AsyncStorage.getItem("imagelookup")
    let ImageLookup = JSON.parse(ilstr)
    if (!isPolling) return;
    let res = await mserver.sessionMetaData(serverUrl , authblob , uID , sID)
    console.log("RH POLL" ,res.pending_requests.filter(a=> a.to._id === uID))
    for (let i = 0; i < res.pending_requests.length; i++) {
      if(res.pending_requests[i].to._id !== uID) continue;
      if(res.pending_requests[i].req.split(" ")[0] === "UploadImage") {
        await mserver.delPR(serverUrl , authblob , uID , res.pending_requests[i]._id , sID)
        let res2 = await relay.uploadFile(relayServerUrl , ImageLookup[res.pending_requests[i].req.split(" ")[1]]  , sessionPass , relayServerKey , res.pending_requests[i].from.pubkey)
        console.log("UPLOADED TO ROUTE " + res2.route_id)
        await mserver.createPR(serverUrl, authblob, uID , res.pending_requests[i].from._id ,  "FetchImage "+res2.route_id+" "+res.pending_requests[i].req.split(" ")[1] , sID)

      }
      else if(res.pending_requests[i].req.split(" ")[0] === "FetchImage") {
        await mserver.delPR(serverUrl , authblob , uID , res.pending_requests[i]._id , sID)
        let savedPhotoFile = await relay.fetchFile(relayServerUrl , sessionPass , relayServerKey ,res.pending_requests[i].req.split(" ")[1])
        //ImageLookup[res.pending_requests[i].req.split(" ")[2]] = savedPhotoFile
        ImageLookup[res.pending_requests[i].req.split(" ")[2]] = "COMPLETED TRANSFER" //TODO: image object from camera roll
        AsyncStorage.setItem("imagelookup", JSON.stringify(ImageLookup))
        AsyncStorage.setItem("lastts" , (Date.now()+100).toString());
        try {
          console.log("MMS REQ " , res.pending_requests[i])
          await mserver.mms(serverUrl , authblob , uID , res.pending_requests[i].req.split(" ")[2] , sID)
        }
        catch(err) {
          console.log("ERROR UPLOADING PHOTO TO MMS " , err)
        }

      }
    }
  }

  useEffect(() => {
    console.log("RH SET INTERVAL MOUNTED " , isPolling)
    SetsetIntervalID(BackgroundTimer.setInterval(pollRH, intrv))
  }, [])

  useEffect(() => {
    if(!isPolling) BackgroundTimer.clearInterval(setIntervalID)
  } , [isPolling , setIntervalID])

  return null;
}

export default function ListeningScreen(props) {
  const navigation = useNavigation();

  const serverUrl = useRecoilValue(motherServerAtom)
  const relayServerUrl = useRecoilValue(relayServerAtom)
  const relayServerKey = useRecoilValue(relayServerKeyAtom)
  const keypair = useRecoilValue(keyPairAtom)
  const sID = useRecoilValue(sessionIDAtom)
  const uID = useRecoilValue(userIDAtom)
  const sessionPass = useRecoilValue(sessionPassAtom)
  const authblob = useRecoilValue(authblobSelector)

  const [revealKey, setRevealKey] = useState(false);
  const [revealKey1, setRevealKey1] = useState(false);
  const [ServerAlive,SetServerAlive]  = useState(false)

  const [isPolling, setIsPolling] = useState(true)

  useEffect(() =>{
    AsyncStorage.setItem("lastts" , Date.now().toString());
    AsyncStorage.setItem("imagelookup" , "{}");
  } , [])

  const serverAliveChecker = async () => {
    let t = await relay.isAlive(relayServerUrl,relayServerKey)
    console.log("SERVER ALIVE CHECKER " , t,relayServerUrl,relayServerKey)
    SetServerAlive(t.serverStat && t.keyStat)
  }

  useEffect(()=> {
    serverAliveChecker()
    let int = setInterval(serverAliveChecker,25000)
    return () => clearInterval(int);
  },[])
  
  
  const copyToClipboard = (text) => {
    Clipboard.setString(text)
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
              setIsPolling(false)
              navigation.dispatch(e.data.action);
            },
          },
        ],
        { cancelable: true }
      );

  });
  return unsubscribe
  },[navigation]);


  let logoFromFile = require('../assets/Expose.png');
  return (
    <View style={styles.container} className="bg-white">
      <Text style={styles.header}>Listening</Text>
      <View style={styles.concatbox}>
        <Text style={styles.texty1} className="">Server Status: {ServerAlive ? "Alive 🟢" : "Unresponsive 🔴"}</Text>
      </View>
      <Text style={styles.texty} className="mt-5">Session ID: {sID}</Text>
      <Text style={styles.texty}>Server URL: {serverUrl}</Text>
      <Text style={styles.texty}>Relay Server URL: {relayServerUrl}</Text>
      <TouchableOpacity onPress={() => setRevealKey1(!revealKey1)}>
        <Text style={styles.texty}>Relay Key: {revealKey1 ? `${relayServerKey} (Tap to Hide)` : '******  (Tap to Reveal)'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setRevealKey(!revealKey)}>
        <Text style={styles.texty}>Session Password: {revealKey ? `${sessionPass} (Tap to Hide)` : '******  (Tap to Reveal)'}</Text>
      </TouchableOpacity>
      <View style={styles.concatbox} className = "mt-7">
        <Text className="mb-2" style={styles.texty2}>Connection String</Text>
        <View className="flex-row">
          <TouchableOpacity className="w-auto" onPress={() => copyToClipboard(`${relayServerKey}||${relayServerUrl}||${sID}||${sessionPass}`) }>
          <Text style={styles.textInput} className="w-auto">{`${relayServerKey}||${relayServerUrl}||${sID}||${sessionPass}`.substring(0,10)+`...(Tap to Copy)`}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.texty3}>Go Back to End Listener</Text>
      <Sync AisPolling={isPolling}/>
    </View>
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