import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CompanyContextType {
  companyName: string;
  setCompanyName: (name: string) => void;
  loadCompanyName: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType>({
  companyName: 'Store Manager',
  setCompanyName: () => {},
  loadCompanyName: async () => {},
});

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companyName, setCompanyName] = useState('Store Manager');

  const loadCompanyName = async () => {
    const { data } = await supabase.from('company_settings').select('name').limit(1).maybeSingle();
    if (data?.name) setCompanyName(data.name);
  };

  useEffect(() => { loadCompanyName(); }, []);

  return (
    <CompanyContext.Provider value={{ companyName, setCompanyName, loadCompanyName }}>
      {children}
    </CompanyContext.Provider>
  );
}

export const useCompany = () => useContext(CompanyContext);
