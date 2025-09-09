// --- Component Data ---
const componentData = {
    // Simple components that work directly
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
    
    // Components requiring resistors
    led: {
        name: 'LED',
        icon: 'fas fa-lightbulb',
        tip: 'Light emitting diode for visual indication.',
        voltage: '2.0V-3.3V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            ground: 1
        },
        dependencies: [
            {
                type: 'resistor',
                value: '220Ω-330Ω',
                purpose: 'current_limiting',
                description: 'Current limiting resistor',
                reason: 'Prevents LED burnout by limiting current flow',
                required: true,
                connection: 'series_with_data'
            }
        ],
        warnings: ['Never connect LED directly to GPIO - will damage both LED and board'],
        notes: 'ALWAYS use a current-limiting resistor!'
    },

    // Components requiring pull-up/pull-down resistors
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
        dependencies: [
            {
                type: 'resistor',
                value: '10kΩ',
                purpose: 'pull_up',
                description: 'Pull-up resistor',
                reason: 'Prevents floating input state when button is not pressed',
                required: true,
                connection: 'gpio_to_power',
                alternative: 'Many boards have internal pull-up resistors that can be enabled in software'
            }
        ],
        notes: 'Connect button between GPIO and GND, with pull-up resistor from GPIO to 3.3V.',
        codeHints: {
            rpi4: 'GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_UP)',
            uno: 'pinMode(pin, INPUT_PULLUP)',
            esp32: 'pinMode(pin, INPUT_PULLUP)'
        }
    },

    // Components requiring level shifters
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

    // Components requiring breakout boards
    mpu6050: {
        name: 'MPU6050 Gyroscope/Accelerometer',
        icon: 'fas fa-compass',
        tip: 'MEMS motion tracking device. Usually comes on breakout board.',
        voltage: '3.3V',
        complexity: 'complex',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [
            {
                type: 'breakout_board',
                purpose: 'voltage_regulation',
                description: 'MPU6050 breakout board with onboard 3.3V regulator',
                required: false,
                reason: 'Raw MPU6050 chip is difficult to solder and needs external components'
            },
            {
                type: 'resistor',
                value: '4.7kΩ',
                purpose: 'i2c_pullup',
                description: 'Pull-up resistors for I2C SDA and SCL lines',
                required: true,
                quantity: 2,
                connection: 'sda_scl_to_power',
                alternative: 'Many breakout boards include these resistors'
            }
        ],
        notes: 'Most breakout boards include voltage regulation and I2C pull-ups.',
        codeHints: {
            rpi4: 'Enable I2C: sudo raspi-config → Interface → I2C',
            uno: 'Use Wire.h library for I2C communication'
        }
    },

    // Servo with external power considerations
    servo: {
        name: 'Servo Motor',
        icon: 'fas fa-sliders-h',
        tip: 'Precision motor with position control. Power requirements vary by size.',
        voltage: '4.8V-6V',
        complexity: 'moderate',
        requires: {
            data: ['gpio'],
            ground: 1
        },
        dependencies: [
            {
                type: 'power_supply',
                value: '5V 1A+',
                purpose: 'servo_power',
                description: 'External 5V power supply',
                reason: 'Servos can draw high current, especially under load',
                required: false, // Small servos can run off board power
                condition: 'For servos drawing &gt;500mA or multiple servos'
            }
        ],
        notes: 'Small servos (SG90) can be powered from board. Larger servos need external power.',
        warnings: ['Connect servo ground to board ground even with external power'],
        powerChart: {
            'SG90 (micro)': 'Board power OK',
            'MG996R (standard)': 'External power recommended',
            'Multiple servos': 'External power required'
        }
    },

    // LCD requiring I2C backpack
    lcd: {
        name: 'LCD Display (16x2)',
        icon: 'fas fa-desktop',
        tip: 'Character LCD display. I2C backpack highly recommended.',
        voltage: '5V',
        complexity: 'moderate',
        requires: {
            data: ['i2c'],
            power: 1,
            ground: 1
        },
        dependencies: [
            {
                type: 'i2c_backpack',
                purpose: 'pin_reduction',
                description: 'I2C backpack (PCF8574)',
                reason: 'Reduces pin count from 6+ to just 2 pins',
                required: false,
                alternative: 'Can connect directly but uses 6+ GPIO pins'
            },
            {
                type: 'level_shifter',
                purpose: 'voltage_compatibility',
                description: '3.3V to 5V level shifter',
                reason: 'Most LCDs are 5V devices',
                required: true,
                boardSpecific: {
                    uno: { required: false, reason: 'Arduino Uno operates at 5V' }
                }
            }
        ],
        directConnection: {
            pins_required: 6,
            connections: ['VSS→GND', 'VDD→5V', 'V0→Contrast(pot)', 'RS→GPIO', 'Enable→GPIO', 'D4-D7→GPIO'],
            pros: 'No additional components needed',
            cons: 'Uses many GPIO pins, requires 5V logic levels'
        },
        notes: 'I2C backpack makes connection much simpler and saves pins.'
    }
};

// --- Board Data ---
const boardData = {
    rpi4: {
        title: 'Raspberry Pi 4 Pinout',
        name: 'Raspberry Pi 4 Model B',
        image: 'images/Raspberry Pi 4B.png',
        width: 1600,
        height: 967,
        pinLayout: { top: '9%', right: '23%', gap: '1px 6.9%' },
        layout: '2col-grid',
        pins: [
            { name: '3.3V', type: 'power', title: 'Pin 1: 3.3V Power Rail' },
            { name: '5V', type: 'power', title: 'Pin 2: 5V Power Rail' },
            { name: '2', type: 'i2c', title: 'Pin 3: GPIO 2 (I2C1, SDA)' },
            { name: '5V', type: 'power', title: 'Pin 4: 5V Power Rail' },
            { name: '3', type: 'i2c', title: 'Pin 5: GPIO 3 (I2C1, SCL)' },
            { name: 'GND', type: 'ground', title: 'Pin 6: Ground' },
            { name: '4', type: 'gpio', title: 'Pin 7: GPIO 4 (GPCLK0)' },
            { name: '14', type: 'uart', title: 'Pin 8: GPIO 14 (UART TXD)' },
            { name: 'GND', type: 'ground', title: 'Pin 9: Ground' },
            { name: '15', type: 'uart', title: 'Pin 10: GPIO 15 (UART RXD)' },
            { name: '17', type: 'gpio', title: 'Pin 11: GPIO 17' },
            { name: '18', type: 'gpio', title: 'Pin 12: GPIO 18 (PWM0)' },
            { name: '27', type: 'gpio', title: 'Pin 13: GPIO 27' },
            { name: 'GND', type: 'ground', title: 'Pin 14: Ground' },
            { name: '22', type: 'gpio', title: 'Pin 15: GPIO 22' },
            { name: '23', type: 'gpio', title: 'Pin 16: GPIO 23' },
            { name: '3.3V', type: 'power', title: 'Pin 17: 3.3V Power Rail' },
            { name: '24', type: 'gpio', title: 'Pin 18: GPIO 24' },
            { name: '10', type: 'spi', title: 'Pin 19: GPIO 10 (SPI0, MOSI)' },
            { name: 'GND', type: 'ground', title: 'Pin 20: Ground' },
            { name: '9', type: 'spi', title: 'Pin 21: GPIO 9 (SPI0, MISO)' },
            { name: '25', type: 'gpio', title: 'Pin 22: GPIO 25' },
            { name: '11', type: 'spi', title: 'Pin 23: GPIO 11 (SPI0, SCLK)' },
            { name: '8', type: 'spi', title: 'Pin 24: GPIO 8 (SPI0, CE0)' },
            { name: 'GND', type: 'ground', title: 'Pin 25: Ground' },
            { name: '7', type: 'spi', title: 'Pin 26: GPIO 7 (SPI0, CE1)' },
            { name: 'ID_SD', type: 'i2c', title: 'Pin 27: ID_SD (I2C ID EEPROM)' },
            { name: 'ID_SC', type: 'i2c', title: 'Pin 28: ID_SC (I2C ID EEPROM)' },
            { name: '5', type: 'gpio', title: 'Pin 29: GPIO 5' },
            { name: 'GND', type: 'ground', title: 'Pin 30: Ground' },
            { name: '6', type: 'gpio', title: 'Pin 31: GPIO 6' },
            { name: '12', type: 'gpio', title: 'Pin 32: GPIO 12 (PWM0)' },
            { name: '13', type: 'gpio', title: 'Pin 33: GPIO 13 (PWM1)' },
            { name: 'GND', type: 'ground', title: 'Pin 34: Ground' },
            { name: '19', type: 'spi', title: 'Pin 35: GPIO 19 (SPI1, MISO)' },
            { name: '16', type: 'gpio', title: 'Pin 36: GPIO 16' },
            { name: '26', type: 'gpio', title: 'Pin 37: GPIO 26' },
            { name: '20', type: 'spi', title: 'Pin 38: GPIO 20 (SPI1, MOSI)' },
            { name: 'GND', type: 'ground', title: 'Pin 39: Ground' },
            { name: '21', type: 'spi', title: 'Pin 40: GPIO 21 (SPI1, SCLK)' },
        ]
    },
    uno: {
        title: 'Arduino Uno Pinout',
        name: 'Arduino Uno R3',
        image: 'images/Arduino_Uno.png',
        width: 800,
        height: 620,
        layout: '1col-list',
        pins: [
            // Digital Pins
            { name: '0', type: 'uart', title: 'Pin 0: Digital (RX)' },
            { name: '1', type: 'uart', title: 'Pin 1: Digital (TX)' },
            { name: '2', type: 'gpio', title: 'Pin 2: Digital' },
            { name: '3', type: 'gpio', title: 'Pin 3: Digital (PWM)' },
            { name: '4', type: 'gpio', title: 'Pin 4: Digital' },
            { name: '5', type: 'gpio', title: 'Pin 5: Digital (PWM)' },
            { name: '6', type: 'gpio', title: 'Pin 6: Digital (PWM)' },
            { name: '7', type: 'gpio', title: 'Pin 7: Digital' },
            { name: '8', type: 'gpio', title: 'Pin 8: Digital' },
            { name: '9', type: 'gpio', title: 'Pin 9: Digital (PWM)' },
            { name: '10', type: 'spi', title: 'Pin 10: Digital (SPI SS, PWM)' },
            { name: '11', type: 'spi', title: 'Pin 11: Digital (SPI MOSI, PWM)' },
            { name: '12', type: 'spi', title: 'Pin 12: Digital (SPI MISO)' },
            { name: '13', type: 'spi', title: 'Pin 13: Digital (SPI SCK)' },
            // Analog Pins
            { name: 'A0', type: 'gpio', title: 'Pin A0: Analog In' },
            { name: 'A1', type: 'gpio', title: 'Pin A1: Analog In' },
            { name: 'A2', type: 'gpio', title: 'Pin A2: Analog In' },
            { name: 'A3', type: 'gpio', title: 'Pin A3: Analog In' },
            { name: 'A4', type: 'i2c', title: 'Pin A4: Analog In (I2C SDA)' },
            { name: 'A5', type: 'i2c', title: 'Pin A5: Analog In (I2C SCL)' },
            // Power Pins
            { name: 'VIN', type: 'power', title: 'Power: Voltage In' },
            { name: 'GND', type: 'ground', title: 'Power: Ground' },
            { name: 'GND', type: 'ground', title: 'Power: Ground' },
            { name: '5V', type: 'power', title: 'Power: 5V' },
            { name: '3.3V', type: 'power', title: 'Power: 3.3V' },
            { name: 'RESET', type: 'gpio', title: 'Power: Reset' },
        ]
    },
    esp32: {
        title: 'ESP32 DevKitC',
        name: 'ESP32 DevKitC',
        image: 'images/esp32.png',
        width: 800,
        height: 450,
        pinLayout: { top: '7%', right: '16.25%', gap: '5px 13.75%' },
        layout: '2col-grid',
        pins: [
            { name: 'GND', type: 'ground', title: 'Ground' }, { name: 'GND', type: 'ground', title: 'Ground' },
            { name: '23', type: 'spi', title: 'GPIO 23 (MOSI)' }, { name: '13', type: 'gpio', title: 'GPIO 13' },
            { name: '22', type: 'i2c', title: 'GPIO 22 (SCL)' }, { name: '12', type: 'gpio', title: 'GPIO 12' },
            { name: '1', type: 'uart', title: 'GPIO 1 (TXD)' }, { name: '14', type: 'gpio', title: 'GPIO 14' },
            { name: '3', type: 'uart', title: 'GPIO 3 (RXD)' }, { name: '27', type: 'gpio', title: 'GPIO 27' },
            { name: '21', type: 'i2c', title: 'GPIO 21 (SDA)' }, { name: '26', type: 'gpio', title: 'GPIO 26' },
            { name: '19', type: 'spi', title: 'GPIO 19 (MISO)' }, { name: '25', type: 'gpio', title: 'GPIO 25' },
            { name: '18', type: 'spi', title: 'GPIO 18 (SCK)' }, { name: '33', type: 'gpio', title: 'GPIO 33' },
            { name: '5', type: 'spi', title: 'GPIO 5 (CS)' }, { name: '32', type: 'gpio', title: 'GPIO 32' },
            { name: '17', type: 'gpio', title: 'GPIO 17' }, { name: '35', type: 'gpio', title: 'GPIO 35' },
            { name: '16', type: 'gpio', title: 'GPIO 16' }, { name: '34', type: 'gpio', title: 'GPIO 34' },
            { name: '4', type: 'gpio', title: 'GPIO 4' }, { name: '39', type: 'gpio', title: 'GPIO 39 (VN)' },
            { name: '2', type: 'gpio', title: 'GPIO 2' }, { name: '36', type: 'gpio', title: 'GPIO 36 (VP)' },
            { name: '15', type: 'gpio', title: 'GPIO 15' }, { name: 'EN', type: 'power', title: 'Enable' },
            { name: '5V', type: 'power', title: '5V Power In' }, { name: '3.3V', type: 'power', title: '3.3V Power Out' },
        ]
    }
};

// Enhanced dependency resolver
class DependencyResolver {
    constructor(componentData) {
        this.componentData = componentData;
    }

    isDependencyRequired(dependency, boardType) {
        // Check board-specific overrides first
        if (dependency.boardSpecific && dependency.boardSpecific[boardType]) {
            const boardSpec = dependency.boardSpecific[boardType];
            if (typeof boardSpec.required === 'boolean') {
                return boardSpec.required;
            }
        }
        
        // Check for optional conditions (e.g. for larger servos)
        if (dependency.condition && dependency.required === false) {
            return 'optional';
        }
        
        // Default to the base 'required' property
        return dependency.required;
    }

    // Get all dependencies for a component assignment
    getComponentDependencies(componentId, boardType = 'rpi4') {
        const component = this.componentData[componentId];
        if (!component || !component.dependencies) return [];

        return component.dependencies.map(dep => {
            const requiredStatus = this.isDependencyRequired(dep, boardType);
            let boardReason = null;
            if (dep.boardSpecific && dep.boardSpecific[boardType]) {
                boardReason = dep.boardSpecific[boardType].reason || null;
            }

            return {
                ...dep,
                componentId,
                componentName: component.name,
                requiredStatus: requiredStatus, // true, false, or 'optional'
                boardReason: boardReason
            };
        });
    }

    // Generate enhanced BOM including dependencies
    generateEnhancedBOM(assignments, boardType = 'rpi4') {
        const bom = {
            mainComponents: [],
            dependencies: {
                resistors: new Map(),
                capacitors: new Map(),
                powerSupplies: [],
                breakoutBoards: [],
                other: []
            },
            warnings: [],
            notes: []
        };

        // Count main components
        const componentCounts = {};
        assignments.forEach(assignment => {
            componentCounts[assignment.componentId] = (componentCounts[assignment.componentId] || 0) + 1;
        });

        // Add main components to BOM
        for (const [componentId, count] of Object.entries(componentCounts)) {
            const component = this.componentData[componentId];
            bom.mainComponents.push({
                name: component.name,
                quantity: count,
                voltage: component.voltage,
                notes: component.tip
            });

            // Collect warnings
            if (component.warnings) {
                bom.warnings.push(...component.warnings);
            }

            // Process dependencies
            const dependencies = this.getComponentDependencies(componentId, boardType);
            dependencies.forEach(dep => {
                // Only add required or optional dependencies to the BOM
                if (dep.requiredStatus === false) {
                    // If not needed, check if there's an alternative to mention
                    if (dep.alternative) {
                        bom.notes.push(`${component.name}: ${dep.alternative}`);
                    }
                    if (dep.boardReason) {
                         bom.notes.push(`${component.name} (${dep.description}): ${dep.boardReason}`);
                    }
                    return;
                }

                const quantity = (dep.quantity || 1) * count;

                switch (dep.type) {
                    case 'resistor':
                        const resistorKey = `${dep.value} (${dep.purpose})`;
                        const currentCount = bom.dependencies.resistors.get(resistorKey) || 0;
                        bom.dependencies.resistors.set(resistorKey, currentCount + quantity);
                        break;
                    
                    case 'capacitor':
                        const capacitorKey = `${dep.value} (${dep.purpose})`;
                        const currentCapCount = bom.dependencies.capacitors.get(capacitorKey) || 0;
                        bom.dependencies.capacitors.set(capacitorKey, currentCapCount + quantity);
                        break;
                    
                    case 'power_supply':
                        bom.dependencies.powerSupplies.push({
                            specification: dep.value,
                            purpose: dep.description,
                            quantity: count
                        });
                        break;
                    
                    case 'level_shifter':
                    case 'i2c_backpack':
                    case 'breakout_board':
                        bom.dependencies.breakoutBoards.push({
                            name: dep.description,
                            purpose: dep.purpose,
                            quantity: count,
                            required: dep.required
                        });
                        break;
                    
                    default:
                        bom.dependencies.other.push({
                            name: dep.description,
                            type: dep.type,
                            quantity: quantity,
                            required: dep.required
                        });
                }
            });
        }

        return bom;
    }

    // Generate enhanced wiring diagram with dependencies
    generateEnhancedWiring(assignments, boardType = 'rpi4') {
        const wiring = [];

        assignments.forEach(assignment => {
            const component = this.componentData[assignment.componentId];
            const dependencies = this.getComponentDependencies(assignment.componentId, boardType);

            // Main component connections
            wiring.push({
                type: 'main',
                from: `${component.name} (DATA)`,
                to: `${assignment.boardName} (Pin ${assignment.pin})`,
                component: assignment.componentId
            });

            // Dependency connections
            dependencies.forEach(dep => {
                if (dep.requiredStatus === false) return;

                switch (dep.type) {
                    case 'resistor':
                        if (dep.connection === 'series_with_data') {
                            wiring.push({
                                type: 'resistor',
                                value: dep.value,
                                from: `Board Pin ${assignment.pin}`,
                                to: `${dep.value} Resistor`,
                                component: assignment.componentId
                            });
                            wiring.push({
                                type: 'resistor',
                                from: `${dep.value} Resistor`,
                                to: `${component.name} (+)`,
                                component: assignment.componentId
                            });
                        } else if (dep.connection === 'gpio_to_power') {
                            wiring.push({
                                type: 'resistor',
                                value: dep.value,
                                from: `Board Pin ${assignment.pin}`,
                                to: `3.3V via ${dep.value} resistor`,
                                component: assignment.componentId
                            });
                        }
                        break;
                    
                    case 'level_shifter':
                        wiring.push({
                            type: 'level_shifter',
                            from: `Board Pin ${assignment.pin} (3.3V)`,
                            to: `Level Shifter Input`,
                            component: assignment.componentId
                        });
                        wiring.push({
                            type: 'level_shifter',
                            from: `Level Shifter Output (5V)`,
                            to: `${component.name} (DATA)`,
                            component: assignment.componentId
                        });
                        break;
                }
            });

            // Add warnings as special wiring notes
            if (component.warnings) {
                component.warnings.forEach(warning => {
                    wiring.push({
                        type: 'warning',
                        message: warning,
                        component: assignment.componentId
                    });
                });
            }
        });

        return wiring;
    }
}