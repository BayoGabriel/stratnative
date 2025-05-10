import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ChevronLeftIcon,
  CameraIcon,
  XMarkIcon,
} from 'react-native-heroicons/outline';
import { CheckIcon } from 'react-native-heroicons/solid';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useUser } from './UserContext';
import { LinearGradient } from 'expo-linear-gradient';

const EditProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userData: initialUserData } = route.params || {};
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    emergencyContact: '',
    emergencyPhone: '',
    occupation: '',
  });

  useEffect(() => {
    if (initialUserData) {
      setFormData({
        firstName: initialUserData.firstName || '',
        lastName: initialUserData.lastName || '',
        email: initialUserData.email || '',
        phone: initialUserData.phone || '',
        address: initialUserData.address || '',
        dateOfBirth: initialUserData.dateOfBirth || '',
        emergencyContact: initialUserData.emergencyContact || '',
        emergencyPhone: initialUserData.emergencyPhone || '',
        occupation: initialUserData.occupation || '',
      });
    } else if (user) {
      // Fallback to user context if no route params
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '+1 (555) 123-4567',
        address: user.address || '123 Main Street, City',
        dateOfBirth: user.dateOfBirth || 'January 15, 1985',
        emergencyContact: user.emergencyContact || 'Sarah Johnson',
        emergencyPhone: user.emergencyPhone || '+1 (555) 987-6543',
        occupation: user.occupation || 'Building Manager',
      });
    }
  }, [initialUserData, user]);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        Alert.alert("Error", "Name and email are required fields");
        setSaving(false);
        return;
      }
      
      // Simulate API call with timeout
      setTimeout(() => {
        // In a real app, you would update the user data on your backend
        /*
        const response = await fetch('https://stratoliftapp.vercel.app/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update profile');
        }
        */
        
        // Update local context
        updateUser({
          ...user,
          ...formData,
        });
        
        setSaving(false);
        Alert.alert(
          "Success", 
          "Your profile has been updated successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }, 1000);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", error.message || "Failed to update profile");
      setSaving(false);
    }
  };

  const handleChangeProfilePicture = () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option to change your profile picture",
      [
        { text: "Take Photo", onPress: () => console.log("Take photo") },
        { text: "Choose from Gallery", onPress: () => console.log("Choose from gallery") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", secure = false }) => (
    <View className="mb-4">
      <Text className="text-gray-600 font-geist mb-1.5 text-sm">{label}</Text>
      <TextInput
        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-800 font-geist"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        placeholderTextColor="#9CA3AF"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <View className="flex-1 bg-white">
        <StatusBar style="light" />

        {/* Header with gradient */}
        <LinearGradient
          colors={['#EC3237', '#F43F5E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="pt-12 pb-6"
        >
          <View className="px-5 flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-white/20 p-2 rounded-full"
            >
              <ChevronLeftIcon size={20} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-lg font-geist-semibold">Edit Profile</Text>
            <TouchableOpacity 
              className="bg-white/20 p-2 rounded-full"
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <CheckIcon size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profile Picture Section */}
        <View className="items-center mt-6 mb-8">
          <TouchableOpacity 
            className="relative"
            onPress={handleChangeProfilePicture}
          >
            <Image
              source={require('../assets/profile.png')}
              style={{ width: 100, height: 100, borderRadius: 50 }}
              defaultSource={require('../assets/profile.png')}
            />
            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
              <CameraIcon size={18} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-sm font-geist mt-2">Tap to change profile picture</Text>
        </View>

        {/* Form Content */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 100,
          }}
        >
          <View className="mb-6">
            <Text className="text-gray-800 font-geist-semibold text-lg mb-4">Basic Information</Text>
            
            <View className="flex-row mb-4">
              <View className="flex-1 mr-2">
                <FormInput 
                  label="First Name"
                  value={formData.firstName}
                  onChangeText={(text) => handleChange('firstName', text)}
                  placeholder="First Name"
                />
              </View>
              <View className="flex-1 ml-2">
                <FormInput 
                  label="Last Name"
                  value={formData.lastName}
                  onChangeText={(text) => handleChange('lastName', text)}
                  placeholder="Last Name"
                />
              </View>
            </View>

            <FormInput 
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="your.email@example.com"
              keyboardType="email-address"
            />

            <FormInput 
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => handleChange('phone', text)}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />


            <FormInput 
              label="Address"
              value={formData.address}
              onChangeText={(text) => handleChange('address', text)}
              placeholder="123 Main Street, City"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-800 font-geist-semibold text-lg mb-4">Additional Details</Text>
            
            <FormInput 
              label="Occupation"
              value={formData.occupation}
              onChangeText={(text) => handleChange('occupation', text)}
              placeholder="Building Manager"
            />

            <FormInput 
              label="Emergency Contact Name"
              value={formData.emergencyContact}
              onChangeText={(text) => handleChange('emergencyContact', text)}
              placeholder="Contact Name"
            />

            <FormInput 
              label="Emergency Contact Phone"
              value={formData.emergencyPhone}
              onChangeText={(text) => handleChange('emergencyPhone', text)}
              placeholder="+1 (555) 987-6543"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className={`bg-primary py-4 rounded-xl items-center ${saving ? 'opacity-70' : ''}`}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-geist-semibold text-base">Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="py-4 rounded-xl items-center mt-3"
          >
            <Text className="text-gray-600 font-geist-semibold text-base">Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;