// This component provides the UI for configuring the compression dimensions for each viewport.
'use client';
import {ReactElement} from 'react';
import { Device } from '@/types/devices';
import { Smartphone, Tablet, Monitor, Settings, Play, Files, X, FilePlus} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './buttons';

type ConfigMode = 'width' | 'height' | 'percentage';
type DeviceConfig = {
  enabled: boolean;
  screenWidth: number;
  sizingType: ConfigMode;
  percentage: number;
  width: number;
  height: number;
}
export type DimensionsConfig = Record<Device, DeviceConfig>;

const createPercentageFromColumns = (columns:number) => {
  if (columns <= 0) return 100;
  return 100/columns;
};

const lables: Record<ConfigMode, string> = {
  width: 'Image Width',
  height: 'Image Height',
  percentage: 'Layout'  
}
export const DimensionsSettings = ({ config, setConfig, readyToCompress, handleCompressClick, files, handleRemoveFile, handleExitSettings }: {config:DimensionsConfig, setConfig:React.Dispatch<React.SetStateAction<DimensionsConfig>>, readyToCompress:boolean, handleCompressClick:()=>void, files:File[], handleRemoveFile:(index:number)=>void, handleExitSettings:()=>void}) => {
  
  const icons:Record<Device, ReactElement>= { mobile: <Smartphone className="w-5 h-5 mr-2" />, tablet: <Tablet className="w-5 h-5 mr-2" />, desktop: <Monitor className="w-5 h-5 mr-2" /> };
  const columnOptions = [ { label: '1', columns: 1 }, { label: '1/2', columns: 2 }, { label: '1/3', columns: 3 }, { label: '1/4', columns: 4 } ];

  const handleToggle = (device: Device) => {
    setConfig( (prev:DimensionsConfig) => {
      const newConfig = { ...prev };
      newConfig[device] = { ...newConfig[device], enabled: !newConfig[device].enabled };
      return newConfig;
    });
  };
  const handleModeChange = (device:Device, mode:ConfigMode) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const deviceConf = { ...newConfig[device], sizingType: mode };
      newConfig[device] = deviceConf;
      return newConfig;
    });
  };
  const handleInputChange = (device:Device, field:'width'|'height'|'percentage'|'screenWidth', value:number) => {
     setConfig(prev => {
        const newConfig = { ...prev };
        const deviceConf = { ...newConfig[device], [field]: value };
        if (field === 'width') { deviceConf.width = value; deviceConf.percentage = 100*value/deviceConf.screenWidth; }
        if (field === 'percentage') { deviceConf.percentage = value; deviceConf.width = deviceConf.screenWidth*value/100; }
        if (field === 'screenWidth') { deviceConf.screenWidth = value; deviceConf.width = deviceConf.screenWidth*deviceConf.percentage/100; }
        if (field === 'height') { deviceConf.height = value; }
        newConfig[device] = deviceConf;
        return newConfig;
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-4"> <Files className="w-6 h-6 text-gray-600 mr-3" /> <h3 className="text-xl font-semibold text-gray-800">Files to Compress</h3> </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {files.map((file, index) => (
            <div key={file.name} className="relative group aspect-square">
              {file.type.startsWith('video/')?
                <video src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-md shadow-sm" disablePictureInPicture/>
              :
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-md shadow-sm"/>
              }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-color duration-200 rounded-md" />
                <button 
                    onClick={()=>handleRemoveFile(index)} 
                    className="absolute top-1 right-1 bg-white/70 hover:bg-white text-gray-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Remove image"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        ))}
      </div>
      <div className="flex justify-end items-center mb-4">
        <SecondaryButton onClick={handleExitSettings}>
          <FilePlus className="w-4 h-4 mr-2"/>Add More Files
        </SecondaryButton>
      </div>
      <div className="flex items-center mb-4"> <Settings className="w-6 h-6 text-gray-600 mr-3" /> <h3 className="text-xl font-semibold text-gray-800">Compression Settings</h3> </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        {(Object.keys(config) as Device[]).map((device) => (
          <div key={device} className={`rounded-lg transition-all duration-300 ${config[device].enabled ? 'bg-gray-50 ring-2 ring-blue-200' : 'bg-gray-100 opacity-70'}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center font-semibold text-gray-700 capitalize"> {icons[device]} <label htmlFor={device}>{device}</label> </div>
              <div className="relative inline-block w-10 mr-2 align-middle select-none"> <input type="checkbox" id={device} checked={config[device].enabled} onChange={() => handleToggle(device)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/></div>
            </div>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${config[device].enabled ? 'max-h-[500px]' : 'max-h-0'}`}>
              <div className="px-4 pb-4 space-y-4">
                {config[device].sizingType==='percentage' && (<div> <label className="text-sm font-medium text-gray-600" htmlFor={`screen-width${device}`}>Support Screens Up to:</label> <div className="relative mt-1"> <input id={`screen-width${device}`} type="number" value={config[device].screenWidth} onChange={function(e){handleInputChange(device, 'screenWidth', parseFloat(e.target.value));}} className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/> <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">px</span> </div> </div>)}
                <div>
                  <label className="text-sm font-medium text-gray-600">{lables[config[device].sizingType]}</label>
                  {config[device].sizingType === 'percentage' ? (
                    <><div className="grid grid-cols-4 gap-2 mt-1"> {columnOptions.map(opt => ( <button key={opt.columns} onClick={() => handleInputChange(device, 'percentage', createPercentageFromColumns(opt.columns))} className={`text-xs p-2 rounded-md transition-colors ${Math.round(createPercentageFromColumns(opt.columns))===Math.round(config[device].percentage) ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}> {opt.label} </button> ))} </div> <div className="mt-2"> <input type="range" min="1" max="100" value={config[device].percentage} onChange={(e) => handleInputChange(device, 'percentage', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/> <div className="text-center text-sm text-gray-600 mt-1">{Math.round(config[device].percentage)}% width</div> </div> </>
                  ) : (
                    <div className="relative mt-1"> <input type="number" placeholder={`e.g., ${config[device].sizingType === 'width' ? 800 : 600}`} value={config[device][config[device].sizingType]} onChange={(e) => handleInputChange(device, config[device].sizingType, parseFloat(e.target.value))} className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"/> <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">px</span> </div>
                  )}
                  <div className="flex space-x-2 mt-3 text-xs">
                    {config[device].sizingType==='percentage' || (<button onClick={() => handleModeChange(device, 'percentage')} className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100">Set Percentage</button>)}
                    {config[device].sizingType==='width' || (<button onClick={() => handleModeChange(device, 'width')} className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100">Set Width</button>)}
                    {config[device].sizingType==='height' || (<button onClick={() => handleModeChange(device, 'height')} className="flex-1 py-1 px-2 border rounded-md hover:bg-gray-100">Set Height</button>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end items-center mt-4">
        <PrimaryButton disabled={!readyToCompress} onClick={handleCompressClick}>
          <Play className="w-4 h-4 mr-2"/>Compress All
        </PrimaryButton>
      </div>
    </div>
  );
};