import { makePost } from "./api";

export async function registerPush() {
 
    console.log("hello")
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn("Push notifications not supported in this browser.");
      return;
    }
  
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();
      console.log("Service Worker registered:", registration);
  
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn("Notification permission not granted.");
        return;
      }
  
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BAfjPsCbKvBmOIK-ydNo6cL-38z43pMwZZEyAkBdl72nIm-NVTc74ucXfSR_MtlMd95YjhN2_OG4KwaaiFe8ecw'),
      });
  
      console.log(subscription)
      // Send to your backend
    //   await makePost(`${process.env.NEXT_PUBLIC_API_URL}/save-subscription`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(subscription),
    //     credentials: 'include' // If using Laravel Sanctum
    //   });
     const  payload =  subscription
      const res = await makePost('/save-subscription', payload)
      console.log("Push subscription saved.");
    } catch (err) {
      console.error("Push registration failed:", err);
    }
  }
  
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
  
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
  }
  