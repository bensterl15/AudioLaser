async function connectToESP32() {
    try {
        console.log("Requesting Bluetooth Device...");

        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ["battery_service"] // Replace with your ESP32 service UUID
        });

        console.log("Selected device:", device.name || "Unnamed Device");

        const server = await device.gatt.connect();
        console.log("Connected to GATT Server");

        const services = await server.getPrimaryServices();
        console.log("Discovered Services:", services);

        // Retrieve all characteristics
        let characteristicsList = [];
        for (const service of services) {
            const characteristics = await service.getCharacteristics();
            for (const char of characteristics) {
                characteristicsList.push({
                    service: service.uuid,
                    characteristic: char.uuid,
                    characteristicObj: char // Store the characteristic object
                });
            }
        }

        console.log("Characteristics:", characteristicsList);
        displayCharacteristics(characteristicsList);

    } catch (error) {
        console.error("Error connecting to Bluetooth device:", error);
    }
}

// Function to display characteristics in the table
function displayCharacteristics(characteristicsList) {
    let tableBody = document.querySelector("#characteristicsTable tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    characteristicsList.forEach((item, index) => {
        let row = document.createElement("tr");

        let serviceCell = document.createElement("td");
        serviceCell.textContent = item.service;
        row.appendChild(serviceCell);

        let characteristicCell = document.createElement("td");
        characteristicCell.textContent = item.characteristic;
        row.appendChild(characteristicCell);

        let actionCell = document.createElement("td");
        let inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Enter value";

        let writeButton = document.createElement("button");
        writeButton.textContent = "Write";
        writeButton.onclick = () => writeCharacteristic(item.characteristicObj, inputField.value);

        actionCell.appendChild(inputField);
        actionCell.appendChild(writeButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

// Function to write to a characteristic
async function writeCharacteristic(characteristic, value) {
    try {
        let encoder = new TextEncoder();
        let data = encoder.encode(value);

        await characteristic.writeValue(data);
        console.log(`Wrote value "${value}" to characteristic ${characteristic.uuid}`);
    } catch (error) {
        console.error("Error writing to characteristic:", error);
    }
}

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", () => {
    const connectButton = document.getElementById("connectBtn");
    if (connectButton) {
        connectButton.addEventListener("click", connectToESP32);
    } else {
        console.error("Button not found!");
