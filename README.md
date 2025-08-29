# Project PI Planner

A comprehensive visual tool for planning and managing Raspberry Pi GPIO pin allocations in electronics projects. Avoid pin conflicts and generate production-ready Python code with an intuitive interface.

## Overview

Project PI Planner streamlines the process of planning GPIO pin usage for Raspberry Pi projects. With its interactive visual interface and intelligent pin allocation system, you can quickly prototype sensor configurations and generate the corresponding Python code.

## Key Features

- **Interactive GPIO Layout** - Visual 40-pin Raspberry Pi pinout with real-time allocation tracking
- **Sensor Library** - Pre-configured templates for common electronic components
- **Smart Pin Assignment** - Automatic allocation based on sensor power and communication requirements
- **Code Generation** - Ready-to-use Python code with proper GPIO setup and cleanup
- **Conflict Prevention** - Prevents pin conflicts across multiple sensors
- **Visual Feedback** - Color-coded pins and tooltips for clear project visualization

## Supported Components

| Component | Type | Description |
|-----------|------|-------------|
| DHT11/DHT22 | Environmental | Temperature and humidity sensor |
| HC-SR04 | Distance | Ultrasonic ranging sensor |
| PIR Sensor | Motion | Passive infrared motion detector |
| LDR | Light | Light-dependent resistor |
| Push Button | Input | Digital input switch |
| LED | Output | Light-emitting diode |
| Servo Motor | Actuator | Precision rotation control |
| Relay Module | Switching | High-power device control |
| I2C Devices | Communication | Two-wire serial protocol |
| SPI Devices | Communication | Serial peripheral interface |

## Installation

### Requirements

- Python 3.6+
- Pygame library

### Quick Start

```bash
# Install dependencies
pip install pygame

# Run the application
python pi_planner.py
```

## Usage Guide

### Basic Workflow

1. **Select Component** - Choose a sensor from the left sidebar
2. **Review Allocation** - Application automatically assigns power, ground, and data pins
3. **Inspect Configuration** - Hover over pins to view allocation details
4. **Generate Code** - Click "Generate Code" for Python implementation
5. **Reset if Needed** - Use "Clear Allocation" to start over

### Pin Color Reference

| Color | Pin Type | Description |
|-------|----------|-------------|
| Blue | GPIO | General purpose digital I/O |
| Red | 5V | 5-volt power supply |
| Light Red | 3.3V | 3.3-volt power supply |
| Dark Gray | GND | Ground reference |
| Purple | Special | Reserved functions (ID_SD, etc.) |

### Generated Code Features

The application produces clean, documented Python code including:

- Proper GPIO library imports and setup
- Pin configurations with physical pin references
- Exception handling with cleanup
- Basic program structure ready for customization

**Example Output:**
```python
import RPi.GPIO as GPIO
import time

GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# DHT11/DHT22 Temperature/Humidity Sensor
GPIO.setup(2, GPIO.IN)  # Data pin (physical pin 3)

try:
    while True:
        # Your sensor reading code here
        time.sleep(0.1)
        
except KeyboardInterrupt:
    print("Program stopped")
finally:
    GPIO.cleanup()
```

## Customization

### Adding New Sensors

Extend the sensor library by modifying the `SENSORS` dictionary:

```python
"Custom Sensor": {
    "type": "sensor",           # Component category
    "pins": {
        "data": "GPIO",         # Pin requirements
        "clock": "GPIO"         # Multiple pins supported
    },
    "power": "3V3",            # Power requirement (3V3/5V)
    "ground": True,            # Ground connection needed
    "notes": "Usage notes"     # Additional information
}
```

### Pin Layout Modification

Adapt the `PIN_LAYOUT` configuration for different Raspberry Pi models or custom boards.

## Technical Details

### Architecture

The application uses Pygame for rendering the interactive interface and implements a pin allocation engine that considers:

- Power requirements (3.3V vs 5V)
- Ground connections
- GPIO availability
- Protocol-specific pin constraints (I2C, SPI)

### Limitations

- Designed for standard 40-pin Raspberry Pi GPIO layout
- I2C/SPI devices may need additional software configuration
- Physical layout constraints not considered in allocation
- No support for advanced features like PWM-specific requirements

## Troubleshooting

**Display Issues**
- Update Pygame: `pip install --upgrade pygame`
- Check display drivers and resolution compatibility

**Allocation Problems**
- Verify sensor selection before code generation
- Some sensors require specific GPIO pins (check sensor documentation)

**Code Generation**
- Ensure at least one sensor is allocated
- Check that power requirements don't exceed Pi capabilities

## Contributing

We welcome contributions in these areas:

- **Sensor Support** - Add templates for additional components
- **UI/UX Enhancement** - Improve interface design and usability
- **Code Generation** - Expand output formats and libraries
- **Platform Support** - Add compatibility for other Pi models
- **Documentation** - Create tutorials and usage examples

Submit pull requests with clear descriptions of changes and test your additions thoroughly.

## Resources

- [Official Raspberry Pi GPIO Guide](https://www.raspberrypi.org/documentation/usage/gpio/)
- [RPi.GPIO Library Documentation](https://pypi.org/project/RPi.GPIO/)
- [Pygame Documentation](https://www.pygame.org/docs/)
- [Electronics Project Tutorials](https://learn.adafruit.com/category/raspberry-pi)

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review code comments and documentation
3. Open an issue with detailed problem description

---

**Important**: This tool assists with planning but doesn't replace understanding electronics fundamentals. Always verify connections and power requirements before energizing your Raspberry Pi.
