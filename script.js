document.addEventListener('DOMContentLoaded', function() {
    // --- Element Selections ---
    const boardOptions = document.querySelectorAll('.board-option');
    const components = document.querySelectorAll('.component-item[draggable="true"]');
    const projectComponentsList = document.querySelector('.components-panel .components-list');
    const validationFeedback = document.querySelector('.validation-feedback');
    const pinDetailsPanel = document.querySelector('.pin-details');
    const clearBoardBtn = document.querySelector('.planner-header .btn-primary');
    const plannerTitle = document.querySelector('.planner-title');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const boardEl = document.querySelector('.board');
    const boardImageEl = boardEl.querySelector('.board-image');
    const boardName = document.querySelector('.board-name');
    const pinsContainer = document.querySelector('.pins-container');

    // --- State ---
    let draggedComponent = null;
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

    // Drag and Drop for Components
    components.forEach(component => {
        component.addEventListener('dragstart', (e) => {
            const componentId = component.dataset.component;
            const data = componentData[componentId];
            if (!data) {
                console.error(`No data found for component: ${componentId}`);
                e.preventDefault();
                return;
            }
            draggedComponent = {
                id: componentId,
                name: data.name,
                icon: component.querySelector('i').outerHTML,
                requires: data.requires
            };
            e.dataTransfer.setData('text/plain', draggedComponent.name);
            e.dataTransfer.effectAllowed = 'move';
            component.classList.add('dragging');
        });

        component.addEventListener('dragend', () => {
            component.classList.remove('dragging');
            draggedComponent = null;
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

    // Clear Board button
    clearBoardBtn.addEventListener('click', () => {
        document.querySelectorAll('.pin').forEach(pin => {
            // Only unassign if it's actually assigned
            if (pin.dataset.assignedComponent) {
                unassignComponentFromPin(pin);
            }
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
        if (!pinNumber) return;

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

    // --- Helper Functions ---

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
            // Check if component is already on the board
            const isAlreadyAssigned = !!projectComponentsList.querySelector(`.component-badge[data-component-id="${draggedComponent.id}"]`);
            if (isAlreadyAssigned) {
                showValidationError(`${draggedComponent.name} is already assigned to a pin.`);
                return;
            }

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
            const componentReqs = draggedComponent.requires;

            if (!pinType || !componentReqs.includes(pinType)) {
                showValidationError(`Compatibility Error: ${draggedComponent.name} requires a ${componentReqs.join(' or ')} pin, but this is a ${pinType || 'special'} pin.`);
                return;
            }

            // --- Update UI on successful drop ---
            clearValidation();
            pin.classList.add('assigned');
            pin.dataset.assignedComponent = draggedComponent.name;
            pin.title = `${pin.dataset.originalTitle} - Assigned to ${draggedComponent.name}`;

            const pinNumber = pin.textContent.trim();
            const newBadge = document.createElement('div');
            newBadge.classList.add('component-badge');
            newBadge.dataset.pinNumber = pinNumber;
            newBadge.dataset.componentId = draggedComponent.id;
            newBadge.innerHTML = `${draggedComponent.icon} ${draggedComponent.name} (Pin ${pinNumber})`;
            projectComponentsList.appendChild(newBadge);

            updatePinDetails(pin);
        });

        pin.addEventListener('click', () => updatePinDetails(pin));
    }

    function unassignComponentFromPin(pin) {
        pin.classList.remove('assigned', 'conflict');
        pin.title = pin.dataset.originalTitle;
        delete pin.dataset.assignedComponent;
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

    // --- Initial Load ---
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    // Render the default board
    renderBoard('rpi4'); // Render the default board on page load
});