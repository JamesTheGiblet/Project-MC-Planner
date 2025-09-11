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
                case 'bme680':
                    imports.add('import board');
                    imports.add('import adafruit_bme680');
                    setupCode.add('i2c = board.I2C()');
                    setupCode.add('bme680 = adafruit_bme680.Adafruit_BME680_I2C(i2c)');
                    setupCode.add('bme680.sea_level_pressure = 1013.25');
                    loopCode.add('print("\\n--- BME680 Sensor ---")');
                    loopCode.add('print(f"Temperature: {bme680.temperature:.1f} C")');
                    loopCode.add('print(f"Gas: {bme680.gas:.1f} ohm")');
                    loopCode.add('print(f"Humidity: {bme680.humidity:.1f} %")');
                    loopCode.add('print(f"Pressure: {bme680.pressure:.1f} hPa")');
                    loopCode.add('print(f"Altitude: {bme680.altitude:.1f} meters")');
                    break;
                case 'pir':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`PIR_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(PIR_PIN_${a.pin}, GPIO.IN)`);
                    loopCode.add(`if GPIO.input(PIR_PIN_${a.pin}): print("PIR on pin ${a.pin} detected motion!")`);
                    break;
                case 'relay':
                case 'laser_module':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`RELAY_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(RELAY_PIN_${a.pin}, GPIO.OUT)`);
                    loopCode.add(`print("Toggling relay/laser on pin ${a.pin}")`);
                    loopCode.add(`GPIO.output(RELAY_PIN_${a.pin}, GPIO.HIGH)`);
                    loopCode.add('time.sleep(1)');
                    loopCode.add(`GPIO.output(RELAY_PIN_${a.pin}, GPIO.LOW)`);
                    break;
                case 'hall_effect_sensor':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`HALL_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(HALL_PIN_${a.pin}, GPIO.IN, pull_up_down=GPIO.PUD_UP)`);
                    loopCode.add(`if GPIO.input(HALL_PIN_${a.pin}) == GPIO.LOW: print("Hall effect sensor on pin ${a.pin} detected a magnet!")`);
                    break;
                case 'mpu6050':
                    imports.add('import board');
                    imports.add('import adafruit_mpu6050');
                    setupCode.add('i2c = board.I2C()');
                    setupCode.add('mpu = adafruit_mpu6050.MPU6050(i2c)');
                    loopCode.add('print("\\n--- MPU6050 Sensor ---")');
                    loopCode.add('print(f"Acceleration: X: {mpu.acceleration[0]:.2f}, Y: {mpu.acceleration[1]:.2f}, Z: {mpu.acceleration[2]:.2f} m/s^2")');
                    loopCode.add('print(f"Gyro: X: {mpu.gyro[0]:.2f}, Y: {mpu.gyro[1]:.2f}, Z: {mpu.gyro[2]:.2f} dps")');
                    loopCode.add('print(f"Temperature: {mpu.temperature:.2f} C")');
                    break;
                case 'rtc_ds3231':
                    imports.add('import board');
                    imports.add('import adafruit_ds3231');
                    setupCode.add('i2c = board.I2C()');
                    setupCode.add('ds3231 = adafruit_ds3231.DS3231(i2c)');
                    loopCode.add('t = ds3231.datetime');
                    loopCode.add('print(f"DS3231 RTC: {t.tm_year}/{t.tm_mon}/{t.tm_mday} {t.tm_hour}:{t.tm_min:02}:{t.tm_sec:02}")');
                    break;
                case 'ws2812_strip':
                    imports.add('import board');
                    imports.add('import neopixel');
                    pinDefs.add('NUM_PIXELS = 10 # Change to the number of LEDs in your strip');
                    pinDefs.add(`PIXEL_PIN = board.D${a.pin}`);
                    setupCode.add('pixels = neopixel.NeoPixel(PIXEL_PIN, NUM_PIXELS, brightness=0.2, auto_write=False)');
                    loopCode.add('print("Cycling NeoPixels...")');
                    loopCode.add('pixels.fill((255, 0, 0)); pixels.show(); time.sleep(0.5)');
                    loopCode.add('pixels.fill((0, 255, 0)); pixels.show(); time.sleep(0.5)');
                    loopCode.add('pixels.fill((0, 0, 255)); pixels.show(); time.sleep(0.5)');
                    break;
                case 'photoresistor':
                case 'soil_moisture':
                case 'sound_sensor':
                case 'mq2_gas_sensor':
                case 'flex_sensor':
                case 'fsr':
                case 'water_level_sensor':
                case 'potentiometer':
                case 'joystick':
                    loopCode.add(`# Reading analog sensor '${componentId}' on a Raspberry Pi requires an external ADC (e.g., MCP3008).`);
                    loopCode.add(`# Please see Adafruit's guide on using an ADC with Raspberry Pi.`);
                    break;
                case 'ina219_current_sensor':
                    imports.add('import board');
                    imports.add('import adafruit_ina219');
                    setupCode.add('i2c = board.I2C()');
                    setupCode.add('ina219 = adafruit_ina219.INA219(i2c)');
                    loopCode.add('print("--- INA219 Current Sensor ---")');
                    loopCode.add('print(f"Bus Voltage:   {ina219.bus_voltage:.2f} V")');
                    loopCode.add('print(f"Shunt Voltage: {ina219.shunt_voltage / 1000:.2f} mV")');
                    loopCode.add('print(f"Current:       {ina219.current:.2f} mA")');
                    loopCode.add('print(f"Power:         {ina219.power:.2f} mW")');
                    break;
                case 'capacitive_touch_sensor':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`TOUCH_PIN_${a.pin} = ${a.pin}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`GPIO.setup(TOUCH_PIN_${a.pin}, GPIO.IN)`);
                    loopCode.add(`if GPIO.input(TOUCH_PIN_${a.pin}): print("Touch sensor on pin ${a.pin} was touched!")`);
                    break;
                case 'rgb_led_cc':
                    imports.add('import RPi.GPIO as GPIO');
                    pinDefs.add(`RED_PIN_${a.pin} = ${a.pin} # Assumes sequential pins for RGB`);
                    pinDefs.add(`GREEN_PIN_${a.pin} = ${parseInt(a.pin) + 1}`);
                    pinDefs.add(`BLUE_PIN_${a.pin} = ${parseInt(a.pin) + 2}`);
                    setupCode.add('GPIO.setmode(GPIO.BCM)');
                    setupCode.add(`pins_to_setup = [RED_PIN_${a.pin}, GREEN_PIN_${a.pin}, BLUE_PIN_${a.pin}]`);
                    setupCode.add('GPIO.setup(pins_to_setup, GPIO.OUT)');
                    loopCode.add(`print("Setting RGB LED on pin group ${a.pin} to RED")`);
                    loopCode.add(`GPIO.output([RED_PIN_${a.pin}, GREEN_PIN_${a.pin}, BLUE_PIN_${a.pin}], (GPIO.HIGH, GPIO.LOW, GPIO.LOW))`);
                    loopCode.add('time.sleep(1)');
                    loopCode.add(`print("Setting RGB LED on pin group ${a.pin} to GREEN")`);
                    loopCode.add(`GPIO.output([RED_PIN_${a.pin}, GREEN_PIN_${a.pin}, BLUE_PIN_${a.pin}], (GPIO.LOW, GPIO.HIGH, GPIO.LOW))`);
                    loopCode.add('time.sleep(1)');
                    loopCode.add(`print("Setting RGB LED on pin group ${a.pin} to BLUE")`);
                    loopCode.add(`GPIO.output([RED_PIN_${a.pin}, GREEN_PIN_${a.pin}, BLUE_PIN_${a.pin}], (GPIO.LOW, GPIO.LOW, GPIO.HIGH))`);
                    loopCode.add('time.sleep(1)');
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
                case 'ina219_current_sensor':
                    includes.add('#include <Wire.h>');
                    includes.add('#include <Adafruit_INA219.h>');
                    globals.add('Adafruit_INA219 ina219;');
                    setupCode.add('if (!ina219.begin()) { Serial.println("Failed to find INA219 chip"); while (1) { delay(10); } }');
                    loopCode.add('Serial.println("--- INA219 ---");');
                    loopCode.add('Serial.print("Bus Voltage:   "); Serial.print(ina219.getBusVoltage_V()); Serial.println(" V");');
                    loopCode.add('Serial.print("Current:       "); Serial.print(ina219.getCurrent_mA()); Serial.println(" mA");');
                    break;
                case 'capacitive_touch_sensor':
                    pinDefs.add(`#define TOUCH_PIN_${a.pin} ${a.pin}`);
                    setupCode.add(`pinMode(TOUCH_PIN_${a.pin}, INPUT);`);
                    loopCode.add(`if (digitalRead(TOUCH_PIN_${a.pin}) == HIGH) { Serial.println("Touch sensor on pin ${a.pin} was touched!"); }`);
                    break;
                case 'potentiometer':
                    pinDefs.add(`#define POT_PIN_${a.pin} ${a.pin}`);
                    loopCode.add(`int potValue = analogRead(POT_PIN_${a.pin});`);
                    loopCode.add(`Serial.print("Potentiometer on pin ${a.pin}: "); Serial.println(potValue);`);
                    break;
                case 'rgb_led_cc':
                    pinDefs.add(`#define RED_PIN_${a.pin} ${a.pin} // Assumes sequential PWM pins for RGB`);
                    pinDefs.add(`#define GREEN_PIN_${a.pin} ${parseInt(a.pin) + 1}`);
                    pinDefs.add(`#define BLUE_PIN_${a.pin} ${parseInt(a.pin) + 2}`);
                    setupCode.add(`pinMode(RED_PIN_${a.pin}, OUTPUT); pinMode(GREEN_PIN_${a.pin}, OUTPUT); pinMode(BLUE_PIN_${a.pin}, OUTPUT);`);
                    loopCode.add(`Serial.println("Cycling RGB LED on pin group ${a.pin}");`);
                    loopCode.add(`analogWrite(RED_PIN_${a.pin}, 255); analogWrite(GREEN_PIN_${a.pin}, 0); analogWrite(BLUE_PIN_${a.pin}, 0); delay(500);`);
                    loopCode.add(`analogWrite(RED_PIN_${a.pin}, 0); analogWrite(GREEN_PIN_${a.pin}, 255); analogWrite(BLUE_PIN_${a.pin}, 0); delay(500);`);
                    loopCode.add(`analogWrite(RED_PIN_${a.pin}, 0); analogWrite(GREEN_PIN_${a.pin}, 0); analogWrite(BLUE_PIN_${a.pin}, 255); delay(500);`);
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