import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from './UserContext';

/**
 * AuthGuard component that protects routes requiring authentication
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render when authenticated
 * @param {string} props.requiredRole - Optional - specific role required to access the route
 */
const AuthGuard = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading, isTokenExpired } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    // If not loading and either not authenticated or token expired
    if (!isLoading && (!isAuthenticated || isTokenExpired())) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Authentication' }],
      });
      return;
    }

    // Check for required role (if specified)
    if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
      // Redirect based on user role if they don't have the required role
      if (user?.role === 'technician') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'techniciandb' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'userdb' }],
        });
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRole, navigation]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#D2042D" />
      </View>
    );
  }

  // If loading is done and user is authenticated (and has required role if specified)
  if (isAuthenticated && (!requiredRole || user?.role === requiredRole)) {
    return children;
  }

  // This should not render as the useEffect will redirect
  return null;
};

export default AuthGuard;