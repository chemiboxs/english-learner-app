import React from 'react';

interface SuccessNotificationProps {
  show: boolean;
}

export const SuccessNotification: React.FC<SuccessNotificationProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-success-pop">
        <div className="
          flex items-center gap-3 px-8 py-4 rounded-full
          bg-success text-on-success
          shadow-soft-lg
        ">
          <span className="text-3xl">✓</span>
          <span className="text-lg font-bold">Awesome!</span>
        </div>
      </div>
    </div>
  );
};
