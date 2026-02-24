/**
 * Project: ClassifyIt
 * @description Main logic for classification module.
 * @requires DialogIt for draggable dialog support
 * @see {@link ../docs/ClassifyIt_docs.md} - ClassifyIt API, options, events
 *
 * IN:
 * const classifications = [ { id: 'cat_yes', label: 'Si' }, { id: 'cat_no', label: 'No' } ];
 * const items = [
 *     { id: 101, name: 'Item Alpha', classification: 'cat_yes' },
 *     { id: 102, name: 'Item Beta', classification: 'cat_no' },
 *     { id: 103, name: 'Item With wrong classification', classification: 'cat_maybe' },
 *     { id: 104, name: 'Item Without classification' },
 * ];
 * fallbackClassificationId
 * OUT:
 * a) Clcking save: { "cat_yes": [101, 104], "cat_no": [102, 103], }
 * b) Clicking cancel: false
 *
 */
class ClassifyIt {

    /** Sets up the internal state, merges configuration options, and identifies the default classification for unassigned items. */
    constructor(classifications, items, fallbackClassificationId, options = {}) {
        this.classifications = classifications;
        this.items = items;
        this.fallbackClassificationId = fallbackClassificationId;
        this.fallbackClassificationId = this._getDefaultClassificationId();
        this.options = {
            apiUrl: './api/classifier_mock.php',
            title: 'Classification',
            itemTableName: 'producto',
            itemNameSingular: 'producto',
            itemNamePlural: 'Items',

            itemIdKey: 'id',
            itemlabelKey: 'name',
            itemClassificationKey: 'classification',

            autoPersist: false,
            editable: true,
            showItemButtons: true,

            groupEnabled: false,
            groupEditable: false,
            groups: [],
            
            debug: false,
            ...options
        };

        this.currentValues = {};
        this.sortableInstances = [];
        this.dialogElement = null;
        this.isOpen = false;
        this.selectedGroupItems = [];

        // Derived Write-Only state for AI Context
        this.intentOnSave = this.options.autoPersist ? 'PERSIST' : 'RETURN';

        this._initializeValues();

        this.isClosingProgrammatically = false; // Flag for native dialog closeDialog handling
    }

    /** Displays the modal, initializes drag-and-drop libraries, attaches event listeners, and returns a promise that resolves upon saving */
    openDialog(dialogOptions = {}) {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;

            this._createDialog(dialogOptions);

            // Only setup sortable if editable
            if(this.options.editable) {
                this._setupSortable();
            }

            this._setupEventListeners();
            this._updateCounters();

            this.isOpen = true;

            if(this.dialogElement.tagName === 'DIALOG') {
                this.dialogElement.showModal();
                // Add a 'closeDialog' event listener to handle native dialog closeDialog (e.g., Escape key)
                this.dialogElement.addEventListener('close', () => {
                    if(!this.isClosingProgrammatically) {
                        // If the dialog was closed by native means (e.g., Escape key),
                        // we need to ensure our internal state and cleanup are handled.
                        this.closeDialog(false); // Assume cancel if closed natively without save action
                    }
                });
            } else {
                // Fallback for non-dialog elements or if migration is partial
                this.dialogElement.classList.add('openDialog');
            }
        });
    }

    /**
     * Triggers the promise resolution or rejection, destroys active library instances, and cleans up the DOM elements.
     *
     * AI NOTE: DIALOG LIFECYCLE & DATA RETURN.
     * This is the gateway for data exit. It does NOT persist changes.
     * - If 'save' is true: It triggers getValue() and resolves the instance promise with the data.
     * - If 'save' is false: It rejects the promise (User Cancelled).
     * The responsibility for DB persistence (e.g., updating classifier_assignments)
     * lies entirely with the .then() block of the caller that opened the dialog.
     */
    closeDialog(save = false) {
        this.isClosingProgrammatically = true; // Set flag

        if(save) {
            const result = this.getValue();
            this.resolve(result);
        } else {
            this.reject(new Error('User cancelled'));
        }

        this.sortableInstances.forEach(sortable => {
            sortable.destroy();
        });
        this.sortableInstances = [];

        if(this.dialogElement) {
            if(this.dialogElement.tagName === 'DIALOG' && this.dialogElement.open) {
                this.dialogElement.close(); // Native dialog closeDialog
            }
            this.dialogElement.remove(); // Remove from DOM
            this.dialogElement = null;
        }

        this.isOpen = false;
        this.isClosingProgrammatically = false; // Reset flag
    }

    search(searchTerm) {

        const items = this.dialogElement.querySelectorAll('.oc-item');
        const normalizedSearch = searchTerm.toLowerCase().trim();

        items.forEach(item => {
            const label = item.querySelector('.oc-item-label').textContent.toLowerCase();
            const matches = !normalizedSearch || label.includes(normalizedSearch);
            item.style.display = matches ? 'flex' : 'none';
        });

        this._updateCounters();
    }

    /**
     * Scans the current DOM structure to build a map of which item IDs are physically located in which classification columns.
     * AI NOTE: NON-PERSISTENT UI SCANNER.
     * This method performs a live DOM-scrape of the current column structure.
     * It does NOT hit an API or save to a database. It simply translates the physical
     * position of item elements into a JSON map of { classificationId: [itemIds] }.
     * Use this to retrieve the "final draft" of a classification session.
     */
    getValue() {
        const result = {};
        this.classifications.forEach(classification => {
            result[classification.id] = [];
        });

        const defaultClassificationId = this._getDefaultClassificationId();
        const items = this.dialogElement.querySelectorAll('.oc-item');
        items.forEach(item => {
            const itemIdKey = item.dataset.itemIdKey;
            const classification = item.dataset.classification; // This reflects current UI state
            if(result.hasOwnProperty(classification)) {
                result[classification].push(itemIdKey);
            } else {
                result[defaultClassificationId].push(itemIdKey);
                console.warn(`Item ${itemIdKey} found in DOM with unrecognized classification '${classification}'`);
            }
        });
        return result;
    }

    // Helper method to get the default classification ID
    _getDefaultClassificationId() {
        if(this.fallbackClassificationId === null) {
            return this.classifications[0].id;
        }
        for(let cat of this.classifications)
            if(cat.id == this.fallbackClassificationId)
                return this.fallbackClassificationId;
        return this.classifications[0].id;
    }

    _initializeValues() {
        this.classifications.forEach(cat => {
            this.currentValues[cat.id] = [];
        });

        // Ensure classifications array is not empty before trying to access its first element
        if(this.classifications.length === 0) {
            console.error("ClassifyIt: No classifications defined. Cannot initialize values.");
            return; // Cannot proceed without classifications
        }

        // Get the default classification ID
        const defaultClassificationId = this._getDefaultClassificationId();

        this.items.forEach(item => {
            let assignedClassificationId = item[this.options.itemClassificationKey];

            // Check if the item's classification is missing, null, undefined, 
            // or not a valid initialized classification ID.
            if(!assignedClassificationId || !this.currentValues.hasOwnProperty(assignedClassificationId)) {
                item[this.options.itemClassificationKey] = defaultClassificationId; // Update the item's actual classification property
                assignedClassificationId = defaultClassificationId; // Use the default classification for pushing
            }

            // At this point, assignedClassificationId should be a valid key in this.currentValues.
            // The direct push is generally safe, but a hasOwnProperty check is more robust.
            if(this.currentValues.hasOwnProperty(assignedClassificationId)) {
                this.currentValues[assignedClassificationId].push(item[this.options.itemIdKey]);
            } else {
                // This fallback should theoretically not be reached if classifications are defined
                // and defaultClassificationId is derived from them.
                // It implies an issue with defaultClassificationId or the initialization of currentValues.
                console.warn(`Item ${item[this.options.itemIdKey]} could not be assigned to classification '${assignedClassificationId}' or default '${defaultClassificationId}'. This may indicate an issue with classification definitions.`);
                // As a last resort, if even defaultClassificationId is problematic, this item might not be added,
                // or you might consider a "limbo" classification if that makes sense for the application.
                // For now, we'll log the warning. If defaultClassificationId is always valid, this else is defensive.
            }
        });
    }

    /** Generates the high-level modal structure (header, body, and footer) and attaches it to the document body. */
    _createDialog(dialogOptions) {
        const defaultOptions = {
            title: this.options.title,
            width: '95vw',
            height: '85vh'
        };

        const opts = {...defaultOptions, ...dialogOptions};

        // Modify footer buttons based on editable state
        const footerButtonsHTML = this.options.editable
            ? `<button class="oc-btn oc-btn-secondary" data-action="cancel">Cancel</button>
               <button class="oc-btn oc-btn-primary" data-action="save">Guardar</button>`
            : `<button class="oc-btn oc-btn-primary" data-action="close">Cerrar</button>`;


        this.dialogElement = document.createElement('dialog');
        this.dialogElement.className = 'oc-dialog';

        // Add read-only class if not editable
        if(!this.options.editable) {
            this.dialogElement.classList.add('oc-readonly');
        }

        this.dialogElement.innerHTML = `
            <div class="oc-dialog-content">
                <div class="oc-dialog-header">
                    <h2 class="oc-dialog-title">${opts.title}${!this.options.editable ? ' (Read Only)' : ''}</h2>
                    <button class="oc-dialog-close" type="button">×</button>
                </div>
                <div class="oc-dialog-body">
                    ${this._createContent()}
                </div>
                <div class="oc-dialog-footer">
                    ${footerButtonsHTML}
                </div>
            </div>
        `;

        document.body.appendChild(this.dialogElement);

        // Enable drag via header
        this.dialogElement.addEventListener('pointerdown', (e) => DialogIt.dragStart(e, this.dialogElement));
    }

    /** Iterates through classification data to build the individual column containers and their navigation footers. */
    _dragDropColumns() {
        return this.classifications.map((classification, index) => {
            const isFirst = index === 0;
            const isLast = index === this.classifications.length - 1;
            const leftClassification = isFirst ? null : this.classifications[index - 1];
            const rightClassification = isLast ? null : this.classifications[index + 1];

            // Hide navigation buttons if not editable
            const navigationHTML = this.options.editable ? `
                <div class="oc-column-navigation">
                    ${!isFirst ? `<button class="oc-nav-btn" data-action="move-left" data-from="${classification.id}" data-to="${leftClassification.id}">
                        <i class="fas fa-arrow-left"></i> ${leftClassification.label}
                    </button>` : '<span></span>'}
                    <div class="oc-counter" data-classification="${classification.id}">
                        <span class="count">0</span> ${this.options.itemNamePlural}
                    </div>
                    ${this.options.editable ? `<button class="oc-sort-btn" data-sort-classification="${classification.id}" title="Ordena alfábeticamente A-Z"><i class="fas fa-sort-alpha-down"></i> Ordena</button>` : ''}
                    ${!isLast ? `<button class="oc-nav-btn" data-action="move-right" data-from="${classification.id}" data-to="${rightClassification.id}">
                        ${rightClassification.label} <i class="fas fa-arrow-right"></i>
                    </button>` : '<span></span>'}
                </div>
            ` : `
                <div class="oc-column-navigation">
                    <div class="oc-counter" data-classification="${classification.id}">
                        <span class="count">0</span> items
                    </div>
                    ${/* No sort button in read-only mode here either, matching above logic */ ''}
                </div>
            `;

            return `
            <div class="oc-column">
                <div class="oc-column-header">
                    <div class="oc-column-title">${classification.title || classification.label}</div>
                </div>
                <div class="oc-items-list" data-classification="${classification.id}">
                    ${this._createItemsHTML(classification.id)}
                </div>
                ${navigationHTML}
            </div>
        `;
        }).join('');
    }

    /** Assembles the complete inner HTML of the widget, combining the manager areas, search bar, and item columns. */
    _createContent() {

        let classificationManagerHTML = "<div>";

        if(this.options.groupEnabled)
            classificationManagerHTML += this._createGroupManagerHTML();
        classificationManagerHTML += "</div>";

        const searchHTML = `
            <div class="oc-search-stats-row">
                <div class="oc-global-search">
                    <input type="text" class="oc-search-input" placeholder="🔎 Busca ${this.options.itemNamePlural}">
                    <button class="oc-search-clear">×</button>
                </div>
                <div class="oc-stats">
                    Total: <span id="total-count">${this.items.length}</span> ${this.options.itemNamePlural}
                </div>
            </div>
        `;
        const columnsHTML = this._dragDropColumns();

        return `
            <div class="oc-clasificame">
                ${classificationManagerHTML}
                ${searchHTML}
                <div class="oc-columns">
                    ${columnsHTML}
                </div>
            </div>
        `;
    }
    
    /** Maps the item data into draggable HTML elements containing labels and action buttons. */
    _createItemsHTML(classificationId) {
        // Get the default classification ID
        const defaultClassificationId = this._getDefaultClassificationId();

        const classificationItems = this.items.filter(item => {
            const itemClassification = item[this.options.itemClassificationKey] || defaultClassificationId;
            return itemClassification === classificationId;
        });

        return classificationItems.map(item => {
            const itemIdKey = item[this.options.itemIdKey];
            const itemlabelKey = item[this.options.itemlabelKey];
            const currentClassification = item[this.options.itemClassificationKey] || defaultClassificationId;

            // Hide individual item classification buttons if not editable or showItemButtons is false
            const toolbarHTML = this.options.editable && this.options.showItemButtons ? `
                <div class="oc-item-toolbar">
                    ${this.classifications.map(cat => `
                        <button class="oc-item-btn ${currentClassification === cat.id ? 'pressed' : ''}" 
                                data-target="${cat.id}" 
                                data-item-id="${itemIdKey}">
                            ${cat.label}
                        </button>
                    `).join('')}
                </div>
            ` : '';

            // Add read-only class if not editable
            const itemClass = this.options.editable ? 'oc-item' : 'oc-item oc-item-readonly';

            return `
                <div class="${itemClass}" data-item-id="${itemIdKey}" data-classification="${currentClassification}">
                    <span class="oc-item-label">${itemlabelKey}</span>
                    ${toolbarHTML}
                </div>
            `;
        }).join('');
    }

    /** Configures the Sortable.js that enables drag-and-drop movement and handles the logic for updating item metadata after a drop */
    _setupSortable() {
        if(!this.options.editable)
            return;

        const lists = this.dialogElement.querySelectorAll('.oc-items-list');

        lists.forEach(list => {
            /**
             * @description Initializes Sortable for list classification.
             * @see {@link ../docs/sortablejs_guide.md} - API summary, options, and events.
             * @note Follow project-specific naming for IDs and data attributes.
             */
            const sortable = new Sortable(list, {
                group: 'clasificame-items',
                animation: 150,
                easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                forceFallback: false,
                fallbackTolerance: 3,
                delay: 100,
                delayOnTouchOnly: true,
                touchStartThreshold: 10,
                swapThreshold: 0.65,
                ghostClass: 'sortable-ghost',
                chosenClass: 'sortable-chosen',

                onStart: (evt) => {
                    document.body.style.cursor = 'grabbing';
                },

                onEnd: (evt) => {
                    document.body.style.cursor = '';

                    const item = evt.item;
                    const newClassification = evt.to.dataset.classification;
                    const itemIdKey = item.dataset.itemIdKey;

                    item.dataset.classification = newClassification;
                    this._updateItemToolbar(item, newClassification);
                    this._updateCounters();

                    const originalItem = this.items.find(i => i[this.options.itemIdKey] == itemIdKey);
                    if(originalItem) {
                        originalItem[this.options.itemClassificationKey] = newClassification;
                    }
                }
            });

            this.sortableInstances.push(sortable);
        });
    }


    /** adds event listeners standard click actions for dialog closing, saving, and general UI interactions. */
    _setupEventListeners() {
        this.dialogElement.querySelector('.oc-dialog-close').addEventListener('click', () => {
            this.closeDialog(false);
        });

        // Handle different button types based on editable state
        if(this.options.editable) {
            const cancelBtn = this.dialogElement.querySelector('[data-action="cancel"]');
            const saveBtn = this.dialogElement.querySelector('[data-action="save"]');

            if(cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.closeDialog(false);
                });
            }

            if(saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.closeDialog(true);
                });
            }
        } else {
            const closeBtn = this.dialogElement.querySelector('[data-action="close"]');
            if(closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeDialog(false);
                });
            }
        }

        if(this.options.editable) {
            // each item click to move to another classification listener
            if(this.options.showItemButtons)
                this.dialogElement.addEventListener('click', (e) => {
                    if(e.target.classList.contains('oc-item-btn')) {
                        e.preventDefault();
                        e.stopPropagation();
                        const targetClassification = e.target.dataset.target;
                        const itemIdKey = e.target.dataset.itemIdKey;
                        this._moveItemTo(itemIdKey, targetClassification);
                    }
                });
            // move visible items left and/or right listeners
            this.dialogElement.addEventListener('click', (e) => {
                if(e.target.closest('.oc-nav-btn')) {
                    const btn = e.target.closest('.oc-nav-btn');
                    const fromClassification = btn.dataset.from;
                    const toClassification = btn.dataset.to;
                    this._moveVisibleItems(fromClassification, toClassification);
                }
            });
            
            if(this.options.groupEnabled)
                this._setupGroupModeListeners();

            // Sort item buttons
            this.dialogElement.addEventListener('click', (e) => {
                const sortButton = e.target.closest('.oc-sort-btn');
                if(sortButton) {
                    e.preventDefault();
                    const classificationId = sortButton.dataset.sortClassification;
                    if(classificationId) {
                        this._sortItemsInClassification(classificationId);
                    }
                }
            });
        }
        // Setup search listeners regardless of edit mode, as search is a read-only action
        this._setupSearchEventListeners();
    }

    /** Attaches input and click handlers to the filtering field to provide real-time list updates. */
    _setupSearchEventListeners() {
        const globalSearchInput = this.dialogElement.querySelector('.oc-search-input');
        if(globalSearchInput) {
            globalSearchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });

            const clearSearchBtn = this.dialogElement.querySelector('.oc-search-clear');
            if(clearSearchBtn) {
                clearSearchBtn.addEventListener('click', () => {
                    globalSearchInput.value = '';
                    this.search('');
                });
            }
        }
    }

    _updateItemToolbar(itemElement, newClassification) {
        const buttons = itemElement.querySelectorAll('.oc-item-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('pressed', btn.dataset.target === newClassification);
        });
    }

    _moveItemTo(itemIdKey, targetClassification, showFeedback = true) {
        if(!this.options.editable) return;

        // If dialogElement is null, just update the item's classification in the data model
        if(!this.dialogElement) {
            // Find the item in the items array and update its classification
            const item = this.items.find(i => i[this.options.itemIdKey].toString() === itemIdKey.toString());
            if(item) {
                item[this.options.itemClassificationKey] = targetClassification;
            }
            return;
        }

        const item = this.dialogElement.querySelector(`[data-item-id="${itemIdKey}"]`);
        const targetList = this.dialogElement.querySelector(`[data-classification="${targetClassification}"]`);

        if(item && targetList && item.dataset.classification !== targetClassification) {
            item.dataset.classification = targetClassification;
            this._updateItemToolbar(item, targetClassification);
            targetList.appendChild(item);
            this._updateCounters();

            if(showFeedback) {
                item.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
            }
        }
    }

    _moveVisibleItems(fromClassification, toClassification) {
        if(!this.options.editable) return;


        const fromList = this.dialogElement.querySelector(`.oc-items-list[data-classification="${fromClassification}"]`);
        const toList = this.dialogElement.querySelector(`.oc-items-list[data-classification="${toClassification}"]`);

        if(!fromList || !toList) return;

        const visibleItems = fromList.querySelectorAll('.oc-item:not([style*="display: none"])');

        visibleItems.forEach(item => {
            item.dataset.classification = toClassification;
            this._updateItemToolbar(item, toClassification);
            toList.appendChild(item);
        });

        this._updateCounters();
    }
    
    // region: groups __________________________________________________________________________________________________

    /** Builds the controls used to select collections of items and move them to a specific destination classification. */
    _createGroupManagerHTML() {
        const groupOptions = this.options.groups.map(group =>
            `<option value="${group.id}">${group.name} (${group.itemCount} ${this.options.itemNamePlural})</option>`
        ).join('');

        const classificationOptions = this.classifications.map(classification =>
            `<option value="${classification.id}">${classification.title || classification.label}</option>`
        ).join('');
        return `
            <div class="oc-group-section">
                <div class="oc-group-controls">
                    <div class="oc-group-control">
                        <label>Grupos de </label>
                        <select class="oc-group-select" id="group-selector">
                            <option value="">Seleccione grupo...</option>
                            ${groupOptions}
                        </select>
                    </div>
                    <div class="oc-group-control">
                        <label>Ponlos en</label>
                        <select class="oc-group-target-select" id="group-target" disabled>
                            <option value="">Ponerlos en...</option>
                            ${classificationOptions}
                        </select>
                    </div>

                    <div class="oc-group-control">
                        <label>&nbsp;</label>
                        <button class="oc-group-btn" id="apply-group-classification" disabled>¡Ponlos!</button>
                    </div>
                    ${this.options.groupEditable && this.options.editable ? `
                    <div class="oc-group-control">
                        <label>&nbsp;</label> <!-- For alignment -->
                        <button class="oc-btn" id="oc-manage-groups-btn">Manage Groups</button>
                    </div>
                    ` : ''}
                </div>`;
    }

    /** Coordinates selection changes and button clicks for the bulk-moving group classification feature */
    _setupGroupModeListeners() {
        if(this.options.groupEditable) { // Check if the feature is enabled
            const manageGroupsBtn = this.dialogElement.querySelector('#oc-manage-groups-btn');
            if(manageGroupsBtn) {
                manageGroupsBtn.addEventListener('click', () => {
                    const groupManagementCategories = [
                        {id: 'available_groups', label: 'Disponible', title: 'Disponibles'},
                        {id: 'selected_groups', label: 'En Grupo', title: 'En el grupo'}
                    ];

                    const childInstanceOptions = {
                        title: 'Crear un grupo',
                        editable: true,
                        showItemButtons: true,
                        presetsEnabled: false,
                        presetsEditable: false,
                        groupEnabled: true,
                        groupEditable: false, // CRITICAL: Prevent recursion
                        itemIdKey: 'id',
                        itemlabelKey: 'name',
                        itemClassificationKey: 'classification',
                        // dialogClass: 'oc-child-clasificame-dialog' // Optional: for different styling
                    };

                    const groupMgmtInstance = new ClassifyIt(groupManagementCategories, this.items, childInstanceOptions);

                    const compositeGroupName = prompt("Nombre del grupo:");
                    if(!compositeGroupName || compositeGroupName.trim() === '') {
                        alert("Nombre es requerido");
                        return;
                    }
                    const compositeGroupDescription = prompt("Descripción (opciona):") || "";

                    groupMgmtInstance.openDialog({title: `Define Composite Group: ${compositeGroupName}`}) // Pass dynamic title
                        .then(result => {
                            const selectedBaseGroupIds = result.selected_groups || [];

                            if(selectedBaseGroupIds && selectedBaseGroupIds.length > 0) {
                                const newCompositeGroup = {
                                    id: `composite_${Date.now()}`,
                                    name: compositeGroupName,
                                    description: compositeGroupDescription,
                                    itemCount: selectedBaseGroupIds.length, // Number of base groups
                                    isEditable: true, // Assuming composite groups can be edited
                                    isComposite: true,
                                    baseGroupIds: selectedBaseGroupIds
                                };

                                // Add to the parent instance's groups array
                                if(!this.options.groups) {
                                    this.options.groups = [];
                                }
                                this.options.groups.push(newCompositeGroup);

                                alert(`Composite group '${compositeGroupName}' saved successfully with ${selectedBaseGroupIds.length} base group(s).`);

                            } else {
                                alert('No base groups were selected for the composite group. Nothing saved.');
                            }
                        })
                        .catch(error => {
                            console.log('Composite group creation cancelled or failed:', error.message);
                            alert('Composite group creation cancelled or an error occurred.'); // User feedback
                        });
                });
            }
        }

        const groupSelector = this.dialogElement.querySelector('#group-selector');
        const targetSelector = this.dialogElement.querySelector('#group-target');
        const applyBtn = this.dialogElement.querySelector('#apply-group-classification');

        if(!groupSelector || !targetSelector || !applyBtn) {
            console.error('Group mode elements not found');
            return;
        }

        groupSelector.addEventListener('change', async(e) => {
            const groupId = e.target.value;
            if(groupId) {
                // await this.loadGroupItems(groupId);
                targetSelector.disabled = false;
            } else {
                this.clearGroupItems();
                targetSelector.disabled = true;
                targetSelector.value = '';
                applyBtn.disabled = true;
            }
        });

        targetSelector.addEventListener('change', (e) => {
            const hasGroup = groupSelector.value;
            const hasTarget = e.target.value;
            applyBtn.disabled = !hasGroup || !hasTarget;
        });

        applyBtn.addEventListener('click', () => {
            const groupId = groupSelector.value;
            const targetClassification = targetSelector.value;
            if(groupId && targetClassification) {
                this.applyGroupClassification(groupId, targetClassification);
            }
        });

        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.classList.contains('oc-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const targetClassification = e.target.dataset.target;
                const itemIdKey = e.target.dataset.itemIdKey;
                this._moveItemTo(itemIdKey, targetClassification);
            }
        });

        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.closest('.oc-nav-btn')) {
                const btn = e.target.closest('.oc-nav-btn');
                const fromClassification = btn.dataset.from;
                const toClassification = btn.dataset.to;
                this._moveVisibleItems(fromClassification, toClassification);
            }
        });

        this._updateCounters();
    }


    async loadGroupItems(groupId) {

    }


    clearGroupItems() {
        this.selectedGroupItems = [];
    }

    applyGroupClassification(groupId, targetClassification) {
        if(!this.options.editable) return;

        if(!this.selectedGroupItems.length) {
            alert('No items in selected group');
            return;
        }

        let movedCount = 0;
        this.selectedGroupItems.forEach(item => {
            const originalItem = this.items.find(i => i[this.options.itemIdKey] == item.id);
            if(originalItem) {
                originalItem[this.options.itemClassificationKey] = targetClassification;
                this._moveItemTo(item.id, targetClassification, false);
                movedCount++;
            }
        });

        if(movedCount > 0) {
            this._updateCounters();
        } else {
            alert('No items were found to update');
        }

        // Update UI elements only if dialogElement exists
        if(this.dialogElement) {
            const groupSelector = this.dialogElement.querySelector('#group-selector');
            const targetSelector = this.dialogElement.querySelector('#group-target');
            const applyBtn = this.dialogElement.querySelector('#apply-group-classification');

            if(groupSelector) groupSelector.value = '';
            if(targetSelector) {
                targetSelector.value = '';
                targetSelector.disabled = true;
            }
            if(applyBtn) applyBtn.disabled = true;
        }

        this.clearGroupItems();
    }

    // endregion: groups _______________________________________________________________________________________________

    _updateCounters() {

        this.classifications.forEach(classification => {
            const list = this.dialogElement.querySelector(`.oc-items-list[data-classification="${classification.id}"]`);
            const counter = this.dialogElement.querySelector(`.oc-counter[data-classification="${classification.id}"] .count`);

            if(list && counter) {
                const allItems = list.querySelectorAll('.oc-item');
                const visibleItems = Array.from(allItems).filter(item =>
                    item.style.display !== 'none'
                );

                counter.textContent = visibleItems.length;
            }
        });
        const totalCounter = this.dialogElement.querySelector('#total-count');
        if(totalCounter) {
            const allVisibleItems = this.dialogElement.querySelectorAll('.oc-item:not([style*="display: none"])');
            totalCounter.textContent = allVisibleItems.length;
        }
    }

    _sortItemsInClassification(classificationId) {
        if(!this.options.editable) return;

        const itemList = this.dialogElement.querySelector(`.oc-items-list[data-classification="${classificationId}"]`);
        if(!itemList) {
            console.warn(`Sort: Item list not found for classification ${classificationId}`);
            return;
        }

        const items = Array.from(itemList.querySelectorAll('.oc-item'));

        const itemsData = items.map(itemElement => {
            const labelElement = itemElement.querySelector('.oc-item-label');
            return {
                id: itemElement.dataset.itemIdKey,
                label: labelElement ? labelElement.textContent.trim() : '',
                element: itemElement
            };
        });

        itemsData.sort((a, b) => {
            return a.label.localeCompare(b.label, undefined, {numeric: true, sensitivity: 'base'});
        });
        // Re-append sorted items
        itemsData.forEach(itemData => {
            itemList.appendChild(itemData.element);
        });
    }

    /**
     * Centralized API handler for ClassifyIt logic.
     * Follows the 'Read-from-API' protocol and validates the 'success: ok' data contract.
     *
     * @param {string} action - The server-side action to execute (e.g., 'tags_get').
     * @param {Object} payload - Data parameters to send to the API.
     * @returns {Promise<Object>} - The JSON response on success, or an alert/error on failure.
     */
    async _apiCall(action, payload = {}) {
        try {
            const formData = new URLSearchParams();
            formData.append('action', action);

            // Append all payload keys to the form data
            for(const [key, value] of Object.entries(payload)) {
                formData.append(key, value);
            }

            const response = await fetch(this.options.apiUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                body: formData
            });

            // 1. Check HTTP Status (Strictly 200 required)
            if(response.status !== 200) {
                const errorText = await response.text();
                // Show the raw server error message to the user via DialogIt alert
                DialogIt.alert(errorText || `Error HTTP: ${response.status}`, 'Error de Servidor', 'error');
                // Fail the promise
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const json = await response.json();

            // 2. Check Data Contract (Strictly success: 'ok' required)
            if(json.success !== 'ok') {
                const msg = json.error || json.message || 'Error desconocido';
                // Show the specific logic error message from the server to the user
                DialogIt.alert(msg, 'Aviso', 'warning');
                // Fail the promise
                return Promise.reject(json);
            }

            // 3. Success: Fulfill the promise with the data payload
            return json;

        } catch(error) {
            console.error(`_apiCall Failure [${action}]:`, error);
            // Bubble up the failure to ensure calling logic (like Startup) can halt
            throw error;
        }
    }

}
