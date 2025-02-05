const serviceUuid = '12345678-1234-5678-1234-56789abcdef0';
const characteristicUuid = 'abcdef01-1234-5678-1234-56789abcdef0';

let bluetoothDevice;
let characteristic;

async function connectBluetooth() {
    try {
        console.log("Requesting Bluetooth Device...");
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [serviceUuid]
        });

        console.log("Connecting to GATT Server...");
        const server = await bluetoothDevice.gatt.connect();

        console.log("Getting Service...");
        const service = await server.getPrimaryService(serviceUuid);

        console.log("Getting Characteristic...");
        characteristic = await service.getCharacteristic(characteristicUuid);

        console.log("Connected! Ready to communicate.");

        // ✅ Check if Notify is supported before enabling notifications
        if (characteristic.properties.notify) {
            await characteristic.startNotifications();
            characteristic.addEventListener("characteristicvaluechanged", handleNotifications);
            console.log("Notifications enabled.");
        } else {
            console.warn("Notifications not supported on this characteristic.");
        }

        // Read initial value
        const value = await characteristic.readValue();
        console.log("Received:", new TextDecoder().decode(value));
        
    } catch (error) {
        console.error("Error connecting to Bluetooth device:", error);
    }
}

function handleNotifications(event) {
    let value = new TextDecoder().decode(event.target.value);
    console.log("Received Notification:", value);
}

async function sendData(data) {
    if (!characteristic) {
        console.error("No Bluetooth connection.");
        return;
    }
    try {
        const encoder = new TextEncoder();
        await characteristic.writeValue(encoder.encode(data));
        console.log("Sent:", data);
    } catch (error) {
        console.error("Error sending data:", error);
    }
}

document.querySelector("#connectButton").addEventListener("click", connectBluetooth);
document.querySelector("#sendOn").addEventListener("click", () => sendData("1"));
document.querySelector("#sendOff").addEventListener("click", () => sendData("0"));
