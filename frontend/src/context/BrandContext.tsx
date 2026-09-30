import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { apiService } from '../services/api';
import { SiteAsset } from '../types';

export interface BrandContextType {
  logo: SiteAsset | null;
  logoLoading: boolean;
  logoError: boolean;
  refreshLogo: () => Promise<void>;
  currentGanesh: SiteAsset | null;
  ganeshLoading: boolean;
  ganeshError: boolean;
  refreshGanesh: () => Promise<void>;
}

const DEFAULT_LOGO: SiteAsset = {
  id: 1,
  asset_type: 'LOGO',
  image_url: '/images/official_club_logo.png',
  storage_path: '/images/official_club_logo.png',
  original_filename: 'official_club_logo.png',
  mime_type: 'image/png',
  file_size: 210399,
  width: 320,
  height: 320,
  is_active: true,
  created_at: '2026-09-30T00:00:00Z',
};

const DEFAULT_GANESH: SiteAsset = {
  id: 2,
  asset_type: 'GANESH_CURRENT',
  year: 2026,
  image_url: '/images/current_ganesh_2026.jpg',
  storage_path: '/images/current_ganesh_2026.jpg',
  original_filename: 'current_ganesh_2026.jpg',
  mime_type: 'image/jpeg',
  file_size: 406460,
  width: 768,
  height: 1024,
  is_active: true,
  created_at: '2026-09-30T00:00:00Z',
};

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logo, setLogo] = useState<SiteAsset | null>(DEFAULT_LOGO);
  const [logoLoading, setLogoLoading] = useState<boolean>(true);
  const [logoError, setLogoError] = useState<boolean>(false);

  const [currentGanesh, setCurrentGanesh] = useState<SiteAsset | null>(DEFAULT_GANESH);
  const [ganeshLoading, setGaneshLoading] = useState<boolean>(true);
  const [ganeshError, setGaneshError] = useState<boolean>(false);

  const refreshLogo = useCallback(async () => {
    setLogoLoading(true);
    setLogoError(false);
    try {
      const data = await apiService.getPublicLogo();
      setLogo(data);
    } catch {
      // Keep DEFAULT_LOGO if backend has no custom uploaded logo yet
      setLogo(DEFAULT_LOGO);
      setLogoError(false);
    } finally {
      setLogoLoading(false);
    }
  }, []);

  const refreshGanesh = useCallback(async () => {
    setGaneshLoading(true);
    setGaneshError(false);
    try {
      const data = await apiService.getPublicCurrentGanesh();
      setCurrentGanesh(data || DEFAULT_GANESH);
    } catch {
      setCurrentGanesh(DEFAULT_GANESH);
      setGaneshError(false);
    } finally {
      setGaneshLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLogo();
    refreshGanesh();
  }, [refreshLogo, refreshGanesh]);

  return (
    <BrandContext.Provider
      value={{
        logo,
        logoLoading,
        logoError,
        refreshLogo,
        currentGanesh,
        ganeshLoading,
        ganeshError,
        refreshGanesh,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export function useBrand(): BrandContextType {
  const context = useContext(BrandContext);
  if (!context) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
}
