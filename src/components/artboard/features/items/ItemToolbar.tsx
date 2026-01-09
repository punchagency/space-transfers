import { MdRotateRight, MdLock, MdLockOpen, MdContentCopy } from "react-icons/md";
import { LuFlipHorizontal } from "react-icons/lu";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosLink } from "react-icons/io";

interface ItemToolbarProps {
  locked: boolean;
  onLink: () => void;
  onRotate: () => void;
  onToggleLock: () => void;
  onFlip: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  position?: 'top' | 'bottom';
}

export default function ItemToolbar({ locked, onLink, onRotate, onToggleLock, onFlip, onDuplicate, onDelete, position = 'top' }: ItemToolbarProps) {
  return (
    <div className={`absolute ${position === 'top' ? '-top-10' : '-bottom-10'} left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/95 border border-gray-200 shadow-xl rounded-lg px-2 py-1`}>
      <button className="p-0.5 text-gray-400 hover:text-black" onClick={(e) => { e.stopPropagation(); onLink(); }}>
        <IoIosLink className="w-4 h-4" />
      </button>
      <span className="w-px h-3 bg-gray-200" />
      <button className="p-0.5 text-gray-400 hover:text-black" onClick={(e) => { e.stopPropagation(); onRotate(); }}>
        <MdRotateRight className="w-4 h-4" />
      </button>
      <span className="w-px h-3 bg-gray-200" />
      <button className="p-0.5 text-gray-400 hover:text-black" onClick={(e) => { e.stopPropagation(); onToggleLock(); }}>
        {locked ? <MdLock className="w-4 h-4" /> : <MdLockOpen className="w-4 h-4" />}
      </button>
      <button className="p-0.5 text-gray-400 hover:text-black" onClick={(e) => { e.stopPropagation(); onFlip(); }}>
        <LuFlipHorizontal className="w-4 h-4" />
      </button>
      <span className="w-px h-3 bg-gray-200" />
      <button className="p-0.5 text-gray-400 hover:text-black" onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
        <MdContentCopy className="w-4 h-4" />
      </button>
      <span className="w-px h-3 bg-gray-200" />
      <button className="p-0.5 text-red-400 hover:text-red-700" onClick={(e) => { e.stopPropagation(); onDelete(); }}>
        <RiDeleteBin5Line className="w-4 h-4" />
      </button>
    </div>
  );
}
