import React from "react";
import { MdClose, MdInventory, MdLogout, MdPersonAdd } from "react-icons/md";

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative px-5 pt-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Settings
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account and subscription
          </p>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <MdClose className="h-5 w-5" />
          </button>
        </div>

        {/* Current Account */}
        <div className="mt-5 flex items-center gap-4 px-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-medium">
            BA
          </div>
          <div>
            <p className="font-medium text-gray-900">Brandon Alex</p>
            <p className="text-sm text-gray-500">Brandonalex@example.com</p>
          </div>
        </div>

        <div className="my-4 border-t border-gray-200" />

        {/* Other Accounts */}
        <div className="px-5">
          <p className="mb-2 text-sm font-medium text-gray-500">
            Other Accounts
          </p>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-white text-sm font-medium">
                AB
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Alex Brandon
                </p>
                <p className="text-xs text-gray-500">alexbrandon@example.com</p>
              </div>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:underline">
              Switch
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="mt-4 px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
              <MdInventory className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Order History</p>
              <p className="text-xs text-gray-500">
                View past orders and invoices
              </p>
            </div>
          </div>
        </div>

        <div className="my-4 border-t border-gray-200" />

        {/* Actions */}
        <div className="space-y-3 px-5 pb-5">
          <button className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <MdPersonAdd className="h-5 w-5" />
            Add Account
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-red-600">
            <MdLogout className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
