# PinPoint Planner

![SBC Example](https://upload.wikimedia.org/wikipedia/commons/3/3d/Raspberry_Pi_4_Model_B_-_Side.jpg)

**Plan your hardware projects without the headache.**

*PinPoint Planner is an intelligent, web-based tool for designing projects with single-board computers like Raspberry Pi, Arduino, and ESP32. Go from idea to a validated, documented plan in minutes, not hours.*

[![Live Site](https://img.shields.io/badge/Live_Site-pinpoint--planner.com-brightgreen)](https://pinpoint-planner.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-blue.svg)](https://tailwindcss.com/)
</p>

---

## 📚 Table of Contents

- [The Problem You've Faced](#-the-problem-youve-faced)
- [The Intelligent Solution](#-the-intelligent-solution)
- [Two Levels of Intelligence: From Error-Free to Effortless](#-two-levels-of-intelligence-from-error-free-to-effortless)
- [Find Your Plan: From Free to Pro](#-find-your-plan-from-free-to-pro)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Supported Hardware](#-supported-hardware)
- [Contributing](#-contributing)
- [Roadmap](#️-roadmap)
- [License](#-license)

---

## ❓ The Problem You've Faced

If you've ever worked with an SBC, you know the frustration. A simple project idea quickly gets bogged down by:

- **🔌 Endless Pin Puzzles:** "Which GPIO can I use? Is this pin for I²C or SPI? Wait, I used that one already..."
- **📖 Datasheet Overload:** Dozens of open browser tabs, trying to reconcile board pinouts with component requirements.
- **❌ Costly Mistakes:** A wrong connection or voltage mismatch leads to a frustrating debugging session or, worse, a fried component.
- **✍️ Messy Documentation:** Your final "plan" is a mess of chicken-scratch notes, making it impossible to share or reproduce.

This process is slow, error-prone, and stifles creativity.

---

## 💡 The Intelligent Solution

PinPoint Planner transforms this frustrating process into a fast, visual, and reliable workflow. It's your single source of truth for hardware design.

- **🎯 Plan Visually:** See your board's pins in real-time. As you add components, the planner shows you exactly what's available.
- **🤖 Get Instant Validation:** Our intelligent core automatically flags issues, preventing conflicts before they happen.
- **📋 Generate Docs in One Click:** Export a clean, professional summary of your project, including a component list and pin assignments.

---

## 🧠 Two Levels of Intelligence: From Error-Free to Effortless

PinPoint Planner is built with an intelligent core to make your life easier. We offer two distinct levels of assistance, tailored to your project's needs.

### Included in the Free Plan: The **Pin Validator**

Think of this as a real-time spell-checker for your hardware. As you manually assign pins, the **Pin Validator** works silently in the background, using a smart, rules-based engine to prevent common mistakes.

- **Catches Conflicts:** Instantly flags if a pin is already in use.
- **Prevents Mismatches:** Warns you if you try to connect a component to an incompatible bus (e.g., an SPI device on a UART pin).
- **Stops Errors Before They Happen:** It's your safety net, ensuring every manual connection you make is a valid one.

The Pin Validator helps you build with confidence, knowing you won't make a basic error.

### Unlock Your Co-Pilot with Pro: The **AI Smart Planner**

For more complex projects, you need more than a safety net—you need a strategist. The **AI Smart Planner** is a proactive, intelligent engine that designs the *optimal* layout for you.

- **One-Click Planning:** Add all your components, click "Plan My Board," and the AI gets to work.
- **Holistic Optimization:** It analyzes your entire project to find the best pin assignments, prioritizing stable hardware buses (like I²C or SPI) and respecting power constraints.
- **Explainable Decisions:** It doesn't just give you a plan; it tells you *why* it made each choice, so you learn and stay in control.

The AI Smart Planner moves beyond just preventing errors—it saves you hours of mental effort and delivers a professional-grade plan every time.

---

## 💎 Find Your Plan: From Free to Pro

Start for free and upgrade to unlock the full power of PinPoint Planner.

| Feature | **Free** (For Simple Projects) | **Pro ($7/mo)** (For Hobbyists & Power Users) | **Business ($25/mo/seat)** (For Teams & Professionals) |
| :--- | :--- | :--- | :--- |
| **Projects** | 3 Public Projects | ✅ **Unlimited** Public & Private Projects | ✅ **Unlimited** Team Projects |
| **Core Planner** | ✅ Full Visual Planner | ✅ Full Visual Planner | ✅ Full Visual Planner |
| **Intelligence** | ✅ **Pin Validator** (Reactive Error Checking) | ⭐ **AI Smart Planner** (Proactive Optimal Planning) | ⭐ **AI Smart Planner** |
| **Documentation** | ✅ Markdown Export | ✅ PDF & JSON Export | ✅ Custom Templates |
| **Wiring Diagrams** | ❌ | ✅ Fritzing-style Diagrams | ✅ Advanced Diagrams |
| **Code Generation** | ❌ | ✅ Arduino/Python Starter Code | ✅ Custom Code Templates |
| **Custom Components**| ❌ | ✅ Add Custom Components | ✅ **Shared Team Library** |
| **Collaboration** | ❌ | ❌ | ✅ **Real-time Editing** |

[![Upgrade to Pro](https://img.shields.io/badge/Upgrade_to_Pro-Unlock_the_AI_Planner-brightgreen?style=for-the-badge)](https://pinpoint-planner.com/pricing)
  </a>
</p>

---

## ✨ Features

- [x] **Interactive Pinout Diagrams:** Real-time, color-coded feedback.
- [x] **Rich Component Library:** Dozens of common sensors and actuators.
- [x] **Pin Validator [Free]:** Smart, rule-based checking to prevent errors as you work.
- [x] **Documentation Export:** Generate Markdown summaries with one click.
- [ ] **AI Smart Planner [Pro]:** Let our intelligent planner create an optimized, conflict-free layout for you.
- [ ] **Wiring Diagrams & Code Generation [Pro]:** Go from plan to build even faster.
- [ ] **Real-time Collaboration [Business]:** Design and plan hardware with your entire team.

---

## 📸 Screenshots

## (Application screenshots will be added here.)

## Pin Validator in Action (Free Tier)

┌─────────────────────────────────────────────────────────────────┐
│ 🔴 Error: Pin Conflict\!                                         │
│ Pin 3 (SDA) is already assigned to BMP280.                        │
└─────────────────────────────────────────────────────────────────┘

## AI Planner Suggestion (Pro Tier)

┌─────────────────────────────────────────────────────────────────┐
│ 🤖 AI Recommendation                                            │
│ Assign DHT22 to GPIO4?                                          │
│                                                                 │
│ Rationale: This is a free digital pin with no special functions, │
│ making it ideal for a simple data line.                         │
│                                                                 │
│              [Accept]                [Manual Override]          │
└─────────────────────────────────────────────────────────────────┘

---

## 🚀 Getting Started

Want to run the project locally or contribute?

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git

### Quick Start

1. **Clone the Repository**

    ```bash
    git clone [https://github.com/yourusername/pinpoint-planner.git](https://github.com/yourusername/pinpoint-planner.git)
    cd pinpoint-planner
    ```

2. **Setup Backend (Flask)**

    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
    pip install -r requirements.txt
    python init_db.py
    python app.py
    ```

3. **Setup Frontend (React)**

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

## 🔧 Supported Hardware

Our libraries are constantly growing, driven by community requests.

| Family | Supported Boards | Status |
| :--- | :--- | :--- |
| **Raspberry Pi** | Pi 4B, Pi 3B+ | ✅ Supported |
| **Arduino** | Uno R3, Nano | ✅ Supported |
| **ESP** | ESP32 DevKit | ✅ Supported |

---

## 🤝 Contributing

This project thrives on community contributions. Whether it's adding a new board, a new component, or improving the code, your help is welcome!

Please read our `CONTRIBUTING.md` file for details on our code of conduct, development process, and how to submit a pull request. The easiest way to help is to add new hardware definitions!

---

## 🗺️ Roadmap

- ✅ **Phase 1: Core Platform** - Visual planner with **Pin Validator**, basic docs.
- ⏳ **Phase 2: Pro Tier** - **AI Smart Planner**, wiring diagrams, code generation, custom components.
- 🚀 **Phase 3: Business Tier** - User accounts, real-time collaboration, and organizational features.

---

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

```eof
````
