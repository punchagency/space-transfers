import { useState, useEffect } from "react";
import Header from "./components/Header";
import Artboard from "./components/Artboard";
import Sidebar from "./components/Sidebar";
import SaveGangSheetModal from "./components/modals/SaveGangSheetModal";
import LoadGangSheetModal from "./components/modals/LoadGangSheetModal";
import AccountSettingsModal from "./components/modals/AccountSettingsModal";

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
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
  }>>([]);

  // Settings State lifted from Sidebar
  const [settings, setSettings] = useState({
    showGrid: true,
    showRulers: true,
    showMargins: false,
    snapToGrid: false,
    autoNestStickers: false,
    spacing: 0.6,
    marginSize: 0.25,
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
      <div className="flex flex-col h-screen w-screen bg-white">
        <Header info={headerInfo} onMenuClick={() => setIsSidebarOpen(true)} />
        <Artboard onHeaderInfoChange={setHeaderInfo} showRulers={settings.showRulers} showGrid={settings.showGrid} snapToGrid={settings.snapToGrid} showMargins={settings.showMargins} marginSize={settings.marginSize} autoNestStickers={settings.autoNestStickers} spacing={settings.spacing} />
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
          onSave={(title: string, thumbnail: string) => {
            const newDesign = {
              id: Date.now(),
              title,
              time: 'Just now',
              size: '24" × 19.5"',
              thumbnail
            };
            setSavedDesigns(prev => [newDesign, ...prev]);
            setShowSaveModal(false);
          }}
        />
        <LoadGangSheetModal 
          isOpen={showLoadModal} 
          onClose={() => setShowLoadModal(false)}
          designs={savedDesigns}
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
        <AccountSettingsModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
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
