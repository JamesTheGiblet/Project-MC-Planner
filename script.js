document.addEventListener('DOMContentLoaded', () => {
    const gpioHeaderContainer = document.getElementById('gpio-header');

    // Data model for the 40-pin header
    // Based on Raspberry Pi 4 Model B
    const pinout = [
        { pin: 1, type: 'power-3v3', name: '3.3V Power' }, { pin: 2, type: 'power-5v', name: '5V Power' },
        { pin: 3, type: 'i2c', name: 'GPIO 2 (SDA)' }, { pin: 4, type: 'power-5v', name: '5V Power' },
        { pin: 5, type: 'i2c', name: 'GPIO 3 (SCL)' }, { pin: 6, type: 'gnd', name: 'Ground' },
        { pin: 7, type: 'gpio', name: 'GPIO 4' }, { pin: 8, type: 'uart', name: 'GPIO 14 (TXD)' },
        { pin: 9, type: 'gnd', name: 'Ground' }, { pin: 10, type: 'uart', name: 'GPIO 15 (RXD)' },
        { pin: 11, type: 'gpio', name: 'GPIO 17' }, { pin: 12, type: 'gpio', name: 'GPIO 18 (PWM)' },
        { pin: 13, type: 'gpio', name: 'GPIO 27' }, { pin: 14, type: 'gnd', name: 'Ground' },
        { pin: 15, type: 'gpio', name: 'GPIO 22' }, { pin: 16, type: 'gpio', name: 'GPIO 23' },
        { pin: 17, type: 'power-3v3', name: '3.3V Power' }, { pin: 18, type: 'gpio', name: 'GPIO 24' },
        { pin: 19, type: 'spi', name: 'GPIO 10 (MOSI)' }, { pin: 20, type: 'gnd', name: 'Ground' },
        { pin: 21, type: 'spi', name: 'GPIO 9 (MISO)' }, { pin: 22, type: 'gpio', name: 'GPIO 25' },
        { pin: 23, type: 'spi', name: 'GPIO 11 (SCLK)' }, { pin: 24, type: 'spi', name: 'GPIO 8 (CE0)' },
        { pin: 25, type: 'gnd', name: 'Ground' }, { pin: 26, type: 'spi', name: 'GPIO 7 (CE1)' },
        { pin: 27, type: 'special', name: 'ID_SD (I2C ID EEPROM)' }, { pin: 28, type: 'special', name: 'ID_SC (I2C ID EEPROM)' },
        { pin: 29, type: 'gpio', name: 'GPIO 5' }, { pin: 30, type: 'gnd', name: 'Ground' },
        { pin: 31, type: 'gpio', name: 'GPIO 6' }, { pin: 32, type: 'gpio', name: 'GPIO 12 (PWM)' },
        { pin: 33, type: 'gpio', name: 'GPIO 13 (PWM)' }, { pin: 34, type: 'gnd', name: 'Ground' },
        { pin: 35, type: 'gpio', name: 'GPIO 19 (MISO)' }, { pin: 36, type: 'gpio', name: 'GPIO 16 (CE2)' },
        { pin: 37, type: 'gpio', name: 'GPIO 26' }, { pin: 38, type: 'gpio', name: 'GPIO 20 (MOSI)' },
        { pin: 39, type: 'gnd', name: 'Ground' }, { pin: 40, type: 'gpio', name: 'GPIO 21 (SCLK)' },
    ];

    /**
     * Generates the HTML for the GPIO header display.
     */
    function renderGPIOHeader() {
        gpioHeaderContainer.innerHTML = ''; // Clear existing pins
        pinout.forEach(pinInfo => {
            const pinElement = document.createElement('div');
            pinElement.classList.add('pin', pinInfo.type);
            pinElement.dataset.pin = pinInfo.pin;
            
            const pinNum = document.createElement('span');
            pinNum.classList.add('pin-num');
            pinNum.textContent = pinInfo.pin;

            const pinName = document.createElement('span');
            pinName.classList.add('pin-name');
            pinName.textContent = pinInfo.name;

            pinElement.appendChild(pinName);
            pinElement.appendChild(pinNum);

            gpioHeaderContainer.appendChild(pinElement);
        });
    }

    // --- TODO: Event Listeners and Logic ---
    // 1. Add click listeners to component buttons.
    // 2. Implement pin allocation logic.
    // 3. Implement conflict detection.
    // 4. Implement code generation on button click.
    // 5. Implement reset functionality.

    // Initial render
    renderGPIOHeader();
    console.log("MC Planner Initialized. Ready for Day 1-2 development.");
});