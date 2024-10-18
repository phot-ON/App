
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


export default function ListeningScreen(props) {
  const navigation = useNavigation();


  const [isPolling, setIsPolling] = useState(true)

  useEffect(() =>{
    AsyncStorage.setItem("lastts" , Date.now().toString());
    AsyncStorage.setItem("imagelookup" , "{}");
  } , [])



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


  return (
    <View style={styles.container} className="bg-white">
      <Text style={styles.header}>Listening</Text>
      <View style={styles.concatbox}>
        <Text style={styles.texty1} className="">Server Status: Alive 🟢</Text>
      </View>
      <Text style={styles.texty} className="mt-5">Session ID: 12414</Text>
      <Text style={styles.texty3}>Go Back to End Listener</Text>
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