
const DialogUtil = {
    dragStart(e, dlg) {
        const header = e.target.closest('.ontoy-dlg-header, .dlg-header');
        if (!header || e.target.closest('button, input, select')) return;
        e.preventDefault();
        const rect = dlg.getBoundingClientRect();
        const offset = { x: e.clientX - rect.left, y: e.clientY - rect.top };

        const move = (m) => {
            const x = Math.max(0, Math.min(m.clientX - offset.x, window.innerWidth - rect.width));
            const y = Math.max(0, Math.min(m.clientY - offset.y, window.innerHeight - rect.height));
            dlg.style.left = (x + rect.width / 2) + "px";
            dlg.style.top = (y + rect.height / 2) + "px";
        };

        const stop = () => {
            document.removeEventListener('pointermove', move);
            document.removeEventListener('pointerup', stop);
        };

        document.addEventListener('pointermove', move);
        document.addEventListener('pointerup', stop);
    },

    async alert(message, title = "Información", type = "info") {
        const icons = { info: "ℹ️", warning: "⚠️", error: "❌", success: "✅" };
        const dlg = document.createElement('dialog');
        dlg.className = 'ontoy-dlg';
        dlg.innerHTML = `
            <header class="ontoy-dlg-header">
                <b>${title}</b>
                <button type="button" class="ontoy-dlg-close" aria-label="Cerrar">&times;</button>
            </header>
            <div class="ontoy-dlg-content" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${icons[type] || icons.info}</div>
                <div>${message}</div>
            </div>
            <footer class="ontoy-dlg-footer">
                <button type="button" class="ontoy-btn ontoy-btn-primary btn-ok">Aceptar</button>
            </footer>
        `;
        document.body.appendChild(dlg);

        return new Promise(resolve => {
            const cleanup = () => {
                dlg.removeEventListener('pointerdown', handler);
                dlg.close();
                dlg.remove();
                resolve();
            };
            const handler = (e) => this.dragStart(e, dlg);
            dlg.addEventListener('pointerdown', handler);
            dlg.querySelector('.btn-ok').onclick = cleanup;
            dlg.querySelector('.ontoy-dlg-close').onclick = cleanup;
            dlg.addEventListener('cancel', (e) => { e.preventDefault(); cleanup(); });
            dlg.showModal();
        });
    },

    async confirm(message, title = "Confirmar", type = "question") {
        const icons = { question: "❓", warning: "⚠️", info: "ℹ️" };
        const dlg = document.createElement('dialog');
        dlg.className = 'ontoy-dlg';
        dlg.innerHTML = `
            <header class="ontoy-dlg-header">
                <b>${title}</b>
                <button type="button" class="ontoy-dlg-close" aria-label="Cerrar">&times;</button>
            </header>
            <div class="ontoy-dlg-content" style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">${icons[type] || icons.question}</div>
                <div>${message}</div>
            </div>
            <footer class="ontoy-dlg-footer">
                <button type="button" class="ontoy-btn ontoy-btn-secondary btn-no">Cancelar</button>
                <button type="button" class="ontoy-btn ontoy-btn-primary btn-yes">Aceptar</button>
            </footer>
        `;
        document.body.appendChild(dlg);

        return new Promise((resolve) => {
            const cleanup = (result) => {
                dlg.removeEventListener('pointerdown', handler);
                dlg.close();
                dlg.remove();
                resolve(result);
            };
            const handler = (e) => this.dragStart(e, dlg);
            dlg.addEventListener('pointerdown', handler);
            dlg.querySelector('.btn-yes').onclick = () => cleanup(true);
            dlg.querySelector('.btn-no').onclick = () => cleanup(false);
            dlg.querySelector('.ontoy-dlg-close').onclick = () => cleanup(false);
            dlg.addEventListener('cancel', (e) => { e.preventDefault(); cleanup(false); });
            dlg.showModal();
        });
    }
};
