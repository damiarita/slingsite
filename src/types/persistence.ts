export type persistenceType = 'device' | 'googleDrive';

export type FilePersistenceJob = {
  file: File;
  id: string;
  type: persistenceType;
  status: FilePersistenceJobStatus;
};
export type FilePersistenceJobStatus =
  | { status: 'waiting' }
  | { status: 'running'; percentage: number }
  | { status: 'completed' }
  | { status: 'errored'; errorMessage: string };
