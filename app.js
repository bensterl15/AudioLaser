let bleCharacteristic = null;
let mediaRecorder;
let audioChunks = [];
let recordedAudioBlob = null; // Store recorded audio

document.addEventListener("DOMContentLoaded", function() {
    
    // RECORDING CODE:
    const recordBtn = document.getElementById("recordBtn");
    const sendAudioBtn = document.getElementById("sendAudioBtn");
    const indicator = document.getElementById("recordingIndicator");

    recordBtn.addEventListener("click", async function() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                recordedAudioBlob = new Blob(audioChunks, { type: 'audio/wav' }); // Save for later
                const audioUrl = URL.createObjectURL(recordedAudioBlob);
                document.getElementById("audioPlayback").src = audioUrl;
                audioChunks = [];  // Clear buffer for next recording

                // Reset button and hide indicator
                recordBtn.disabled = false;
                recordBtn.textContent = "Record (5s)";
                indicator.style.display = "none";

                // Enable send button now that recording is ready
                sendAudioBtn.disabled = false;
            };

            // Start recording for 5 seconds
            mediaRecorder.start();
            console.log("Recording started...");

            // Change button text and show indicator
            recordBtn.disabled = true;
            recordBtn.textContent = "Recording...";
            indicator.style.display = "inline";

            setTimeout(() => {
                mediaRecorder.stop();
                console.log("Recording stopped.");
            }, 5000);
        } catch (error) {
            console.error("Error accessing microphone:", error);
        }
    });

    
    // BLUETOOTH:
    document.getElementById("sendBtn").addEventListener("click", async function() {
        try {
            console.log("Requesting Bluetooth Device...");
            const device = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: ["12345678-1234-5678-1234-56789abcdef0"] // Your SERVICE_UUID
            });

            console.log("Connecting to GATT Server...");
            const server = await device.gatt.connect();

            console.log("Getting Service...");
            const service = await server.getPrimaryService("12345678-1234-5678-1234-56789abcdef0");

            console.log("Getting Characteristic...");
            bleCharacteristic = await service.getCharacteristic("abcdef01-1234-5678-1234-56789abcdef0");

            console.log("Connected! Ready to communicate.");

            // Enable send button if audio is already recorded
            if (recordedAudioBlob) {
                sendAudioBtn.disabled = false;
            }
        } catch (error) {
            console.error("Error connecting to Bluetooth device:", error);
        }
    });

    // **Function to send recorded audio over Bluetooth when user clicks "Send Audio"**
    document.getElementById("sendAudioBtn").addEventListener("click", async function() {
        if (!recordedAudioBlob) {
            console.error("No recorded audio to send.");
            return;
        }

        if (!bleCharacteristic) {
            console.error("Bluetooth characteristic not connected.");
            return;
        }

        // Convert Blob to ArrayBuffer
        const arrayBuffer = await recordedAudioBlob.arrayBuffer();
        const chunkSize = 20; // BLE max payload size
        let offset = 0;

        console.log("Sending audio data over BLE...");

        // Send data in chunks
        while (offset < arrayBuffer.byteLength) {
            const chunk = arrayBuffer.slice(offset, offset + chunkSize);
            await bleCharacteristic.writeValue(new Uint8Array(chunk));
            offset += chunkSize;

            // Optional: Delay to avoid buffer overflow
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log("Audio transmission complete.");
    });
});
