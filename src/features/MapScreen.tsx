import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, Info, Search, Phone, ShieldCheck } from 'lucide-react';
import { PremiumCard, PremiumButton, cn } from '../components/premium/UI';
import { useUserStore } from '../store/useStore';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons by setting them manually
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const DEFAULT_CENTER: [number, number] = [21.0285, 105.8542]; // Hanoi

// Add this helper component inside MapScreen.tsx
const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 400);
  }, [map]);
  return null;
};

const MapCenterer = ({ center, trigger }: { center: [number, number]; trigger: number }) => {
  const map = useMap();
  useEffect(() => {
    if (trigger > 0) {
      map.flyTo(center, Math.max(map.getZoom(), 15));
    } else {
      map.setView(center, map.getZoom());
    }
  }, [center, trigger, map]);
  return null;
};

const MapScreen: React.FC = () => {
  const { user } = useUserStore();
  const userName = user?.user_metadata?.full_name?.split(' ').pop() || 'tôi';
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>(DEFAULT_CENTER);
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  useEffect(() => {
    // Attempt to get location on load without blocking UI, and watch if successful.
    if ("geolocation" in navigator) {
      console.log("MapScreen: Attempting initial geolocation on load...");
      
      const successCallback = (position: GeolocationPosition) => {
        console.log("MapScreen: Position acquired:", position.coords.latitude, position.coords.longitude);
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setRecenterTrigger(prev => prev + 1);
      };

      const errorCallback = (error: GeolocationPositionError) => {
        console.warn("MapScreen: Geolocation load failed:", error.message);
      };

      // Use a more permissive initial request
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );

      // Start watching only after permission might have been implicitly granted or allowed
      const watchId = navigator.geolocation.watchPosition(
        successCallback,
        errorCallback,
        { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      console.error("MapScreen: Geolocation not supported in this browser.");
    }
  }, []);

  const handleRecenter = () => {
    // Manually trigger a refresh with higher accuracy for user action
    if ("geolocation" in navigator) {
      console.log("MapScreen: Manual recenter requested.");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("MapScreen: Manual position acquired:", position.coords.latitude, position.coords.longitude);
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          setRecenterTrigger(prev => prev + 1);
        },
        (error) => {
          console.error("MapScreen: Manual geolocation error:", error);
          alert("Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí của trình duyệt.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error("MapScreen: Geolocation not supported during manual trigger.");
    }
  };

  return (
    <div className="w-full h-full relative z-0">
      {/* Search Overlay */}
      <div className="absolute top-8 inset-x-6 z-[1000] space-y-3">
        <div className="mr-20 glass rounded-[2rem] p-1.5 flex items-center premium-shadow border-white/50">
          <div className="w-10 h-10 flex items-center justify-center text-slate-400">
             <Search size={20} />
          </div>
          <input 
            placeholder="Tìm người thân, bệnh viện..."
            className="flex-1 bg-transparent py-3 text-sm outline-none font-medium placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <MapFilter label="Tất cả" active />
          <MapFilter label="Người thân" />
          <MapFilter label="Bệnh viện" />
        </div>
      </div>

      {/* Map Implementation */}
      <MapContainer 
        center={userLocation} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <MapCenterer center={userLocation} trigger={recenterTrigger} />
        <Marker 
          position={userLocation}
          eventHandlers={{
            click: () => setSelectedUser({ name: `Vị trí của ${userName}`, status: 'Ở nhà', lastUpdate: 'Vừa xong' })
          }}
        >
          <Popup>Vị trí của tôi</Popup>
        </Marker>
      </MapContainer>

      {/* Bottom Interface */}
      <div className="absolute bottom-32 inset-x-6 z-[1000]">
        <AnimatePresence>
          {selectedUser ? (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
            >
               <PremiumCard className="p-6 relative overflow-hidden">
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"
                  >
                    ×
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border-2 border-primary/20 p-1 flex items-center justify-center bg-primary text-white text-3xl font-bold">
                       T
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xl font-display font-bold text-slate-800">{selectedUser.name}</h4>
                      <p className="text-xs font-bold text-green-500 flex items-center gap-1 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> {selectedUser.status}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PremiumButton className="flex items-center gap-2" variant="outline">
                      <Phone size={18} /> Gọi ngay
                    </PremiumButton>
                    <PremiumButton className="flex items-center gap-2">
                       <Navigation size={18} /> Chỉ đường
                    </PremiumButton>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span>Cập nhật: {selectedUser.lastUpdate}</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-primary" /> Bảo mật 2026</span>
                  </div>
               </PremiumCard>
            </motion.div>
          ) : (
            <div className="flex justify-end gap-4">
               <motion.button 
                 whileTap={{ scale: 0.9 }}
                 onClick={handleRecenter}
                 className="w-14 h-14 bg-white rounded-2xl premium-shadow flex items-center justify-center text-slate-600 border border-slate-100"
               >
                 <MapPin size={24} />
               </motion.button>
               <motion.button 
                 whileTap={{ scale: 0.9 }}
                 onClick={handleRecenter}
                 className="w-14 h-14 bg-primary rounded-2xl premium-shadow flex items-center justify-center text-white"
               >
                 <Navigation size={24} />
               </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .leaflet-container { 
          opacity: 0.9;
        }
        .leaflet-div-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
};

const MapFilter = ({ label, active }: any) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    className={cn(
      "px-5 py-2.5 rounded-full whitespace-nowrap font-bold text-xs shadow-lg border transition-all",
      active 
        ? "bg-slate-900 text-white border-slate-800" 
        : "bg-white/80 text-slate-600 border-white/50 backdrop-blur-md"
    )}
  >
    {label}
  </motion.button>
);

export default MapScreen;
