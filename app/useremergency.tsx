/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Alert, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from 'expo-router';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  CalendarDaysIcon, 
  PaperClipIcon, 
  ArrowUpTrayIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  ShieldExclamationIcon,
  FireIcon,
  DocumentTextIcon
} from "react-native-heroicons/outline";
import { useUser } from './UserContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 2;
// Custom input field component
  const FormField = ({ label, placeholder, value, onChangeText, required = false, multiline = false, icon = null, disabled = false }) => {
    return (
      <View className="mb-4">
        <View className="flex-row items-center mb-1">
          {icon}
          <Text className="text-gray-600 font-medium ml-1">{label} {required && <Text className="text-primary">*</Text>}</Text>
        </View>
        <TextInput 
          className={`bg-white border ${!value ? 'border-gray-200' : 'border-gray-300'} rounded-xl p-4 ${multiline ? 'min-h-[100px]' : ''} shadow-sm`}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          editable={!disabled}
          numberOfLines={multiline ? 3 : 1}
          style={{ textAlignVertical: multiline ? 'top' : 'center' }}
        />
      </View>
    );
  };
const Emergency = () => {
  const [currentScreen, setCurrentScreen] = useState('report');
  const [isLoading, setIsLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const navigation = useNavigation();
  
  // Interfaces for type safety
  interface Attachment {
    uri: string;
    name: string;
    type: string;
    cloudinaryUrl?: string;
    publicId?: string;
  }

  // Form data state with proper types
  const [formData, setFormData] = useState({
    type: 'sos' as 'sos',
    title: '',
    description: '',
    location: '',
    elevatorId: '',
    status: 'pending' as 'pending' | 'assigned' | 'in-progress' | 'completed' | 'resolved' | 'unresolved',
    priority: 'urgent' as 'low' | 'medium' | 'high' | 'urgent',
    scheduledDate: '',
    attachments: [] as Array<{
      uri: string;
      name: string;
      type: string;
      cloudinaryUrl?: string;
      publicId?: string;
    }>
  });
  
  // Use the user context
  const { user, token, isAuthenticated } = useUser();
  
  // Priority colors for visual feedback
  const priorityColors = {
    low: '#60a5fa',     // Blue
    medium: '#fbbf24',  // Yellow
    high: '#f59e0b',    // Orange
    urgent: '#ef4444'   // Red
  };
  
  // Get priority color based on selected priority
  const getPriorityColor = (priority) => {
    return priorityColors[priority] || '#ef4444';
  };
  
  // Initialize form with user data and fetch user location on component mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      
      // Set user data from context
      if (user) {
        setFormData(prev => ({
          ...prev,
          location: user.address || '',
          elevatorId: user.elevator || ''
        }));
      }
      
      // If no user address, try to get location
      if (!user?.address) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Unable to access your location');
          setIsLoading(false);
          return;
        }
        
        try {
          const location = await Location.getCurrentPositionAsync({});
          const address = await getAddressFromCoords(location.coords.latitude, location.coords.longitude);
          setFormData(prev => ({ ...prev, location: address }));
        } catch (error) {
          Alert.alert('Error', 'Failed to get your location');
        }
      }
      
      setIsLoading(false);
    })();
  }, [user]);
  
  // Geocoding function to get address from coordinates
  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (response && response.length > 0) {
        const { street, name, city, region, country } = response[0];
        return `${street || name || ''}, ${city || ''}, ${region || ''}, ${country || ''}`;
      }
      return "Unknown location";
    } catch (error) {
      return "Unable to determine address";
    }
  };
  
  // Submit form data
  const submitForm = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        'You need to be logged in to submit a report.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.location) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required fields.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setIsLoading(true);
    try {
      // Format task data according to the schema and API expectations
      const taskData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        // Optional fields that should only be sent if they have values
        ...(formData.elevatorId && { elevatorId: formData.elevatorId }),
        ...(formData.scheduledDate && { scheduledDate: formData.scheduledDate }),
        // Format attachments to match schema - use cloudinaryUrl if available
        attachments: formData.attachments.map(file => ({
          name: file.name,
          type: file.type,
          url: file.cloudinaryUrl || file.uri // Use Cloudinary URL if available, fallback to local URI
        }))
      };
      
      console.log('Sending request with data:', JSON.stringify(taskData));
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://stratoliftapp.vercel.app/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit task');
      }
      
      // Check for HTML response (common error when API returns HTML instead of JSON)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        // Not JSON response
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 100));
        throw new Error('Server returned an invalid response format. Please try again later.');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit Emergency request');
      }
      
      // If successful, move to success screen
      setCurrentScreen('success');
    } catch (error) {
      console.error('Submit error:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('session') || error.message?.includes('login') || error.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to submit Emergency request');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  // Handle date selection
  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleConfirmDate = (date) => {
    const formattedDate = `${date.toLocaleDateString()}, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    handleChange('scheduledDate', formattedDate);
    hideDatePicker();
  };

  // Handle file upload with Cloudinary integration
  const handleFileUpload = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need media library permissions to upload files');
      return;
    }
    
    try {
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allow both images and videos
        allowsEditing: true,
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setIsLoading(true);
        
        // Determine file type from URI
        const fileType = asset.uri.endsWith('.mp4') || asset.uri.includes('video') 
          ? 'video/mp4' 
          : 'image/jpeg';
        
        // Create file name from URI
        const fileName = asset.uri.split('/').pop() || `File_${Date.now()}`;
        
        // Create form data for upload
        const formDataForUpload = new FormData();
        formDataForUpload.append('file', {
          uri: asset.uri,
          type: fileType,
          name: fileName,
        });
        
        try {
          // Upload to Cloudinary via your API endpoint
          const uploadResponse = await fetch('https://stratoliftapp.vercel.app/api/upload', {
            method: 'POST',
            body: formDataForUpload,
            headers: {
              'Content-Type': 'multipart/form-data',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });
          
          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to Cloudinary');
          }
          
          const uploadResult = await uploadResponse.json();
          
          // Add the uploaded file with Cloudinary URL to the form data
          const newFile = {
            uri: asset.uri, // Local URI for preview
            cloudinaryUrl: uploadResult.url, // Cloudinary URL for submission
            publicId: uploadResult.public_id, // Cloudinary public ID (if your API returns it)
            name: fileName,
            type: fileType
          };
          
          setFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, newFile]
          }));
          
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          
          // Fallback to local file if Cloudinary upload fails
          const newFile = {
            uri: asset.uri,
            name: fileName,
            type: fileType
          };
          
          setFormData(prevData => ({
            ...prevData,
            attachments: [...prevData.attachments, newFile]
          }));
          
          Alert.alert('Upload Warning', 'Image added locally only. It may not be saved permanently.');
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Error', 'There was a problem uploading your file');
      setIsLoading(false);
    }
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Select priority from dropdown
  const selectPriority = () => {
    Alert.alert(
      "Select Priority",
      "Choose the priority level",
      [
        { 
          text: "Low", 
          onPress: () => handleChange('priority', 'low')
        },
        { 
          text: "Medium", 
          onPress: () => handleChange('priority', 'medium')
        },
        { 
          text: "High", 
          onPress: () => handleChange('priority', 'high')
        },
        { 
          text: "Urgent", 
          onPress: () => handleChange('priority', 'urgent')
        }
      ]
    );
  };

  

  // Loading screen
  if (isLoading && currentScreen === 'report') {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-600 font-medium">Loading...</Text>
      </View>
    );
  }

  // Render appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'report':
        return (
          <ScrollView className="flex-1">
            <View className="flex-1 bg-gray-50 p-5">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                  <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                    <View className="bg-white p-2 rounded-full shadow-sm">
                      <ArrowLeftIcon size={20} color="#000" />
                    </View>
                  </TouchableOpacity>
                  <Text className="text-xl font-bold">Emergency Request</Text>
                </View>
                
                {/* Emergency indicator */}
                <View className="flex-row items-center bg-red-100 rounded-full px-3 py-1">
                  <View className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"/>
                  <Text className="text-red-500 font-medium">SOS</Text>
                </View>
              </View>
              
              {/* Authentication check banner */}
              {!isAuthenticated && (
                <View className="mb-6 p-4 bg-red-50 rounded-xl flex-row items-center border border-red-200">
                  <ExclamationTriangleIcon size={20} color="#ef4444" />
                  <Text className="text-red-500 font-medium ml-2">Please log in to submit a report</Text>
                </View>
              )}
              
              {/* Emergency image banner */}
              <View className="bg-white rounded-2xl mb-6 overflow-hidden shadow-sm h-48">
                <LinearGradient
                  colors={['rgba(0,0,0,0.5)', 'transparent', 'rgba(0,0,0,0.7)']}
                  className="absolute w-full h-full z-10"
                />
                <Image 
                  source={require('../assets/911.jpg')} 
                  className="w-full h-full"
                  alt="Emergency"
                />
                <View className="absolute bottom-4 left-4 z-20">
                  <Text className="text-white font-bold text-xl">Emergency Services</Text>
                  <Text className="text-white opacity-90">Help is on the way</Text>
                </View>
              </View>
              
              {/* Form */}
              <View className="mb-6">
                <FormField 
                  label="Title"
                  placeholder="Enter a title for this emergency"
                  value={formData.title}
                  onChangeText={(text) => handleChange('title', text)}
                  required={true}
                  icon={<DocumentTextIcon size={16} color="#6b7280" />}
                />
                
                <FormField 
                  label="Your Location"
                  placeholder="Enter your current location"
                  value={formData.location}
                  onChangeText={(text) => handleChange('location', text)}
                  required={true}
                  icon={<MapPinIcon size={16} color="#6b7280" />}
                />
                
                <FormField 
                  label="Elevator ID"
                  placeholder="Enter Elevator ID if applicable"
                  value={formData.elevatorId}
                  onChangeText={(text) => handleChange('elevatorId', text)}
                  icon={<BuildingOfficeIcon size={16} color="#6b7280" />}
                />

                {/* Issue Type - Fixed as Emergency */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-1">
                    <ShieldExclamationIcon size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-medium ml-1">Issue Type</Text>
                  </View>
                  <View className="bg-red-50 border border-red-200 rounded-xl p-4 flex-row items-center">
                    <FireIcon size={18} color="#ef4444" />
                    <Text className="ml-2 text-red-500 font-medium">Emergency</Text>
                  </View>
                </View>
                
                {/* Priority Selector */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-1">
                    <ExclamationTriangleIcon size={16} color="#6b7280" />
                    <Text className="text-gray-600 font-medium ml-1">Priority</Text>
                  </View>
                  <TouchableOpacity 
                    className={`bg-white border border-gray-200 rounded-xl p-4 flex-row justify-between items-center shadow-sm`}
                    onPress={selectPriority}
                    style={{ borderLeftWidth: 6, borderLeftColor: getPriorityColor(formData.priority) }}
                  >
                    <Text className="text-gray-800 font-medium capitalize">
                      {formData.priority}
                    </Text>
                    <View 
                      className={`rounded-full w-3 h-3`}
                      style={{ backgroundColor: getPriorityColor(formData.priority) }}
                    />
                  </TouchableOpacity>
                </View>

                <FormField 
                  label="Issue Description"
                  placeholder="Please describe the emergency situation in detail..."
                  value={formData.description}
                  onChangeText={(text) => handleChange('description', text)}
                  required={true}
                  multiline={true}
                  icon={<DocumentTextIcon size={16} color="#6b7280" />}
                />

                {/* Attachments Section */}
                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-1">
                    <View className="flex-row items-center">
                      <PaperClipIcon size={16} color="#6b7280" />
                      <Text className="text-gray-600 font-medium ml-1">Upload Photos/Videos</Text>
                    </View>
                    <Text className="text-xs text-gray-500">Max 5MB</Text>
                  </View>
                  
                  {/* Image Grid */}
                  {formData.attachments.length > 0 && (
                    <View className="flex-row flex-wrap mb-3">
                      {formData.attachments.map((attachment, index) => (
                        <View 
                          key={index} 
                          className="mr-3 mb-3 rounded-xl overflow-hidden"
                          style={{ width: imageSize, height: imageSize }}
                        >
                          <Image 
                            source={{ uri: attachment.uri }} 
                            style={{ width: '100%', height: '100%' }}
                            className="rounded-xl"
                          />
                          <TouchableOpacity 
                            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                            onPress={() => removeAttachment(index)}
                          >
                            <XMarkIcon size={16} color="#ffffff" />
                          </TouchableOpacity>
                          
                          {/* File type indicator for videos */}
                          {attachment.type === 'video/mp4' && (
                            <View className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded-full px-2 py-1">
                              <Text className="text-white text-xs">Video</Text>
                            </View>
                          )}
                        </View>
                      ))}
                      
                      {/* Add more button if less than max allowed */}
                      {formData.attachments.length < 6 && (
                        <TouchableOpacity 
                          onPress={handleFileUpload}
                          className="border-2 border-dashed border-gray-300 rounded-xl justify-center items-center bg-gray-50"
                          style={{ width: imageSize, height: imageSize }}
                        >
                          <ArrowUpTrayIcon size={24} color="#9ca3af" />
                          <Text className="text-gray-400 text-center mt-2">Add More</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                  
                  {/* Upload button if no attachments yet */}
                  {formData.attachments.length === 0 && (
                    <TouchableOpacity 
                      className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center justify-center bg-gray-50"
                      onPress={handleFileUpload}
                    >
                      <ArrowUpTrayIcon size={28} color="#9ca3af" />
                      <Text className="text-gray-500 font-medium text-center mt-2">Tap to upload photos or videos</Text>
                      <Text className="text-gray-400 text-xs text-center mt-1">Photos help faster response</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity 
                onPress={() => {
                  if (!formData.title || !formData.description || !formData.location) {
                    Alert.alert("Missing Information", "Please fill in all required fields.");
                    return;
                  }
                  setCurrentScreen('summary');
                }}
                className={`rounded-xl py-4 items-center shadow-lg mb-6 ${(!formData.title || !formData.description || !formData.location) ? 'bg-gray-300' : 'bg-red-500'}`}
                disabled={!formData.title || !formData.description || !formData.location}
              >
                <Text className="text-white font-bold text-lg">Review Request</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
        
      case 'summary':
        return (
          <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-5 shadow-sm">
              <View className="flex-row items-center justify-between">
                <TouchableOpacity onPress={() => setCurrentScreen('report')} className="mr-4">
                  <ArrowLeftIcon size={22} color="#000" />
                </TouchableOpacity>
                <Text className="text-xl font-bold flex-1 text-center">Review Emergency</Text>
                <View style={{ width: 22 }} />
              </View>
            </View>
            
            {/* Summary Content */}
            <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
              {/* Summary Card */}
              <View className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                {/* Priority Badge */}
                <View className="absolute top-5 right-5">
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${getPriorityColor(formData.priority)}20` }}
                  >
                    <Text className="font-bold capitalize" style={{ color: getPriorityColor(formData.priority) }}>
                      {formData.priority}
                    </Text>
                  </View>
                </View>

                {/* Title & Status */}
                <Text className="text-2xl font-bold mb-2">{formData.title}</Text>
                <View className="flex-row items-center mb-4">
                  <View className="bg-yellow-100 rounded-full px-2 py-1 mr-2">
                    <Text className="text-yellow-800 text-xs font-medium capitalize">{formData.status}</Text>
                  </View>
                  <Text className="text-gray-500">Emergency</Text>
                </View>
                
                {/* Divider */}
                <View className="border-t border-gray-100 my-4"></View>
                
                {/* Details */}
                <View className="mb-3">
                  <Text className="text-gray-500 text-sm mb-1">Location</Text>
                  <View className="flex-row items-center">
                    <MapPinIcon size={16} color="#6b7280" />
                    <Text className="ml-2 text-gray-800">{formData.location}</Text>
                  </View>
                </View>
                
                {formData.elevatorId && (
                  <View className="mb-3">
                    <Text className="text-gray-500 text-sm mb-1">Elevator ID</Text>
                    <View className="flex-row items-center">
                      <BuildingOfficeIcon size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-800">{formData.elevatorId}</Text>
                    </View>
                  </View>
                )}
                
                <View className="mb-3">
                  <Text className="text-gray-500 text-sm mb-1">Reported By</Text>
                  <Text className="text-gray-800">
                    {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown'}
                  </Text>
                </View>
                
                {/* Divider */}
                <View className="border-t border-gray-100 my-4"></View>
                
                {/* Description */}
                <View className="mb-3">
                  <Text className="text-gray-500 text-sm mb-1">Issue Description</Text>
                  <Text className="text-gray-800 leading-5">{formData.description}</Text>
                </View>
              </View>
              
              {/* Attachments Section */}
              {formData.attachments.length > 0 && (
                <View className="bg-white rounded-2xl shadow-sm p-5 mb-6">
                  <Text className="text-lg font-bold mb-4">Attachments</Text>
                  
                  {/* Image Grid */}
                  <View className="flex-row flex-wrap">
                    {formData.attachments.map((attachment, index) => (
                      <View 
                        key={index} 
                        className="mr-3 mb-3 rounded-xl overflow-hidden"
                        style={{ width: (width - 60) / 2, height: (width - 60) / 2 }}
                      >
                        <Image 
                          source={{ uri: attachment.uri }} 
                          style={{ width: '100%', height: '100%' }}
                          className="rounded-xl"
                        />
                        
                        {/* File type indicator for videos */}
                        {attachment.type === 'video/mp4' && (
                          <View className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded-full px-2 py-1">
                            <Text className="text-white text-xs">Video</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
            
            {/* Submit Button */}
            <View className="bg-white p-5 shadow-lg">
              <TouchableOpacity 
                onPress={submitForm}
                disabled={isLoading}
                className="bg-red-500 rounded-xl py-4 items-center shadow-sm"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-lg">Submit Emergency Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'success':
  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="bg-green-500 rounded-full p-5 mb-6 shadow-lg">
        <CheckIcon size={50} color="#fff" />
      </View>
      
      <Text className="text-2xl font-bold mb-2 text-center">Request Submitted</Text>
      <Text className="text-center text-gray-600 mb-8 leading-5">
        Your emergency request has been successfully submitted and is now pending. You'll be notified when help is dispatched.
      </Text>
      
      {/* Status Card */}
      <View className="w-full bg-gray-50 rounded-2xl p-5 mb-12 border border-gray-100">
        <View className="flex-row items-center mb-3">
          <View className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
          <Text className="font-medium">Status: <Text className="text-yellow-500">Pending</Text></Text>
        </View>
        <Text className="text-gray-600 text-sm">
          A rescue team will be assigned shortly. Stay calm and remain in a safe location if possible.
        </Text>
      </View>
      
      <TouchableOpacity 
        onPress={() => {
          // Reset form but keep user address and elevator
          setFormData({
            type: 'sos',
            title: '',
            description: '',
            location: user?.address || '',
            elevatorId: user?.elevator || '',
            status: 'pending',
            priority: 'urgent',
            scheduledDate: '',
            attachments: []
          });
          setCurrentScreen('report');
        }}
        className="bg-primary rounded-lg py-3 w-full items-center absolute bottom-8 left-6 right-6"
      >
        <Text className="text-white font-medium">New Request</Text>
      </TouchableOpacity>
    </View>
  );
        
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {renderScreen()}
    </View>
  );
};

export default Emergency;