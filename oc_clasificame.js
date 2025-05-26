class ocClasificame {
    constructor(categories, items, options = {}) {
        this.categories = categories;
        this.items = items;
        this.options = {
            title: 'Classification',
            valueId: 'id',
            valueDisplay: 'name',
            valueColumnKey: 'category',
            editable: true,
            showToolbar: true,
            savedClassifications: [],
            showIndividualMethod: true,
            canSaveIndividualMethod: false,
            showGroupMethod: false,
            groups: [],
            apiEndpoints: {
                save: '/api/classifications/save', // For main classifications
                load: '/api/classifications/list',
                getGroups: '/api/groups/list', // To fetch initial groups list
                getGroupItems: '/api/groups/:groupId/items', // To fetch items for a specific group
                saveGroup: '/api/groups/save', // CRUD: Save a group
                deleteGroup: '/api/groups/delete' // CRUD: Delete a group
            },
            ...options
        };
        
        this.currentValues = {};
        this.sortableInstances = [];
        this.dialogElement = null;
        this.isOpen = false;
        this.currentMode = this.determineMode();
        this.selectedGroupItems = [];
        
        this.initializeValues();

        // For Group CRUD Dialog
        this.groupCrudSortables = [];
        this.isGroupCrudDialogInitialized = false;
        this.groupItemsCache = {}; // Initialize cache for group items

        // Pre-populate cache for existing groups for simulation
        // This assumes this.options.groups is already populated (e.g., from options passed to constructor)
        if (this.options.groups && this.options.groups.length > 0) {
            this.options.groups.forEach(group => {
                // Example: Assign first few items to groups for demo purposes
                // In a real scenario, this data would come from a backend or be empty initially
                if (group.id === 'admin' && this.items.length >= 2) {
                    this.groupItemsCache[group.id] = [this.items[0][this.options.valueId], this.items[1][this.options.valueId]];
                } else if (group.id === 'users' && this.items.length >= 3) {
                    this.groupItemsCache[group.id] = [this.items[2][this.options.valueId]];
                     if (this.items.length >= 4) this.groupItemsCache[group.id].push(this.items[3][this.options.valueId]);
                }
                // Ensure itemCount is accurate if pre-populating cache
                if (this.groupItemsCache[group.id]) {
                    group.itemCount = this.groupItemsCache[group.id].length;
                } else {
                     this.groupItemsCache[group.id] = []; // Ensure cache entry exists
                     group.itemCount = 0;
                }
            });
        }
    }

    _simulateSaveGroup(groupData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!groupData.name || groupData.name.trim() === '') {
                    resolve({ success: false, message: 'Group name cannot be empty.' });
                    return;
                }

                let group;
                if (groupData.groupId) { // Existing group
                    group = this.options.groups.find(g => g.id.toString() === groupData.groupId.toString());
                    if (group) {
                        group.name = groupData.name;
                        group.description = groupData.description;
                        group.itemCount = groupData.items.length; // Update item count
                        this.groupItemsCache[group.id] = groupData.items.map(String); // Store item IDs as strings
                    } else {
                        resolve({ success: false, message: 'Group not found for update.' });
                        return;
                    }
                } else { // New group
                    const newGroupId = Date.now().toString();
                    group = {
                        id: newGroupId,
                        name: groupData.name,
                        description: groupData.description,
                        itemCount: groupData.items.length
                    };
                    this.options.groups.push(group);
                    this.groupItemsCache[newGroupId] = groupData.items.map(String); // Store item IDs as strings
                }
                resolve({ success: true, group: { ...group } }); // Return a copy
            }, 500);
        });
    }

    _simulateDeleteGroup(groupId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const groupIndex = this.options.groups.findIndex(g => g.id.toString() === groupId.toString());
                if (groupIndex > -1) {
                    this.options.groups.splice(groupIndex, 1);
                    delete this.groupItemsCache[groupId.toString()];
                    resolve({ success: true, deletedGroupId: groupId });
                } else {
                    resolve({ success: false, message: 'Group not found for deletion.' });
                }
            }, 500);
        });
    }

    _simulateGetGroupItems(groupId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const itemIdsInGroup = this.groupItemsCache[groupId.toString()] || [];
                const itemsInGroup = itemIdsInGroup.map(id => 
                    this.items.find(item => item[this.options.valueId].toString() === id.toString())
                ).filter(item => item); // Filter out undefined if an ID is not found

                resolve({ success: true, items: itemsInGroup });
            }, 300);
        });
    }
    
    determineMode() {
        // If not editable, force individual mode for display only
        if (!this.options.editable) {
            return 'individual';
        }
        
        if (this.options.showIndividualMethod && !this.options.showGroupMethod) {
            return 'individual';
        } else if (!this.options.showIndividualMethod && this.options.showGroupMethod) {
            return 'group';
        } else if (this.options.showIndividualMethod && this.options.showGroupMethod) {
            return 'both'; // Return 'both' when both options are true
        } else {
            // Fallback: if neither is explicitly true, default to individual
            return 'individual';
        }
    }
    
    initializeValues() {
        this.categories.forEach(cat => {
            this.currentValues[cat.id] = [];
        });
        
        // Ensure categories array is not empty before trying to access its first element
        if (this.categories.length === 0) {
            console.error("ocClasificame: No categories defined. Cannot initialize values.");
            return; // Cannot proceed without categories
        }
        const defaultCategoryId = this.categories[0].id; // Define default category ID once

        this.items.forEach(item => {
            let assignedCategoryId = item[this.options.valueColumnKey];
            
            // Check if the item's category is missing, null, undefined, 
            // or not a valid initialized category ID.
            if (!assignedCategoryId || !this.currentValues.hasOwnProperty(assignedCategoryId)) {
                item[this.options.valueColumnKey] = defaultCategoryId; // Update the item's actual category property
                assignedCategoryId = defaultCategoryId; // Use the default category for pushing
            }
            
            // At this point, assignedCategoryId should be a valid key in this.currentValues.
            // The direct push is generally safe, but a hasOwnProperty check is more robust.
            if (this.currentValues.hasOwnProperty(assignedCategoryId)) {
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
    
    open(dialogOptions = {}) {
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
            
            this.createDialog(dialogOptions);
            
            // Only setup sortable if editable
            if (this.options.editable) {
                this.setupSortable();
            }
            
            this.setupEventListeners();
            this.updateCounters();
            
            this.isOpen = true;
            this.dialogElement.classList.add('open');
        });
    }
    
    createDialog(dialogOptions) {
        const defaultOptions = {
            title: this.options.title,
            width: '95vw',
            height: '85vh'
        };
        
        const opts = { ...defaultOptions, ...dialogOptions };
        
        // Modify footer buttons based on editable state
        let footerButtonsHTML = this.options.editable 
            ? `<button class="oc-btn oc-btn-secondary" data-action="cancel">Cancel</button>
               <button class="oc-btn oc-btn-primary" data-action="save">Save</button>`
            : `<button class="oc-btn oc-btn-primary" data-action="close">Close</button>`;
        
        if (this.options.crudGroupMethod && this.options.editable) {
            const manageGroupsBtnHTML = `<button class="oc-btn" id="oc-manage-groups-btn">Manage Groups</button>`;
            // Prepend the Manage Groups button. It will appear on the left if footer is justify-content: flex-end
            footerButtonsHTML = manageGroupsBtnHTML + footerButtonsHTML;
        }

        this.dialogElement = document.createElement('div');
        this.dialogElement.className = 'oc-dialog';
        
        // Add read-only class if not editable
        if (!this.options.editable) {
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

    createContent() {
        if (this.currentMode === 'individual') {
            return this.createIndividualSectionHTML();
        } else if (this.currentMode === 'group') {
            return this.createGroupSectionHTML();
        }
        return this.createIndividualSectionHTML();
    }
    
    createIndividualSectionHTML() {
        const columnsHTML = this.categories.map((category, index) => {
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
                        <span class="count">0</span> items
                    </div>
                    ${this.options.editable ? `<button class="oc-sort-btn" data-sort-category="${category.id}" title="Sort items A-Z"><i class="fas fa-sort-alpha-down"></i> Sort</button>` : ''}
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
                    ${this.createItemsHTML(category.id)}
                </div>
                ${navigationHTML}
            </div>
        `;
        }).join('');
        
        // Hide classification manager if not editable
        const classificationManagerHTML = this.options.editable && 
            (this.options.canSaveIndividualMethod || this.options.savedClassifications.length > 0) 
            ? this.createClassificationManagerHTML() : '';
        
        // Hide search if not editable
        const searchHTML = this.options.editable ? `
            <div class="oc-search-stats-row">
                <div class="oc-global-search">
                    <input type="text" class="oc-search-input" placeholder="🔎 Search all items">
                    <button class="oc-search-clear">×</button>
                </div>
                <div class="oc-stats">
                    Total: <span id="total-count">${this.items.length}</span> items
                </div>
            </div>
        ` : `
            <div class="oc-search-stats-row">
                <div class="oc-stats">
                    Total: <span id="total-count">${this.items.length}</span> items
                </div>
            </div>
        `;
        
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
    
    createGroupSectionHTML() {
        // If not editable, show individual mode instead
        if (!this.options.editable) {
            return this.createIndividualSectionHTML();
        }
        
        const groupOptions = this.options.groups.map(group => 
            `<option value="${group.id}">${group.name} (${group.itemCount} items)</option>`
        ).join('');
        
        const categoryOptions = this.categories.map(category =>
            `<option value="${category.id}">${category.title || category.label}</option>`
        ).join('');

        const columnsHTML = this.categories.map((category, index) => {
            const isFirst = index === 0;
            const isLast = index === this.categories.length - 1;
            const leftCategory = isFirst ? null : this.categories[index - 1];
            const rightCategory = isLast ? null : this.categories[index + 1];
            
            return `
            <div class="oc-column">
                <div class="oc-column-header">
                    <div class="oc-column-title">${category.title || category.label}</div>
                </div>
                <div class="oc-items-list" data-category="${category.id}">
                    ${this.createItemsHTML(category.id)}
                </div>
                <div class="oc-column-navigation">
                    ${!isFirst ? `<button class="oc-nav-btn" data-action="move-left" data-from="${category.id}" data-to="${leftCategory.id}">
                        <i class="fas fa-arrow-left"></i> ${leftCategory.label}
                    </button>` : '<span></span>'}
                    <div class="oc-counter" data-category="${category.id}">
                        <span class="count">0</span> items
                    </div>
                    ${this.options.editable ? `<button class="oc-sort-btn" data-sort-category="${category.id}" title="Sort items A-Z"><i class="fas fa-sort-alpha-down"></i> Sort</button>` : ''}
                    ${!isLast ? `<button class="oc-nav-btn" data-action="move-right" data-from="${category.id}" data-to="${rightCategory.id}">
                        ${rightCategory.label} <i class="fas fa-arrow-right"></i>
                    </button>` : '<span></span>'}
                </div>
            </div>
        `;
        }).join('');
        
        return `
            <div class="oc-group-section">
                <div class="oc-group-controls">
                    <div class="oc-group-control">
                        <label>Select Group</label>
                        <select class="oc-group-select" id="group-selector">
                            <option value="">Choose a group...</option>
                            ${groupOptions}
                        </select>
                    </div>
                    
                    <div class="oc-group-control">
                        <label>Classify To</label>
                        <select class="oc-group-target-select" id="group-target" disabled>
                            <option value="">Select classification...</option>
                            ${categoryOptions}
                        </select>
                    </div>
                    
                    <div class="oc-group-control">
                        <label>&nbsp;</label>
                        <button class="oc-group-btn" id="apply-group-classification" disabled>
                            Apply Classification
                        </button>
                    </div>
                </div>
                
                <div class="oc-search-stats-row">
                    <div class="oc-global-search">
                        <input type="text" class="oc-search-input" placeholder="🔎 Search all items">
                        <button class="oc-search-clear">×</button>
                    </div>
                    <div class="oc-stats">
                        Total: <span id="total-count">${this.items.length}</span> items
                    </div>
                </div>
                
                <div class="oc-columns">
                    ${columnsHTML}
                </div>
            </div>
        `;
    }
    
    createClassificationManagerHTML() {
        if (!this.options.showIndividualMethod || !this.options.editable) {
            return '';
        }
        
        const savedOptions = this.options.savedClassifications.map(classification => 
            `<option value="${classification.id}" data-description="${classification.description}">${classification.name}</option>`
        ).join('');
        
        const showSaveSection = this.options.canSaveIndividualMethod && this.options.showIndividualMethod;
        
        return `
            <div class="oc-classification-manager">
                ${showSaveSection ? `
                <div class="oc-manager-group">
                    <label>Save Current Classification</label>
                    <input type="text" class="oc-manager-input" id="save-name" placeholder="Classification name">
                    <textarea class="oc-manager-textarea" id="save-description" placeholder="Short description"></textarea>
                    <button class="oc-manager-btn save" id="save-classification">Save Classification</button>
                </div>
                ` : ''}
                
                <div class="oc-manager-group">
                    <label>Load Saved Classification</label>
                    <select class="oc-manager-select" id="load-classification">
                        <option value="">Select a saved classification...</option>
                        ${savedOptions}
                    </select>
                    <div class="oc-manager-description" id="classification-description">
                        Select a classification to see its description
                    </div>
                    <button class="oc-manager-btn load" id="apply-classification" disabled>Reclassify As</button>
                </div>
            </div>
        `;
    }
    
    createItemsHTML(categoryId) {
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
    
    setupSortable() {
        if (!this.options.editable || (this.currentMode !== 'individual' && this.currentMode !== 'group')) {
            return;
        }
        
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
                    this.updateItemToolbar(item, newCategory);
                    this.updateCounters();
                    
                    const originalItem = this.items.find(i => i[this.options.valueId] == itemId);
                    if (originalItem) {
                        originalItem[this.options.valueColumnKey] = newCategory;
                    }
                    
                    console.log(`Item ${itemId} moved to ${newCategory}`);
                }
            });
            
            this.sortableInstances.push(sortable);
        });
    }
    
    setupEventListeners() {
        this.dialogElement.querySelector('.oc-dialog-close').addEventListener('click', () => {
            this.close(false);
        });
        
        // Handle different button types based on editable state
        if (this.options.editable) {
            const cancelBtn = this.dialogElement.querySelector('[data-action="cancel"]');
            const saveBtn = this.dialogElement.querySelector('[data-action="save"]');
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.close(false);
                });
            }
            
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.close(true);
                });
            }
        } else {
            const closeBtn = this.dialogElement.querySelector('[data-action="close"]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.close(false);
                });
            }
        }

        if (this.options.editable) {
            if (this.currentMode === 'individual') {
                this.setupIndividualModeListeners();
            } else if (this.currentMode === 'group') {
                this.setupGroupModeListeners();
            }
        }
        
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        this.dialogElement.addEventListener('click', (e) => {
            if (e.target === this.dialogElement) {
                this.close(false);
            }
        });

        // Centralized sort button listener
        if (this.options.editable) {
            this.dialogElement.addEventListener('click', (e) => {
                const sortButton = e.target.closest('.oc-sort-btn');
                if (sortButton) {
                    e.preventDefault();
                    const categoryId = sortButton.dataset.sortCategory;
                    if (categoryId) {
                        this.sortItemsInCategory(categoryId);
                    }
                }
            });
        }

        if (this.options.crudGroupMethod && this.options.editable) {
            const manageGroupsBtn = this.dialogElement.querySelector('#oc-manage-groups-btn');
            if (manageGroupsBtn) {
                manageGroupsBtn.addEventListener('click', () => {
                    this.openGroupCrudDialog();
                });
            }
        }
    }
    
    setupIndividualModeListeners() {
        if (!this.options.editable) return;
        
        const globalSearch = this.dialogElement.querySelector('.oc-search-input');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.performGlobalSearch(e.target.value);
            });
            
            const clearBtn = this.dialogElement.querySelector('.oc-search-clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    globalSearch.value = '';
                    this.performGlobalSearch('');
                });
            }
        }
        
        this.dialogElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('oc-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const targetCategory = e.target.dataset.target;
                const itemId = e.target.dataset.itemId;
                this.moveItemTo(itemId, targetCategory);
            }
        });
        
        this.dialogElement.addEventListener('click', (e) => {
            if (e.target.closest('.oc-nav-btn')) {
                const btn = e.target.closest('.oc-nav-btn');
                const fromCategory = btn.dataset.from;
                const toCategory = btn.dataset.to;
                this.moveVisibleItems(fromCategory, toCategory);
            }
        });
        
        if (this.options.canSaveIndividualMethod || this.options.savedClassifications.length > 0) {
            this.setupClassificationManager();
        }
        // Removed duplicate sort button listener from here
    }
    
    setupGroupModeListeners() {
        if (!this.options.editable) return;
        
        const groupSelector = this.dialogElement.querySelector('#group-selector');
        const targetSelector = this.dialogElement.querySelector('#group-target');
        const applyBtn = this.dialogElement.querySelector('#apply-group-classification');
        
        if (!groupSelector || !targetSelector || !applyBtn) {
            console.error('Group mode elements not found');
            return;
        }
        
        groupSelector.addEventListener('change', async (e) => {
            const groupId = e.target.value;
            console.log('Group selected:', groupId);
            if (groupId) {
                await this.loadGroupItems(groupId);
                targetSelector.disabled = false;
                console.log('Group items loaded:', this.selectedGroupItems);
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
            console.log('Target changed. Has group:', hasGroup, 'Has target:', hasTarget);
        });
        
        applyBtn.addEventListener('click', () => {
            const groupId = groupSelector.value;
            const targetCategory = targetSelector.value;
            console.log('Apply button clicked. Group:', groupId, 'Target:', targetCategory);
            if (groupId && targetCategory) {
                this.applyGroupClassification(groupId, targetCategory);
            }
        });

        // Add search functionality for group mode
        const globalSearch = this.dialogElement.querySelector('.oc-search-input');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.performGlobalSearch(e.target.value);
            });
            
            const clearBtn = this.dialogElement.querySelector('.oc-search-clear');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    globalSearch.value = '';
                    this.performGlobalSearch('');
                });
            }
        }

        this.dialogElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('oc-item-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const targetCategory = e.target.dataset.target;
                const itemId = e.target.dataset.itemId;
                this.moveItemTo(itemId, targetCategory);
            }
        });
        
        this.dialogElement.addEventListener('click', (e) => {
            if (e.target.closest('.oc-nav-btn')) {
                const btn = e.target.closest('.oc-nav-btn');
                const fromCategory = btn.dataset.from;
                const toCategory = btn.dataset.to;
                this.moveVisibleItems(fromCategory, toCategory);
            }
        });
        
        this.updateCounters();
        // Removed duplicate sort button listener from here
    }
    
    handleKeydown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close(false);
        }
    }
    
    updateItemToolbar(itemElement, newCategory) {
        const buttons = itemElement.querySelectorAll('.oc-item-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('pressed', btn.dataset.target === newCategory);
        });
    }
    
    moveItemTo(itemId, targetCategory, showFeedback = true) {
        if (!this.options.editable) return;
        
        const item = this.dialogElement.querySelector(`[data-item-id="${itemId}"]`);
        const targetList = this.dialogElement.querySelector(`[data-category="${targetCategory}"]`);
        
        if (item && targetList && item.dataset.category !== targetCategory) {
            item.dataset.category = targetCategory;
            this.updateItemToolbar(item, targetCategory);
            targetList.appendChild(item);
            this.updateCounters();
            
            if (showFeedback) {
                item.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    item.style.transform = '';
                }, 200);
                
                console.log(`Item ${itemId} moved to ${targetCategory} via button`);
            }
        }
    }
    
    moveVisibleItems(fromCategory, toCategory) {
        if (!this.options.editable) return;
        
        const fromList = this.dialogElement.querySelector(`.oc-items-list[data-category="${fromCategory}"]`);
        const toList = this.dialogElement.querySelector(`.oc-items-list[data-category="${toCategory}"]`);
        
        if (!fromList || !toList) return;
        
        const visibleItems = fromList.querySelectorAll('.oc-item:not([style*="display: none"])');
        
        visibleItems.forEach(item => {
            item.dataset.category = toCategory;
            this.updateItemToolbar(item, toCategory);
            toList.appendChild(item);
        });
        
        this.updateCounters();
        
        console.log(`Moved ${visibleItems.length} visible items from ${fromCategory} to ${toCategory}`);
    }
    
    setupClassificationManager() {
        if (!this.options.editable) return;
        
        const loadSelect = this.dialogElement.querySelector('#load-classification');
        const descriptionDiv = this.dialogElement.querySelector('#classification-description');
        const applyBtn = this.dialogElement.querySelector('#apply-classification');
        
        if (!loadSelect || !descriptionDiv || !applyBtn) return;
        
        loadSelect.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.value) {
                const description = selectedOption.dataset.description || 'No description available';
                descriptionDiv.textContent = description;
                applyBtn.disabled = false;
            } else {
                descriptionDiv.textContent = 'Select a classification to see its description';
                applyBtn.disabled = true;
            }
        });
        
        const saveBtn = this.dialogElement.querySelector('#save-classification');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveClassification();
            });
        }
        
        applyBtn.addEventListener('click', () => {
            const selectedId = loadSelect.value;
            if (selectedId) {
                this.applyClassification(selectedId);
            }
        });
    }
    
    async saveClassification() {
        if (!this.options.editable) return;
        
        const nameInput = this.dialogElement.querySelector('#save-name');
        const descriptionInput = this.dialogElement.querySelector('#save-description');
        
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!name) {
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
        
        console.log('Saving classification to API:', saveData);
        
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
        if (!this.options.editable) return;
        
        const savedClassification = this.options.savedClassifications.find(c => c.id === classificationId);
        
        if (!savedClassification) {
            alert('Classification not found');
            return;
        }
        
        console.log('Applying classification:', savedClassification);
        
        const currentItemIds = new Set(this.items.map(item => item[this.options.valueId].toString()));
        
        Object.entries(savedClassification.classification).forEach(([categoryId, itemIds]) => {
            itemIds.forEach(itemId => {
                if (currentItemIds.has(itemId.toString())) {
                    this.moveItemTo(itemId, categoryId, false);
                }
            });
        });
        
        this.updateCounters();
    }
    
    refreshLoadDropdown() {
        const loadSelect = this.dialogElement.querySelector('#load-classification');
        if (loadSelect) {
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
        if (!this.options.editable) return;
        
        if (!this.selectedGroupItems.length) {
            alert('No items in selected group');
            return;
        }
        
        console.log(`Applying classification ${targetCategory} to group ${groupId}`);
        console.log('Selected group items:', this.selectedGroupItems);
        
        let movedCount = 0;
        this.selectedGroupItems.forEach(item => {
            const originalItem = this.items.find(i => i[this.options.valueId] == item.id);
            if (originalItem) {
                console.log(`Moving item ${item.id} from ${originalItem[this.options.valueColumnKey]} to ${targetCategory}`);
                originalItem[this.options.valueColumnKey] = targetCategory;
                this.moveItemTo(item.id, targetCategory, false);
                movedCount++;
            }
        });
        
        if (movedCount > 0) {
            this.updateCounters();
        } else {
            alert('No items were found to update');
        }
        
        const groupSelector = this.dialogElement.querySelector('#group-selector');
        const targetSelector = this.dialogElement.querySelector('#group-target');
        const applyBtn = this.dialogElement.querySelector('#apply-group-classification');
        
        if (groupSelector) groupSelector.value = '';
        if (targetSelector) {
            targetSelector.value = '';
            targetSelector.disabled = true;
        }
        if (applyBtn) applyBtn.disabled = true;
        
        this.clearGroupItems();
    }
    
    performGlobalSearch(searchTerm) {
        const items = this.dialogElement.querySelectorAll('.oc-item');
        const normalizedSearch = searchTerm.toLowerCase().trim();
        
        items.forEach(item => {
            const label = item.querySelector('.oc-item-label').textContent.toLowerCase();
            const matches = !normalizedSearch || label.includes(normalizedSearch);
            item.style.display = matches ? 'flex' : 'none';
        });
        
        this.updateCounters();
    }
    
    updateCounters() {
        if (this.currentMode === 'individual' || this.currentMode === 'group') {
            this.updateIndividualCounters();
        }
    }
    
    updateIndividualCounters() {
        this.categories.forEach(category => {
            const list = this.dialogElement.querySelector(`.oc-items-list[data-category="${category.id}"]`);
            const counter = this.dialogElement.querySelector(`.oc-counter[data-category="${category.id}"] .count`);
            
            if (list && counter) {
                const allItems = list.querySelectorAll('.oc-item');
                const visibleItems = Array.from(allItems).filter(item => 
                    item.style.display !== 'none'
                );
                
                counter.textContent = visibleItems.length;
            }
        });
        
        const totalCounter = this.dialogElement.querySelector('#total-count');
        if (totalCounter) {
            const allVisibleItems = this.dialogElement.querySelectorAll('.oc-item:not([style*="display: none"])');
            totalCounter.textContent = allVisibleItems.length;
        }
    }
    
    updateGroupCounters() {
        this.categories.forEach(category => {
            const counter = this.dialogElement.querySelector(`.oc-group-counter[data-category="${category.id}"] .count`);
            
            if (counter) {
                const itemCount = this.items.filter(item => {
                    const itemCategory = item[this.options.valueColumnKey] || this.categories[0].id;
                    return itemCategory === category.id;
                }).length;
                
                counter.textContent = itemCount;
            }
        });
    }
    
    getValue() {
        const result = {};
        
        this.categories.forEach(category => {
            result[category.id] = [];
        });

        // If dialog is present and mode is one where items are displayed in sortable lists
        if (this.dialogElement && (this.currentMode === 'individual' || this.currentMode === 'group' || this.currentMode === 'both')) {
            const items = this.dialogElement.querySelectorAll('.oc-item');
            items.forEach(item => {
                const itemId = item.dataset.itemId;
                const category = item.dataset.category; // This reflects current UI state
                if (result.hasOwnProperty(category)) { // Check if category key exists
                    result[category].push(itemId);
                } else {
                    // This case should ideally not happen if categories in data-category are always valid
                    console.warn(`Item ${itemId} found in DOM with unrecognized category '${category}'`);
                }
            });
        } else {
            // Fallback or for modes where UI doesn't directly represent the categories (e.g. if 'both' had a different structure)
            // Or, if this component is used non-interactively to just get initial distribution
            this.items.forEach(item => {
                const itemId = item[this.options.valueId];
                // Ensure item[this.options.valueColumnKey] is up-to-date from initializeValues()
                const category = item[this.options.valueColumnKey]; 
                if (result.hasOwnProperty(category)) { // Check if category key exists
                    result[category].push(itemId);
                } else {
                     // If categories are pre-initialized into result, this means an item's category is not in the list.
                    console.warn(`Item ${itemId} has category '${category}' not present in initial category list for result object.`);
                }
            });
        }
        
        return result;
    }
    
    close(save = false) {
        document.removeEventListener('keydown', this.handleKeydown.bind(this));
        
        if (save && this.options.editable) {
            const result = this.getValue();
            this.resolve(result);
        } else {
            this.reject(new Error('User cancelled'));
        }
        
        this.sortableInstances.forEach(sortable => {
            sortable.destroy();
        });
        this.sortableInstances = [];
        
        if (this.dialogElement) {
            this.dialogElement.remove();
            this.dialogElement = null;
        }
        
        this.isOpen = false;
    }

    sortItemsInCategory(categoryId) {
        if (!this.options.editable || !this.dialogElement) return;

        const itemList = this.dialogElement.querySelector(`.oc-items-list[data-category="${categoryId}"]`);
        if (!itemList) {
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

        // Clear current items (visually, not from data model yet)
        // itemList.innerHTML = ''; // This would destroy event listeners on items if any were direct

        // Re-append sorted items
        itemsData.forEach(itemData => {
            itemList.appendChild(itemData.element);
        });

        console.log(`Sorted items in category ${categoryId}`);
    }

    _createGroupCrudDialogHTML() {
        // Ensure unique IDs for elements within this dialog to avoid conflicts
        return `
            <dialog class="oc-group-crud-dialog">
                <div class="oc-dialog-header">
                    <h2>Manage Groups</h2>
                    <button class="oc-dialog-close-crud" aria-label="Close">×</button>
                </div>
                <div class="oc-group-crud-dialog-body">
                    <div class="oc-group-crud-left-pane">
                        <div class="oc-group-list-area">
                            <ul class="oc-existing-groups-list" id="oc-crud-existing-groups-list">
                                <!-- Placeholder, will be populated dynamically -->
                                <li>Loading groups...</li>
                            </ul>
                        </div>
                        <div class="oc-group-form-area">
                            <input type="hidden" id="oc-group-crud-groupid">
                            <label for="oc-group-crud-name">Group Name:</label>
                            <input type="text" id="oc-group-crud-name" class="oc-manager-input" placeholder="Enter group name">
                            
                            <label for="oc-group-crud-description">Group Description:</label>
                            <textarea id="oc-group-crud-description" class="oc-manager-textarea" placeholder="Enter group description"></textarea>
                            
                            <div class="oc-group-crud-actions">
                                <button class="oc-btn oc-btn-primary" id="oc-group-crud-save">Save Group</button>
                                <button class="oc-btn oc-btn-danger" id="oc-group-crud-delete" disabled>Delete Group</button>
                                <button class="oc-btn oc-btn-secondary" id="oc-group-crud-clear">New/Clear Form</button>
                            </div>
                        </div>
                    </div>
                    <div class="oc-group-crud-right-pane">
                        <div>
                            <h3>Available Items</h3>
                            <div class="oc-items-list oc-group-crud-available-items" id="oc-crud-available-items">
                                <p class="oc-empty-state">No items available or group not selected.</p>
                            </div>
                        </div>
                        <div>
                            <h3>Items in Group</h3>
                            <div class="oc-items-list oc-group-crud-group-items" id="oc-crud-group-items">
                                <p class="oc-empty-state">Select a group to see its items.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="oc-dialog-footer">
                    <button class="oc-btn oc-btn-secondary" data-action="close-crud">Close</button>
                </div>
            </dialog>
        `;
    }

    openGroupCrudDialog() {
        let dialogElement = document.querySelector('.oc-group-crud-dialog');
        if (!dialogElement) {
            document.body.insertAdjacentHTML('beforeend', this._createGroupCrudDialogHTML());
            dialogElement = document.querySelector('.oc-group-crud-dialog');
        }

        // Ensure dialogElement is not null before proceeding
        if (!dialogElement) {
            console.error('Failed to create or find the group CRUD dialog.');
            return;
        }

        dialogElement.showModal();

        // Close button in footer
        const footerCloseButton = dialogElement.querySelector('.oc-dialog-footer button[data-action="close-crud"]');
        if (footerCloseButton) {
            footerCloseButton.addEventListener('click', ()_=> {
                dialogElement.close();
            });
        }

        // Close button in header
        const headerCloseButton = dialogElement.querySelector('.oc-dialog-header .oc-dialog-close-crud');
        if (headerCloseButton) {
            headerCloseButton.addEventListener('click', ()_=> {
                dialogElement.close();
            });
        }
        
        // Optional: Close when clicking on the backdrop (if enabled by browser for <dialog>)
        // dialogElement.addEventListener('click', (event) => {
        //     if (event.target === dialogElement) {
        //         dialogElement.close();
        //     }
        // });

        if (!this.isGroupCrudDialogInitialized) {
            this._setupGroupCrudEventListeners(dialogElement);
            this.isGroupCrudDialogInitialized = true; 
        }
        
        this._populateGroupList(dialogElement);
        // Call with isNewGroup = true to load all available items for a new group scenario
        this._clearGroupCrudForm(dialogElement, true, true); 
        // _setupGroupCrudSortables is called within _clearGroupCrudForm and group selection,
        // so the explicit call here after _clearGroupCrudForm is good for the initial setup.
        this._setupGroupCrudSortables(dialogElement); 
    }

    _destroyGroupCrudSortables() {
        if (this.groupCrudSortables && this.groupCrudSortables.length > 0) {
            this.groupCrudSortables.forEach(s => s.destroy());
            this.groupCrudSortables = [];
            // console.log('Group CRUD Sortables destroyed.'); // Optional for debugging
        }
    }

    _populateGroupList(dialogElement) {
        const ul = dialogElement.querySelector('#oc-crud-existing-groups-list');
        ul.innerHTML = ''; // Clear existing

        if (this.options.groups && this.options.groups.length > 0) {
            this.options.groups.forEach(group => {
                const li = document.createElement('li');
                li.textContent = `${group.name} (${group.itemCount || 0} items)`;
                li.dataset.groupId = group.id;
                ul.appendChild(li);
            });
        } else {
            ul.innerHTML = '<li>No groups available.</li>';
        }
    }

    _clearGroupCrudForm(dialogElement, clearSelection = true, isNewGroupSetup = false) {
        dialogElement.querySelector('#oc-group-crud-groupid').value = '';
        dialogElement.querySelector('#oc-group-crud-name').value = '';
        dialogElement.querySelector('#oc-group-crud-description').value = '';
        dialogElement.querySelector('#oc-group-crud-delete').disabled = true;

        if (clearSelection) {
            const selectedLi = dialogElement.querySelector('#oc-crud-existing-groups-list li.selected');
            if (selectedLi) {
                selectedLi.classList.remove('selected');
            }
        }

        const availableItemsList = dialogElement.querySelector('#oc-crud-available-items');
        const groupItemsList = dialogElement.querySelector('#oc-crud-group-items');

        if (isNewGroupSetup) {
            availableItemsList.innerHTML = ''; // Clear previous items
            this.items.forEach(item => { // this.items is the master list of all items
                const itemDiv = document.createElement('div');
                itemDiv.className = 'oc-item';
                itemDiv.dataset.itemId = item[this.options.valueId];
                itemDiv.textContent = item[this.options.valueDisplay];
                availableItemsList.appendChild(itemDiv);
            });
            if (this.items.length === 0) {
                availableItemsList.innerHTML = '<p class="oc-empty-state">No items available in the system.</p>';
            }
            groupItemsList.innerHTML = '<p class="oc-empty-state">Drag items here to add to the new group.</p>';
        } else {
            // Default empty state when not specifically setting up for a new group (e.g. after delete)
            availableItemsList.innerHTML = '<p class="oc-empty-state">No items available or group not selected.</p>';
            groupItemsList.innerHTML = '<p class="oc-empty-state">Select a group or create a new one.</p>';
        }
        // Potentially re-initialize sortables if lists were cleared/repopulated
        this._setupGroupCrudSortables(dialogElement);
    }

    _setupGroupCrudEventListeners(dialogElement) {
        // Ensure event listeners for close buttons are only added once,
        // managed by this.isGroupCrudDialogInitialized in openGroupCrudDialog.

        const footerCloseButton = dialogElement.querySelector('.oc-dialog-footer button[data-action="close-crud"]');
        if (footerCloseButton && !footerCloseButton.dataset.listenerAttached) {
            footerCloseButton.addEventListener('click', () => {
                this._destroyGroupCrudSortables(); 
                dialogElement.close();
            });
            footerCloseButton.dataset.listenerAttached = 'true';
        }

        const headerCloseButton = dialogElement.querySelector('.oc-dialog-header .oc-dialog-close-crud');
        if (headerCloseButton && !headerCloseButton.dataset.listenerAttached) {
            headerCloseButton.addEventListener('click', () => {
                this._destroyGroupCrudSortables();
                dialogElement.close();
            });
            headerCloseButton.dataset.listenerAttached = 'true';
        }
        
        // Also handle the 'cancel' event which can be triggered by Esc key
        if (!dialogElement.dataset.cancelListenerAttached) {
            dialogElement.addEventListener('cancel', () => {
                this._destroyGroupCrudSortables();
            });
            dialogElement.dataset.cancelListenerAttached = 'true';
        }

        const groupListUl = dialogElement.querySelector('#oc-crud-existing-groups-list');
        groupListUl.addEventListener('click', (e) => {
            if (e.target.tagName === 'LI' && e.target.dataset.groupId) {
                const previouslySelected = groupListUl.querySelector('li.selected');
                if (previouslySelected) {
                    previouslySelected.classList.remove('selected');
                }
                e.target.classList.add('selected');

                const groupId = e.target.dataset.groupId;
                const group = this.options.groups.find(g => g.id.toString() === groupId.toString());

                if (group) {
                    dialogElement.querySelector('#oc-group-crud-groupid').value = group.id;
                    dialogElement.querySelector('#oc-group-crud-name').value = group.name;
                    dialogElement.querySelector('#oc-group-crud-description').value = group.description || '';
                    dialogElement.querySelector('#oc-group-crud-delete').disabled = false;

                    this._simulateGetGroupItems(groupId).then(response => {
                        const groupItemsList = dialogElement.querySelector('#oc-crud-group-items');
                        const availableItemsList = dialogElement.querySelector('#oc-crud-available-items');
                        groupItemsList.innerHTML = ''; // Clear
                        availableItemsList.innerHTML = ''; // Clear

                        if (response.success) {
                            const groupItemIds = new Set(response.items.map(item => item[this.options.valueId].toString()));

                            response.items.forEach(item => {
                                const itemDiv = document.createElement('div');
                                itemDiv.className = 'oc-item';
                                itemDiv.dataset.itemId = item[this.options.valueId];
                                itemDiv.textContent = item[this.options.valueDisplay];
                                groupItemsList.appendChild(itemDiv);
                            });

                            this.items.forEach(appItem => {
                                if (!groupItemIds.has(appItem[this.options.valueId].toString())) {
                                    const itemDiv = document.createElement('div');
                                    itemDiv.className = 'oc-item';
                                    itemDiv.dataset.itemId = appItem[this.options.valueId];
                                    itemDiv.textContent = appItem[this.options.valueDisplay];
                                    availableItemsList.appendChild(itemDiv);
                                }
                            });

                            if (response.items.length === 0) {
                                groupItemsList.innerHTML = '<p class="oc-empty-state">No items in this group. Drag from available items.</p>';
                            }
                            if (availableItemsList.children.length === 0 && this.items.length > 0) {
                                // All items are in the group
                                availableItemsList.innerHTML = '<p class="oc-empty-state">All items are in this group.</p>';
                            } else if (this.items.length === 0) {
                                availableItemsList.innerHTML = '<p class="oc-empty-state">No items available in the system.</p>';
                            }

                        } else {
                            groupItemsList.innerHTML = '<p class="oc-empty-state">Error loading items.</p>';
                            availableItemsList.innerHTML = '<p class="oc-empty-state">Error loading items.</p>';
                            alert(response.message || 'Could not load group items.');
                        }
                        this._setupGroupCrudSortables(dialogElement);
                    });
                }
            }
        });

        const clearBtn = dialogElement.querySelector('#oc-group-crud-clear');
        clearBtn.addEventListener('click', () => {
            // When "New/Clear Form" is clicked, it's for setting up a new group
            this._clearGroupCrudForm(dialogElement, true, true);
        });

        const saveBtn = dialogElement.querySelector('#oc-group-crud-save');
        saveBtn.addEventListener('click', async () => {
            const groupId = dialogElement.querySelector('#oc-group-crud-groupid').value;
            const name = dialogElement.querySelector('#oc-group-crud-name').value.trim();
            const description = dialogElement.querySelector('#oc-group-crud-description').value.trim();
            
            const itemsInGroupIds = [];
            dialogElement.querySelectorAll('#oc-crud-group-items .oc-item').forEach(itemEl => {
                itemsInGroupIds.push(itemEl.dataset.itemId);
            });

            const groupData = {
                groupId: groupId || null, // Send null if new group
                name,
                description,
                items: itemsInGroupIds
            };

            const response = await this._simulateSaveGroup(groupData);
            if (response.success) {
                alert('Group saved successfully!');
                // Update this.options.groups (handled by _simulateSaveGroup)
                this._populateGroupList(dialogElement); // Refresh list
                
                // Select the saved/updated group and repopulate form
                const savedGroupId = response.group.id.toString();
                const groupLi = dialogElement.querySelector(`#oc-crud-existing-groups-list li[data-group-id="${savedGroupId}"]`);
                if (groupLi) {
                    // Simulate click to re-select and load items
                    groupLi.click(); 
                } else {
                     this._clearGroupCrudForm(dialogElement, true, true); // Clear for new if not found
                }
            } else {
                alert(response.message || 'Error saving group.');
            }
        });

        const deleteBtn = dialogElement.querySelector('#oc-group-crud-delete');
        deleteBtn.addEventListener('click', async () => {
            const groupId = dialogElement.querySelector('#oc-group-crud-groupid').value;
            if (!groupId) return;

            if (confirm(`Are you sure you want to delete group "${dialogElement.querySelector('#oc-group-crud-name').value}"?`)) {
                const response = await this._simulateDeleteGroup(groupId);
                if (response.success) {
                    alert('Group deleted successfully!');
                    // this.options.groups updated by _simulateDeleteGroup
                    this._populateGroupList(dialogElement);
                    this._clearGroupCrudForm(dialogElement, true, true); // Clear form and set for new group
                } else {
                    alert(response.message || 'Error deleting group.');
                }
            }
        });
    }

    _setupGroupCrudSortables(dialogElement) {
        // Destroy existing instances if any, to prevent duplicates if called multiple times
        if (this.groupCrudSortables && this.groupCrudSortables.length > 0) {
            this.groupCrudSortables.forEach(s => s.destroy());
        }
        this.groupCrudSortables = [];

        const availableList = dialogElement.querySelector('#oc-crud-available-items');
        const groupList = dialogElement.querySelector('#oc-crud-group-items');

        if (!availableList || !groupList) {
            console.warn('Group CRUD Sortable lists not found, skipping setup.');
            return;
        }
        
        // Ensure the lists are not showing "empty state" paragraphs when initializing sortable
        if (availableList.querySelector('p.oc-empty-state')) availableList.innerHTML = '';
        if (groupList.querySelector('p.oc-empty-state')) groupList.innerHTML = '';


        const commonSortableOptions = {
            group: 'group-crud-items',
            animation: 150,
            ghostClass: 'sortable-ghost',
            chosenClass: 'sortable-chosen',
            // Add other standard options from main sortable if needed
        };

        this.groupCrudSortables.push(new Sortable(availableList, commonSortableOptions));
        this.groupCrudSortables.push(new Sortable(groupList, commonSortableOptions));
    }
}