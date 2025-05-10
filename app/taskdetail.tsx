import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar as RNStatusBar,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  PhoneIcon,
  TrashIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon
} from 'react-native-heroicons/outline';
import { StarIcon } from 'react-native-heroicons/solid';
import { useUser } from './UserContext';

const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  const { user, token } = useUser();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  // Set up countdown timer for tasks with ETA
  useEffect(() => {
    if (!task || !task.estimatedArrival) return;
    
    const now = new Date();
    const eta = new Date(task.estimatedArrival);
    let diff = Math.floor((eta - now) / 1000); // in seconds
    
    if (diff <= 0) return;
    
    const timer = setInterval(() => {
      diff -= 1;
      if (diff <= 0) {
        clearInterval(timer);
      }
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setCountdown(`${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [task]);

  const fetchTaskDetails = async () => {
    if (!token || !taskId) return;

    try {
      setLoading(true);
      const response = await fetch(`https://stratoliftapp.vercel.app/api/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch task details');
      }

      setTask(data.data);
    } catch (err) {
      console.error('Error fetching task details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    try {
      const response = await fetch(`https://stratoliftapp.vercel.app/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          updateMessage: 'Task marked as completed',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task status');
      }

      Alert.alert('Success', 'Task marked as completed');
      setTask(data.data);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update task status');
    }
  };

  const handleDeleteTask = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`https://stratoliftapp.vercel.app/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.message || 'Failed to delete task');
              }

              Alert.alert('Success', 'Task deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete task');
            }
          }
        }
      ]
    );
  };

  const getIconForTaskType = (type) => {
    switch (type) {
      case 'visit':
        return <UserCircleIcon size={24} color="#6B7280" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon size={24} color="#3B82F6" />;
      case 'report':
        return <ExclamationTriangleIcon size={24} color="#F59E0B" />;
      case 'sos':
        return <ExclamationTriangleIcon size={24} color="#EF4444" />;
      default:
        return <UserCircleIcon size={24} color="#6B7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-500';
      case 'in-progress':
      case 'assigned':
        return 'bg-orange-100 text-orange-500';
      case 'completed':
        return 'bg-green-100 text-green-500';
      case 'cancelled':
        return 'bg-red-100 text-primary';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getShortTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  if (loading) {
    return (
      <View 
        className="flex-1 bg-gray-50 items-center justify-center"
        style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}
      >
        <ActivityIndicator size="large" color="#EF4444" />
        <Text className="mt-4 text-gray-600">Loading task details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View 
        className="flex-1 bg-gray-50 items-center justify-center"
        style={{ paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0 }}
      >
        <ExclamationTriangleIcon size={40} color="#EF4444" />
        <Text className="mt-4 text-gray-600">Failed to load task details</Text>
        <TouchableOpacity 
          onPress={fetchTaskDetails}
          className="mt-4 bg-primary py-2 px-6 rounded-lg"
        >
          <Text className="text-white font-bold">Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-4 py-2 px-6"
        >
          <Text className="text-gray-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!task) {
    return (
      <View 
        className="flex-1 bg-gray-50 items-center justify-center"
        >
        <Text className="text-gray-600">Task not found</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="mt-4 bg-gray-200 py-2 px-6 rounded-lg"
        >
          <Text className="text-gray-600">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmergency = task.type === 'emergency';
  const isAssigned = !!task.assignedTo;
  const canComplete = ['pending', 'in-progress', 'assigned'].includes(task.status);
  const canDelete = user && (user.role === 'admin' || (user.role === 'user' && task.createdBy?._id === user._id));

  return (
    <View 
      className="flex-1 bg-gray-50"
      >
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeftIcon size={24} color="#000" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">Task Details</Text>
      </View>
      
      <ScrollView className="flex-1">
        {isEmergency && (
          <View className="flex-row bg-red-100 p-4 border-l-4 border-primary">
            <View className="w-6 h-6 bg-primary rounded items-center justify-center mr-2">
              <Text className="text-white font-bold">!</Text>
            </View>
            <View>
              <Text className="text-primary font-bold">Emergency</Text>
              <Text className="text-primary">
                {isAssigned 
                  ? "Technician dispatched to your location" 
                  : "Processing your emergency request"
                }
              </Text>
            </View>
          </View>
        )}
        
        {/* Technician Info - Only show if assigned */}
        {isAssigned && (
          <View className="bg-white p-4 mb-4">
            <View className="flex-row items-center">
              <Image 
                source={task.assignedTo.image ? { uri: task.assignedTo.image } : require('../assets/profile.png')} 
                className="w-12 h-12 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="font-bold text-lg">{task.assignedTo.name} {task.assignedTo.lastName}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-500 mr-2">✓ Certified</Text>
                  <Text className="text-gray-500">• {task.assignedTo.experience || '5'} years experience</Text>
                </View>
                {task.assignedTo.rating && (
                  <View className="flex-row mt-1">
                    {[...Array(Math.floor(task.assignedTo.rating))].map((_, i) => (
                      <StarIcon key={i} size={16} color="#FFC107" />
                    ))}
                    {[...Array(5 - Math.floor(task.assignedTo.rating))].map((_, i) => (
                      <StarIcon key={i} size={16} color="#E0E0E0" />
                    ))}
                  </View>
                )}
                <View className="mt-2 bg-green-100 self-start px-2 py-1 rounded">
                  <Text className="text-green-600 text-xs font-bold">ASSIGNED</Text>
                </View>
              </View>
            </View>
            
            {/* Contact Buttons */}
            <View className="flex-row mt-4">
              <TouchableOpacity 
                  onPress={() => {
                  if (task?.assignedTo?.phone) {
                    Linking.openURL(`tel:${task.assignedTo.phone}`);
                  } else {
                    alert('No phone number available');
                  }
                }} 
                className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-full mr-2">
                <PhoneIcon size={20} color="#000" />
                <Text className="ml-2 font-medium">Call</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 border border-gray-300 rounded-full ml-2">
                <ChatBubbleLeftRightIcon size={20} color="#000" />
                <Text className="ml-2 font-medium">Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Not Assigned Yet Info */}
        {!isAssigned && task.status === 'pending' && (
          <View className="bg-white p-4 mb-4 items-center">
            <ClockIcon size={40} color="#F59E0B" />
            <Text className="text-lg font-bold mt-2">Waiting for Assignment</Text>
            <Text className="text-gray-500 text-center mt-1">
              Your task is being reviewed and will be assigned to a technician soon.
            </Text>
            <View className="mt-3 bg-orange-100 px-3 py-1 rounded-full">
              <Text className="text-orange-500 font-bold">PENDING</Text>
            </View>
          </View>
        )}
        
        {/* ETA Section - Only show if assigned and not completed */}
        {isAssigned && ['assigned', 'in-progress'].includes(task.status) && (
          <View className="bg-white rounded-lg mx-4 mb-4 p-4">
            <Text className="text-lg font-bold mb-4">Estimated Time of Arrival (ETA)</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <ClockIcon size={20} color="#000" />
                <Text className="ml-2">Arrival in</Text>
              </View>
              <View className="bg-primary px-4 py-1 rounded-full">
                <Text className="text-white font-bold">{countdown || '-- : --'}</Text>
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-gray-500 mb-1">Address</Text>
              <Text className="font-medium">{task.location || 'Not specified'}</Text>
            </View>
            <View className="flex-row justify-between mt-4">
              <View>
                <Text className="text-gray-500 mb-1">Request created</Text>
                <Text className="font-medium">{getShortTime(task.createdAt)}</Text>
              </View>
              <View>
                <Text className="text-gray-500 mb-1">Expected arrival</Text>
                <Text className="font-medium">
                  {task.estimatedArrival ? getShortTime(task.estimatedArrival) : 'Not specified'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Summary Section */}
        <View className="bg-white mx-4 mb-4 p-4">
          <Text className="text-lg font-bold mb-4">Summary</Text>
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Type</Text>
            <Text className="font-medium">{task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : 'Not specified'}</Text>
          </View>
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Issue</Text>
            <Text className="font-medium">{task.title}</Text>
          </View>
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Priority</Text>
            <Text className={
              task.priority === 'high' ? 'text-primary font-bold' : 
              task.priority === 'medium' ? 'text-orange-500 font-medium' : 
              'text-blue-500 font-medium'
            }>
              {task.priority ? task.priority.toUpperCase() : 'Not specified'}
            </Text>
          </View>
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Date</Text>
            <Text className="font-medium">{formatDate(task.createdAt)}</Text>
          </View>
          
          {task.location && (
            <View className="flex-row mb-3">
              <Text className="text-gray-500 w-24">Location</Text>
              <View className="flex-row items-center">
                <MapPinIcon size={16} color="#6B7280" className="mr-1" />
                <Text className="font-medium">{task.location}</Text>
              </View>
            </View>
          )}
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Status</Text>
            <View className={`py-1 px-2 rounded-md ${getStatusColor(task.status).split(' ')[0]}`}>
              <Text className={`text-xs font-medium ${getStatusColor(task.status).split(' ')[1]}`}>
                {task.status.toUpperCase()}
              </Text>
            </View>
          </View>
          
          <View className="flex-row mb-3">
            <Text className="text-gray-500 w-24">Reference ID</Text>
            <Text className="font-medium">{task._id}</Text>
          </View>
        </View>
        
        {/* Description */}
        <View className="bg-white mx-4 mb-4 p-4">
          <Text className="text-lg font-bold mb-2">Description</Text>
          <Text className="text-gray-700">{task.description || 'No description provided.'}</Text>
        </View>
        
        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <View className="bg-white mx-4 mb-4 p-4">
            <Text className="text-lg font-bold mb-4">Attachments</Text>
            
            {task.attachments.map((attachment, index) => (
              <View key={index} className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <DocumentTextIcon size={20} color="#000" />
                  <Text className="ml-2">{attachment.name || `Attachment ${index + 1}`}</Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-primary">view</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Updates Section */}
        {task.updates && task.updates.length > 0 && (
          <View className="bg-white mx-4 mb-4 p-4">
            <Text className="text-lg font-bold mb-3">Updates</Text>
            
            {task.updates.map((update, index) => (
              <View key={index} className="pb-4 mb-4 border-b border-gray-100">
                <View className="flex-row justify-between mb-2">
                  <View className="flex-row items-center">
                    <Image 
                      source={update.updatedBy?.image ? { uri: update.updatedBy.image } : require('../assets/profile.png')} 
                      style={{ width: 24, height: 24, borderRadius: 12, marginRight: 8 }}
                    />
                    <Text className="font-bold">
                      {update.updatedBy?.firstName} {update.updatedBy?.lastName}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">{formatDate(update.date || update.updatedAt)}</Text>
                </View>
                <Text className="text-gray-700">{update.comment || update.message}</Text>
                
                {update.status && (
                  <View className="mt-2 flex-row items-center">
                    <Text className="text-gray-500 mr-2">Status changed to</Text>
                    <View className={`py-1 px-2 rounded-md ${getStatusColor(update.status).split(' ')[0]}`}>
                      <Text className={`text-xs font-medium ${getStatusColor(update.status).split(' ')[1]}`}>
                        {update.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Action Buttons */}
      <View className="px-4 py-3 bg-white border-t border-gray-200">
        {task.status !== 'completed' && task.status !== 'cancelled' && (
          <View className="flex-row justify-between">
            {/* Add Comment Button */}
            <TouchableOpacity 
              onPress={() => navigation.navigate('addcomment', { taskId: task._id })}
              className="flex-1 mr-2 flex-row items-center justify-center bg-gray-100 py-3 rounded-lg"
            >
              <ChatBubbleLeftRightIcon size={20} color="#6B7280" />
              <Text className="ml-2 font-bold text-gray-600">Add Comment</Text>
            </TouchableOpacity>
            
            {/* Complete Button */}
            {canComplete && (
              <TouchableOpacity 
                onPress={handleCompleteTask}
                className="flex-1 ml-2 flex-row items-center justify-center bg-green-500 py-3 rounded-lg"
              >
                <CheckCircleIcon size={20} color="#FFFFFF" />
                <Text className="ml-2 font-bold text-white">Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Delete Button - Only for admins or task creators */}
        {canDelete && (
          <TouchableOpacity 
            onPress={handleDeleteTask}
            className="mt-3 flex-row items-center justify-center bg-primary py-3 rounded-lg"
          >
            <TrashIcon size={20} color="#FFFFFF" />
            <Text className="ml-2 font-bold text-white">Delete Task</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TaskDetailScreen;