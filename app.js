if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/my-pwa/service-worker.js")
        .then(() => console.log("Service Worker Registered!"))
        .catch((error) => console.log("Service Worker Registration Failed!", error));
}
