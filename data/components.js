// --- Component Data ---
const componentData = {
    // --- SENSORS ---
    dht22: {
        name: 'DHT22 Sensor',
        icon: 'fas fa-thermometer-half',
        tip: 'Digital temperature and humidity sensor. Works directly with data pin.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Built-in pull-up resistor. Connect directly to GPIO pin.'
    },
    bmp280: {
        name: 'BMP280 Pressure Sensor',
        icon: 'fas fa-tachometer-alt',
        tip: 'Barometric pressure and temperature sensor with I2C interface.',
        voltage: '3.3V',
        complexity: 'simple',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Usually comes on breakout board with built-in voltage regulation.',
        i2cAddress: '0x76 or 0x77'
    },
    bme680: {
        name: 'BME680 Air Quality Sensor',
        icon: 'fas fa-wind',
        tip: 'Air quality sensor measuring temperature, humidity, pressure, and gas.',
        voltage: '3.3V',
        complexity: 'moderate',
        requires: {
            data: ['i2c', 'spi'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Premium environmental sensor with gas resistance measurement.',
        i2cAddress: '0x76 or 0x77'
    },
    ds18b20: {
        name: 'DS18B20 Temperature Sensor',
        icon: 'fas fa-thermometer-three-quarters',
        tip: 'Waterproof digital temperature sensor using 1-Wire protocol.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'resistor',
            value: '4.7kΩ',
            purpose: 'pull_up',
            description: '1-Wire pull-up resistor',
            reason: '1-Wire protocol requires pull-up resistor on data line',
            required: true,
            connection: 'gpio_to_power'
        }],
        notes: 'Perfect for temperature monitoring in wet environments.'
    },
    pir: {
        name: 'PIR Motion Sensor',
        icon: 'fas fa-walking',
        tip: 'Passive infrared motion sensor for detecting movement.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Digital output (HIGH when motion detected). Has sensitivity adjustment.',
        warmupTime: '30-60 seconds'
    },
    ultrasonic_hcsr04: {
        name: 'HC-SR04 Ultrasonic Sensor',
        icon: 'fas fa-broadcast-tower',
        tip: 'Ultrasonic distance sensor for measuring distances 2-400cm.',
        voltage: '5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'level_shifter',
            purpose: 'voltage_protection',
            description: 'Voltage divider or level shifter for ECHO pin',
            reason: 'ECHO pin outputs 5V which can damage 3.3V boards',
            required: true,
            boardSpecific: {
                uno: {
                    required: false,
                    reason: 'Arduino Uno operates at 5V'
                }
            }
        }],
        notes: 'TRIG pin can accept 3.3V, but ECHO outputs 5V.',
        pins_required: 2,
        warnings: ['ECHO pin outputs 5V - protect 3.3V boards']
    },
    mpu6050: {
        name: 'MPU6050 Gyro/Accel',
        icon: 'fas fa-compass',
        tip: 'MEMS motion tracking device. Usually comes on breakout board.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'breakout_board',
            purpose: 'voltage_regulation',
            description: 'MPU6050 breakout board with onboard 3.3V regulator',
            required: false,
            reason: 'Raw MPU6050 chip is difficult to solder and needs external components'
        }, {
            type: 'resistor',
            value: '4.7kΩ',
            purpose: 'i2c_pullup',
            description: 'Pull-up resistors for I2C SDA and SCL lines',
            required: true,
            quantity: 2,
            connection: 'sda_scl_to_power',
            alternative: 'Many breakout boards include these resistors'
        }],
        notes: 'Most breakout boards include voltage regulation and I2C pull-ups.',
        codeHints: {
            rpi4: 'Enable I2C: sudo raspi-config → Interface → I2C',
            uno: 'Use Wire.h library for I2C communication'
        }
    },
    mpu9250: {
        name: 'MPU9250 9-Axis IMU',
        icon: 'fas fa-cube',
        tip: '9-axis inertial measurement unit with gyroscope, accelerometer, and magnetometer.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: {
            data: ['i2c', 'spi'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'resistor',
            value: '4.7kΩ',
            purpose: 'i2c_pullup',
            description: 'Pull-up resistors for I2C lines',
            required: true,
            quantity: 2,
            alternative: 'Many breakout boards include these resistors'
        }],
        notes: 'More advanced than MPU6050. Includes magnetometer for compass heading.',
        i2cAddress: '0x68 or 0x69'
    },

    // --- DISPLAYS ---
    oled_128x64: {
        name: 'OLED Display (128x64)',
        icon: 'fas fa-tv',
        tip: 'Small OLED display with excellent contrast and I2C interface.',
        voltage: '3.3V',
        complexity: 'simple',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'No backlight needed. Great for battery-powered projects.',
        i2cAddress: '0x3C or 0x3D'
    },
    lcd: {
        name: 'LCD Display (16x2)',
        icon: 'fas fa-desktop',
        tip: 'Character LCD display. I2C backpack highly recommended.',
        voltage: '5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Built-in pull-up resistor. Connect directly to GPIO pin.'
    },
    tm1637: {
        name: '7-Segment Display (TM1637)',
        icon: 'fas fa-digital-tachograph',
        tip: '4-digit 7-segment LED display with simple 2-wire interface.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Uses custom 2-wire protocol (CLK and DIO). Library available.',
        pins_required: 2
    },

    // --- INPUT ---
    pushButton: {
        name: 'Push Button',
        icon: 'fas fa-dot-circle',
        tip: 'Momentary contact switch for user input.',
        voltage: '3.3V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'resistor',
            value: '10kΩ',
            purpose: 'pull_up',
            description: 'Pull-up resistor',
            reason: 'Prevents floating input state when button is not pressed',
            required: true,
            connection: 'gpio_to_power',
            alternative: 'Many boards have internal pull-up resistors that can be enabled in software'
        }],
        notes: 'Connect button between GPIO and GND, with pull-up resistor from GPIO to 3.3V.',
        codeHints: {
            rpi4: 'GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)',
            uno: 'pinMode(pin, INPUT_PULLUP)',
            esp32: 'pinMode(pin, INPUT_PULLUP)'
        }
    },
    rotary_encoder: {
        name: 'Rotary Encoder',
        icon: 'fas fa-redo-alt',
        tip: 'Rotary encoder for precise directional input with optional push button.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'resistor',
            value: '10kΩ',
            purpose: 'pull_up',
            description: 'Pull-up resistors for encoder pins',
            reason: 'Prevents floating inputs and improves signal reliability',
            required: true,
            quantity: 2,
            connection: 'gpio_to_power',
            alternative: 'Many boards support internal pull-ups'
        }],
        notes: 'Requires 2-3 GPIO pins (A, B, and optional SW). Use interrupts for best performance.',
        pins_required: 3
    },
    joystick: {
        name: 'Analog Joystick',
        icon: 'fas fa-gamepad',
        tip: 'Analog joystick module with X/Y analog outputs and push button.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Requires ADC pins for X/Y axes and digital pin for button.',
        pins_required: 3,
        warnings: ['Arduino Uno: Use analog pins A0-A5 for X/Y axes']
    },

    // --- OUTPUT ---
    led: {
        name: 'LED',
        icon: 'fas fa-lightbulb',
        tip: 'Light emitting diode for visual indication.',
        voltage: '2.0V-3.3V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'], ground: 1
        },
        dependencies: [{
            type: 'resistor',
            value: '220Ω-330Ω',
            purpose: 'current_limiting',
            description: 'Current limiting resistor',
            reason: 'Prevents LED burnout by limiting current flow',
            required: true,
            connection: 'series_with_data'
        }],
        warnings: ['Never connect LED directly to GPIO - will damage both LED and board'],
        notes: 'ALWAYS use a current-limiting resistor!'
    },
    servo: {
        name: 'Servo Motor',
        icon: 'fas fa-sliders-h',
        tip: 'Precision motor with position control. Power requirements vary by size.',
        voltage: '4.8V-6V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'], ground: 1
        },
        dependencies: [{
            type: 'power_supply',
            value: '5V 1A+',
            purpose: 'servo_power',
            description: 'External 5V power supply',
            reason: 'Servos can draw high current, especially under load',
            required: false, // Small servos can run off board power
            condition: 'For servos drawing &gt;500mA or multiple servos'
        }],
        notes: 'Small servos (SG90) can be powered from board. Larger servos need external power.',
        warnings: ['Connect servo ground to board ground even with external power'],
        powerChart: {
            'SG90 (micro)': 'Board power OK',
            'MG996R (standard)': 'External power recommended',
            'Multiple servos': 'External power required'
        }
    },
    buzzer: {
        name: 'Passive Buzzer',
        icon: 'fas fa-volume-up',
        tip: 'Passive buzzer for generating tones and simple melodies.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Requires PWM signal to generate tones. Use tone() function on Arduino.'
    },
    relay: {
        name: 'Relay Module',
        icon: 'fas fa-toggle-on',
        tip: 'Electromagnetic relay for controlling high-power devices.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'optocoupler',
            purpose: 'isolation',
            description: 'Optical isolation',
            reason: 'Protects microcontroller from relay coil back-EMF',
            required: false,
            alternative: 'Most relay modules include optocoupler isolation'
        }],
        notes: 'Most modules include optocoupler isolation and flyback diode.',
        warnings: ['Never control mains voltage without proper safety measures']
    },

    // --- COMMUNICATION ---
    esp01: {
        name: 'ESP-01 WiFi Module',
        icon: 'fas fa-wifi',
        tip: 'WiFi module for adding wireless connectivity to projects.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: {
            data: ['uart'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'level_shifter',
            purpose: 'voltage_compatibility',
            description: '5V to 3.3V level shifter',
            reason: 'ESP-01 is 3.3V only and can be damaged by 5V signals',
            required: true,
            boardSpecific: {
                rpi4: {
                    required: false,
                    reason: 'Raspberry Pi GPIO is already 3.3V'
                },
                esp32: {
                    required: false,
                    reason: 'ESP32 is already 3.3V'
                }
            }
        }, {
            type: 'power_supply',
            value: '3.3V 250mA+',
            purpose: 'stable_power',
            description: 'Stable 3.3V power supply',
            reason: 'ESP-01 needs stable power, especially during WiFi transmission',
            required: true
        }],
        warnings: ['Never connect to 5V - will permanently damage module', 'Needs stable 3.3V power supply for reliable operation'],
        notes: 'AT command interface. Consider ESP32 for new projects.'
    },
    hc05: {
        name: 'HC-05 Bluetooth Module',
        icon: 'fas fa-bluetooth-b',
        tip: 'Classic Bluetooth module for wireless communication.',
        voltage: '3.3V-6V',
        complexity: 'moderate',
        requires: {
            data: ['uart'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'level_shifter',
            purpose: 'voltage_compatibility',
            description: 'Voltage level shifter',
            reason: 'HC-05 logic levels may not be compatible with 3.3V boards',
            required: false,
            condition: 'Check module specifications - some have onboard regulation'
        }],
        notes: 'AT command interface for configuration. Pairs with smartphones easily.'
    },

    // --- MOTORS ---
    stepper_28byj: {
        name: '28BYJ-48 Stepper Motor',
        icon: 'fas fa-cog',
        tip: 'Small stepper motor with ULN2003 driver board.',
        voltage: '5V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'driver_board',
            description: 'ULN2003 stepper driver',
            purpose: 'motor_control',
            reason: 'Stepper motor requires driver to control multiple coils',
            required: true
        }],
        notes: 'Usually sold with ULN2003 driver board. Requires 4 digital pins.',
        pins_required: 4
    },
    l298n: {
        name: 'L298N Motor Driver',
        icon: 'fas fa-car-side',
        tip: 'Dual H-bridge motor driver for DC motors or single stepper motor.',
        voltage: '5V-35V',
        complexity: 'complex',
        requires: {
            data: ['gpio'],
            power: 0, // Uses external power
            ground: 1
        },
        dependencies: [{
            type: 'power_supply',
            value: '7-35V 2A+',
            purpose: 'motor_power',
            description: 'External power supply for motors',
            reason: 'Motors require much more current than boards can provide',
            required: true
        }],
        notes: 'Can control 2 DC motors or 1 stepper. Always connect grounds together.',
        pins_required: 6,
        warnings: ['Always connect board GND to driver GND']
    },

    // --- ADVANCED & MISC ---
    ws2812_strip: {
        name: 'WS2812 LED Strip (NeoPixel)',
        icon: 'fas fa-rainbow',
        tip: 'Addressable RGB LED strip. Complex setup with multiple dependencies.',
        voltage: '5V',
        complexity: 'complex',
        powerRequirement: 'High current - external power supply required',
        requires: {
            data: ['gpio'],
            ground: 2,
            power: 0
        },
        dependencies: [
            {
                type: 'level_shifter',
                purpose: 'logic_level',
                description: '3.3V to 5V logic level converter',
                reason: 'WS2812 needs 5V logic levels, but Pi/ESP32 output 3.3V',
                required: true,
                boardSpecific: {
                    uno: { required: false, reason: 'Arduino Uno operates at 5V' }
                }
            },
            {
                type: 'power_supply',
                value: '5V 2A+',
                purpose: 'external_power',
                description: 'External 5V power supply',
                reason: 'LED strips can draw several amps - far more than board can supply',
                required: true,
            },
            {
                type: 'capacitor',
                value: '1000µF',
                purpose: 'power_smoothing',
                description: 'Large electrolytic capacitor',
                reason: 'Smooths power supply current spikes from LEDs',
                required: true,
                connection: 'across_power_supply'
            }
        ],
        warnings: [
            'Never power LED strip directly from board - will damage board',
            'Always connect grounds between board, level shifter, and power supply',
            'Consider adding 330Ω resistor in series with data line for protection'
        ],
        notes: 'Complex setup requiring external power, level shifting, and proper grounding.'
    },
    sd_card: {
        name: 'SD Card Module',
        icon: 'fas fa-save',
        tip: 'SD card reader for data logging and storage.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: {
            data: ['spi'],
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'level_shifter',
            purpose: 'voltage_compatibility',
            description: '5V to 3.3V level shifter',
            reason: 'SD cards operate at 3.3V logic levels',
            required: false,
            alternative: 'Most modules include onboard voltage regulation'
        }],
        notes: 'Most modules handle voltage conversion automatically.',
        pins_required: 4
    },
    rtc_ds3231: {
        name: 'DS3231 RTC Module',
        icon: 'fas fa-clock',
        tip: 'Precision real-time clock module with temperature compensation.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [],
        notes: 'Battery backup maintains time when power is off. Very accurate.',
        i2cAddress: '0x68'
    },
    camera_ov2640: {
        name: 'OV2640 Camera Module',
        icon: 'fas fa-camera',
        tip: 'Camera module for ESP32-CAM projects.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: {
            data: ['gpio'], // Uses many pins
            power: 1,
            ground: 1
        },
        dependencies: [{
            type: 'power_supply',
            value: '3.3V 500mA+',
            purpose: 'camera_power',
            description: 'Stable 3.3V power supply',
            reason: 'Camera module draws significant current during operation',
            required: true
        }],
        notes: 'Requires ESP32-CAM board or compatible. Uses dedicated camera interface.',
        boardSpecific: ['esp32'],
        pins_required: 8
    }
};