import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
let permissionGranted: boolean | null = null;

async function notificationsPermitted() {
    if (permissionGranted === null) {
      permissionGranted = await isPermissionGranted()
    }
  
    return permissionGranted;
  }

async function checkForPermissions() {
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
}
  
  async function osNotify(message: string, title?: string) {
    const permitted = await notificationsPermitted();
    if (!permitted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        if (title) {
            sendNotification({ title: title, body: message });
        } else {
            sendNotification(message);
        }
    }
  }

  export default {
    osNotify,
    checkForPermissions
  }