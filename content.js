(function() {
    'use strict';

    console.log('[LI-Withdraw] LinkedIn Withdraw Automation v3.0 started');

    let totalCount = 0;
    let processedCount = 0;
    let paused = false;
    let running = false;
    let cancelled = false;
    const timeoutInterval = 2000;
    const confirmDelay = 1000;
    const scrollDelay = 1500;

    function getScrollContainer() {
        const containers = [
            document.querySelector('.scaffold-finite-scroll__content'),
            document.querySelector('.invitation-manager__invitation-list'),
            document.querySelector('[data-scroll-container]')
        ];
        return containers.find(function(el) { return el; }) || document.documentElement;
    }

    function createControlButton() {
        const btn = document.createElement('div');
        btn.id = 'li-withdraw-control';
        btn.style.cssText = [
            'position: fixed',
            'top: 80px',
            'right: 20px',
            'z-index: 9999',
            'background: #0a66c2',
            'color: white',
            'padding: 10px 16px',
            'border-radius: 24px',
            'font-family: Arial, sans-serif',
            'font-size: 14px',
            'cursor: pointer',
            'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
            'user-select: none',
            'display: flex',
            'align-items: center',
            'gap: 8px'
        ].join('; ');
        btn.innerHTML = '\u23F8 Pause';
        btn.addEventListener('click', togglePause);
        document.body.appendChild(btn);
        return btn;
    }

    function createCancelButton() {
        const existing = document.getElementById('li-withdraw-cancel');
        if (existing) return existing;
        const btn = document.createElement('div');
        btn.id = 'li-withdraw-cancel';
        btn.textContent = '\u2716 Cancel';
        btn.style.cssText = [
            'position: fixed',
            'top: 130px',
            'right: 20px',
            'z-index: 9999',
            'background: #b32400',
            'color: white',
            'padding: 10px 16px',
            'border-radius: 24px',
            'font-family: Arial, sans-serif',
            'font-size: 14px',
            'cursor: pointer',
            'box-shadow: 0 2px 8px rgba(0,0,0,0.3)',
            'user-select: none',
            'display: flex',
            'align-items: center',
            'gap: 8px'
        ].join('; ');
        btn.addEventListener('click', cancelWithdraw);
        document.body.appendChild(btn);
        return btn;
    }

    function updateControlLabel() {
        const btn = document.getElementById('li-withdraw-control');
        if (!btn) return;
        if (paused) {
            btn.innerHTML = '\u25B6 Resume (' + processedCount + ')';
            btn.style.background = '#666';
        } else if (running) {
            btn.innerHTML = '\u23F8 Withdrawing (' + processedCount + ')';
            btn.style.background = '#0a66c2';
        } else {
            btn.innerHTML = '\u23F8 Pause';
            btn.style.background = '#0a66c2';
        }
    }

    function togglePause() {
        if (cancelled) return;
        paused = !paused;
        updateControlLabel();
        if (paused) {
            console.log('[LI-Withdraw] Paused at ' + processedCount + ' withdrawn');
        } else {
            console.log('[LI-Withdraw] Resumed');
            if (!running) {
                running = true;
                setTimeout(processNext, timeoutInterval);
            }
        }
    }

    function cancelWithdraw() {
        cancelled = true;
        paused = false;
        running = false;
        console.log('[LI-Withdraw] Cancelled by user. Total withdrawn: ' + totalCount);
        const control = document.getElementById('li-withdraw-control');
        if (control) {
            control.innerHTML = '\u2716 Cancelled (' + totalCount + ')';
            control.style.background = '#b32400';
            control.style.cursor = 'default';
            control.removeEventListener('click', togglePause);
        }
        const cancelBtn = document.getElementById('li-withdraw-cancel');
        if (cancelBtn) cancelBtn.remove();
    }

    function showSummary() {
        const existing = document.getElementById('li-withdraw-summary');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.id = 'li-withdraw-summary';
        div.style.cssText = [
            'position: fixed',
            'bottom: 20px',
            'right: 20px',
            'z-index: 9999',
            'background: #057642',
            'color: white',
            'padding: 16px 24px',
            'border-radius: 12px',
            'font-family: Arial, sans-serif',
            'font-size: 16px',
            'box-shadow: 0 4px 16px rgba(0,0,0,0.3)'
        ].join('; ');
        div.textContent = 'Withdrawn: ' + totalCount + ' invitations';
        document.body.appendChild(div);
        setTimeout(function() { div.remove(); }, 5000);
        const btn = document.getElementById('li-withdraw-control');
        if (btn) {
            btn.innerHTML = 'Done (' + totalCount + ')';
            btn.style.background = '#057642';
            btn.style.cursor = 'default';
            btn.removeEventListener('click', togglePause);
        }
        const cancelBtn = document.getElementById('li-withdraw-cancel');
        if (cancelBtn) cancelBtn.remove();
    }

    function findWithdrawButtons() {
        const cards = document.querySelectorAll(
            'li.invitation-card, ' +
            '[data-anonymize="invitation"], ' +
            '.invitation-manager__invitation-list > li, ' +
            '.mn-invitation-list__item'
        );
        if (cards.length > 0) {
            var buttons = [];
            cards.forEach(function(card) {
                var spans = card.querySelectorAll('span');
                spans.forEach(function(span) {
                    if (span.innerText.trim() === 'Withdraw' && span.offsetParent !== null) {
                        buttons.push(span);
                    }
                });
            });
            if (buttons.length > 0) return buttons;
        }
        var main = document.querySelector('main') || document.body;
        return Array.from(main.querySelectorAll('span'))
            .filter(function(el) {
                return el.innerText.trim() === 'Withdraw' && el.offsetParent !== null;
            });
    }

    function clickConfirmButton() {
        var dialog = document.querySelector(
            'div[role="dialog"], ' +
            '.artdeco-modal, ' +
            '.confirmation-dialog'
        );
        var scope = dialog || document.body;
        var confirmBtn = Array.from(scope.querySelectorAll('button, span'))
            .find(function(el) {
                return el.innerText.trim() === 'Withdraw' && el.offsetParent !== null;
            });
        if (confirmBtn) {
            try {
                confirmBtn.click();
                totalCount++;
                processedCount++;
                console.log('[LI-Withdraw] Confirmed withdrawal #' + totalCount);
                updateControlLabel();
                return true;
            } catch (err) {
                console.error('[LI-Withdraw] Failed to click confirm:', err);
                return false;
            }
        }
        return false;
    }

    function scrollToLoadAll(callback) {
        console.log('[LI-Withdraw] Loading all invitations by scrolling...');
        var container = getScrollContainer();
        var lastHeight = container.scrollHeight;
        var noChangeCount = 0;
        var maxNoChange = 3;

        function scrollStep() {
            container.scrollTop = container.scrollHeight;
            setTimeout(function() {
                var newHeight = container.scrollHeight;
                if (newHeight === lastHeight) {
                    noChangeCount++;
                } else {
                    noChangeCount = 0;
                    lastHeight = newHeight;
                }
                if (noChangeCount >= maxNoChange) {
                    container.scrollTop = 0;
                    setTimeout(callback, 500);
                } else {
                    setTimeout(scrollStep, scrollDelay);
                }
            }, scrollDelay);
        }
        scrollStep();
    }

    function processNext() {
        if (paused || cancelled) {
            running = false;
            return;
        }

        var buttons = findWithdrawButtons();
        if (buttons.length === 0) {
            console.log('[LI-Withdraw] All done! No more withdraw buttons found.');
            running = false;
            showSummary();
            return;
        }

        var button = buttons[0];
        try {
            button.click();
            console.log('[LI-Withdraw] Clicked Withdraw button');
        } catch (err) {
            console.error('[LI-Withdraw] Failed to click button:', err);
        }

        setTimeout(function() {
            if (paused || cancelled) {
                running = false;
                return;
            }
            if (clickConfirmButton()) {
                console.log('[LI-Withdraw] Confirmed in modal');
            } else {
                console.log('[LI-Withdraw] Confirm button not found, skipping');
            }
            setTimeout(processNext, timeoutInterval);
        }, confirmDelay);
    }

    function runWithdraw() {
        if (paused || running || cancelled) return;
        running = true;
        createCancelButton();
        updateControlLabel();
        scrollToLoadAll(function() {
            console.log('[LI-Withdraw] All invitations loaded. Starting withdrawal...');
            processNext();
        });
    }

    function init() {
        console.log('[LI-Withdraw] Initializing...');
        createControlButton();
        setTimeout(runWithdraw, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
