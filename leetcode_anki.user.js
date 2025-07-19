// ==UserScript==
// @name         LeetCode Anki Card Creator
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically create Anki cards when solving LeetCode problems, separated by difficulty
// @author       You
// @match        https://leetcode.com/problems/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Configuration
    const ANKI_CONNECT_URL = 'http://localhost:8765';
    const DECK_PREFIX = 'LeetCode::';
    
    // Difficulty mappings
    const DIFFICULTY_DECKS = {
        'Easy': `${DECK_PREFIX}Easy`,
        'Medium': `${DECK_PREFIX}Medium`,
        'Hard': `${DECK_PREFIX}Hard`
    };

    // State tracking
    let lastSubmissionResult = null;
    let problemData = null;

    // Initialize the script
    function init() {
        console.log('LeetCode Anki Card Creator initialized');
        
        // Extract problem data on page load
        extractProblemData();
        
        // Monitor for successful submissions
        monitorSubmissions();
        
        // Add UI button for manual card creation
        addManualCardButton();
    }

    // Extract problem information from the page
    function extractProblemData() {
        try {
            // Get problem title
            const titleElement = document.querySelector('[data-cy="question-title"]') || 
                                document.querySelector('h1') ||
                                document.querySelector('.css-v3d350');
            
            // Get problem number from URL
            const urlMatch = window.location.pathname.match(/\/problems\/([^\/]+)/);
            const problemSlug = urlMatch ? urlMatch[1] : '';
            
            // Get difficulty
            const difficultyElement = document.querySelector('[diff]') || 
                                    document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard') ||
                                    document.querySelector('[data-degree]');
            
            let difficulty = 'Medium'; // default
            if (difficultyElement) {
                const diffText = difficultyElement.textContent.trim();
                if (diffText.toLowerCase().includes('easy')) difficulty = 'Easy';
                else if (diffText.toLowerCase().includes('medium')) difficulty = 'Medium';
                else if (diffText.toLowerCase().includes('hard')) difficulty = 'Hard';
            }

            // Try to extract problem number from title or other sources
            let problemNumber = '';
            if (titleElement) {
                const titleText = titleElement.textContent;
                const numberMatch = titleText.match(/^(\d+)\./);
                if (numberMatch) {
                    problemNumber = numberMatch[1];
                }
            }

            problemData = {
                title: titleElement ? titleElement.textContent.trim() : problemSlug,
                number: problemNumber,
                difficulty: difficulty,
                url: window.location.href,
                slug: problemSlug
            };

            console.log('Extracted problem data:', problemData);
        } catch (error) {
            console.error('Error extracting problem data:', error);
        }
    }

    // Monitor for successful submissions
    function monitorSubmissions() {
        // Method 1: Monitor for success notification
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for success indicators
                        if (node.textContent && 
                            (node.textContent.includes('Accepted') || 
                             node.textContent.includes('Success') ||
                             node.classList?.contains('text-green-s'))) {
                            handleSuccessfulSubmission();
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Method 2: Monitor URL changes and check for success page
        let lastUrl = location.href;
        new MutationObserver(() => {
            const url = location.href;
            if (url !== lastUrl) {
                lastUrl = url;
                if (url.includes('/submissions/detail/')) {
                    setTimeout(() => {
                        checkSubmissionResult();
                    }, 2000);
                }
            }
        }).observe(document, { subtree: true, childList: true });
    }

    // Check submission result on submission detail page
    function checkSubmissionResult() {
        const acceptedElement = document.querySelector('.text-green-s, [data-e2e-locator="submission-result"]');
        if (acceptedElement && acceptedElement.textContent.includes('Accepted')) {
            handleSuccessfulSubmission();
        }
    }

    // Handle successful submission
    function handleSuccessfulSubmission() {
        if (!problemData) {
            extractProblemData();
        }
        
        if (problemData && !lastSubmissionResult) {
            lastSubmissionResult = Date.now();
            console.log('Successful submission detected for:', problemData.title);
            
            // Get the solution code
            getSolutionCode().then(code => {
                if (code) {
                    createAnkiCard(problemData, code);
                }
            });
        }
    }

    // Get solution code from the editor
    function getSolutionCode() {
        return new Promise((resolve) => {
            // Try different methods to get the code
            let code = '';
            
            // Method 1: Monaco Editor
            if (window.monaco && window.monaco.editor) {
                const editors = window.monaco.editor.getEditors();
                if (editors.length > 0) {
                    code = editors[0].getValue();
                }
            }
            
            // Method 2: CodeMirror
            if (!code && window.CodeMirror) {
                const cmElements = document.querySelectorAll('.CodeMirror');
                if (cmElements.length > 0) {
                    code = cmElements[0].CodeMirror?.getValue() || '';
                }
            }
            
            // Method 3: Direct textarea search
            if (!code) {
                const textareas = document.querySelectorAll('textarea, .view-line');
                for (let textarea of textareas) {
                    if (textarea.value && textarea.value.trim().length > 50) {
                        code = textarea.value;
                        break;
                    }
                }
            }
            
            // Method 4: Try to find code in the page content
            if (!code) {
                // Look for code blocks or pre elements
                const codeElements = document.querySelectorAll('pre, code, .monaco-editor .view-line');
                let combinedCode = '';
                codeElements.forEach(el => {
                    if (el.textContent && el.textContent.trim().length > 10) {
                        combinedCode += el.textContent + '\n';
                    }
                });
                if (combinedCode.length > 50) {
                    code = combinedCode;
                }
            }
            
            resolve(code || 'No code found');
        });
    }

    // Create Anki card via AnkiConnect
    async function createAnkiCard(problem, code) {
        try {
            // Ensure deck exists
            await ensureDeckExists(DIFFICULTY_DECKS[problem.difficulty]);
            
            // Prepare card content
            const front = `
                <div style="font-family: Arial, sans-serif;">
                    <h3>Problem ${problem.number}: ${problem.title}</h3>
                    <p><strong>Difficulty:</strong> <span style="color: ${getDifficultyColor(problem.difficulty)};">${problem.difficulty}</span></p>
                    <p><a href="${problem.url}" target="_blank">View Problem</a></p>
                </div>
            `;
            
            const back = `
                <div style="font-family: Arial, sans-serif;">
                    <h4>Solution Code:</h4>
                    <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto;"><code>${escapeHtml(code)}</code></pre>
                </div>
            `;
            
            // Create the card
            const cardData = {
                "action": "addNote",
                "version": 6,
                "params": {
                    "note": {
                        "deckName": DIFFICULTY_DECKS[problem.difficulty],
                        "modelName": "Basic",
                        "fields": {
                            "Front": front,
                            "Back": back
                        },
                        "tags": ["leetcode", problem.difficulty.toLowerCase(), `problem-${problem.number}`]
                    }
                }
            };
            
            const response = await fetch(ANKI_CONNECT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cardData)
            });
            
            const result = await response.json();
            
            if (result.error) {
                console.error('Error creating Anki card:', result.error);
                showNotification('Failed to create Anki card: ' + result.error, 'error');
            } else {
                console.log('Anki card created successfully:', result);
                showNotification(`Anki card created for ${problem.title}!`, 'success');
            }
            
        } catch (error) {
            console.error('Error creating Anki card:', error);
            showNotification('Failed to create Anki card. Make sure Anki is running with AnkiConnect addon.', 'error');
        }
    }

    // Ensure deck exists
    async function ensureDeckExists(deckName) {
        try {
            const createDeckData = {
                "action": "createDeck",
                "version": 6,
                "params": {
                    "deck": deckName
                }
            };
            
            await fetch(ANKI_CONNECT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(createDeckData)
            });
        } catch (error) {
            console.error('Error creating deck:', error);
        }
    }

    // Helper functions
    function getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'Easy': return '#00af9b';
            case 'Medium': return '#ffb800';
            case 'Hard': return '#ff2d55';
            default: return '#333';
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            font-family: Arial, sans-serif;
            ${type === 'success' ? 'background-color: #4caf50;' : 'background-color: #f44336;'}
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Add manual card creation button
    function addManualCardButton() {
        const button = document.createElement('button');
        button.textContent = '📚 Create Anki Card';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: #ff6b35;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        button.addEventListener('click', () => {
            if (!problemData) {
                extractProblemData();
            }
            
            getSolutionCode().then(code => {
                if (problemData && code) {
                    createAnkiCard(problemData, code);
                } else {
                    showNotification('Could not extract problem data or code', 'error');
                }
            });
        });
        
        document.body.appendChild(button);
    }

    // Wait for page to load and initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();