# Project MC Planner

![Python Version](https://img.shields.io/badge/Python-3.6+-blue)
![Platform](https://img.shields.io/badge/Platform-Cross--platform-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![GUI Framework](https://img.shields.io/badge/GUI-Pygame-red)

Visual GPIO Pin Planning for Micro controllers starting with Raspberry Pi Projects - A comprehensive tool for planning and managing GPIO pin allocations in electronics projects, with special integration for robotics and exoskeleton development.

# Project PI Planner

![Python Version](https://img.shields.io/badge/Python-3.6+-blue)
![Build Order](https://img.shields.io/badge/Build%20Order-THIRD-orange)
![License](https://img.shields.io/badge/License-MIT-blue)
![GUI Framework](https://img.shields.io/badge/GUI-Pygame-red)

Visual GPIO Pin Planning for Raspberry Pi Projects - **Week 5 development priority** for Iron Arm exoskeleton electronics integration.

## 🔗 Project Ecosystem & Build Timeline

**Project PI Planner** is the **third component** in the Iron Arm development sequence:

### 8-Week Development Plan
```
✅ Weeks 1-2: Text to CAD Generator → Design mechanical parts
✅ Weeks 3-4: Iron Arm Phase 1 → Build and test mechanics  
🎯 Week 5: Project PI Planner (THIS PROJECT) → Plan electronics
📅 Weeks 6-7: Iron Arm Phase 2 → Electronics integration
📅 Week 8: Software tuning and optimization
```

### Integration Points
- **[Text to CAD Generator](../text-to-cad/)** - **COMPLETED** - Designed sensor housings for components
- **Project PI Planner** (this project) - **ACTIVE** - Planning GPIO for designed components
- **[Iron Arm Exoskeleton](../iron-arm/)** - **PENDING** - Will use both GPIO plan and 3D printed housings

## 🎯 Week 5 Development Goals

### Iron Arm GPIO Planning Priority

Your **Week 5 mission** is configuring PI Planner for the specific Iron Arm sensor suite designed in Weeks 1-4:

#### Essential Iron Arm Sensors (Configure These First)
1. **Load Cell + HX711** - Force sensing (designed housing in Week 2)
2. **MPU9250 IMU** - Orientation tracking (housed in control box)  
3. **Emergency Stop Button** - Safety system (mounted in control box)
4. **Status LEDs (WS2812)** - User feedback (integrated in control box)
5. **Servo Motor Control** - Main actuator (uses Text-to-CAD motor mount)
6. **Rotary Encoder** - Position feedback (mounted at elbow joint)

#### Week 5 Development Checklist
- [ ] **Day 1-2**: Build PI Planner core interface and GPIO visualization
- [ ] **Day 3**: Add Iron Arm specific sensor configurations  
- [ ] **Day 4**: Implement conflict detection and smart pin allocation
- [ ] **Day 5**: Generate Python code templates for Iron Arm integration
- [ ] **End of Week 5**: Complete GPIO plan ready for Week 6 wiring

## 📸 Project PI Planner Interface
![Project PI Planner Interface](screenshot.png)
*Visual GPIO pin planning with real-time allocation tracking*

## 🎯 Overview

Project PI Planner streamlines the process of planning GPIO pin usage for Raspberry Pi projects, with specialized support for robotics applications. With its interactive visual interface and intelligent pin allocation system, you can quickly prototype complex sensor configurations and generate production-ready Python code.

## ⭐ Key Features

- **Interactive GPIO Layout** - Visual 40-pin Raspberry Pi pinout with real-time allocation tracking
- **Robotics Sensor Library** - Pre-configured templates optimized for exoskeleton and robotics projects
- **Smart Pin Assignment** - Automatic allocation based on sensor power and communication requirements
- **Code Generation** - Ready-to-use Python code with proper GPIO setup and cleanup
- **Conflict Prevention** - Prevents pin conflicts across multiple sensors with visual warnings
- **Export Integration** - Direct export to Iron Arm project structure
- **Visual Feedback** - Color-coded pins and detailed tooltips for clear project visualization

## 🤖 Supported Components

### Basic Sensors
| Component | Type | Description | Iron Arm Usage |
|-----------|------|-------------|----------------|
| DHT11/DHT22 | Environmental | Temperature and humidity sensor | Environment monitoring |
| HC-SR04 | Distance | Ultrasonic ranging sensor | Obstacle detection |
| PIR Sensor | Motion | Passive infrared motion detector | User presence detection |
| LDR | Light | Light-dependent resistor | Ambient light sensing |
| Push Button | Input | Digital input switch | Emergency stop, mode select |
| LED | Output | Light-emitting diode | Status indicators |

### Robotics Components (Iron Arm Specific)
| Component | Type | Description | Pin Requirements |
|-----------|------|-------------|------------------|
| Load Cell + HX711 | Force | Weight/force measurement | 2 GPIO (data, clock) |
| MPU9250 IMU | Motion | 9-DOF inertial measurement | I2C (SDA, SCL) |
| Servo Motor | Actuator | Precision rotation control | 1 GPIO (PWM) |
| Emergency Stop | Safety | Hardware interrupt button | 1 GPIO (interrupt) |
| Status LEDs | Interface | RGB status indicators | 3 GPIO or 1 GPIO (WS2812) |
| Relay Module | Switching | High-power device control | 1 GPIO per relay |
| Rotary Encoder | Position | Angular position feedback | 2 GPIO (A, B phases) |

### Communication Protocols
| Protocol | Components | Iron Arm Usage |
|----------|------------|----------------|
| I2C | IMU, pressure sensors, displays | Primary sensor bus |
| SPI | High-speed ADCs, wireless modules | Fast data acquisition |
| UART | GPS, wireless communication | Telemetry and logging |

## ⚙️ Installation

### Requirements
- Python 3.6+
- Pygame library
- Optional: Raspberry Pi for testing generated code

### Quick Start
```bash
# Install dependencies
pip install pygame

# Clone the project
git clone https://github.com/your-repo/pi-planner.git
cd pi-planner

# Run the application
python pi_planner.py
```

## 🛠️ Usage Guide

### Basic Workflow
1. **Select Component** - Choose a sensor from the robotics library
2. **Review Allocation** - Application automatically assigns power, ground, and data pins
3. **Inspect Configuration** - Hover over pins to view allocation details and conflicts
4. **Generate Code** - Click "Generate Code" for Python implementation
5. **Export for Iron Arm** - Direct integration with exoskeleton project structure

### Iron Arm Project Integration

#### 1. Plan Your Sensor Suite
```python
# Typical Iron Arm sensor configuration:
sensors = [
    'Load Cell + HX711',      # Force sensing
    'MPU9250 IMU',           # Orientation tracking  
    'Emergency Stop Button',  # Safety system
    'Status LEDs (RGB)',     # User feedback
    'Servo Motor',           # Main actuator
    'Rotary Encoder'         # Position feedback
]
```

#### 2. Generate GPIO Plan
The planner automatically allocates:
- **Power rails** (3.3V, 5V) based on sensor requirements
- **Ground connections** with proper distribution  
- **Communication buses** (I2C for IMU, SPI if needed)
- **Interrupt pins** for emergency stop and encoder
- **PWM pins** for servo control

#### 3. Export Integration Code
Generated code includes:
- Iron Arm specific pin definitions
- Sensor initialization routines
- Safety system integration
- Data logging setup

### Pin Color Reference
| Color | Pin Type | Description |
|-------|----------|-------------|
| **Blue** | GPIO | General purpose digital I/O |
| **Red** | 5V | 5-volt power supply |
| **Light Red** | 3.3V | 3.3-volt power supply |
| **Dark Gray** | GND | Ground reference |
| **Purple** | Special | Reserved functions (ID_SD, etc.) |
| **Yellow** | I2C | SDA/SCL communication lines |
| **Orange** | SPI | MISO/MOSI/SCLK/CE lines |

## 💻 Generated Code Features

### Iron Arm Integration Example
```python
#!/usr/bin/env python3
"""
Iron Arm Exoskeleton - GPIO Configuration
Generated by PI Planner - Week 5 Development
Integration ready for Week 6 electronics assembly
"""
import RPi.GPIO as GPIO
import time
from hx711 import HX711  # Load cell driver
import board
import busio
import adafruit_mpu9250

# Iron Arm GPIO Configuration (Generated by PI Planner)
GPIO.setmode(GPIO.BCM)  
GPIO.setwarnings(False)

# === FORCE SENSING SYSTEM ===
# Load Cell + HX711 Amplifier - Pins 2,3 (designed housing: control-box-v1.stl)
hx = HX711(dout_pin=2, pd_sck_pin=3)
print("✅ Load cell initialized - Force sensing ready")

# === ORIENTATION TRACKING ===  
# MPU9250 IMU - I2C Bus (housed in: control-box-v1.stl)
i2c = busio.I2C(board.SCL, board.SDA)
imu = adafruit_mpu9250.MPU9250(i2c)
print("✅ IMU initialized - Orientation tracking ready")

# === SAFETY SYSTEMS ===
# Emergency Stop - Pin 4 (mounted in: control-box-v1.stl)
EMERGENCY_STOP_PIN = 4
GPIO.setup(EMERGENCY_STOP_PIN, GPIO.IN, pull_up_down=GPIO.PUD_UP)
print("✅ Emergency stop configured - Safety system active")

# === ACTUATOR CONTROL ===
# Servo Motor - Pin 18 Hardware PWM (mount: servo-bracket-v2.stl)  
SERVO_PIN = 18
GPIO.setup(SERVO_PIN, GPIO.OUT)
servo = GPIO.PWM(SERVO_PIN, 50)  # 50Hz servo control
servo.start(7.5)  # Neutral position
print("✅ Servo initialized - Actuation ready")

# === STATUS FEEDBACK ===
# WS2812 RGB LEDs - Pin 12 (integrated in: control-box-v1.stl)
import neopixel
pixels = neopixel.NeoPixel(board.D12, 3)  # 3 status LEDs
pixels.fill((0, 255, 0))  # Green = system ready
print("✅ Status LEDs active - Visual feedback ready")

# === POSITION FEEDBACK ===  
# Rotary Encoder - Pins 5,6 (mount: encoder-bracket-v1.stl)
ENCODER_A = 5
ENCODER_B = 6  
GPIO.setup(ENCODER_A, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(ENCODER_B, GPIO.IN, pull_up_down=GPIO.PUD_UP)
print("✅ Encoder configured - Position tracking ready")

def iron_arm_startup():
    """Initialize Iron Arm exoskeleton system"""
    print("🦾 IRON ARM EXOSKELETON INITIALIZING...")
    print("📅 Week 6: Electronics integration phase")
    print("🔗 Generated by: PI Planner v1.0")
    print("🏗️ Components designed with: Text-to-CAD Generator")
    print("⚡ System ready for force amplification!")

def emergency_shutdown():
    """Emergency stop procedure"""
    servo.stop()
    GPIO.cleanup()
    pixels.fill((255, 0, 0))  # Red = emergency stop
    print("🛑 EMERGENCY STOP ACTIVATED")

try:
    iron_arm_startup()
    
    while True:
        # Iron Arm control loop will be implemented here in Week 7
        # Force sensing, amplification, and motor control
        
        # Check emergency stop
        if GPIO.input(EMERGENCY_STOP_PIN) == GPIO.LOW:
            emergency_shutdown()
            break
            
        time.sleep(0.01)  # 100Hz control loop
        
except KeyboardInterrupt:
    print("🔄 Iron Arm shutdown - Normal termination")
finally:
    GPIO.cleanup()
    print("✅ GPIO cleanup complete")
```

## ⚙️ Week 5 Development Plan

### Day 1-2: Core PI Planner Framework
- Build interactive GPIO pinout visualization
- Implement basic sensor library and pin allocation
- Create conflict detection system

### Day 3: Iron Arm Sensor Integration  
- Add **all 6 Iron Arm sensors** to component library
- Configure power requirements and pin constraints
- Test allocation algorithm with full sensor suite

### Day 4: Code Generation Enhancement
- Generate Iron Arm specific Python templates
- Include Text-to-CAD housing references in comments
- Add initialization sequences and safety procedures

### Day 5: Integration Testing & Documentation
- Validate GPIO plan with Iron Arm requirements  
- Generate wiring diagrams for Week 6 assembly
- Export ready-to-use code for Week 6-7 development

### Week 5 Success Criteria
- ✅ All Iron Arm sensors allocate without conflicts
- ✅ Generated code includes safety systems and emergency stop
- ✅ Wiring diagrams reference Text-to-CAD generated housings
- ✅ Ready for immediate Week 6 electronics assembly
