// Global variable to store the characteristic for writing later
let bleCharacteristic = null;

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

// Function to handle incoming data
function handleCharacteristicValueChanged(event) {
    let value = event.target.value;
    let decoder = new TextDecoder("utf-8");
    console.log("Notification received:", decoder.decode(value));
}

// Function to write data to ESP32
async function writeToCharacteristic(data) {
    if (bleCharacteristic) {
        let encoder = new TextEncoder();
        await bleCharacteristic.writeValue(encoder.encode(data));
        console.log("Sent:", data);
    } else {
        console.error("Not connected to a device.");
    }
}

// Event listener for sending data
document.getElementById("sendBtn").addEventListener("click", function() {
    let data = document.getElementById("writeData").value;
    writeToCharacteristic(data);
});
