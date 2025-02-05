document.addEventListener("DOMContentLoaded", () => {
    const connectButton = document.getElementById("connectBtn");
    if (connectButton) {
        connectButton.addEventListener("click", connectToESP32);
    } else {
        console.error("Button not found!");
    }
});

async function connectToESP32() {
    try {
        console.log("Requesting Bluetooth Device...");

        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true, // Allows any Bluetooth device
            optionalServices: ["battery_service"] // Replace with your ESP32 service UUID if needed
        });

        console.log("Selected device:", device.name || "Unnamed Device");
    } catch (error) {
        console.error("Error selecting Bluetooth device:", error);
    }
}
