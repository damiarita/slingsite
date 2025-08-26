import { Job } from "@/types/job"
import { jobProportionOfDoneTasks } from "@/utils/jobs"
import { FileItem } from "./file-item"
import { Device } from "@/types/devices"
import { Format } from "@/types/formats"
import { Package, Plus } from "lucide-react"
import { downloadAllFiles, downloadResultFile } from "@/utils/downloaders"
import { PrimaryButton, SecondaryButton } from "./buttons"

type Props = {
    jobs: Job[];
    handleRemoveJob: (index: number) => void;
    handleGoToUpload: () => void;
}

export const Results = ({jobs, handleRemoveJob, handleGoToUpload} : Props) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 min-h-[200px]">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Files</h3>
            <SecondaryButton onClick={handleGoToUpload}><Plus className="w-4 h-4 mr-1.5" />Add More</SecondaryButton>
            <PrimaryButton onClick={()=>downloadAllFiles(jobs)} disabled={!jobs.some(job=>jobProportionOfDoneTasks(job)>0)} > <Package className="w-4 h-4 mr-2"/> Download All Files </PrimaryButton>
            </div>
            {jobs.length === 0 ? ( <div className="text-center py-10 text-gray-500"> <p>Upload some files to get started!</p> </div> ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job,index) => ( <FileItem key={job.id} onRemove={() => handleRemoveJob(index)} onDownloadOne={(device:Device, format:Format)=>downloadResultFile(job, device, format)} onDownloadAll={()=>downloadAllFiles([job])}job={job} /> ))}
            </div>
            )}
        </div>
    )
}
