'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventoryStore } from '../lib/store';

export default function KeyboardShortcuts() {
  const router = useRouter();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          // Dispatch a custom event to open the new product modal
          window.dispatchEvent(new CustomEvent('open-new-product'));
          break;
        case 's':
          e.preventDefault();
          // Focus search
          const searchInput = document.getElementById('global-search');
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case 'b':
          e.preventDefault();
          router.push('/founders-portal');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
