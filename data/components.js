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