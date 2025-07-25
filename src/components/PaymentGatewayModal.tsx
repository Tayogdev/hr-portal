'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';

interface PaymentGatewayConfig {
  gateway: 'stripe' | 'razorpay' | 'paypal' | 'custom';
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  currency: string;
  isEnabled: boolean;
}

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PaymentGatewayConfig) => void;
  currentConfig?: PaymentGatewayConfig;
}

export default function PaymentGatewayModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentConfig 
}: PaymentGatewayModalProps) {
  const [config, setConfig] = useState<PaymentGatewayConfig>(
    currentConfig || {
      gateway: 'stripe',
      apiKey: '',
      secretKey: '',
      webhookUrl: '',
      currency: 'INR',
      isEnabled: false
    }
  );
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setConfig(prev => ({ ...prev, [name]: checked }));
    } else {
      setConfig(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('Error saving payment gateway config:', error);
      alert('Failed to save payment gateway configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Payment Gateway Configuration</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Enable Payment Gateway */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="isEnabled"
                checked={config.isEnabled}
                onChange={handleInputChange}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Enable Payment Gateway</span>
            </label>
          </div>

          {config.isEnabled && (
            <>
              {/* Payment Gateway Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Gateway *
                </label>
                <select
                  name="gateway"
                  value={config.gateway}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="stripe">Stripe</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="paypal">PayPal</option>
                  <option value="custom">Custom Gateway</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency *
                </label>
                <select
                  name="currency"
                  value={config.currency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>

              {/* API Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key *
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    value={config.apiKey}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Key *
                  </label>
                  <input
                    type="password"
                    name="secretKey"
                    value={config.secretKey}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your secret key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook URL
                </label>
                <input
                  type="url"
                  name="webhookUrl"
                  value={config.webhookUrl}
                  onChange={handleInputChange}
                  placeholder="https://yourdomain.com/api/webhook"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: For payment status notifications
                </p>
              </div>

              {/* Gateway-specific instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  {config.gateway === 'stripe' && 'Stripe Configuration'}
                  {config.gateway === 'razorpay' && 'Razorpay Configuration'}
                  {config.gateway === 'paypal' && 'PayPal Configuration'}
                  {config.gateway === 'custom' && 'Custom Gateway Configuration'}
                </h3>
                <p className="text-sm text-blue-700">
                  {config.gateway === 'stripe' && 
                    'Get your API keys from the Stripe Dashboard. Make sure to use test keys for development.'}
                  {config.gateway === 'razorpay' && 
                    'Get your API keys from the Razorpay Dashboard. Use test mode keys for development.'}
                  {config.gateway === 'paypal' && 
                    'Get your API credentials from the PayPal Developer Dashboard. Use sandbox credentials for testing.'}
                  {config.gateway === 'custom' && 
                    'Configure your custom payment gateway integration. Ensure proper error handling and security measures.'}
                </p>
              </div>
            </>
          )}

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
              {loading ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 