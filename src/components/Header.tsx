import React from "react";
import { MdOutlineShoppingCart, MdMenu } from "react-icons/md";

type HeaderInfo = {
    hasItem: boolean;
    areaSf?: number;
    widthIn?: number;
    heightIn?: number;
    name?: string;
    price?: number;
};

export default function Header({ info, onMenuClick }: { info?: HeaderInfo; onMenuClick?: () => void }) {
    return (
        <header className="flex items-center justify-between px-6 h-10 bg-white border-b border-gray-200">
            <div className="flex items-center ">
                <span className="text-xl font-bold tracking-tight text-slate-900">
                    spacetransfers
                </span>
                <img src="/space.svg" alt="space" className="w-12 h-12" />
            </div>

            <div className="flex items-center gap-4">
                {info?.hasItem && (
                    <div className="hidden md:flex items-center gap-3 text-sm text-gray-800">
                        <span>{(info.areaSf ?? 0).toFixed(2)}sf</span>
                        <span className="text-gray-300">|</span>
                        <span>
                            {(info.widthIn ?? 0).toFixed(2)}in wide x{" "}
                            {(info.heightIn ?? 0).toFixed(2)}in long
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="font-medium">
                            {(info.name ?? "").replace(/\.[^/.]+$/, "")}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>${(info.price ?? 0).toFixed(2)}</span>
                    </div>
                )}
                <button
                    className={
                        info?.hasItem
                            ? "px-4  text-sm font-medium bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            : "px-4  text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                    }
                >
                    {info?.hasItem ? "Export" : "Add to cart"}
                </button>

                <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <MdOutlineShoppingCart size={24} />
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
