let bleCharacteristic = null;
let mediaRecorder;
let audioChunks = [];

document.addEventListener("DOMContentLoaded", function() {
    
    // RECORDING CODE:
    // Recording Button Click Event
    document.getElementById("recordBtn").addEventListener("click", async function() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                document.getElementById("audioPlayback").src = audioUrl;
                audioChunks = [];  // Clear buffer for next recording
            };

            // Start recording for 5 seconds
            mediaRecorder.start();
            console.log("Recording started...");
            setTimeout(() => {
                mediaRecorder.stop();
                console.log("Recording stopped.");
            }, 5000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    });
    
    
    // BLUETOOTH:
    // Function to handle incoming data from the Bluetooth characteristic
    function handleCharacteristicValueChanged(event) {
        let value = event.target.value;
        let decoder = new TextDecoder("utf-8");
        console.log("Notification received:", decoder.decode(value));
    }

    // Add event listener to the connect button
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

            // Read the initial value with error handling
            try {
                let value = await bleCharacteristic.readValue();
                let decoder = new TextDecoder("utf-8");
                console.log("Received:", decoder.decode(value));
            } catch (readError) {
                console.error("Error reading characteristic value:", readError);
            }

            // Set up notifications (if supported)
            try {
                await bleCharacteristic.startNotifications();
                console.log("Listening for notifications...");
                bleCharacteristic.addEventListener("characteristicvaluechanged", handleCharacteristicValueChanged);
            } catch (err) {
                console.error("Notifications not supported:", err);
                // Fallback if notifications are not supported (you can still read/write)
            }

        } catch (error) {
            console.error("Error connecting to Bluetooth device:", error);
        }
    });

    // Function to write data to the Bluetooth characteristic
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
});
