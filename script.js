// --- UTILITY CLASSES & FUNCTIONS (Moved from data files) ---

/**
 * Resolves component dependencies based on the board type.
 */
class DependencyResolver {
    constructor(componentData) {
        this.componentData = componentData;
    }

    isDependencyRequired(dependency, boardType) {
        // Check board-specific overrides first
        if (dependency.boardSpecific && dependency.boardSpecific[boardType]) {
            const boardSpec = dependency.boardSpecific[boardType];
            if (typeof boardSpec.required === 'boolean') {
                return boardSpec.required;
            }
        }

        // Check for optional conditions (e.g. for larger servos)
        if (dependency.condition && dependency.required === false) {
            return 'optional';
        }

        // Default to the base 'required' property
        return dependency.required;
    }

    // Get all dependencies for a component assignment
    getComponentDependencies(componentId, boardType = 'rpi4') {
        const component = this.componentData[componentId];
        if (!component || !component.dependencies) return [];

        return component.dependencies.map(dep => {
            const requiredStatus = this.isDependencyRequired(dep, boardType);
            let boardReason = null;
            if (dep.boardSpecific && dep.boardSpecific[boardType]) {
                boardReason = dep.boardSpecific[boardType].reason || null;
            }

            return {
                ...dep,
                componentId,
                componentName: component.name,
                requiredStatus: requiredStatus, // true, false, or 'optional'
                boardReason: boardReason
            };
        });
    }

    // Generate enhanced BOM including dependencies
    generateEnhancedBOM(assignments, boardType = 'rpi4') {
        const bom = {
            mainComponents: [],
            dependencies: {
                resistors: new Map(),
                capacitors: new Map(),
                powerSupplies: [],
                breakoutBoards: [],
                other: []
            },
            warnings: [],
            notes: []
        };

        // Count main components
        const componentCounts = {};
        assignments.forEach(assignment => {
            componentCounts[assignment.componentId] = (componentCounts[assignment.componentId] || 0) + 1;
        });

        // Add main components to BOM
        for (const [componentId, count] of Object.entries(componentCounts)) {
            const component = this.componentData[componentId];
            bom.mainComponents.push({
                name: component.name,
                quantity: count,
                voltage: component.voltage,
                notes: component.tip
            });

            // Collect warnings
            if (component.warnings) {
                bom.warnings.push(...component.warnings);
            }

            // Process dependencies
            const dependencies = this.getComponentDependencies(componentId, boardType);
            dependencies.forEach(dep => {
                // Only add required or optional dependencies to the BOM
                if (dep.requiredStatus === false) {
                    // If not needed, check if there's an alternative to mention
                    if (dep.alternative) {
                        bom.notes.push(`${component.name}: ${dep.alternative}`);
                    }
                    if (dep.boardReason) {
                        bom.notes.push(`${component.name} (${dep.description}): ${dep.boardReason}`);
                    }
                    return;
                }

                const quantity = (dep.quantity || 1) * count;

                switch (dep.type) {
                    case 'resistor':
                        const resistorKey = `${dep.value} (${dep.purpose})`;
                        const currentCount = bom.dependencies.resistors.get(resistorKey) || 0;
                        bom.dependencies.resistors.set(resistorKey, currentCount + quantity);
                        break;

                    case 'capacitor':
                        const capacitorKey = `${dep.value} (${dep.purpose})`;
                        const currentCapCount = bom.dependencies.capacitors.get(capacitorKey) || 0;
                        bom.dependencies.capacitors.set(capacitorKey, currentCapCount + quantity);
                        break;

                    case 'power_supply':
                        bom.dependencies.powerSupplies.push({
                            specification: dep.value,
                            purpose: dep.description,
                            quantity: count
                        });
                        break;

                    case 'level_shifter':
                    case 'i2c_backpack':
                    case 'breakout_board':
                        bom.dependencies.breakoutBoards.push({
                            name: dep.description,
                            purpose: dep.purpose,
                            quantity: count,
                            required: dep.required
                        });
                        break;

                    default:
                        bom.dependencies.other.push({
                            name: dep.description,
                            type: dep.type,
                            quantity: quantity,
                            required: dep.required
                        });
                }
            });
        }

        return bom;
    }
}

/**
 * Filters the global componentData object for components compatible with a given board.
 * @param {string} boardId - The ID of the board (e.g., 'rpi4', 'uno').
 * @returns {Object} A new object containing only compatible components.
 */
function getCompatibleComponents(boardId) {
    const compatibleComponents = {};
    for (const [id, component] of Object.entries(componentData)) {
        // If component specifies board compatibility, check it
        if (component.boardSpecific && Array.isArray(component.boardSpecific)) {
            if (component.boardSpecific.includes(boardId)) {
                compatibleComponents[id] = component;
            }
        } else {
            // If no board restriction, it's compatible with all boards
            compatibleComponents[id] = component;
        }
    }
    return compatibleComponents;
}

/**
 * Returns a structured object that categorizes components by their type.
 * @returns {Object} An object where keys are category names and values are arrays of component IDs.
 */
function getComponentsByCategory() {
    const categories = {};
    // Define a preferred order for categories to appear in the UI
    const categoryOrder = [
        'Sensors', 'Displays', 'Input', 'Output', 'Communication',
        'Motors & Drivers', 'Advanced & ICs', 'Power Management', 'Custom'
    ];

    // Group all components by their category property
    for (const [id, component] of Object.entries(componentData)) {
        // Use the component's category, or 'Custom'/'Other' as fallbacks
        const categoryName = component.category || (id.startsWith('custom-') ? 'Custom' : 'Other');

        if (!categories[categoryName]) {
            categories[categoryName] = [];
        }
        categories[categoryName].push(id);
    }

    // Create a new object with sorted categories
    const sortedCategories = {};
    for (const categoryName of categoryOrder) {
        if (categories[categoryName]) {
            sortedCategories[categoryName] = categories[categoryName];
            delete categories[categoryName]; // Remove from original to track un-ordered categories
        }
    }

    // Add any remaining categories (like 'Other' or new ones from packs) to the end
    for (const categoryName in categories) {
        sortedCategories[categoryName] = categories[categoryName];
    }

    return sortedCategories;
}


document.addEventListener('DOMContentLoaded', function() {
    const promptGeneratorData = {
        rpi4: {
            name: 'Raspberry Pi 4B',
            icon: 'fab fa-raspberry-pi',
            color: '#c51d4e',
            prompts: {
                specs: "- Detailed technical specifications: processor architecture, RAM options, connectivity (WiFi, Bluetooth, Ethernet), USB ports, video output capabilities, power requirements, and physical dimensions.\n",
                pinout: "- GPIO pinout details: complete 40-pin header layout, power pins (3.3V, 5V, GND), special function pins (I2C, SPI, UART), and PWM-capable GPIO pins. Include pin numbering schemes (BCM vs Board).\n",
                setup: "- Setup and configuration: recommended operating systems, installation process (Raspberry Pi Imager), initial configuration (raspi-config), network setup, and essential post-installation steps.\n",
                programming: "- Programming options: supported languages (Python, C/C++, JavaScript), recommended IDEs and tools, GPIO access libraries (RPi.GPIO, gpiozero), and communication protocol libraries (I2C, SPI).\n",
                projects: "- Project ideas: beginner to advanced project suggestions (home automation, robotics, media center, IoT applications), required components, and implementation guidance.\n",
                troubleshooting: "- Common troubleshooting: power issues, SD card problems, boot failures, peripheral connectivity issues, overheating, and performance optimization techniques.\n"
            }
        },
        uno: {
            name: 'Arduino Uno R3',
            icon: 'fas fa-microchip',
            color: '#00979D',
            prompts: {
                specs: "- Detailed technical specifications: ATmega328P microcontroller, operating voltage (5V), input voltage range, memory (Flash, SRAM, EEPROM), clock speed, and current limits per I/O pin.\n",
                pinout: "- Pinout details: Digital I/O pins (0-13), PWM pins (~), Analog Input pins (A0-A5), and special function pins for I2C (SDA, SCL), SPI (SS, MOSI, MISO, SCK), and UART (RX, TX).\n",
                setup: "- Setup and configuration: installing the Arduino IDE, connecting the board, selecting the correct board and port, and uploading a basic 'Blink' sketch.\n",
                programming: "- Programming with the Arduino language (C/C++ based): core functions like pinMode(), digitalWrite(), analogRead(), and using essential libraries like Wire.h (for I2C) and SPI.h.\n",
                projects: "- Project ideas: beginner projects like blinking LEDs and reading sensors, to more advanced projects like controlling motors, building simple robots, or creating interactive art.\n",
                troubleshooting: "- Common troubleshooting: board not recognized by computer, sketch upload errors, power issues, and debugging techniques using the Serial Monitor.\n"
            }
        },
        esp32: {
            name: 'ESP32 DevKitC',
            icon: 'fas fa-wifi',
            color: '#E63946',
            prompts: {
                specs: "- Detailed technical specifications: Tensilica Xtensa LX6 dual-core processor, integrated Wi-Fi and Bluetooth, flexible GPIO multiplexing, and on-chip sensors (Hall effect, touch sensors).\n",
                pinout: "- Pinout details: flexible GPIO mapping for I2C, SPI, and UART. Explain the concept of pin multiplexing. Mention important strapping pins (e.g., GPIO 0, 2, 12) and their role during boot-up.\n",
                setup: "- Setup and configuration: setting up the Arduino IDE or PlatformIO for ESP32 development, installing board packages, and flashing a basic Wi-Fi scanning sketch.\n",
                programming: "- Programming options: using the Arduino framework or Espressif's own ESP-IDF. Cover key libraries for Wi-Fi, Bluetooth, and using the dual-core capabilities.\n",
                projects: "- Project ideas: IoT projects like web servers, MQTT clients, Bluetooth beacons, and low-power deep sleep applications for battery-powered devices.\n",
                troubleshooting: "- Common troubleshooting: 'brownout detector was triggered' errors, Wi-Fi connection issues, flashing failures, and issues related to strapping pins.\n"
            }
        }
    };

    // --- HACK: Augment boardData with power specs as boards.js is not in context ---
    // In a real scenario, this data would be in data/boards.js
    if (boardData.rpi4) {
        boardData.rpi4.powerInput = { min: 5, max: 5.1, nominal: 5, type: 'usb-c' };
    }
    if (boardData.uno) {
        boardData.uno.powerInput = { min: 7, max: 12, nominal: 9, type: 'barrel', warning: 'Higher voltages (10-12V) are acceptable but can cause the 5V regulator to get hot.' };
    }
    if (boardData.esp32) {
        boardData.esp32.powerInput = { min: 5, max: 5.1, nominal: 5, type: 'micro-usb' };
    }
    // --- END HACK ---

    // --- Element Selections ---
    const boardOptions = document.querySelectorAll('.board-option');
    const projectComponentsList = document.querySelector('.components-panel .components-list');
    const validationFeedback = document.querySelector('.validation-feedback');
    const pinDetailsPanel = document.querySelector('.pin-details');
    const clearBoardBtn = document.getElementById('clear-board-btn');
    const plannerTitle = document.querySelector('.planner-title');
    const saveProjectBtn = document.getElementById('save-project-btn');
    const importJsonBtn = document.getElementById('import-json-btn');
    const powerSourceSelect = document.getElementById('power-source-select');
    const exportMdBtn = document.getElementById('export-md-btn');
    const copyMdBtn = document.getElementById('copy-md-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const projectsList = document.getElementById('projects-list');
    const wiringDiagramBtn = document.getElementById('wiring-diagram-btn');
    const generateBomBtn = document.getElementById('generate-bom-btn');
    const generateCodeBtn = document.getElementById('generate-code-btn');
    const documentationBtn = document.getElementById('documentation-btn');
    const planMyBoardBtn = document.getElementById('plan-my-board-btn');
    const upgradeProBtn = document.getElementById('upgrade-pro-btn');
    const wiringModal = document.getElementById('wiring-modal');
    const bomModal = document.getElementById('bom-modal');
    const codeModal = document.getElementById('code-modal');
    const docsModal = document.getElementById('docs-modal');
    const addComponentBtn = document.getElementById('add-component-btn');
    const addComponentsList = document.getElementById('add-components-list');
    const upgradeModal = document.getElementById('upgrade-modal');
    const upgradeModalCloseBtn = document.getElementById('upgrade-modal-close-btn');
    const upgradeNowBtn = document.getElementById('upgrade-now-btn');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmationModalTitle = document.getElementById('confirmation-modal-title');
    const confirmationModalMessage = document.getElementById('confirmation-modal-message');
    const confirmationModalCloseBtn = document.getElementById('confirmation-modal-close-btn');
    const confirmationCancelBtn = document.getElementById('confirmation-cancel-btn');
    const confirmationConfirmBtn = document.getElementById('confirmation-confirm-btn');
    const copyJsonBtn = document.getElementById('copy-json-btn');
    const copyBomBtn = document.getElementById('copy-bom-btn');
    const importPackBtn = document.getElementById('import-pack-btn');
    const importPackInput = document.getElementById('import-pack-input');
    const copyWiringBtn = document.getElementById('copy-wiring-btn');
    const addComponentModal = document.getElementById('add-component-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const bomModalCloseBtn = document.getElementById('bom-modal-close-btn');
    const exportBomCsvBtn = document.getElementById('export-bom-csv-btn');
    const codeModalCloseBtn = document.getElementById('code-modal-close-btn');
    const documentationModal = document.getElementById('documentation-modal'); // This is the modal overlay
    const docsModalTitle = document.getElementById('docs-modal-title');
    const promptGeneratorBtn = document.getElementById('prompt-generator-btn');
    const promptGeneratorModal = document.getElementById('prompt-generator-modal');
    const promptGeneratorModalCloseBtn = document.getElementById('prompt-generator-modal-close-btn');
    const promptGenModalTitle = document.getElementById('prompt-gen-modal-title');
    const promptGenModalIntro = document.getElementById('prompt-gen-modal-intro');
    const docTabsContainer = document.querySelector('.doc-tabs');
    const boardsDocTab = document.getElementById('boards-doc-tab');
    const componentsDocTab = document.getElementById('components-doc-tab');
    const copyDocsBtn = document.getElementById('copy-docs-btn');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const addComponentModalCloseBtn = document.getElementById('add-component-modal-close-btn');
    const componentSearch = document.getElementById('component-search');
    const wiringDiagramContent = document.getElementById('wiring-diagram-content');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const boardEl = document.querySelector('.board');
    const boardImageEl = boardEl.querySelector('.board-image');
    const importJsonInput = document.getElementById('import-json-input');
    const addComponentForm = document.getElementById('add-component-form');
    const componentTemplateSelect = document.getElementById('component-template-select');
    const i2cFields = document.getElementById('i2c-fields');
    const spiFields = document.getElementById('spi-fields');
    const dataPinTypeGroup = document.getElementById('data-pin-type-group');
    const powerPinsGroup = document.getElementById('power-pins-group');
    const groundPinsGroup = document.getElementById('ground-pins-group');
    const componentDataSelect = document.getElementById('component-data-select');

    const boardName = document.querySelector('.board-name');
    const pinsContainer = document.querySelector('.pins-container');

    // --- Prompt Generator Elements ---
    const promptOptionCards = document.querySelectorAll('.prompt-gen-option-card');
    const promptGenGenerateBtn = document.getElementById('prompt-gen-generate-btn');
    const promptGenCopyBtn = document.getElementById('prompt-gen-copy-btn');
    const promptGenCustomInput = document.getElementById('prompt-gen-custom-input');
    const promptGenOutputBox = document.getElementById('prompt-gen-generated-prompt');

    // --- State ---
    let draggedComponent = null;
    let components = []; // This will be populated dynamically
    let pins = []; // This will be populated dynamically
    let newlyImportedComponentIds = []; // To track new components for highlighting

    // --- Event Listeners ---

    // Board selection
    boardOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (this.classList.contains('disabled')) {
                return;
            }

            // Clear current state before rendering new board
            clearBoardBtn.click();

            boardOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const boardId = this.dataset.board;
            renderBoard(boardId);
            validateBoardPowerSource();
        });
    });

    // --- Image Loading Optimization ---
    boardImageEl.onload = function() {
        this.classList.add('loaded');
        validateBoardPowerSource(); // Also validate when image (and thus board) is fully rendered
        console.log('Board image loaded successfully.'); // Add this line
    };

    boardImageEl.onerror = function() {
        console.error('Error loading board image.');
    };



    // Dark Mode Toggle
    darkModeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            setTheme('light');
        } else {
            setTheme('dark');
        }
    });

    // Save Project Button
    saveProjectBtn.addEventListener('click', saveCurrentProject);

    // Power Source Validation
    powerSourceSelect.addEventListener('change', validateBoardPowerSource);

    // Import from JSON
    importJsonBtn.addEventListener('click', () => {
        importJsonInput.click();
    });

    // Import Component Pack
    importPackBtn.addEventListener('click', () => importPackInput.click());
    importPackInput.addEventListener('change', handlePackImport);
    importJsonInput.addEventListener('change', handleJsonImport);

    // Placeholder button listeners
    planMyBoardBtn.addEventListener('click', () => {
        showUpgradeModal();
    });

    upgradeProBtn.addEventListener('click', () => {
        showUpgradeModal();
    });


    // Custom Component List (Delete)
    addComponentsList.addEventListener('click', handleComponentListClick);

    // Prevent sidebar scroll when scrolling component list
    addComponentsList.addEventListener('wheel', (e) => {
        const { scrollTop, scrollHeight, clientHeight } = addComponentsList;
        const isScrollable = scrollHeight > clientHeight;
        const isAtTop = e.deltaY < 0 && scrollTop === 0;
        // -1 for pixel rounding tolerance
        const isAtBottom = e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight - 1;

        if (isScrollable && !isAtTop && !isAtBottom) {
            e.stopPropagation();
        }
    });

    // Component Search
    componentSearch.addEventListener('input', handleComponentSearch);

    // Export to Markdown
    exportMdBtn.addEventListener('click', () => {
        generateMarkdownExport();
    });

    // Copy Markdown to Clipboard
    copyMdBtn.addEventListener('click', copyMarkdownToClipboard);

    // Projects List (Load and Delete)
    projectsList.addEventListener('click', handleProjectsListClick);

    // Export to JSON
    exportJsonBtn.addEventListener('click', () => {
        showUpgradeModal();
    });
    copyJsonBtn.addEventListener('click', () => {
        showUpgradeModal();
    });

    // Wiring Diagram Button
    wiringDiagramBtn.addEventListener('click', generateWiringDiagram);

    // Generate BOM Button
    generateBomBtn.addEventListener('click', generateBOM);

    // Generate Code Button
    generateCodeBtn.addEventListener('click', () => {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot generate code for an empty board. Please assign some components first.");
            return;
        }
        const { language, code } = codeGenerator.generate(projectData);

        const codeBlock = document.getElementById('code-block');
        codeBlock.textContent = code;
        codeBlock.className = `language-${language}`;
        Prism.highlightElement(codeBlock);

        codeModal.classList.remove('hidden');
    });

    // Docs Button
    documentationBtn.addEventListener('click', openDocumentationModal); // This will now call the correct function

    // Prompt Generator Button & Modal
    promptGeneratorBtn.addEventListener('click', openPromptGeneratorModal);
    promptGeneratorModalCloseBtn.addEventListener('click', () => promptGeneratorModal.classList.add('hidden'));
    promptGeneratorModal.addEventListener('click', (e) => {
        if (e.target === promptGeneratorModal) {
            promptGeneratorModal.classList.add('hidden');
        }
    });

    if (documentationModal) {
        documentationModal.addEventListener('click', (e) => {
            if (e.target === documentationModal) {
                documentationModal.classList.add('hidden');
            }
        });
    }

    // Code Modal Listeners
    codeModalCloseBtn.addEventListener('click', () => codeModal.classList.add('hidden'));
    codeModal.addEventListener('click', (e) => {
        if (e.target === codeModal) codeModal.classList.add('hidden');
    });
    copyCodeBtn.addEventListener('click', copyGeneratedCode);

    // Documentation Modal Listeners
    const documentationModalCloseBtn = document.getElementById('documentation-modal-close-btn');
    if (documentationModalCloseBtn) {
        documentationModalCloseBtn.addEventListener('click', () => documentationModal.classList.add('hidden'));
    }
    copyDocsBtn.addEventListener('click', copyDocsToClipboard);

    if (docTabsContainer) {
        docTabsContainer.addEventListener('click', handleDocTabSwitch);
    }
    
    // BOM Modal Listeners
    bomModalCloseBtn.addEventListener('click', () => bomModal.classList.add('hidden'));
    bomModal.addEventListener('click', (e) => {
        if (e.target === bomModal) {
            bomModal.classList.add('hidden');
        }
    });
    exportBomCsvBtn.addEventListener('click', () => showUpgradeModal());
    copyBomBtn.addEventListener('click', copyBomToClipboard);

    // Modal Close Listeners
    modalCloseBtn.addEventListener('click', () => wiringModal.classList.add('hidden'));
    wiringModal.addEventListener('click', (e) => {
        copyWiringBtn.addEventListener('click', copyWiringDiagramToClipboard);
        // Close modal if the overlay (the background) is clicked
        if (e.target === wiringModal) {
            wiringModal.classList.add('hidden');
        }
    });

    // Add Component Button & Modal
    addComponentBtn.addEventListener('click', () => {
        const FREE_TIER_COMPONENT_LIMIT = 5;
        const customComponentCount = Object.keys(getCustomComponents()).length;

        if (customComponentCount >= FREE_TIER_COMPONENT_LIMIT) {
            showUpgradeModal();
        } else {
            resetComponentModal();
            addComponentModal.classList.remove('hidden');
        }
    });

    addComponentModalCloseBtn.addEventListener('click', () => {
        addComponentModal.classList.add('hidden');
        resetComponentModal();
    });

    addComponentModal.addEventListener('click', (e) => {
        if (e.target === addComponentModal) {
            addComponentModal.classList.add('hidden');
            resetComponentModal();
        }
    });

    addComponentForm.addEventListener('submit', (e) => {
        handleAddComponent(e);
    });

    // Add Component Template Change Listener
    componentTemplateSelect.addEventListener('change', handleTemplateChange);

    // Confirmation Modal
    let onConfirmCallback = null;
    confirmationModalCloseBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
    confirmationCancelBtn.addEventListener('click', () => confirmationModal.classList.add('hidden'));
    confirmationModal.addEventListener('click', (e) => {
        if (e.target === confirmationModal) {
            confirmationModal.classList.add('hidden');
        }
    });
    confirmationConfirmBtn.addEventListener('click', () => {
        if (typeof onConfirmCallback === 'function') {
            onConfirmCallback();
        }
        confirmationModal.classList.add('hidden');
        onConfirmCallback = null; // Reset callback
    });

    // Upgrade Modal Listeners
    upgradeModalCloseBtn.addEventListener('click', () => upgradeModal.classList.add('hidden'));
    upgradeModal.addEventListener('click', (e) => {
        if (e.target === upgradeModal) {
            upgradeModal.classList.add('hidden');
        }
    });
    upgradeNowBtn.addEventListener('click', () => {
        alert('Thank you for your interest! Pricing and checkout will be available soon.');
        upgradeModal.classList.add('hidden');
    });

    // --- Prompt Generator Listeners ---
    promptOptionCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
        });
    });

    promptGenGenerateBtn.addEventListener('click', () => {
        const activeBoardId = document.querySelector('.board-option.active')?.dataset.board;
        if (!activeBoardId || !promptGeneratorData[activeBoardId]) return;

        const boardPrompts = promptGeneratorData[activeBoardId].prompts;
        const selectedCategories = [];
        document.querySelectorAll('.prompt-gen-option-card.selected').forEach(card => {
            selectedCategories.push(card.dataset.category);
        });

        if (selectedCategories.length === 0 && !promptGenCustomInput.value.trim()) {
            promptGenOutputBox.textContent = "Please select at least one category or add custom details to generate a prompt.";
            promptGenOutputBox.style.color = 'var(--warning)';
            return;
        }

        let prompt = `Generate a comprehensive overview for a project using the ${promptGeneratorData[activeBoardId].name}. Include the following sections:\n\n`;

        selectedCategories.forEach(category => {
            if (boardPrompts[category]) {
                prompt += boardPrompts[category];
            }
        });

        const customText = promptGenCustomInput.value.trim();
        if (customText) {
            prompt += "\n- Additionally, address the following specific points:\n";
            prompt += `  - ${customText}\n`;
        }

        prompt += `\nStructure the output clearly with headings for each section.`;

        promptGenOutputBox.textContent = prompt;
        promptGenOutputBox.style.color = 'var(--dark)';
    });

    promptGenCopyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(promptGenOutputBox.textContent).then(() => {
            const originalText = promptGenCopyBtn.innerHTML;
            promptGenCopyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                promptGenCopyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy prompt: ', err);
        });
    });

    // Clear Board button
    clearBoardBtn.addEventListener('click', () => {
        // Check if there are any components assigned
        if (projectComponentsList.children.length > 0) {
            // If so, ask for confirmation
            if (!confirm("Are you sure you want to clear the board? All assigned components will be removed.")) {
                return; // User cancelled
            }
        }

        // A more robust way to clear: reset all pins directly.
        pins.forEach(pin => {
            pin.classList.remove('assigned', 'conflict');
            // Reset title to its original state
            if (pin.dataset.originalTitle) {
                pin.title = pin.dataset.originalTitle;
            }
            // Clear assignment data attributes
            delete pin.dataset.assignedComponent;
            delete pin.dataset.assignedFor;
        });

        // Clear the list of assigned component badges
        projectComponentsList.innerHTML = '';
        
        // Reset UI elements
        clearValidation();
        pinDetailsPanel.classList.add('hidden');

    });

    // Remove component by clicking its badge
    projectComponentsList.addEventListener('click', (e) => {
        const clickedBadge = e.target.closest('.component-badge');
        if (!clickedBadge) return;

        // Prevent removal if it's already being removed
        if (clickedBadge.classList.contains('removing')) return;

        const pinNumber = clickedBadge.dataset.pinNumber;
        const componentId = clickedBadge.dataset.componentId;
        if (!pinNumber || !componentId) return;

        // Find the corresponding pin element
        const pinToClear = Array.from(pins).find(p => p.textContent.trim() === pinNumber);

        if (pinToClear) {
            unassignComponentFromPin(pinToClear);

            // Animate out and then remove the badge
            clickedBadge.classList.add('removing');
            clickedBadge.addEventListener('animationend', () => {
                clickedBadge.remove();
            }, { once: true });
            
            // If the details of the cleared pin were open, close them
            const detailsTitle = pinDetailsPanel.querySelector('h3');
            if (detailsTitle && detailsTitle.textContent.includes(`Pin: ${pinNumber}`)) {
                pinDetailsPanel.classList.add('hidden');
            }
        }
    });

    // --- Component Management Functions ---

    function handleTemplateChange() {
        const template = componentTemplateSelect.value;

        // Hide all dynamic fields first
        i2cFields.classList.add('hidden');
        spiFields.classList.add('hidden');
        dataPinTypeGroup.classList.remove('hidden');
        powerPinsGroup.classList.remove('hidden');
        groundPinsGroup.classList.remove('hidden');

        // Enable data select by default, disable for specific templates
        componentDataSelect.disabled = false;

        switch (template) {
            case 'i2c':
                i2cFields.classList.remove('hidden');
                componentDataSelect.value = 'i2c';
                componentDataSelect.disabled = true;
                break;
            case 'spi':
                spiFields.classList.remove('hidden');
                componentDataSelect.value = 'spi';
                componentDataSelect.disabled = true;
                break;
            case 'simple-gpio':
                componentDataSelect.value = 'gpio';
                componentDataSelect.disabled = true;
                break;
            case 'motor':
                dataPinTypeGroup.classList.add('hidden'); // Motors are often controlled by drivers, not direct data pins
                break;
            // 'custom' case falls through to default
            default: // Custom
                break;
        }
    }

    function handleDuplicateComponent(componentId) {
        const componentToDuplicate = componentData[componentId];
        if (!componentToDuplicate) return;

        // Ensure the modal is in a clean "add" state
        resetComponentModal();

        // Populate form with data from the component to duplicate
        document.getElementById('component-name-input').value = componentToDuplicate.name + ' - Copy';
        document.getElementById('component-category-input').value = componentToDuplicate.category || '';
        document.getElementById('component-icon-input').value = componentToDuplicate.icon;
        document.getElementById('component-tip-input').value = componentToDuplicate.tip || '';
        
        if (componentToDuplicate.template) {
            componentTemplateSelect.value = componentToDuplicate.template;
        } else {
            // Fallback for older components
            const dataReq = componentToDuplicate.requires.data ? componentToDuplicate.requires.data[0] : null;
            if (dataReq === 'i2c') componentTemplateSelect.value = 'i2c';
            else if (dataReq === 'spi') componentTemplateSelect.value = 'spi';
            else if (dataReq === 'gpio') componentTemplateSelect.value = 'simple-gpio';
            else componentTemplateSelect.value = 'custom';
        }
        handleTemplateChange(); // Update UI based on template

        const dataReq = componentToDuplicate.requires.data ? componentToDuplicate.requires.data[0] : null;
        if (dataReq) componentDataSelect.value = dataReq;
        if (componentToDuplicate.i2cAddress) document.getElementById('component-i2c-address-input').value = componentToDuplicate.i2cAddress;
        if (componentToDuplicate.pins_required) document.getElementById('component-pins-required-input').value = componentToDuplicate.pins_required;

        document.getElementById('component-power-input').value = componentToDuplicate.requires.power ?? 1;
        document.getElementById('component-ground-input').value = componentToDuplicate.requires.ground ?? 1;

        addComponentModal.classList.remove('hidden');
    }

    function openEditComponentModal(componentId) {
        const component = componentData[componentId];
        if (!component) return;

        // Populate form
        document.getElementById('component-name-input').value = component.name;
        document.getElementById('component-category-input').value = component.category || '';
        document.getElementById('component-icon-input').value = component.icon;
        document.getElementById('component-tip-input').value = component.tip || '';

        // Determine template and set form state
        const dataReq = component.requires.data ? component.requires.data[0] : null;
        if (component.template) {
            componentTemplateSelect.value = component.template;
        } else {
            // Fallback for older custom components without a template property
            if (dataReq === 'i2c') {
                componentTemplateSelect.value = 'i2c';
            } else if (dataReq === 'spi') {
                componentTemplateSelect.value = 'spi';
            } else if (dataReq === 'gpio') {
                componentTemplateSelect.value = 'simple-gpio';
            } else {
                componentTemplateSelect.value = 'custom';
            }
        }
        handleTemplateChange(); // Update UI based on template

        // Populate fields
        if (dataReq) componentDataSelect.value = dataReq;
        if (component.i2cAddress) document.getElementById('component-i2c-address-input').value = component.i2cAddress;
        if (component.pins_required) document.getElementById('component-pins-required-input').value = component.pins_required;

        document.getElementById('component-power-input').value = component.requires.power ?? 1;
        document.getElementById('component-ground-input').value = component.requires.ground ?? 1;

        // Change modal to "edit" mode
        addComponentModal.querySelector('h3').textContent = 'Edit Custom Component';
        addComponentForm.querySelector('button[type="submit"]').textContent = 'Save Changes';
        addComponentForm.dataset.editingId = componentId;

        addComponentModal.classList.remove('hidden');
    }

    function handleComponentListClick(e) {
        const deleteBtn = e.target.closest('.delete-component-btn');
        if (deleteBtn) {
            const componentItem = deleteBtn.closest('.component-item');
            const componentId = componentItem.dataset.component;

            const isAssigned = !!projectComponentsList.querySelector(`[data-component-id="${componentId}"]`);
            if (isAssigned) {
                alert("Cannot delete this component type because one or more instances are assigned to the board. Please remove all instances first.");
                return;
            }

            if (confirm(`Are you sure you want to permanently delete the "${componentData[componentId].name}" component?`)) {
                deleteCustomComponent(componentId);
            }
            return;
        }

        const editBtn = e.target.closest('.edit-component-btn');
        if (editBtn) {
            const componentItem = editBtn.closest('.component-item');
            const componentId = componentItem.dataset.component;

            const isAssigned = !!projectComponentsList.querySelector(`[data-component-id="${componentId}"]`);
            if (isAssigned) {
                alert("Cannot edit this component type because one or more instances are assigned to the board. Please remove all instances first.");
                return;
            }
            
            openEditComponentModal(componentId);
            return;
        }

        const duplicateBtn = e.target.closest('.duplicate-component-btn');
        if (duplicateBtn) {
            const componentItem = duplicateBtn.closest('.component-item');
            const componentId = componentItem.dataset.component;
            handleDuplicateComponent(componentId);
        }
    }

    function deleteCustomComponent(componentId) {
        const customComponents = getCustomComponents();
        delete customComponents[componentId];
        saveCustomComponents(customComponents); // New function to save the whole object
        delete componentData[componentId];
        renderAndAttachComponentListeners();
    }

    function handleAddComponent(e) {
        e.preventDefault();
        const editingId = addComponentForm.dataset.editingId;
        const nameInput = document.getElementById('component-name-input');
        const categoryInput = document.getElementById('component-category-input');
        const iconInput = document.getElementById('component-icon-input');
        const name = nameInput.value;
        const tip = document.getElementById('component-tip-input').value.trim();
        const icon = iconInput.value;
        const dataType = componentDataSelect.value;
        const power = parseInt(document.getElementById('component-power-input').value, 10);
        const ground = parseInt(document.getElementById('component-ground-input').value, 10);
        const template = componentTemplateSelect.value;

        const category = categoryInput.value.trim();
        if (!name.trim() || !icon.trim()) {
            alert("Please fill out Name and Icon fields.");
            return;
        }

        const componentDefinition = {
            name: name,
            icon: icon,
            category: category || 'Custom', // Use 'Custom' as a fallback
            tip: tip || 'Custom user component.', // Add a default tip
            template: template,
            requires: {
                data: template !== 'motor' ? [dataType] : [],
                power: power,
                ground: ground
            }
        };

        // Add template-specific properties
        if (template === 'i2c') {
            const i2cAddress = document.getElementById('component-i2c-address-input').value.trim();
            if (i2cAddress) {
                componentDefinition.i2cAddress = i2cAddress;
            }
        } else if (template === 'spi') {
            const pinsRequired = parseInt(document.getElementById('component-pins-required-input').value, 10);
            if (pinsRequired > 0) {
                componentDefinition.pins_required = pinsRequired;
            }
        }

        if (editingId) {
            // --- EDIT MODE ---
            componentData[editingId] = { ...componentData[editingId], ...componentDefinition };
            saveCustomComponent(editingId, componentData[editingId]);
        } else {
            // --- ADD MODE ---
            const newComponentId = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
            componentData[newComponentId] = componentDefinition;
            saveCustomComponent(newComponentId, componentDefinition);
        }
    
        renderAndAttachComponentListeners();
        resetComponentModal();
        addComponentModal.classList.add('hidden');
    }

    function resetComponentModal() {
        addComponentForm.reset();
        delete addComponentForm.dataset.editingId;
        addComponentModal.querySelector('h3').textContent = 'Add Custom Component';
        addComponentForm.querySelector('button[type="submit"]').textContent = 'Add Component';
        // Reset dynamic form to default state
        componentTemplateSelect.value = 'simple-gpio';
        handleTemplateChange();
    }

    function getCustomComponents() {
        return JSON.parse(localStorage.getItem('pinpoint-custom-components') || '{}');
    }
    
    function saveCustomComponent(id, data) {
        const customComponents = getCustomComponents();
        customComponents[id] = data;
        localStorage.setItem('pinpoint-custom-components', JSON.stringify(customComponents));
    }
    
    function saveCustomComponents(components) {
        localStorage.setItem('pinpoint-custom-components', JSON.stringify(components));
    }

    function loadCustomComponents() {
        const customComponents = getCustomComponents();
        // Merge custom components into the base componentData object
        Object.assign(componentData, customComponents);
    }

    // --- Helper Functions ---

    function handlePackImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const packData = JSON.parse(event.target.result);

                // Basic validation
                if (typeof packData !== 'object' || packData === null || Array.isArray(packData)) {
                    throw new Error("Component pack must be a JSON object.");
                }

                // Check against free tier limit before proceeding
                const FREE_TIER_COMPONENT_LIMIT = 5;
                const customComponents = getCustomComponents();
                const customComponentCount = Object.keys(customComponents).length;
                
                let newComponentsCount = 0;
                for (const id in packData) {
                    // Only count components that are not already custom components
                    if (!customComponents[id]) {
                        newComponentsCount++;
                    }
                }

                if (customComponentCount + newComponentsCount > FREE_TIER_COMPONENT_LIMIT) {
                    alert(`Importing this pack would create ${newComponentsCount} new components, exceeding your free limit of ${FREE_TIER_COMPONENT_LIMIT}. Please upgrade to Pro for unlimited components.`);
                    showUpgradeModal();
                    importPackInput.value = ''; // Reset input
                    return; // Stop the import
                }

                // More detailed validation
                for (const [id, component] of Object.entries(packData)) {
                    if (!component.name || !component.icon || !component.requires) {
                        throw new Error(`Component '${id}' is missing required properties (name, icon, requires).`);
                    }
                    if (componentData[id]) {
                        console.warn(`Component pack is overwriting existing component with ID: ${id}`);
                    }
                }

                // Store the IDs of the new components for highlighting
                newlyImportedComponentIds = Object.keys(packData);

                // Merge and save
                Object.assign(componentData, packData);
                saveImportedPack(packData); // Persist to localStorage

                // Update UI
                renderAndAttachComponentListeners(); // This will now use the newlyImportedComponentIds
                updateComponentCounter();
                alert(`Successfully imported ${Object.keys(packData).length} components!`);

                // Clear the temporary list after rendering. The CSS animation will handle the visual effect.
                newlyImportedComponentIds = [];

            } catch (error) {
                alert(`Error importing component pack: ${error.message}`);
                console.error("Error parsing component pack:", error);
            } finally {
                importPackInput.value = ''; // Reset input
            }
        };
        reader.onerror = function() {
            alert("Error reading the component pack file.");
            importPackInput.value = '';
        };
        reader.readAsText(file);
    }

    function getImportedComponents() {
        return JSON.parse(localStorage.getItem('pinpoint-imported-components') || '{}');
    }

    function saveImportedPack(packData) {
        const importedComponents = getImportedComponents();
        Object.assign(importedComponents, packData); // Add new components to the existing ones
        localStorage.setItem('pinpoint-imported-components', JSON.stringify(importedComponents));
    }

    function loadImportedComponents() {
        const importedComponents = getImportedComponents();
        Object.assign(componentData, importedComponents);
    }

    function showUpgradeModal() {
        upgradeModal.classList.remove('hidden');
    }

    function showConfirmationModal(title, message, onConfirm) {
        confirmationModalTitle.textContent = title;
        confirmationModalMessage.textContent = message;
        onConfirmCallback = onConfirm;
        confirmationModal.classList.remove('hidden');
    }

    function updateComponentCounter() {
        const componentCounter = document.querySelector('.component-counter');
        if (componentCounter) {
            const count = Object.keys(componentData).length;
            componentCounter.innerHTML = `<i class="fas fa-boxes"></i> ${count} components available`;
        }
    }

    function toggleCategory(e) {
        const header = e.currentTarget;
        header.classList.toggle('collapsed');

        // Instead of manually toggling items, just re-run the filter logic.
        // This ensures that visibility is correctly determined by both the
        // search term and the collapsed state of all categories.
        handleComponentSearch({ target: componentSearch });
    }

    function renderAndAttachComponentListeners() {
        addComponentsList.innerHTML = ''; // Clear existing list
        const categories = getComponentsByCategory();

        // Helper to create a single component DOM element
        const createComponentElement = (id, data) => {
            const componentEl = document.createElement('div');
            componentEl.className = 'component-item';
            componentEl.dataset.component = id;
            componentEl.draggable = true;
            componentEl.title = data.tip || `Drag to add ${data.name} to the board`;

            // If the component was just imported, add a class to highlight it
            if (newlyImportedComponentIds.includes(id)) {
                componentEl.classList.add('newly-imported');
            }

            const iconEl = document.createElement('i');
            iconEl.className = `${data.icon} component-icon`;

            const nameWrapper = document.createElement('div');
            nameWrapper.appendChild(iconEl);
            nameWrapper.appendChild(document.createTextNode(` ${data.name}`));
            componentEl.appendChild(nameWrapper);

            if (id.startsWith('custom-')) {
                const actionsWrapper = document.createElement('div');
                actionsWrapper.className = 'component-actions';

                const editBtn = document.createElement('button');
                editBtn.className = 'edit-component-btn';
                editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
                editBtn.title = 'Edit custom component';
                actionsWrapper.appendChild(editBtn);

                const duplicateBtn = document.createElement('button');
                duplicateBtn.className = 'duplicate-component-btn';
                duplicateBtn.innerHTML = '<i class="fas fa-copy"></i>';
                duplicateBtn.title = 'Duplicate custom component';
                actionsWrapper.appendChild(duplicateBtn);

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-component-btn';
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.title = 'Delete custom component';
                actionsWrapper.appendChild(deleteBtn);
                componentEl.appendChild(actionsWrapper);
            }
            return componentEl;
        };

        // Render components based on the defined categories
        for (const [categoryName, componentIds] of Object.entries(categories)) {
            const categoryFragment = document.createDocumentFragment();
            componentIds.forEach(id => {
                if (componentData[id]) {
                    const componentEl = createComponentElement(id, componentData[id]);
                    categoryFragment.appendChild(componentEl);
                }
            });

            if (categoryFragment.children.length > 0) {
                const categoryHeader = document.createElement('h4');
                categoryHeader.className = 'component-category-title';
                categoryHeader.innerHTML = `<span>${categoryName}</span><i class="fas fa-chevron-down category-toggle-icon"></i>`;
                categoryHeader.addEventListener('click', toggleCategory);
                addComponentsList.appendChild(categoryHeader);
                addComponentsList.appendChild(categoryFragment);
            }
        }

        // Re-query the components and attach listeners
        components = addComponentsList.querySelectorAll('.component-item[draggable="true"]');
        components.forEach(component => {
            component.addEventListener('dragstart', (e) => {
                const componentId = component.dataset.component;
                const data = componentData[componentId];
                if (!data) return e.preventDefault();
                draggedComponent = { id: componentId, name: data.name, icon: component.querySelector('i').outerHTML, requires: data.requires };
                e.dataTransfer.setData('text/plain', draggedComponent.name);
                e.dataTransfer.effectAllowed = 'move';
                component.classList.add('dragging');
            });

            component.addEventListener('dragend', () => {
                component.classList.remove('dragging');
                draggedComponent = null;
            });
        });
    }

    function handleComponentSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const allCategories = addComponentsList.querySelectorAll('.component-category-title');

        allCategories.forEach(categoryTitle => {
            const isCollapsed = categoryTitle.classList.contains('collapsed');
            let hasVisibleComponent = false;
            let nextEl = categoryTitle.nextElementSibling;

            while (nextEl && !nextEl.classList.contains('component-category-title')) {
                const componentItem = nextEl;
                const componentName = componentItem.textContent.trim().toLowerCase();
                const matchesSearch = componentName.includes(searchTerm);

                if (matchesSearch) {
                    hasVisibleComponent = true;
                }

                // Determine visibility based on both search and collapsed state
                const shouldBeHidden = isCollapsed || !matchesSearch;
                componentItem.classList.toggle('hidden', shouldBeHidden);
                
                nextEl = nextEl.nextElementSibling;
            }

            // Hide category title if it has no matching children
            categoryTitle.classList.toggle('hidden', !hasVisibleComponent);
        });
    }

    function renderBoard(boardId) {
        const board = boardData[boardId];
        if (!board) {
            console.error(`Board data for '${boardId}' not found.`);
            return;
        }

        // --- Dynamically set board and pin container styles ---
        boardEl.style.maxWidth = board.width ? `${board.width}px` : 'none';
        boardEl.style.aspectRatio = board.width && board.height ? `${board.width} / ${board.height}` : 'auto';

        // Update board image
        if (board.image) {
            boardImageEl.classList.remove('loaded'); // Prepare for fade-in
            // Set the src ONCE with a cache-busting parameter. This triggers the 'onload' handler.
            boardImageEl.src = board.image + '?v=' + new Date().getTime();
            boardImageEl.classList.remove('hidden');

            // If image is already cached by the browser, onload might not fire, so check 'complete' property
            if (boardImageEl.complete) {
                boardImageEl.classList.add('loaded');
            }
        } else {
            boardImageEl.src = '';
            boardImageEl.classList.add('hidden');
        }

        // Apply pin layout styles if they exist
        pinsContainer.style.top = board.pinLayout?.top || 'auto';
        pinsContainer.style.right = board.pinLayout?.right || 'auto';
        pinsContainer.style.left = board.pinLayout?.left || 'auto';
        pinsContainer.style.gap = board.pinLayout?.gap || '8px';

        // Update board layout class
        boardEl.className = 'board'; // Reset classes first
        boardEl.classList.add(`board-id-${boardId}`); // Add board-specific class
        if (board.layout) { // Then add layout class
            boardEl.classList.add(`board-layout-${board.layout}`);
        }

        // Update titles
        plannerTitle.textContent = board.title;
        boardName.textContent = board.name;

        // Clear and render pins
        pinsContainer.innerHTML = '';
        board.pins.forEach(pinInfo => {
            const pinEl = document.createElement('div');
            pinEl.classList.add('pin', pinInfo.type);
            pinEl.textContent = pinInfo.name;
            pinEl.title = pinInfo.title;
            pinEl.dataset.originalTitle = pinInfo.title;

            attachPinListeners(pinEl); // Attach listeners to the new pin
            pinsContainer.appendChild(pinEl);
        });

        // Update the live collection of pins
        pins = document.querySelectorAll('.pin');
    }

    function validateBoardPowerSource() {
        const selectedBoardId = document.querySelector('.board-option.active')?.dataset.board;
        if (!selectedBoardId) return;

        const boardInfo = boardData[selectedBoardId];
        const selectedVoltage = parseInt(powerSourceSelect.value, 10);

        // Clear any previous power-related errors before re-validating
        clearValidation();

        if (!boardInfo || !boardInfo.powerInput) {
            console.warn(`Board ${selectedBoardId} has no power input specifications.`);
            return;
        }

        const { min, max, nominal, type, warning } = boardInfo.powerInput;
        let errors = [];

        if (selectedVoltage < min) {
            errors.push(`Power Warning: ${selectedVoltage}V is below the recommended minimum of ${min}V for the ${boardInfo.name}. The board may be unstable or fail to boot.`);
        } else if (selectedVoltage > max) {
            // This is a critical, destructive error.
            errors.push(`DANGER: ${selectedVoltage}V will permanently damage the ${boardInfo.name}, which has a maximum input voltage of ${max}V.`);
        } else if (warning && selectedVoltage > nominal) {
            errors.push(`Power Warning: Using ${selectedVoltage}V may cause the onboard voltage regulator on the ${boardInfo.name} to overheat. ${warning}`);
        }

        if (errors.length > 0) {
            showValidationErrors(errors, "Power Source Alert");
        }
    }

    /**
     * Collects all validation errors for a potential component assignment.
     * Instead of returning on the first error, it gathers all of them.
     * @param {object} componentInfo - The component being assigned.
     * @param {HTMLElement} pinEl - The target pin element.
     * @returns {string[]} An array of error messages. An empty array means the assignment is valid.
     */
    function getAssignmentValidationErrors(componentInfo, pinEl) {
        const errors = [];

        // --- Pre-checks for fundamental assignment issues ---
        if (pinEl.classList.contains('assigned')) {
            errors.push(`Pin ${pinEl.textContent.trim()} is already assigned.`);
            return errors; // This is a hard stop, no need to check further.
        }
        if (pinEl.classList.contains('power') || pinEl.classList.contains('ground')) {
            errors.push(`Cannot assign a component to a Power or Ground pin.`);
            return errors; // Also a hard stop.
        }

        // --- Compatibility and Resource Checks ---
        // Compatibility Check (with corrected logic)
        const pinTypes = ['gpio', 'i2c', 'spi', 'uart'];
        const pinType = Array.from(pinEl.classList).find(cls => pinTypes.includes(cls));
        const dataPinReqs = componentInfo.requires.data;
        const pinCompatibility = {
            gpio: ['gpio'],
            i2c: ['gpio', 'i2c'],
            spi: ['gpio', 'spi'],
            uart: ['gpio', 'uart']
        };
        const fulfilledReqsByPin = pinType ? pinCompatibility[pinType] : [];
        const isCompatible = dataPinReqs.some(req => fulfilledReqsByPin.includes(req));

        if (!pinType || !isCompatible) {
            errors.push(`Compatibility Error: ${componentInfo.name} requires a ${dataPinReqs.join(' or ')} data pin, but this is a ${pinType || 'special'} pin.`);
        }

        // Resource Availability Check (Power & Ground)
        const requiredPower = componentInfo.requires.power || 0;
        const requiredGround = componentInfo.requires.ground || 0;
        let availablePower = 0;
        let availableGround = 0;
        document.querySelectorAll('.pin').forEach(p => {
            if (!p.classList.contains('assigned')) {
                if (p.classList.contains('power')) availablePower++;
                if (p.classList.contains('ground')) availableGround++;
            }
        });

        if (availablePower < requiredPower) {
            errors.push(`Resource Error: ${componentInfo.name} requires ${requiredPower} power pin(s), but only ${availablePower} are available.`);
        }
        if (availableGround < requiredGround) {
            errors.push(`Resource Error: ${componentInfo.name} requires ${requiredGround} ground pin(s), but only ${availableGround} are available.`);
        }

        return errors;
    }

    /**
     * Validates if a component can be assigned to a specific pin.
     * @param {object} componentInfo - The component being assigned.
     * @param {HTMLElement} pinEl - The target pin element.
     * @returns {boolean} - True if the assignment is valid, false otherwise.
     */
    function isAssignmentValid(componentInfo, pinEl) {
        // Check if the pin is already assigned
        if (pinEl.classList.contains('assigned')) {
            showValidationError(`Pin ${pinEl.textContent.trim()} is already assigned.`);
            return false;
        }

        // Check if the pin is a power or ground pin
        if (pinEl.classList.contains('power') || pinEl.classList.contains('ground')) {
            showValidationError(`Cannot assign a component to a Power or Ground pin.`);
            return false;
        }

        // Compatibility Check
        const pinTypes = ['gpio', 'i2c', 'spi', 'uart'];
        const pinType = Array.from(pinEl.classList).find(cls => pinTypes.includes(cls));
        const dataPinReqs = componentInfo.requires.data;

        // This logic correctly models that special function pins (i2c, spi) can also act as generic GPIOs,
        // while components that need a special bus can only go on corresponding pins.
        const pinCompatibility = {
            gpio: ['gpio'],
            i2c: ['gpio', 'i2c'],
            spi: ['gpio', 'spi'],
            uart: ['gpio', 'uart']
        };

        const fulfilledReqsByPin = pinType ? pinCompatibility[pinType] : [];
        const isCompatible = dataPinReqs.some(req => fulfilledReqsByPin.includes(req));

        if (!pinType || !isCompatible) {
            showValidationError(`Compatibility Error: ${componentInfo.name} requires a ${dataPinReqs.join(' or ')} data pin, but this is a ${pinType || 'special'} pin.`);
            return false;
        }

        // Resource Availability Check (Power & Ground)
        const requiredPower = componentInfo.requires.power || 0;
        const requiredGround = componentInfo.requires.ground || 0;

        let availablePower = 0;
        let availableGround = 0;

        document.querySelectorAll('.pin').forEach(p => {
            if (!p.classList.contains('assigned')) {
                if (p.classList.contains('power')) availablePower++;
                if (p.classList.contains('ground')) availableGround++;
            }
        });

        if (availablePower < requiredPower) {
            showValidationError(`Resource Error: ${componentInfo.name} requires ${requiredPower} power pin(s), but only ${availablePower} are available.`);
            return false;
        }
        if (availableGround < requiredGround) {
            showValidationError(`Resource Error: ${componentInfo.name} requires ${requiredGround} ground pin(s), but only ${availableGround} are available.`);
            return false;
        }

        // If all checks pass, the assignment is valid
        return true;
    }

    function attachPinListeners(pin) {
        pin.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            if (!pin.classList.contains('assigned') && !pin.classList.contains('power') && !pin.classList.contains('ground')) {
                pin.classList.add('drag-over');
            }
        });

        pin.addEventListener('dragleave', () => pin.classList.remove('drag-over'));

        pin.addEventListener('drop', (e) => {
            e.preventDefault();
            pin.classList.remove('drag-over');

            clearValidation(); // Clear previous errors

            if (!draggedComponent) return;

            const validationErrors = getAssignmentValidationErrors(draggedComponent, pin);
            if (validationErrors.length > 0) {
                showValidationErrors(validationErrors);
            } else {
                assignComponentToPin(draggedComponent, pin);
            }
        });

        pin.addEventListener('click', () => updatePinDetails(pin));
    }

    function unassignComponentFromPin(pin) {
        const dataPinNumber = pin.textContent.trim();
        const badge = projectComponentsList.querySelector(`[data-pin-number="${dataPinNumber}"]`);

        // Find and unassign auxiliary power/ground pins from the badge's stored data
        if (badge && badge.dataset.auxPins) {
            const auxPinNames = JSON.parse(badge.dataset.auxPins);
            auxPinNames.forEach(pinName => {
                const auxPin = Array.from(pins).find(p => p.textContent.trim() === pinName);
                if (auxPin) {
                    auxPin.classList.remove('assigned', 'conflict');
                    auxPin.title = auxPin.dataset.originalTitle;
                    delete auxPin.dataset.assignedComponent;
                    delete auxPin.dataset.assignedFor;
                }
            });
        }

        // Unassign the main data pin itself
        pin.classList.remove('assigned', 'conflict');
        pin.title = pin.dataset.originalTitle;
        delete pin.dataset.assignedComponent;
    }

    function assignComponentToPin(componentInfo, pinEl) {
        clearValidation();
        const dataPinNumber = pinEl.textContent.trim();
        const allocatedAuxPins = [];

        // Allocate and assign required power and ground pins
        const requiredPower = componentInfo.requires.power || 0;
        const requiredGround = componentInfo.requires.ground || 0;
        const availablePower = [...document.querySelectorAll('.pin.power:not(.assigned)')];
        const availableGround = [...document.querySelectorAll('.pin.ground:not(.assigned)')];

        for (let i = 0; i < requiredPower; i++) {
            const powerPin = availablePower[i];
            powerPin.classList.add('assigned');
            powerPin.dataset.assignedComponent = componentInfo.name;
            powerPin.dataset.assignedFor = dataPinNumber; // Link to the data pin
            powerPin.title = `${powerPin.dataset.originalTitle} - Assigned for ${componentInfo.name} on pin ${dataPinNumber}`;
            allocatedAuxPins.push(powerPin.textContent.trim());
        }
        for (let i = 0; i < requiredGround; i++) {
            const groundPin = availableGround[i];
            groundPin.classList.add('assigned');
            groundPin.dataset.assignedComponent = componentInfo.name;
            groundPin.dataset.assignedFor = dataPinNumber; // Link to the data pin
            groundPin.title = `${groundPin.dataset.originalTitle} - Assigned for ${componentInfo.name} on pin ${dataPinNumber}`;
            allocatedAuxPins.push(groundPin.textContent.trim());
        }

        // Assign the main data pin
        pinEl.classList.add('assigned');
        pinEl.dataset.assignedComponent = componentInfo.name;
        pinEl.title = `${pinEl.dataset.originalTitle} - Assigned to ${componentInfo.name}`;

        const newBadge = document.createElement('div');
        newBadge.classList.add('component-badge');
        newBadge.dataset.pinNumber = dataPinNumber;
        newBadge.dataset.componentId = componentInfo.id;
        newBadge.dataset.auxPins = JSON.stringify(allocatedAuxPins); // Store the specific aux pins used
        newBadge.innerHTML = `${componentInfo.icon} ${componentInfo.name} (Pin ${dataPinNumber})`;
        projectComponentsList.appendChild(newBadge);

        updatePinDetails(pinEl);
    }


    function showValidationErrors(messages, title = "Validation Errors") {
        validationFeedback.innerHTML = `
            <div class="feedback-header feedback-error">
                <i class="fas fa-exclamation-circle"></i> ${title}
            </div>
        `;
        
        const list = document.createElement('ul');
        list.style.paddingLeft = '20px';
        list.style.marginTop = '10px';
        messages.forEach(msg => {
            const item = document.createElement('li');
            item.textContent = msg;
            list.appendChild(item);
        });
        validationFeedback.appendChild(list);

        validationFeedback.classList.remove('hidden');
    }

    function clearValidation() {
        validationFeedback.innerHTML = ''; // Clear content
        validationFeedback.classList.add('hidden');
    }

    function getPinTypeName(type) {
        const typeNames = {
            'power': 'Power',
            'ground': 'Ground',
            'gpio': 'General Purpose I/O',
            'i2c': 'I²C Communication',
            'spi': 'SPI Communication',
            'uart': 'UART Serial'
        };
        return typeNames[type] || type.toUpperCase();
    }

    function updatePinDetails(pin) {
        const pinName = pin.textContent.trim();
        const pinType = Array.from(pin.classList).find(cls => !['pin', 'assigned', 'conflict', 'drag-over'].includes(cls)) || 'N/A';
        const assignedComponentName = pin.dataset.assignedComponent || 'None';
        const assignedFor = pin.dataset.assignedFor;
        const originalTitle = pin.dataset.originalTitle || 'No details available.';
    
        if (pin.classList.contains('placeholder')) {
            pinDetailsPanel.classList.add('hidden');
            return;
        }
    
        let assignmentHTML = '';
        if (assignedComponentName !== 'None') {
            if (assignedFor) {
                assignmentHTML = `<p><strong>Assignment:</strong> Auxiliary pin for ${assignedComponentName} on Pin ${assignedFor}</p>`;
            } else {
                const badge = projectComponentsList.querySelector(`[data-pin-number="${pinName}"]`);
                let auxPinsHTML = '';
                if (badge && badge.dataset.auxPins) {
                    const auxPins = JSON.parse(badge.dataset.auxPins);
                    if (auxPins.length > 0) {
                        auxPinsHTML = `<p><strong>Auxiliary Pins Used:</strong> ${auxPins.join(', ')}</p>`;
                    }
                }
                assignmentHTML = `<p><strong>Assignment:</strong> ${assignedComponentName}</p>${auxPinsHTML}`;
            }
        }
    
        pinDetailsPanel.innerHTML = `
            <h3>Pin: ${pinName}</h3>
            <p>${originalTitle}</p>
            <p><strong>Type:</strong> ${getPinTypeName(pinType)}</p>
            ${assignmentHTML}
        `;
        pinDetailsPanel.classList.remove('hidden');
    }

    function handleDocTabSwitch(e) {
        const clickedTab = e.target.closest('.doc-tab-btn');
        if (!clickedTab || clickedTab.classList.contains('active')) {
            return;
        }

        // Deactivate all tabs and hide all content
        const allTabs = docTabsContainer.querySelectorAll('.doc-tab-btn');
        const allContent = documentationModal.querySelectorAll('.doc-tab-content');

        allTabs.forEach(tab => tab.classList.remove('active'));
        allContent.forEach(content => content.classList.add('hidden'));

        // Activate the clicked tab and show its content
        clickedTab.classList.add('active');
        const tabContentId = clickedTab.dataset.tab;
        const contentToShow = document.getElementById(tabContentId);
        if (contentToShow) {
            contentToShow.classList.remove('hidden');
        }

        // If switching to components tab for the first time, render its content
        if (tabContentId === 'components-doc-tab' && componentsDocTab.children.length === 0) {
            renderComponentDocumentation();
        }
    }

    function renderComponentDocumentation() {
        let html = '<h2>Component Reference</h2><p>A quick reference for all available components in the planner.</p>';
        const categories = getComponentsByCategory();
        const renderedIds = new Set();

        const generateComponentHTML = (id) => {
            const component = componentData[id];
            if (!component) return '';
            renderedIds.add(id);

            let depHtml = '';
            if (component.dependencies && component.dependencies.length > 0) {
                depHtml += '<h5>Dependencies:</h5><ul>';
                component.dependencies.forEach(dep => {
                    depHtml += `<li><strong>${dep.description}</strong> (${dep.value || dep.type}): ${dep.reason}</li>`;
                });
                depHtml += '</ul>';
            }

            let notesHtml = component.notes ? `<p><strong>Note:</strong> ${component.notes}</p>` : '';

            return `
                <div class="component-doc-item">
                    <h4><i class="${component.icon}"></i> ${component.name}</h4>
                    <p>${component.tip || ''}</p>
                    <div class="component-doc-details">
                        <div><strong>Voltage:</strong> ${component.voltage || 'N/A'}</div>
                        <div><strong>Data Pins:</strong> ${component.requires.data.join(', ').toUpperCase()}</div>
                    </div>
                    ${notesHtml}
                    ${depHtml}
                </div>
            `;
        };

        for (const [categoryName, componentIds] of Object.entries(categories)) {
            const categoryHtml = componentIds.map(id => componentData[id] ? generateComponentHTML(id) : '').join('');
            if (categoryHtml) {
                html += `<div class="component-doc-category"><h3>${categoryName}</h3>${categoryHtml}</div>`;
            }
        }

        // Render uncategorized components
        const otherHtml = Object.keys(componentData).filter(id => !renderedIds.has(id)).map(generateComponentHTML).join('');
        if (otherHtml) {
            html += `<div class="component-doc-category"><h3>Other</h3>${otherHtml}</div>`;
        }
        componentsDocTab.innerHTML = html;
    }

    function openPromptGeneratorModal() {
        const activeBoardId = document.querySelector('.board-option.active')?.dataset.board;
        if (!activeBoardId || !promptGeneratorData[activeBoardId]) {
            alert("The AI Prompt Generator is not available for the currently selected board.");
            return;
        }

        const boardPromptData = promptGeneratorData[activeBoardId];

        // Update modal title
        promptGenModalTitle.innerHTML = `<i class="${boardPromptData.icon}" style="color: ${boardPromptData.color};"></i> ${boardPromptData.name} AI Prompt Generator`;

        // Update intro text
        promptGenModalIntro.textContent = `Choose what you want to include in your AI prompt about the ${boardPromptData.name}:`;

        // Reset selections and output
        document.querySelectorAll('.prompt-gen-option-card').forEach(card => card.classList.remove('selected'));
        document.getElementById('prompt-gen-custom-input').value = '';
        const outputBox = document.getElementById('prompt-gen-generated-prompt');
        outputBox.textContent = 'Your generated prompt will appear here after selecting options and clicking Generate.';
        outputBox.style.color = 'var(--gray)';

        promptGeneratorModal.classList.remove('hidden');
    }

    function openDocumentationModal() {
        const activeBoardOption = document.querySelector('.board-option.active');
        if (!activeBoardOption) {
            alert("Please select a board first.");
            return;
        }
        const boardId = activeBoardOption.dataset.board;
        const docData = boardDocumentation[boardId];
    
        if (docData) {
            docsModalTitle.textContent = docData.title;
            boardsDocTab.innerHTML = docData.content;

            // Reset to the board tab every time the modal is opened
            handleDocTabSwitch({ target: docTabsContainer.querySelector('[data-tab="boards-doc-tab"]') });

            documentationModal.classList.remove('hidden');
        } else {
            alert(`Sorry, no documentation is available for the selected board (${boardId}) yet.`);
        }
    }

    function copyDocsToClipboard() {
        const activeTabContent = documentationModal.querySelector('.doc-tab-content:not(.hidden)');
        if (!activeTabContent || !activeTabContent.children.length) {
            alert("There is no documentation content to copy.");
            return;
        }

        let text = "";
        const title = docsModalTitle.textContent;

        if (activeTabContent.id === 'boards-doc-tab') {
            text += `${title}\n`;
            text += "========================================\n\n";

            const nodes = activeTabContent.childNodes;
            nodes.forEach(node => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;

                switch (node.tagName) {
                    case 'H4':
                        text += `\n${node.textContent.toUpperCase()}\n--------------------\n`;
                        break;
                    case 'P':
                        const pClone = node.cloneNode(true);
                        const link = pClone.querySelector('a');
                        if (link) {
                            link.textContent = `${link.textContent} (${link.href})`;
                        }
                        text += `${pClone.textContent}\n\n`;
                        break;
                    case 'UL':
                        const items = node.querySelectorAll('li');
                        items.forEach(item => {
                            text += `  - ${item.textContent.trim()}\n`;
                        });
                        text += '\n';
                        break;
                }
            });
        } else if (activeTabContent.id === 'components-doc-tab') {
            text += "Component Reference\n";
            text += "=====================\n\n";

            const categories = activeTabContent.querySelectorAll('.component-doc-category');
            categories.forEach(category => {
                const categoryTitle = category.querySelector('h3').textContent;
                text += `\n--- ${categoryTitle.toUpperCase()} ---\n\n`;

                const components = category.querySelectorAll('.component-doc-item');
                components.forEach(component => {
                    const name = component.querySelector('h4').textContent.trim();
                    text += `## ${name}\n`;

                    // Get all relevant text content, preserving some structure
                    const contentNodes = component.childNodes;
                    contentNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'H4') {
                            const cleanText = node.textContent.replace(/\s+/g, ' ').trim();
                            if (cleanText) {
                                text += `- ${cleanText}\n`;
                            }
                        }
                    });
                    text += '\n';
                });
            });
        }

        navigator.clipboard.writeText(text.trim()).then(() => {
            copyDocsBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyDocsBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy documentation: ', err);
            alert('Failed to copy documentation to clipboard.');
        });
    }

    function copyGeneratedCode() {
        const code = document.getElementById('code-block').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = copyCodeBtn.innerHTML;
            copyCodeBtn.disabled = true;
            copyCodeBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalText;
                copyCodeBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            alert('Failed to copy code to clipboard.');
        });
    }

    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('theme', 'light');
        }
    }

    function getMarkdownContent() {
        const assignedBadges = projectComponentsList.querySelectorAll('.component-badge');
        if (assignedBadges.length === 0) {
            showValidationError("Cannot generate content for an empty board. Please assign some components first.");
            return null;
        }

        let markdown = `# PinPoint Planner Export: ${boardName.textContent}\n\n`;
        markdown += `## Component Pinout\n\n`;
        markdown += `| Component | Assigned Pin | Pin Type |\n`;
        markdown += `| :--- | :--- | :--- |\n`;
    
        assignedBadges.forEach(badge => {
            const componentId = badge.dataset.componentId;
            const pinNumber = badge.dataset.pinNumber;
            const componentName = componentData[componentId]?.name || 'Unknown Component';
    
            const pinEl = Array.from(pins).find(p => p.textContent.trim() === pinNumber);
            const pinType = Array.from(pinEl.classList).find(cls => ['gpio', 'i2c', 'spi', 'uart'].includes(cls)) || 'N/A';
    
            markdown += `| ${componentName} | ${pinNumber} | ${pinType.toUpperCase()} |\n`;
        });
    
        markdown += `\n---\n*Generated by PinPoint Planner*`;
        return markdown;
    }

    function generateMarkdownExport() {
        const markdown = getMarkdownContent();
        if (!markdown) return; // Error is shown by getMarkdownContent
    
        const filename = `${boardName.textContent.toLowerCase().replace(/\s+/g, '-')}-plan.md`;
        downloadFile(markdown, filename, 'text/markdown');
    }

    function copyMarkdownToClipboard() {
        const markdown = getMarkdownContent();
        if (!markdown) return; // Error is shown by getMarkdownContent

        navigator.clipboard.writeText(markdown).then(() => {
            const originalHTML = copyMdBtn.innerHTML;
            copyMdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyMdBtn.disabled = true;
            setTimeout(() => {
                copyMdBtn.innerHTML = originalHTML;
                copyMdBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy Markdown: ', err);
            alert('Failed to copy Markdown to clipboard.');
        });
    }

    function generateJsonExport() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot export an empty board. Please assign some components first.");
            return;
        }

        const filename = `${projectData.boardName.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
        downloadFile(JSON.stringify(projectData, null, 2), filename, 'application/json');
    }

    function generateBOM() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot generate a Bill of Materials for an empty board.");
            return;
        }

        const resolver = new DependencyResolver(componentData);
        const bom = resolver.generateEnhancedBOM(projectData.assignments, projectData.boardId);

        const bomContent = document.getElementById('bom-modal-content');
        let html = '';

        // Main Components
        if (bom.mainComponents.length > 0) {
            html += '<h4>Main Components</h4>';
            html += '<table class="bom-table"><thead><tr><th>Quantity</th><th>Component</th><th>Voltage</th></tr></thead><tbody>';
            bom.mainComponents.forEach(item => {
                html += `<tr><td>${item.quantity}</td><td>${item.name}</td><td>${item.voltage || 'N/A'}</td></tr>`;
            });
            html += '</tbody></table>';
        }

        // Dependencies
        const dependenciesCount = bom.dependencies.resistors.size + bom.dependencies.capacitors.size + bom.dependencies.powerSupplies.length + bom.dependencies.breakoutBoards.length + bom.dependencies.other.length;
        if (dependenciesCount > 0) {
            html += '<h4>Required Dependencies</h4>';
            html += '<table class="bom-table"><thead><tr><th>Quantity</th><th>Item</th><th>Purpose / Value</th></tr></thead><tbody>';

            bom.dependencies.resistors.forEach((quantity, key) => {
                html += `<tr><td>${quantity}</td><td>Resistor</td><td>${key}</td></tr>`;
            });

            bom.dependencies.capacitors.forEach((quantity, key) => {
                html += `<tr><td>${quantity}</td><td>Capacitor</td><td>${key}</td></tr>`;
            });

            bom.dependencies.powerSupplies.forEach(item => {
                html += `<tr><td>${item.quantity}</td><td>Power Supply</td><td>${item.specification} (${item.purpose})</td></tr>`;
            });

            bom.dependencies.breakoutBoards.forEach(item => {
                html += `<tr><td>${item.quantity}</td><td>${item.name}</td><td>${item.purpose}</td></tr>`;
            });

            bom.dependencies.other.forEach(item => {
                html += `<tr><td>${item.quantity}</td><td>${item.name}</td><td>${item.type}</td></tr>`;
            });

            html += '</tbody></table>';
        }

        // Notes
        if (bom.notes.length > 0) {
            html += '<h4>Notes & Alternatives</h4>';
            html += '<ul class="wiring-list">'; // Re-using wiring-list style for simplicity
            bom.notes.forEach(note => {
                html += `<li><i class="fas fa-info-circle" style="color: var(--primary);"></i> ${note}</li>`;
            });
            html += '</ul>';
        }

        // Warnings
        if (bom.warnings.length > 0) {
            html += '<h4>Warnings</h4>';
            html += '<ul class="wiring-list">';
            bom.warnings.forEach(warning => {
                html += `<li><i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> ${warning}</li>`;
            });
            html += '</ul>';
        }

        bomContent.innerHTML = html || '<p class="no-items-message">No components or dependencies to list.</p>';
        bomModal.classList.remove('hidden');
    }

    function generateBomCSV() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot export an empty BOM.");
            return;
        }

        const resolver = new DependencyResolver(componentData);
        const bom = resolver.generateEnhancedBOM(projectData.assignments, projectData.boardId);

        const headers = ['Category', 'Quantity', 'Item', 'Details'];
        const rows = [headers.join(',')];

        const escapeCsvField = (field) => {
            if (field === null || field === undefined) return '';
            let str = String(field);
            str = str.replace(/"/g, '""'); // Escape double quotes
            if (str.search(/("|,|\n)/g) >= 0) {
                str = `"${str}"`; // Enclose in double quotes if it contains special characters
            }
            return str;
        };

        // Main Components
        bom.mainComponents.forEach(item => {
            rows.push(['Main Component', item.quantity, item.name, `Voltage: ${item.voltage}`].map(escapeCsvField).join(','));
        });

        // Dependencies
        bom.dependencies.resistors.forEach((quantity, key) => {
            rows.push(['Dependency', quantity, 'Resistor', key].map(escapeCsvField).join(','));
        });
        bom.dependencies.capacitors.forEach((quantity, key) => {
            rows.push(['Dependency', quantity, 'Capacitor', key].map(escapeCsvField).join(','));
        });
        bom.dependencies.powerSupplies.forEach(item => {
            rows.push(['Dependency', item.quantity, 'Power Supply', `${item.specification} (${item.purpose})`].map(escapeCsvField).join(','));
        });
        bom.dependencies.breakoutBoards.forEach(item => {
            rows.push(['Dependency', item.quantity, item.name, item.purpose].map(escapeCsvField).join(','));
        });
        bom.dependencies.other.forEach(item => {
            rows.push(['Dependency', item.quantity, item.name, item.type].map(escapeCsvField).join(','));
        });

        // Notes and Warnings
        bom.notes.forEach(note => {
            rows.push(['Note', '', '', note].map(escapeCsvField).join(','));
        });
        bom.warnings.forEach(warning => {
            rows.push(['Warning', '', '', warning].map(escapeCsvField).join(','));
        });

        const csvContent = rows.join('\n');
        const filename = `${projectData.boardName.toLowerCase().replace(/\s+/g, '-')}-bom.csv`;
        downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
    }

    function copyBomToClipboard() {
        const bomContentEl = document.getElementById('bom-modal-content');
        if (!bomContentEl.children.length || bomContentEl.querySelector('.no-items-message')) {
            alert("There is no BOM content to copy.");
            return;
        }
    
        let text = "Bill of Materials\n";
        text += "=================\n";
    
        const nodes = bomContentEl.childNodes;
        nodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return; // Skip text nodes etc.
    
            if (node.tagName === 'H4') {
                text += `\n--- ${node.textContent.toUpperCase()} ---\n`;
            } else if (node.tagName === 'TABLE') {
                const rows = node.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('th, td');
                    // A simple tab-separated format
                    const rowText = Array.from(cells).map(cell => cell.textContent.trim()).join('\t\t');
                    text += rowText + '\n';
                });
            } else if (node.tagName === 'UL') {
                const items = node.querySelectorAll('li');
                items.forEach(item => {
                    const itemClone = item.cloneNode(true);
                    const icon = itemClone.querySelector('i');
                    if (icon) icon.remove(); // Remove icon from the clone
                    text += `- ${itemClone.textContent.trim()}\n`;
                });
            }
        });
    
        navigator.clipboard.writeText(text.trim()).then(() => {
            const originalHTML = copyBomBtn.innerHTML;
            copyBomBtn.disabled = true;
            copyBomBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyBomBtn.innerHTML = originalHTML;
                copyBomBtn.disabled = false;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy BOM: ', err);
            alert('Failed to copy BOM to clipboard.');
        });
    }

    function copyWiringDiagramToClipboard() {
        const wiringContentEl = document.getElementById('wiring-diagram-content');
        if (!wiringContentEl.children.length || wiringContentEl.querySelector('.no-items-message')) {
            alert("There is no wiring diagram content to copy.");
            return;
        }
    
        let text = "Wiring Diagram\n";
        text += "==============\n\n";
    
        const nodes = wiringContentEl.childNodes;
        nodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
    
            if (node.tagName === 'H4') {
                const h4Clone = node.cloneNode(true);
                const icon = h4Clone.querySelector('i');
                if (icon) icon.remove();
                text += `--- ${h4Clone.textContent.trim()} ---\n`;
            } else if (node.tagName === 'UL') {
                const items = node.querySelectorAll('li');
                items.forEach(item => {
                    const itemClone = item.cloneNode(true);
                    const icon = itemClone.querySelector('i');
                    if (icon) icon.remove(); // Remove icon
                    
                    const codeElements = itemClone.querySelectorAll('code');
                    codeElements.forEach(code => {
                        code.outerHTML = `\`${code.innerHTML}\``;
                    });
    
                    text += `- ${itemClone.textContent.replace(/\s+/g, ' ').trim()}\n`;
                });
                text += '\n';
            }
        });
    
        navigator.clipboard.writeText(text.trim()).then(() => {
            copyWiringBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyWiringBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Text';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy wiring diagram: ', err);
            alert('Failed to copy wiring diagram to clipboard.');
        });
    }

    function generateWiringDiagram() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot generate a diagram for an empty board.");
            return;
        }

        const resolver = new DependencyResolver(componentData);
        wiringDiagramContent.innerHTML = ''; // Clear previous content

        let html = '';

        projectData.assignments.forEach(assignment => {
            const component = componentData[assignment.componentId];
            if (!component) return;

            html += `<h4>${component.icon || '<i class="fas fa-microchip"></i>'} ${component.name} on Pin ${assignment.pin}</h4>`;
            html += `<ul class="wiring-list">`;

            // Main data connection
            html += `<li>Connect <code>${component.name} (DATA)</code> to <code>${projectData.boardName} (Pin ${assignment.pin})</code>.</li>`;

            // Power and Ground connections from the stored aux pins
            const badge = projectComponentsList.querySelector(`[data-pin-number="${assignment.pin}"]`);
            if (badge && badge.dataset.auxPins) {
                const auxPins = JSON.parse(badge.dataset.auxPins);
                auxPins.forEach(pinName => {
                    const pinEl = Array.from(pins).find(p => p.textContent.trim() === pinName);
                    if (pinEl) {
                        if (pinEl.classList.contains('power')) {
                            html += `<li>Connect <code>${component.name} (VCC/VIN)</code> to <code>${projectData.boardName} (Pin ${pinName})</code>.</li>`;
                        } else if (pinEl.classList.contains('ground')) {
                            html += `<li>Connect <code>${component.name} (GND)</code> to <code>${projectData.boardName} (Pin ${pinName})</code>.</li>`;
                        }
                    }
                });
            }

            // Process and display dependencies
            const dependencies = resolver.getComponentDependencies(assignment.componentId, projectData.boardId);
            const requiredDependencies = dependencies.filter(dep => dep.requiredStatus === true);

            if (requiredDependencies.length > 0) {
                requiredDependencies.forEach(dep => {
                    let dep_html = `<li><i class="fas fa-puzzle-piece" style="color: var(--secondary);"></i> <strong>Dependency:</strong> `;
                    switch (dep.type) {
                        case 'resistor':
                            if (dep.connection === 'series_with_data') {
                                dep_html += `Place a <code>${dep.value}</code> resistor in series between <code>Pin ${assignment.pin}</code> and the component's data line.`;
                            } else if (dep.connection === 'gpio_to_power') {
                                dep_html += `Connect a <code>${dep.value}</code> pull-up resistor from <code>Pin ${assignment.pin}</code> to a <code>3.3V</code> pin.`;
                            } else if (dep.connection === 'sda_scl_to_power') {
                                dep_html += `Connect <code>${dep.value}</code> pull-up resistors to the I2C lines (SDA and SCL). <em>Note: ${dep.alternative}</em>`;
                            } else {
                                dep_html += `A <code>${dep.value}</code> resistor is required. Purpose: ${dep.description}.`;
                            }
                            break;
                        case 'level_shifter':
                            dep_html += `Use a <code>${dep.description}</code>. Connect <code>Pin ${assignment.pin}</code> to the low-voltage side, and the component's data line to the high-voltage side.`;
                            break;
                        case 'power_supply':
                            dep_html += `Use an <strong>external power supply</strong> (<code>${dep.value}</code>). Do not power this component from the board's pins.`;
                            break;
                        case 'capacitor':
                            if (dep.connection === 'across_power_supply') {
                                dep_html += `Place a <code>${dep.value}</code> capacitor across the external power supply's VCC and GND lines, close to the component.`;
                            } else {
                                dep_html += `A <code>${dep.value}</code> capacitor is required. Purpose: ${dep.description}.`;
                            }
                            break;
                        case 'driver_board':
                            dep_html += `This component requires a <code>${dep.description}</code> to function.`;
                            break;
                        default:
                            dep_html += `Requires a <code>${dep.description}</code>.`;
                    }
                    dep_html += `</li>`;
                    html += dep_html;
                });
            }

            // Add warnings
            if (component.warnings) {
                component.warnings.forEach(warning => {
                    html += `<li><i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i> <strong>Warning:</strong> ${warning}</li>`;
                });
            }

            html += `</ul>`;
        });

        wiringDiagramContent.innerHTML = html || '<p class="no-items-message">No components assigned.</p>';
        wiringModal.classList.remove('hidden');
    }

    // --- Project Management Functions ---

    function getProjects() {
        return JSON.parse(localStorage.getItem('pinpoint-projects') || '[]');
    }

    function saveProjects(projects) {
        localStorage.setItem('pinpoint-projects', JSON.stringify(projects));
    }

    function saveCurrentProject() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot save an empty project. Please assign some components first.");
            return;
        }

        const projectName = prompt("Enter a name for your project:");
        if (!projectName?.trim()) {
            return; // User cancelled or entered empty name
        }

        projectData.id = `proj-${Date.now()}`;
        projectData.name = projectName;

        const projects = getProjects();
        projects.push(projectData);
        saveProjects(projects);

        loadAndRenderProjects();
    }

    function loadAndRenderProjects() {
        const projects = getProjects();
        projectsList.innerHTML = '';

        if (projects.length === 0) {
            const noProjectsEl = document.createElement('p');
            noProjectsEl.className = 'no-items-message';
            noProjectsEl.textContent = 'No saved projects.';
            projectsList.appendChild(noProjectsEl);
            return;
        }

        projects.forEach(project => {
            const projectItemContainer = document.createElement('div');
            projectItemContainer.classList.add('component-item');
            projectItemContainer.dataset.projectId = project.id;
            projectItemContainer.title = `Load project: ${project.name}`;

            const projectItem = document.createElement('div');
            projectItem.classList.add('project-item');
            projectItem.innerHTML = `<span><i class="fas fa-project-diagram component-icon"></i>${project.name}</span>`;

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-project-btn');
            deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
            deleteBtn.title = 'Delete project';

            projectItem.appendChild(deleteBtn);
            projectItemContainer.appendChild(projectItem);
            projectsList.appendChild(projectItemContainer);
        });
    }

    function handleProjectsListClick(e) {
        const deleteBtn = e.target.closest('.delete-project-btn');
        if (deleteBtn) {
            const projectItem = deleteBtn.closest('.component-item');
            const projectId = projectItem.dataset.projectId;
            const projectName = projectItem.querySelector('.project-item span').textContent;

            showConfirmationModal(
                'Delete Project',
                `Are you sure you want to permanently delete the project "${projectName}"? This action cannot be undone.`,
                () => {
                    let projects = getProjects();
                    projects = projects.filter(p => p.id !== projectId);
                    saveProjects(projects);
                    loadAndRenderProjects();
                }
            );
            return;
        }

        const projectItem = e.target.closest('.component-item');
        if (projectItem) {
            const projectId = projectItem.dataset.projectId;
            loadProject(projectId);
        }
    }

    function loadProject(projectId) {
        const projectToLoad = getProjects().find(p => p.id === projectId);
        if (projectToLoad) {
            loadProjectData(projectToLoad);
        }
    }

    function downloadFile(content, fileName, contentType) {
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        
        // Append, click, and remove the link
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
        }, 100);
    }

    function getProjectDataObject() {
        const assignedBadges = projectComponentsList.querySelectorAll('.component-badge');
        if (assignedBadges.length === 0) {
            return null;
        }

        const activeBoardOption = document.querySelector('.board-option.active');
        const boardId = activeBoardOption ? activeBoardOption.dataset.board : 'unknown';

        const assignments = Array.from(assignedBadges).map(badge => {
            const componentId = badge.dataset.componentId;
            const pinNumber = badge.dataset.pinNumber;
            const pinEl = Array.from(pins).find(p => p.textContent.trim() === pinNumber);
            const pinType = Array.from(pinEl.classList).find(cls => ['gpio', 'i2c', 'spi', 'uart'].includes(cls)) || 'N/A';

            return {
                componentId,
                componentName: componentData[componentId]?.name || 'Unknown Component',
                pin: pinNumber,
                pinType,
            };
        });

        return {
            boardId: boardId,
            boardName: boardName.textContent,
            assignments: assignments,
        };
    }

    function handleJsonImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const projectData = JSON.parse(event.target.result);
                // Basic validation
                if (projectData.boardId && projectData.assignments && Array.isArray(projectData.assignments)) {
                    loadProjectData(projectData);
                } else {
                    showValidationError("Invalid project file format. The file must contain 'boardId' and 'assignments' properties.");
                }
            } catch (error) {
                showValidationError("Could not parse JSON file. Make sure it is a valid project export.");
                console.error("Error parsing JSON:", error);
            } finally {
                // Reset the input value to allow importing the same file again
                importJsonInput.value = '';
            }
        };
        reader.onerror = function() {
            showValidationError("Error reading the project file.");
            importJsonInput.value = '';
        };
        reader.readAsText(file);
    }

    function loadProjectData(projectToLoad) {
        if (!projectToLoad) return;

        clearValidation(); // Clear previous errors before loading

        // Use a more reliable way to clear the board without confirmation for loading
        pins.forEach(pin => {
            pin.classList.remove('assigned', 'conflict');
            if (pin.dataset.originalTitle) pin.title = pin.dataset.originalTitle;
            delete pin.dataset.assignedComponent;
            delete pin.dataset.assignedFor;
        });
        projectComponentsList.innerHTML = '';
        pinDetailsPanel.classList.add('hidden');

        const boardOption = document.querySelector(`.board-option[data-board="${projectToLoad.boardId}"]`);
        if (boardOption) boardOption.click();

        projectToLoad.assignments.forEach(assignment => {
            const pinEl = Array.from(pins).find(p => p.textContent.trim() === assignment.pin);
            const componentConfig = componentData[assignment.componentId];
            const componentItem = document.querySelector(`.component-item[data-component="${assignment.componentId}"]`);
            if (pinEl && componentConfig && componentItem) {
                const componentInfo = { id: assignment.componentId, name: componentConfig.name, icon: componentItem.querySelector('i').outerHTML, requires: componentConfig.requires };
                
                const validationErrors = getAssignmentValidationErrors(componentInfo, pinEl);
                if (validationErrors.length === 0) {
                    assignComponentToPin(componentInfo, pinEl);
                } else {
                    // Optional: Log an error to the console if an invalid assignment is found in the project file
                    console.warn(`Skipping invalid assignment from imported project: ${componentInfo.name} to pin ${pinEl.textContent.trim()}`);
                    console.warn('Reasons:', validationErrors.join(', '));
                }
            }
        });
    }

    // --- Initial Load ---
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Load custom components from localStorage and merge with base data
    loadCustomComponents();

    loadImportedComponents(); // Load components from packs

    // Update component counter to reflect the actual number of components
    updateComponentCounter();

    // Render the component list from data
    renderAndAttachComponentListeners();

    // Load saved projects from localStorage
    loadAndRenderProjects();

    // Render the default board
    renderBoard('rpi4'); // Render the default board on page load
});