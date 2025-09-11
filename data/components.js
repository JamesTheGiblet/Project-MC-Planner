// --- Component Data ---
const componentData = {
    // --- SENSORS ---
    dht22: {
        name: 'DHT22 Sensor',
        icon: 'fas fa-thermometer-half',
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
        category: 'Sensors',
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
    photoresistor: {
        name: 'Photoresistor (LDR)',
        icon: 'far fa-lightbulb',
        category: 'Sensors',
        tip: 'Light-Dependent Resistor for detecting ambient light levels.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 }, // Needs an ADC pin
        dependencies: [{
            type: 'resistor',
            value: '10kΩ',
            purpose: 'voltage_divider',
            description: 'Pull-down resistor for voltage divider',
            reason: 'An LDR needs to be in a voltage divider to produce a variable voltage.',
            required: true
        }],
        notes: 'Requires an Analog (ADC) pin to read values.'
    },
    soil_moisture: {
        name: 'Soil Moisture Sensor',
        icon: 'fas fa-leaf',
        category: 'Sensors',
        tip: 'Detects moisture level in soil. Has both analog and digital outputs.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Use the Analog Output (AO) pin for variable moisture levels. The Digital Output (DO) is a simple threshold.'
    },
    sound_sensor: {
        name: 'Sound Detection Sensor',
        icon: 'fas fa-microphone-alt',
        category: 'Sensors',
        tip: 'Detects sound levels. Has both analog and digital outputs.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Useful for detecting claps or loud noises. Analog output gives sound intensity.'
    },
    mq2_gas_sensor: {
        name: 'MQ-2 Gas Sensor',
        icon: 'fas fa-smog',
        category: 'Sensors',
        tip: 'Detects smoke, LPG, and other combustible gases.',
        voltage: '5V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['Sensor can get hot during operation.', 'Requires a warm-up period for accurate readings.'],
        notes: 'Provides both analog and digital outputs.'
    },
    hall_effect_sensor: {
        name: 'Hall Effect Sensor',
        icon: 'fas fa-magnet',
        category: 'Sensors',
        tip: 'Detects the presence of a magnetic field.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Digital output switches when a magnet is near. Useful for RPM counters or non-contact switches.'
    },
    flex_sensor: {
        name: 'Flex Sensor',
        icon: 'fas fa-band-aid',
        category: 'Sensors',
        tip: 'A variable resistor that changes resistance when bent.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 1, ground: 1 }, // Needs ADC
        dependencies: [{
            type: 'resistor',
            value: '10kΩ-47kΩ',
            purpose: 'voltage_divider',
            description: 'Fixed resistor for voltage divider',
            reason: 'Flex sensor needs to be in a voltage divider to read values.',
            required: true
        }],
        notes: 'Requires an Analog (ADC) pin. Resistance increases as it bends.'
    },
    fsr: {
        name: 'Force Sensitive Resistor (FSR)',
        icon: 'fas fa-compress-arrows-alt',
        category: 'Sensors',
        tip: 'Detects physical pressure, squeeze, and weight.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 1, ground: 1 }, // Needs ADC
        dependencies: [{
            type: 'resistor',
            value: '10kΩ',
            purpose: 'voltage_divider',
            description: 'Pull-down resistor for voltage divider',
            reason: 'FSRs are variable resistors and need a voltage divider circuit.',
            required: true
        }],
        notes: 'Requires an Analog (ADC) pin. Resistance decreases as pressure increases.'
    },

    ir_receiver: {
        name: 'IR Receiver Sensor',
        icon: 'fas fa-satellite-dish',
        category: 'Sensors',
        tip: 'Receives signals from infrared remote controls.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Outputs a demodulated signal. Best used with a dedicated IR library.'
    },

    water_level_sensor: {
        name: 'Water Level Sensor',
        icon: 'fas fa-water',
        category: 'Sensors',
        tip: 'Detects water level through exposed parallel traces.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 }, // ADC
        dependencies: [],
        warnings: ['Sensor traces will corrode over time with DC current. Power it from a GPIO pin only when reading to extend its life.'],
        notes: 'Provides an analog value corresponding to the water level. Requires an ADC pin.'
    },

    // --- DISPLAYS ---
    oled_128x64: {
        name: 'OLED Display (128x64)',
        icon: 'fas fa-tv',
        category: 'Displays',
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
        category: 'Displays',
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
        category: 'Displays',
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
    nokia_5110_lcd: {
        name: 'Nokia 5110 LCD',
        icon: 'fas fa-mobile-alt',
        category: 'Displays',
        tip: 'Classic 84x48 pixel monochrome LCD.',
        voltage: '3.3V',
        complexity: 'moderate',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Requires 5 GPIO pins for a software SPI-like interface (RST, CE, DC, DIN, CLK).',
        pins_required: 5
    },
    e_ink_display: {
        name: 'E-Ink/E-Paper Display',
        icon: 'fas fa-book-open',
        category: 'Displays',
        tip: 'Low-power, high-contrast display that holds an image without power.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['E-Ink displays have slow refresh rates and are not suitable for animation.'],
        notes: 'Requires multiple GPIO pins for SPI and control (DIN, CLK, CS, DC, RST, BUSY).',
        pins_required: 6
    },

    max7219_matrix: {
        name: '8x8 LED Matrix (MAX7219)',
        icon: 'fas fa-border-all',
        category: 'Displays',
        tip: '8x8 LED matrix display driven by a MAX7219 chip.',
        voltage: '5V',
        complexity: 'moderate',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Requires 3 GPIO pins for SPI (Data, Clock, CS). Can be daisy-chained.',
        pins_required: 3
    },

    // --- INPUT ---
    pushButton: {
        name: 'Push Button',
        icon: 'fas fa-dot-circle',
        category: 'Input',
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
        category: 'Input',
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
        category: 'Input',
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
        warnings: ['Arduino Uno: Use analog pins A0-A5 for X/Y axes'],
    },
    potentiometer: {
        name: 'Potentiometer',
        icon: 'fas fa-sliders-h',
        category: 'Input',
        tip: 'A variable resistor used as an analog input knob.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Connect the middle pin to an Analog (ADC) pin. The other two pins connect to power and ground.'
    },
    matrix_keypad_4x4: {
        name: 'Matrix Keypad (4x4)',
        icon: 'fas fa-th',
        category: 'Input',
        tip: '16-button keypad arranged in a 4x4 grid.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 0, ground: 0 },
        dependencies: [],
        notes: 'Requires 8 GPIO pins (4 for rows, 4 for columns). No external power needed.',
        pins_required: 8
    },
    dip_switch: {
        name: 'DIP Switch',
        icon: 'fas fa-toggle-off',
        category: 'Input',
        tip: 'A set of manual electric switches in a small package.',
        voltage: '3.3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 0, ground: 1 },
        dependencies: [{
            type: 'resistor',
            value: '10kΩ',
            purpose: 'pull_up_down',
            description: 'Pull-up or pull-down resistors for each switch',
            reason: 'Prevents floating inputs for each switch pin.',
            required: true,
            quantity: 'per_switch',
            alternative: 'Use internal pull-ups on the microcontroller.'
        }],
        notes: 'Each switch requires one GPIO pin. Useful for setting configuration modes.'
    },
    capacitive_touch_sensor: {
        name: 'Capacitive Touch Sensor',
        icon: 'fas fa-hand-pointer',
        category: 'Input',
        tip: 'A simple touch-sensitive switch (TTP223B).',
        voltage: '2V-5.5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Outputs a digital HIGH signal when touched.'
    },


    // --- OUTPUT ---
    led: {
        name: 'LED',
        icon: 'fas fa-lightbulb',
        category: 'Output',
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
        category: 'Output',
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
        category: 'Output',
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
        category: 'Output',
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
    rgb_led_cc: {
        name: 'RGB LED (Common Cathode)',
        icon: 'fas fa-lightbulb',
        category: 'Output',
        tip: 'A single LED that can produce multiple colors.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 0, ground: 1 },
        dependencies: [{
            type: 'resistor',
            value: '220Ω-330Ω',
            purpose: 'current_limiting',
            description: 'Current limiting resistor for each color channel (R, G, B)',
            reason: 'Prevents LED burnout by limiting current to each channel.',
            required: true,
            quantity: 3
        }],
        notes: 'Requires 3 GPIO pins (one for each color). The common pin connects to Ground.',
        pins_required: 3
    },
    laser_module: {
        name: 'Laser Diode Module',
        icon: 'fas fa-crosshairs',
        category: 'Output',
        tip: 'Emits a small laser beam.',
        voltage: '5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['Never point a laser at eyes. Can cause permanent damage.'],
        notes: 'Can be turned on and off with a simple digital HIGH/LOW signal.'
    },
    vibration_motor: {
        name: 'Vibration Motor',
        icon: 'fas fa-vibrator',
        category: 'Output',
        tip: 'A small motor for haptic feedback, like in a phone.',
        voltage: '3V-5V',
        complexity: 'simple',
        requires: { data: ['gpio'], power: 0, ground: 1 },
        dependencies: [{
            type: 'transistor',
            description: 'Transistor (e.g., PN2222) and Diode',
            purpose: 'motor_control',
            reason: 'A transistor is needed to handle the motor\'s current, and a flyback diode protects the GPIO pin.',
            required: true
        }],
        notes: 'Can be driven by a simple digital HIGH/LOW signal through a transistor.'
    },

    // --- COMMUNICATION ---
    esp01: {
        name: 'ESP-01 WiFi Module',
        icon: 'fas fa-wifi',
        category: 'Communication',
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
        category: 'Communication',
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
    nrf24l01: {
        name: 'NRF24L01+ RF Transceiver',
        icon: 'fas fa-broadcast-tower',
        category: 'Communication',
        tip: '2.4GHz wireless communication module.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['Module is strictly 3.3V. 5V on data pins can damage it.'],
        notes: 'Requires SPI plus 2 additional GPIO pins (CE, CSN).',
        pins_required: 5
    },
    rfid_mfrc522: {
        name: 'RFID Reader (MFRC522)',
        icon: 'fas fa-id-card',
        category: 'Communication',
        tip: 'Reads 13.56MHz RFID tags and cards.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['Module is strictly 3.3V. 5V on data pins can damage it.'],
        notes: 'Requires SPI plus 2 additional GPIO pins (SDA/CS, RST).',
        pins_required: 5
    },
    gps_neo6m: {
        name: 'GPS Module (NEO-6M)',
        icon: 'fas fa-map-marker-alt',
        category: 'Communication',
        tip: 'Receives satellite signals to determine geographic location.',
        voltage: '3.3V-5V',
        complexity: 'complex',
        requires: { data: ['uart'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Connect the module\'s TX pin to the microcontroller\'s RX pin, and vice-versa.'
    },
    can_bus_module: {
        name: 'CAN Bus Module (MCP2515)',
        icon: 'fas fa-bus',
        category: 'Communication',
        tip: 'Allows communication on a CAN bus, common in automotive applications.',
        voltage: '5V',
        complexity: 'complex',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Requires SPI plus an interrupt pin (INT) for efficient operation.',
        pins_required: 4
    },
    lora_module: {
        name: 'LoRa Module (RFM95/SX127x)',
        icon: 'fas fa-wifi',
        category: 'Communication',
        tip: 'Long-range, low-power radio transceiver.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: { data: ['spi'], power: 1, ground: 1 },
        dependencies: [],
        warnings: ['Module is strictly 3.3V. 5V on data pins will damage it.'],
        notes: 'Requires SPI plus GPIO pins for RESET and DIO0 (Interrupt).',
        pins_required: 5
    },

    // --- MOTORS ---
    stepper_28byj: {
        name: '28BYJ-48 Stepper Motor',
        icon: 'fas fa-cog',
        category: 'Motors & Drivers',
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
        category: 'Motors & Drivers',
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
    dc_motor: {
        name: 'DC Motor',
        icon: 'fas fa-fan',
        category: 'Motors & Drivers',
        tip: 'A simple motor that spins when power is applied.',
        voltage: '3V-12V',
        complexity: 'moderate',
        requires: { data: [], power: 1, ground: 1 },
        dependencies: [{
            type: 'driver_board',
            description: 'Motor Driver (e.g., L298N, Transistor)',
            purpose: 'motor_control',
            reason: 'Motors require more current than GPIO pins can supply and can create damaging back-EMF.',
            required: true
        }],
        warnings: ['Never connect a motor directly to a microcontroller GPIO pin.'],
        notes: 'Speed can be controlled with PWM from the microcontroller to the driver.'
    },
    a4988_driver: {
        name: 'A4988 Stepper Driver',
        icon: 'fas fa-microchip',
        category: 'Motors & Drivers',
        tip: 'Driver for controlling bipolar stepper motors (like NEMA 17).',
        voltage: '3.3V-5V (Logic), 8V-35V (Motor)',
        complexity: 'complex',
        requires: { data: ['gpio'], power: 2, ground: 2 },
        dependencies: [{
            type: 'capacitor',
            value: '100µF',
            purpose: 'power_smoothing',
            description: 'Decoupling capacitor for motor power supply',
            reason: 'Protects the driver from voltage spikes.',
            required: true,
            connection: 'across_motor_power'
        }],
        notes: 'Requires 2 GPIO pins (STEP, DIR) for basic control. Microstepping pins can be tied to GND/VCC or controlled by GPIO.',
        pins_required: 2
    },
    stepper_nema17: {
        name: 'NEMA 17 Stepper Motor',
        icon: 'fas fa-cogs',
        category: 'Motors & Drivers',
        tip: 'A standard bipolar stepper motor for CNC and 3D printers.',
        voltage: '12V-24V',
        complexity: 'complex',
        requires: { data: [], power: 0, ground: 0 },
        dependencies: [{
            type: 'driver_board',
            description: 'Stepper Motor Driver (e.g., A4988, DRV8825)',
            purpose: 'motor_control',
            reason: 'Bipolar stepper motors require a specialized driver to energize coils in sequence.',
            required: true
        }],
        warnings: ['Requires a separate power supply capable of handling the motor\'s current draw.'],
        notes: 'Typically has 4 or 6 wires. Must be connected to a stepper driver, not directly to a microcontroller.'
    },

    // --- ADVANCED & MISC ---
    ws2812_strip: {
        name: 'WS2812 LED Strip (NeoPixel)',
        icon: 'fas fa-rainbow',
        category: 'Advanced & ICs',
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
        category: 'Advanced & ICs',
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
        category: 'Advanced & ICs',
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
        category: 'Advanced & ICs',
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
    },
    shift_register_74hc595: {
        name: '74HC595 Shift Register',
        icon: 'fas fa-expand-arrows-alt',
        category: 'Advanced & ICs',
        tip: 'Serial-in, parallel-out shift register for expanding GPIO outputs.',
        voltage: '2V-6V',
        complexity: 'moderate',
        requires: { data: ['gpio'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Control 8 outputs with just 3 GPIO pins (Data, Clock, Latch). Can be daisy-chained.',
        pins_required: 3
    },
    pcf8574_expander: {
        name: 'I2C GPIO Expander (PCF8574)',
        icon: 'fas fa-project-diagram',
        category: 'Advanced & ICs',
        tip: 'Adds 8 extra GPIO pins using the I2C bus.',
        voltage: '2.5V-6V',
        complexity: 'moderate',
        requires: { data: ['i2c'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Address can be changed with A0-A2 pins, allowing multiple expanders on one bus.',
        i2cAddress: '0x20-0x27'
    },

    // --- POWER MANAGEMENT ---
    breadboard_psu: {
        name: 'Breadboard Power Supply',
        icon: 'fas fa-plug',
        category: 'Power Management',
        tip: 'Provides 3.3V and 5V rails directly to a breadboard.',
        voltage: '6.5V-12V (Input)',
        complexity: 'simple',
        requires: { data: [], power: 0, ground: 0 },
        dependencies: [],
        notes: 'Plugs directly into a standard breadboard. Powered by a barrel jack or USB.'
    },
    tp4056_charger: {
        name: 'TP4056 LiPo Charger',
        icon: 'fas fa-battery-three-quarters',
        category: 'Power Management',
        tip: 'A module for charging single-cell Lithium-Ion/Polymer batteries.',
        voltage: '5V (Input)',
        complexity: 'simple',
        requires: { data: [], power: 0, ground: 0 },
        dependencies: [],
        notes: 'Charges a 3.7V LiPo battery from a 5V source like USB. Some versions include battery protection.'
    },
    buck_boost_converter: {
        name: 'Buck/Boost Converter',
        icon: 'fas fa-level-down-alt',
        category: 'Power Management',
        tip: 'Steps voltage up (boost) or down (buck) to a stable output.',
        voltage: 'Variable',
        complexity: 'moderate',
        requires: { data: [], power: 0, ground: 0 },
        dependencies: [],
        notes: 'Essential for providing a stable voltage to your project from a variable source like a battery.'
    },
    ina219_current_sensor: {
        name: 'INA219 Current Sensor',
        icon: 'fas fa-bolt',
        category: 'Power Management',
        tip: 'High-side DC current and power sensor with I2C interface.',
        voltage: '3.3V-5V',
        complexity: 'moderate',
        requires: { data: ['i2c'], power: 1, ground: 1 },
        dependencies: [],
        notes: 'Measures voltage and current on a separate power rail up to 26V.',
        i2cAddress: '0x40-0x4F'
    }
};