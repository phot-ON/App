import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet , ScrollView  , Image , Linking,PermissionsAndroid, Platform} from 'react-native';
import { TextInput,Button, Modal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState } from 'recoil';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import {nameSelector , avatarUrlSelector , emailAddressSelector , sessionIDAtom , motherServerAtom , tokenAtom} from './atoms';
import Icon from 'react-native-vector-icons/FontAwesome5';
import OpenAPIClientAxios from 'openapi-client-axios';
import axios from "axios"



async function requestStoragePermission() {
  try {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 33) {
        // For Android 13+ (API 33+), request media-specific permissions.
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);

        if (
          granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_VIDEO'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_MEDIA_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Media permissions granted');
        } else {
          console.log('Media permissions denied');
        }
      } else {
        // For Android versions below 13, use the older READ_EXTERNAL_STORAGE permission.
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage permission granted');
        } else {
          console.log('Storage permission denied');
        }
      }
    }
  } catch (err) {
    console.warn(err);
  }
}

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
  const [friendList , SetFriendList] = useState([]);
  const [isModalVisible , setModalVisible] = useState(false);
  const [friendEmail , setFriendEmail] = useState('');


  useEffect(() => {
    requestStoragePermission();
    async function fetchfriends(){
      let resp = await axios.get(`${motherServerURL}/friend`, { headers: { Authorization: token } })
      
      SetFriendList(resp.data.users)
      console.log("Friends ",resp.data.users)

    }
    fetchfriends()

  } , [SetFriendList])

  useEffect(() => {
    const handleDeepLink = async (url) => {
        if (url.includes('joinSession')) {
            let sid = url.split('/').pop();
            await axios.post(motherServerURL+"/join",{"sessionID": sid},{"headers":{"Authorization" : token}})
            setsid(sid);
            navigation.navigate('Listening');
        }
    };
    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => {
        subscription.remove();
    };
  }, []);

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
        <Text className="text-black text-xl font-bold mb-3 text-center">
          Friends
        </Text>
        <View className="flex flex-row justify-center items-center mb-5">
          <TextInput mode="outlined" placeholder='Add Email' className="h-10" value={friendEmail} onChangeText={text => setFriendEmail(text)} style={{ backgroundColor: 'white', color: 'black' }} />
          <Button icon="plus" textColor='black' mode="" className="" onPress={() => {
            axios.post(motherServerURL+"/friend",{"username": friendEmail},{"headers": {"Authorization" : token}}).then((result) => {
              console.log("FRIEND APPEND RESULT",result.data)
              if(result.data == "SUCCESS"){
                SetFriendList([...friendList,friendEmail])
              }
              
            }).catch((err) => {
              console.log("Error in adding friend ",err)
            });
          }}></Button>
        </View>




      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <FlatList
              data={friendList}
              renderItem={({ item }) => <Text className="text-black text-center">{item}</Text>}
              keyExtractor={(item, index) => index.toString()}
              ListEmptyComponent={<Text className="text-black text-center">You Have No Friends 🤣</Text>}
            />
      </ScrollView>
      </View>

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
