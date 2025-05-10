import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { 
  ArrowLeftIcon, 
  PhoneIcon, 
  ChatBubbleOvalLeftIcon,
  ClockIcon,
  DocumentTextIcon
} from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';

export default function RequestStatus() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity className="mr-4">
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Request Status</Text>
      </View>

      {/* Emergency Alert */}
      <View className="flex-row bg-red-100 p-4 border-l-4 border-primary">
        <View className="w-6 h-6 bg-primary rounded items-center justify-center mr-2">
          <Text className="text-white font-bold">!</Text>
        </View>
        <View>
          <Text className="text-primary font-bold">Emergency</Text>
          <Text className="text-primary">Technician dispatched to your location</Text>
        </View>
      </View>

      {/* Technician Info */}
      <View className="bg-white p-4 flex-row items-center">
        <Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          className="w-12 h-12 rounded-full mr-3"
        />
        <View className="flex-1">
          <Text className="font-bold text-lg">Jerome Bell</Text>
          <View className="flex-row items-center">
            <Text className="text-gray-500 mr-2">✓ Certified</Text>
            <Text className="text-gray-500">• 8 years experience</Text>
          </View>
          <View className="flex-row mt-1">
            {[...Array(4)].map((_, i) => (
              <StarIcon key={i} size={16} color="#FFC107" />
            ))}
            <StarIcon size={16} color="#E0E0E0" />
          </View>
          <View className="mt-2 bg-green-100 self-start px-2 py-1 rounded">
            <Text className="text-green-600 text-xs font-bold">CONFIRMED</Text>
          </View>
        </View>
      </View>

      {/* Contact Buttons */}
      <View className="flex-row px-4 py-2 bg-white mb-4">
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-full mr-2">
          <PhoneIcon size={20} color="#000" />
          <Text className="ml-2 font-medium">Call</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-full ml-2">
          <ChatBubbleOvalLeftIcon size={20} color="#000" />
          <Text className="ml-2 font-medium">Message</Text>
        </TouchableOpacity>
      </View>

      {/* ETA Section */}
      <View className="bg-white rounded-lg mx-4 mb-4 p-4">
        <Text className="text-lg font-bold mb-4">Estimated Time of Arrival (ETA)</Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <ClockIcon size={20} color="#000" />
            <Text className="ml-2">Arrival in</Text>
          </View>
          <View className="bg-primary px-4 py-1 rounded-full">
            <Text className="text-white font-bold">29 : 12</Text>
          </View>
        </View>
        <View className="mt-4">
          <Text className="text-gray-500 mb-1">Address</Text>
          <Text className="font-medium">ABC Plaza Gado Nasco road, Kubwa Abuja, 901101</Text>
        </View>
        <View className="flex-row justify-between mt-4">
          <View>
            <Text className="text-gray-500 mb-1">Emergency reported</Text>
            <Text className="font-medium">9:10 AM</Text>
          </View>
          <View>
            <Text className="text-gray-500 mb-1">Expected arrival</Text>
            <Text className="font-medium">9:40 AM</Text>
          </View>
        </View>
      </View>

      {/* Summary Section */}
      <View className="bg-white mx-4 mb-4 p-4">
        <Text className="text-lg font-bold mb-4">Summary</Text>
        
        <View className="flex-row mb-3">
          <Text className="text-gray-500 w-24">Type</Text>
          <Text className="font-medium">Elevator emergency</Text>
        </View>
        
        <View className="flex-row mb-3">
          <Text className="text-gray-500 w-24">Issue</Text>
          <Text className="font-medium">Elevator is stuck or not moving</Text>
        </View>
        
        <View className="flex-row mb-3">
          <Text className="text-gray-500 w-24">Date</Text>
          <Text className="font-medium">4:03 PM, Apr 19, 2025</Text>
        </View>
        
        <View className="flex-row mb-3">
          <Text className="text-gray-500 w-24">Elevator ID</Text>
          <Text className="font-medium">ELV-45327-MP</Text>
        </View>
        
        <View className="flex-row mb-3">
          <Text className="text-gray-500 w-24">Reference ID</Text>
          <Text className="font-medium">ELV-45327-MP</Text>
        </View>
      </View>

      {/* Attachments Section */}
      <View className="bg-white mx-4 mb-4 p-4">
        <Text className="text-lg font-bold mb-4">Attachments</Text>
        
        {[1, 2, 3].map((item) => (
          <View key={item} className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <DocumentTextIcon size={20} color="#000" />
              <Text className="ml-2">Photo123.png</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-primary">view</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Cancel Button */}
      <TouchableOpacity className="bg-primary rounded-lg mx-4 mb-6">
        <Text className="text-white text-center py-4 font-bold">Cancel Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}