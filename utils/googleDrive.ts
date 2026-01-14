
// utils/googleDrive.ts

/**
 * CONFIGURATION REQUIRED
 * To enable Cloud Sync, you must create a Project in Google Cloud Console.
 * 1. Go to console.cloud.google.com
 * 2. Create a project and enable "Google Drive API".
 * 3. Go to Credentials -> Create Credentials -> OAuth client ID.
 * 4. Application type: Web application.
 * 5. Add your domain (e.g., http://localhost:3000) to "Authorized JavaScript origins".
 * 6. Paste the Client ID and API Key below.
 */
const CLIENT_ID = ''; // <--- PASTE YOUR CLIENT ID HERE
const API_KEY = '';   // <--- PASTE YOUR API KEY HERE

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const BACKUP_FILENAME = 'tradesmen_backup_v1.json';

declare const gapi: any;
declare const google: any;

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGapi = (onInit: () => void) => {
    if(!CLIENT_ID || !API_KEY) {
        console.warn("Google Drive Sync: Missing CLIENT_ID or API_KEY in utils/googleDrive.ts");
        return;
    }

    const gapiLoaded = () => {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            if (gisInited) onInit();
        });
    };

    const gisLoaded = () => {
        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // defined at request time
        });
        gisInited = true;
        if (gapiInited) onInit();
    };

    // Check if scripts are loaded
    if (typeof gapi !== 'undefined') gapiLoaded();
    if (typeof google !== 'undefined') gisLoaded();
};

export const handleAuth = (callback: (token: any) => void) => {
    if (!tokenClient) {
        alert("Sync service not initialized. Check API Keys.");
        return;
    }
    
    tokenClient.callback = async (resp: any) => {
        if (resp.error) {
            throw resp;
        }
        callback(resp);
    };

    if (gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        // Skip display of account chooser and consent dialog for an existing session.
        tokenClient.requestAccessToken({ prompt: '' });
    }
};

export const findBackupFile = async (): Promise<any | null> => {
    try {
        const response = await gapi.client.drive.files.list({
            q: `name = '${BACKUP_FILENAME}' and trashed = false`,
            fields: 'files(id, name, createdTime)',
            spaces: 'drive',
        });
        const files = response.result.files;
        return files && files.length > 0 ? files[0] : null;
    } catch (err) {
        console.error("Error finding backup:", err);
        throw err;
    }
};

export const uploadBackup = async (data: any): Promise<void> => {
    const fileContent = JSON.stringify(data, null, 2);
    const file = new Blob([fileContent], { type: 'application/json' });
    const metadata = {
        name: BACKUP_FILENAME,
        mimeType: 'application/json',
    };

    const existingFile = await findBackupFile();

    const accessToken = gapi.client.getToken().access_token;
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let method = 'POST';

    if (existingFile) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
        method = 'PATCH';
    }

    await fetch(url, {
        method: method,
        headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
        body: form,
    });
};

export const downloadBackup = async (): Promise<any> => {
    const existingFile = await findBackupFile();
    if (!existingFile) throw new Error("No backup found in your Drive.");

    const response = await gapi.client.drive.files.get({
        fileId: existingFile.id,
        alt: 'media',
    });

    return response.result; // This usually returns the parsed JSON body if the response is JSON
};

export const getClientIdStatus = () => !!CLIENT_ID;
