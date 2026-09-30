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

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logo, setLogo] = useState<SiteAsset | null>(DEFAULT_LOGO);
  const [logoLoading, setLogoLoading] = useState<boolean>(true);
  const [logoError, setLogoError] = useState<boolean>(false);

  const [currentGanesh, setCurrentGanesh] = useState<SiteAsset | null>(null);
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
      setCurrentGanesh(data);
    } catch {
      setCurrentGanesh(null);
      setGaneshError(true);
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
