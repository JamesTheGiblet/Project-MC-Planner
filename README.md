# PinPoint Planner

![SBC Example](https://upload.wikimedia.org/wikipedia/commons/3/3d/Raspberry_Pi_4_Model_B_-_Side.jpg)

**Plan your hardware projects without the headache.**

*PinPoint Planner is an intelligent, web-based tool for designing projects with single-board computers like Raspberry Pi, Arduino, and ESP32. Go from idea to a validated, documented plan in minutes, not hours.*

---

## Table of Contents

- [The Problem You've Faced](#the-problem-youve-faced)
- [The Intelligent Solution](#the-intelligent-solution)
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
The Pin Validator is like a real-time spell-checker for your hardware:
- **Catches Conflicts:** Instantly flags if a pin is already in use.
- **Prevents Mismatches:** Warns if you try to connect a component to an incompatible bus.
- **Stops Errors Before They Happen:** Ensures every manual connection is valid.

---

## Screenshots

*Application screenshots will be added here.*

**Pin Validator in Action (Free Tier):**

```text
┌──────────────────────────────────────────────────────────────┐
│ 🔴 Error: Pin Conflict!                                      │
│ Pin 3 (SDA) is already assigned to BMP280.                   │
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
| ESP           | ESP32 DevKit            | ⏳ Coming Soon |

---

## Adding More Components

You can expand your component library in two ways:

### 1. Manually Add a Component

To add a single new component, you can add its definition directly to the `componentData` object in `data/components.js`.

### 2. Import a Component Pack

You can import a JSON file containing multiple component definitions. In the "Add Components" section of the sidebar, click the "Import" icon (📁) and select your component pack file. The new components will be added and saved in your browser for future sessions.

**Component Template:**

```javascript
// This is the structure for a single component inside a pack file or data/components.js
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

### Testing

This project uses QUnit for unit testing. To run the tests:

1. Make sure you are running the project from a local web server (like VS Code's Live Server).
2. Navigate to the `/tests/tests.html` file in your browser.

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
