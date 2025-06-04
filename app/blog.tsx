import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ClockIcon, DocumentTextIcon, HomeIcon, UserIcon } from 'react-native-heroicons/outline';
import { WebView } from 'react-native-webview';
const WebPageScreen = () => {
  const navigation = useNavigation();
  return (
    <View className='flex-1 bg-gray-5'>
      <WebView
        source={{ uri: 'http://stratolift.com/blog' }} 
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
      <View 
          className="flex-row justify-around items-center border-t border-gray-200 py-3 bg-white"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 5,
          }}
        >
          <Pressable onPress={() => navigation.navigate('userdb')} className="items-center px-3">
            <HomeIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">Home</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('blog')} className="items-center px-3">
            <DocumentTextIcon size={22} color="#EC3237" />
            <Text className="text-xs mt-1 text-primary font-geist-semibold">Blog</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('history')} className="items-center px-3">
            <ClockIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">History</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('profile')} className="items-center px-3">
            <UserIcon size={22} color="#9CA3AF" />
            <Text className="text-xs mt-1 text-gray-500 font-geist">Profile</Text>
          </Pressable>
        </View>
    </View>
  );
};

export default WebPageScreen;
