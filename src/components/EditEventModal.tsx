'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import PaymentGatewayModal from './PaymentGatewayModal';

interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  regStartDate: string;
  regEndDate: string;
  website?: string;
  email?: string;
  contact?: string;
}

interface PaymentGatewayConfig {
  gateway: 'stripe' | 'razorpay' | 'paypal' | 'custom';
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  currency: string;
  isEnabled: boolean;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventData: EventData | null;
  onSave: (updatedData: EventData) => void;
}

export default function EditEventModal({ isOpen, onClose, eventData, onSave }: EditEventModalProps) {
  const [formData, setFormData] = useState<EventData>({
    id: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    regStartDate: '',
    regEndDate: '',
    website: '',
    email: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState<PaymentGatewayConfig>({
    gateway: 'stripe',
    apiKey: '',
    secretKey: '',
    webhookUrl: '',
    currency: 'INR',
    isEnabled: false
  });

  // Update form data when eventData changes
  useEffect(() => {
    if (eventData) {
      setFormData({
        id: eventData.id,
        title: eventData.title || '',
        description: eventData.description || '',
        startDate: eventData.startDate ? new Date(eventData.startDate).toISOString().split('T')[0] : '',
        endDate: eventData.endDate ? new Date(eventData.endDate).toISOString().split('T')[0] : '',
        regStartDate: eventData.regStartDate ? new Date(eventData.regStartDate).toISOString().split('T')[0] : '',
        regEndDate: eventData.regEndDate ? new Date(eventData.regEndDate).toISOString().split('T')[0] : '',
        website: eventData.website || '',
        email: eventData.email || '',
        contact: eventData.contact || ''
      });
    }
  }, [eventData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert date strings back to ISO format
      const updatedData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
        regStartDate: formData.regStartDate ? new Date(formData.regStartDate).toISOString() : '',
        regEndDate: formData.regEndDate ? new Date(formData.regEndDate).toISOString() : ''
      };
      
      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Event</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Event Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Registration Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Start Date *
              </label>
              <input
                type="date"
                name="regStartDate"
                value={formData.regStartDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration End Date (Deadline) *
              </label>
              <input
                type="date"
                name="regEndDate"
                value={formData.regEndDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="+91 1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Payment Gateway Configuration */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Gateway</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentGateway(true)}
                className="text-blue-600 border-blue-600 hover:bg-blue-50"
              >
                Configure Payment Gateway
              </Button>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                {paymentConfig.isEnabled 
                  ? `Payment gateway is enabled (${paymentConfig.gateway.toUpperCase()})`
                  : 'Payment gateway is not configured. Click the button above to set up payment processing.'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Payment Gateway Modal */}
        <PaymentGatewayModal
          isOpen={showPaymentGateway}
          onClose={() => setShowPaymentGateway(false)}
          onSave={(config) => {
            setPaymentConfig(config);
            setShowPaymentGateway(false);
          }}
          currentConfig={paymentConfig}
        />
      </div>
    </div>
  );
} 