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
  Platform 
} from 'react-native';
import { 
  ArrowLeftIcon, 
  CheckIcon, 
  CalendarDaysIcon, 
  PaperClipIcon, 
  ArrowUpTrayIcon 
} from "react-native-heroicons/outline";
import { useUser } from './UserContext';
import * as Location from 'expo-location';

const IssueReport = () => {
  const [currentScreen, setCurrentScreen] = useState('report');
  const [isLoading, setIsLoading] = useState(false);
  interface Attachment {
    uri: string;
    name: string;
    type: string;
  }

  const [formData, setFormData] = useState({
    type: 'maintenance' as 'maintenance' | 'service' | 'sos',
    title: '',
    description: '',
    location: '',
    elevatorId: '',
    status: 'pending' as 'pending' | 'assigned' | 'in-progress' | 'completed' | 'resolved' | 'unresolved',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    scheduledDate: '',
    attachments: [] as Attachment[]
  });
  const [userLocation, setUserLocation] = useState('');
  
  // Use the user context
  const { user, token, isAuthenticated } = useUser();
  
  // Fetch user location on component mount
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Unable to access your location');
        setIsLoading(false);
        return;
      }
      
      try {
        const location = await Location.getCurrentPositionAsync({});
        const address = await getAddressFromCoords(location.coords.latitude, location.coords.longitude);
        setUserLocation(address);
        setFormData(prev => ({ ...prev, location: address }));
      } catch (error) {
        Alert.alert('Error', 'Failed to get your location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);
  
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
    if (!formData.title || !formData.description || !formData.location || !formData.type) {
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
        // Format attachments to match schema
        attachments: formData.attachments.map(file => ({
          name: file.name,
          type: file.type,
          url: file.uri
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
        throw new Error(result.message || 'Failed to submit maintenance request');
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
        Alert.alert('Error', error.message || 'Failed to submit maintenance request');
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

  // Handle file upload
  const handleFileUpload = () => {
    // In a real app, this would open file picker
    // For this example, we'll just simulate adding a file
    const newFileName = `Photo${Math.floor(Math.random() * 1000)}.png`;
    const newFile = {
      uri: `file://${newFileName}`,
      name: newFileName,
      type: 'image/jpeg'
    };
    setFormData(prevData => ({
      ...prevData,
      attachments: [...prevData.attachments, newFile]
    }));
  };

  // Select date (simulate date picker)
  const selectDate = () => {
    const date = new Date();
    const formattedDate = `${date.toLocaleDateString()}, ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    handleChange('scheduledDate', formattedDate);
  };

  // Select issue type from dropdown
  const selectIssueType = () => {
    Alert.alert(
      "Select Issue Type",
      "Choose the type of issue",
      [
        { 
          text: "SOS", 
          onPress: () => handleChange('type', 'sos')
        },
        { 
          text: "Service", 
          onPress: () => handleChange('type', 'service')
        },
        { 
          text: "Maintenance", 
          onPress: () => handleChange('type', 'maintenance')
        }
      ]
    );
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
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#ef4444" />
        <Text className="mt-4 text-gray-600">Loading your location...</Text>
      </View>
    );
  }

  // Render appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'report':
        return (
          <ScrollView className="flex-1">
            <View className="flex-1 bg-white p-4">
              {/* Header */}
              <View className="flex-row items-center mb-4">
                <TouchableOpacity onPress={() => {}} className="mr-4">
                  <ArrowLeftIcon size={24} color="#000" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold">Issue Report</Text>
              </View>
              
              {/* User info */}
              {isAuthenticated ? (
                <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <Text className="font-medium">
                    Logged in as: {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email}
                  </Text>
                  {user?.role && <Text className="text-gray-500">Role: {user.role}</Text>}
                </View>
              ) : (
                <View className="mb-4 p-3 bg-red-50 rounded-lg">
                  <Text className="text-primary">Please log in to submit a report</Text>
                </View>
              )}
              
              {/* Map */}
              <View className="bg-gray-100 rounded-lg mb-6 overflow-hidden h-48">
                <Image 
                  source={{ uri: '/api/placeholder/400/200' }} 
                  className="w-full h-full"
                  alt="Map" 
                />
              </View>
              
              {/* Form */}
              <View className="mb-4">
                <Text className="text-gray-500 mb-1">Title <Text className="text-primary">*</Text></Text>
                <TextInput 
                  className="border border-gray-200 rounded-lg p-3 mb-4"
                  placeholder="Enter a title for this issue"
                  value={formData.title}
                  onChangeText={(text) => handleChange('title', text)}
                />
                
                <Text className="text-gray-500 mb-1">Your Location <Text className="text-primary">*</Text></Text>
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 mb-4"
                  placeholder="Enter location"
                  value={formData.location}
                  onChangeText={(text) => handleChange('location', text)}
                />
                
                <Text className="text-gray-500 mb-1">Elevator ID (Optional)</Text>
                <TextInput 
                  className="border border-gray-200 rounded-lg p-3 mb-4"
                  placeholder="Enter Elevator ID"
                  value={formData.elevatorId}
                  onChangeText={(text) => handleChange('elevatorId', text)}
                />

                <Text className="text-gray-500 mb-1">Issue Type <Text className="text-primary">*</Text></Text>
                <TouchableOpacity 
                  className="border border-gray-200 rounded-lg p-3 mb-4" 
                  onPress={selectIssueType}
                >
                  <Text className={formData.type ? "text-black" : "text-gray-400"}>
                    {formData.type ? formData.type.charAt(0).toUpperCase() + formData.type.slice(1) : "Choose Option"}
                  </Text>
                </TouchableOpacity>
                
                <Text className="text-gray-500 mb-1">Priority</Text>
                <TouchableOpacity 
                  className="border border-gray-200 rounded-lg p-3 mb-4" 
                  onPress={selectPriority}
                >
                  <Text className={formData.priority ? "text-black" : "text-gray-400"}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                  </Text>
                </TouchableOpacity>

                <Text className="text-gray-500 mb-1">Issue Description <Text className="text-primary">*</Text></Text>
                <TextInput 
                  className="border border-gray-200 rounded-lg p-3 mb-4"
                  placeholder="Please describe the issue in details."
                  multiline
                  numberOfLines={3}
                  value={formData.description}
                  onChangeText={(text) => handleChange('description', text)}
                />

                <Text className="text-gray-500 mb-1">Choose Date & Time (Optional)</Text>
                <TouchableOpacity 
                  className="border border-gray-200 rounded-lg p-3 mb-4 flex-row justify-between items-center"
                  onPress={selectDate}
                >
                  <Text className={formData.scheduledDate ? "text-black" : "text-gray-400"}>
                    {formData.scheduledDate || "Select Date"}
                  </Text>
                  <CalendarDaysIcon size={20} color="#9ca3af" />
                </TouchableOpacity>

                <Text className="text-gray-500 mb-1">Upload Attachments (Optional)</Text>
                <TouchableOpacity 
                  className="border border-gray-200 border-dashed rounded-lg p-6 mb-2 items-center justify-center"
                  onPress={handleFileUpload}
                >
                  <ArrowUpTrayIcon size={24} color="#9ca3af" />
                  <Text className="text-gray-400 text-center">Tap to upload file</Text>
                </TouchableOpacity>
                <Text className="text-gray-400 text-xs mb-1">Maximum size: 5MB</Text>
                
                {/* Show uploaded files */}
                {formData.attachments.length > 0 && (
                  <View className="mb-8">
                    {formData.attachments.map((attachment, index) => (
                      <View key={index} className="flex-row items-center mb-1">
                        <PaperClipIcon size={16} color="#6b7280" />
                        <Text className="ml-2">{attachment.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity 
                onPress={() => {
                  if (!formData.title || !formData.description || !formData.location || !formData.type) {
                    Alert.alert("Missing Information", "Please fill in all required fields.");
                    return;
                  }
                  setCurrentScreen('summary');
                }}
                className={`rounded-lg py-3 items-center ${(!formData.title || !formData.description || !formData.location || !formData.type) ? 'bg-gray-300' : 'bg-primary'}`}
                disabled={!formData.title || !formData.description || !formData.location || !formData.type}
              >
                <Text className="text-white font-medium">Review Request</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        );
        
      case 'summary':
        return (
          <View className="flex-1 bg-white p-4">
            {/* Header */}
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={() => setCurrentScreen('report')} className="mr-4">
                <ArrowLeftIcon size={24} color="#000" />
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Review Request</Text>
            </View>
            
            {/* Summary Content */}
            <ScrollView className="flex-1">
              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Title</Text>
                <Text className="mb-4">{formData.title}</Text>
              </View>
              
              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Location</Text>
                <Text className="mb-4">{formData.location}</Text>
              </View>

              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Elevator ID</Text>
                <Text className="mb-4">{formData.elevatorId || 'Not provided'}</Text>
              </View>

              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Issue Type</Text>
                <Text className="mb-4 capitalize">{formData.type}</Text>
              </View>
              
              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Priority</Text>
                <Text className="mb-4 capitalize">{formData.priority}</Text>
              </View>

              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Description</Text>
                <Text className="mb-4">{formData.description}</Text>
              </View>

              {formData.scheduledDate && (
                <View className="mb-2">
                  <Text className="text-gray-500 mb-1">Scheduled Date & Time</Text>
                  <Text className="mb-4">{formData.scheduledDate}</Text>
                </View>
              )}

              {formData.attachments.length > 0 && (
                <View className="mb-2">
                  <Text className="text-gray-500 mb-1">Attachments</Text>
                  <View className="mb-6">
                    {formData.attachments.map((attachment, index) => (
                      <View key={index} className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center">
                          <PaperClipIcon size={16} color="#6b7280" />
                          <Text className="ml-2">{attachment.name}</Text>
                        </View>
                        <TouchableOpacity>
                          <Text className="text-gray-500">view</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Status</Text>
                <Text className="mb-4 capitalize">{formData.status}</Text>
              </View>
              
              <View className="mb-2">
                <Text className="text-gray-500 mb-1">Reported By</Text>
                <Text className="mb-4">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.email || 'Unknown'}
                </Text>
              </View>
            </ScrollView>
            
            {/* Submit Button */}
            <View className="mt-2">
              <TouchableOpacity 
                onPress={submitForm}
                className="bg-primary rounded-lg py-3 items-center mt-auto"
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-medium">Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        );
        
      case 'success':
        return (
          <View className="flex-1 bg-white justify-center items-center p-4">
            <View className="bg-green-500 rounded-full p-4 mb-4">
              <CheckIcon size={32} color="#fff" />
            </View>
            <Text className="text-gray-500 mb-2">Submitted Successfully</Text>
            <Text className="text-center text-gray-500 mb-12">
              Your {formData.type} request has been submitted and is now pending. You will be notified once it's assigned.
            </Text>
            
            <TouchableOpacity 
              onPress={() => {
                // Reset form and return to report screen
                setFormData({
                  type: 'maintenance',
                  title: '',
                  description: '',
                  location: userLocation,
                  elevatorId: '',
                  status: 'pending',
                  priority: 'medium',
                  scheduledDate: '',
                  attachments: []
                });
                setCurrentScreen('report');
              }}
              className="bg-primary rounded-lg py-3 w-full items-center absolute bottom-8 left-4 right-4"
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

export default IssueReport;