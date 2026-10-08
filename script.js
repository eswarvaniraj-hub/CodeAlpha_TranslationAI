/* ==========================================================
   CodeAlpha AI Internship - Task 1: Language Translation Tool
   File: script.js
   Description: UI logic & secure translation API integration
   ========================================================== */

// 1. Wait for DOM content to load before attaching events
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const sourceLanguageSelect = document.getElementById('source-language');
    const targetLanguageSelect = document.getElementById('target-language');
    const swapLangBtn = document.getElementById('swap-lang-btn');

    const sourceText = document.getElementById('source-text');
    const targetText = document.getElementById('target-text');
    const charCount = document.getElementById('char-count');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const statusBadge = document.getElementById('status-badge');

    const translateBtn = document.getElementById('translate-btn');
    const copySourceBtn = document.getElementById('copy-source-btn');
    const copyTargetBtn = document.getElementById('copy-target-btn');
    const listenSourceBtn = document.getElementById('listen-source-btn');
    const listenTargetBtn = document.getElementById('listen-target-btn');
    const toastMessage = document.getElementById('toast-message');

    let toastTimer = null;

    // BCP-47 language tag map for Web Speech API (TTS)
    const SPEECH_LANG_MAP = {
        en: 'en-US',
        ta: 'ta-IN',
        hi: 'hi-IN',
        te: 'te-IN',
        ml: 'ml-IN',
        kn: 'kn-IN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ja: 'ja-JP',
        zh: 'zh-CN'
    };

    // --- Helper Functions ---

    /**
     * Show a temporary toast message to the user.
     * @param {string} message - Text to display.
     */
    function showToast(message) {
        if (!toastMessage) return;

        // Clear any existing active timeout
        if (toastTimer) {
            clearTimeout(toastTimer);
        }

        toastMessage.textContent = message;
        toastMessage.classList.remove('hidden');

        // Auto-hide after 3.5 seconds
        toastTimer = setTimeout(() => {
            toastMessage.classList.add('hidden');
        }, 3500);
    }

    /**
     * Fallback copy mechanism using a hidden textarea for environments
     * where navigator.clipboard is unavailable or restricted.
     * @param {string} text - Content to copy.
     * @param {string} label - Context label for toast.
     */
    function fallbackCopy(text, label) {
        try {
            const tempArea = document.createElement('textarea');
            tempArea.value = text;
            tempArea.style.position = 'fixed';
            tempArea.style.top = '-9999px';
            tempArea.style.left = '-9999px';
            tempArea.setAttribute('readonly', '');
            document.body.appendChild(tempArea);
            tempArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(tempArea);

            if (success) {
                showToast(`${label} copied to clipboard!`);
            } else {
                showToast(`Unable to copy ${label.toLowerCase()}.`);
            }
        } catch (err) {
            showToast(`Copy failed: ${err.message}`);
        }
    }

    /**
     * Copy text to the clipboard with fallback support.
     * @param {string} text - Content to copy.
     * @param {string} label - Context name for toast notification.
     */
    function copyToClipboard(text, label = 'Text') {
        const trimmed = text.trim();
        if (!trimmed) {
            showToast(`Nothing to copy in ${label.toLowerCase()}!`);
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(trimmed)
                .then(() => {
                    showToast(`${label} copied to clipboard!`);
                })
                .catch(() => {
                    fallbackCopy(trimmed, label);
                });
        } else {
            fallbackCopy(trimmed, label);
        }
    }

    /**
     * Text-To-Speech (TTS) using browser's built-in Web Speech API.
     * Toggles playback off if already speaking.
     * @param {string} text - Content to speak aloud.
     * @param {string} langCode - Language code for synthesis.
     */
    function speakText(text, langCode = 'en') {
        const trimmed = text.trim();
        if (!trimmed) {
            showToast('No text available to listen to!');
            return;
        }

        if (!('speechSynthesis' in window)) {
            showToast('Text-to-speech is not supported in this browser.');
            return;
        }

        // Toggle: if speech is already currently playing, stop it
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            showToast('Audio playback stopped.');
            return;
        }

        // Reset speech engine state
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(trimmed);
        
        // Map language code to standard BCP-47 tag for accurate voice selection
        if (langCode && langCode !== 'auto') {
            utterance.lang = SPEECH_LANG_MAP[langCode] || langCode;
        }

        utterance.onerror = () => {
            showToast('Speech playback encountered an error.');
        };

        window.speechSynthesis.speak(utterance);
        showToast('Playing audio...');
    }

    // --- Initial State Sync ---
    charCount.textContent = sourceText.value.length;

    // --- Event Listeners ---

    // 1. Character Counter: updates live as user types or pastes
    sourceText.addEventListener('input', () => {
        const currentLength = sourceText.value.length;
        charCount.textContent = currentLength;
    });

    // 2. Clear Input Button
    clearInputBtn.addEventListener('click', () => {
        sourceText.value = '';
        charCount.textContent = '0';
        targetText.value = '';
        if (statusBadge) {
            statusBadge.textContent = 'Ready';
            statusBadge.className = 'status-pill ready';
        }
        sourceText.focus();
        showToast('Input cleared');
    });

    // 3. Swap Languages Button
    swapLangBtn.addEventListener('click', () => {
        const sourceVal = sourceLanguageSelect.value;
        const targetVal = targetLanguageSelect.value;

        // If source is 'auto', we cannot assign 'auto' to target language
        if (sourceVal === 'auto') {
            showToast('Cannot swap when source is "Detect Language".');
            return;
        }

        // Add CSS rotation animation
        swapLangBtn.classList.add('rotate-animate');
        setTimeout(() => {
            swapLangBtn.classList.remove('rotate-animate');
        }, 400);

        // Swap the selected dropdown values
        sourceLanguageSelect.value = targetVal;
        targetLanguageSelect.value = sourceVal;

        // Also swap text content if target text has content
        if (targetText.value.trim().length > 0) {
            const tempText = sourceText.value;
            sourceText.value = targetText.value;
            targetText.value = tempText;
            charCount.textContent = sourceText.value.length;
        }

        showToast('Languages swapped!');
    });

    // 4. Translate Button (Secure API Request Handler)
    translateBtn.addEventListener('click', async () => {
        const inputText = sourceText.value.trim();

        // Validation: Empty text
        if (!inputText) {
            showToast('Please enter text to translate first.');
            sourceText.focus();
            return;
        }

        // Validation: Max length limit
        if (sourceText.value.length > 5000) {
            showToast('Text exceeds the 5,000 character limit.');
            sourceText.focus();
            return;
        }

        // Save original button layout for restoration
        const originalBtnHTML = translateBtn.innerHTML;

        // UI Loading State: Disable button & show "Translating..."
        translateBtn.disabled = true;
        translateBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin-icon">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
            </svg>
            <span>Translating...</span>
        `;

        if (statusBadge) {
            statusBadge.textContent = 'Translating...';
            statusBadge.className = 'status-pill translating';
        }

        try {
            // Send POST request securely to local Express proxy
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: inputText,
                    sourceLang: sourceLanguageSelect.value,
                    targetLang: targetLanguageSelect.value
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                targetText.value = data.translation;
                if (statusBadge) {
                    statusBadge.textContent = 'Translated';
                    statusBadge.className = 'status-pill ready';
                }
                showToast('Translation completed!');
            } else {
                const errorMessage = data.error || 'Translation failed. Please try again.';
                if (statusBadge) {
                    statusBadge.textContent = 'Error';
                    statusBadge.className = 'status-pill error';
                }
                showToast(errorMessage);
            }
        } catch (error) {
            console.error('Translation network error:', error);
            if (statusBadge) {
                statusBadge.textContent = 'Error';
                statusBadge.className = 'status-pill error';
            }
            showToast('Unable to connect to translation server. Please ensure the server is running.');
        } finally {
            // Re-enable button and restore original icon/label
            translateBtn.disabled = false;
            translateBtn.innerHTML = originalBtnHTML;
        }
    });

    // 5. Copy Buttons
    copySourceBtn.addEventListener('click', () => {
        copyToClipboard(sourceText.value, 'Source text');
    });

    copyTargetBtn.addEventListener('click', () => {
        copyToClipboard(targetText.value, 'Translation');
    });

    // 6. Listen (Text-to-Speech) Buttons
    listenSourceBtn.addEventListener('click', () => {
        speakText(sourceText.value, sourceLanguageSelect.value);
    });

    listenTargetBtn.addEventListener('click', () => {
        speakText(targetText.value, targetLanguageSelect.value);
    });

    console.log('CodeAlpha Language Translation Tool ready.');
});
