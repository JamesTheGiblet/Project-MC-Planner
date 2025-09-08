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
    const exportJsonBtn = document.getElementById('export-json-btn');
    const projectsList = document.getElementById('projects-list');
    const wiringDiagramBtn = document.getElementById('wiring-diagram-btn');
    const wiringModal = document.getElementById('wiring-modal');
    const addComponentBtn = document.getElementById('add-component-btn');
    const addComponentsList = document.getElementById('add-components-list');
    const addComponentModal = document.getElementById('add-component-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
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
    importJsonInput.addEventListener('change', handleJsonImport);

    // Custom Component List (Delete)
    addComponentsList.addEventListener('click', handleComponentListClick);

    // Component Search
    componentSearch.addEventListener('input', handleComponentSearch);

    // Projects List (Load and Delete)
    projectsList.addEventListener('click', handleProjectsListClick);

    // Export to Markdown
    exportMdBtn.addEventListener('click', () => {
        generateMarkdownExport();
    });

    // Export to JSON
    exportJsonBtn.addEventListener('click', () => {
        generateJsonExport();
    });

    // Wiring Diagram Button
    wiringDiagramBtn.addEventListener('click', generateWiringDiagram);

    // Modal Close Listeners
    modalCloseBtn.addEventListener('click', () => wiringModal.classList.add('hidden'));
    wiringModal.addEventListener('click', (e) => {
        // Close modal if the overlay (the background) is clicked
        if (e.target === wiringModal) {
            wiringModal.classList.add('hidden');
        }
    });

    // Add Component Button & Modal
    addComponentBtn.addEventListener('click', () => {
        addComponentModal.classList.remove('hidden');
    });

    addComponentModalCloseBtn.addEventListener('click', () => {
        addComponentModal.classList.add('hidden');
    });

    addComponentModal.addEventListener('click', (e) => {
        if (e.target === addComponentModal) {
            addComponentModal.classList.add('hidden');
        }
    });

    addComponentForm.addEventListener('submit', (e) => {
        handleAddComponent(e);
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

        // Find only the main data pins that are assigned, which are the ones
        // that have an assignedComponent but are not assigned FOR another pin.
        const assignedDataPins = document.querySelectorAll('.pin.assigned:not([data-assigned-for])');

        assignedDataPins.forEach(pin => {
            unassignComponentFromPin(pin);
        });

        projectComponentsList.innerHTML = '';
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
            clickedBadge.remove();

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

    function handleComponentListClick(e) {
        const deleteBtn = e.target.closest('.delete-component-btn');
        if (!deleteBtn) return;

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
        const nameInput = document.getElementById('component-name-input');
        const iconInput = document.getElementById('component-icon-input');
        const name = nameInput.value;
        const icon = iconInput.value;
        const dataType = document.getElementById('component-data-select').value;
        const power = parseInt(document.getElementById('component-power-input').value, 10);
        const ground = parseInt(document.getElementById('component-ground-input').value, 10);
    
        if (!name.trim() || !icon.trim()) {
            alert("Please fill out Name and Icon fields.");
            return;
        }
    
        const newComponentId = `custom-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        
        const newComponentDefinition = {
            name: name,
            icon: icon,
            requires: {
                data: [dataType],
                power: power,
                ground: ground
            }
        };
        
        componentData[newComponentId] = newComponentDefinition; // Add to in-memory object
        saveCustomComponent(newComponentId, newComponentDefinition); // Save to localStorage
    
        renderAndAttachComponentListeners();
        addComponentForm.reset();
        addComponentModal.classList.add('hidden');
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

    function renderAndAttachComponentListeners() {
        addComponentsList.innerHTML = ''; // Clear existing components
    
        for (const [id, data] of Object.entries(componentData)) {
            const componentEl = document.createElement('div');
            componentEl.className = 'component-item';
            componentEl.dataset.component = id;
            componentEl.draggable = true;
    
            const iconEl = document.createElement('i');
            iconEl.className = `${data.icon} component-icon`;
    
            const nameWrapper = document.createElement('div');
            nameWrapper.appendChild(iconEl);
            nameWrapper.appendChild(document.createTextNode(` ${data.name}`));
            componentEl.appendChild(nameWrapper);

            if (id.startsWith('custom-')) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-component-btn';
                deleteBtn.innerHTML = '<i class="fas fa-times"></i>';
                deleteBtn.title = 'Delete custom component';
                componentEl.appendChild(deleteBtn);
            }
    
            addComponentsList.appendChild(componentEl);
        }
    
        // Re-query the components and attach listeners
        components = addComponentsList.querySelectorAll('.component-item[draggable="true"]');
        components.forEach(component => {
            component.addEventListener('dragstart', (e) => {
                const componentId = component.dataset.component;
                const data = componentData[componentId];
                if (!data) {
                    console.error(`No data found for component: ${componentId}`);
                    e.preventDefault();
                    return;
                }
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
        components.forEach(component => {
            const componentName = component.textContent.trim().toLowerCase();
            // Hide if not a match, but only if it's not already disabled (assigned)
            if (componentName.includes(searchTerm) || component.classList.contains('disabled')) {
                component.classList.remove('hidden');
            } else {
                component.classList.add('hidden');
            }
        });
    }

    function renderBoard(boardId) {
        const board = boardData[boardId];
        if (!board) {
            console.error(`Board data for '${boardId}' not found.`);
            return;
        }

        // Update board image
        if (board.image) {
            boardImageEl.src = board.image;
            boardImageEl.classList.remove('hidden');
        } else {
            boardImageEl.src = '';
            boardImageEl.classList.add('hidden');
        }

        // Update board layout class
        boardEl.className = 'board'; // Reset classes
        if (board.layout) {
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
        const pinNumber = pin.textContent.trim();

        // Find and unassign auxiliary power/ground pins linked to this data pin
        const auxPins = document.querySelectorAll(`.pin[data-assigned-for="${pinNumber}"]`);
        auxPins.forEach(auxPin => {
            auxPin.classList.remove('assigned', 'conflict');
            auxPin.title = auxPin.dataset.originalTitle;
            delete auxPin.dataset.assignedComponent;
            delete auxPin.dataset.assignedFor;
        });

        // Unassign the main data pin itself
        pin.classList.remove('assigned', 'conflict');
        pin.title = pin.dataset.originalTitle;
        delete pin.dataset.assignedComponent;
    }

    function assignComponentToPin(componentInfo, pinEl) {
        clearValidation();
        const dataPinNumber = pinEl.textContent.trim();

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
            powerPin.title = `${powerPin.dataset.originalTitle} - Assigned for ${componentInfo.name}`;
        }
        for (let i = 0; i < requiredGround; i++) {
            const groundPin = availableGround[i];
            groundPin.classList.add('assigned');
            groundPin.dataset.assignedComponent = componentInfo.name;
            groundPin.dataset.assignedFor = dataPinNumber; // Link to the data pin
            groundPin.title = `${groundPin.dataset.originalTitle} - Assigned for ${componentInfo.name}`;
        }

        // Assign the main data pin
        pinEl.classList.add('assigned');
        pinEl.dataset.assignedComponent = componentInfo.name;
        pinEl.title = `${pinEl.dataset.originalTitle} - Assigned to ${componentInfo.name}`;

        const newBadge = document.createElement('div');
        newBadge.classList.add('component-badge');
        newBadge.dataset.pinNumber = dataPinNumber;
        newBadge.dataset.componentId = componentInfo.id;
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
        const assignedComponent = pin.dataset.assignedComponent || 'None';

        pinDetailsPanel.innerHTML = `
            <div class="pin-details-title">Selected Pin: ${pinName}</div>
            <div class="pin-info">
                <div class="pin-info-item"><span class="pin-info-label">Type:</span> <span>${pinType.toUpperCase()}</span></div>
                <div class="pin-info-item"><span class="pin-info-label">Voltage:</span> <span>3.3V</span></div>
                <div class="pin-info-item"><span class="pin-info-label">Assignment:</span> <span>${assignedComponent}</span></div>
            </div>`;
        pinDetailsPanel.classList.remove('hidden');
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

    function generateMarkdownExport() {
        const assignedBadges = projectComponentsList.querySelectorAll('.component-badge');
        if (assignedBadges.length === 0) {
            showValidationError("Cannot export an empty board. Please assign some components first.");
            return;
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

        const filename = `${boardName.textContent.toLowerCase().replace(/\s+/g, '-')}-plan.md`;
        downloadFile(markdown, filename, 'text/markdown');
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

    function generateWiringDiagram() {
        const projectData = getProjectDataObject();
        if (!projectData) {
            showValidationError("Cannot generate a diagram for an empty board.");
            return;
        }

        wiringDiagramContent.innerHTML = ''; // Clear previous content

        let html = `<ul class="wiring-list">`;

        let availablePower = [...document.querySelectorAll('.pin.power:not(.assigned)')];
        let availableGround = [...document.querySelectorAll('.pin.ground:not(.assigned)')];

        projectData.assignments.forEach(assignment => {
            const component = componentData[assignment.componentId];
            if (!component) return;

            // Data connection
            html += `<li>Connect <code>${assignment.componentName} (DATA)</code> to <code>${projectData.boardName} (${assignment.pin})</code></li>`;

            // Power connections
            if (component.requires.power) {
                for (let i = 0; i < component.requires.power; i++) {
                    const powerPin = availablePower.pop();
                    const targetPin = powerPin ? powerPin.textContent.trim() : '<strong>an available Power Pin</strong>';
                    html += `<li>Connect <code>${assignment.componentName} (VCC/VIN)</code> to <code>${projectData.boardName} (${targetPin})</code></li>`;
                }
            }

            // Ground connections
            if (component.requires.ground) {
                for (let i = 0; i < component.requires.ground; i++) {
                    const groundPin = availableGround.pop();
                    const targetPin = groundPin ? groundPin.textContent.trim() : '<strong>an available Ground Pin</strong>';
                    html += `<li>Connect <code>${assignment.componentName} (GND)</code> to <code>${projectData.boardName} (${targetPin})</code></li>`;
                }
            }
        });

        html += `</ul>`;
        wiringDiagramContent.innerHTML = html;
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
            projectsList.innerHTML = '<p style="color: var(--gray); font-size: 0.9rem; text-align: center;">No saved projects.</p>';
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
            const projectId = deleteBtn.closest('.component-item').dataset.projectId;
            if (confirm("Are you sure you want to delete this project?")) {
                let projects = getProjects();
                projects = projects.filter(p => p.id !== projectId);
                saveProjects(projects);
                loadAndRenderProjects();
            }
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

    // Render the component list from data
    renderAndAttachComponentListeners();

    // Load saved projects from localStorage
    loadAndRenderProjects();

    // Render the default board
    renderBoard('rpi4'); // Render the default board on page load
});