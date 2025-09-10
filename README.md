# PinPoint Planner

![SBC Example](https://upload.wikimedia.org/wikipedia/commons/3/3d/Raspberry_Pi_4_Model_B_-_Side.jpg)

**Plan your hardware projects without the headache.**

*PinPoint Planner is an intelligent, web-based tool for designing projects with single-board computers like Raspberry Pi, Arduino, and ESP32. Go from idea to a validated, documented plan in minutes, not hours.*

---

## Table of Contents

- [The Problem You've Faced](#the-problem-youve-faced)
- [The Intelligent Solution](#the-intelligent-solution)
- [Two Levels of Intelligence](#two-levels-of-intelligence-from-error-free-to-effortless)
- [Find Your Plan: From Free to Pro](#find-your-plan-from-free-to-pro)
- [Features](#features)
- [Screenshots](#screenshots)
- [Prerequisites](#prerequisites)
- [Supported Hardware](#supported-hardware)
- [Adding More Components](#adding-more-components)
- [Development Tips](#development-tips)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Problem You've Faced

If you've ever worked with an SBC, you know the frustration:

- **Endless Pin Puzzles:** Which GPIO can I use? Is this pin for I²C or SPI? Wait, I used that one already...
- **Datasheet Overload:** Dozens of open browser tabs, trying to reconcile board pinouts with component requirements.
- **Costly Mistakes:** A wrong connection or voltage mismatch leads to frustrating debugging or fried components.
- **Messy Documentation:** Final plans are often disorganized, making them hard to share or reproduce.

This process is slow, error-prone, and stifles creativity.

---

## The Intelligent Solution

PinPoint Planner transforms this process into a fast, visual, and reliable workflow. It's your single source of truth for hardware design.

- **Plan Visually:** See your board's pins in real-time. As you add components, the planner shows you exactly what's available.
- **Get Instant Validation:** Our intelligent core automatically flags issues, preventing conflicts before they happen.
- **Generate Docs in One Click:** Export a clean, professional summary of your project, including a component list and pin assignments.

---

## Two Levels of Intelligence: From Error-Free to Effortless

PinPoint Planner offers two levels of assistance:

### 1. Pin Validator (Free)

- **Real-time spell-checker** for your hardware.
- **Catches Conflicts:** Instantly flags if a pin is already in use.
- **Prevents Mismatches:** Warns if you try to connect a component to an incompatible bus.
- **Stops Errors Before They Happen:** Ensures every manual connection is valid.

### 2. AI Smart Planner (Pro)

- **One-Click Planning:** Add all your components, click "Plan My Board," and the AI gets to work.
- **Holistic Optimization:** Finds the best pin assignments, prioritizing stable hardware buses and respecting power constraints.
- **Explainable Decisions:** Tells you why it made each choice, so you learn and stay in control.

---

## Find Your Plan: From Free to Pro

| Feature                | Free (Simple Projects) | Pro ($7/mo) (Hobbyists & Power Users) | Business ($25/mo/seat) (Teams & Professionals) |
|------------------------|:---------------------:|:-------------------------------------:|:----------------------------------------------:|
| Projects               | 3 Public Projects     | Unlimited Public & Private Projects   | Unlimited Team Projects                        |
| Core Planner           | ✅                    | ✅                                    | ✅                                             |
| Intelligence           | Pin Validator         | ⭐ AI Smart Planner                   | ⭐ AI Smart Planner                            |
| Documentation          | Markdown Export       | PDF & JSON Export                    | Custom Templates                              |
| Wiring Diagrams        | ❌                    | ✅ Fritzing-style Diagrams            | ✅ Advanced Diagrams                          |
| Code Generation        | ❌                    | ✅ Arduino/Python Starter Code        | ✅ Custom Code Templates                      |
| Custom Components      | ❌                    | ✅ Add Custom Components              | ✅ Shared Team Library                        |
| Collaboration          | ❌                    | ❌                                   | ✅ Real-time Editing                          |

---

## Features

| Feature | Description | Free | Pro | Business |
| :--- | :--- | :---: | :---: | :---: |
| **Core Visual Planner** | Drag-and-drop components onto interactive board diagrams. | ✅ | ✅ | ✅ |
| **Pin Validator** | Get real-time feedback on pin compatibility and conflicts. | ✅ | ✅ | ✅ |
| **Project Management** | Save projects locally in your browser. | ✅ (3) | ✅ (Unlimited) | ✅ (Team) |
| **Basic Export** | Export your project plan as a clean Markdown file. | ✅ | ✅ | ✅ |
| **AI Smart Planner** | Automatically generate an optimized, conflict-free pin layout. | ❌ | ⭐ | ⭐ |
| **Advanced Exports** | Export to JSON for data interchange and professional PDF documents. | ❌ | ✅ | ✅ |
| **Wiring Diagrams** | Generate step-by-step wiring instructions for your project. | ❌ | ✅ | ✅ (Advanced) |
| **Code Generation** | Get starter code in Arduino (C++) and Python. | ❌ | ✅ | ✅ (Custom) |
| **Custom Components** | Create and save your own components to a personal library. | ❌ | ✅ | ✅ (Shared) |
| **Real-time Collaboration** | Work on projects with your team simultaneously. | ❌ | ❌ | ✅ |

---

## Screenshots

*Application screenshots will be added here.*

**Pin Validator in Action (Free Tier):**

```text
┌──────────────────────────────────────────────────────────────┐
│ 🔴 Error: Pin Conflict!                                      │
│ Pin 3 (SDA) is already assigned to BMP280.                   │
└──────────────────────────────────────────────────────────────┘
```text

**AI Planner Suggestion (Pro Tier):**

```text
┌──────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                         │
│ Assign DHT22 to GPIO4?                                       │
│                                                              │
│ Rationale: This is a free digital pin with no special        │
│ functions, making it ideal for a simple data line.           │
│                                                              │
│ [Accept] [Manual Override]                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

- A modern web browser (Chrome, Firefox, Edge, etc.)
- A local web server to serve the files (e.g., [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code)

### Running Locally

```bash
git clone https://github.com/your-username/pinpoint-planner.git
cd pinpoint-planner
```

Open `index.html`:

- With Live Server: Right-click `index.html` and choose "Open with Live Server".
- Or open `index.html` directly in your browser.

---

## Supported Hardware

| Family        | Supported Boards         | Status     |
|---------------|-------------------------|------------|
| Raspberry Pi  | Pi 4B, Pi 3B+           | ✅ Supported |
| Arduino       | Uno R3, Nano            | ✅ Supported |
| ESP           | ESP32 DevKit            | ✅ Supported |

---

## Adding More Components

To expand your component library, add new component definitions to the `componentData` object in `data/rulebook.js`. This file is the single source of truth for all component data.

**Component Template:**

```javascript
new_component_id: {
  name: 'Component Name',
  icon: 'fas fa-icon-name', // FontAwesome icon
  tip: 'Brief description for users',
  voltage: '3.3V or 5V',
  complexity: 'simple|moderate|complex',
  requires: {
    data: ['gpio|i2c|spi|uart'],
    power: 1,    // Number of power pins needed
    ground: 1    // Number of ground pins needed
  },
  dependencies: [], // Additional components needed
  notes: 'Important usage notes'
}
```

To add new boards, extend the `boardData` object with new board definitions, including pin layouts and specifications.

---

## Development Tips

- **Components not appearing:** Check the browser console for JavaScript errors.
- **Drag & drop not working:** Ensure touch polyfill is loaded.
- **Images not loading:** Verify image paths and file existence.
- **Export not working:** Check browser permissions for file downloads.

**Browser Requirements:**

- Modern browser with ES6 support
- File download permissions for export features
- Local storage for project saving

**Next Steps:**

- Add missing images for boards (`images/Raspberry Pi 4B.png`, `images/arduino_schematics_pins.png`, `images/ESP32_schematics_pins.png`)
- Test all functionality thoroughly
- Consider adding more board types (Arduino Nano, ESP8266, etc.)
- Implement user feedback from testing
- Plan Pro features development timeline

---

## Contributing

This project thrives on community contributions! Whether it's adding a new board, a new component, or improving the code, your help is welcome.

Please read our `CONTRIBUTING.md` for details on our code of conduct, development process, and how to submit a pull request. The easiest way to help is to add new hardware definitions!

---

## Roadmap

- ✅ **Phase 1: Core Platform** – Visual planner with Pin Validator, basic docs.
- ⏳ **Phase 2: Pro Tier** – AI Smart Planner, wiring diagrams, code generation, custom components.
- 🚀 **Phase 3: Business Tier** – User accounts, real-time collaboration, and organizational features.
- ⏳ **mod packs** – Expand the component library with user-generated content.
- 💼 **White-Label Solutions** – Custom-branded versions of the planner for specific products or companies.
- 🛠️ **Ongoing** – Bug fixes, performance improvements, and user-requested features.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
