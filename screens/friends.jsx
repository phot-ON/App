import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { TextInput,Button } from 'react-native-paper';

const friends = [
  { id: '1', name: 'Friend 1' },
  { id: '2', name: 'Friend 2' },
  { id: '3', name: 'Friend 3' },
];

const FriendsScreen = () => {
  const [sessionCode, setsessionCode] = useState("");

  return (
    <View className="flex-1 bg-white justify-center items-center p-5">
      <View className="bg-white p-4 rounded-lg shadow-lg border border-yellow-300 mb-5 w-full">
        <TextInput
          label={<Text style={{ color: 'black' }}>Session Code</Text>}
          value={sessionCode}
          className="bg-white mb-3"
          activeUnderlineColor='#000000'
          mode='outlined'
          onChangeText={text => setsessionCode(text)}
          theme={{ colors: { primary: 'black' } }}

        />
        <Button icon="" buttonColor='white' className="rounded-sm shadow-yellow" rippleColor={"#FFF176"} mode="elevated" onPress={() => console.log('Pressed')}>
            <Text className="text-black">
            Create Session / Join Session
            </Text>
        </Button>
      </View>
      <Text className = "text-black text-lg">
        Friend Activity
      </Text>
      <Text className = "text-black text-lg">
        Friends
      </Text>
      <FlatList
        data={friends}
        renderItem={({ item }) => <Text style={styles.friendItem}>{item.name}</Text>}
        keyExtractor={item => item.id}
      />
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
