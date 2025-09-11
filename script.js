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
    // --- Element Selections ---
    const boardOptions = document.querySelectorAll('.board-option');
    const projectComponentsList = document.querySelector('.components-panel .components-list');
    const validationFeedback = document.querySelector('.validation-feedback');
    const pinDetailsPanel = document.querySelector('.pin-details');
    const clearBoardBtn = document.getElementById('clear-board-btn');
    const plannerTitle = document.querySelector('.planner-title');
    const saveProjectBtn = document.getElementById('save-project-btn');
    const importJsonBtn = document.getElementById('import-json-btn');
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
    const boardName = document.querySelector('.board-name');
    const pinsContainer = document.querySelector('.pins-container');

    // --- State ---
    let draggedComponent = null;
    let components = []; // This will be populated dynamically
    let pins = []; // This will be populated dynamically

    // --- Event Listeners ---

    // Board selection
    boardOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Clear current state before rendering new board
            clearBoardBtn.click();

            boardOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            const boardId = this.dataset.board;
            renderBoard(boardId);
        });
    });

    // --- Image Loading Optimization ---
    boardImageEl.onload = function() {
        this.classList.add('loaded');
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
    addComponentBtn.addEventListener('click', () => showUpgradeModal());

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
            if (!pinDetailsPanel.classList.contains('hidden')) {
                const detailsTitle = pinDetailsPanel.querySelector('.pin-details-title');
                if (detailsTitle && detailsTitle.textContent.includes(`Pin: ${pinNumber}`)) {
                    pinDetailsPanel.classList.add('hidden');
                }
            }
        }
    });

    // --- Component Management Functions ---

    function openEditComponentModal(componentId) {
        const component = componentData[componentId];
        if (!component) return;

        // Populate form
        document.getElementById('component-name-input').value = component.name;
        document.getElementById('component-category-input').value = component.category || '';
        document.getElementById('component-icon-input').value = component.icon;
        document.getElementById('component-data-select').value = component.requires.data[0];
        document.getElementById('component-power-input').value = component.requires.power || 0;
        document.getElementById('component-ground-input').value = component.requires.ground || 0;

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
        const icon = iconInput.value;
        const dataType = document.getElementById('component-data-select').value;
        const power = parseInt(document.getElementById('component-power-input').value, 10);
        const ground = parseInt(document.getElementById('component-ground-input').value, 10);
    
        const category = categoryInput.value.trim();
        if (!name.trim() || !icon.trim()) {
            alert("Please fill out Name and Icon fields.");
            return;
        }
    
        const componentDefinition = {
            name: name,
            icon: icon,
            category: category || 'Custom', // Use 'Custom' as a fallback
            tip: 'Custom user component.', // Add a default tip
            requires: {
                data: [dataType],
                power: power,
                ground: ground
            }
        };

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

                // More detailed validation
                for (const [id, component] of Object.entries(packData)) {
                    if (!component.name || !component.icon || !component.requires) {
                        throw new Error(`Component '${id}' is missing required properties (name, icon, requires).`);
                    }
                    if (componentData[id]) {
                        console.warn(`Component pack is overwriting existing component with ID: ${id}`);
                    }
                }

                // Merge and save
                Object.assign(componentData, packData);
                saveImportedPack(packData); // Persist to localStorage

                // Update UI
                renderAndAttachComponentListeners();
                updateComponentCounter();
                alert(`Successfully imported ${Object.keys(packData).length} components!`);

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
    
        let nextEl = header.nextElementSibling;
        while (nextEl && !nextEl.classList.contains('component-category-title')) {
            // This simply toggles visibility. The search function will respect this.
            nextEl.classList.toggle('hidden');
            nextEl = nextEl.nextElementSibling;
        }
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
        const allComponents = addComponentsList.querySelectorAll('.component-item');
        const allCategories = addComponentsList.querySelectorAll('.component-category-title');

        // First, filter the individual components based on search term
        allComponents.forEach(component => {
            const componentName = component.textContent.trim().toLowerCase();
            const isVisible = componentName.includes(searchTerm);
            component.classList.toggle('hidden', !isVisible);
        });

        // Then, re-apply collapsed state and hide empty categories
        allCategories.forEach(categoryTitle => {
            const isCollapsed = categoryTitle.classList.contains('collapsed');
            let nextEl = categoryTitle.nextElementSibling;
            let hasVisibleComponentAfterSearch = false;

            while (nextEl && !nextEl.classList.contains('component-category-title')) {
                if (isCollapsed) {
                    // If category is collapsed, ensure all its items are hidden, overriding search results
                    nextEl.classList.add('hidden');
                } else {
                    // If not collapsed, check if any items are visible (left visible by the search)
                    if (nextEl.classList.contains('component-item') && !nextEl.classList.contains('hidden')) {
                        hasVisibleComponentAfterSearch = true;
                    }
                }
                nextEl = nextEl.nextElementSibling;
            }

            // Hide category title if it's not collapsed and has no visible children after search
            if (!isCollapsed) {
                categoryTitle.classList.toggle('hidden', !hasVisibleComponentAfterSearch);
            } else {
                // A collapsed category title should always be visible itself
                categoryTitle.classList.remove('hidden');
            }
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

            if (!draggedComponent) return;

            // --- Validation ---
            if (pin.classList.contains('assigned')) {
                showValidationError(`Pin ${pin.textContent.trim()} is already assigned.`);
                return;
            }
            if (pin.classList.contains('power') || pin.classList.contains('ground')) {
                showValidationError(`Cannot assign a component to a Power or Ground pin.`);
                return;
            }

            // Compatibility Check
            const pinTypes = ['gpio', 'i2c', 'spi', 'uart'];
            const pinType = Array.from(pin.classList).find(cls => pinTypes.includes(cls));
            const dataPinReqs = draggedComponent.requires.data;

            if (!pinType || !dataPinReqs.includes(pinType)) {
                showValidationError(`Compatibility Error: ${draggedComponent.name} requires a ${dataPinReqs.join(' or ')} data pin, but this is a ${pinType || 'special'} pin.`);
                return;
            }

            // Resource Availability Check (Power & Ground)
            const requiredPower = draggedComponent.requires.power || 0;
            const requiredGround = draggedComponent.requires.ground || 0;

            let availablePower = 0;
            let availableGround = 0;

            document.querySelectorAll('.pin').forEach(p => {
                if (!p.classList.contains('assigned')) {
                    if (p.classList.contains('power')) availablePower++;
                    if (p.classList.contains('ground')) availableGround++;
                }
            });

            if (availablePower < requiredPower) {
                showValidationError(`Resource Error: ${draggedComponent.name} requires ${requiredPower} power pin(s), but only ${availablePower} are available.`);
                return;
            }
            if (availableGround < requiredGround) {
                showValidationError(`Resource Error: ${draggedComponent.name} requires ${requiredGround} ground pin(s), but only ${availableGround} are available.`);
                return;
            }

            // --- Update UI on successful drop ---
            assignComponentToPin(draggedComponent, pin);
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


    function showValidationError(message) {
        validationFeedback.innerHTML = `
            <div class="feedback-header feedback-error">
                <i class="fas fa-exclamation-circle"></i> Validation Error
            </div>
            <p>${message}</p>`;
        validationFeedback.classList.remove('hidden');
    }

    function clearValidation() {
        validationFeedback.classList.add('hidden');
    }

    function updatePinDetails(pin) {
        const pinName = pin.textContent.trim();
        const pinType = pin.classList[1] || 'N/A';
        const assignedComponentName = pin.dataset.assignedComponent || 'None';
        const assignedFor = pin.dataset.assignedFor;
        let notesHTML = '';
        let auxPinsHTML = '';

        if (assignedFor) {
            // This is an auxiliary (power/ground) pin
            auxPinsHTML = `<div class="pin-info-item"><span class="pin-info-label">Assigned For:</span> <span>${assignedComponentName} (Pin ${assignedFor})</span></div>`;
        } else if (assignedComponentName !== 'None') {
            // This is a main data pin
            const badge = projectComponentsList.querySelector(`[data-pin-number="${pinName}"]`);
            if (badge && badge.dataset.auxPins) {
                const auxPins = JSON.parse(badge.dataset.auxPins);
                if (auxPins.length > 0) {
                    auxPinsHTML = `<div class="pin-info-item"><span class="pin-info-label">Auxiliary Pins:</span> <span>${auxPins.join(', ')}</span></div>`;
                }
            }

            // Check if there are notes for the assigned component
            const componentId = badge ? badge.dataset.componentId : null;
            if (componentId && componentData[componentId] && componentData[componentId].notes) {
                notesHTML = `<div class="pin-info-item"><span class="pin-info-label">Notes:</span> <span>${componentData[componentId].notes}</span></div>`;
            }
        }

        pinDetailsPanel.innerHTML = `
            <div class="pin-details-title">Selected Pin: ${pinName}</div>
            <div class="pin-info">
                <div class="pin-info-item"><span class="pin-info-label">Type:</span> <span>${pinType.toUpperCase()}</span></div>
                <div class="pin-info-item"><span class="pin-info-label">Assignment:</span> <span>${assignedComponentName}</span></div>
                ${assignedFor ? auxPinsHTML : ''}
                ${notesHTML}
                ${!assignedFor ? auxPinsHTML : ''}
            </div>`;
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

        clearBoardBtn.click(); // This will handle confirmation and clearing

        const boardOption = document.querySelector(`.board-option[data-board="${projectToLoad.boardId}"]`);
        if (boardOption) boardOption.click();

        projectToLoad.assignments.forEach(assignment => {
            const pinEl = Array.from(pins).find(p => p.textContent.trim() === assignment.pin);
            const componentConfig = componentData[assignment.componentId];
            const componentItem = document.querySelector(`.component-item[data-component="${assignment.componentId}"]`);
            if (pinEl && componentConfig && componentItem) {
                const componentInfo = { id: assignment.componentId, name: componentConfig.name, icon: componentItem.querySelector('i').outerHTML, requires: componentConfig.requires };
                assignComponentToPin(componentInfo, pinEl);
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