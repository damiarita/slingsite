import { GoogleDriveFolder } from '@/types/google-drive';
import {
  FilePersistenceJob,
  FilePersistenceJobStatus,
} from '@/types/persistence';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '';
const scopes = 'https://www.googleapis.com/auth/drive.file';
const discoveryDocs = [
  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
];

let gapiAccessToken: string | null = null;

const googleDriveApiIsLoaded = (): boolean =>
  !!window.gapi && !!window.google && !!window.google.accounts;

const loadGoogleDriveAPI = async () => {
  return new Promise<void>((resolve, reject) => {
    // 1. Load Legacy GAPI for Drive Client / Picker functionality
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.async = true;
    gapiScript.defer = true;

    // 2. Load New Google Identity Services for Authentication
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;

    let loadedScripts = 0;
    const checkResolve = () => {
      loadedScripts++;
      if (loadedScripts === 2) {
        window.gapi.load('client:picker', resolve); // Removed auth2
      }
    };

    gapiScript.onload = checkResolve;
    gsiScript.onload = checkResolve;

    document.body.appendChild(gapiScript);
    document.body.appendChild(gsiScript);

    setTimeout(() => reject(new Error('Loading GAPI script timed out')), 10000);
  });
};

const googleDriveApiIsInitialized = (): boolean =>
  !!window.gapi.client && !!window.gapi.client.drive;
const initializeGoogleDriveAPI = async () => {
  try {
    // Only initialize the client API now, auth is handled by GIS
    await window.gapi.client.init({
      apiKey,
      discoveryDocs,
    });
  } catch (error) {
    console.error('Error initializing GAPI Client:', error);
  }
};

const googleDriveIsAuthorized = (): boolean => {
  return !!gapiAccessToken;
};
const authorizeWithGoogleDriveAPI = async () => {
  return new Promise<void>((resolve, reject) => {
    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: (tokenResponse: any) => {
          if (tokenResponse.error !== undefined) {
            reject(new Error(tokenResponse.error));
          }
          gapiAccessToken = tokenResponse.access_token;
          resolve();
        },
      });

      // Request an access token
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      console.error('Authentication error:', error);
      reject(new Error('Failed to authenticate with Google Drive'));
    }
  });
};

const selectGoogleDriveFolder = async (lastFolderId?: string) => {
  return new Promise<GoogleDriveFolder>((resolve, reject) => {
    try {
      const token = gapiAccessToken;

      if (!token) {
        throw new Error('No access token available for Google Picker');
      }

      const view = new window.google.picker.DocsView(
        window.google.picker.ViewId.FOLDERS,
      ).setSelectFolderEnabled(true);

      // Set initial folder if we have a last used folder
      if (lastFolderId) {
        view.setParent(lastFolderId);
      }

      const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const folder = data.docs[0];
            const folderData = { id: folder.id, name: folder.name };
            resolve(folderData);
          } else if (data.action === window.google.picker.Action.CANCEL) {
            reject(new Error('User cancelled folder selection'));
          }
        })
        .build();

      picker.setVisible(true);
    } catch (error) {
      console.error('Folder picker error:', error);
      reject(error);
    }
  });
};

const uploadSingleFileToGoogleDrive = async (
  file: File,
  folderId: string,
  onProgress?: (progress: number) => void,
): Promise<boolean> => {
  const MAX_RETRIES = 3;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const metadata = {
        name: file.name,
        parents: [folderId],
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
      );
      form.append('file', file);

      const token = gapiAccessToken;
      if (!token) throw new Error('No access token available for upload');

      const xhr = new XMLHttpRequest();

      return await new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(true);
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error'));
        });

        xhr.open(
          'POST',
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        );
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(form);
      });
    } catch (error) {
      console.error(`Upload attempt ${attempt + 1} failed:`, error);

      if (attempt === MAX_RETRIES) {
        return false;
      }

      // Exponential backoff
      await new Promise((endTimeout) =>
        setTimeout(endTimeout, Math.pow(2, attempt) * 1000),
      );
    }
  }

  return false;
};

export const uploadFilesToGoogleDrive = async (
  jobs: FilePersistenceJob[],
  onChange: (id: string, status: FilePersistenceJobStatus) => void,
  previouslySelectedFolder?: string,
): Promise<void> => {
  if (!googleDriveApiIsLoaded()) {
    await loadGoogleDriveAPI();
  }

  if (!googleDriveApiIsInitialized()) {
    await initializeGoogleDriveAPI();
  }

  if (!googleDriveIsAuthorized()) {
    await authorizeWithGoogleDriveAPI();
  }

  const selectedFolder = await selectGoogleDriveFolder(
    previouslySelectedFolder,
  );
  if (!selectedFolder) {
    throw new Error('No folder selected');
  }

  // Upload files in parallel (max 3 at a time)
  const PARALLEL_UPLOADS = 3;
  const workersAvailableStatus: boolean[] = Array(PARALLEL_UPLOADS).fill(true);
  let nextJobToProcessIndex = 0;

  function processQueue(): undefined {
    if (nextJobToProcessIndex >= jobs.length) {
      return;
    }
    workersAvailableStatus.forEach((workerIsAvailable, index) => {
      if (workerIsAvailable) {
        workersAvailableStatus[index] = false;
        const jobIndex = nextJobToProcessIndex;
        nextJobToProcessIndex++;
        const job = jobs[jobIndex];
        onChange(job.id, { status: 'running', percentage: 0 });
        uploadSingleFileToGoogleDrive(
          job.file,
          selectedFolder.id,
          (progress: number) =>
            onChange(job.id, { status: 'running', percentage: progress }),
        )
          .then(() => onChange(job.id, { status: 'completed' }))
          .catch((error) => {
            console.error('Upload error:', error);
            onChange(job.id, {
              status: 'errored',
              errorMessage: (error as Error).message,
            });
          })
          .finally(() => {
            workersAvailableStatus[index] = true;
            processQueue();
          });
      }
    });
  }
  processQueue();
};
