
import { FileIcon, Download, X, Clock, Package} from 'lucide-react';
import type { Format } from '@/utils/formats';
import type { Device } from '@/types/devices';
import { Job, Task } from '@/types/job';
import { jobIsRunning, jobProportionOfDoneTasks } from '@/utils/jobs';
import { SecondaryButton } from './buttons';


type FileItemProps = {
    onRemove: () => void;
    onDownloadAll: () => void;
    onDownloadOne: (device:Device, format:Format) => void;
    job: Job;
};

export const FileItem = ({ onRemove, onDownloadAll, onDownloadOne, job }: FileItemProps) => {
    const { originalFile, originalFileObjectURL, tasks } = job;
    const progress = jobProportionOfDoneTasks(job);
    const progressPercentage = `${Math.round(progress*100)}%`;
    const formatBytes = (bytes:number, decimals = 2) => { if (bytes === 0) return '0 Bytes'; const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]; };


    const rendertTasks = (tasks: Partial<Record<Device, Partial<Record<Format, Task>>>>) => (
        <div className="space-y-2">
            {(Object.entries(tasks) as [Device, Partial<Record<Format, Task>>][]).map(([device, formats]) => (
                <div key={device}>
                    <p className="text-xs font-bold text-gray-500 capitalize mb-1 flex items-center">
                        {device}
                        <span className="ml-2 font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full text-[10px]">
                            {job.requestedDimensions[device]?.width}x{job.requestedDimensions[device]?.height}
                        </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {(Object.entries(formats) as [Format, Task][]).map(([format, task]) => (
                            <div key={format} className="flex items-center justify-between bg-gray-100 rounded-md py-1 px-2 flex-grow text-xs">
                                <div className="flex items-center">
                                    <FileIcon className="w-3 h-3 mr-1.5 text-gray-500"/>
                                    <span className="font-mono uppercase">{format}</span>
                                    {task.status==='waiting' && <span className="text-gray-500 ml-2">Waiting</span>}
                                    {task.status==='running' && !!task.percentage && <span className="text-gray-500 ml-2">{task.percentage}%</span>}
                                    {task.status==='running' && !task.percentage && <span className="text-gray-500 ml-2">Running</span>}
                                    {task.status==='errored' && <span className="text-red-200 ml-2">Error</span>}
                                    {task.status==='completed' && <span className="text-gray-500 ml-2">{formatBytes(task.result.size)}</span>}
                                </div>
                                {task.status==='completed' && <button onClick={() => onDownloadOne(device, format)} className="p-0.5 rounded hover:bg-gray-200 text-gray-600"><Download className="w-3 h-3" /></button>}
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
                <div className="flex items-center min-w-0"> 
                    {originalFile.type.startsWith('video/')?
                        <video src={originalFileObjectURL} className="w-10 h-10 object-cover rounded-md mr-3 flex-shrink-0" disablePictureInPicture/>
                    :
                        <img src={originalFileObjectURL} className="w-10 h-10 object-cover rounded-md mr-3 flex-shrink-0"/>
                    }
                    <div className="flex-grow min-w-0"> 
                        <p className="text-sm font-medium text-gray-800 truncate" title={originalFile.name}>{originalFile.name}</p> 
                        <p className="text-xs text-gray-500 flex items-center flex-wrap">
                            <span>{job.originalDimensions.width}x{job.originalDimensions.height}px</span>
                            <span className="mx-1.5">·</span>
                            <span>{formatBytes(originalFile.size)}</span>
                        </p>
                    </div> 
                </div>
                <button onClick={onRemove} className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"> <X className="w-4 h-4" /> </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Compressed Files:</h4>
                        {progress===1 && <SecondaryButton onClick={() => onDownloadAll()} small={true}> <Package className="w-3 h-3 mr-1"/> Download All </SecondaryButton>}
                    </div>
                    {rendertTasks(tasks)}
                </div>
                {jobIsRunning(job) ? (
                    <div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5"> <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: progressPercentage }} /> </div>
                        <p className="text-xs text-center text-gray-600 mt-1">Compressing... {progressPercentage}</p>
                    </div>
                ) : progress===0 && (
                    <div className="mt-4 text-center text-sm text-gray-500 flex items-center justify-center bg-gray-100 p-2 rounded-md">
                        <Clock className="w-4 h-4 mr-2" /> In queue...
                    </div>
                )}
            </div>
            
        </div>
    );
};
