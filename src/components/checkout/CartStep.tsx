import React from "react";
 import { RiDeleteBin5Line } from "react-icons/ri";

interface CartItem {
  id: number;
  name: string;
  size: string;
  color: string;
  design: string;
  print: string;
  price: number;
  quantity: number;
}

interface CartStepProps {
  cartItems: CartItem[];
  updateQuantity: (id: number, change: number) => void;
  removeItem: (id: number) => void;
}

export default function CartStep({ cartItems, updateQuantity, removeItem }: CartStepProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Cart ({cartItems.length})</h3>
      <div className="space-y-6">
        {cartItems.map(item => (
          <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-200 last:border-0">
            <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
              <div className="text-4xl">👨🚀</div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{item.name}</h4>
                  <div className="text-sm text-gray-600 mt-1">Size: {item.size}</div>
                  <div className="text-sm text-gray-600">Color: {item.color}</div>
                  <div className="text-sm text-gray-600">Design: {item.design}</div>
                  <div className="text-sm text-gray-600">Print: {item.print}</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-right">${item.price}</div>
                  <div className="flex flex-col items-end gap-2 mt-2">
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-r border-gray-300"
                      >
                        −
                      </button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50 border-l border-gray-300"
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <RiDeleteBin5Line className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
