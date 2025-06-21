import { makePost } from "./api";

export async function registerPush() {
  console.log("Push registration started...");

  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications not supported in this browser.");
    return;
  }

  try {
    // Register or reuse existing service worker
    const registration = await navigator.serviceWorker.register("/sw.js");
    await registration.update(); // Optional: ensure latest sw.js


    // Ask for Notification permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
        console.log('Notification permission granted.');
        // proceed with subscription
      } else if (permission === 'denied') {
        alert('You have blocked notifications. Please enable them from browser settings to receive alerts.');
      } else {
        console.log('Notification permission was dismissed.');
      }
      
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return;
    }

    // Check if user is already subscribed
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log("User already subscribed. Skipping new subscription.");
      return;
    }

    // Subscribe the user
    const newSubscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        "BAfjPsCbKvBmOIK-ydNo6cL-38z43pMwZZEyAkBdl72nIm-NVTc74ucXfSR_MtlMd95YjhN2_OG4KwaaiFe8ecw"
      ),
    });

    // Send to backend
    const res = await makePost("/save-subscription", newSubscription);
    console.log("Push subscription saved successfully:", res);
  } catch (err) {
    console.error("Push registration failed:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
}
