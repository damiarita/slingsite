// This component provides the UI for configuring the compression dimensions for each viewport.
'use client';
import { ReactElement } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Settings,
  Play,
  Files,
  X,
  FilePlus,
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './buttons';
import type { SettingsDictionary } from '@/i18n/type';
import type { ConfigMode, SizingConfigs } from '@/types/config';

const createPercentageFromColumns = (columns: number) => {
  if (columns <= 0) return 100;
  return 100 / columns;
};

export const DimensionsSettings = ({
  configs,
  setConfig,
  handleProcessClick,
  files,
  handleRemoveFile,
  handleClickAddMoreFiles,
  translation,
}: {
  configs: SizingConfigs;
  setConfig: React.Dispatch<React.SetStateAction<SizingConfigs>>;
  handleProcessClick: () => void;
  files: File[];
  handleRemoveFile: (index: number) => void;
  handleClickAddMoreFiles: () => void;
  translation: SettingsDictionary;
}) => {
  const icons: Record<string, ReactElement> = {
    mobile: <Smartphone className="w-5 h-5 mr-2" />,
    tablet: <Tablet className="w-5 h-5 mr-2" />,
    desktop: <Monitor className="w-5 h-5 mr-2" />,
  };

  const columnOptions = [
    { label: '1', columns: 1 },
    { label: '1/2', columns: 2 },
    { label: '1/3', columns: 3 },
    { label: '1/4', columns: 4 },
  ];

  const handleToggle = (configName: string) => {
    setConfig((prev: SizingConfigs) => {
      const newConfig = { ...prev };
      newConfig[configName] = {
        ...newConfig[configName],
        enabled: !newConfig[configName].enabled,
      };
      return newConfig;
    });
  };
  const handleModeChange = (configName: string, mode: ConfigMode) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const deviceConf = { ...newConfig[configName], sizingType: mode };
      newConfig[configName] = deviceConf;
      return newConfig;
    });
  };
  const handleInputChange = (
    configName: string,
    field: 'width' | 'height' | 'percentage' | 'screenWidth',
    value: number,
  ) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const deviceConf = { ...newConfig[configName], [field]: value };
      if (field === 'width') {
        deviceConf.width = value;
        deviceConf.percentage = (100 * value) / deviceConf.screenWidth;
      }
      if (field === 'percentage') {
        deviceConf.percentage = value;
        deviceConf.width = (deviceConf.screenWidth * value) / 100;
      }
      if (field === 'screenWidth') {
        deviceConf.screenWidth = value;
        deviceConf.width =
          (deviceConf.screenWidth * deviceConf.percentage) / 100;
      }
      if (field === 'height') {
        deviceConf.height = value;
      }
      newConfig[configName] = deviceConf;
      return newConfig;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Files className="w-6 h-6 text-gray-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">
          {translation.filesToCompress}
        </h3>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {files.map((file, index) => (
          <div key={file.name} className="relative group aspect-square">
            {file.type.startsWith('video/') ? (
              <video
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover rounded-md shadow-sm"
                disablePictureInPicture
              />
            ) : (
              <img
                src={URL.createObjectURL(file)}
                className="w-full h-full object-cover rounded-md shadow-sm"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-color duration-200 rounded-md" />
            <button
              onClick={() => handleRemoveFile(index)}
              className="absolute top-1 right-1 bg-white/70 hover:bg-white text-gray-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label={translation.removeFile}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center mb-4">
        <SecondaryButton onClick={handleClickAddMoreFiles}>
          <FilePlus className="w-4 h-4 mr-2" />
          {translation.addMoreFiles}
        </SecondaryButton>
      </div>
      <div className="flex items-center mb-4">
        <Settings className="w-6 h-6 text-gray-600 mr-3" />
        <h3 className="text-xl font-semibold text-gray-800">
          {translation.compressionSettings}
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        {Object.entries(configs).map(([configName, config]) => {
          const icon = config.iconType && icons[config.iconType];
          return (
            <div
              key={configName}
              className={`rounded-lg transition-all duration-300 ${config.enabled ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100 opacity-70'}`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center font-semibold text-gray-700 capitalize">
                  {icon}
                  <label htmlFor={configName}>{configName}</label>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    id={configName}
                    checked={config.enabled}
                    onChange={() => handleToggle(configName)}
                    className="absolute inset-0 w-full h-full m-0 p-0 opacity-0 cursor-pointer peer z-10"
                    aria-checked={config.enabled}
                    role="switch"
                  />
                  {/* track */}
                  <div
                    className="w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 transition-colors"
                    aria-hidden="true"
                  />
                  {/* knob */}
                  <div
                    className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-6"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${config.enabled ? 'max-h-[500px]' : 'max-h-0'}`}
              >
                <div className="px-4 pb-4 space-y-4">
                  {config.sizingType === 'percentage' && (
                    <div>
                      <label
                        className="text-sm font-medium text-gray-600"
                        htmlFor={`screen-width${configName}`}
                      >
                        {translation.supportScreensUpTo}:
                      </label>
                      <div className="relative mt-1">
                        <input
                          id={`screen-width${configName}`}
                          type="number"
                          value={config.screenWidth}
                          onChange={function (e) {
                            handleInputChange(
                              configName,
                              'screenWidth',
                              parseFloat(e.target.value),
                            );
                          }}
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                          px
                        </span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      {translation.configMode[config.sizingType]}
                    </label>
                    {config.sizingType === 'percentage' ? (
                      <>
                        <div className="grid grid-cols-4 gap-2 mt-1">
                          {columnOptions.map((opt) => (
                            <button
                              key={opt.columns}
                              onClick={() =>
                                handleInputChange(
                                  configName,
                                  'percentage',
                                  createPercentageFromColumns(opt.columns),
                                )
                              }
                              className={`text-xs p-2 rounded-md transition-colors ${Math.round(createPercentageFromColumns(opt.columns)) === Math.round(config.percentage) ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={config.percentage}
                            onChange={(e) =>
                              handleInputChange(
                                configName,
                                'percentage',
                                parseInt(e.target.value),
                              )
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="text-center text-sm text-gray-600 mt-1">
                            {Math.round(config.percentage)}
                            {translation.percentWidth}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="relative mt-1">
                        <input
                          type="number"
                          placeholder={`e.g., ${config.sizingType === 'width' ? 800 : 600}`}
                          value={config[config.sizingType]}
                          onChange={(e) =>
                            handleInputChange(
                              configName,
                              config.sizingType,
                              parseFloat(e.target.value),
                            )
                          }
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                          px
                        </span>
                      </div>
                    )}
                    <div className="flex space-x-2 mt-3 text-xs">
                      {config.sizingType === 'percentage' || (
                        <button
                          onClick={() =>
                            handleModeChange(configName, 'percentage')
                          }
                          className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
                        >
                          {translation.setPercentage}
                        </button>
                      )}
                      {config.sizingType === 'width' || (
                        <button
                          onClick={() => handleModeChange(configName, 'width')}
                          className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
                        >
                          {translation.setWidth}
                        </button>
                      )}
                      {config.sizingType === 'height' || (
                        <button
                          onClick={() => handleModeChange(configName, 'height')}
                          className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100"
                        >
                          {translation.setHeight}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end items-center mt-4">
        <PrimaryButton onClick={handleProcessClick}>
          <Play className="w-4 h-4 mr-2" />
          {translation.startCompression}
        </PrimaryButton>
      </div>
    </div>
  );
};
