import { useState, useEffect } from "react";
import Header from "./components/Header";
import Artboard from "./components/Artboard";
import Sidebar from "./components/Sidebar";
import SaveGangSheetModal from "./components/modals/SaveGangSheetModal";
import LoadGangSheetModal from "./components/modals/LoadGangSheetModal";
import AccountSettingsModal from "./components/modals/AccountSettingsModal";
import OrderHistoryModal from "./components/modals/OrderHistoryModal";
import OrderDetailsModal from "./components/modals/OrderDetailsModal";
import CheckoutModal from "./components/modals/CheckoutModal";
import { captureArtboard } from "./components/artboard/lib/utils";

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [headerInfo, setHeaderInfo] = useState<{
    hasItem: boolean;
    areaSf?: number;
    widthIn?: number;
    heightIn?: number;
    name?: string;
    price?: number;
  }>();
  const [savedDesigns, setSavedDesigns] = useState<Array<{
    id: number;
    title: string;
    time: string;
    size: string;
    thumbnail: string;
    data?: any;
  }>>([]);
  const [artboardData, setArtboardData] = useState<any>(null);
  const [loadedDesignData, setLoadedDesignData] = useState<any>(null);
  const [cartWarning, setCartWarning] = useState<string | null>(null);

  // Settings State lifted from Sidebar
  const [settings, setSettings] = useState({
    showGrid: true,
    showRulers: true,
    showMargins: false,
    snapToGrid: false,
    autoNestStickers: false,
    spacing: 0.1,
    marginSize: 0.15,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleAddGangSheetToCart = async () => {
    try {
      // Prevent adding duplicate gang sheet to cart
      const existingGangSheet = cartItems.find(item => item.type === 'gangsheet');
      if (existingGangSheet) {
        setCartWarning('This gang sheet has already been added to your cart.');
        setTimeout(() => setCartWarning(null), 8000);
        return;
      }

      // Add gang sheet without image first
      const gangSheetItem = {
        id: Date.now(),
        name: 'Gang Sheet',
        type: 'gangsheet',
        image: '/placeholder-gangsheet.png',
        items: artboardData?.items || [],
        price: headerInfo?.price || 0,
        widthIn: headerInfo?.widthIn || 24,
        heightIn: headerInfo?.heightIn || 19.5,
        size: `${(headerInfo?.widthIn || 24).toFixed(1)}" × ${(headerInfo?.heightIn || 19.5).toFixed(1)}"`,
        copies: 1,
        color: 'N/A',
        design: 'Custom Gang Sheet',
        print: 'DTF Transfer',
      };
      setCartItems(prev => [...prev, gangSheetItem]);

      // Try to capture image in background
      try {
        const imageDataUrl = await captureArtboard();
        setCartItems(prev => prev.map(item =>
          item.id === gangSheetItem.id ? { ...item, image: imageDataUrl } : item
        ));
      } catch (captureError) {
        console.warn('Image capture failed, using placeholder:', captureError);
      }
    } catch (error) {
      console.error('Failed to add gang sheet:', error);
      alert('Failed to add gang sheet to cart');
    }
  };

  useEffect(() => {
    if (showHome) return;

    // Frame 0: Logo (2s)
    // Frame 1: Blank/Transition (0.5s)
    // Frame 2: Tagline (3s)
    // End -> Home

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    timeouts.push(setTimeout(() => setCurrentFrame(1), 2000));
    timeouts.push(setTimeout(() => setCurrentFrame(2), 2500));
    timeouts.push(setTimeout(() => setShowHome(true), 5500));

    return () => timeouts.forEach(clearTimeout);
  }, [showHome]);

  if (showHome) {
    return (
      <div className="relative flex flex-col h-screen w-screen bg-white">
        <Header
          info={headerInfo}
          onMenuClick={() => setIsSidebarOpen(true)}
          onCartClick={() => setShowCheckoutModal(true)}
          cartCount={cartItems.length}
          onAddGangSheetToCart={handleAddGangSheetToCart}
        />
        {cartWarning && (
          <div className="absolute mt-10 top-10 left-1/2 -translate-x-1/2 z-50">
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-500 px-4 py-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <p
                style={{
                  fontFamily: "Roboto",
                  fontWeight: 500,
                  fontSize: "13px",
                  lineHeight: "20px",
                  letterSpacing: "0px",
                  color: "#1D4ED8",

                }}
              >
                {cartWarning}
              </p>
            </div>
          </div>
        )}
        <Artboard
          onHeaderInfoChange={setHeaderInfo}
          showRulers={settings.showRulers}
          showGrid={settings.showGrid}
          snapToGrid={settings.snapToGrid}
          showMargins={settings.showMargins}
          marginSize={settings.marginSize}
          autoNestStickers={settings.autoNestStickers}
          spacing={settings.spacing}
          onDataChange={setArtboardData}
          initialData={loadedDesignData}
          onAddToCart={(item) => setCartItems(prev => [...prev, item])}
        />
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          settings={settings}
          onUpdateSetting={updateSetting}
          onOpenSaveModal={() => { setShowSaveModal(true); setIsSidebarOpen(false); }}
          onOpenLoadModal={() => { setShowLoadModal(true); setIsSidebarOpen(false); }}
          onOpenAccountModal={() => { setShowAccountModal(true); setIsSidebarOpen(false); }}
        />
        <SaveGangSheetModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          artboardData={artboardData}
          onSave={(title: string, thumbnail: string, data: any) => {
            const newDesign = {
              id: Date.now(),
              title,
              time: 'Just now',
              size: '24" × 19.5"',
              thumbnail,
              data
            };
            setSavedDesigns(prev => [newDesign, ...prev]);
            setShowSaveModal(false);
          }}
        />
        <LoadGangSheetModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          designs={savedDesigns}
          onLoad={(id) => {
            const design = savedDesigns.find(d => d.id === id);
            if (design && design.data) {
              setLoadedDesignData(design.data);
              setShowLoadModal(false);
            }
          }}
          onRename={(id, newTitle) => {
            setSavedDesigns(prev => prev.map(d => d.id === id ? { ...d, title: newTitle } : d));
          }}
          onDuplicate={(id) => {
            const design = savedDesigns.find(d => d.id === id);
            if (design) {
              const newDesign = { ...design, id: Date.now(), title: `${design.title} (Copy)`, time: 'Just now' };
              setSavedDesigns(prev => [newDesign, ...prev]);
            }
          }}
          onDelete={(id) => {
            setSavedDesigns(prev => prev.filter(d => d.id !== id));
          }}
        />
        <AccountSettingsModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onOpenOrderHistory={() => {
            setShowAccountModal(false);
            setShowOrderHistoryModal(true);
          }}
          onViewOrderDetails={() => {
            setShowAccountModal(false);
            setShowOrderDetailsModal(true);
          }}
        />
        <OrderHistoryModal
          isOpen={showOrderHistoryModal}
          onClose={() => setShowOrderHistoryModal(false)}
          onViewDetails={() => {
            setShowOrderHistoryModal(false);
            setShowOrderDetailsModal(true);
          }}
        />
        <OrderDetailsModal
          isOpen={showOrderDetailsModal}
          onClose={() => setShowOrderDetailsModal(false)}
        />
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          cartItems={cartItems}
        />
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/space-bg.png')" }}
      />
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/space-bg.png"
      >
        <source src="/space-video.mov" />
      </video>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {currentFrame === 0 && (
          <div className="flex items-center gap-3">
            <span className="text-3xl md:text-[63px] font-bold text-white tracking-wide font-sans shimmer-text fade-in-out-2s-effects">
              spacetransfers
            </span>
            <img
              src="/space-facing-left.svg"
              alt="space"
              className="w-10 h-10 md:w-26 md:h-26 animate-bounce"
            />
          </div>
        )}

        {currentFrame === 2 && (
          <div className="px-10 text-center">
            <h1 className="text-3xl md:text-[63px] font-extrabold text-white drop-shadow-lg leading-tight shimmer-text fade-in-out-3s-effects whitespace-nowrap">
              DTF Transfer that are out of this world
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
