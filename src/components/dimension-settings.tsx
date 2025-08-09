// This component provides the UI for configuring the compression dimensions for each viewport.
'use client';

import { useState } from 'react';
import type {  CompressorPageDictionary } from '@/i18n/dictioraries/type';

export type SizingMethod = 'percentage' | 'columns' | 'fixedWidth' | 'fixedHeight';

export interface DeviceSetting {
  deviceWidth: number;
  method: SizingMethod;
  value: number;
}

export interface ViewportSettings {
  mobile: DeviceSetting;
  tablet: DeviceSetting;
  desktop: DeviceSetting;
}

interface DimensionSettingsProps {
  settings: ViewportSettings;
  onSettingsChange: (settings: ViewportSettings) => void;
  dictionary: CompressorPageDictionary;
}

type Viewport = 'mobile' | 'tablet' | 'desktop';

export const DimensionSettings = ({ settings, onSettingsChange, dictionary }: DimensionSettingsProps) => {
  const [activeTab, setActiveTab] = useState<Viewport>('mobile');

  const handleSettingChange = (viewport: Viewport, field: keyof DeviceSetting, value: number | SizingMethod) => {
    onSettingsChange({
      ...settings,
      [viewport]: {
        ...settings[viewport],
        [field]: value,
      },
    });
  };

  const renderTab = (viewport: Viewport) => {
    const config = settings[viewport];
    return (
      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
        <div className="sm:col-span-2">
          <label htmlFor={`${viewport}-device-width`} className="block text-sm font-medium leading-6 text-gray-900">{dictionary.deviceWidth}</label>
          <input
            type="number"
            id={`${viewport}-device-width`}
            value={config.deviceWidth}
            onChange={(e) => handleSettingChange(viewport, 'deviceWidth', Number(e.target.value))}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${viewport}-method`} className="block text-sm font-medium leading-6 text-gray-900">{dictionary.sizingMethod}</label>
          <select
            id={`${viewport}-method`}
            value={config.method}
            onChange={(e) => handleSettingChange(viewport, 'method', e.target.value as SizingMethod)}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          >
            <option value="percentage">{dictionary.methods.percentage}</option>
            <option value="columns">{dictionary.methods.columns}</option>
            <option value="fixedWidth">{dictionary.methods.fixedWidth}</option>
            <option value="fixedHeight">{dictionary.methods.fixedHeight}</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${viewport}-value`} className="block text-sm font-medium leading-6 text-gray-900">{dictionary.value}</label>
          <input
            type="number"
            id={`${viewport}-value`}
            value={config.value}
            onChange={(e) => handleSettingChange(viewport, 'value', Number(e.target.value))}
            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 shadow sm:rounded-lg">
      <h3 className="text-xl font-semibold leading-7 text-gray-900">{dictionary.settingsTitle}</h3>
      <div className="mt-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['mobile', 'tablet', 'desktop'] as Viewport[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                {dictionary.viewport[tab]}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-6">
          {renderTab(activeTab)}
        </div>
      </div>
    </div>
  );
};