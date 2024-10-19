import React , {useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Button  , ActivityIndicator,MD2Colors} from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Modal from "react-native-modal";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRecoilValue } from 'recoil';
import {ImageDBURLAtom} from './atoms';


function LoadingCheck(props) {
  const {navigation} = props
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    AsyncStorage.getItem('token').then((token) => {
      axios.get(`https://db.tail3e2bc4.ts.net/auth/validate?token=${token}`).then((response) => {
        if (response.status === 200) {
          navigation.navigate("Friends")
        }
        setLoading(false)
      }).catch((error) => {
        setLoading(false)
      })
    }).catch((error) => {
      console.error("AsyncStorage error:", error)
      setLoading(false)
    })
  }, [])

  return <>
  <Modal visible={loading} animationType="fade" transparent={true}>
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
      <View style={{
        backgroundColor: 'white',
        padding: 25,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        height: '50%',
        borderWidth: 2,
        borderColor: '#333',
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }}>
        <Text style={{fontSize: 24, marginBottom: 30, textAlign: 'center'}} className="text-black">Signing You In ....</Text>
        <ActivityIndicator size="large" animating={true} color={MD2Colors.yellow600} />
      </View>
    </View>
  </Modal>
  </>
}

const LandingScreen = ({ navigation }) => {


  return (
    <View className="flex-1 bg-white" style={styles.container}>
    <Image source={{ uri: 'https://your-logo-url.com/logo.png' }} style={styles.logo} />   
    <View className="flex-1 justify-center items-center h-20">

      <TouchableOpacity
        onPress={() => Linking.openURL('https://db.tail3e2bc4.ts.net/login/github')}
        className="bg-gray-800 p-2 rounded-lg flex-row items-center shadow-lg h-12 w-[90%]"
      >
        <Icon name="github" size={24} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Login with Github</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => Linking.openURL('https://db.tail3e2bc4.ts.net/login/discord')}
        className= "p-2 rounded-lg flex-row items-center shadow-lg h-12 mt-2 w-[70%]"
        style = {{backgroundColor:"#7289DA"}}
      >
        <Icon name="discord" size={18} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Login with Discord</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.footer} className="flex justify-between flex-row">

        <Text className="text-black mb-2">Made with ❤️ by CB</Text>
        <TouchableOpacity onPress={() => Linking.openURL("https://github.com/phot-ON")}>
            <Image source={{ uri: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }} style={styles.githubLogo} />
        </TouchableOpacity>
    </View>
    <LoadingCheck navigation={navigation}></LoadingCheck>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:"white",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  githubLogo: {
    width: 30,
    height: 30,
    marginBottom: 10,
  },
});

export default LandingScreen;
