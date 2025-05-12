import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View,} from 'react-native';
import { ArrowLeftIcon, CalendarIcon, ChatBubbleLeftIcon, CheckCircleIcon, CheckIcon,  ClipboardDocumentIcon, ClockIcon, DocumentTextIcon, ExclamationTriangleIcon, InformationCircleIcon, MapPinIcon, PaperAirplaneIcon, UserIcon, WrenchScrewdriverIcon,} from 'react-native-heroicons/outline';
import { useUser } from './UserContext';

const { width } = Dimensions.get('window');

const TaskDetail = () => {
  const { user, token } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    fetchTaskDetails();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [taskId]);
  
  const fetchTaskDetails = async () => {
    if (!taskId || !token) return;
    
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
  
  const updateTaskStatus = async (newStatus) => {
    if (!taskId || !token) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`https://stratoliftapp.vercel.app/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          updateMessage: `Status changed to ${newStatus}`,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update task status');
      }
      
      setTask(data.data);
      Alert.alert('Success', `Task status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating task status:', err);
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
      setStatusMenuVisible(false);
    }
  };
  
  const addUpdateMessage = async () => {
    if (!updateMessage.trim() || !taskId || !token) return;
    
    try {
      setSubmitting(true);
      const response = await fetch(`https://stratoliftapp.vercel.app/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          updateMessage: updateMessage.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add update message');
      }
      
      setTask(data.data);
      setUpdateMessage('');
    } catch (err) {
      console.error('Error adding update message:', err);
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };
  
  const getTaskTypeIcon = (type) => {
    const iconSize = 20;
    
    switch (type) {
      case 'service':
        return <UserIcon size={iconSize} color="#6366F1" />;
      case 'maintenance':
        return <WrenchScrewdriverIcon size={iconSize} color="#3B82F6" />;
      case 'sos':
        return <Image
          source={require('../assets/emergency.png')}
          style={{ width: 20, height: 20 }}
        />;
      default:
        return <ClipboardDocumentIcon size={iconSize} color="#6B7280" />;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-600';
      case 'assigned':
        return 'bg-blue-100 text-blue-600';
      case 'in-progress':
        return 'bg-amber-100 text-amber-600';
      case 'completed':
      case 'resolved':
        return 'bg-green-100 text-green-600';
      case 'unresolved':
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low':
        return 'bg-green-50 text-green-600';
      case 'medium':
        return 'bg-blue-50 text-blue-600';
      case 'high':
        return 'bg-orange-50 text-orange-600';
      case 'urgent':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };
  
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const canUpdateStatus = (currentStatus) => {
    // Logic for which statuses a technician can update to
    switch (currentStatus) {
      case 'pending':
      case 'assigned':
        return ['in-progress'];
      case 'in-progress':
        return ['completed'];
      default:
        return [];
    }
  };
  
  const renderStatusOptions = () => {
    if (!task) return null;
    
    const availableStatuses = canUpdateStatus(task.status);
    
    if (availableStatuses.length === 0) {
      return (
        <View className="mt-2 bg-gray-50 p-3 rounded-lg">
          <Text className="text-gray-500 font-geist text-center">
            No status updates available for this task
          </Text>
        </View>
      );
    }
    
    return (
      <View className="mt-2 bg-white border border-gray-200 rounded-lg shadow-sm">
        {availableStatuses.map((status) => (
          <Pressable
            key={status}
            onPress={() => updateTaskStatus(status)}
            className="py-3 px-4 border-b border-gray-100 flex-row justify-between items-center"
          >
            <Text className="font-geist text-gray-700">
              Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
            <CheckIcon size={18} color="#9CA3AF" />
          </Pressable>
        ))}
      </View>
    );
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center p-5">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-3 font-geist">Loading task details...</Text>
        </View>
      );
    }
    
    if (error) {
      return (
        <View className="flex-1 items-center justify-center p-5">
          <View className="bg-red-50 p-3 rounded-full mb-2">
            <ExclamationTriangleIcon size={24} color="#EF4444" />
          </View>
          <Text className="text-gray-700 font-geist-bold mb-1">Unable to load task details</Text>
          <Text className="text-gray-500 text-center mb-4 font-geist">{error}</Text>
          <Pressable
            onPress={fetchTaskDetails}
            className="bg-blue-600 py-2 px-5 rounded-lg"
          >
            <Text className="text-white font-geist-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }
    
    if (!task) {
      return (
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-gray-700 font-geist-bold">Task not found</Text>
        </View>
      );
    }
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Task Header Card */}
          <View className="bg-white mx-5 rounded-2xl p-5 shadow-sm mb-5">
            <View className="flex-row items-center mb-3">
              <View className="bg-blue-50 p-2 rounded-xl mr-3">
                {getTaskTypeIcon(task.type)}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-geist-semibold text-gray-800">
                  {task.title}
                </Text>
                <Text className="text-gray-500 text-sm font-geist">
                  ID: {task.taskId || task._id.substring(0, 8)}
                </Text>
              </View>
            </View>
            
            <View className="flex-row flex-wrap mb-3">
              <View className={`py-1 px-3 rounded-full ${getStatusColor(task.status).split(' ')[0]} mr-2`}>
                <Text className={`text-xs font-geist-semibold ${getStatusColor(task.status).split(' ')[1]}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Text>
              </View>
              
              {task.priority && (
                <View className={`py-1 px-3 rounded-full ${getPriorityColor(task.priority).split(' ')[0]}`}>
                  <Text className={`text-xs font-geist-semibold ${getPriorityColor(task.priority).split(' ')[1]}`}>
                    {task.priority.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            
            <View className="border-t border-gray-100 pt-3 mt-1">
              <View className="flex-row items-center mb-3">
                <CalendarIcon size={16} color="#6B7280" className="mr-2" />
                <Text className="text-gray-600 text-sm font-geist">
                  Created: {formatDateTime(task.createdAt)}
                </Text>
              </View>
              
              {task.dueDate && (
                <View className="flex-row items-center">
                  <ClockIcon size={16} color="#6B7280" className="mr-2" />
                  <Text className="text-gray-600 text-sm font-geist">
                    Due: {formatDateTime(task.dueDate)}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Task Description Card */}
          <View className="bg-white mx-5 rounded-2xl p-5 shadow-sm mb-5">
            <View className="flex-row items-center mb-3">
              <DocumentTextIcon size={18} color="#3B82F6" />
              <Text className="text-gray-800 font-geist-semibold text-base ml-2">
                Description
              </Text>
            </View>
            <Text className="text-gray-600 font-geist">
              {task.description || 'No description provided'}
            </Text>
          </View>
          
          {/* Task Location Card */}
          {task.location && (
            <View className="bg-white mx-5 rounded-2xl p-5 shadow-sm mb-5">
              <View className="flex-row items-center mb-3">
                <MapPinIcon size={18} color="#3B82F6" />
                <Text className="text-gray-800 font-geist-semibold text-base ml-2">
                  Location
                </Text>
              </View>
              <Text className="text-gray-600 font-geist">
                {task.location}
              </Text>
            </View>
          )}
          
          {/* Task Customer Card */}
          {task.createdBy && (
            <View className="bg-white mx-5 rounded-2xl p-5 shadow-sm mb-5">
              <View className="flex-row items-center mb-3">
                <UserIcon size={18} color="#3B82F6" />
                <Text className="text-gray-800 font-geist-semibold text-base ml-2">
                  Customer Details
                </Text>
              </View>
              
              <View className="flex-row items-center">
                <Image
                  source={require('../assets/profile.png')}
                  style={{ width: 40, height: 40, borderRadius: 20 }}
                  defaultSource={require('../assets/profile.png')}
                />
                <View className="ml-3">
                  <Text className="text-gray-800 font-geist-semibold">
                    {task.createdBy.name || 'Unknown User'}
                  </Text>
                  <Text className="text-gray-600 font-geist text-sm">
                    {task.createdBy.email || 'No email provided'}
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          {/* Task Updates Card */}
          <View className="bg-white mx-5 rounded-2xl p-5 shadow-sm mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <ChatBubbleLeftIcon size={18} color="#3B82F6" />
                <Text className="text-gray-800 font-geist-semibold text-base ml-2">
                  Updates & Notes
                </Text>
              </View>
              <Text className="text-gray-500 text-xs font-geist">
                {task.updates?.length || 0} {task.updates?.length === 1 ? 'update' : 'updates'}
              </Text>
            </View>
            
            {task.updates && task.updates.length > 0 ? (
              task.updates.map((update, index) => (
                <View 
                  key={update._id || index} 
                  className={`pb-4 ${index !== task.updates.length - 1 ? 'border-b border-gray-100 mb-4' : ''}`}
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-700 font-geist-semibold">
                      {update.updatedBy?.name || 'System Update'}
                    </Text>
                    <Text className="text-gray-500 text-xs font-geist">
                      {formatDateTime(update.updatedAt)}
                    </Text>
                  </View>
                  <Text className="text-gray-600 font-geist">
                    {update.message}
                  </Text>
                </View>
              ))
            ) : (
              <View className="py-3 bg-gray-50 rounded-lg items-center">
                <Text className="text-gray-500 font-geist">No updates yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        {/* Update Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          className="px-5 pb-5 pt-2 bg-white border-t border-gray-200"
        >
          <View className="flex-row items-center">
            <TextInput
              className="flex-1 bg-gray-100 rounded-l-xl px-4 py-3 text-gray-700 font-geist"
              placeholder="Add update or notes..."
              value={updateMessage}
              onChangeText={setUpdateMessage}
              multiline
            />
            <Pressable
              onPress={addUpdateMessage}
              disabled={!updateMessage.trim() || submitting}
              className={`bg-blue-600 rounded-r-xl p-3 ${(!updateMessage.trim() || submitting) ? 'opacity-50' : ''}`}
            >
              <PaperAirplaneIcon size={20} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    );
  };
  
  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      
      {/* Header */}
      <LinearGradient
        colors={['#ffffff', '#fafafa']}
        className="pt-2 pb-4 px-5"
      >
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => navigation.goBack()}
              className="w-10 h-10 items-center justify-center bg-white rounded-full shadow-sm mr-3"
            >
              <ArrowLeftIcon size={18} color="#374151" />
            </Pressable>
            <Text className="font-geist-bold text-xl text-gray-800">Task Details</Text>
          </View>
          
          {task && (
            <View className="relative">
              <Pressable
                onPress={() => setStatusMenuVisible(!statusMenuVisible)}
                className="bg-blue-600 py-2 px-4 rounded-lg flex-row items-center"
                disabled={submitting || canUpdateStatus(task?.status)?.length === 0}
                style={{
                  opacity: submitting || canUpdateStatus(task?.status)?.length === 0 ? 0.7 : 1
                }}
              >
                <Text className="text-white font-geist-semibold text-sm mr-1">Update Status</Text>
              </Pressable>
              
              {statusMenuVisible && (
                <View className="absolute top-12 right-0 z-10">
                  {renderStatusOptions()}
                </View>
              )}
            </View>
          )}
        </View>
      </LinearGradient>
      
      {renderContent()}
    </View>
  );
};

export default TaskDetail;