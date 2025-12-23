import React from "react";
import { MdShoppingCart } from "react-icons/md";

interface CartItem {
  id: number;
  name: string;
  size: string;
  quantity: number;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  step: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  onNext: () => void;
}

export default function OrderSummary({ cartItems, step, subtotal, shippingCost, tax, total, onNext }: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center gap-2 mb-4">
        <MdShoppingCart className="w-5 h-5 text-blue-600" />
        <h3 className="text-base font-semibold">Order Summary</h3>
      </div>
      
      {step > 0 && (
        <div className="space-y-4 mb-6">
          {cartItems.map(item => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                <div className="text-2xl">👨🚀</div>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900 text-sm">Gang Sheet</div>
                <div className="text-xs text-gray-600">Size: {item.size}</div>
                <div className="text-xs text-gray-600">Quantity: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        {step > 1 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (8%)</span>
              <span className="font-medium">${tax.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${step > 1 ? total.toFixed(2) : subtotal.toFixed(2)}</span>
        </div>
      </div>

      {step < 3 && (
        <button
          onClick={onNext}
          className="w-full mt-4 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {step === 0 ? 'Proceed to Checkout' : step === 1 ? 'Continue to Payment' : 'Place Order'}
        </button>
      )}
    </div>
  );
}
