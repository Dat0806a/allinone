import React, { createContext, useContext } from 'react';
import { useMedications, Medication, TakenRecord, AlarmState } from '../hooks/useMedications';

interface MedicationContextType {
  medicines: Medication[];
  records: TakenRecord[];
  alarm: AlarmState;
  addMedication: (med: Omit<Medication, 'id'>) => void;
  removeMedication: (id: string) => void;
  markTaken: (medId: string, time: string, date: string) => void;
  isTaken: (medId: string, time: string, date: string) => boolean;
  requestNotificationPermission: () => void;
  dismissAlarm: () => void;
  takeAlarmMeds: () => void;
  snoozeAlarm: () => void;
}

const MedicationContext = createContext<MedicationContextType | null>(null);

export const MedicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const medState = useMedications();

  return (
    <MedicationContext.Provider value={medState}>
      {children}
    </MedicationContext.Provider>
  );
};

export const useMedicationContext = () => {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedicationContext must be used within a MedicationProvider');
  }
  return context;
};
