document.addEventListener("DOMContentLoaded", function() {
    // Your existing code that interacts with the button
    document.getElementById("connectBtn").addEventListener("click", async function() {
        try {
            console.log("Requesting Bluetooth Device...");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,  // Allow any BLE device
                optionalServices: ["12345678-1234-5678-1234-56789abcdef0"] // Your SERVICE_UUID
            });

            console.log("Connecting to GATT Server...");
            const server = await device.gatt.connect();

            console.log("Getting Service...");
            const service = await server.getPrimaryService("12345678-1234-5678-1234-56789abcdef0");

            console.log("Getting Characteristic...");
            bleCharacteristic = await service.getCharacteristic("abcdef01-1234-5678-1234-56789abcdef0");

            console.log("Connected! Ready to communicate.");

            // Read the initial value
            let value = await bleCharacteristic.readValue();
            let decoder = new TextDecoder("utf-8");
            console.log("Received:", decoder.decode(value));

            // Set up notifications (if supported)
            bleCharacteristic.addEventListener("characteristicvaluechanged", handleCharacteristicValueChanged);
            await bleCharacteristic.startNotifications();
            console.log("Listening for notifications...");

        } catch (error) {
            console.error("Error connecting to Bluetooth device:", error);
        }
    });
});
