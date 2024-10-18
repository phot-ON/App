import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';



const LandingScreen = ({ navigation }) => {
  return (
    <View className="flex-1 bg-white" style={styles.container}>
    <Image source={{ uri: 'https://your-logo-url.com/logo.png' }} style={styles.logo} />   
    <View className="flex-1 justify-center items-center h-20">

      <TouchableOpacity
        onPress={() => navigation.navigate('Friends')}
        className="bg-indigo-600 p-2 rounded-lg flex-row items-center shadow-lg h-12"
      >
        <Icon name="discord" size={24} color="white" style={{ marginRight: 8 }} />
        <Text className="text-white font-bold text-lg">Login with Discord</Text>
      </TouchableOpacity>
    </View>
    <View style={styles.footer} className="flex justify-between flex-row">

        <Text className="text-black mb-2">Made with ❤️ by CB</Text>
        <TouchableOpacity onPress={() => { /* Link to GitHub */ }}>
            <Image source={{ uri: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png' }} style={styles.githubLogo} />
        </TouchableOpacity>
    </View>
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
