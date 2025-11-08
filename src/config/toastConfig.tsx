import React from 'react';
import { BaseToast, BaseToastProps, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#D4AF37',
        backgroundColor: '#F5F5DC',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#8B7355',
      }}
      text2Style={{
        fontSize: 14,
        color: '#A0826D',
      }}
    />
  ),
  error: (props: BaseToastProps) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#D2691E',
        backgroundColor: '#FFF8DC',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#8B4513',
      }}
      text2Style={{
        fontSize: 14,
        color: '#A0522D',
      }}
    />
  ),
  info: (props: BaseToastProps) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#DAA520',
        backgroundColor: '#FFFAF0',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#8B7355',
      }}
      text2Style={{
        fontSize: 14,
        color: '#A0826D',
      }}
    />
  ),
};
