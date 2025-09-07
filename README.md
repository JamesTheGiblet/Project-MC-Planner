# MC Planner - Microcontroller GPIO Planning Tool

![MC Planner](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Raspberry%20Pi%20%7C%20ESP32-orange.svg)

## Overview

MC Planner is an intuitive web-based application designed to simplify GPIO planning for microcontroller projects. Whether you're working with Raspberry Pi, ESP32, or other microcontrollers, MC Planner helps you visualize pinouts, select optimal GPIO pins for your components, and generate configuration details for your projects.

![MC Planner Interface](https://via.placeholder.com/800x400.png?text=MC+Planner+Interface)

## Features

- **Board Selection**: Support for Raspberry Pi, ESP32, Arduino, and more
- **Visual Pinout Diagrams**: Interactive, color-coded pinout visualization
- **Component Configuration**: Detailed form for specifying sensor/equipment requirements
- **Smart Recommendations**: AI-powered GPIO pin recommendations based on component needs
- **Export Functionality**: Download pinout configurations and generate code snippets
- **Project Management**: Save and manage multiple microcontroller configurations
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Supported Platforms

### Currently Supported

- Raspberry Pi (all models)
- ESP32 (DevKit V1, NodeMCU, WROVER)
- Arduino (Uno, Mega, Nano)

### Planned Support

- STM32
- Teensy
- BeagleBone
- Micro:bit
- Raspberry Pi Pico

## Installation

### Web Version

Simply visit [mcplanner.com](https://mcplanner.com) to use the web application.

### Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mc-planner.git

# Navigate to the project directory
cd mc-planner

# Install dependencies
npm install

# Start the development server
npm start
```

### Docker Installation

```bash
# Pull the Docker image
docker pull yourusername/mc-planner:latest

# Run the container
docker run -p 3000:3000 yourusername/mc-planner
```

## Usage

### 1. Select Your Board

Choose from the supported microcontroller boards. The pinout diagram will update automatically.

### 2. Add Components

Fill in the component form with details about your sensor or equipment:

- Component type (sensor, motor, display, etc.)
- Voltage requirements
- Communication protocol (I2C, SPI, UART, etc.)
- Current draw
- Special requirements

### 3. Review Recommendations

MC Planner will suggest optimal GPIO pins based on your component's requirements and current board configuration.

### 4. Assign Pins

Click on pins in the visual diagram to assign them to your components.

### 5. Export Configuration

Download your pinout configuration as:

- JSON file for import into other tools
- PDF schematic diagram
- Code snippets for popular platforms (Arduino, MicroPython, CircuitPython)

## API Integration

MC Planner provides a REST API for integration with other tools and services:

```javascript
// Example: Get pin recommendations for a component
POST /api/recommend-pins
{
  "board": "raspberry-pi-4",
  "component": {
    "type": "sensor",
    "protocol": "i2c",
    "voltage": "3.3v",
    "current": 20
  }
}
```

## For Developers

### Project Structure

mc-planner/
├── src/
│   ├── components/     # React components
│   ├── services/       # API and data services
│   ├── utils/          # Helper functions
│   └── assets/         # Images and static files
├── docs/               # Documentation
└── tests/              # Test suites

### Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Building from Source

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Run tests
npm test
```

## Use Cases

### Robotics Projects

Plan motor controllers, sensors, and communication modules for your robotics projects.

### Home Automation

Configure GPIO pins for sensors, relays, and displays in home automation systems.

### IoT Devices

Optimize ESP32 configurations for battery-powered IoT devices.

### Education

Perfect for teaching electronics and microcontroller programming in classroom settings.

## Data & Privacy

MC Planner runs primarily client-side. Your project data never leaves your browser unless you explicitly choose to save it to our secure cloud service. We prioritize user privacy and data security.

## Roadmap

### Version 1.1 (Q2 2023)

- [ ] Add support for STM32 boards
- [ ] Implement collaborative editing
- [ ] Add version history for projects
- [ ] Introduce plugin system for custom boards

### Version 1.2 (Q3 2023)

- [ ] Mobile app release (iOS and Android)
- [ ] Offline functionality
- [ ] Advanced simulation capabilities
- [ ] Integration with popular IDEs

### Version 2.0 (Q4 2023)

- [ ] Hardware-in-the-loop testing
- [ ] Automated PCB design export
- [ ] Marketplace for component templates
- [ ] AI-assisted troubleshooting

## Support

- [Documentation](https://docs.mcplanner.com)
- [Community Forum](https://forum.mcplanner.com)
- [Issue Tracker](https://github.com/yourusername/mc-planner/issues)
- [Email Support](support@mcplanner.com)

## License

MC Planner is released under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Icons by [Font Awesome](https://fontawesome.com)
- Pinout data from [Pinout.xyz](https://pinout.xyz) and manufacturer datasheets
- Inspired by the maker and robotics communities

## Join the Community

- [Discord](https://discord.gg/mcplanner)
- [Twitter](https://twitter.com/mcplanner)
- [YouTube](https://youtube.com/mcplanner)
- [Blog](https://blog.mcplanner.com)

---

**MC Planner** - Simplifying microcontroller projects for makers, educators, and professionals worldwide.
