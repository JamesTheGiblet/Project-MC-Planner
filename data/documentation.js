const boardDocumentation = {
    rpi4: {
        title: 'Raspberry Pi 4 Model B Documentation',
        content: `
            <h4>Overview</h4>
            <p>The Raspberry Pi 4 Model B is a low-cost, high-performance single-board computer. It offers a significant increase in processor speed, multimedia performance, memory, and connectivity compared to the prior-generation Raspberry Pi 3 Model B+.</p>
            
            <h4>Key Specifications</h4>
            <ul>
                <li><strong>Processor:</strong> Broadcom BCM2711, Quad core Cortex-A72 (ARM v8) 64-bit SoC @ 1.5GHz</li>
                <li><strong>Memory:</strong> 1GB, 2GB, 4GB or 8GB LPDDR4-3200 SDRAM (depending on model)</li>
                <li><strong>Connectivity:</strong> 2.4 GHz and 5.0 GHz IEEE 802.11ac wireless, Bluetooth 5.0, BLE, Gigabit Ethernet</li>
                <li><strong>Ports:</strong> 2 &times; USB 3.0 ports; 2 &times; USB 2.0 ports.</li>
                <li><strong>GPIO:</strong> Standard 40-pin GPIO header (fully backwards compatible with previous boards)</li>
                <li><strong>Video & Sound:</strong> 2 &times; micro-HDMI ports (up to 4kp60 supported), MIPI DSI display port, MIPI CSI camera port, 4-pole stereo audio and composite video port</li>
            </ul>

            <h4>GPIO Header</h4>
            <p>The 40-pin GPIO header is the gateway to connecting electronic components. Pins can be used for various protocols:</p>
            <ul>
                <li><strong>GPIO:</strong> General-Purpose Input/Output for digital signals.</li>
                <li><strong>I2C (Inter-Integrated Circuit):</strong> A 2-wire bus for connecting sensors and peripherals (SDA/SCL). The Pi 4 has multiple I2C buses.</li>
                <li><strong>SPI (Serial Peripheral Interface):</strong> A fast, 4-wire bus for devices like screens and some sensors (MOSI, MISO, SCLK, CE).</li>
                <li><strong>UART (Universal Asynchronous Receiver-Transmitter):</strong> Serial communication pins (TXD, RXD) for connecting to other devices or a serial console.</li>
                <li><strong>Power:</strong> The header provides 3.3V and 5V power rails, as well as multiple Ground (GND) pins.</li>
            </ul>

            <h4>Important Considerations</h4>
            <ul>
                <li><strong>Voltage Levels:</strong> The GPIO pins on the Raspberry Pi operate at <strong>3.3V</strong>. Connecting a 5V device directly to a GPIO pin can permanently damage the Pi. Use a logic level shifter for 5V components.</li>
                <li><strong>Power Consumption:</strong> The Pi 4 requires a good quality USB-C power supply capable of delivering at least 3.0A. Powering many peripherals directly from the Pi's 5V rail can lead to instability.</li>
            </ul>
            <p>For the official documentation, please visit the <a href="https://www.raspberrypi.com/products/raspberry-pi-4-model-b/" target="_blank" rel="noopener noreferrer">Raspberry Pi Foundation website</a>.</p>
        `
    },
    uno: {
        title: 'Arduino Uno R3 Documentation',
        content: `
            <h4>Overview</h4>
            <p>The Arduino Uno is a microcontroller board based on the ATmega328P. It's one of the most popular boards for beginners and hobbyists due to its simplicity and extensive community support. It's an excellent choice for learning electronics and programming.</p>
            
            <h4>Key Specifications</h4>
            <ul>
                <li><strong>Microcontroller:</strong> ATmega328P</li>
                <li><strong>Operating Voltage:</strong> 5V</li>
                <li><strong>Input Voltage (recommended):</strong> 7-12V</li>
                <li><strong>Digital I/O Pins:</strong> 14 (of which 6 provide PWM output)</li>
                <li><strong>Analog Input Pins:</strong> 6</li>
                <li><strong>Flash Memory:</strong> 32 KB</li>
                <li><strong>Clock Speed:</strong> 16 MHz</li>
            </ul>

            <h4>Pin Functions</h4>
            <p>The Arduino Uno has a straightforward pin layout:</p>
            <ul>
                <li><strong>Digital I/O (Pins 0-13):</strong> Can be used as either input or output.</li>
                <li><strong>PWM (Pulse-Width Modulation):</strong> Pins marked with a tilde (~) (3, 5, 6, 9, 10, 11) can simulate an analog output, useful for dimming LEDs or controlling servo speed.</li>
                <li><strong>I2C:</strong> Pins A4 (SDA) and A5 (SCL) are used for the I2C communication bus.</li>
                <li><strong>SPI:</strong> Pins 10 (SS), 11 (MOSI), 12 (MISO), and 13 (SCK) are used for the SPI bus.</li>
                <li><strong>UART:</strong> Pins 0 (RX) and 1 (TX) are used for serial communication.</li>
            </ul>

            <h4>Important Considerations</h4>
            <ul>
                <li><strong>Voltage Levels:</strong> The Arduino Uno operates at <strong>5V</strong>. This is a key difference from 3.3V boards like the Raspberry Pi and ESP32. Be careful when interfacing with 3.3V components.</li>
                <li><strong>Power:</strong> The board can be powered via a USB cable or an external power supply through the barrel jack. The 5V and 3.3V pins can be used to power external components with low current requirements.</li>
            </ul>
            <p>For more details, visit the <a href="https://store.arduino.cc/products/arduino-uno-rev3" target="_blank" rel="noopener noreferrer">official Arduino Uno page</a>.</p>
        `
    },
    esp32: {
        title: 'ESP32 DevKitC Documentation',
        content: `
            <h4>Overview</h4>
            <p>The ESP32 is a series of low-cost, low-power system on a chip microcontrollers with integrated Wi-Fi and dual-mode Bluetooth. The ESP32 DevKitC is a popular development board that makes it easy to prototype with the ESP32 chip.</p>
            
            <h4>Key Specifications</h4>
            <ul>
                <li><strong>Processor:</strong> Tensilica Xtensa LX6 dual-core processor</li>
                <li><strong>Wireless:</strong> Wi-Fi 802.11 b/g/n and Bluetooth v4.2 BR/EDR and BLE</li>
                <li><strong>GPIO:</strong> Highly flexible pins that can be multiplexed for various functions.</li>
                <li><strong>On-Chip Sensors:</strong> Includes a Hall effect sensor and multiple capacitive touch pins.</li>
            </ul>

            <h4>Pin Functions</h4>
            <p>The ESP32's greatest strength is its pin flexibility (multiplexing):</p>
            <ul>
                <li><strong>Versatility:</strong> Almost any GPIO pin can be configured for I2C, SPI, or UART. This gives you great freedom when designing your layout.</li>
                <li><strong>Analog to Digital (ADC):</strong> Many GPIO pins can be used as analog inputs. Note that the ADC on some ESP32 models can be non-linear.</li>
                <li><strong>Strapping Pins:</strong> Be cautious with pins GPIO 0, 2, 5, 12, and 15. These pins are used to determine the boot mode, so external pull-up or pull-down resistors on these pins can prevent the board from starting correctly.</li>
            </ul>

            <h4>Important Considerations</h4>
            <ul>
                <li><strong>Voltage Levels:</strong> The ESP32 is a <strong>3.3V</strong> device. Applying 5V to any of its GPIO pins will cause permanent damage. Always use a logic level shifter when connecting to 5V components.</li>
                <li><strong>Current Draw:</strong> The Wi-Fi radio can draw high current in short bursts. A stable 3.3V power supply is essential for reliable operation. Do not try to power the ESP32 from another board's 3.3V rail if you plan to use Wi-Fi.</li>
            </ul>
            <p>For detailed technical information, refer to the <a href="https://www.espressif.com/en/products/devkits/esp32-devkitc/overview" target="_blank" rel="noopener noreferrer">Espressif ESP32-DevKitC page</a>.</p>
        `
    }
};