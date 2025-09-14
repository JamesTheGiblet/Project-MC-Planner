const codeGenerator = {
    generate: function(projectData) {
        if (!projectData || !projectData.assignments || projectData.assignments.length === 0) {
            return { language: 'text', code: 'Assign some components to generate starter code.' };
        }

        const lang = (projectData.boardId === 'rpi4' || projectData.boardId === 'rpi3bplus') ? 'python' : 'arduino';

        if (lang === 'python') {
            return this.getBasicPythonCode(projectData);
        } else {
            return this.getBasicArduinoCode(projectData);
        }
    },

    getBasicPythonCode: function(projectData) {
        let pinDefs = new Set();

        projectData.assignments.forEach(a => {
            const safeName = a.componentName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            pinDefs.add(`# Pin for ${a.componentName}`);
            pinDefs.add(`${safeName}_PIN = ${a.pin}`);
        });

        const code = `
# PinPoint Planner: Basic Python Starter Code for ${projectData.boardName}
# Upgrade to Pro for fully functional, advanced code!

import time
# import RPi.GPIO as GPIO # Uncomment if needed

# --- Pin Definitions ---
${[...pinDefs].join('\n\n')}

# --- Setup ---
# Initialize your components here.
# Example: GPIO.setmode(GPIO.BCM)
# Example: GPIO.setup(${[...pinDefs].length > 0 ? [...pinDefs].find(d => d.includes('_PIN')).split(' ')[0] : '...'}, GPIO.OUT)
print("Setup complete. Starting main loop...")

try:
    while True:
        # --- Main Loop ---
        # Add your component logic here.
        # e.g., read from sensors, control actuators.
        
        print("Looping...")
        time.sleep(2)

except KeyboardInterrupt:
    print("Program stopped.")
finally:
    # Add cleanup code here if needed (e.g., GPIO.cleanup())
    pass
`;
        return { language: 'python', code: code.trim() };
    },

    getBasicArduinoCode: function(projectData) {
        let pinDefs = new Set();

        projectData.assignments.forEach(a => {
            const safeName = a.componentName.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
            pinDefs.add(`// Pin for ${a.componentName}`);
            pinDefs.add(`#define ${safeName}_PIN ${a.pin}`);
        });

        const code = `
// PinPoint Planner: Basic Arduino C++ Starter Code for ${projectData.boardName}
// Upgrade to Pro for fully functional, advanced code!

// --- Pin Definitions ---
${[...pinDefs].join('\n')}

void setup() {
    Serial.begin(9600);
    // Initialize your components here.
    // Example: pinMode(${[...pinDefs].length > 0 ? [...pinDefs].find(d => d.includes('_PIN')).split(' ')[1] : '...'}, OUTPUT);
}

void loop() {
    // --- Main Loop ---
    // Add your component logic here.
    // e.g., read from sensors, control actuators.
    
    delay(2000); // Delay to prevent spamming the serial monitor
}
`;
        return { language: 'cpp', code: code.trim() };
    }
};