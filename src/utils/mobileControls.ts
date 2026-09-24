// Mobile Controls Utility for Mahi
// Supports Phone Calls, SMS, WhatsApp, App Launching, Flashlight / Torch, Vibration, WakeLock, and Battery status

export interface ContactEntry {
  id: string;
  name: string;
  number: string;
  relationship?: string;
}

const DEFAULT_CONTACTS: ContactEntry[] = [
  { id: '1', name: 'Mummy', number: '', relationship: 'Mother' },
  { id: '2', name: 'Papa', number: '', relationship: 'Father' },
  { id: '3', name: 'Best Friend', number: '', relationship: 'Friend' },
  { id: '4', name: 'Emergency (All in One)', number: '112', relationship: 'National Emergency' },
  { id: '5', name: 'Police', number: '100', relationship: 'Emergency Police' },
  { id: '6', name: 'Ambulance', number: '108', relationship: 'Emergency Medical' },
  { id: '7', name: 'Women Helpline', number: '1091', relationship: 'Emergency Helpline' },
];

const CONTACTS_STORAGE_KEY = 'mahi_saved_contacts';

export function getSavedContacts(): ContactEntry[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function saveContacts(contacts: ContactEntry[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.warn('Failed to save contacts:', err);
  }
}

export function saveSingleContact(name: string, number: string, relationship?: string): void {
  const current = getSavedContacts();
  const lowerName = name.trim().toLowerCase();
  const existingIndex = current.findIndex(c => c.name.toLowerCase() === lowerName || (c.relationship && c.relationship.toLowerCase() === lowerName));
  
  if (existingIndex >= 0) {
    current[existingIndex].number = number.trim();
    if (relationship) current[existingIndex].relationship = relationship;
  } else {
    current.push({
      id: Date.now().toString(),
      name: name.trim(),
      number: number.trim(),
      relationship: relationship || 'Contact',
    });
  }
  saveContacts(current);
}

export function resolveContactNumber(query: string): { number: string; resolvedName: string } {
  const cleanQuery = query.trim().toLowerCase();
  
  // If it's already digits
  const pureDigits = query.replace(/[^\d+]/g, '');
  if (pureDigits.length >= 3 && /^\+?[\d\s-]{3,15}$/.test(query.trim())) {
    return { number: pureDigits, resolvedName: query.trim() };
  }

  const contacts = getSavedContacts();
  for (const c of contacts) {
    if (
      c.name.toLowerCase() === cleanQuery ||
      c.name.toLowerCase().includes(cleanQuery) ||
      cleanQuery.includes(c.name.toLowerCase()) ||
      (c.relationship && c.relationship.toLowerCase().includes(cleanQuery))
    ) {
      if (c.number) {
        return { number: c.number, resolvedName: c.name };
      }
    }
  }

  return { number: pureDigits || query, resolvedName: query };
}

// Global active torch track reference
let activeTorchStream: MediaStream | null = null;
let isTorchCurrentlyOn = false;

// 1. Phone Call
export function triggerPhoneCall(target: string): { success: boolean; url: string; displayTarget: string } {
  const { number, resolvedName } = resolveContactNumber(target);
  const cleanNumber = number.replace(/[^\d+]/g, '');
  const url = `tel:${cleanNumber}`;
  
  try {
    // Attempt window navigation
    window.location.href = url;
  } catch (err) {
    console.warn('Direct tel navigation failed, attempting anchor click:', err);
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_self';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      // Fallback
    }
  }

  return { success: true, url, displayTarget: resolvedName || cleanNumber };
}

// 2. SMS Message
export function triggerSms(target: string, message: string = ''): { success: boolean; url: string; displayTarget: string } {
  const { number, resolvedName } = resolveContactNumber(target);
  const cleanNumber = number.replace(/[^\d+]/g, '');
  const encodedBody = encodeURIComponent(message);
  // Standard SMS scheme
  const url = `sms:${cleanNumber}${encodedBody ? `?body=${encodedBody}` : ''}`;
  
  try {
    window.location.href = url;
  } catch {
    const a = document.createElement('a');
    a.href = url;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return { success: true, url, displayTarget: resolvedName || cleanNumber };
}

// 3. WhatsApp Message
export function triggerWhatsApp(target: string, message: string = ''): { success: boolean; url: string; displayTarget: string } {
  const { number, resolvedName } = resolveContactNumber(target);
  let cleanNumber = number.replace(/[^\d]/g, '');
  
  // If Indian 10-digit number without country code, prepend 91
  if (cleanNumber.length === 10) {
    cleanNumber = '91' + cleanNumber;
  }

  const encodedMsg = encodeURIComponent(message);
  const url = cleanNumber 
    ? `https://wa.me/${cleanNumber}?text=${encodedMsg}`
    : `whatsapp://send?text=${encodedMsg}`;
  
  try {
    window.open(url, '_blank');
  } catch {
    window.location.href = url;
  }

  return { success: true, url, displayTarget: resolvedName || (cleanNumber ? `+${cleanNumber}` : 'WhatsApp') };
}

// 4. App Launcher
export interface AppLaunchResult {
  appName: string;
  schemeUrl: string;
  webFallbackUrl: string;
  actionTaken: string;
}

export function launchMobileApp(appName: string, query?: string): AppLaunchResult {
  const nameLower = appName.trim().toLowerCase();
  const q = query ? encodeURIComponent(query.trim()) : '';

  let schemeUrl = '';
  let webFallbackUrl = '';

  if (nameLower.includes('youtube') || nameLower.includes('yt') || nameLower.includes('video')) {
    schemeUrl = q ? `vnd.youtube://results?search_query=${q}` : 'vnd.youtube://';
    webFallbackUrl = q ? `https://www.youtube.com/results?search_query=${q}` : 'https://www.youtube.com';
  } else if (nameLower.includes('whatsapp') || nameLower.includes('wa')) {
    schemeUrl = 'whatsapp://';
    webFallbackUrl = 'https://web.whatsapp.com';
  } else if (nameLower.includes('instagram') || nameLower.includes('insta')) {
    schemeUrl = q ? `instagram://user?username=${q}` : 'instagram://';
    webFallbackUrl = q ? `https://www.instagram.com/${q}` : 'https://www.instagram.com';
  } else if (nameLower.includes('map') || nameLower.includes('navigation') || nameLower.includes('location') || nameLower.includes('direction')) {
    schemeUrl = q ? `geo:0,0?q=${q}` : 'geo:0,0';
    webFallbackUrl = q ? `https://www.google.com/maps/search/?api=1&query=${q}` : 'https://www.google.com/maps';
  } else if (nameLower.includes('spotify') || nameLower.includes('music') || nameLower.includes('gana')) {
    schemeUrl = q ? `spotify:search:${q}` : 'spotify://';
    webFallbackUrl = q ? `https://open.spotify.com/search/${q}` : 'https://open.spotify.com';
  } else if (nameLower.includes('camera') || nameLower.includes('photo')) {
    schemeUrl = 'intent:#Intent;action=android.media.action.IMAGE_CAPTURE;end';
    webFallbackUrl = '#camera';
  } else if (nameLower.includes('calc') || nameLower.includes('calculator') || nameLower.includes('hisab')) {
    schemeUrl = 'calculator://';
    webFallbackUrl = 'https://www.google.com/search?q=calculator';
  } else if (nameLower.includes('mail') || nameLower.includes('gmail')) {
    schemeUrl = q ? `mailto:?subject=${q}` : 'mailto:';
    webFallbackUrl = 'https://mail.google.com';
  } else if (nameLower.includes('twitter') || nameLower.includes('x')) {
    schemeUrl = 'twitter://';
    webFallbackUrl = 'https://x.com';
  } else if (nameLower.includes('telegram') || nameLower.includes('tg')) {
    schemeUrl = 'tg://';
    webFallbackUrl = 'https://web.telegram.org';
  } else if (nameLower.includes('call') || nameLower.includes('dialer') || nameLower.includes('phone')) {
    schemeUrl = 'tel:';
    webFallbackUrl = 'tel:';
  } else if (nameLower.includes('message') || nameLower.includes('sms')) {
    schemeUrl = 'sms:';
    webFallbackUrl = 'sms:';
  } else if (nameLower.includes('chrome') || nameLower.includes('browser') || nameLower.includes('google')) {
    schemeUrl = q ? `googlechrome://navigate?url=https://www.google.com/search?q=${q}` : 'googlechrome://';
    webFallbackUrl = q ? `https://www.google.com/search?q=${q}` : 'https://www.google.com';
  } else {
    // Default search or general web
    schemeUrl = `https://www.google.com/search?q=${encodeURIComponent(appName + (query ? ' ' + query : ''))}`;
    webFallbackUrl = schemeUrl;
  }

  // Attempt opening deep link or web fallback
  try {
    window.open(webFallbackUrl, '_blank');
  } catch {
    window.location.href = schemeUrl || webFallbackUrl;
  }

  return {
    appName,
    schemeUrl,
    webFallbackUrl,
    actionTaken: `Opened ${appName}${query ? ` with query "${query}"` : ''}`,
  };
}

// 5. Flashlight / Torch Control
export async function toggleTorch(forceState?: boolean): Promise<{ success: boolean; isOn: boolean; message: string }> {
  try {
    const targetState = forceState !== undefined ? forceState : !isTorchCurrentlyOn;

    if (!targetState) {
      if (activeTorchStream) {
        activeTorchStream.getTracks().forEach(t => t.stop());
        activeTorchStream = null;
      }
      isTorchCurrentlyOn = false;
      return { success: true, isOn: false, message: 'Torch turned OFF' };
    }

    // Need camera stream with torch constraint
    if (!navigator.mediaDevices?.getUserMedia) {
      return { success: false, isOn: false, message: 'Camera / Torch is not supported on this device' };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        advanced: [{ torch: true }] as any,
      }
    });

    const track = stream.getVideoTracks()[0];
    const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;

    if (capabilities.torch || 'torch' in capabilities) {
      await (track as any).applyConstraints({
        advanced: [{ torch: true }]
      });
      activeTorchStream = stream;
      isTorchCurrentlyOn = true;
      return { success: true, isOn: true, message: 'Torch turned ON' };
    } else {
      // Stream is active, keep track open so user gets light from screen / camera
      activeTorchStream = stream;
      isTorchCurrentlyOn = true;
      return { success: true, isOn: true, message: 'Torch activated (Camera light)' };
    }
  } catch (err: any) {
    console.warn('Torch toggle error:', err);
    if (activeTorchStream) {
      activeTorchStream.getTracks().forEach(t => t.stop());
      activeTorchStream = null;
    }
    isTorchCurrentlyOn = false;
    return { success: false, isOn: false, message: err?.message || 'Could not toggle torch' };
  }
}

export function isTorchOn(): boolean {
  return isTorchCurrentlyOn;
}

// 6. Device Vibration
export function vibrateDevice(pattern: number | number[] = [100, 50, 100]): boolean {
  try {
    if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
      return navigator.vibrate(pattern);
    }
  } catch (e) {
    console.warn('Vibration failed:', e);
  }
  return false;
}

// 7. Screen WakeLock (Keep phone screen awake & prevent auto-lock)
let wakeLockSentinel: any = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  try {
    if ('wakeLock' in navigator && (navigator as any).wakeLock?.request) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    }
  } catch (err) {
    console.warn('WakeLock request failed:', err);
  }
  return false;
}

export async function releaseScreenWakeLock(): Promise<void> {
  try {
    if (wakeLockSentinel) {
      await wakeLockSentinel.release();
      wakeLockSentinel = null;
    }
  } catch (err) {
    console.warn('WakeLock release failed:', err);
  }
}

// 8. Battery Info
export async function getBatteryInfo(): Promise<{ level: number; isCharging: boolean } | null> {
  try {
    if ('getBattery' in navigator && typeof (navigator as any).getBattery === 'function') {
      const battery = await (navigator as any).getBattery();
      return {
        level: Math.round(battery.level * 100),
        isCharging: battery.charging,
      };
    }
  } catch (err) {
    console.warn('Battery API error:', err);
  }
  return null;
}
