
import { FileIcon, Download, ImageIcon, X, Clock, Package} from 'lucide-react';
import type { Format } from '@/types/formats';
import type { Device } from '@/types/devices';
import { Job } from '@/types/job';
import { isJobFinished, isJobOngoing, isJobPending } from '@/utils/jobs';
import { SecondaryButton } from './buttons';


type FileItemProps = {
    onRemove: () => void;
    onDownloadAll: () => void;
    onDownloadOne: (device:Device, format:Format) => void;
    job: Job;
};

export const FileItem = ({ onRemove, onDownloadAll, onDownloadOne, job }: FileItemProps) => {
    const { original, outputs, requestedFormats, requestedSizes } = job;
    const progress = Object.values(outputs).flatMap(deviceOutputs => Object.values(deviceOutputs)).length / (Object.keys(requestedSizes).length * requestedFormats.length) * 100;
    const formatBytes = (bytes:number, decimals = 2) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]; };
    const allOutputs = Object.values(outputs || {}).flatMap(deviceOutputs => Object.values(deviceOutputs));


    const renderOutputs = (outputMap: Partial<Record<Device, Partial<Record<Format, File>>>>) => (
        <div className="space-y-2">
            {(Object.entries(outputMap) as [Device, Partial<Record<Format, File>>][]).map(([device, formats]) => (
                <div key={device}>
                    <p className="text-xs font-bold text-gray-500 capitalize mb-1">{device}</p>
                    <div className="flex flex-wrap gap-2">
                        {(Object.entries(formats) as [Format, File][]).map(([format, file]) => (
                            <div key={format} className="flex items-center justify-between bg-gray-100 rounded-md py-1 px-2 flex-grow text-xs">
                                <div className="flex items-center">
                                    <FileIcon className="w-3 h-3 mr-1.5 text-gray-500"/>
                                    <span className="font-mono uppercase">{format}</span>
                                    <span className="text-gray-500 ml-2">{formatBytes(file.size)}</span>
                                </div>
                                <button onClick={() => onDownloadOne(device, format)} className="p-0.5 rounded hover:bg-gray-200 text-gray-600">
                                    <Download className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
            <div className="flex items-start justify-between">
                <div className="flex items-center min-w-0"> <ImageIcon className="w-8 h-8 text-gray-400 mr-3 flex-shrink-0" /> <div className="flex-grow min-w-0"> <p className="text-sm font-medium text-gray-800 truncate" title={original?.name}>{original?.name}</p> <p className="text-xs text-gray-500">{original?.size ? formatBytes(original.size) : ''}</p> </div> </div>
                <button onClick={onRemove} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"> <X className="w-4 h-4" /> </button>
            </div>
            {isJobPending(job)
            ? <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center bg-gray-100 p-2 rounded-md"> <Clock className="w-4 h-4 mr-2" /> In queue... </div>
            :<div className="mt-4 pt-4 border-t border-gray-200">
                    {allOutputs.length > 0 && (
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Compressed Files:</h4>
                                {isJobFinished(job) && <SecondaryButton onClick={() => onDownloadAll()} small={true}> <Package className="w-3 h-3 mr-1"/> Download All </SecondaryButton>}
                            </div>
                            {renderOutputs(outputs)}
                        </div>
                    )}
                    {isJobOngoing(job) && (
                        <div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5"> <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div> </div>
                            <p className="text-xs text-center text-gray-600 mt-1">Compressing... {Math.round(progress)}%</p>
                        </div>
                    )}
                </div>}
        </div>
    );
};
