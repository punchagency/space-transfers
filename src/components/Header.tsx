import React from "react";
import { MdOutlineShoppingCart, MdMenu } from "react-icons/md";

type HeaderInfo = {
  hasItem: boolean;
  areaSf?: number;
  widthIn?: number;
  heightIn?: number;
  name?: string;
  price?: number;
  imageNames?: string[];
};

export default function Header({ info, onMenuClick, onCartClick, cartCount, onAddGangSheetToCart }: { info?: HeaderInfo; onMenuClick?: () => void; onCartClick?: () => void; cartCount?: number; onAddGangSheetToCart?: () => void }) {
  return (
    <header className="flex items-center justify-between px-6 h-10 bg-white border-b border-gray-200">
      <div className="flex items-center ">
        <span className="text-xl font-bold tracking-tight text-slate-900">
          spacetransfers
        </span>
        <img src="/space.svg" alt="space" className="w-12 h-12" />
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-800">
          <span>{(info?.areaSf ?? 3.25).toFixed(2)}sf</span>
          <span className="text-gray-300">|</span>
          <span>
            {(info?.widthIn ?? 24).toFixed(2)}in wide x {(info?.heightIn ?? 19.5).toFixed(2)}in long
          </span>
          <span className="text-gray-300">|</span>
          <span className="font-medium max-w-xs truncate" title={info?.imageNames?.join(', ')}>
            {info?.imageNames && info.imageNames.length > 0
              ? info.imageNames.length <= 3
                ? info.imageNames.join(', ')
                : `${info.imageNames.slice(0, 2).join(', ')} + ${info.imageNames.length - 2} more`
              : 'Gang Sheet'}
          </span>
          <span className="text-gray-300">|</span>
          <span>${(info?.price ?? 0).toFixed(2)}</span>
        </div>
        <button
          onClick={onAddGangSheetToCart}
          className="px-3  text-sm font-medium  text-black bg-white border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
        >
          Add to Cart
        </button>

        <button
          onClick={onCartClick}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative"
        >
          <MdOutlineShoppingCart size={24} />
          {cartCount !== undefined && cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
              {cartCount}
            </span>
          )}
        </button>

        <button
          onClick={onMenuClick}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <MdMenu size={24} />
        </button>
      </div>
    </header>
  );
}
