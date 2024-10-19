import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet , ScrollView  , Image} from 'react-native';
import { TextInput,Button, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import {nameSelector , avatarUrlSelector , emailAddressSelector , sessionIDAtom , motherServerAtom , tokenAtom} from './atoms';
import Icon from 'react-native-vector-icons/FontAwesome5';
import OpenAPIClientAxios from 'openapi-client-axios';
import axios from "axios"

const FriendsScreen = () => {
  const [apiState,setApiState] = useState(null)

  const navigation = useNavigation();
  const [token,setToken] = useRecoilState(tokenAtom)
  const [avatarUrl,setAvatarUrl] = useRecoilState(avatarUrlSelector)
  const [emailAddress,setEmailAddress] = useRecoilState(emailAddressSelector)
  const [name,setName] = useRecoilState(nameSelector)
  const [sid,setsid] = useRecoilState(sessionIDAtom)
  const [motherServerURL,setMotherServerURL] = useRecoilState(motherServerAtom)

  const [friendVisible , setFriendVisible] = useState(false);
  const [friendList , setFriendList] = useState([]);

  useEffect(() => {
    const getTokenFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken !== null) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error retrieving token from AsyncStorage:', error);
      }
    };
    getTokenFromStorage();
  },[setApiState])

  function handleSessionPress(){
    if(!sid) {
      axios.post(motherServerURL+"/create",{},{"headers": {"Authorization" : token}}).then((result) => {
        setsid(result.data.sessionID)
        navigation.navigate('Listening');
      }).catch((err) => {
        console.log("Error in creating session ",err)
      });
    }
    else {
      axios.post(motherServerURL+"/join",{"sessionID": sid},{"headers":{"Authorization" : token}}).then((result) => {
        navigation.navigate("Listening");
      })
    }
  }

  return (
    <View className="flex-1 bg-white justify-center items-center p-5">
      <View>
        <Text className="text-black text-3xl font-bold mb-5 text-center">
          Welcome {name}
        </Text>
        <View className="flex items-center mb-5">
          <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-yellow-300">
            <Image
              source={{ uri: avatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </View>
      </View>
      <View className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mb-5 w-full">
        <TextInput
          label={<Text style={{ color: 'black' }}>Session Code</Text>}
          value={sid}
          className="bg-white mb-3"
          activeUnderlineColor='#000000'
          mode='outlined'
          onChangeText={text => setsid(text)}
          theme={{ colors: { primary: 'black' } }}
          autoFocus={true}
        />
        <Button icon="" buttonColor='white' className="rounded-sm shadow-yellow" rippleColor={"#FFF176"} mode="elevated" onPress={() => handleSessionPress()}>
            <Text className="text-black">
            Create Session / Join Session
            </Text>
        </Button>
      </View>
      <View className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mb-5 w-full">
        <View className="display-flex justify-between flex-row items-center mb-5">
          <Button icon="" buttonColor='white' className="rounded-sm shadow-yellow" rippleColor={"#FFF176"} mode="elevated" onPress={() => setFriendVisible(!friendVisible)}>
              <Icon name="user-friends" className=""></Icon>
              <Text className="text-black">
                Friend List
              </Text>
          </Button>
          <Button icon="" buttonColor='white' className="rounded-sm shadow-yellow" rippleColor={"#FFF176"} mode="elevated" onPress={() => navigation.navigate("Listening")}>
              <Text className="text-black">
                + Add Friend
              </Text>
          </Button>
        </View>
        <Button icon="qrcode" iconColor="black">
            <Text className="text-black">
              Your QR
            </Text>
        </Button>
      </View>
      <Modal isVisible={friendVisible}>
        <View className="bg-white mt-20 p-4 rounded-lg flex-1 shadow-lg border border-yellow-300 mb-5 w-full">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {friendList.map((a) => <FriendCard key={a.id} {...a} />)}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  friendItem: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default FriendsScreen;
