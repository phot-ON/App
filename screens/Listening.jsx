import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import QRCode from 'react-native-qrcode-svg';


//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';


function Sync(props) {

  return <>
  </>
}

const friends = [
  { id: '1', name: 'Friend 1' },
  { id: '2', name: 'Friend 2' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
  { id: '3', name: 'Friend 3' },
];

function FriendCard(props) {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mb-5 w-full flex-row justify-between">
        <Text className="text-black text-lg">
          {props.name}
        </Text>
        <Button icon="send" mode="text" textColor='black' onPress={() => setModalVisible(true)}>
          Send Invite
        </Button>
      </View>

    </>
  );
}

export default function ListeningScreen(props) {
  const navigation = useNavigation();
  const [qrVisible, setQRVisible] = useState(false);
  const [isPolling, setIsPolling] = useState(true);

  useEffect(() => {
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
              setIsPolling(false);
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
        <Text style={styles.header}>Listening</Text>
        <Button icon="qrcode" mode="text" textColor='black' onPress={() => setQRVisible(!qrVisible)}>
          Show QR Code
        </Button>
        <View className="bg-white p-4 rounded-lg flex-1 shadow-lg border border-yellow-300 mb-5 w-full">
          <Text className="text-black text-2xl mb-10">
            Friends
          </Text>
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {friends.map((a) => <FriendCard key={a.id} {...a} />)}
          </ScrollView>
        </View>
        <Modal isVisible={qrVisible}>
          <View style={{ flex: 1 }}>
          <QRCode
            logoSize={100}
            value="sessioncode"
          />
            
          </View>
        </Modal>
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
