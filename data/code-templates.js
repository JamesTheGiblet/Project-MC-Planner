const codeGenerator = {
    generate: function(projectData) {
        if (!projectData || !projectData.assignments || projectData.assignments.length === 0) {
            return { language: 'text', code: 'Assign some components to generate starter code.' };
        }

        switch (projectData.boardId) {
            case 'rpi4':
                return this.getPythonCode(projectData);
            case 'uno':
            case 'esp32':
                return this.getArduinoCode(projectData);
            default:
                return { language: 'text', code: `Code generation for ${projectData.boardName} is not yet supported.` };
        }
    },

    getPythonCode: function(projectData) {
        let imports = new Set(['import time']);
        let pinDefs = new Set();
        let setupCode = new Set();
        let loopCode = new Set();

        projectData.assignments.forEach(a => {
            const componentId = a.componentId.split('-')[0]; // Get base ID, e.g., 'dht22'
            switch (componentId) {
                case 'led':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`LED_PIN = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(LED_PIN, GPIO.OUT)`);
                    loopCode.add('GPIO.output(LED_PIN, GPIO.HIGH)');
                    loopCode.add('time.sleep(1)');
                    loopCode.add('GPIO.output(LED_PIN, GPIO.LOW)');
                    loopCode.add('time.sleep(1)');
                    break;
                case 'dht22':
                    imports.add('import Adafruit_DHT');
                    pinDefs.add('DHT_SENSOR = Adafruit_DHT.DHT22');
                    pinDefs.add(`DHT_PIN = ${a.pin}`);
                    loopCode.add('humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)');
                    loopCode.add('if humidity is not None and temperature is not None:');
                    loopCode.add('    print(f"Temp={temperature:.1f}C Humidity={humidity:.1f}%")');
                    loopCode.add('else:');
                    loopCode.add('    print("Failed to retrieve data from humidity sensor")');
                    break;
                case 'bmp280':
                    imports.add('import board');
                    imports.add('import adafruit_bmp280');
                    setupCode.add('i2c = board.I2C()  # uses board.SCL and board.SDA');
                    setupCode.add('bmp280 = adafruit_bmp280.Adafruit_BMP280_I2C(i2c)');
                    loopCode.add('print(f"Temperature: {bmp280.temperature:.2f} C")');
                    loopCode.add('print(f"Pressure: {bmp280.pressure:.2f} hPa")');
                    break;
            }
        });

        const code = `
# PinPoint Planner: Python Starter Code for ${projectData.boardName}

${[...imports].join('\n')}

# --- Pin Definitions ---
${[...pinDefs].join('\n')}

# --- Setup ---
${[...setupCode].join('\n')}
print("Setup complete. Starting main loop...")

try:
    while True:
        # --- Main Loop ---
        ${[...loopCode].join('\n        ') || '# Your code here'}
        
        time.sleep(2)

except KeyboardInterrupt:
    print("Program stopped.")
finally:
    if 'GPIO' in locals():
        GPIO.cleanup()
`;
        return { language: 'python', code: code.trim() };
    },

    getArduinoCode: function(projectData) {
        let includes = new Set();
        let pinDefs = new Set();
        let globals = new Set();
        let setupCode = new Set(['Serial.begin(9600);']);
        let loopCode = new Set();

        projectData.assignments.forEach(a => {
            const componentId = a.componentId.split('-')[0];
            switch (componentId) {
                case 'led':
                    pinDefs.add(`#define LED_PIN ${a.pin}`);
                    setupCode.add(`pinMode(LED_PIN, OUTPUT);`);
                    loopCode.add('digitalWrite(LED_PIN, HIGH);');
                    loopCode.add('delay(1000);');
                    loopCode.add('digitalWrite(LED_PIN, LOW);');
                    loopCode.add('delay(1000);');
                    break;
                case 'dht22':
                    includes.add('#include "DHT.h"');
                    pinDefs.add(`#define DHTPIN ${a.pin}`);
                    pinDefs.add('#define DHTTYPE DHT22');
                    globals.add('DHT dht(DHTPIN, DHTTYPE);');
                    setupCode.add('dht.begin();');
                    loopCode.add(`float h = dht.readHumidity();`);
                    loopCode.add(`float t = dht.readTemperature();`);
                    loopCode.add(`Serial.print("Humidity: "); Serial.println(h);`);
                    break;
            }
        });

        const code = `
// PinPoint Planner: Arduino C++ Starter Code for ${projectData.boardName}

${[...includes].join('\n')}

// --- Pin Definitions ---
${[...pinDefs].join('\n')}

// --- Global Objects ---
${[...globals].join('\n')}

void setup() {
    // --- Setup Code ---
    ${[...setupCode].join('\n    ')}
}

void loop() {
    // --- Main Loop ---
    ${[...loopCode].join('\n    ') || '// Your code here'}
}
`;
        return { language: 'cpp', code: code.trim() };
    }
};