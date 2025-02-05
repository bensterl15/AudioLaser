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
            characteristicsList.push({
                service: service.uuid,
                characteristics: characteristics.map(c => c.uuid)
            });
        }

        console.log("Characteristics:", characteristicsList);
        displayCharacteristics(characteristicsList);

    } catch (error) {
        console.error("Error connecting to Bluetooth device:", error);
    }
}

// Function to display characteristics in a table
function displayCharacteristics(characteristicsList) {
    let tableHTML = `<table border="1"><tr><th>Service UUID</th><th>Characteristic UUIDs</th></tr>`;

    characteristicsList.forEach(service => {
        tableHTML += `<tr><td>${service.service}</td><td>${service.characteristics.join("<br>")}</td></tr>`;
    });

    tableHTML += `</table>`;

    document.getElementById("characteristicsTable").innerHTML = tableHTML;
}

// Attach event listener to the button
document.addEventListener("DOMContentLoaded", () => {
    const connectButton = document.getElementById("connectBtn");
    if (connectButton) {
        connectButton.addEventListener("click", connectToESP32);
    } else {
        console.error("Button not found!");
    }
});
