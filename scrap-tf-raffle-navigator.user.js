// ==UserScript==
// @name        Scrap.tf Raffle Navigator
// @namespace   VioletMonkeyScripts
// @match       https://scrap.tf/raffles
// @match       https://scrap.tf/raffles/*
// @grant       none
// @version     3.2
// @author      Your Name
// @description Navigates to un-entered raffles on Scrap.tf for manual entry (Enhanced with professional bot techniques)
// ==/UserScript==

    (function() {
        'use strict';

        console.log("Scrap.tf Raffle Navigator script started. Version 3.2 - Enhanced entry detection");

        // Helper function to wait
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // Helper function to check if element is actually visible (professional bot technique)
        function isElementVisible(element) {
            if (!element) return false;
            
            // Check computed styles
            const style = window.getComputedStyle(element);
            
            // Basic visibility checks
            if (style.display === 'none' || 
                style.visibility === 'hidden' || 
                style.opacity === '0') {
                return false;
            }
            
            // Check dimensions
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                return false;
            }
            
            // Check if element is positioned off-screen
            if (rect.top < -1000 || rect.left < -1000) {
                return false;
            }
            
            return true;
        }

        // Function to get raffle ID from URL (6 character code)
        function getRaffleId(url) {
            const match = url.match(/\/raffles\/([A-Za-z0-9]{6})/);
            return match ? match[1] : null;
        }

        // Function to highlight the Enter Raffle button and show instructions
        function highlightEnterButton() {
            console.log("Looking for Enter Raffle button to highlight...");

            // Wait for page to load
            setTimeout(() => {
                // Check for CAPTCHA or errors with more comprehensive detection
                const captcha = document.querySelector('[id*="captcha"], [class*="captcha"], #turnstile-container, .cf-turnstile, .h-captcha, .g-recaptcha, [data-captcha], iframe[src*="captcha"], iframe[src*="turnstile"]');
                
                // Also check for common CAPTCHA text indicators
                const captchaText = document.body.innerText.toLowerCase();
                const hasCaptchaText = captchaText.includes('captcha') || 
                                    captchaText.includes('verify') || 
                                    captchaText.includes('robot') ||
                                    captchaText.includes('challenge');
                
                if ((captcha && isElementVisible(captcha)) || hasCaptchaText) {
                    console.log("⚠️ CAPTCHA detected");
                    showNotification("CAPTCHA detected! Complete it first, then the script will continue automatically.", "warning");
                    
                    // Keep checking for CAPTCHA completion
                    const checkCaptchaInterval = setInterval(() => {
                        const captchaStillPresent = document.querySelector('[id*="captcha"], [class*="captcha"], #turnstile-container, .cf-turnstile, .h-captcha, .g-recaptcha');
                        if (!captchaStillPresent || !isElementVisible(captchaStillPresent)) {
                            clearInterval(checkCaptchaInterval);
                            console.log("✅ CAPTCHA appears to be completed");
                            showNotification("CAPTCHA completed! Looking for Enter button...", "success");
                            // Recursively call this function to find the button
                            setTimeout(() => highlightEnterButton(), 1000);
                        }
                    }, 2000);
                    
                    return;
                }            // Enhanced already-entered detection using professional techniques
            const pageText = document.body.textContent.toLowerCase();
            const pageHTML = document.body.innerHTML.toLowerCase();
            
            // Professional bot detection patterns
            const enteredPatterns = [
                'you have entered this raffle',
                'already entered',
                'you are in this raffle',
                'raffle entered',
                'leave this raffle',
                'withdraw from raffle',
                'data-time="raffle ended"',
                'raffle has ended',
                'this raffle has ended'
            ];
            
            for (let pattern of enteredPatterns) {
                if (pageText.includes(pattern) || pageHTML.includes(pattern)) {
                    console.log(`⚠️ Already entered or ended: detected "${pattern}"`);
                    showNotification("Already entered or raffle ended! Moving to next...", "info");
                    setTimeout(() => {
                        if (isProcessing) {
                            continueToNextRaffle();
                        }
                    }, 2000);
                    return;
                }
            }            // Enhanced button detection using professional bot techniques - PRIORITIZE VISIBLE BUTTONS
            let enterButton = null;
            
            // Method 1: Professional bot approach - look for enter-raffle-btns class (CHECK VISIBILITY)
            const enterButtonCandidates = document.querySelectorAll('.enter-raffle-btns button, .enter-raffle-btns input[type="submit"]');
            for (let btn of enterButtonCandidates) {
                if (isElementVisible(btn) && !btn.disabled) {
                    enterButton = btn;
                    console.log(`Found visible enter button in .enter-raffle-btns: ${btn.textContent}`);
                    break;
                }
            }
            
            // Method 2: Look for buttons with specific onclick handlers (CHECK VISIBILITY)
            if (!enterButton) {
                const onclickButtons = document.querySelectorAll('button[onclick*="EnterRaffle"], button[onclick*="raffle"], input[onclick*="EnterRaffle"]');
                for (let btn of onclickButtons) {
                    if (isElementVisible(btn) && !btn.disabled) {
                        enterButton = btn;
                        console.log(`Found visible enter button via onclick: ${btn.onclick}`);
                        break;
                    }
                }
            }
            
            // Method 3: Enhanced text-based search (CHECK VISIBILITY FIRST)
            if (!enterButton) {
                const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
                for (let btn of allButtons) {
                    // Skip if not visible or disabled
                    if (!isElementVisible(btn) || btn.disabled) continue;
                    
                    const text = (btn.textContent || btn.value || '').toLowerCase();
                    const className = btn.className.toLowerCase();
                    const id = btn.id.toLowerCase();
                    
                    // Enhanced text patterns from professional analysis
                    if (text.includes('enter raffle') || text.includes('join raffle') ||
                        text.includes('enter this raffle') || text === 'enter' ||
                        className.includes('enter') || className.includes('join') ||
                        id.includes('raffle-enter') || id.includes('enter')) {
                        enterButton = btn;
                        console.log(`Found visible enter button via text/class/id: "${text}" / "${className}" / "${id}"`);
                        break;
                    }
                }
            }
            
            // Method 4: Look in raffle entry containers (CHECK VISIBILITY)
            if (!enterButton) {
                const containers = document.querySelectorAll(
                    '.enter-raffle-btns, .raffle-buttons, .raffle-actions, .panel-body, .raffle-content, ' +
                    '[class*="raffle"][class*="button"], [class*="entry"]'
                );
                
                for (let container of containers) {
                    const buttons = container.querySelectorAll('button, input[type="submit"]');
                    for (let btn of buttons) {
                        if (isElementVisible(btn) && !btn.disabled) {
                            enterButton = btn;
                            console.log(`Found visible button in container: ${container.className}`);
                            break;
                        }
                    }
                    if (enterButton) break;
                }
            }
            
            // Method 5: Fallback - any visible button in enter-raffle-btns area (even divs)
            if (!enterButton) {
                const enterArea = document.querySelector('.enter-raffle-btns');
                if (enterArea) {
                    // Look for any clickable element that's visible
                    const clickables = enterArea.querySelectorAll('button, input, div[onclick], a[onclick], span[onclick]');
                    for (let elem of clickables) {
                        if (isElementVisible(elem) && !elem.disabled) {
                            enterButton = elem;
                            console.log(`Found fallback clickable element: ${elem.tagName} - ${elem.textContent || elem.innerHTML}`);
                            break;
                        }
                    }
                }
            }

                if (!enterButton) {
                    console.log("❌ No enter button found - might be already entered or raffle ended");
                    showNotification("No enter button found! Moving to next raffle...", "warning");
                    setTimeout(() => {
                        if (isProcessing) {
                            continueToNextRaffle();
                        }
                    }, 3000);
                    return;
                }

                // Final validation - ensure button is still visible before highlighting
                if (!isElementVisible(enterButton)) {
                    console.log("❌ Found button is not visible - searching for another...");
                    // Try once more with any visible button in the area
                    const anyVisibleBtn = document.querySelector('.enter-raffle-btns button, .enter-raffle-btns input, .enter-raffle-btns div[onclick]');
                    if (anyVisibleBtn && isElementVisible(anyVisibleBtn)) {
                        enterButton = anyVisibleBtn;
                        console.log("✅ Found alternative visible button");
                    } else {
                        showNotification("Enter button exists but is not visible! Moving to next raffle...", "warning");
                        setTimeout(() => {
                            if (isProcessing) {
                                continueToNextRaffle();
                            }
                        }, 3000);
                        return;
                    }
                }

                console.log(`✅ Found visible Enter button: ${enterButton.tagName} with text: "${enterButton.textContent || enterButton.value}"`);

                // Highlight the button
                enterButton.style.cssText = `
                    border: 3px solid #ff4444 !important;
                    box-shadow: 0 0 15px #ff4444 !important;
                    animation: pulse 1s infinite !important;
                    background-color: #ff4444 !important;
                    color: white !important;
                `;

                // Add pulse animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes pulse {
                        0% { box-shadow: 0 0 15px #ff4444; }
                        50% { box-shadow: 0 0 25px #ff4444, 0 0 35px #ff4444; }
                        100% { box-shadow: 0 0 15px #ff4444; }
                    }
                `;
                document.head.appendChild(style);

                console.log("🎯 Enter button highlighted!");
                showNotification("Click the highlighted button to enter this raffle!", "info");

                // Add click listener to the button to detect when it's clicked
                enterButton.addEventListener('click', function() {
                    console.log("🖱️ Enter button clicked! Starting entry monitoring...");
                    showNotification("Button clicked! Monitoring for entry success...", "info");
                    
                    // Start monitoring immediately after click
                    monitorRaffleEntry();
                    
                    // Also set a backup timer in case detection fails
                    setTimeout(() => {
                        console.log("⏰ Backup timer: Checking for entry success...");
                        checkForEntrySuccess();
                    }, 3000);
                });

                // Also start general monitoring in case user clicks manually
                monitorRaffleEntry();
                
            }, 2000);
        }

        // Function to show notifications
        function showNotification(message, type = "info") {
            // Remove existing notification
            const existing = document.getElementById('raffle-notification');
            if (existing) existing.remove();

            const notification = document.createElement('div');
            notification.id = 'raffle-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                font-size: 14px;
                z-index: 10000;
                max-width: 300px;
                ${type === 'success' ? 'background-color: #28a745;' : ''}
                ${type === 'error' ? 'background-color: #dc3545;' : ''}
                ${type === 'warning' ? 'background-color: #ffc107; color: black;' : ''}
                ${type === 'info' ? 'background-color: #17a2b8;' : ''}
            `;
            notification.textContent = message;
            document.body.appendChild(notification);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }

    // Function to get all raffle links from the main page
    function getRaffleLinks() {
        const links = [];
        
        // Professional approach: Use the same selectors as Scraps bot
        // Look for raffle panels that DON'T have the 'raffle-entered' class
        const raffleElements = document.querySelectorAll('.panel-raffle:not(.raffle-entered)');
        console.log(`Found ${raffleElements.length} non-entered raffle panels using professional selector`);
        
        if (raffleElements.length === 0) {
            // Fallback: Use alternative selectors
            const fallbackSelectors = [
                '.panel-raffle',
                'div.raffle-name a[href^="/raffles/"]',
                'a[href^="/raffles/"]'
            ];
            
            for (let selector of fallbackSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`Using fallback selector: ${selector} (${elements.length} found)`);
                    
                    if (selector === '.panel-raffle') {
                        // Filter out entered ones manually
                        elements.forEach(panel => {
                            if (!panel.classList.contains('raffle-entered')) {
                                raffleElements.push(panel);
                            }
                        });
                    } else {
                        raffleElements.push(...elements);
                    }
                    break;
                }
            }
        }
        
        if (raffleElements.length === 0) {
            console.log("No raffle elements found with any selector");
            return [];
        }
        
        raffleElements.forEach((element, index) => {
            let raffleLink = null;
            
            // Different ways to extract raffle link depending on element type
            if (element.classList?.contains('panel-raffle')) {
                // This is a raffle panel, find the link inside it
                raffleLink = element.querySelector('a[href^="/raffles/"]');
            } else if (element.tagName === 'A' && element.href) {
                // This is already a link
                raffleLink = element;
            }
            
            if (raffleLink && raffleLink.href) {
                const raffleId = getRaffleId(raffleLink.href);
                if (raffleId && raffleId.length === 6) {
                    // Enhanced entry detection using multiple methods
                    let isAlreadyEntered = false;
                    let entryReason = '';
                    
                    // Method 1: Check for raffle-entered class (most reliable)
                    const panel = element.classList?.contains('panel-raffle') ? element : 
                                 raffleLink.closest('.panel-raffle, .panel, [class*="raffle"]');
                    
                    if (panel?.classList?.contains('raffle-entered')) {
                        isAlreadyEntered = true;
                        entryReason = 'has raffle-entered class';
                    }
                    
                    // Method 2: Check for entry indicators in panel content
                    if (!isAlreadyEntered && panel) {
                        const panelText = panel.textContent.toLowerCase();
                        const panelHTML = panel.innerHTML.toLowerCase();
                        
                        // Enhanced keyword detection from professional bots
                        const enteredKeywords = [
                            'raffle entered', 'you have entered', 'already entered',
                            'entered this raffle', 'leave raffle', 'withdraw from raffle',
                            'you are in this raffle', 'participating', 'joined'
                        ];
                        
                        for (let keyword of enteredKeywords) {
                            if (panelText.includes(keyword) || panelHTML.includes(keyword)) {
                                isAlreadyEntered = true;
                                entryReason = `contains "${keyword}"`;
                                break;
                            }
                        }
                        
                        // Method 3: Check for entry buttons vs leave buttons
                        if (!isAlreadyEntered) {
                            const buttons = panel.querySelectorAll('button, input[type="submit"], .btn, .enter-raffle-btns');
                            for (let btn of buttons) {
                                const btnText = (btn.textContent || btn.value || '').toLowerCase();
                                const btnClass = btn.className.toLowerCase();
                                
                                if (btnText.includes('leave') || btnText.includes('withdraw') || 
                                    btnClass.includes('leave') || btnClass.includes('withdraw')) {
                                    isAlreadyEntered = true;
                                    entryReason = `has leave/withdraw button: "${btnText}"`;
                                    break;
                                }
                            }
                        }
                        
                        // Method 4: Check for success indicators (from Scraps bot approach)
                        if (!isAlreadyEntered) {
                            const successSelectors = [
                                '.text-success', '.alert-success', '.raffle-entered',
                                '[class*="success"]', '[class*="entered"]'
                            ];
                            
                            for (let selector of successSelectors) {
                                if (panel.querySelector(selector)) {
                                    isAlreadyEntered = true;
                                    entryReason = `found success indicator: ${selector}`;
                                    break;
                                }
                            }
                        }
                        
                        // Method 5: Check for raffle end indicators
                        if (!isAlreadyEntered) {
                            if (panelText.includes('raffle ended') || panelText.includes('raffle has ended') ||
                                panelHTML.includes('data-time="raffle ended"')) {
                                isAlreadyEntered = true;
                                entryReason = 'raffle has ended';
                            }
                        }
                    }
                    
                    if (isAlreadyEntered) {
                        console.log(`❌ Skipping raffle: ${raffleLink.href} (${entryReason})`);
                    } else {
                        // Additional validation: Check if URL is properly formatted
                        if (raffleLink.href.includes('/raffles/') && raffleId.match(/^[A-Z0-9]{6}$/)) {
                            links.push(raffleLink.href);
                            console.log(`✅ Added raffle ${links.length}: ${raffleLink.href} (ID: ${raffleId})`);
                        } else {
                            console.log(`⚠️ Invalid raffle format: ${raffleLink.href}`);
                        }
                    }
                }
            }
        });

        console.log(`📊 Total valid raffles to visit: ${links.length}`);
        return [...new Set(links)]; // Remove duplicates
    }

        // Variables to track progress
        let raffleQueue = [];
        let currentRaffleIndex = 0;
        let isProcessing = false;

        // Function to continue to next raffle
        function continueToNextRaffle() {
            if (!isProcessing) return;
            
            currentRaffleIndex++;
            
            if (currentRaffleIndex < raffleQueue.length) {
                const nextRaffleUrl = raffleQueue[currentRaffleIndex];
                const raffleId = getRaffleId(nextRaffleUrl);
                
                console.log(`\n--- Moving to raffle ${currentRaffleIndex + 1}/${raffleQueue.length} ---`);
                console.log(`Raffle ID: ${raffleId}`);
                console.log(`URL: ${nextRaffleUrl}`);
                
                showNotification(`Moving to raffle ${currentRaffleIndex + 1}/${raffleQueue.length}...`, "info");
                
                setTimeout(() => {
                    window.location.href = nextRaffleUrl;
                }, 1000);
            } else {
                console.log(`\n🎉 FINISHED! Processed all ${raffleQueue.length} raffles`);
                showNotification("All raffles processed! Returning to main page...", "success");
                isProcessing = false;
                
                setTimeout(() => {
                    window.location.href = "https://scrap.tf/raffles";
                }, 3000);
            }
        }

        // Function to process all raffles (navigate to each one)
        async function processAllRaffles() {
            console.log("Scanning for raffles on main page...");
            showNotification("Scanning for raffles...", "info");

            // Wait for page to load
            await sleep(3000);

            raffleQueue = getRaffleLinks();
            console.log(`Found ${raffleQueue.length} raffles to process`);

            if (raffleQueue.length === 0) {
                console.log("No raffles found on the page");
                showNotification("No raffles found!", "warning");
                return;
            }

            // Start processing
            isProcessing = true;
            currentRaffleIndex = 0;

            const firstRaffleUrl = raffleQueue[currentRaffleIndex];
            const raffleId = getRaffleId(firstRaffleUrl);

            console.log(`\n--- Starting with raffle ${currentRaffleIndex + 1}/${raffleQueue.length} ---`);
            console.log(`Raffle ID: ${raffleId}`);
            console.log(`URL: ${firstRaffleUrl}`);
            
            showNotification(`Starting navigation! Going to raffle 1/${raffleQueue.length}`, "info");
            
            setTimeout(() => {
                window.location.href = firstRaffleUrl;
            }, 2000);
        }

        // Function to add control panel
        function addControlPanel() {
            const panel = document.createElement('div');
            panel.id = 'raffle-control-panel';
            panel.style.cssText = `
                position: fixed;
                top: 20px;
                left: 20px;
                background: #333;
                color: white;
                padding: 15px;
                border-radius: 5px;
                z-index: 10000;
                font-family: Arial, sans-serif;
                font-size: 12px;
                min-width: 200px;
            `;
            
            const currentPath = window.location.pathname;
            
            if (currentPath === '/raffles' || currentPath === '/raffles/') {
                panel.innerHTML = `
                    <h4 style="margin: 0 0 10px 0;">Raffle Navigator</h4>
                    <button id="start-navigation" style="padding: 8px 12px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
                        Start Navigation
                    </button>
                    <p style="margin: 10px 0 0 0; font-size: 11px;">Click to start navigating through un-entered raffles</p>
                `;
                
                document.body.appendChild(panel);
                
                document.getElementById('start-navigation').addEventListener('click', () => {
                    processAllRaffles();
                    panel.remove();
                });
            } else if (currentPath.startsWith('/raffles/') && currentPath.length > 9) {
                panel.innerHTML = `
                    <h4 style="margin: 0 0 10px 0;">Raffle Navigator</h4>
                    <p style="margin: 0 0 10px 0; font-size: 11px;">On individual raffle page</p>
                    <button id="skip-raffle" style="padding: 5px 10px; background: #6c757d; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px;">
                        Skip This Raffle
                    </button>
                    <button id="back-to-main" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 11px; margin-left: 5px;">
                        Back to Main
                    </button>
                `;
                
                document.body.appendChild(panel);
                
                document.getElementById('skip-raffle').addEventListener('click', () => {
                    if (isProcessing) {
                        continueToNextRaffle();
                    } else {
                        showNotification("Not in navigation mode", "warning");
                    }
                });
                
                document.getElementById('back-to-main').addEventListener('click', () => {
                    isProcessing = false;
                    window.location.href = "https://scrap.tf/raffles";
                });
            }
        }

        // Function to start the process
        function startRaffleNavigator() {
            const currentPath = window.location.pathname;
            
            if (currentPath === '/raffles' || currentPath === '/raffles/') {
                console.log("📍 On main raffles page - ready to start navigation");
                addControlPanel();
            } else if (currentPath.startsWith('/raffles/') && currentPath.length > 9) {
                console.log("📍 On individual raffle page - highlighting enter button");
                addControlPanel();
                highlightEnterButton();
            } else {
                console.log("📍 Not on a supported scrap.tf page");
            }
        }

    // Function to manually check for entry success indicators
    function checkForEntrySuccess() {
        console.log("🔍 Manually checking for entry success indicators...");
        
        // Method 1: Check for success messages in the page
        const successIndicators = [
            '.alert-success',
            '.text-success', 
            '.raffle-entered-msg',
            '[class*="success"]',
            '.alert.alert-info',
            '.notification'
        ];
        
        for (let selector of successIndicators) {
            const elements = document.querySelectorAll(selector);
            for (let elem of elements) {
                if (isElementVisible(elem)) {
                    const text = elem.textContent.toLowerCase();
                    if (text.includes('entered') || text.includes('success') || text.includes('joined')) {
                        console.log(`✅ Entry success detected via ${selector}: ${text}`);
                        showNotification("Entry success detected! Moving to next raffle...", "success");
                        setTimeout(() => {
                            if (isProcessing) {
                                continueToNextRaffle();
                            }
                        }, 1500);
                        return true;
                    }
                }
            }
        }
        
        // Method 2: Check if the Enter button has changed or disappeared
        const enterBtns = document.querySelectorAll('.enter-raffle-btns button');
        let hasVisibleEnterBtn = false;
        for (let btn of enterBtns) {
            if (isElementVisible(btn) && btn.textContent.toLowerCase().includes('enter')) {
                hasVisibleEnterBtn = true;
                break;
            }
        }
        
        if (!hasVisibleEnterBtn) {
            console.log("✅ Enter button disappeared - assuming entry success");
            showNotification("Enter button changed! Moving to next raffle...", "success");
            setTimeout(() => {
                if (isProcessing) {
                    continueToNextRaffle();
                }
            }, 1500);
            return true;
        }
        
        // Method 3: Check for "Leave Raffle" button (indicates already entered)
        const leaveBtns = document.querySelectorAll('button, input');
        for (let btn of leaveBtns) {
            if (isElementVisible(btn)) {
                const text = btn.textContent.toLowerCase();
                if (text.includes('leave') || text.includes('withdraw')) {
                    console.log("✅ Leave button found - entry successful");
                    showNotification("Leave button detected! Moving to next raffle...", "success");
                    setTimeout(() => {
                        if (isProcessing) {
                            continueToNextRaffle();
                        }
                    }, 1500);
                    return true;
                }
            }
        }
        
        // Method 4: Check if raffle-entered class was added to body or container
        const containers = document.querySelectorAll('.well, .raffle-well, .container, body');
        for (let container of containers) {
            if (container.classList.contains('raffle-entered') || 
                container.innerHTML.toLowerCase().includes('raffle-entered')) {
                console.log("✅ Raffle-entered class detected");
                showNotification("Entry class detected! Moving to next raffle...", "success");
                setTimeout(() => {
                    if (isProcessing) {
                        continueToNextRaffle();
                    }
                }, 1500);
                return true;
            }
        }
        
        console.log("❌ No entry success indicators found");
        return false;
    }

    // Enhanced raffle entry monitoring using professional bot techniques
    function monitorRaffleEntry() {
        console.log("Starting enhanced raffle entry monitoring...");
        
        // Method 1: Monitor ScrapTF JavaScript functions (most reliable)
        monitorScrapTFFunctions();
        
        // Method 2: Monitor for AJAX responses (professional approach)
        monitorAjaxResponses();
        
        // Method 3: Monitor DOM changes (fallback)
        monitorDOMChanges();
        
        // Method 4: Monitor URL changes (backup)
        monitorUrlChanges();
        
        // Method 5: Periodic checking (aggressive backup)
        startPeriodicChecking();
    }
    
    // Start periodic checking for entry success
    function startPeriodicChecking() {
        let checkCount = 0;
        const maxChecks = 20; // Check for 20 seconds
        
        const periodicCheck = setInterval(() => {
            checkCount++;
            console.log(`🔄 Periodic check ${checkCount}/${maxChecks} for entry success...`);
            
            if (checkForEntrySuccess()) {
                clearInterval(periodicCheck);
                return;
            }
            
            if (checkCount >= maxChecks) {
                console.log("⏰ Periodic checking timed out - moving to next raffle");
                showNotification("Entry detection timed out. Moving to next raffle...", "warning");
                clearInterval(periodicCheck);
                
                setTimeout(() => {
                    if (isProcessing) {
                        continueToNextRaffle();
                    }
                }, 1000);
            }
        }, 1000); // Check every second
        
        console.log("✅ Periodic checking enabled");
    }
    
    // Monitor ScrapTF's internal JavaScript functions
    function monitorScrapTFFunctions() {
        // Override ScrapTF.Raffles.LeaveRaffle function (if it exists)
        if (window.ScrapTF && window.ScrapTF.Raffles && window.ScrapTF.Raffles.LeaveRaffle) {
            const originalLeaveRaffle = window.ScrapTF.Raffles.LeaveRaffle;
            
            window.ScrapTF.Raffles.LeaveRaffle = function(raffleId) {
                console.log(`✅ ScrapTF.Raffles.LeaveRaffle called with ID: ${raffleId}`);
                showNotification("Raffle entered successfully! Moving to next raffle...", "success");
                
                const result = originalLeaveRaffle.apply(this, arguments);
                
                setTimeout(() => {
                    if (isProcessing) {
                        continueToNextRaffle();
                    }
                }, 1500);
                
                return result;
            };
            
            console.log("✅ ScrapTF.Raffles.LeaveRaffle intercepted");
        }
        
        // Also monitor for EnterRaffle function calls
        if (window.ScrapTF && window.ScrapTF.Raffles && window.ScrapTF.Raffles.EnterRaffle) {
            const originalEnterRaffle = window.ScrapTF.Raffles.EnterRaffle;
            
            window.ScrapTF.Raffles.EnterRaffle = function(raffleId, hash) {
                console.log(`✅ ScrapTF.Raffles.EnterRaffle called with ID: ${raffleId}, Hash: ${hash}`);
                
                const result = originalEnterRaffle.apply(this, arguments);
                
                // Monitor the result of the enter attempt
                setTimeout(() => {
                    const successElements = document.querySelectorAll('.alert-success, .text-success, [class*="success"]');
                    if (successElements.length > 0) {
                        console.log("✅ Entry success detected via DOM");
                        showNotification("Raffle entered! Moving to next...", "success");
                        
                        setTimeout(() => {
                            if (isProcessing) {
                                continueToNextRaffle();
                            }
                        }, 1500);
                    }
                }, 1000);
                
                return result;
            };
            
            console.log("✅ ScrapTF.Raffles.EnterRaffle intercepted");
        }
    }
    
    // Monitor AJAX responses for raffle entry (professional technique)
    function monitorAjaxResponses() {
        // Override XMLHttpRequest to catch AJAX responses
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._url = url;
            this._method = method;
            return originalOpen.apply(this, [method, url, ...args]);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            this.addEventListener('readystatechange', function() {
                if (this.readyState === 4 && this.status === 200) {
                    // Check for raffle entry endpoints
                    if (this._url && this._url.includes('/ajax/viewraffle/EnterRaffle')) {
                        try {
                            const response = JSON.parse(this.responseText);
                            if (response.success) {
                                console.log("✅ AJAX entry success detected:", response);
                                showNotification("Raffle entered via AJAX! Moving to next...", "success");
                                
                                setTimeout(() => {
                                    if (isProcessing) {
                                        continueToNextRaffle();
                                    }
                                }, 1500);
                            } else if (response.message) {
                                console.log("⚠️ AJAX entry response:", response.message);
                            }
                        } catch (e) {
                            console.log("Non-JSON AJAX response");
                        }
                    }
                }
            });
            
            return originalSend.apply(this, arguments);
        };
        
        console.log("✅ AJAX monitoring enabled");
    }
    
    // Monitor DOM changes for success indicators
    function monitorDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check for added nodes
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const text = node.textContent || '';
                        const className = node.className || '';
                        
                        // Professional success patterns
                        if (text.includes('entered') || text.includes('success') || text.includes('joined') ||
                            className.includes('success') || className.includes('alert') ||
                            node.querySelector && node.querySelector('.alert-success, .text-success')) {
                            
                            console.log("✅ DOM change entry detection:", text.substring(0, 100));
                            showNotification("Entry detected via DOM! Moving to next...", "success");
                            
                            setTimeout(() => {
                                if (isProcessing) {
                                    continueToNextRaffle();
                                }
                            }, 1500);
                            
                            observer.disconnect();
                        }
                    }
                });
                
                // Check for attribute changes (like class additions)
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('raffle-entered') || 
                        target.classList.contains('alert-success')) {
                        console.log("✅ Class change entry detection:", target.className);
                        showNotification("Entry class change detected! Moving to next...", "success");
                        
                        setTimeout(() => {
                            if (isProcessing) {
                                continueToNextRaffle();
                            }
                        }, 1500);
                        
                        observer.disconnect();
                    }
                }
                
                // Check for text content changes
                if (mutation.type === 'childList') {
                    const target = mutation.target;
                    if (target.textContent && target.textContent.toLowerCase().includes('entered')) {
                        console.log("✅ Text change entry detection:", target.textContent.substring(0, 100));
                        showNotification("Entry text change detected! Moving to next...", "success");
                        
                        setTimeout(() => {
                            if (isProcessing) {
                                continueToNextRaffle();
                            }
                        }, 1500);
                        
                        observer.disconnect();
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'style'],
            characterData: true
        });
        
        // Cleanup after 30 seconds
        setTimeout(() => observer.disconnect(), 30000);
        
        console.log("✅ Enhanced DOM monitoring enabled");
    }
    
    // Monitor URL changes
    function monitorUrlChanges() {
        let lastUrl = location.href;
        const urlCheckInterval = setInterval(() => {
            if (location.href !== lastUrl) {
                console.log("✅ URL change detected - assuming raffle entry");
                showNotification("Page changed! Moving to next raffle...", "success");
                
                clearInterval(urlCheckInterval);
                setTimeout(() => {
                    if (isProcessing) {
                        continueToNextRaffle();
                    }
                }, 1000);
            }
            lastUrl = location.href;
        }, 1000);
        
        // Cleanup after 30 seconds
        setTimeout(() => clearInterval(urlCheckInterval), 30000);
        
        console.log("✅ URL monitoring enabled");
    }

        // Initialize the script
        console.log("🚀 Initializing Scrap.tf Raffle Navigator...");
        setTimeout(startRaffleNavigator, 1000);

    })();
