'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyButtonProps {
  emergencyContacts?: Array<{
    name: string;
    phone: string;
  }>;
  className?: string;
}

export function EmergencyButton({ 
  emergencyContacts = [
    { name: 'Mom', phone: 'tel:+1234567890' },
    { name: 'Dad', phone: 'tel:+1234567890' },
    { name: '911', phone: 'tel:911' }
  ],
  className 
}: EmergencyButtonProps) {
  const [showContacts, setShowContacts] = useState(false);
  
  const handleEmergencyCall = (phone: string) => {
    window.location.href = phone;
    setShowContacts(false);
  };
  
  return (
    <>
      {/* Emergency Button */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50",
        className
      )}>
        <Button
          variant="outline"
          size="lg"
          className="bg-red-100 hover:bg-red-200 border-red-300 text-red-700 rounded-full shadow-lg"
          onClick={() => setShowContacts(true)}
        >
          <Phone className="w-5 h-5 mr-2" />
          Emergency
        </Button>
      </div>
      
      {/* Emergency Contacts Modal */}
      {showContacts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Emergency Contacts</h2>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => setShowContacts(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-lg font-medium border-2 hover:bg-red-50 hover:border-red-300"
                  onClick={() => handleEmergencyCall(contact.phone)}
                >
                  <Phone className="w-6 h-6 mr-3 text-red-600" />
                  Call {contact.name}
                </Button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Only use in real emergencies
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}