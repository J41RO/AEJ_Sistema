import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

export default function BackendStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const checkBackendStatus = async () => {
    try {
      // Use environment variable or detect backend URL
      const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.1.137:8000';
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        timeout: 3000,
      });
      
      if (response.ok) {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkBackendStatus();

    // Set up interval to check every 5 seconds
    const interval = setInterval(checkBackendStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="outline" className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-xs">Verificando...</span>
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`flex items-center space-x-1 ${
        isConnected 
          ? 'border-green-200 bg-green-50 text-green-800' 
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
    >
      {isConnected ? (
        <>
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <Wifi className="w-3 h-3" />
          <span className="text-xs font-medium">Conectado</span>
        </>
      ) : (
        <>
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <WifiOff className="w-3 h-3" />
          <span className="text-xs font-medium">Desconectado</span>
        </>
      )}
    </Badge>
  );
}