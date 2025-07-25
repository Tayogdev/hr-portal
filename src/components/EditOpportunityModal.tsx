'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface OpportunityData {
  id: string;
  role: string;
  title: string;
  department: string;
  location: string;
  description: string;
  stipend: string;
  vacancies: number;
  maxParticipants: number;
  regStartDate: string;
  regEndDate: string;
}

interface EditOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityData: OpportunityData | null;
  onSave: (updatedData: OpportunityData) => void;
}

export default function EditOpportunityModal({ isOpen, onClose, opportunityData, onSave }: EditOpportunityModalProps) {
  const [formData, setFormData] = useState<OpportunityData>({
    id: '',
    role: '',
    title: '',
    department: '',
    location: '',
    description: '',
    stipend: '',
    vacancies: 1,
    maxParticipants: 1,
    regStartDate: '',
    regEndDate: ''
  });
  const [loading, setLoading] = useState(false);

  // Update form data when opportunityData changes
  useEffect(() => {
    if (opportunityData) {
      console.log('EditOpportunityModal received data:', opportunityData);
      setFormData({
        id: opportunityData.id,
        role: opportunityData.role || '',
        title: opportunityData.title || '',
        department: opportunityData.department || '',
        location: opportunityData.location || '',
        description: opportunityData.description || '',
        stipend: opportunityData.stipend || '',
        vacancies: opportunityData.vacancies || 1,
        maxParticipants: opportunityData.maxParticipants || 1,
        regStartDate: opportunityData.regStartDate ? new Date(opportunityData.regStartDate).toISOString().split('T')[0] : '',
        regEndDate: opportunityData.regEndDate ? new Date(opportunityData.regEndDate).toISOString().split('T')[0] : ''
      });
    }
  }, [opportunityData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Convert date strings back to ISO format
      const updatedData = {
        ...formData,
        regStartDate: formData.regStartDate ? new Date(formData.regStartDate).toISOString() : '',
        regEndDate: formData.regEndDate ? new Date(formData.regEndDate).toISOString() : '',
      };
      
      await onSave(updatedData);
      onClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      alert('Failed to save opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Edit Job Opportunity</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Role *
              </label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stipend (₹)
              </label>
              <input
                type="text"
                name="stipend"
                value={formData.stipend}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Compensation and Positions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vacancies *
              </label>
              <input
                type="number"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleInputChange}
                min="1"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
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
                Registration End Date *
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
      </div>
    </div>
  );
} 