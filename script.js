// Component database with datasheet information
const componentDatabase = {
    'DHT22': {
        name: 'DHT22 Temperature & Humidity Sensor',
        category: 'Sensor',
        voltage: '3.3-6V',
        current: '2.5mA',
        protocol: 'Digital (1-Wire)',
        pins: ['VCC', 'Data', 'GND'],
        pinRequirements: {
            'Data': { type: 'Digital GPIO', pullup: true, notes: 'Requires 4.7kΩ pull-up resistor' },
            'VCC': { type: 'Power', voltage: '3.3V or 5V' },
            'GND': { type: 'Ground' }
        },
        specs: {
            'Temperature Range': '-40°C to 80°C',
            'Humidity Range': '0-100% RH',
            'Accuracy': '±0.5°C, ±2% RH',
            'Response Time': '2 seconds'
        },
        datasheet: 'https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO4', 'GPIO17', 'GPIO27'],
            'esp32': ['GPIO4', 'GPIO16', 'GPIO17'],
            'arduino': ['D2', 'D3', 'D4']
        }
    },
    'ESP32': {
        name: 'ESP32 Development Board',
        category: 'Microcontroller',
        voltage: '3.3V',
        current: '240mA',
        protocol: 'WiFi/Bluetooth',
        pins: ['3V3', 'GND', 'EN', 'VP', 'VN', 'GPIO0-39'],
        pinRequirements: {
            'Power': { type: 'Power', voltage: '5V via USB or 3.3V' },
            'GPIO': { type: 'Digital/Analog', count: 30 }
        },
        specs: {
            'CPU': 'Dual-core 240MHz',
            'Flash': '4MB',
            'RAM': '520KB',
            'WiFi': '802.11 b/g/n',
            'Bluetooth': 'v4.2 BR/EDR and BLE'
        },
        datasheet: 'https://www.espressif.com/sites/default/files/documentation/esp32_datasheet_en.pdf',
        compatibility: ['standalone'],
        recommendedPins: {}
    },
    'SG90': {
        name: 'SG90 Micro Servo Motor',
        category: 'Motor',
        voltage: '4.8-6V',
        current: '650mA',
        protocol: 'PWM',
        pins: ['VCC', 'GND', 'Signal'],
        pinRequirements: {
            'Signal': { type: 'PWM GPIO', frequency: '50Hz', notes: 'Requires PWM signal (1-2ms pulse width)' },
            'VCC': { type: 'Power', voltage: '5V', notes: 'High current - use external power supply' },
            'GND': { type: 'Ground' }
        },
        specs: {
            'Torque': '1.8 kg⋅cm',
            'Speed': '0.1 sec/60°',
            'Rotation': '180° (90° each direction)',
            'Weight': '9g'
        },
        datasheet: 'http://www.ee.ic.ac.uk/pcheung/teaching/DE1_EE/stores/sg90_datasheet.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO18', 'GPIO19', 'GPIO13'],
            'esp32': ['GPIO18', 'GPIO19', 'GPIO5'],
            'arduino': ['D9', 'D10', 'D11']
        }
    },
    'HC-SR04': {
        name: 'HC-SR04 Ultrasonic Distance Sensor',
        category: 'Sensor',
        voltage: '5V',
        current: '15mA',
        protocol: 'Digital',
        pins: ['VCC', 'Trig', 'Echo', 'GND'],
        pinRequirements: {
            'Trig': { type: 'Digital GPIO', notes: 'Trigger input pin' },
            'Echo': { type: 'Digital GPIO', notes: 'Echo output pin (5V level)' },
            'VCC': { type: 'Power', voltage: '5V' },
            'GND': { type: 'Ground' }
        },
        specs: {
            'Range': '2cm - 400cm',
            'Accuracy': '3mm',
            'Angle': '<15°',
            'Frequency': '40kHz'
        },
        datasheet: 'https://cdn.sparkfun.com/datasheets/Sensors/Proximity/HCSR04.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO23-GPIO24', 'GPIO17-GPIO27'],
            'esp32': ['GPIO23-GPIO22', 'GPIO21-GPIO19'],
            'arduino': ['D7-D8', 'D2-D3']
        }
    },
    'DS18B20': {
        name: 'DS18B20 Temperature Sensor',
        category: 'Sensor',
        voltage: '3.0-5.5V',
        current: '1.5mA',
        protocol: '1-Wire',
        pins: ['VDD', 'DQ', 'GND'],
        pinRequirements: {
            'DQ': { type: 'Digital GPIO', pullup: true, notes: 'Data line with 4.7kΩ pull-up' },
            'VDD': { type: 'Power', voltage: '3.3V or 5V' },
            'GND': { type: 'Ground' }
        },
        specs: {
            'Range': '-55°C to +125°C',
            'Accuracy': '±0.5°C',
            'Resolution': '9-12 bit',
            'Conversion Time': '750ms (12-bit)'
        },
        datasheet: 'https://datasheets.maximintegrated.com/en/ds/DS18B20.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO4', 'GPIO17', 'GPIO22'],
            'esp32': ['GPIO4', 'GPIO16', 'GPIO17'],
            'arduino': ['D2', 'D3', 'D4']
        }
    },
    'MCP3008': {
        name: 'MCP3008 8-Channel ADC',
        category: 'IC',
        voltage: '2.7-5.5V',
        current: '500μA',
        protocol: 'SPI',
        pins: ['VDD', 'VREF', 'AGND', 'CLK', 'DOUT', 'DIN', 'CS', 'DGND'],
        pinRequirements: {
            'CLK': { type: 'SPI_SCK', notes: 'SPI Clock' },
            'DOUT': { type: 'SPI_MISO', notes: 'Data Output' },
            'DIN': { type: 'SPI_MOSI', notes: 'Data Input' },
            'CS': { type: 'SPI_CE', notes: 'Chip Select' },
            'VDD': { type: 'Power', voltage: '3.3V or 5V' },
            'DGND': { type: 'Ground' }
        },
        specs: {
            'Resolution': '10-bit',
            'Channels': '8 single-ended',
            'Sample Rate': '200 ksps',
            'INL': '±1 LSB'
        },
        datasheet: 'http://ww1.microchip.com/downloads/en/DeviceDoc/21295d.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO10-MOSI', 'GPIO9-MISO', 'GPIO11-SCK', 'GPIO8-CE0'],
            'esp32': ['GPIO23-MOSI', 'GPIO19-MISO', 'GPIO18-SCK', 'GPIO5-CS'],
            'arduino': ['D11-MOSI', 'D12-MISO', 'D13-SCK', 'D10-SS']
        }
    },
    'OLED 128x64': {
        name: '0.96" OLED Display (SSD1306)',
        category: 'Display',
        voltage: '3.3-5V',
        current: '20mA',
        protocol: 'I2C/SPI',
        pins: ['VCC', 'GND', 'SCL', 'SDA'],
        pinRequirements: {
            'SCL': { type: 'I2C_SCL', notes: 'I2C Clock Line' },
            'SDA': { type: 'I2C_SDA', notes: 'I2C Data Line' },
            'VCC': { type: 'Power', voltage: '3.3V or 5V' },
            'GND': { type: 'Ground' }
        },
        specs: {
            'Resolution': '128x64 pixels',
            'Colors': 'Monochrome',
            'Size': '0.96 inches',
            'Driver': 'SSD1306'
        },
        datasheet: 'https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf',
        compatibility: ['raspberry-pi', 'esp32', 'arduino'],
        recommendedPins: {
            'raspberry-pi': ['GPIO2-SDA', 'GPIO3-SCL'],
            'esp32': ['GPIO21-SDA', 'GPIO22-SCL'],
            'arduino': ['A4-SDA', 'A5-SCL']
        }
    }
};

// Current project state
let selectedBoard = 'raspberry-pi';
let projectComponents = [];
let usedPins = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSearch();
    initializeBoardSelector();
    initializePinInteraction();
    updateSmartRecommendations();
    initializeModal();
});

// Initialize component search functionality
function initializeSearch() {
    const searchInput = document.getElementById('component-search');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        const matches = Object.keys(componentDatabase).filter(key => 
            key.toLowerCase().includes(query) || 
            componentDatabase[key].name.toLowerCase().includes(query) ||
            componentDatabase[key].category.toLowerCase().includes(query)
        );

        displaySearchResults(matches);
    });

    // Hide search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

// Display search results
function displaySearchResults(matches) {
    const searchResults = document.getElementById('search-results');
    
    if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-result">No components found</div>';
    } else {
        searchResults.innerHTML = matches.map(key => {
            const component = componentDatabase[key];
            return `
                <div class="search-result" onclick="selectComponent('${key}')">
                    <div class="result-name">${component.name}</div>
                    <div class="result-specs">
                        <span class="spec-tag">${component.category}</span>
                        <span class="spec-tag">${component.voltage}</span>
                        <span class="spec-tag">${component.protocol}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    searchResults.style.display = 'block';
}

// Select a component and display its datasheet info
function selectComponent(componentKey) {
    const component = componentDatabase[componentKey];
    const selectedDiv = document.getElementById('selected-component');
    const searchResults = document.getElementById('search-results');
    
    // Update component title
    document.getElementById('component-title').textContent = component.name;
    
    // Update specs grid
    const specsGrid = document.getElementById('specs-grid');
    specsGrid.innerHTML = Object.entries(component.specs).map(([key, value]) => `
        <div class="spec-item">
            <div class="spec-label">${key}</div>
            <div class="spec-value">${value}</div>
        </div>
    `).join('');
    
    // Update pin requirements
    const pinRequirements = document.getElementById('pin-requirements');
    pinRequirements.innerHTML = Object.entries(component.pinRequirements).map(([pin, req]) => `
        <div class="requirement-item">
            <span><strong>${pin}:</strong> ${req.type}</span>
            <span class="recommended-pin">${getRecommendedPin(component, pin)}</span>
        </div>
        ${req.notes ? `<div style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">${req.notes}</div>` : ''}
    `).join('');
    
    // Check compatibility
    checkCompatibility(component);
    
    // Show selected component info
    selectedDiv.classList.remove('hidden');
    searchResults.style.display = 'none'; // Keep this for search results dropdown
    
    // Update add button
    const addButton = document.getElementById('add-to-project');
    addButton.onclick = () => addComponentToProject(componentKey);
    
    // Highlight recommended pins
    highlightRecommendedPins(component);
}

// Get recommended pin for a component
function getRecommendedPin(component, pinType) {
    const recommendations = component.recommendedPins[selectedBoard];
    if (!recommendations || !recommendations.length) return 'Auto-assign';
    
    // Find available pin from recommendations
    const availablePin = recommendations.find(pin => !usedPins.includes(pin));
    return availablePin || 'No pins available';
}

// Check board compatibility
function checkCompatibility(component) {
    const warningDiv = document.getElementById('compatibility-warning');
    const warningMessage = document.getElementById('warning-message');
    
    if (!component.compatibility.includes(selectedBoard)) {
        warningMessage.textContent = `This component may have limited compatibility with ${selectedBoard.replace('-', ' ')}. Check voltage levels and pin requirements.`;
        warningDiv.style.display = 'block';
    } else {
        warningDiv.style.display = 'none';
    }
}

// Highlight recommended pins on the pinout
function highlightRecommendedPins(component) {
    // Reset all pins
    document.querySelectorAll('.pin').forEach(pin => {
        pin.classList.remove('recommended');
    });
    
    // Highlight recommended pins
    const recommendations = component.recommendedPins[selectedBoard] || [];
    recommendations.forEach(pinName => {
        const pinElement = document.querySelector(`[data-pin="${pinName}"]`);
        if (pinElement && !pinElement.classList.contains('used')) {
            pinElement.classList.add('recommended');
        }
    });
}

// Add component to project
function addComponentToProject(componentKey) {
    const component = componentDatabase[componentKey];
    
    // Assign pins automatically
    const assignedPins = autoAssignPins(component);
    
    // Add to project components
    projectComponents.push({
        key: componentKey,
        name: component.name,
        pins: assignedPins,
        specs: component
    });
    
    // Update used pins
    Object.values(assignedPins).forEach(pin => {
        if (pin && pin !== 'N/A') usedPins.push(pin);
    });
    
    // Update UI
    updateProjectComponentsList();
    updatePinoutDisplay();
    updateSmartRecommendations();
    
    // Hide component selection
    document.getElementById('selected-component').classList.add('hidden');
    document.getElementById('component-search').value = '';
    
    // Success message
    showNotification(`Added ${component.name} to project!`, 'success');
}

// Auto-assign pins based on component requirements
function autoAssignPins(component) {
    const assigned = {};
    const recommendations = component.recommendedPins[selectedBoard] || [];
    
    Object.entries(component.pinRequirements).forEach(([pinName, requirement]) => {
        if (requirement.type === 'Power') {
            assigned[pinName] = requirement.voltage.includes('3.3') ? '3V3' : '5V';
        } else if (requirement.type === 'Ground') {
            assigned[pinName] = 'GND';
        } else {
            // Find available GPIO pin
            const availablePin = recommendations.find(pin => !usedPins.includes(pin));
            assigned[pinName] = availablePin || 'N/A';
        }
    });
    
    return assigned;
}

// Initialize board selector
function initializeBoardSelector() {
    const boardOptions = document.querySelectorAll('.board-option');
    
    boardOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Update active state
            boardOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Update selected board
            selectedBoard = this.dataset.board;
            
            // Update pinout display
            updatePinoutDisplay();
            updateSmartRecommendations();
            
            // Clear pin assignments if components exist
            if (projectComponents.length > 0) {
                showNotification('Board changed. Pin assignments may need review.', 'warning');
            }
        });
    });
}

// Initialize pin interaction
function initializePinInteraction() {
    document.querySelectorAll('.pin').forEach(pin => {
        pin.addEventListener('click', function() {
            const pinName = this.dataset.pin;
            const pinFunction = this.dataset.function;
            
            showPinInfo(pinName, pinFunction, this.classList.contains('used'));
        });
    });
}

// Show pin information
function showPinInfo(pinName, pinFunction, isUsed) {
    const usageInfo = isUsed ? 
        projectComponents.find(comp => Object.values(comp.pins).includes(pinName)) : null;
    
    const message = `Pin: ${pinName}\nFunction: ${pinFunction}\n${
        isUsed ? `Used by: ${usageInfo?.name || 'Unknown component'}` : 'Available for use'
    }`;
    
    alert(message);
}

// Update project components list
function updateProjectComponentsList() {
    const container = document.getElementById('project-components');
    
    if (projectComponents.length === 0) {
        container.innerHTML = `
            <p style="text-align: center; color: #7f8c8d; padding: 20px;">
                No components added yet. Search and add components to get started!
            </p>
        `;
        return;
    }
    
    container.innerHTML = projectComponents.map((comp, index) => `
        <div class="component-item">
            <div class="component-info">
                <div class="component-name">${comp.name}</div>
                <div class="component-details">
                    ${Object.entries(comp.pins).map(([pinType, pin]) => 
                        `<span class="detail-tag">${pinType}: ${pin}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="component-actions">
                <button class="action-btn" onclick="editComponent(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn" onclick="removeComponent(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Update pinout display
function updatePinoutDisplay() {
    // Update used pins visual state
    document.querySelectorAll('.pin').forEach(pin => {
        const pinName = pin.dataset.pin;
        
        pin.classList.remove('used', 'available');
        
        if (usedPins.includes(pinName)) {
            pin.classList.add('used');
        } else if (!pin.classList.contains('special-function')) {
            pin.classList.add('available');
        }
    });
}

// Update smart recommendations
function updateSmartRecommendations() {
    const recommendationsList = document.getElementById('smart-recommendations');
    
    if (projectComponents.length === 0) {
        recommendationsList.innerHTML = '<li>Select components to see intelligent pin recommendations</li>';
        return;
    }
    
    const recommendations = generateSmartRecommendations();
    recommendationsList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
}

// Generate smart recommendations based on current project
function generateSmartRecommendations() {
    const recommendations = [];
    
    // Power consumption analysis
    const totalCurrent = projectComponents.reduce((total, comp) => {
        const current = parseFloat(comp.specs.current.replace(/[^\d.]/g, ''));
        return total + (isNaN(current) ? 0 : current);
    }, 0);
    
    if (totalCurrent > 500) {
        recommendations.push(`Consider external power supply - total current draw: ${totalCurrent}mA`);
    }
    
    // Protocol conflicts
    const protocols = projectComponents.map(comp => comp.specs.protocol);
    const i2cCount = protocols.filter(p => p.includes('I2C')).length;
    const spiCount = protocols.filter(p => p.includes('SPI')).length;
    
    if (i2cCount > 1) {
        recommendations.push(`${i2cCount} I2C devices can share the same bus (SDA/SCL pins)`);
    }
    
    if (spiCount > 1) {
        recommendations.push(`${spiCount} SPI devices need separate chip select (CS) pins`);
    }
    
    // Pin optimization
    const availableGPIO = document.querySelectorAll('.pin.available').length;
    if (availableGPIO < 5) {
        recommendations.push('Consider using I2C or SPI devices to conserve GPIO pins');
    }
    
    return recommendations.length > 0 ? recommendations : ['Your project configuration looks optimal!'];
}

// Remove component from project
function removeComponent(index) {
    const component = projectComponents[index];
    
    // Remove from used pins
    Object.values(component.pins).forEach(pin => {
        const pinIndex = usedPins.indexOf(pin);
        if (pinIndex > -1) usedPins.splice(pinIndex, 1);
    });
    
    // Remove from project
    projectComponents.splice(index, 1);
    
    // Update UI
    updateProjectComponentsList();
    updatePinoutDisplay();
    updateSmartRecommendations();
    
    showNotification('Component removed from project', 'info');
}

// Initialize modal functionality (closing behavior)
function initializeModal() {
    const modal = document.getElementById('edit-modal');
    const cancelButton = document.getElementById('modal-cancel');
    if (!modal || !cancelButton) return;

    // Close modal on cancel button click
    cancelButton.onclick = () => modal.classList.add('hidden');

    // Close modal when clicking on the overlay (the dark background)
    modal.addEventListener('click', (event) => {
        // We check if the click is on the overlay itself, not its children
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// Edit a component's pin assignments
function editComponent(index) {
    const component = projectComponents[index];
    const modal = document.getElementById('edit-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const saveButton = document.getElementById('modal-save');

    modalTitle.textContent = `Edit ${component.name}`;

    // Get all available GPIO pins from the SVG
    const allPins = Array.from(document.querySelectorAll('.pin:not(.special-function)'))
                         .map(p => p.dataset.pin);
    
    // Get pins used by *other* components
    const otherUsedPins = projectComponents
        .filter((_, i) => i !== index)
        .flatMap(c => Object.values(c.pins));

    const availablePins = allPins.filter(p => !otherUsedPins.includes(p));

    modalBody.innerHTML = Object.entries(component.specs.pinRequirements).map(([pinName, req]) => {
        const currentPin = component.pins[pinName];
        
        if (req.type.includes('GPIO') || req.type.includes('SPI') || req.type.includes('I2C') || req.type.includes('Digital')) {
            // This is an assignable pin
            return `
                <div class="modal-pin-row">
                    <label for="pin-select-${pinName}">${pinName}</label>
                    <select id="pin-select-${pinName}" data-pin-name="${pinName}">
                        <option value="N/A" ${currentPin === 'N/A' ? 'selected' : ''}>Not Assigned</option>
                        ${availablePins.map(pin => 
                            `<option value="${pin}" ${pin === currentPin ? 'selected' : ''}>${pin}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
        } else {
            // This is a fixed pin like Power or Ground
            return `
                <div class="modal-pin-row">
                    <label>${pinName}</label>
                    <span>${currentPin} (fixed)</span>
                </div>
            `;
        }
    }).join('');

    // Show the modal
    modal.classList.remove('hidden');

    // Setup event listeners
    saveButton.onclick = () => saveComponentChanges(index);
}

// Save changes from the edit modal
function saveComponentChanges(index) {
    const component = projectComponents[index];
    const newPins = {};

    // Read new values from the modal and build the new pin assignment object
    document.querySelectorAll('#modal-body select').forEach(select => {
        const pinName = select.dataset.pinName;
        newPins[pinName] = select.value;
    });

    // Update the component in the project array
    projectComponents[index].pins = { ...component.pins, ...newPins };

    // Recalculate all used pins from scratch for simplicity and accuracy
    usedPins = projectComponents.flatMap(c => Object.values(c.pins)).filter(p => p && p !== 'N/A');

    // Update UI
    updateProjectComponentsList();
    updatePinoutDisplay();
    updateSmartRecommendations();

    // Hide modal
    document.getElementById('edit-modal').classList.add('hidden');
    showNotification('Component updated successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}