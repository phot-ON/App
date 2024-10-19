import React , {useEffect, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Linking
} from 'react-native';
import messaging from '@react-native-firebase/messaging';


import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './screens/landing';
import FriendsScreen from './screens/friends';
import ListeningScreen from './screens/Listening';


import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { PaperProvider } from 'react-native-paper';
import {RecoilRoot} from "recoil";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";


const Stack = createNativeStackNavigator();
const linking = {
  prefixes: ['photon://'],
  config: {
      screens: {
          Friends: 'login/:token',
      },
  },
};



const App = () => {

  const [apiState,setApiState] = useState();


  useEffect(() => {




    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }

    }
    
    requestUserPermission();
  }, []);



  useEffect(() => {
      const handleDeepLink = async (url) => {
          const token = url.split('/').pop();
          await AsyncStorage.setItem('token', token);
          const decodedToken = jwtDecode(token);
          console.log("ORIGINAL JWT " , token)
          console.log("DECODED JWT FROM DEEP LINK ",decodedToken);
      };
      const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
      return () => {
          subscription.remove();
      };
  }, []);
  return (
    <PaperProvider>
    <RecoilRoot>
    <NavigationContainer linking={linking}>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen 
          name="Landing" 
          component={LandingScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Friends" component={FriendsScreen} 
        options={{ headerShown: false }}/>
        <Stack.Screen name="Listening" component={ListeningScreen} 
        options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
    </RecoilRoot>
    </PaperProvider>
  );
};


const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
