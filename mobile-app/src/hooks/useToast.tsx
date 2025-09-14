import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastConfig } from '@/components/Toast';

interface ToastContextType {
  showToast: (config: ToastConfig) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastConfig, setToastConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((config: ToastConfig) => {
    setToastConfig(config);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
    setTimeout(() => setToastConfig(null), 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toastConfig && (
        <Toast
          {...toastConfig}
          visible={visible}
          onHide={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};