async function connectToESP32() {
    try {
        console.log("Requesting Bluetooth Device...");
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["12345678-1234-5678-1234-56789abcdef0"] // Replace with your ESP32 service UUID
        });

        console.log("Connecting to GATT Server...");
        const server = await device.gatt.connect();

        console.log("Getting Service...");
        const service = await server.getPrimaryService("12345678-1234-5678-1234-56789abcdef0"); // Replace UUID

        console.log("Getting Characteristic...");
        const characteristic = await service.getCharacteristic("abcdef01-1234-5678-1234-56789abcdef0"); // Replace UUID

        console.log("Writing to Characteristic...");
        let data = new Uint8Array([0x01]); // Example data (modify as needed)
        await characteristic.writeValue(data);

        console.log("Successfully modified BLE characteristic!");
    } catch (error) {
        console.log("Error: ", error);
    }
}

// Call function when button is clicked
document.getElementById("connectBtn").addEventListener("click", connectToESP32);
