// ==UserScript==
// @name        Scrap.tf Raffle Navigator
// @namespace   VioletMonkeyScripts
// @match       https://scrap.tf/raffles
// @match       https://scrap.tf/raffles/*
// @grant       none
// @version     2.5
// @author      Your Name
// @description Navigates to un-entered raffles on Scrap.tf for manual entry
// ==/UserScript==

(function() {
    'use strict';

    console.log("Scrap.tf Raffle Navigator script started. Version 2.5");

    // Helper function to wait
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper function to check if element is visible
    function isElementVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0';
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
            // Check for CAPTCHA or errors
            const captcha = document.querySelector('[id*="captcha"], [class*="captcha"], #turnstile-container');
            if (captcha && isElementVisible(captcha)) {
                console.log("⚠️ CAPTCHA detected");
                showNotification("CAPTCHA detected! Complete it first, then click Enter Raffle", "warning");
                return;
            }

            // Look for the "Enter Raffle" button
            let enterButton = document.querySelector('button[id="raffle-leave"]');

            if (!enterButton) {
                console.log("❌ Enter Raffle button not found");
                showNotification("No Enter Raffle button found. Please check manually.", "warning");
                return;
            }

            // Highlight the button
            enterButton.style.cssText = `
                border: 3px solid #ff4444 !important;
                box-shadow: 0 0 15px #ff4444 !important;
                animation: pulse 1s infinite !important;
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

            console.log("🎯 Enter Raffle button highlighted!");
            showNotification("Click the highlighted 'Enter Raffle' button!", "info");

            // Add click listener to continue to next raffle after manual click
            enterButton.addEventListener('click', () => {
                console.log("✅ User clicked Enter Raffle button");
                showNotification("Entry submitted! Moving to next raffle...", "success");
                setTimeout(() => {
                    continueToNextRaffle();
                }, 3000);
            });
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

    // Function to get all raffle links from the main page (only un-entered ones)
    function getRaffleLinks() {
        const links = [];
        
        // Look for raffle links in the structure: div.raffle-name > a[href^="/raffles/"]
        const raffleNameDivs = document.querySelectorAll('div.raffle-name');
        console.log(`Found ${raffleNameDivs.length} raffle-name divs`);
        
        raffleNameDivs.forEach((div, index) => {
            const link = div.querySelector('a[href^="/raffles/"]');
            if (link && link.href) {
                const raffleId = getRaffleId(link.href);
                if (raffleId && raffleId.length === 6) {
                    // Check multiple ways to see if raffle is already entered
                    const panel = div.closest('.panel, [class*="panel"], .raffle-panel, [class*="raffle"]');
                    
                    // Look for various "entered" indicators
                    const enteredIndicators = [
                        '.raffle-entered', '.entered', '.already-entered',
                        '[class*="entered"]', '[class*="joined"]',
                        'button[disabled]', '.btn-disabled',
                        '.text-success', '.success'
                    ];
                    
                    let isAlreadyEntered = false;
                    
                    // Check in the panel/container
                    if (panel) {
                        for (let selector of enteredIndicators) {
                            try {
                                if (panel.querySelector(selector)) {
                                    isAlreadyEntered = true;
                                    console.log(`❌ Skipping already entered raffle: ${link.href} (found ${selector})`);
                                    break;
                                }
                            } catch (e) {
                                console.log(`Warning: Invalid selector ${selector}:`, e);
                            }
                        }
                    }
                    
                    // Also check for "Enter Raffle" button presence - if no button, likely already entered
                    if (!isAlreadyEntered && panel) {
                        try {
                            const hasEnterButton = panel.querySelector('button, input[type="submit"], input[type="button"]');
                            if (!hasEnterButton) {
                                isAlreadyEntered = true;
                                console.log(`❌ Skipping raffle (no enter button found): ${link.href}`);
                            }
                        } catch (e) {
                            console.log("Warning: Error checking for enter button:", e);
                        }
                    }
                    
                    // Only add if NOT already entered
                    if (!isAlreadyEntered) {
                        links.push(link.href);
                        console.log(`✅ Found joinable raffle ${index + 1}: ${link.href} (ID: ${raffleId})`);
                    }
                }
            }
        });

        console.log(`📊 Total joinable raffles found: ${links.length}`);
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

    // Initialize the script
    console.log("🚀 Initializing Scrap.tf Raffle Navigator...");
    setTimeout(startRaffleNavigator, 1000);

})();
