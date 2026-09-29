import { useState, useEffect } from 'react';
import { publicApi } from '../admin/api';
import { updatesData, UpdateItem } from '../data/updates';
import { galleryData } from '../data/gallery';
import { GalleryItem } from '../components/gallery/GalleryCard';
import { activitiesData, ActivityItem } from '../data/activities';
import { historyTimelineData } from '../data/history';
import { TimelineItem } from '../components/content/Timeline';
import { clubInfo, ClubInfo } from '../data/club';

/**
 * Custom hooks for seamless Public Website data fetching
 * Fetches published content from the backend API, automatically falling back
 * to local data if the server is loading, offline, or returns empty.
 */

export function usePublicUpdates() {
  const [updates, setUpdates] = useState<UpdateItem[]>(updatesData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiUpdates = async () => {
      try {
        setIsLoading(true);
        const data = await publicApi.getUpdates();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: UpdateItem[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            category: (item.category as any) || 'Announcements',
            date: new Date(item.created_at || Date.now()).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            description: item.excerpt,
            fullContent: item.content,
            featured: false,
          }));
          setUpdates(mapped);
        }
      } catch {
        // Graceful fallback to static data
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiUpdates();
    return () => {
      isMounted = false;
    };
  }, []);

  return { updates, isLoading };
}

export function usePublicGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>(galleryData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiGallery = async () => {
      try {
        setIsLoading(true);
        const data = await publicApi.getGallery();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: GalleryItem[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            category: item.category || 'Pandal',
            year: item.year || '2026',
            imageSrc: item.image_url,
            altText: item.title,
            description: item.description,
          }));
          setGallery(mapped);
        }
      } catch {
        // Fallback to static
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiGallery();
    return () => {
      isMounted = false;
    };
  }, []);

  return { gallery, isLoading };
}

export function usePublicActivities() {
  const [activities, setActivities] = useState<ActivityItem[]>(activitiesData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiActivities = async () => {
      try {
        setIsLoading(true);
        const data = await publicApi.getActivities();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: ActivityItem[] = data.map((item: any) => ({
            id: String(item.id),
            title: item.title,
            category: (item.category as any) || 'Ritual',
            date: item.date,
            time: item.time,
            location: item.location,
            description: item.description || '',
            featured: item.featured,
          }));
          setActivities(mapped);
        }
      } catch {
        // Fallback to static
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiActivities();
    return () => {
      isMounted = false;
    };
  }, []);

  return { activities, isLoading };
}

export function usePublicHistory() {
  const [history, setHistory] = useState<TimelineItem[]>(historyTimelineData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiHistory = async () => {
      try {
        setIsLoading(true);
        const data = await publicApi.getHistory();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const mapped: TimelineItem[] = data.map((item: any) => ({
            year: item.year,
            title: item.title,
            description: item.description,
            tag: item.tag || undefined,
          }));
          setHistory(mapped);
        }
      } catch {
        // Fallback to static
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  return { history, isLoading };
}

export function usePublicClub() {
  const [club, setClub] = useState<ClubInfo>(clubInfo);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchApiClub = async () => {
      try {
        setIsLoading(true);
        const data = await publicApi.getClub();
        if (isMounted && data && data.name) {
          setClub((prev) => ({
            ...prev,
            name: data.name || prev.name,
            tagline: data.tagline || prev.tagline,
            description: data.description || prev.description,
            location: data.location || prev.location,
            address: data.address || prev.address,
            phone: data.phone || prev.phone,
            email: data.email || prev.email,
            regNumber: data.registration_number || prev.regNumber,
            socials: {
              instagram: data.instagram_url || prev.socials.instagram,
              facebook: data.facebook_url || prev.socials.facebook,
              youtube: data.youtube_url || prev.socials.youtube,
            },
          }));
        }
      } catch {
        // Fallback to static
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchApiClub();
    return () => {
      isMounted = false;
    };
  }, []);

  return { club, isLoading };
}
