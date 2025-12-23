import React from "react";
import { MdLocationOn, MdCheckCircle } from "react-icons/md";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface CheckoutStepProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

export default function CheckoutStep({ formData, setFormData }: CheckoutStepProps) {
  return (
    <>
      <div className="bg-white rounded-lg border mb-5 border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MdLocationOn className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold">Customer Information</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name *</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name *</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border mb-5 border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MdLocationOn className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold">Shipping Address</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Street Address *</label>
            <input 
              type="text" 
              value={formData.street}
              onChange={(e) => setFormData({...formData, street: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input 
                type="text" 
                value={formData.city}
                onChange={(e) => setFormData({...formData, city: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State / Province *</label>
              <input 
                type="text" 
                value={formData.state}
                onChange={(e) => setFormData({...formData, state: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Postal Code *</label>
              <input 
                type="text" 
                value={formData.postalCode}
                onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country *</label>
              <input 
                type="text" 
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Design Validation</h3>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Review Warnings</span>
        </div>
        <div className="space-y-2">
          <h4 className="font-medium text-sm">DTF Printing Guidelines</h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 text-green-600" />
              <span>Minimum resolution: 150 DPI (300 DPI recommended)</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 text-green-600" />
              <span>Maximum print area: 12" x 16" for standard transfers</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 text-green-600" />
              <span>Supported formats: PNG, PSD, AI, PDF with transparency</span>
            </div>
            <div className="flex items-center gap-2">
              <MdCheckCircle className="w-4 h-4 text-green-600" />
              <span>Color mode: CMYK preferred, RGB will be converted</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
