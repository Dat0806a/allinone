import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserStore } from '../store/useStore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getAudioContext, unlockAudio } from '../lib/audio';

export interface Medication {
  id: string;
  name: string;
  dose: string;
  times: string[];
  startDate?: string;
  endDate?: string;
  note: string;
  color: string;
  icon: string;
  days?: string[];
}

export interface TakenRecord {
  medId: string;
  time: string;
  date: string; // YYYY-MM-DD
  takenAt: number;
}

export interface AlarmState {
  active: boolean;
  meds: Medication[];
  time: string;
}

const STORAGE_KEY_MEDS = 'health_meds';
const STORAGE_KEY_RECORDS = 'health_med_records';
const VAPID_PUBLIC_KEY = "BDRowhnQAVmonH9Zhp0YD7eTWrkUciN5WYjfvdvyX0HLfLeaUEYh3D-e9B96fUKhfxSIOrGplKfDD13upjZMqCs";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const DEFAULT_MEDICS: Medication[] = [];

export function useMedications() {
  const { user } = useUserStore();
  const userId = user?.id || null;
  const getMedsKey = () => `${STORAGE_KEY_MEDS}_${userId || 'anon'}`;
  const getRecordsKey = () => `${STORAGE_KEY_RECORDS}_${userId || 'anon'}`;
  
  const getLocalDateStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [medicines, setMedicines] = useState<Medication[]>([]);
  const [records, setRecords] = useState<TakenRecord[]>([]);
  const [alarm, setAlarm] = useState<AlarmState>({ active: false, meds: [], time: '' });
  
  const oscillatorRefs = useRef<any[]>([]);
  const vibrateIntervalRef = useRef<any>(null);

  // Load initial data
  useEffect(() => {
    let active = true;

    const fetchMeds = async () => {
      // If no user, stay empty
      if (!userId) {
        setMedicines([]);
        return;
      }

      if (isSupabaseConfigured) {
        try {
          console.log("Fetching medications from medication_schedules...");
          const { data, error } = await supabase
            .from('medication_schedules')
            .select('*')
            .eq('user_id', userId);
          
          if (!active) return;
          if (error) console.error("Supabase fetch error:", error);

          if (!error && data) {
            const mapped = data.map(m => {
              const startDate = m.start_date ? m.start_date.substring(0, 10) : undefined;
              const endDate = m.end_date ? m.end_date.substring(0, 10) : undefined;
              return {
                id: m.id,
                name: m.medicine_name,
                dose: m.dosage || '',
                times: Array.isArray(m.times) ? m.times : [],
                days: Array.isArray(m.days) ? m.days : [],
                note: m.note || '',
                icon: m.icon || '💊',
                color: m.color || 'bg-gray-50',
                startDate,
                endDate
              };
            });
            setMedicines(mapped);
            localStorage.setItem(getMedsKey(), JSON.stringify(mapped));
            return;
          }
        } catch (e) {
          console.error("Failed to fetch meds from Supabase", e);
        }
      }

      // Fallback to local storage (no mock data fallback)
      const storedMeds = localStorage.getItem(getMedsKey());
      if (active) {
        if (storedMeds) {
          try {
            const parsed = JSON.parse(storedMeds);
            setMedicines(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            setMedicines([]);
          }
        } else {
          setMedicines([]);
        }
      }
    };

    fetchMeds();
    
    const fetchRecords = async () => {
      if (userId && isSupabaseConfigured) {
        try {
          const { data } = await supabase.from('medication_records').select('*').eq('user_id', userId);
          if (!active) return;
          if (data && data.length > 0) {
            const mappedRecords = data.map(r => {
              const date = new Date(r.taken_at);
              const y = date.getFullYear();
              const m = String(date.getMonth() + 1).padStart(2, '0');
              const d = String(date.getDate()).padStart(2, '0');
              return {
                medId: r.medication_id,
                time: r.medication_name?.split('|')[1] || '',
                date: `${y}-${m}-${d}`,
                takenAt: date.getTime()
              };
            });
            setRecords(mappedRecords);
            localStorage.setItem(getRecordsKey(), JSON.stringify(mappedRecords));
            return;
          }
        } catch (e) {
          console.error("Failed to fetch records from Supabase", e);
        }
      }
      
      const storedRecords = localStorage.getItem(getRecordsKey());
      if (active && storedRecords) {
        setRecords(JSON.parse(storedRecords));
      }
    };
    fetchRecords();

    return () => { active = false; };
  }, [userId, isSupabaseConfigured]);

  const addMedication = async (med: Omit<Medication, 'id'>) => {
    const medToSave = {
      ...med,
      days: Array.isArray(med.days) ? med.days : [],
      times: Array.isArray(med.times) ? med.times : [],
    };

    let finalMed: Medication | null = null;

    if (userId && isSupabaseConfigured) {
      try {
        // Prepare data for Supabase, handling empty dates as null
        const supabaseData = {
          user_id: userId,
          medicine_name: medToSave.name,
          dosage: medToSave.dose,
          times: medToSave.times,
          days: medToSave.days,
          note: medToSave.note,
          icon: medToSave.icon,
          color: medToSave.color,
          start_date: medToSave.startDate || null,
          end_date: medToSave.endDate || null
        };

        console.log("Preparing to insert medication:", supabaseData);

        const { data, error } = await supabase
          .from('medication_schedules')
          .insert([supabaseData])
          .select()
          .single();
        
        console.log("Supabase insert response:", { data, error });
        
        if (data && !error) {
          finalMed = {
            id: data.id,
            name: data.medicine_name,
            dose: data.dosage || '',
            times: Array.isArray(data.times) ? data.times : [],
            days: Array.isArray(data.days) ? data.days : [],
            note: data.note || '',
            icon: data.icon || '💊',
            color: data.color || 'bg-gray-50',
            startDate: data.start_date ? data.start_date.substring(0, 10) : undefined,
            endDate: data.end_date ? data.end_date.substring(0, 10) : undefined
          };
        } else if (error) {
          console.error("Supabase Medication Save Error:", error.message, error.details);
          // Don't throw, we will fallback to local
        }
      } catch (e: any) {
        console.error("Supabase Medication Save Exception:", e);
      }
    }
    
    // Fallback to local if Supabase failed or not configured
    if (!finalMed) {
      finalMed = { 
        ...medToSave, 
        id: `local-${Date.now()}` 
      };
    }

    setMedicines(prev => {
      const updated = [...prev, finalMed!];
      localStorage.setItem(getMedsKey(), JSON.stringify(updated));
      return updated;
    });
  };

  const removeMedication = async (id: string) => {
    if (userId && isSupabaseConfigured) {
      try {
        console.log("Deleting medication:", id);
        const { error } = await supabase.from('medication_schedules').delete().eq('id', id);
        if (error) console.error("Error deleting medication:", error);
      } catch (e) {
        console.error("Failed to delete med from Supabase", e);
      }
    }
    setMedicines(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem(getMedsKey(), JSON.stringify(updated));
      return updated;
    });
  };

  const markTaken = async (medId: string, time: string, date: string) => {
    setRecords(prev => {
      const existing = prev.find(r => r.medId === medId && r.time === time && r.date === date);
      let next;
      
      if (existing) {
        next = prev.filter(r => !(r.medId === medId && r.time === time && r.date === date));
        if (userId && isSupabaseConfigured) {
          supabase.from('medication_records')
            .delete()
            .match({ medication_id: medId, user_id: userId })
            .then(({ error }) => { if (error) console.error("Supabase record delete error", error); });
        }
      } else {
        const newRec = { medId, time, date, takenAt: Date.now() };
        next = [...prev, newRec];
        if (userId && isSupabaseConfigured) {
          const med = medicines.find(m => m.id === medId);
          supabase.from('medication_records').insert([{
            user_id: userId,
            medication_id: medId,
            medication_name: `${med?.name || 'Unknown'}|${time}`,
            taken_at: new Date().toISOString()
          }]).then(({ error }) => { if (error) console.error("Supabase record insert error", error); });
        }
      }
      
      localStorage.setItem(getRecordsKey(), JSON.stringify(next));
      return next;
    });
  };


  const isTaken = (medId: string, time: string, date: string) => {
    return records.some(r => r.medId === medId && r.time === time && r.date === date);
  };

  // Setup Notification permission & Push Subscription
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    let permission = Notification.permission;
    if (permission !== 'granted' && permission !== 'denied') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted' && userId) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });

        await supabase.from('push_subscriptions').insert([{
          user_id: userId,
          subscription: subscription.toJSON()
        }]);
        console.log("Push subscription saved to Supabase");
      } catch (e) {
        console.error("Failed to subscribe & save push notifications", e);
      }
    }
  };

  const startGentleAlarm = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      
      // Attempt to resume if suspended (will only work if called during a gesture)
      // Since this might be called by an interval, we just skip creation if null.
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // Clear any previous ongoing alarms
      stopGentleAlarm();

      // Soft gentle chime sequence
      const playChimeSequence = () => {
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const now = ctx.currentTime;
        // E-Major arpeggio for a calming, positive feeling
        const notes = [659.25, 830.61, 987.77, 1318.51];
        
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          osc.type = 'sine'; // Softest waveform
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          
          gainNode.gain.setValueAtTime(0, now + idx * 0.15);
          // Soft attack
          gainNode.gain.linearRampToValueAtTime(0.15, now + idx * 0.15 + 0.05);
          // Long, gentle decay
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 2.5);
          
          osc.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 2.5);
        });
      };

      // Play immediately
      playChimeSequence();

      // Loop every 4 seconds
      const chimeInterval = setInterval(playChimeSequence, 4000);

      // Gentle vibration pattern
      const vibInterval = setInterval(() => {
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 100, 100]); // Two short light buzzes
        }
      }, 4000);

      oscillatorRefs.current = [chimeInterval];
      vibrateIntervalRef.current = vibInterval;
    } catch (e) {
      console.log('Audio disabled without interaction');
    }
  }, []);

  const stopGentleAlarm = useCallback(() => {
    if (oscillatorRefs.current.length > 0) {
      const [chimeInterval] = oscillatorRefs.current;
      clearInterval(chimeInterval);
      oscillatorRefs.current = [];
    }
    if (vibrateIntervalRef.current) {
      clearInterval(vibrateIntervalRef.current);
      vibrateIntervalRef.current = null;
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }
  }, []);

  // Scheduler interval
  useEffect(() => {
    let lastCheckedMinute = -1;

    const checkAlarms = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${h}:${m}`;
      
      if (now.getMinutes() === lastCheckedMinute) return;
      lastCheckedMinute = now.getMinutes();

      const dateStr = getLocalDateStr();
      const currentDayName = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"][now.getDay()];

      // Ensure we compare strings properly (normalize to 10 chars YYYY-MM-DD)
      const normalizedDateStr = dateStr.substring(0, 10);

      const dueMeds = medicines.filter(med => {
        const mStart = med.startDate ? med.startDate.substring(0, 10) : "";
        const mEnd = med.endDate ? med.endDate.substring(0, 10) : "";

        // Date check
        if (mStart && normalizedDateStr < mStart) return false;
        if (mEnd && normalizedDateStr > mEnd) return false;
        
        // Days check (if empty, assume every day)
        if (med.days && med.days.length > 0 && !med.days.includes(currentDayName)) return false;

        // Time check
        return med.times.includes(currentTimeStr) && !isTaken(med.id, currentTimeStr, dateStr);
      });

      if (dueMeds.length > 0) {
        // Trigger alarm
        setAlarm({ active: true, meds: dueMeds, time: currentTimeStr });
        startGentleAlarm();
        
        // Show web notification via Service Worker if available
        if ('Notification' in window && Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification("Đến giờ uống thuốc", {
              body: dueMeds.map(m => m.name).join(', '),
              icon: '/vite.svg',
              requireInteraction: true,
              vibrate: [200, 100, 200],
              actions: [
                { action: 'take', title: 'Đã uống' },
                { action: 'snooze', title: 'Nhắc lại sau 10p' }
              ]
            } as any);
          }).catch(err => {
            // Fallback to normal Notification
            new Notification("Đến giờ uống thuốc", {
              body: dueMeds.map(m => m.name).join(', '),
              icon: '/vite.svg',
              requireInteraction: true
            });
          });
        }
      }
    };

    // Check periodically
    const timer = setInterval(() => {
      checkAlarms();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(timer);
  }, [medicines, records, alarm.active, startGentleAlarm]);

  const dismissAlarm = () => {
    stopGentleAlarm();
    setAlarm({ active: false, meds: [], time: '' });
  };

  const takeAlarmMeds = async () => {
    const dateStr = getLocalDateStr();
    
    // Process all meds in the alarm
    for (const m of alarm.meds) {
      await markTaken(m.id, alarm.time, dateStr);
    }
    
    stopGentleAlarm();
    setAlarm({ active: false, meds: [], time: '' });
  };

  const snoozeAlarm = () => {
    stopGentleAlarm();
    // To snooze, we close the current alarm
    setAlarm({ active: false, meds: [], time: '' });
    
    // And set a one-time timeout to trigger it again in 10 minutes
    const snoozeMeds = [...alarm.meds];
    const snoozeTime = alarm.time;
    
    setTimeout(() => {
      setAlarm({ active: true, meds: snoozeMeds, time: snoozeTime });
      startGentleAlarm();
    }, 10 * 60 * 1000); // 10 minutes
  };

  // Global unlock already handled in App.tsx

  return {
    medicines,
    records,
    alarm,
    addMedication,
    removeMedication,
    markTaken,
    isTaken,
    requestNotificationPermission,
    dismissAlarm,
    takeAlarmMeds,
    snoozeAlarm
  };
}
