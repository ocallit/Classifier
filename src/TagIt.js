// File: TagIt.js
// Version: 2.3.0 - jQuery removed (fetch), fetchItemTags, ClassifyIt integration

/**
 TagIt - A stateless widget for editing Tom Select options
 Each instance is independent with no central management
 */
class TagIt {
    constructor(selectElement, options = {}) {
        this.selectElement = selectElement;
        this.catalogId = "";
        this.dialogId = null;
        this.currentOptions = new Map();
        this.editingValue = null;
        this.wrapperDiv = null;
        this.dialogContent = null;
        this.dialogElements = {};
        this.dialogElement = null;
        this.activeDialogPromise = null;
        this.dialogEventsBound = false;

        // Default options
        this.options = {
            apiUrl: './api/categories.php',
            dialogTitle: 'Editar Categorias',
            confirmDelete: true,
            readOnly: false,
            itemId: null,
            itemTable: null,
            classifier: false,
            onClassify: null,
            ...options
        };

        this.init();
    }

    init() {
        if(this.selectElement.hasAttribute('data-tagit-ro')) {
            this.options.readOnly = true;
        }
        if(this.selectElement.dataset.tagitItemid) {
            this.options.itemId = this.selectElement.dataset.tagitItemid;
        }
        if(this.selectElement.dataset.tagitTable) {
            this.options.itemTable = this.selectElement.dataset.tagitTable;
        }

        // Generate unique IDs for this instance
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        this.dialogId = `tagit_dialog_${timestamp}_${random}`;
        this.editButtonId = `tagit_editBtn_${timestamp}_${random}`;

        // Create wrapper FIRST (before Tom Select)
        this.createWrapperEarly();

        // Initialize Tom Select if not already initialized
        if(!this.selectElement.tomselect) {
            const isMultiple = this.selectElement.hasAttribute('multiple');

            const preSelectedValues = Array.from(this.selectElement.querySelectorAll('option[selected]'))
                .map(opt => opt.value);

            new TomSelect(this.selectElement, {
                plugins: isMultiple ? ['remove_button'] : [],
                create: false,
                sortField: {field: 'text', direction: 'asc'},
                maxItems: isMultiple ? null : 1,
                items: preSelectedValues
            });
        }

        // Read current options from select element
        this.loadOptionsFromSelect();

        // Create edit button inside wrapper
        this.createEditButton();
        this.createCopyButton();

        // Create dialog
        this.buildDialogContent();

        // Auto-fetch if itemId present and select has no options
        const hasOptions = this.selectElement.querySelectorAll('option').length > 0;
        if(this.options.itemId && !hasOptions) {
            this.fetchItemTags();
        }
    }

    getTomSelectInstance() {
        return this.selectElement.tomselect || null;
    }

    /**
     MODIFIED: Creates the flexRowDyanimic wrapper for the TomSelect element
     */
    createWrapperEarly() {
        // Create wrapper div
        this.wrapperDiv = document.createElement('div');
        this.wrapperDiv.className = 'tagit_wrapper flexRowDyanimic';

        // Create the growable div for TomSelect
        const tomSelectContainer = document.createElement('div');
        // This div will be the :first-child, so it will grow

        // Insert wrapper BEFORE the select element
        this.selectElement.parentNode.insertBefore(this.wrapperDiv, this.selectElement);

        // Move select INTO the growable div
        tomSelectContainer.appendChild(this.selectElement);

        // Add the growable div to the wrapper
        this.wrapperDiv.appendChild(tomSelectContainer);
    }

    /**
     MODIFIED: Adds buttons into a fixed-width container
     */
    getButtonContainer() {
        // Find or create the fixed-size container for buttons
        let buttonContainer = this.wrapperDiv.querySelector('.tagit_buttonContainer');
        if(!buttonContainer) {
            buttonContainer = document.createElement('div');
            // This div will be :not(:first-child), so it will be fixed-width
            buttonContainer.className = 'tagit_buttonContainer';
            this.wrapperDiv.appendChild(buttonContainer);
        }
        return buttonContainer;
    }

    createEditButton() {
        const buttonContainer = this.getButtonContainer();
        const editButton = document.createElement('button');
        editButton.id = this.editButtonId;
        editButton.type = 'button';
        editButton.className = 'tagit_button--icon'; // Use new CSS class
        editButton.innerHTML = this.options.readOnly ? '📖' : '✏️';
        editButton.title = 'Editar Categorias';

        buttonContainer.appendChild(editButton);

        editButton.addEventListener('click', () => {
            this.openDialog();
        });
    }

    createCopyButton() {
        const buttonContainer = this.getButtonContainer();
        const copyButton = document.createElement('button');
        copyButton.id = this.copyButtonId;
        copyButton.type = 'button';
        copyButton.className = 'tagit_button--icon'; // Use new CSS class
        copyButton.innerHTML = '⎘'; // Using a simpler copy icon
        copyButton.title = 'Copiar';

        buttonContainer.appendChild(copyButton);

        copyButton.addEventListener('click', (e) => {
            // This is just a placeholder, the real copy button is on the dialog
            // You could implement a "copy selected" here if you wanted.
            this.copyOptionsToClipboard(e.currentTarget);
        });
    }

    // ===================================================================
    // RESTORED: All JS helper functions are back
    // ===================================================================

    loadOptionsFromSelect() {
        this.currentOptions.clear();
        const options = this.selectElement.querySelectorAll('option');

        options.forEach(option => {
            if(option.value) {
                this.currentOptions.set(option.value, {
                    value: option.value,
                    text: option.textContent,
                    selected: option.selected
                });
            }
        });
    }

    addOptionToSelect(option, markSelected = true) {
        // Check if option already exists in select element
        let optionElement = this.selectElement.querySelector(`option[value="${CSS.escape(option.value)}"]`);
        if(!optionElement) {
            // Only create if doesn't exist
            optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.text;
            this.selectElement.appendChild(optionElement);
        } else {
            // Update text if it already exists
            optionElement.textContent = option.text;
        }

        if(markSelected) {
            optionElement.selected = true;
        }

        // Step 2: Update Tom Select
        let tomSelectInstance = this.getTomSelectInstance();
        if(tomSelectInstance) {
            // Check if option exists in Tom Select
            if(!tomSelectInstance.options[option.value]) {
                tomSelectInstance.addOption({
                    value: option.value,
                    text: option.text
                });
            }

            if(markSelected) {
                tomSelectInstance.addItem(option.value, false);
            }
        }
    }

    removeOptionFromSelect(optionValue) {
        // Step 1: Update the underlying <select> element
        const optionElement = this.selectElement.querySelector(`option[value="${CSS.escape(optionValue)}"]`);
        if(optionElement) {
            optionElement.remove();
        }

        // Step 2: Update Tom Select directly
        let tomSelectInstance = this.getTomSelectInstance();
        if(tomSelectInstance) {
            // First remove from selection if selected
            const currentValues = tomSelectInstance.getValue();
            if(Array.isArray(currentValues) ? currentValues.includes(optionValue) : currentValues === optionValue) {
                tomSelectInstance.removeItem(optionValue, true);
            }

            // Then remove the option itself
            tomSelectInstance.removeOption(optionValue);
        }
    }

    updateOptionInSelect(optionValue, newText) {
        // Step 1: Update the underlying <select> element
        const optionElement = this.selectElement.querySelector(`option[value="${CSS.escape(optionValue)}"]`);
        if(optionElement) {
            optionElement.textContent = newText;
        }

        let tomSelectInstance = this.getTomSelectInstance();
        if(tomSelectInstance) {
            // Check if this option is currently selected
            const currentValues = tomSelectInstance.getValue();
            const isSelected = Array.isArray(currentValues)
                ? currentValues.includes(optionValue)
                : currentValues === optionValue;

            // Update the option data in Tom Select
            tomSelectInstance.updateOption(optionValue, {
                value: optionValue,
                text: newText
            });

            if(isSelected) {
                tomSelectInstance.removeItem(optionValue, true);
                tomSelectInstance.addItem(optionValue, false);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Normalize text for accent and case insensitive comparison
     * Removes diacritical marks and converts to lowercase
     */
    normalizeText(str) {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().trim();
    }

    validOption(value, text, excludeValue = null) {
        const trimmedText = text.trim();
        if(!trimmedText) {
            return {
                valid: false,
                error: 'Es un dato requerido'
            };
        }

        const normalizedNewText = this.normalizeText(trimmedText);

        for(const [optValue, option] of this.currentOptions) {
            if(excludeValue && optValue == excludeValue) {
                continue;
            }

            if(value && optValue === value) {
                return {
                    valid: false,
                    error: `Value "${value}" already exists`
                };
            }

            const normalizedExistingText = this.normalizeText(option.text);
            if(normalizedExistingText === normalizedNewText) {
                return {
                    valid: false,
                    error: `Ya existe "${trimmedText}" como: "${option.text}"`
                };
            }
        }

        return {
            valid: true,
            error: null
        };
    }

    async _apiPost(params) {
        const body = new URLSearchParams(params);
        const response = await fetch(this.options.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body
        });
        if(!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    }

    /**
     * Fetch tags for the current item from the backend.
     * Populates the select and TomSelect with the returned tags.
     * Can be called explicitly or auto-called on init when itemId is set
     * and the <select> has no options.
     */
    async fetchItemTags() {
        if(!this.options.itemId) {
            return;
        }

        try {
            const response = await this._apiPost({
                action: 'tagGetItemTags',
                catalog_id: this.options.catalogId,
                item_id: this.options.itemId,
                item_table: this.options.itemTable || ''
            });
            if(response.success && response.data && response.data.tags) {
                response.data.tags.forEach(tag => {
                    this.addOptionToSelect(
                        { value: tag.value, text: tag.text },
                        !!tag.selected
                    );
                });
                this.loadOptionsFromSelect();
            }
        } catch(e) {
            console.error('TagIt: fetchItemTags failed', e);
        }
    }

    showAlert(message) {
        return DialogUtil.alert(this.escapeHtml(message), 'Aviso', 'info');
    }

    showConfirm(message) {
        return DialogUtil.confirm(
            this.escapeHtml(message),
            'Confirmar',
            'warning'
        ).then(result => {
            if(result) return true;
            else throw new Error('cancelled');
        });
    }

    // ===================================================================
    // END of restored functions
    // ===================================================================

    /**
     MODIFIED: Rebuilds the dialog content using the new flexbox classes
     */
    buildDialogContent() {
        if(this.dialogContent) {
            return;
        }

        const container = document.createElement('div');
        container.id = this.dialogId;
        // This is now the main flex column
        container.className = 'tagit_dialog flexColumnFlexible';
        container.innerHTML = `
            <div class="tagit_searchToolbar flexRowDyanimic">
                <div>
                    <input type="text" id="${this.dialogId}_search" placeholder="🔍 Buscar ..." enterkeyhint="search">
                </div>
                <div>
                    <button type="button" id="${this.dialogId}_searchClear" class="tagit_button--icon" style="display: none;">×</button>
                </div>
            </div>

            <div class="tagit_optionsList" id="${this.dialogId}_list">
                <!-- List items will be injected here by renderOptionsList -->
            </div>

            ${!this.options.readOnly ? `
                <div class="tagit_toolbar">
                    <button type="button" id="${this.dialogId}_addBtn" class="tagit_button--fullWidth">Nueva Categoría</button>
                </div>

                <div class="tagit_addForm flexRowDyanimic" id="${this.dialogId}_addForm" style="display: none;">
                    <div>
                        <input type="text" id="${this.dialogId}_newText" placeholder="Categoría..." enterkeyhint="done">
                    </div>
                    <div>
                        <button type="button" id="${this.dialogId}_saveNew" class="tagit_button--icon" title="Save">✓</button>
                        <button type="button" id="${this.dialogId}_cancelNew" class="tagit_button--icon" title="Cancel">✗</button>
                    </div>
                </div>
            ` : ''}
        `;

        this.dialogContent = container;

        // Element cache is now flat, no need for complex selectors
        if(this.options.readOnly) {
            this.dialogElements = {
                root: container,
                searchInput: container.querySelector(`#${this.dialogId}_search`),
                searchClear: container.querySelector(`#${this.dialogId}_searchClear`),
                list: container.querySelector(`#${this.dialogId}_list`),
            };
        } else {
            this.dialogElements = {
                root: container,
                searchInput: container.querySelector(`#${this.dialogId}_search`),
                searchClear: container.querySelector(`#${this.dialogId}_searchClear`),
                list: container.querySelector(`#${this.dialogId}_list`),
                addBtn: container.querySelector(`#${this.dialogId}_addBtn`),
                addForm: container.querySelector(`#${this.dialogId}_addForm`),
                newText: container.querySelector(`#${this.dialogId}_newText`),
                saveNew: container.querySelector(`#${this.dialogId}_saveNew`),
                cancelNew: container.querySelector(`#${this.dialogId}_cancelNew`)
            };
        }

        // Events are bound in openDialog() after content is mounted in DOM
    }

    bindDialogEvents() {
        if(!this.dialogContent) {
            return;
        }

        const {searchInput, searchClear, addBtn, saveNew, cancelNew, newText} = this.dialogElements;

        if(searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterOptions(e.target.value);
            });
        }

        if(searchClear) {
            searchClear.addEventListener('click', () => {
                if(searchInput) {
                    searchInput.value = '';
                }
                this.filterOptions('');
            });
        }

        if(addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddForm();
            });
        }

        if(saveNew) {
            saveNew.addEventListener('click', () => {
                this.saveNewOption();
            });
        }

        if(cancelNew) {
            cancelNew.addEventListener('click', () => {
                this.hideAllForms();
            });
        }

        if(newText) {
            newText.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    e.preventDefault();
                    this.saveNewOption();
                } else if(e.key === 'Escape') {
                    this.hideAllForms();
                }
            });
        }

        this.dialogEventsBound = true;
    }

    openDialog() {
        if(this.activeDialogPromise) {
            return;
        }

        this.buildDialogContent();

        this.loadOptionsFromSelect();

        // *** CRITICAL FIX: Re-cache elements AFTER content is in DOM ***
        // Don't call renderOptionsList() yet - wait until content is in dialog

        if(!this.dialogContent) {
            return;
        }

        // Create dialog using DialogUtil
        const dialog = document.createElement('dialog');
        dialog.className = 'ontoy-dlg';
        dialog.innerHTML = `
            <header class="ontoy-dlg-header">
                <b>${this.escapeHtml(this.options.dialogTitle)}</b>
                <button type="button" class="ontoy-dlg-close" aria-label="Cerrar">&times;</button>
            </header>
            <div class="ontoy-dlg-content">
                ${this.dialogContent.outerHTML}
            </div>
            <footer class="ontoy-dlg-footer">
                <button type="button" class="ontoy-btn ontoy-btn-primary btn-close">Cerrar</button>
            </footer>
        `;

        document.body.appendChild(dialog);

        // Setup drag
        dialog.addEventListener('pointerdown', (e) => DialogUtil.dragStart(e, dialog));

        // *** CRITICAL FIX: Replace content BEFORE rendering options ***
        const contentDiv = dialog.querySelector('.ontoy-dlg-content');
        contentDiv.innerHTML = '';
        contentDiv.appendChild(this.dialogContent);

        // *** CRITICAL FIX: Re-cache elements AFTER content is in DOM ***
        this.recacheDialogElements();

        // *** CRITICAL FIX: Re-bind events every time dialog opens ***
        this.bindDialogEvents();

        // Now render the options list with fresh element references
        this.renderOptionsList();

        if(this.dialogElements.searchInput) {
            this.filterOptions(this.dialogElements.searchInput.value || '');
        }

        // Copy button in header
        this.copyButtonHeader(dialog);

        // Handle close
        const closeBtn = dialog.querySelector('.btn-close');
        const closeX = dialog.querySelector('.ontoy-dlg-close');

        let resolvePromise, rejectPromise;
        const promise = new Promise((resolve, reject) => {
            resolvePromise = resolve;
            rejectPromise = reject;
        });

        const cleanup = () => {
            dialog.remove();
            this.hideAllForms();
            this.cancelAllEditing();
            this.dialogElement = null;
            this.activeDialogPromise = null;
            this.dialogEventsBound = false;
            // Discard content so buildDialogContent() creates fresh DOM
            // next time — prevents listener accumulation on reused nodes
            this.dialogContent = null;
            this.dialogElements = {};
            resolvePromise(true);
        };

        closeBtn.onclick = cleanup;
        closeX.onclick = cleanup;

        dialog.addEventListener('cancel', (e) => {
            e.preventDefault();
            cleanup();
        });

        this.dialogElement = dialog;
        this.activeDialogPromise = promise;

        dialog.showModal();

        return promise;
    }

    /**
     * Re-cache dialog element references after content is added to DOM
     * This fixes the stale reference bug
     */
    recacheDialogElements() {
        if(!this.dialogContent) {
            return;
        }

        if(this.options.readOnly) {
            this.dialogElements = {
                root: this.dialogContent,
                searchInput: this.dialogContent.querySelector(`#${this.dialogId}_search`),
                searchClear: this.dialogContent.querySelector(`#${this.dialogId}_searchClear`),
                list: this.dialogContent.querySelector(`#${this.dialogId}_list`),
            };
        } else {
            this.dialogElements = {
                root: this.dialogContent,
                searchInput: this.dialogContent.querySelector(`#${this.dialogId}_search`),
                searchClear: this.dialogContent.querySelector(`#${this.dialogId}_searchClear`),
                list: this.dialogContent.querySelector(`#${this.dialogId}_list`),
                addBtn: this.dialogContent.querySelector(`#${this.dialogId}_addBtn`),
                addForm: this.dialogContent.querySelector(`#${this.dialogId}_addForm`),
                newText: this.dialogContent.querySelector(`#${this.dialogId}_newText`),
                saveNew: this.dialogContent.querySelector(`#${this.dialogId}_saveNew`),
                cancelNew: this.dialogContent.querySelector(`#${this.dialogId}_cancelNew`)
            };
        }
    }

    /**
     MODIFIED: Renders list items using the flexRowDyanimic pattern
     */
    renderOptionsList() {
        if(!this.dialogElements.list) {
            return;
        }

        const listContainer = this.dialogElements.list;
        let html = '';

        // Sort options alphabetically by text before rendering
        const sortedOptions = [...this.currentOptions.values()].sort((a, b) => {
            return a.text.localeCompare(b.text, undefined, {numeric: true, sensitivity: 'base'});
        });

        sortedOptions.forEach((option) => {
            const escapedValue = this.escapeHtml(option.value);
            const escapedText = this.escapeHtml(option.text);
            const classifyBtn = this.options.classifier
                ? `<button type="button" class="tagit_button--icon tagit_classifyBtn" data-value="${escapedValue}" title="Clasificar">🏷️</button>`
                : '';
            html += `
                <div class="tagit_optionItem" data-value="${escapedValue}">
                    <div class="tagit_optionDisplay flexRowDyanimic" data-mode="view">
                        <div>
                            <span class="tagit_optionText">${escapedText}</span>
                        </div>
                        <div>
                            ${classifyBtn}
                            ${!this.options.readOnly ? `
                                <button type="button" class="tagit_button--icon tagit_editBtn" data-value="${escapedValue}" title="Edit">✏️</button>
                                <button type="button" class="tagit_button--icon tagit_deleteBtn" data-value="${escapedValue}" title="Delete">🗑️</button>
                            ` : ''}
                        </div>
                    </div>

                    ${!this.options.readOnly ? `
                        <div class="tagit_optionEdit flexRowDyanimic" data-mode="edit" style="display: none;">
                            <div>
                                <input type="text" class="tagit_inlineInput" value="${escapedText}" data-original-value="${escapedText}" enterkeyhint="done">
                            </div>
                            <div>
                                <button type="button" class="tagit_button--icon tagit_saveBtn" data-value="${escapedValue}" title="Save">✓</button>
                                <button type="button" class="tagit_button--icon tagit_cancelBtn" data-value="${escapedValue}" title="Cancel">✗</button>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        listContainer.innerHTML = html;

        // Bind option actions
        this.bindOptionEvents();
    }

    bindOptionEvents() {
        if(!this.dialogElements.list) {
            return;
        }

        const listContainer = this.dialogElements.list;

        // Classify buttons
        listContainer.querySelectorAll('.tagit_classifyBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute('data-value');
                const option = this.currentOptions.get(value);
                if(option && typeof this.options.onClassify === 'function') {
                    this.options.onClassify(value, option.text, this.options.readOnly);
                }
            });
        });

        // Edit buttons
        listContainer.querySelectorAll('.tagit_editBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute('data-value');
                this.startInlineEdit(value);
            });
        });

        // Delete buttons
        listContainer.querySelectorAll('.tagit_deleteBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute('data-value');
                this.deleteOption(value);
            });
        });

        // Save buttons (inline edit)
        listContainer.querySelectorAll('.tagit_saveBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute('data-value');
                this.saveInlineEdit(value);
            });
        });

        // Cancel buttons (inline edit)
        listContainer.querySelectorAll('.tagit_cancelBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.currentTarget.getAttribute('data-value');
                this.cancelInlineEdit(value);
            });
        });

        // Enter key to save, Escape to cancel
        listContainer.querySelectorAll('.tagit_inlineInput').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if(e.key === 'Enter') {
                    const value = e.target.closest('.tagit_optionItem').getAttribute('data-value');
                    this.saveInlineEdit(value);
                } else if(e.key === 'Escape') {
                    const value = e.target.closest('.tagit_optionItem').getAttribute('data-value');
                    this.cancelInlineEdit(value);
                }
            });
        });
    }

    startInlineEdit(value) {
        // Cancel any other editing first
        this.cancelAllEditing();

        // FIXED: Scope to this dialog instance
        if(!this.dialogContent) {
            return;
        }

        const optionItem = this.dialogContent.querySelector(`.tagit_optionItem[data-value="${CSS.escape(value)}"]`);
        if(!optionItem) return;

        const displayMode = optionItem.querySelector('.tagit_optionDisplay');
        const editMode = optionItem.querySelector('.tagit_optionEdit');

        displayMode.style.display = 'none';
        editMode.style.display = 'flex'; // This is 'flex' now, not 'block'

        // Focus the input
        const input = editMode.querySelector('.tagit_inlineInput');
        input.focus();
        input.select();

        this.editingValue = value;
    }

    cancelInlineEdit(value) {
        // FIXED: Scope to this dialog instance
        if(!this.dialogContent) {
            return;
        }

        const optionItem = this.dialogContent.querySelector(`.tagit_optionItem[data-value="${CSS.escape(value)}"]`);
        if(!optionItem) return;

        const displayMode = optionItem.querySelector('.tagit_optionDisplay');
        const editMode = optionItem.querySelector('.tagit_optionEdit');
        const input = optionItem.querySelector('.tagit_inlineInput');

        // Restore original value
        input.value = input.getAttribute('data-original-value');

        displayMode.style.display = 'flex'; // This is 'flex' now
        editMode.style.display = 'none';

        this.editingValue = null;
    }

    cancelAllEditing() {
        if(!this.dialogContent) {
            return;
        }

        const editModes = this.dialogContent.querySelectorAll('.tagit_optionEdit');
        const displayModes = this.dialogContent.querySelectorAll('.tagit_optionDisplay');

        editModes.forEach(edit => edit.style.display = 'none');
        displayModes.forEach(display => display.style.display = 'flex'); // This is 'flex' now

        this.editingValue = null;
    }

    filterOptions(searchTerm) {
        if(!this.dialogElements.list) {
            return;
        }

        const listContainer = this.dialogElements.list;
        const items = listContainer.querySelectorAll('.tagit_optionItem');

        // Normalize search term for accent and case insensitive search
        const searchNormalized = this.normalizeText(searchTerm || '');

        items.forEach(item => {
            const text = item.querySelector('.tagit_optionText').textContent;
            const textNormalized = this.normalizeText(text);
            const matches = textNormalized.includes(searchNormalized);
            item.style.display = matches ? 'block' : 'none'; // 'block' is fine for the item container
        });

        // Show/hide clear button
        if(this.dialogElements.searchClear) {
            this.dialogElements.searchClear.style.display = searchTerm ? 'block' : 'none';
        }
    }

    showAddForm() {
        this.hideAllForms();
        this.cancelAllEditing();

        if(!this.dialogElements.addForm || !this.dialogElements.newText) {
            return;
        }

        this.dialogElements.addForm.style.display = 'flex'; // This is 'flex' now
        const input = this.dialogElements.newText;
        input.value = '';
        input.focus();
    }

    hideAllForms() {
        if(this.dialogElements.addForm) {
            this.dialogElements.addForm.style.display = 'none';
        }
    }

    async saveInlineEdit(value) {
        // FIXED: Scope to this dialog instance
        if(!this.dialogContent) {
            return;
        }

        const optionItem = this.dialogContent.querySelector(`.tagit_optionItem[data-value="${CSS.escape(value)}"]`);
        if(!optionItem) return;

        const input = optionItem.querySelector('.tagit_inlineInput');
        const newText = input.value.trim();

        // Validate the new text (exclude current value from check)
        const validation = this.validOption(null, newText, value);
        if(!validation.valid) {
            await this.showAlert(validation.error);
            input.focus();
            return;
        }

        const option = this.currentOptions.get(value);
        if(!option) return;

        // Send API request
        try {
            const response = await this._apiPost({
                action: 'tagUpdate',
                catalog_id: this.options.catalogId,
                id: value,
                text: newText
            });
            if(response.success) {
                option.text = newText;
                this.updateOptionInSelect(value, newText);
                optionItem.querySelector('.tagit_optionText').textContent = newText;
                this.cancelInlineEdit(value);
            } else {
                this.showAlert('Error: ' + (response.error || 'No pude editarla'));
            }
        } catch(e) {
            this.showAlert('No pude contactar al servidor. ¿Sirve el internet?');
        }
    }

    async saveNewOption() {
        if(!this.dialogElements.newText) {
            return;
        }

        const text = this.dialogElements.newText.value.trim();

        // Validate the new option
        const validation = this.validOption(null, text, null);
        if(!validation.valid) {
            await this.showAlert(validation.error);
            this.dialogElements.newText.focus();
            return;
        }

        try {
            const response = await this._apiPost({
                action: 'tagAdd',
                catalog_id: this.options.catalogId,
                text: text
            });
            if(response.success) {
                const newValue = response.data && response.data.id ? response.data.id : Date.now().toString();

                // ✅ FIX: Only use Tom Select API, don't touch the <select> directly
                const tomSelectInstance = this.getTomSelectInstance();
                if(tomSelectInstance) {
                    // Add to Tom Select if it doesn't exist
                    if(!tomSelectInstance.options[newValue]) {
                        tomSelectInstance.addOption({
                            value: newValue,
                            text: text
                        });
                    }
                    // Select it
                    tomSelectInstance.addItem(newValue, false);
                }

                // ✅ FIX: Update this.currentOptions directly - don't reload from DOM
                this.currentOptions.set(newValue, {
                    value: newValue,
                    text: text,
                    selected: true
                });

                this.renderOptionsList();
                this.hideAllForms();
            } else {
                this.showAlert('Error: ' + (response.error || 'Error al dar de alta'));
            }
        } catch(e) {
            this.showAlert('No pude contactar al servidor. ¿Sirve el internet?');
        }
    }

    async deleteOption(value) {
        const option = this.currentOptions.get(value);
        if(!option) return;

        if(this.options.confirmDelete) {
            try {
                const confirmed = await this.showConfirm(`Confirme borrar: "${option.text}"?`);
                if(!confirmed) {
                    return;
                }
            } catch(e) {
                return; // User cancelled
            }
        }

        try {
            const response = await this._apiPost({
                action: 'tagDelete',
                catalog_id: this.options.catalogId,
                id: value
            });
            if(response.success) {
                this.removeOptionFromSelect(value);
                this.currentOptions.delete(value);
                this.renderOptionsList();
            } else {
                this.showAlert('Error: ' + (response.error || 'No se pudo borrar'));
            }
        } catch(e) {
            this.showAlert('Error al borrar, intente mas tarde');
        }
    }

    destroy() {
        if(this.wrapperDiv && this.wrapperDiv.parentNode) {
            const tsWrapper = this.wrapperDiv.querySelector('.ts-wrapper');
            if(tsWrapper) {
                this.wrapperDiv.parentNode.insertBefore(tsWrapper, this.wrapperDiv);
            }
            this.wrapperDiv.remove();
        }

        if(this.dialogElement) {
            this.dialogElement.close();
            this.dialogElement.remove();
            this.dialogElement = null;
        }

        if(this.dialogContent && this.dialogContent.parentNode) {
            this.dialogContent.parentNode.removeChild(this.dialogContent);
        }

        this.dialogContent = null;
        this.dialogElements = {};
        this.dialogEventsBound = false;
    }

    /**
     Helper for the main-page copy button
     */
    async copyOptionsToClipboard(button) {
        try {
            const tomSelect = this.getTomSelectInstance();
            if(!tomSelect) return;

            const selectedItems = tomSelect.items || [];
            if(selectedItems.length === 0) return;

            const names = selectedItems.map(value => {
                return (tomSelect.options[value] || {}).text || '';
            }).filter(Boolean);

            const payload = names.join('\n');
            if(!payload) return;

            // Use clipboard API
            if(navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(payload);
            } else {
                // Fallback for older browsers/http
                const ta = document.createElement('textarea');
                ta.value = payload;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }

            // Tiny success tick for UX
            const prev = button.innerHTML;
            button.innerHTML = '✔';
            setTimeout(() => (button.innerHTML = '⎘'), 800);
        } catch(e) {
            console.error('Copy failed', e);
        }
    }

    /**
     Injects a "Copy" button into the dialog title bar (left of the ✕).
     Clicking it copies all listed categories to the clipboard, one per line.
     @param {HTMLElement} dialogEl - The <dialog> element.
     */
    copyButtonHeader(dialogEl) {
        if(!dialogEl) return;

        const header = dialogEl.querySelector('.ontoy-dlg-header');
        const closeBtn = dialogEl.querySelector('.ontoy-dlg-close');

        if(!header || !closeBtn) return;

        // Avoid duplicates if dialog is reused
        if(header.querySelector('.ontoy-dlg-copy')) return;

        const copyBtn = document.createElement('button');
        copyBtn.type = 'button';
        copyBtn.className = 'ontoy-dlg-copy';
        copyBtn.title = 'Copiar lista';
        copyBtn.setAttribute('aria-label', 'Copiar lista');
        copyBtn.textContent = '⎘'; // simple copy glyph (can swap for another)
        copyBtn.style.cssText = 'cursor:pointer;background:none;border:none;color:white;font-size:1.1rem;padding:0 8px;border-radius:4px;transition:background 0.2s;';
        copyBtn.onmouseover = () => copyBtn.style.background = 'rgba(255,255,255,0.1)';
        copyBtn.onmouseout = () => copyBtn.style.background = '';

        copyBtn.addEventListener('click', async() => {
            try {
                // Get ALL visible category names listed in this dialog
                const names = Array.from(
                    dialogEl.querySelectorAll('.tagit_optionText')
                ).map(el => (el.textContent || '').trim())
                    .filter(Boolean);

                const payload = names.join('\n') || '';

                if(!payload) {
                    // optional: tiny feedback if empty
                    copyBtn.textContent = '⎘';
                    copyBtn.classList.add('shake'); // if you want to add a tiny CSS effect
                    setTimeout(() => copyBtn.classList.remove('shake'), 350);
                    return;
                }

                // Try async Clipboard API, fallback to a hidden textarea
                if(navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(payload);
                } else {
                    const ta = document.createElement('textarea');
                    ta.value = payload;
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }

                // Tiny success tick for UX
                const prev = copyBtn.textContent;
                copyBtn.textContent = '✔';
                setTimeout(() => (copyBtn.textContent = prev), 800);
            } catch(e) {
                console.error('Copy failed', e);
            }
        });

        // Insert just BEFORE the close X
        header.insertBefore(copyBtn, closeBtn);
    }
}

// Auto-initialize
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('[data-tagit]');
    elements.forEach(element => {
        const options = {};
        if(element.dataset.tagitApiurl) {
            options.apiUrl = element.dataset.tagitApiurl;
        }
        if(element.dataset.tagitTitle) {
            options.dialogTitle = element.dataset.tagitTitle;
        }
        if(element.dataset.tagitCatalogid) {
            options.catalogId = element.dataset.tagitCatalogid;
        }
        if(element.dataset.tagitItemid) {
            options.itemId = element.dataset.tagitItemid;
        }
        if(element.dataset.tagitTable) {
            options.itemTable = element.dataset.tagitTable;
        }

        new TagIt(element, options);
    });
});
