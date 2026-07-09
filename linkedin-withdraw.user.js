// ==UserScript==
// @name         LinkedIn Withdraw Automation
// @namespace    https://github.com/halimbahae/linkedin-withdraw
// @version      2.0
// @description  Automates withdrawing all LinkedIn sent invitations with auto-scroll
// @author       Bahae Eddine HALIM
// @match        *://*.linkedin.com/mynetwork/invitation-manager/sent/*
// @icon         https://static.licdn.com/sc/h/0gk9l8kq7qkn0f0k0j0k0k0k0
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    console.log("LinkedIn Withdraw Automation started");

    let totalCount = 0;
    let paused = false;
    let running = false;
    const timeoutInterval = 2000;
    const confirmDelay = 1000;
    const scrollDelay = 1500;

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
        btn.innerHTML = '⏸ Pause';
        btn.addEventListener('click', togglePause);
        document.body.appendChild(btn);
        return btn;
    }

    function togglePause() {
        paused = !paused;
        const btn = document.getElementById('li-withdraw-control');
        if (paused) {
            btn.innerHTML = '▶ Resume';
            btn.style.background = '#666';
            console.log('⏸ Withdrawal paused');
        } else {
            btn.innerHTML = '⏸ Pause';
            btn.style.background = '#0a66c2';
            console.log('▶ Withdrawal resumed');
            if (!running) {
                running = true;
                setTimeout(runWithdraw, timeoutInterval);
            }
        }
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
        div.textContent = '✅ Withdrawn: ' + totalCount + ' invitations';
        document.body.appendChild(div);
        setTimeout(function() { div.remove(); }, 5000);
        const btn = document.getElementById('li-withdraw-control');
        if (btn) {
            btn.innerHTML = '✅ Done (' + totalCount + ')';
            btn.style.background = '#057642';
            btn.style.cursor = 'default';
        }
    }

    function findWithdrawButtons() {
        return Array.from(document.querySelectorAll('span'))
            .filter(function(el) { return el.innerText.trim() === 'Withdraw'; });
    }

    function clickConfirmButton() {
        const confirmBtn = Array.from(document.querySelectorAll('button, span'))
            .find(function(el) {
                return el.innerText.trim() === 'Withdraw' && el.offsetParent !== null;
            });
        if (confirmBtn) {
            try {
                confirmBtn.click();
                totalCount++;
                console.log('Confirmed withdrawal #' + totalCount);
                return true;
            } catch (err) {
                console.error('Failed to click confirm:', err);
                return false;
            }
        }
        return false;
    }

    function scrollToLoadAll(callback) {
        console.log('Loading all invitations by scrolling...');
        let lastHeight = document.body.scrollHeight;
        let noChangeCount = 0;
        const maxNoChange = 3;

        function scrollStep() {
            window.scrollTo(0, document.body.scrollHeight);
            setTimeout(function() {
                const newHeight = document.body.scrollHeight;
                if (newHeight === lastHeight) {
                    noChangeCount++;
                } else {
                    noChangeCount = 0;
                    lastHeight = newHeight;
                }
                if (noChangeCount >= maxNoChange) {
                    window.scrollTo(0, 0);
                    setTimeout(callback, 500);
                } else {
                    setTimeout(scrollStep, scrollDelay);
                }
            }, scrollDelay);
        }
        scrollStep();
    }

    function processNext() {
        if (paused) {
            running = false;
            return;
        }

        const buttons = findWithdrawButtons();
        if (buttons.length === 0) {
            console.log('All done! No more withdraw buttons found.');
            running = false;
            showSummary();
            return;
        }

        const button = buttons[0];
        try {
            button.click();
            console.log('Clicked initial Withdraw button');
        } catch (err) {
            console.error('Failed to click initial button:', err);
        }

        setTimeout(function() {
            if (paused) {
                running = false;
                return;
            }
            if (clickConfirmButton()) {
                console.log('Clicked confirm in modal');
            } else {
                console.log('Confirm button not found, maybe already processed');
            }
            setTimeout(processNext, timeoutInterval);
        }, confirmDelay);
    }

    function runWithdraw() {
        if (paused || running) return;
        running = true;
        scrollToLoadAll(function() {
            console.log('All invitations loaded. Starting withdrawal...');
            processNext();
        });
    }

    function init() {
        createControlButton();
        setTimeout(runWithdraw, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
