// --- Component Data ---
const componentData = {
    dht22: { name: 'DHT22 Sensor', icon: 'fas fa-thermometer-half', tip: 'Good for basic temperature and humidity readings.', requires: { data: ['gpio'], power: 1, ground: 1 } },
    bmp280: { name: 'BMP280 Sensor', icon: 'fas fa-tachometer-alt', tip: 'Uses I2C, leaving more GPIO pins free for other things.', requires: { data: ['i2c'], power: 1, ground: 1 } },
    servo: {
        name: 'Servo Motor',
        icon: 'fas fa-sliders-h',
        tip: 'Ideal for movement. Prefers a PWM-capable GPIO pin for best results.',
        notes: 'Small servos can be powered by the board. Larger servos require a separate, higher-current power supply.',
        requires: { data: ['gpio'], power: 1, ground: 1 }
    },
    led: {
        name: 'LED',
        icon: 'fas fa-lightbulb',
        tip: "A simple indicator. Don't forget a current-limiting resistor!",
        notes: 'An LED needs a GPIO for signal and a ground. The power comes from the GPIO pin itself.',
        requires: { data: ['gpio'], ground: 1 }
    },
    lcd: { name: 'LCD Display', icon: 'fas fa-code', tip: 'Great for displaying text. Connects via the I2C bus.', requires: { data: ['i2c'], power: 1, ground: 1 } },
    wifi: {
        name: 'WiFi Module',
        icon: 'fas fa-broadcast-tower',
        tip: 'Uses the SPI bus for fast communication. Good for IoT projects.',
        requires: { data: ['spi'], power: 1, ground: 1 }
    },
    pushButton: {
        name: 'Push Button',
        icon: 'fas fa-dot-circle',
        tip: 'A basic input. Use with an internal pull-up/pull-down resistor if available.',
        requires: { data: ['gpio'], ground: 1 }
    },
    stepperDriver: {
        name: 'Stepper Motor Driver',
        icon: 'fas fa-cogs',
        tip: 'Provides precise motor control. Remember it needs its own power source for the motor.',
        notes: 'Represents a driver like A4988. Requires at least 2 GPIOs (e.g., STEP, DIR). The planner will only allocate one; you must manually reserve the others.',
        requires: { data: ['gpio'], power: 1, ground: 1 }
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
        pinLayout: { top: '9%', right: '24.3%', gap: '1px 6.9%' },
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