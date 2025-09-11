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
                    pinDefs.add(`LED_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(LED_PIN_${a.pin}, GPIO.OUT)`);
                    loopCode.add(`GPIO.output(LED_PIN_${a.pin}, GPIO.HIGH)`);
                    loopCode.add('time.sleep(1)');
                    loopCode.add(`GPIO.output(LED_PIN_${a.pin}, GPIO.LOW)`);
                    loopCode.add('time.sleep(1)');
                    break;
                case 'dht22':
                    imports.add('import Adafruit_DHT');
                    pinDefs.add('DHT_SENSOR = Adafruit_DHT.DHT22');
                    pinDefs.add(`DHT_PIN_${a.pin} = ${a.pin}`);
                    loopCode.add(`humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN_${a.pin})`);
                    loopCode.add('if humidity is not None and temperature is not None:');
                    loopCode.add(`    print(f"DHT22 on pin {a.pin}: Temp={temperature:.1f}C Humidity={humidity:.1f}%")`);
                    loopCode.add('else:');
                    loopCode.add(`    print(f"Failed to retrieve data from DHT22 on pin {a.pin}")`);
                    break;
                case 'pushButton':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`BUTTON_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(BUTTON_PIN_${a.pin}, GPIO.IN, pull_up_down=GPIO.PUD_UP)`);
                    loopCode.add(`if GPIO.input(BUTTON_PIN_${a.pin}) == GPIO.LOW:`);
                    loopCode.add(`    print("Button on pin ${a.pin} was pushed!")`);
                    break;
                case 'servo':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`SERVO_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(SERVO_PIN_${a.pin}, GPIO.OUT)`);
                    setupCode.add(`pwm_${a.pin} = GPIO.PWM(SERVO_PIN_${a.pin}, 50) # 50Hz`);
                    setupCode.add(`pwm_${a.pin}.start(0)`);
                    loopCode.add(`print("Moving servo on pin ${a.pin}")`);
                    loopCode.add(`pwm_${a.pin}.ChangeDutyCycle(5) # 90 degrees`);
                    loopCode.add('time.sleep(1)');
                    loopCode.add(`pwm_${a.pin}.ChangeDutyCycle(10) # 180 degrees`);
                    loopCode.add('time.sleep(1)');
                    break;
                case 'ultrasonic_hcsr04':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`TRIG_PIN_${a.pin} = ${a.pin}`);
                    pinDefs.add(`ECHO_PIN_${a.pin} = ${parseInt(a.pin) + 1} # IMPORTANT: Define your echo pin!`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(TRIG_PIN_${a.pin}, GPIO.OUT)`);
                    setupCode.add(`GPIO.setup(ECHO_PIN_${a.pin}, GPIO.IN)`);
                    loopCode.add(`GPIO.output(TRIG_PIN_${a.pin}, False)`);
                    loopCode.add('time.sleep(0.1)');
                    loopCode.add(`GPIO.output(TRIG_PIN_${a.pin}, True)`);
                    loopCode.add('time.sleep(0.00001)');
                    loopCode.add(`GPIO.output(TRIG_PIN_${a.pin}, False)`);
                    loopCode.add(`while GPIO.input(ECHO_PIN_${a.pin})==0: pass`);
                    loopCode.add('pulse_start = time.time()');
                    loopCode.add(`while GPIO.input(ECHO_PIN_${a.pin})==1: pass`);
                    loopCode.add('pulse_end = time.time()');
                    loopCode.add('pulse_duration = pulse_end - pulse_start');
                    loopCode.add('distance = pulse_duration * 17150');
                    loopCode.add('distance = round(distance, 2)');
                    loopCode.add(`print(f"HC-SR04 on pin {a.pin}: Distance: {distance}cm")`);
                    break;
                case 'buzzer':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`BUZZER_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(BUZZER_PIN_${a.pin}, GPIO.OUT)`);
                    loopCode.add(`print("Buzzer on pin ${a.pin}: ON")`);
                    loopCode.add(`GPIO.output(BUZZER_PIN_${a.pin}, GPIO.HIGH)`);
                    loopCode.add('time.sleep(0.5)');
                    loopCode.add(`print("Buzzer on pin ${a.pin}: OFF")`);
                    loopCode.add(`GPIO.output(BUZZER_PIN_${a.pin}, GPIO.LOW)`);
                    loopCode.add('time.sleep(0.5)');
                    break;
                case 'bmp280':
                    imports.add('import board');
                    imports.add('import adafruit_bmp280');
                    setupCode.add('i2c = board.I2C()  # uses board.SCL and board.SDA');
                    setupCode.add('bmp280 = adafruit_bmp280.Adafruit_BMP280_I2C(i2c)');
                    loopCode.add('print(f"Temperature: {bmp280.temperature:.2f} C")');
                    loopCode.add('print(f"Pressure: {bmp280.pressure:.2f} hPa")');
                    break;
                case 'oled_128x64':
                    imports.add('import board');
                    imports.add('import adafruit_ssd1306');
                    imports.add('from PIL import Image, ImageDraw, ImageFont');
                    setupCode.add('i2c = board.I2C()');
                    setupCode.add('oled = adafruit_ssd1306.SSD1306_I2C(128, 64, i2c)');
                    setupCode.add('oled.fill(0)');
                    setupCode.add('oled.show()');
                    setupCode.add('image = Image.new("1", (oled.width, oled.height))');
                    setupCode.add('draw = ImageDraw.Draw(image)');
                    loopCode.add('draw.rectangle((0, 0, oled.width, oled.height), outline=0, fill=0)');
                    loopCode.add('draw.text((0, 0), "Hello from PinPoint!", fill=255)');
                    loopCode.add('oled.image(image)');
                    loopCode.add('oled.show()');
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
                    pinDefs.add(`#define LED_PIN_${a.pin} ${a.pin}`);
                    setupCode.add(`pinMode(LED_PIN_${a.pin}, OUTPUT);`);
                    loopCode.add(`digitalWrite(LED_PIN_${a.pin}, HIGH);`);
                    loopCode.add('delay(1000);');
                    loopCode.add(`digitalWrite(LED_PIN_${a.pin}, LOW);`);
                    loopCode.add('delay(1000);');
                    break;
                case 'dht22':
                    includes.add('#include "DHT.h"');
                    pinDefs.add(`#define DHTPIN_${a.pin} ${a.pin}`);
                    pinDefs.add(`#define DHTTYPE_${a.pin} DHT22`);
                    globals.add(`DHT dht_${a.pin}(DHTPIN_${a.pin}, DHTTYPE_${a.pin});`);
                    setupCode.add(`dht_${a.pin}.begin();`);
                    loopCode.add(`float h = dht_${a.pin}.readHumidity();`);
                    loopCode.add(`float t = dht_${a.pin}.readTemperature();`);
                    loopCode.add(`if (isnan(h) || isnan(t)) { Serial.println("Failed to read from DHT sensor on pin ${a.pin}!"); return; }`);
                    loopCode.add(`Serial.print("DHT22 on pin ${a.pin} - Humidity: "); Serial.print(h); Serial.print(" %, Temp: "); Serial.print(t); Serial.println(" *C");`);
                    break;
                case 'pushButton':
                    pinDefs.add(`#define BUTTON_PIN_${a.pin} ${a.pin}`);
                    setupCode.add(`pinMode(BUTTON_PIN_${a.pin}, INPUT_PULLUP);`);
                    loopCode.add(`if (digitalRead(BUTTON_PIN_${a.pin}) == LOW) { Serial.println("Button on pin ${a.pin} pressed!"); }`);
                    break;
                case 'servo':
                    includes.add('#include <Servo.h>');
                    pinDefs.add(`#define SERVO_PIN_${a.pin} ${a.pin}`);
                    globals.add(`Servo servo_${a.pin};`);
                    setupCode.add(`servo_${a.pin}.attach(SERVO_PIN_${a.pin});`);
                    loopCode.add(`Serial.println("Moving servo on pin ${a.pin} to 0 degrees"); servo_${a.pin}.write(0); delay(1000);`);
                    loopCode.add(`Serial.println("Moving servo on pin ${a.pin} to 90 degrees"); servo_${a.pin}.write(90); delay(1000);`);
                    loopCode.add(`Serial.println("Moving servo on pin ${a.pin} to 180 degrees"); servo_${a.pin}.write(180); delay(1000);`);
                    break;
                case 'ultrasonic_hcsr04':
                    pinDefs.add(`#define TRIG_PIN_${a.pin} ${a.pin}`);
                    pinDefs.add(`#define ECHO_PIN_${a.pin} ${parseInt(a.pin) + 1} // IMPORTANT: Define your echo pin!`);
                    globals.add(`long duration_${a.pin};`);
                    globals.add(`int distance_${a.pin};`);
                    setupCode.add(`pinMode(TRIG_PIN_${a.pin}, OUTPUT);`);
                    setupCode.add(`pinMode(ECHO_PIN_${a.pin}, INPUT);`);
                    loopCode.add(`digitalWrite(TRIG_PIN_${a.pin}, LOW); delayMicroseconds(2);`);
                    loopCode.add(`digitalWrite(TRIG_PIN_${a.pin}, HIGH); delayMicroseconds(10);`);
                    loopCode.add(`digitalWrite(TRIG_PIN_${a.pin}, LOW);`);
                    loopCode.add(`duration_${a.pin} = pulseIn(ECHO_PIN_${a.pin}, HIGH);`);
                    loopCode.add(`distance_${a.pin} = duration_${a.pin} * 0.034 / 2;`);
                    loopCode.add(`Serial.print("HC-SR04 on pin ${a.pin} - Distance: "); Serial.print(distance_${a.pin}); Serial.println(" cm");`);
                    break;
                case 'buzzer':
                    pinDefs.add(`#define BUZZER_PIN_${a.pin} ${a.pin}`);
                    setupCode.add(`pinMode(BUZZER_PIN_${a.pin}, OUTPUT);`);
                    loopCode.add(`Serial.println("Buzzer on pin ${a.pin}: Beep!");`);
                    loopCode.add(`tone(BUZZER_PIN_${a.pin}, 1000); delay(500);`);
                    loopCode.add(`noTone(BUZZER_PIN_${a.pin}); delay(500);`);
                    break;
                case 'bmp280':
                    includes.add('#include <Wire.h>');
                    includes.add('#include <Adafruit_Sensor.h>');
                    includes.add('#include <Adafruit_BMP280.h>');
                    globals.add('Adafruit_BMP280 bmp; // I2C');
                    setupCode.add('if (!bmp.begin(0x76)) { Serial.println(F("Could not find a valid BMP280 sensor, check wiring!")); while (1); }');
                    loopCode.add('Serial.print(F("BMP280 - Temp: ")); Serial.print(bmp.readTemperature()); Serial.print(" *C, ");');
                    loopCode.add('Serial.print(F("Pressure: ")); Serial.print(bmp.readPressure() / 100.0F); Serial.println(" hPa");');
                    break;
                case 'oled_128x64':
                    includes.add('#include <Wire.h>');
                    includes.add('#include <Adafruit_GFX.h>');
                    includes.add('#include <Adafruit_SSD1306.h>');
                    pinDefs.add('#define SCREEN_WIDTH 128');
                    pinDefs.add('#define SCREEN_HEIGHT 64');
                    pinDefs.add('#define OLED_RESET -1');
                    globals.add('Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);');
                    setupCode.add('if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { Serial.println(F("SSD1306 allocation failed")); for(;;); }');
                    setupCode.add('display.clearDisplay();');
                    setupCode.add('display.setTextSize(1); display.setTextColor(SSD1306_WHITE); display.setCursor(0,0);');
                    setupCode.add('display.println(F("Hello from PinPoint!"));');
                    setupCode.add('display.display();');
                    loopCode.add('// OLED code is in setup, loop is empty for this example.');
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
    delay(2000); // Delay to prevent spamming the serial monitor
}
`;
        return { language: 'cpp', code: code.trim() };
    }
};