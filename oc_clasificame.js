/**
 * 
 * 
 * Usar helpers
 *  - Plantilla (es para que_clasifica+cajitas de clasificacion o deplano pantalla)
 *  - grupos son lista de que_clasifica
 *  - boton  de seguridad para reload/refresh: Plantillas, grupos, items por si hubo cambios
 * Editores:
 *  - CRUD plantilla, grupos on save refreshes
 *  - CRUD itemsSon link! -como el refresh

 CREATE TABLE oc_clasificame_plantilla (
    oc_clasificame_plantilla_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(64) NOT NULL,
    describe MEDIUMTEXT,
    que_clasifica VARCHAR(64) NOT NULL,
    clasifica_en VARCHAR(64) NOT NULL,
    UNIQUE KEY plantilla_unica(clasifica_en, que_clasifica, plantilla),
    -- trae: clasifica_id:[ids de que clasifica: productos, usuarios:orden]
 );

 CREATE TABLE oc_clasificame_grupo (
     oc_clasificame_grupo_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
     nombre VARCHAR(64) NOT NULL,
     describe MEDIUMTEXT,
     que_clasifica VARCHAR(64) NOT NULL,
     UNIQUE KEY plantilla_unica(que_clasifica, plantilla)
 );
 CREATE TABLE oc_clasificame_grupo_items (
    oc_clasificame_grupo_items_id MEDIUMINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    oc_clasificame_grupo_id MEDIUMINT UNSIGNED NOT NULL,
    -- FK CONSTRAINT CASCADE
    item_id VARCHAR(191) NOT NULL,
    UNIQUE KEY(oc_clasificame_grupo_id,item_id)
 );

 */
class ocClasificame {
    constructor(categories, items, options = {}) {
        this.categories = categories;
        this.items = items;
        this.options = {
            title: 'Classification',
            que_clasifica: 'producto',
            que_clasifica_label: 'Items',
            
            valueId: 'id',
            valueDisplay: 'name',
            valueColumnKey: 'category',
            
            editable: true,
            showToolbar: true,
            savedClassifications: [],
            showPlantillaMethod: true,
            canSavePlantillaMethod: false,
            showGroupMethod: false,
            crudGroupMethod: false,
            groups: [],
            apiEndpoints: {
                save: '/api/classifications/save', // For main classifications
                load: '/api/classifications/list',
                getGroups: '/api/groups/list', // To fetch initial groups list
                getGroupItems: '/api/groups/:groupId/items', // To fetch items for a specific group
                saveGroup: '/api/groups/save', // CRUD: Save a group
                deleteGroup: '/api/groups/delete' // CRUD: Delete a group
            },
            debug:false,
            ...options
        };

        this.currentValues = {};
        this.sortableInstances = [];
        this.dialogElement = null;
        this.isOpen = false;
        this.selectedGroupItems = [];
        
        this._initializeValues();

        this.isClosingProgrammatically = false; // Flag for native dialog closeDialog handling
    }


    createContent() {

        let classificationManagerHTML = "<div>";
        if(this.options.showPlantillaMethod)
            classificationManagerHTML += this._createClassificationManagerHTML();
        if(this.options.showGroupMethod)
            classificationManagerHTML += this._createGroupManagerHTML();
        classificationManagerHTML += "</div>";

        const searchHTML = `
            <div class="oc-search-stats-row">
                <div class="oc-global-search">
                    <input type="text" class="oc-search-input" placeholder="🔎 Busca ${this.options.que_clasifica_label}">
                    <button class="oc-search-clear">×</button>
                </div>
                <div class="oc-stats">
                    Total: <span id="total-count">${this.items.length}</span> ${this.options.que_clasifica_label}
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
    
    getValue() {
        const result = {};
        let defaultCategoryId;
        this.categories.forEach(category => {
            result[category.id] = [];
            if(typeof defaultCategoryId === 'undefined')
                defaultCategoryId = category.id;
        });

        console.log("editable getValues dflt", defaultCategoryId)
        const items = this.dialogElement.querySelectorAll('.oc-item');
        items.forEach(item => {
            const itemId = item.dataset.itemId;
            const category = item.dataset.category; // This reflects current UI state
            if(result.hasOwnProperty(category)) {
                result[category].push(itemId);
            } else {
                result[defaultCategoryId].push(itemId);
                console.warn(`Item ${itemId} found in DOM with unrecognized category '${category}'`);
            }
        });
        return result;
    }
    
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
            // this.dialogElement.classList.add('openDialog'); // Replaced by showModal()

            if(this.dialogElement.tagName === 'DIALOG') {
                console.log("____________ soy un dialogo");
                this.dialogElement.showModal();
                // Add a 'closeDialog' event listener to handle native dialog closeDialog (e.g., Escape key)
                this.dialogElement.addEventListener('closeDialog', () => {
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
            if(this.dialogElement.tagName === 'DIALOG' && this.dialogElement.openDialog) {
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
    
    _initializeValues() {
        this.categories.forEach(cat => {
            this.currentValues[cat.id] = [];
        });

        // Ensure categories array is not empty before trying to access its first element
        if(this.categories.length === 0) {
            console.error("ocClasificame: No categories defined. Cannot initialize values.");
            return; // Cannot proceed without categories
        }
        const defaultCategoryId = this.categories[0].id; // Define default category ID once

        this.items.forEach(item => {
            let assignedCategoryId = item[this.options.valueColumnKey];

            // Check if the item's category is missing, null, undefined, 
            // or not a valid initialized category ID.
            if(!assignedCategoryId || !this.currentValues.hasOwnProperty(assignedCategoryId)) {
                item[this.options.valueColumnKey] = defaultCategoryId; // Update the item's actual category property
                assignedCategoryId = defaultCategoryId; // Use the default category for pushing
            }

            // At this point, assignedCategoryId should be a valid key in this.currentValues.
            // The direct push is generally safe, but a hasOwnProperty check is more robust.
            if(this.currentValues.hasOwnProperty(assignedCategoryId)) {
                this.currentValues[assignedCategoryId].push(item[this.options.valueId]);
            } else {
                // This fallback should theoretically not be reached if categories are defined
                // and defaultCategoryId is derived from them.
                // It implies an issue with defaultCategoryId or the initialization of currentValues.
                console.warn(`Item ${item[this.options.valueId]} could not be assigned to category '${assignedCategoryId}' or default '${defaultCategoryId}'. This may indicate an issue with category definitions.`);
                // As a last resort, if even defaultCategoryId is problematic, this item might not be added,
                // or you might consider a "limbo" category if that makes sense for the application.
                // For now, we'll log the warning. If defaultCategoryId is always valid, this else is defensive.
            }
        });
    }
    
    _createDialog(dialogOptions) {
        const defaultOptions = {
            title: this.options.title,
            width: '95vw',
            height: '85vh'
        };
        
        const opts = { ...defaultOptions, ...dialogOptions };
        
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
                    ${this.createContent()}
                </div>
                <div class="oc-dialog-footer">
                    ${footerButtonsHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(this.dialogElement);
    }
    
    _dragDropColumns() {
        return this.categories.map((category, index) => {
            const isFirst = index === 0;
            const isLast = index === this.categories.length - 1;
            const leftCategory = isFirst ? null : this.categories[index - 1];
            const rightCategory = isLast ? null : this.categories[index + 1];

            // Hide navigation buttons if not editable
            const navigationHTML = this.options.editable ? `
                <div class="oc-column-navigation">
                    ${!isFirst ? `<button class="oc-nav-btn" data-action="move-left" data-from="${category.id}" data-to="${leftCategory.id}">
                        <i class="fas fa-arrow-left"></i> ${leftCategory.label}
                    </button>` : '<span></span>'}
                    <div class="oc-counter" data-category="${category.id}">
                        <span class="count">0</span> ${this.options.que_clasifica_label}
                    </div>
                    ${this.options.editable ? `<button class="oc-sort-btn" data-sort-category="${category.id}" title="Ordena alfábeticamente A-Z"><i class="fas fa-sort-alpha-down"></i> Ordena</button>` : ''}
                    ${!isLast ? `<button class="oc-nav-btn" data-action="move-right" data-from="${category.id}" data-to="${rightCategory.id}">
                        ${rightCategory.label} <i class="fas fa-arrow-right"></i>
                    </button>` : '<span></span>'}
                </div>
            ` : `
                <div class="oc-column-navigation">
                    <div class="oc-counter" data-category="${category.id}">
                        <span class="count">0</span> items
                    </div>
                    ${/* No sort button in read-only mode here either, matching above logic */ ''}
                </div>
            `;

            return `
            <div class="oc-column">
                <div class="oc-column-header">
                    <div class="oc-column-title">${category.title || category.label}</div>
                </div>
                <div class="oc-items-list" data-category="${category.id}">
                    ${this._createItemsHTML(category.id)}
                </div>
                ${navigationHTML}
            </div>
        `;
        }).join('');
    }

    _createClassificationManagerHTML() {
        const savedOptions = this.options.savedClassifications.map(classification => 
            `<option value="${classification.id}" data-description="${classification.description}">${classification.name}</option>`
        ).join('');

        const editarPlantillas = this.options.canSavePlantillaMethod && this.options.showPlantillaMethod ?
            `<button class="oc-manager-btn save" id="new-classification">New</button>
             <button class="oc-manager-btn save" id="edit-classification">Edit</button>
             <button class="oc-manager-btn save" id="del-classification">Del</button>
             ` : '';
        
        return `
            <div class="oc-classification-manager">
                <div class="oc-manager-group">
                    <div>
                    <select class="oc-manager-select" id="load-classification">
                        <option value="">Seleccione plantilla ...</option>
                        ${savedOptions}
                    </select> <button class="oc-manager-btn load" id="apply-classification" disabled>Aplicar Plantilla</button>
                    ${editarPlantillas}
                    </div>
                    <div class="oc-manager-description" id="classification-description"></div>
                </div>
            </div>
        `;
    }

    _createGroupManagerHTML() {
        const groupOptions = this.options.groups.map(group =>
            `<option value="${group.id}">${group.name} (${group.itemCount} ${this.options.que_clasifica_label})</option>`
        ).join('');

        const categoryOptions = this.categories.map(category =>
            `<option value="${category.id}">${category.title || category.label}</option>`
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
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="oc-group-control">
                        <label>&nbsp;</label>
                        <button class="oc-group-btn" id="apply-group-classification" disabled>¡Ponlos!</button>
                    </div>
                    ${this.options.crudGroupMethod && this.options.editable ? `
                    <div class="oc-group-control">
                        <label>&nbsp;</label> <!-- For alignment -->
                        <button class="oc-btn" id="oc-manage-groups-btn">Manage Groups</button>
                    </div>
                    ` : ''}
                </div>`;
    }

    _createItemsHTML(categoryId) {
        const categoryItems = this.items.filter(item => {
            const itemCategory = item[this.options.valueColumnKey] || this.categories[0].id;
            return itemCategory === categoryId;
        });
        
        return categoryItems.map(item => {
            const itemId = item[this.options.valueId];
            const itemLabel = item[this.options.valueDisplay];
            const currentCategory = item[this.options.valueColumnKey] || this.categories[0].id;
            
            // Hide toolbar if not editable or showToolbar is false
            const toolbarHTML = this.options.editable && this.options.showToolbar ? `
                <div class="oc-item-toolbar">
                    ${this.categories.map(cat => `
                        <button class="oc-item-btn ${currentCategory === cat.id ? 'pressed' : ''}" 
                                data-target="${cat.id}" 
                                data-item-id="${itemId}">
                            ${cat.label}
                        </button>
                    `).join('')}
                </div>
            ` : '';
            
            // Add read-only class if not editable
            const itemClass = this.options.editable ? 'oc-item' : 'oc-item oc-item-readonly';
            
            return `
                <div class="${itemClass}" data-item-id="${itemId}" data-category="${currentCategory}">
                    <span class="oc-item-label">${itemLabel}</span>
                    ${toolbarHTML}
                </div>
            `;
        }).join('');
    }
    
    _setupSortable() {
        if(!this.options.editable)
            return;
        
        const lists = this.dialogElement.querySelectorAll('.oc-items-list');
        
        lists.forEach(list => {
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
                    const newCategory = evt.to.dataset.category;
                    const itemId = item.dataset.itemId;
                    
                    item.dataset.category = newCategory;
                    this._updateItemToolbar(item, newCategory);
                    this._updateCounters();
                    
                    const originalItem = this.items.find(i => i[this.options.valueId] == itemId);
                    if(originalItem) {
                        originalItem[this.options.valueColumnKey] = newCategory;
                    }
                }
            });
            
            this.sortableInstances.push(sortable);
        });
    }
    
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
            if(this.options.showPlantillaMethod)
                this._setupPlantillaModeListeners();
            if(this.options.showGroupMethod)
                this._setupGroupModeListeners();
        }
        

        
        // Click-outside-to-closeDialog for native <dialog>
        if(this.dialogElement.tagName === 'DIALOG') {
            this.dialogElement.addEventListener('click', (event) => {
                if(event.target === this.dialogElement) { // Ensures the click is on the dialog element itself
                    const rect = this.dialogElement.getBoundingClientRect();
                    // Check if the click coordinates are outside the dialog's visual bounds
                    const isInDialog = (
                        rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
                        rect.left <= event.clientX && event.clientX <= rect.left + rect.width
                    );
                    if(!isInDialog) {
                        this.closeDialog(false); // Click was on the backdrop
                    }
                }
            });
        } else {
            // Fallback for the old div-based dialog (if ever reverted or for other components)
            this.dialogElement.addEventListener('click', (e) => {
                if(e.target === this.dialogElement) {
                    this.closeDialog(false);
                }
            });
        }

        // Centralized sort button listener
        if(this.options.editable) { // Sort is an edit operation
            this.dialogElement.addEventListener('click', (e) => {
                const sortButton = e.target.closest('.oc-sort-btn');
                if(sortButton) {
                    e.preventDefault();
                    const categoryId = sortButton.dataset.sortCategory;
                    if(categoryId) {
                        this._sortItemsInCategory(categoryId);
                    }
                }
            });
        }
        // Setup search listeners regardless of edit mode, as search is a read-only action
        this._setupSearchEventListeners();
    }
    
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
    
    _setupPlantillaModeListeners() {
        if(!this.options.editable) return; // Keep this guard for other editable actions
        
        // Search listeners moved to _setupSearchEventListeners / _setupEventListeners
        
        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.classList.contains('oc-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const targetCategory = e.target.dataset.target;
                const itemId = e.target.dataset.itemId;
                this._moveItemTo(itemId, targetCategory);
            }
        });
        
        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.closest('.oc-nav-btn')) {
                const btn = e.target.closest('.oc-nav-btn');
                const fromCategory = btn.dataset.from;
                const toCategory = btn.dataset.to;
                this._moveVisibleItems(fromCategory, toCategory);
            }
        });
        
        if(this.options.canSavePlantillaMethod || this.options.savedClassifications.length > 0) {
            this._setupPlantillaManager();
        }
    }
    
    _setupGroupModeListeners() {
        if(this.options.crudGroupMethod) { // Check if the feature is enabled
            const manageGroupsBtn = this.dialogElement.querySelector('#oc-manage-groups-btn');
            if(manageGroupsBtn) {
                manageGroupsBtn.addEventListener('click', () => {
                    const groupManagementCategories = [
                        { id: 'available_groups', label: 'Disponible', title: 'Disponibles' },
                        { id: 'selected_groups', label: 'En Grupo', title: 'En el grupo' }
                    ];

                    const childInstanceOptions = {
                        title: 'Create Composite Group',
                        editable: true,
                        showToolbar: true,
                        showPlantillaMethod: false,
                        canSavePlantillaMethod: false,
                        showGroupMethod: true,
                        crudGroupMethod: false, // CRITICAL: Prevent recursion
                        valueId: 'id',
                        valueDisplay: 'name',
                        valueColumnKey: 'category',
                        // dialogClass: 'oc-child-clasificame-dialog' // Optional: for different styling
                    };

                    const groupMgmtInstance = new ocClasificame(groupManagementCategories, this.items, childInstanceOptions);
                    
                    const compositeGroupName = prompt("Nombre del grupo:");
                    if(!compositeGroupName || compositeGroupName.trim() === '') {
                        alert("Nombre es requerido");
                        return; 
                    }
                    const compositeGroupDescription = prompt("Descripción (opciona):") || "";

                    groupMgmtInstance.openDialog({ title: `Define Composite Group: ${compositeGroupName}` }) // Pass dynamic title
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
        
        groupSelector.addEventListener('change', async (e) => {
            const groupId = e.target.value;
            if(groupId) {
                await this.loadGroupItems(groupId);
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
            const targetCategory = targetSelector.value;
            if(groupId && targetCategory) {
                this.applyGroupClassification(groupId, targetCategory);
            }
        });

        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.classList.contains('oc-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const targetCategory = e.target.dataset.target;
                const itemId = e.target.dataset.itemId;
                this._moveItemTo(itemId, targetCategory);
            }
        });
        
        this.dialogElement.addEventListener('click', (e) => {
            if(e.target.closest('.oc-nav-btn')) {
                const btn = e.target.closest('.oc-nav-btn');
                const fromCategory = btn.dataset.from;
                const toCategory = btn.dataset.to;
                this._moveVisibleItems(fromCategory, toCategory);
            }
        });
        
        this._updateCounters();
    }

    _updateItemToolbar(itemElement, newCategory) {
        const buttons = itemElement.querySelectorAll('.oc-item-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('pressed', btn.dataset.target === newCategory);
        });
    }
    
    _moveItemTo(itemId, targetCategory, showFeedback = true) {
        if(!this.options.editable) return;
        
        const item = this.dialogElement.querySelector(`[data-item-id="${itemId}"]`);
        const targetList = this.dialogElement.querySelector(`[data-category="${targetCategory}"]`);
        
        if(item && targetList && item.dataset.category !== targetCategory) {
            item.dataset.category = targetCategory;
            this._updateItemToolbar(item, targetCategory);
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
    
    _moveVisibleItems(fromCategory, toCategory) {
        if(!this.options.editable) return;
        
        const fromList = this.dialogElement.querySelector(`.oc-items-list[data-category="${fromCategory}"]`);
        const toList = this.dialogElement.querySelector(`.oc-items-list[data-category="${toCategory}"]`);
        
        if(!fromList || !toList) return;
        
        const visibleItems = fromList.querySelectorAll('.oc-item:not([style*="display: none"])');
        
        visibleItems.forEach(item => {
            item.dataset.category = toCategory;
            this._updateItemToolbar(item, toCategory);
            toList.appendChild(item);
        });
        
        this._updateCounters();
    }
    
    _setupPlantillaManager() {
        if(!this.options.editable) return;
        
        const loadSelect = this.dialogElement.querySelector('#load-classification');
        const descriptionDiv = this.dialogElement.querySelector('#classification-description');
        const applyBtn = this.dialogElement.querySelector('#apply-classification');
        
        if(!loadSelect || !descriptionDiv || !applyBtn) return;
        
        loadSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if(selectedOption && selectedOption.value) {
                const description = selectedOption.dataset.description || 'No description available';
                descriptionDiv.textContent = description;
                applyBtn.disabled = false;
            } else {
                descriptionDiv.textContent = 'Select a classification to see its description';
                applyBtn.disabled = true;
            }
        });
        
        const saveBtn = this.dialogElement.querySelector('#save-classification');
        if(saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveClassification();
            });
        }
        
        applyBtn.addEventListener('click', () => {
            const selectedId = loadSelect.value;
            if(selectedId) {
                this.applyClassification(selectedId);
            }
        });
    }
    
    async saveClassification() {
        if(!this.options.editable) return;
        
        const nameInput = this.dialogElement.querySelector('#save-name');
        const descriptionInput = this.dialogElement.querySelector('#save-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if(!name) {
            alert('Please enter a name for the classification');
            return;
        }
        
        const currentClassification = this.getValue();
        
        const saveData = {
            name: name,
            description: description,
            classification: currentClassification,
            categories: this.categories,
            timestamp: new Date().toISOString(),
            totalItems: this.items.length
        };

        try {
            setTimeout(() => {
                alert(`Classification "${name}" saved successfully!`);
                nameInput.value = '';
                descriptionInput.value = '';
                
                this.options.savedClassifications.push({
                    id: Date.now().toString(),
                    name: name,
                    description: description,
                    classification: currentClassification
                });
                
                this.refreshLoadDropdown();
            }, 500);
            
        } catch (error) {
            console.error('Error saving classification:', error);
            alert('Error saving classification. Please try again.');
        }
    }
    
    async applyClassification(classificationId) {
        if(!this.options.editable) return;
        
        const savedClassification = this.options.savedClassifications.find(c => c.id === classificationId);
        
        if(!savedClassification) {
            alert('Classification not found');
            return;
        }
        const currentItemIds = new Set(this.items.map(item => item[this.options.valueId].toString()));
        
        Object.entries(savedClassification.classification).forEach(([categoryId, itemIds]) => {
            itemIds.forEach(itemId => {
                if(currentItemIds.has(itemId.toString())) {
                    this._moveItemTo(itemId, categoryId, false);
                }
            });
        });
        
        this._updateCounters();
    }
    
    refreshLoadDropdown() {
        const loadSelect = this.dialogElement.querySelector('#load-classification');
        if(loadSelect) {
            const savedOptions = this.options.savedClassifications.map(classification => 
                `<option value="${classification.id}" data-description="${classification.description}">${classification.name}</option>`
            ).join('');
            
            loadSelect.innerHTML = `
                <option value="">Select a saved classification...</option>
                ${savedOptions}
            `;
        }
    }
    
    async loadGroupItems(groupId) {
        console.log(`Loading items for group: ${groupId}`);
        
        try {
            const mockGroupItems = this.getMockGroupItems(groupId);
            this.selectedGroupItems = mockGroupItems;
            console.log('Loaded group items:', this.selectedGroupItems);
        } catch (error) {
            console.error('Error loading group items:', error);
            this.selectedGroupItems = [];
        }
    }
    
    getMockGroupItems(groupId) {
        const groupData = {
            'admin': [
                {id: 3, name: "Alice Johnson", category: "write"},
                {id: 6, name: "Diana Prince", category: "write"}
            ],
            'users': [
                {id: 1, name: "John Doe", category: "none"},
                {id: 2, name: "Jane Smith", category: "read"},
                {id: 4, name: "Bob Williams", category: "none"},
                {id: 5, name: "Charlie Brown", category: "read"}
            ],
            'managers': [
                {id: 2, name: "Jane Smith", category: "read"},
                {id: 7, name: "Edward Norton", category: "none"},
                {id: 8, name: "Fiona Apple", category: "read"}
            ]
        };
        
        return groupData[groupId] || [];
    }
    
    clearGroupItems() {
        this.selectedGroupItems = [];
    }
    
    applyGroupClassification(groupId, targetCategory) {
        if(!this.options.editable) return;
        
        if(!this.selectedGroupItems.length) {
            alert('No items in selected group');
            return;
        }

        let movedCount = 0;
        this.selectedGroupItems.forEach(item => {
            const originalItem = this.items.find(i => i[this.options.valueId] == item.id);
            if(originalItem) {
                originalItem[this.options.valueColumnKey] = targetCategory;
                this._moveItemTo(item.id, targetCategory, false);
                movedCount++;
            }
        });
        
        if(movedCount > 0) {
            this._updateCounters();
        } else {
            alert('No items were found to update');
        }
        
        const groupSelector = this.dialogElement.querySelector('#group-selector');
        const targetSelector = this.dialogElement.querySelector('#group-target');
        const applyBtn = this.dialogElement.querySelector('#apply-group-classification');
        
        if(groupSelector) groupSelector.value = '';
        if(targetSelector) {
            targetSelector.value = '';
            targetSelector.disabled = true;
        }
        if(applyBtn) applyBtn.disabled = true;
        
        this.clearGroupItems();
    }

    
    _updateCounters() {
        this.categories.forEach(category => {
            const list = this.dialogElement.querySelector(`.oc-items-list[data-category="${category.id}"]`);
            const counter = this.dialogElement.querySelector(`.oc-counter[data-category="${category.id}"] .count`);

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


    _sortItemsInCategory(categoryId) {
        if(!this.options.editable || !this.dialogElement) return;

        const itemList = this.dialogElement.querySelector(`.oc-items-list[data-category="${categoryId}"]`);
        if(!itemList) {
            console.warn(`Sort: Item list not found for category ${categoryId}`);
            return;
        }

        const items = Array.from(itemList.querySelectorAll('.oc-item'));

        const itemsData = items.map(itemElement => {
            const labelElement = itemElement.querySelector('.oc-item-label');
            return {
                id: itemElement.dataset.itemId,
                label: labelElement ? labelElement.textContent.trim() : '',
                element: itemElement
            };
        });

        itemsData.sort((a, b) => {
            return a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' });
        });
        // Re-append sorted items
        itemsData.forEach(itemData => {
            itemList.appendChild(itemData.element);
        });
    }
}