const componentData = {
    dht22: { name: 'DHT22 Sensor', requires: ['gpio'] },
    bmp280: { name: 'BMP280 Sensor', requires: ['i2c'] },
    servo: { name: 'Servo Motor', requires: ['gpio'] }, // Prefers PWM, but any GPIO works for now
    led: { name: 'LED', requires: ['gpio'] },
    lcd: { name: 'LCD Display', requires: ['i2c'] },
    wifi: { name: 'WiFi Module', requires: ['spi'] }
};