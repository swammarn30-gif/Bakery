import { createContext, useContext, useMemo, useState } from "react";

const today = new Date().toISOString().slice(0, 10);

type MasterDateContextValue = {
  masterDate: string;
  setMasterDate: (date: string) => void;
};

const MasterDateContext = createContext<MasterDateContextValue | null>(null);

export function MasterDateProvider({ children }: { children: React.ReactNode }) {
  const [masterDate, setMasterDate] = useState(() => localStorage.getItem("bakery-master-date") || today);
  const value = useMemo(() => ({
    masterDate,
    setMasterDate: (date: string) => {
      setMasterDate(date);
      localStorage.setItem("bakery-master-date", date);
    },
  }), [masterDate]);
  return <MasterDateContext.Provider value={value}>{children}</MasterDateContext.Provider>;
}

export function useMasterDate() {
  const value = useContext(MasterDateContext);
  if (!value) throw new Error("useMasterDate must be used inside MasterDateProvider");
  return value;
}
