import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet , ScrollView  , Image} from 'react-native';
import { TextInput,Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState } from 'recoil';
import {tokenAtom} from './atoms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import {nameSelector , avatarUrlSelector , emailAddressSelector} from './atoms';




const FriendsScreen = () => {
  const [sessionCode, setsessionCode] = useState("");


  const navigation = useNavigation();
  const [token,setToken] = useRecoilState(tokenAtom)
  const [avatarUrl,setAvatarUrl] = useRecoilState(avatarUrlSelector)
  const [emailAddress,setEmailAddress] = useRecoilState(emailAddressSelector)
  const [name,setName] = useRecoilState(nameSelector)

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
  })

  return (
    <View className="flex-1 bg-white justify-center items-center p-5">
      <View>
        <Text className="text-black text-3xl font-bold mb-5">
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
          value={sessionCode}
          className="bg-white mb-3"
          activeUnderlineColor='#000000'
          mode='outlined'
          onChangeText={text => setsessionCode(text)}
          theme={{ colors: { primary: 'black' } }}
          autoFocus={true}
        />
        <Button icon="" buttonColor='white' className="rounded-sm shadow-yellow" rippleColor={"#FFF176"} mode="elevated" onPress={() => navigation.navigate("Listening")}>
            <Text className="text-black">
            Create Session / Join Session
            </Text>
        </Button>
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
