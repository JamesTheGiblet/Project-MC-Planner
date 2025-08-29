# Project PI Planner - Raspberry Pi Pin Allocation Assistant

![Project PI Planner](https://via.placeholder.com/800x400.png?text=Project+PI+Planner+Interface)

A comprehensive visual tool for planning and allocating Raspberry Pi GPIO pins for your electronics projects. This application helps you avoid pin conflicts and generates ready-to-use Python code for your sensor configurations.

## Features

- 🎯 **Visual Pinout Diagram**: Interactive 40-pin Raspberry Pi layout with color-coded pins
- 🔌 **Sensor Library**: Pre-configured support for common sensors (DHT11, HC-SR04, PIR, etc.)
- 🤖 **Automatic Allocation**: Intelligent pin assignment based on sensor requirements
- 💻 **Code Generation**: Python code output using RPi.GPIO library
- 🎨 **Intuitive UI**: Clean, user-friendly interface with tooltips and visual feedback
- 🔄 **Conflict Prevention**: Prevents double-allocation of pins across sensors

## Supported Sensors

The application currently supports these common sensors and components:

- **DHT11/DHT22** - Temperature and humidity sensor
- **HC-SR04** - Ultrasonic distance sensor
- **PIR Sensor** - Motion detection sensor
- **LDR** - Light dependent resistor (light sensor)
- **Push Button** - Simple input button
- **LED** - Light emitting diode
- **Servo Motor** - Precision rotation motor
- **Relay Module** - Switching module for high-power devices
- **I2C Sensors** - Devices using I2C communication protocol
- **SPI Devices** - Devices using SPI communication protocol

## Installation

### Prerequisites

- Python 3.6 or higher
- Pygame library

### Setup

1. Clone or download the project files
2. Install required dependencies:

```bash
pip install pygame
```

3. Run the application:

```bash
python pi_planner.py
```

## How to Use

1. **Select a Sensor**: Click on any sensor in the left sidebar
2. **View Allocation**: The application automatically assigns appropriate pins (power, ground, data)
3. **Inspect Pins**: Hover over any pin to see allocation details
4. **Generate Code**: Click "Generate Code" to create Python code for your setup
5. **Clear Allocations**: Use "Clear Allocation" to reset pin assignments

## Understanding the Interface

### Pin Color Coding

- **Blue**: GPIO pins (general purpose input/output)
- **Red**: 5V power pins
- **Light Red**: 3.3V power pins
- **Dark Gray**: Ground (GND) pins
- **Purple**: Special function pins (ID_SD, etc.)

### Visual Indicators

- **Yellow Circle**: Indicates an allocated pin
- **Tooltips**: Hover over pins or buttons for additional information
- **Code Preview**: Generated code appears in the bottom panel

## Generated Code Structure

The application generates Python code that includes:

- Proper GPIO library import
- Pin setup based on your sensor allocations
- Basic program structure with cleanup handling
- Comments indicating sensor purpose and physical pin numbers

Example output:
```python
# Code for using allocated pins
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# DHT11/DHT22 setup
GPIO.setup(2, GPIO.IN)  # DHT11/DHT22 data (physical pin 3)

# Main program loop
try:
    while True:
        # Add your code here
        time.sleep(0.1)

except KeyboardInterrupt:
    GPIO.cleanup()
```

## Customization

### Adding New Sensors

You can easily add support for new sensors by modifying the `SENSORS` dictionary in the code:

```python
"Your Sensor Name": {
    "type": "sensor",  # or "input", "output", "actuator"
    "pins": {
        "data_pin_name": "GPIO",  # or "3V3", "5V", "GND"
        # Add more pins as needed
    },
    "power": "3V3",  # or "5V" if required
    "ground": True,  # set to False if not needed
    "notes": "Any additional information"
}
```

### Modifying Pin Layout

The pin layout is defined in the `PIN_LAYOUT` variable. You can modify this to support different Raspberry Pi models or custom pin configurations.

## Troubleshooting

### Common Issues

1. **Display not rendering properly**: Ensure you have the latest version of Pygame installed
2. **Code not generating**: Make sure you've selected a sensor before generating code
3. **Pins not allocating**: Some sensors require specific pins (e.g., I2C devices need specific GPIO pins)

### Limitations

- The application currently supports the standard 40-pin Raspberry Pi layout
- I2C and SPI devices may require additional configuration beyond pin allocation
- Physical constraints (like pin proximity) are not considered in automatic allocation

## Contributing

We welcome contributions to Project PI Planner! Areas where you can help:

1. Adding support for additional sensors
2. Improving the UI/UX design
3. Enhancing the code generation capabilities
4. Adding support for other Raspberry Pi models
5. Creating documentation and tutorials

Please fork the repository and submit pull requests with your improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Resources

- [Raspberry Pi GPIO Documentation](https://www.raspberrypi.org/documentation/usage/gpio/)
- [RPi.GPIO Library Documentation](https://pypi.org/project/RPi.GPIO/)
- [Pygame Documentation](https://www.pygame.org/docs/)

## Support

If you encounter issues or have questions:

1. Check the troubleshooting section above
2. Review the code comments for implementation details
3. Open an issue on the project repository

## Roadmap

Future versions of Project PI Planner may include:

- [ ] Support for Raspberry Pi Pico and other models
- [ ] Schematic diagram generation
- [ ] Export to Fritzing format
- [ ] Custom sensor creation wizard
- [ ] Power consumption calculations
- [ ] Project saving and loading
- [ ] Sharing configurations online

---

**Note**: This application assists with pin planning but doesn't replace understanding basic electronics principles. Always double-check your connections before applying power to your Raspberry Pi.
