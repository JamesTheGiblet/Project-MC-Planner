const componentData = {
    dht22: { name: 'DHT22 Sensor', icon: 'fas fa-thermometer-half', requires: { data: ['gpio'], power: 1, ground: 1 } },
    bmp280: { name: 'BMP280 Sensor', icon: 'fas fa-tachometer-alt', requires: { data: ['i2c'], power: 1, ground: 1 } },
    servo: {
        name: 'Servo Motor',
        icon: 'fas fa-sliders-h',
        // Servos often need a separate, higher-current 5V source, but for planning, we'll model it as needing one board pin.
        requires: { data: ['gpio'], power: 1, ground: 1 }
    },
    led: {
        name: 'LED',
        icon: 'fas fa-lightbulb',
        // An LED needs a GPIO for signal and a ground. The power comes from the GPIO pin itself.
        requires: { data: ['gpio'], ground: 1 }
    },
    lcd: { name: 'LCD Display', icon: 'fas fa-code', requires: { data: ['i2c'], power: 1, ground: 1 } },
    wifi: {
        name: 'WiFi Module',
        icon: 'fas fa-broadcast-tower',
        requires: { data: ['spi'], power: 1, ground: 1 }
    },
    pushButton: {
        name: 'Push Button',
        icon: 'fas fa-dot-circle',
        requires: { data: ['gpio'], ground: 1 }
    }
};