import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';

const RegistrationForm = () => {
  const { login } = useUser();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('register');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errorMessage) setErrorMessage('');
  };

  // Form validation
  const validateForm = () => {
    // For registration
    if (activeTab === 'register') {
      if (!formData.firstName) return 'First name is required';
      if (!formData.lastName) return 'Last name is required';
      if (!formData.email) return 'Email is required';
      if (!formData.phone) return 'Phone number is required';
      if (!formData.password) return 'Password is required';
      if (formData.password !== formData.confirmPassword) 
        return 'Passwords do not match';
      if (formData.password.length < 6)
        return 'Password must be at least 6 characters';
    } 
    // For login
    else {
      if (!formData.email) return 'Email is required';
      if (!formData.password) return 'Password is required';
    }
    return null;
  };

  const handleSubmit = async () => {
    // Validate form first
    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    setFormStatus('loading');
    
    try {
      if (activeTab === 'register') {
        // Handle registration
        const response = await fetch('https://stratoliftapp.vercel.app/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          setFormStatus('success');
        } else {
          setFormStatus('error');
          setErrorMessage(data.message || 'Registration failed. Please try again.');
        }
      } else {
        // Handle login using the context
        await login(formData.email, formData.password);
        const userRole = await login(formData.email, formData.password);
        // Navigate based on returned role
        if (userRole === 'technician') {
          navigation.navigate('techniciandb');
        } else {
          navigation.navigate('userdb');
        }
      }
    } catch (error) {
      setFormStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred. Please try again.');
      console.error(activeTab === 'register' ? 'Registration error:' : 'Login error:', error);
    } finally {
      if (activeTab === 'login' || formStatus === 'error') {
        setFormStatus('idle');
      }
    }
  };

  if (formStatus === 'success') {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <View className="bg-green-500 rounded-full p-4 mb-4">
          <CheckCircleIcon size={40} color="white" />
        </View>
        <Text className="text-xl font-bold mb-6">Account Created Successfully</Text>
        <TouchableOpacity
          className="w-full bg-primary py-3 px-4 rounded-2xl"
          onPress={() => {
            setActiveTab('login');
            setFormStatus('idle');
          }}
        >
          <Text className="text-white text-center font-bold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
          <View className="flex flex-row items-center justify-between w-full bg-[#f2c2c22f]">
            <TouchableOpacity
              className={`py-4 px-4 w-[50%] ${activeTab === 'register' ? 'border-b border-primary' : ''}`}
              onPress={() => setActiveTab('register')}
            >
              <Text className={`text-start  ${activeTab === 'register' ? 'text-primary text-[20px] font-bold' : 'text-black text-[14px]'}`}>
                Register
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-4 px-4 w-[50%] font-lato-bold ${activeTab === 'login' ? 'border-b border-primary' : 'text-[14px] text-black'}`}
              onPress={() => setActiveTab('login')}
            >
              <Text className={`text-end ${activeTab === 'login' ? 'text-primary text-[20px] font-bold' : 'text-black text-[14px]'}`}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'register' ? (
            <View className="flex-1 p-4 w-full justify-between">
              <View className="space-y-4">
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">First Name</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-[12px] placeholder:font-lato-italic rounded-2xl"
                    placeholder="Enter your First Name"
                    value={formData.firstName}
                    onChangeText={(text) => handleInputChange('firstName', text)}
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Last Name</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-[12px] placeholder:font-lato-italic rounded-2xl"
                    placeholder="Enter your Last Name"
                    value={formData.lastName}
                    onChangeText={(text) => handleInputChange('lastName', text)}
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Address</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-[12px] placeholder:font-lato-italic rounded-2xl"
                    placeholder="Enter your Address"
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Phone Number</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-[12px] placeholder:font-lato-italic rounded-2xl"
                    placeholder="Enter your Phone Number"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => handleInputChange('phone', text)}
                  />
                </View>
                
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Email</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 placeholder:text-[12px] placeholder:font-lato-italic rounded-2xl"
                    placeholder="Enter your Email"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Password</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-2xl">
                    <TextInput
                      className="flex-1 px-4 py-2"
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                    />
                    <TouchableOpacity className="px-3" onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon size={24} color="gray" /> : <EyeIcon size={24} color="gray" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Confirm Password</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-2xl">
                    <TextInput
                      className="flex-1 px-4 py-2"
                      placeholder="Confirm Password"
                      secureTextEntry={!showConfirmPassword}
                      value={formData.confirmPassword}
                      onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    />
                    <TouchableOpacity className="px-3" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeSlashIcon size={24} color="gray" /> : <EyeIcon size={24} color="gray" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {errorMessage ? <Text className="text-primary mt-2 mb-2">{errorMessage}</Text> : null}

              <TouchableOpacity
                className={`w-full py-3 px-4 rounded-2xl ${formStatus === 'loading' ? 'bg-red-300' : 'bg-primary'}`}
                onPress={handleSubmit}
                disabled={formStatus === 'loading'}
              >
                {formStatus === 'loading' ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-bold">Continue</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            // Sign In form
            <View className="flex-1 justify-between p-4">
              <View className="space-y-4">
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Email</Text>
                  <TextInput
                    className="w-full px-4 py-2 border border-gray-300 rounded-2xl placeholder:text-[12px] placeholder:font-lato-italic"
                    placeholder="e.g. Johndoe@acme.com"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                  />
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-black mb-2 font-lato-bold text-[16px] font-[700]">Password</Text>
                  <View className="flex-row items-center border border-gray-300 rounded-2xl">
                    <TextInput
                      className="flex-1 px-4 py-2"
                      placeholder="Password"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={(text) => handleInputChange('password', text)}
                    />
                    <TouchableOpacity className="px-3" onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlashIcon size={24} color="gray" /> : <EyeIcon size={24} color="gray" />}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Error Message */}
                {errorMessage ? <Text className="text-primary mt-2 mb-2">{errorMessage}</Text> : null}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`w-full py-3 px-4 rounded-2xl ${formStatus === 'loading' ? 'bg-red-300' : 'bg-primary'}`}
                onPress={handleSubmit}
                disabled={formStatus === 'loading'}
              >
                {formStatus === 'loading' ? <ActivityIndicator color="#fff" /> : <Text className="text-white text-center font-bold">Sign In</Text>}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default RegistrationForm;