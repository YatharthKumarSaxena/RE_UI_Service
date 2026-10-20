// utils/deviceId.js

const DEVICE_STORAGE_KEY = 're_ai_device_identity';

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getBrowserDeviceDetails() {
  const nav = typeof navigator === 'undefined' ? undefined : navigator;
  const userAgent = nav?.userAgent || '';
  const platform = nav?.userAgentData?.platform || nav?.platform || 'Unknown platform';
  const browserBrands = nav?.userAgentData?.brands?.map(({ brand }) => brand) || [];
  const browserName = browserBrands.find((brand) => !/not.?a.?brand/i.test(brand))
    || (userAgent.includes('Edg/') ? 'Microsoft Edge'
      : userAgent.includes('Firefox/') ? 'Firefox'
        : userAgent.includes('Chrome/') ? 'Chrome'
          : userAgent.includes('Safari/') ? 'Safari'
            : 'Web Browser');

  const isMobile = nav?.userAgentData?.mobile
    ?? /Mobi|iPhone|iPod|Android.*Mobile/i.test(userAgent);
  const isTablet = /iPad|Tablet/i.test(userAgent)
    || (/Android/i.test(userAgent) && !isMobile);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'laptop';

  return {
    deviceName: `${browserName} on ${platform}`,
    deviceType,
  };
}

export function getDeviceIdentity() {
  const browserDetails = getBrowserDeviceDetails();
  try {
    const stored = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.uuid) {
        return { uuid: parsed.uuid, ...browserDetails };
      }
    }
  } catch (e) {
    console.warn('Could not read device identity from localStorage', e);
  }

  // Create default identity
  const newIdentity = {
    uuid: generateUUID(),
    ...browserDetails,
  };

  try {
    localStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(newIdentity));
  } catch (e) {
    console.warn('Could not save device identity to localStorage', e);
  }

  return newIdentity;
}

export function getAuthHeaders() {
  const identity = getDeviceIdentity();
  return {
    'x-device-uuid': identity.uuid,
    'x-device-name': identity.deviceName || 'Web-Client',
    'x-device-type': identity.deviceType || 'laptop',
  };
}
