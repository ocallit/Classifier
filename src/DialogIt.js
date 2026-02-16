
const DialogIt = {
    dragStart(e, dlg) {
        const handleDrag = (evt) => {
            const header = evt.target.closest('.dlg_header');
            if (!header || evt.target.closest('button, input, select')) return;
            evt.preventDefault();

            const rect = dlg.getBoundingClientRect();
            dlg.style.position = 'fixed';
            dlg.style.margin = '0';
            dlg.style.left = rect.left + 'px';
            dlg.style.top = rect.top + 'px';
            dlg.style.width = rect.width + 'px';
            dlg.style.height = rect.height + 'px';

            const offsetX = evt.clientX - rect.left;
            const offsetY = evt.clientY - rect.top;

            const move = (m) => {
                let x = Math.max(0, Math.min(m.clientX - offsetX, window.innerWidth - rect.width));
                let y = Math.max(0, Math.min(m.clientY - offsetY, window.innerHeight - rect.height));
                dlg.style.left = x + 'px';
                dlg.style.top = y + 'px';
            };

            const stop = () => {
                document.removeEventListener('pointermove', move);
                document.removeEventListener('pointerup', stop);
            };

            document.addEventListener('pointermove', move);
            document.addEventListener('pointerup', stop);
        };

        // If 'e' is null, we are just attaching the listener during init()
        if (!e) {
            dlg.addEventListener('pointerdown', handleDrag);
        } else {
            handleDrag(e);
        }
    },

    getFormData(container) {
        const data = {};
        container.querySelectorAll('input, select, textarea').forEach(el => {
            if(el.name) {
                if(el.type === 'checkbox' && el.checked) {
                    data[el.name] = el.value ?? true;
                } else if (el.type === 'radio') {
                    if(el.checked) data[el.name] = el.value;
                } else {
                    data[el.name] = el.value;
                }
            }
        });
        return data;
    },

    /**
     * @param {Object} options
     * @param {string} options.title
     * @param {HTMLElement|string} options.body
     * @param {string} [options.saveLabel="Guardar"]
     * @param {string} [options.cancelLabel="Cancelar"]
     * @param {Array} [options.extraButtons=[]] - [{label: "X", click: (dlg)=>..}]
     * @param {boolean} [options.closeOnOutsideClick=false]
     * @param {boolean} [options.warnIfDirty=true] - If true, asks before closing
     */
    async custom({
                     title = "Dialog",
                     body = "",
                     saveLabel = "Guardar",
                     cancelLabel = "Cancelar",
                     extraButtons = [],
                     closeOnOutsideClick = false,
                     warnIfDirty = true,
                     onOpen = null,
                     onClose = null,
                     validateBeforeSave = null
                 }) {
        const instance = new DialogItCustomDialog(arguments[0]);
        return await instance.init();
    },

    async alert(message, title = "Info", type = "info") {
        const icons = { info: "ℹ️", warning: "⚠️", error: "❌", success: "✅" };
        const dlg = document.createElement('dialog');
        dlg.className = 'dlg_container';
        dlg.innerHTML = `
            <header class="dlg_header">
                <span class="dlg_title">${title}</span>
                <button type="button" class="dlg_close_x">&times;</button>
            </header>
            <div class="dlg_content" style="text-align:center;">
                <div style="font-size:3rem">${icons[type] || 'ℹ️'}</div>
                <p>${message}</p>
            </div>
            <footer class="dlg_footer">
                <button type="button" class="dlg_btn dlg_btn_primary">OK</button>
            </footer>
        `;
        document.body.appendChild(dlg);
        return new Promise(resolve => {
            const clean = () => { dlg.close(); dlg.remove(); resolve(); };

            dlg.addEventListener('pointerdown', (e) => this.dragStart(e, dlg));
            dlg.addEventListener('cancel', (e) => {
                e.preventDefault();
                clean();
            });
            dlg.querySelector('.dlg_btn_primary').onclick = clean;
            dlg.querySelector('.dlg_close_x').onclick = clean;
            dlg.showModal();
        });
    },

    async confirm(message, title = "Confirm", type = "question") {
        const icons = { question: "❓", warning: "⚠️", info: "ℹ️" };
        const dlg = document.createElement('dialog');
        dlg.className = 'dlg_container';
        dlg.innerHTML = `
            <header class="dlg_header"><span class="dlg_title">${title}</span><button class="dlg_close_x">&times;</button></header>
            <div class="dlg_content" style="text-align:center;">
                <div style="font-size:3rem">${icons[type]||'❓'}</div><p>${message}</p>
            </div>
            <footer class="dlg_footer">
                <button class="dlg_btn btn_no">Cancel</button>
                <button class="dlg_btn dlg_btn_primary btn_yes">OK</button>
            </footer>
        `;
        document.body.appendChild(dlg);
        return new Promise(resolve => {
            const clean = (res) => { dlg.close(); dlg.remove(); resolve(res); };

            dlg.addEventListener('pointerdown', (e) => this.dragStart(e, dlg));
            dlg.addEventListener('cancel', (e) => {
                e.preventDefault();
                clean();
            });
            dlg.querySelector('.btn_yes').onclick = () => clean(true);
            dlg.querySelector('.btn_no').onclick = () => clean(false);
            dlg.querySelector('.dlg_close_x').onclick = () => clean(false);
            dlg.showModal();
        });
    }

};

/**
 * Custom dialog wrapper
 *
 * @param {Object} options
 * @param {string} options.title
 * @param {HTMLElement|string} options.body
 * @param {string} [options.saveLabel="Guardar"]
 * @param {string} [options.cancelLabel="Cancelar"]
 * @param {Array} [options.extraButtons=[]] - [{label: "X", click: (dlg)=>..}]
 * @param {boolean} [options.closeOnOutsideClick=false]
 * @param {boolean} [options.warnIfDirty=true] - If true, asks before closing
 *
 * @see wrapper in DialogIt.custom()
 */
function DialogItCustomDialog({
                          title = "Dialog",
                          body = "",
                          saveLabel = "Guardar",
                          cancelLabel = "Cancelar",
                          extraButtons = [],
                          closeOnOutsideClick = false,
                          warnIfDirty = true,
                          onOpen = null,
                          onClose = null,
                          validateBeforeSave = null
                      } = {}) {
    if (!(this instanceof DialogItCustomDialog))
        return new DialogItCustomDialog(arguments[0]);
    this.options = {
        title, body, saveLabel, cancelLabel, extraButtons,
        closeOnOutsideClick, warnIfDirty, onOpen, onClose, validateBeforeSave
    };
    this.isDirty = false;
    this.dlg = document.createElement('dialog');
    this.dlg.className = 'dlg_container';
}

DialogItCustomDialog.prototype.init = async function() {
    const {
        title = "Dialog", body = "", saveLabel = "OK", cancelLabel = "Cancel",
        extraButtons = [], closeOnOutsideClick = false, warnIfDirty = false,
        onOpen = null, onClose = null, validateBeforeSave = null
    } = this.options;

    this.dlg.innerHTML = `
        <header class="dlg_header"><span class="dlg_title">${title}</span><button type="button" class="dlg_close_x">&times;</button></header>
        <div class="dlg_content"></div>
        <div class="dlg_error_msg"></div>
        <footer class="dlg_footer"><button type="button" class="dlg_btn btn_cancel">${cancelLabel}</button></footer>
    `;

    const contentArea = this.dlg.querySelector('.dlg_content');
    const footerArea = this.dlg.querySelector('.dlg_footer');
    const errorArea = this.dlg.querySelector('.dlg_error_msg');

    // Content Setup
    if (body instanceof HTMLElement) contentArea.appendChild(body);
    else contentArea.innerHTML = body;

    // Button Setup
    extraButtons.forEach(btn => {
        const b = document.createElement('button');
        b.className = 'dlg_btn'; b.textContent = btn.label;
        b.onclick = () => btn.click(this.dlg);
        footerArea.appendChild(b);
    });

    const saveBtn = document.createElement('button');
    saveBtn.className = 'dlg_btn dlg_btn_primary btn_save';
    saveBtn.textContent = saveLabel;
    if (!saveLabel) saveBtn.style.display = 'none';
    footerArea.appendChild(saveBtn);

    if (!cancelLabel) footerArea.querySelector('.btn_cancel').style.display = 'none';

    document.body.appendChild(this.dlg);
    DialogIt.dragStart(null, this.dlg); // Attach dragging from static utility

    if (warnIfDirty) {
        contentArea.addEventListener('input', () => this.isDirty = true, { once: true });
    }

    return new Promise(resolve => {
        const cleanup = (result) => {
            if (onClose) onClose(this.dlg);
            this.dlg.close(); this.dlg.remove(); resolve(result);
        };

        const attemptClose = async (result) => {
            if (warnIfDirty && this.isDirty && result === null) {
                const ok = await DialogIt.confirm("Discard changes?", "Unsaved Data");
                if (!ok) return;
            }
            cleanup(result);
        };

        saveBtn.onclick = async () => {
            const data = DialogIt.getFormData(contentArea);
            errorArea.style.display = 'none';
            if (validateBeforeSave) {
                saveBtn.disabled = true;
                const originalText = saveBtn.textContent;
                saveBtn.textContent = "Checking...";
                const error = await validateBeforeSave(data, this.dlg);
                saveBtn.disabled = false; saveBtn.textContent = originalText;
                if (error) {
                    errorArea.textContent = error;
                    errorArea.style.display = 'block';
                    return;
                }
            }
            cleanup({ saved: true, data });
        };

        this.dlg.querySelector('.dlg_close_x').onclick = () => attemptClose(null);
        this.dlg.querySelector('.btn_cancel').onclick = () => attemptClose(null);
        this.dlg.addEventListener('cancel', (e) => { e.preventDefault(); attemptClose(null); });
        this.dlg.addEventListener('click', (e) => { if (closeOnOutsideClick && e.target === this.dlg) attemptClose(null); });

        this.dlg.showModal();
        if (onOpen) onOpen(this.dlg);
    });
};
