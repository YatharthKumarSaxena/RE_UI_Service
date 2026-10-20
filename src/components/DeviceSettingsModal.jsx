import React from 'react';
import { X, Smartphone, Laptop, Tablet } from 'lucide-react';
import { getDeviceIdentity } from '../utils/deviceId';

export default function DeviceSettingsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const { uuid, deviceName, deviceType } = getDeviceIdentity();
  const DeviceIcon = deviceType === 'mobile'
    ? Smartphone
    : deviceType === 'tablet'
      ? Tablet
      : Laptop;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Device Identity & Headers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatically detected and sent with backend requests
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close device identity"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Device UUID (<span className="text-teal-600 dark:text-teal-400 font-mono">x-device-uuid</span>)
            </label>
            <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-teal-700 dark:text-teal-300 select-text">
              {uuid}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Browser & Platform (<span className="text-slate-500 dark:text-slate-400 font-mono">x-device-name</span>)
            </label>
            <div className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-950/70 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 select-text">
              {deviceName}
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
              Browsers do not provide the computer's personal device name.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Detected Device Type (<span className="text-slate-500 dark:text-slate-400 font-mono">x-device-type</span>)
            </label>
            <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/70 text-xs font-medium text-slate-700 dark:text-slate-300">
              <DeviceIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="capitalize">{deviceType}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
