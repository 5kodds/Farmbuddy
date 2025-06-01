// DOM Elements
const textInput = document.getElementById('textInput');
const imageInput = document.getElementById('imageInput');
const analyzeButton = document.getElementById('analyzeButton');
const resultsSection = document.getElementById('resultsSection');
const errorDisplay = document.getElementById('errorDisplay');
const errorMessage = document.getElementById('errorMessage');
const apiKeyWarningSection = document.getElementById('apiKeyWarningSection');
const successDisplay = document.getElementById('successDisplay');
const successMessage = document.getElementById('successMessage');
const diagnosisEl = document.getElementById('diagnosis');
const plantHealthDetailsEl = document.getElementById('plantHealthDetails');
const soilConditionEl = document.getElementById('soilCondition');
const recommendationsPlantEl = document.getElementById('recommendationsPlant');
const recommendationsSoilEl = document.getElementById('recommendationsSoil');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const fileNameDisplay = document.getElementById('fileName');
const recordAudioButton = document.getElementById('recordAudioButton');
const stopAudioButton = document.getElementById('stopAudioButton');
const audioPlayback = document.getElementById('audioPlayback');
const recordingStatus = document.getElementById('recordingStatus');
const clearAudioButton = document.getElementById('clearAudioButton');
const loadingContainer = document.getElementById('loadingContainer');
const loadingStatusMessage = document.getElementById('loadingStatusMessage');

// State variables
let base64ImageData = null;
let currentMimeType = "image/jpeg";
let mediaRecorder;
let audioChunks = [];
let base64AudioData = null;
let audioMimeType = "";

// Image handling
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        currentMimeType = file.type || "image/jpeg";
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            imagePreviewContainer.classList.remove('hidden');
            base64ImageData = e.target.result.split(',')[1];
        }
        reader.onerror = () => { showError("Error reading image file."); clearImagePreview(); }
        reader.readAsDataURL(file);
    } else {
        clearImagePreview();
    }
});

function clearImagePreview() {
    fileNameDisplay.textContent = 'No image selected.';
    imagePreviewContainer.classList.add('hidden');
    imagePreview.src = '#';
    base64ImageData = null;
    currentMimeType = "image/jpeg";
}

// Audio Recording Functionality
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    recordAudioButton.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            base64AudioData = null;

            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstart = () => {
                recordAudioButton.classList.add('hidden');
                stopAudioButton.classList.remove('hidden');
                clearAudioButton.classList.add('hidden');
                audioPlayback.classList.add('hidden'); audioPlayback.src = "";
                recordingStatus.textContent = "Recording...";
                errorDisplay.classList.add('hidden');
                successDisplay.classList.add('hidden');
            };

            mediaRecorder.onstop = () => {
                recordAudioButton.classList.remove('hidden');
                stopAudioButton.classList.add('hidden');
                recordingStatus.textContent = "Processing audio...";
                if (audioChunks.length === 0) { recordingStatus.textContent = "No audio recorded."; return; }
                
                const audioBlob = new Blob(audioChunks, { type: audioChunks[0]?.type || 'audio/webm' });
                audioMimeType = audioBlob.type;
                console.log("Recorded audio MIME type:", audioMimeType);

                const reader = new FileReader();
                reader.onloadend = () => {
                    base64AudioData = reader.result.split(',')[1];
                    audioPlayback.src = reader.result;
                    audioPlayback.classList.remove('hidden');
                    clearAudioButton.classList.remove('hidden');
                    recordingStatus.textContent = "Recording finished. Preview available.";
                };
                reader.onerror = () => { showError("Error processing recorded audio."); recordingStatus.textContent = ""; }
                reader.readAsDataURL(audioBlob);
                
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
        } catch (err) {
            console.error("Error accessing microphone:", err);
            showError(`Mic access denied or error: ${err.message}. Try enabling mic permissions.`);
            recordAudioButton.classList.remove('hidden'); stopAudioButton.classList.add('hidden'); recordingStatus.textContent = "";
        }
    });

    stopAudioButton.addEventListener('click', () => {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
    });

    clearAudioButton.addEventListener('click', () => {
        audioPlayback.src = ""; audioPlayback.classList.add('hidden'); clearAudioButton.classList.add('hidden');
        base64AudioData = null; audioMimeType = ""; audioChunks = []; recordingStatus.textContent = "";
        if (mediaRecorder && mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => { if (track.readyState === 'live') track.stop(); });
        }
    });
} else {
    recordAudioButton.disabled = true;
    recordAudioButton.textContent = "Audio Not Supported";
    if(recordingStatus) recordingStatus.textContent = "Browser doesn't support audio recording.";
}

// Error and Success message functions
function showError(message) {
    errorMessage.textContent = message;
    errorDisplay.classList.remove('hidden');
    successDisplay.classList.add('hidden');
    if (!resultsSection.classList.contains('hidden')) {
        resultsSection.style.opacity = 0;
        setTimeout(() => { resultsSection.classList.add('hidden'); }, 500);
    }
}
function showSuccess(message) {
    successMessage.textContent = message;
    successDisplay.classList.remove('hidden');
    errorDisplay.classList.add('hidden');
}

// Analyze button click listener
analyzeButton.addEventListener('click', async () => {
    const userText = textInput.value.trim();
    
    // --- USER ACTION REQUIRED: API Key ---
    const apiKey = "AIzaSyD797XpTrqRALSAZsc-sEAkRwRoYoYcYUI"; // <-- REPLACE THIS!
    
    const usingDirectGeminiCall = true; 

    if (usingDirectGeminiCall && (apiKey === "YOUR_GEMINI_API_KEY_HERE" || !apiKey)) {
        showError("API Key not configured. Please set it in the script.js file.");
        apiKeyWarningSection.style.backgroundColor = '#f8d7da'; 
        apiKeyWarningSection.style.borderColor = '#f5c6cb';
        apiKeyWarningSection.style.color = '#721c24';
        return;
    } else if (usingDirectGeminiCall) {
        apiKeyWarningSection.style.backgroundColor = '#fff3cd';
        apiKeyWarningSection.style.borderColor = '#ffeeba';
        apiKeyWarningSection.style.color = '#856404';
    }

    if (!userText && !base64ImageData && !base64AudioData) {
        showError('Please provide text, an image, or record audio.');
        return;
    }

    loadingContainer.classList.remove('hidden');
    loadingStatusMessage.textContent = "Preparing your inputs for Farm Buddy..."; 

    resultsSection.style.opacity = 0;
    resultsSection.classList.add('hidden'); 
    errorDisplay.classList.add('hidden');
    successDisplay.classList.add('hidden'); 
    analyzeButton.disabled = true;
    analyzeButton.classList.add('opacity-50', 'cursor-not-allowed');

    let responseData = null;

    if (usingDirectGeminiCall) {
        loadingStatusMessage.textContent = "Farm Buddy is analyzing your data..."; 

        const prompt = `You are an expert agronomist and plant pathologist for Farm Buddy, the farmers-first digital advisory service. Analyze the following inputs: a user-provided text description, an image of a plant and its soil, and/or an audio recording describing the plant.
User's text input: "${userText || 'No text description provided.'}"
User's audio input: ${base64AudioData ? "[Audio provided]" : "[No audio provided]"}
Based on all available information (text, image, audio if present):
1. Provide a concise diagnosis of the plant's overall health.
2. Describe any specific details observed about the plant's condition.
3. Assess the visible or described soil condition.
4. Offer actionable recommendations to improve the plant's health (at least 2).
5. Offer actionable recommendations to improve the soil's condition (at least 2).
Please provide your response in the specified JSON format. Prioritize visual and audible evidence if provided. If an input is missing, state that in your assessment.`;

        const parts = [];
        parts.push({ text: prompt });
        if (base64ImageData) { parts.push({ inline_data: { mime_type: currentMimeType, data: base64ImageData } }); }
        if (base64AudioData && audioMimeType) { parts.push({ inline_data: { mime_type: audioMimeType, data: base64AudioData } }); }
        
        const geminiPayload = { 
            contents: [{ role: "user", parts: parts }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: { 
                        diagnosis: { type: "STRING" }, plant_health_details: { type: "STRING" },
                        soil_condition_assessment: { type: "STRING" },
                        recommendations_plant: { type: "ARRAY", items: { type: "STRING" } },
                        recommendations_soil: { type: "ARRAY", items: { type: "STRING" } }
                    },
                    required: ["diagnosis", "plant_health_details", "soil_condition_assessment", "recommendations_plant", "recommendations_soil"]
                }
            }
        };
        const directApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(directApiUrl, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(geminiPayload)
            });
            const result = await response.json();
            if (!response.ok) {
                const apiErrorMessage = result?.error?.message || `Farm Buddy encountered an issue (status ${response.status}).`;
                throw new Error(apiErrorMessage);
            }
            if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
                responseData = JSON.parse(result.candidates[0].content.parts[0].text);
                loadingStatusMessage.textContent = "Farm Buddy analysis complete!"; 
                showSuccess("Farm Buddy has your results below."); 
            } else { 
                if (result.promptFeedback?.blockReason) {
                     throw new Error(`Farm Buddy's analysis was blocked. Reason: ${result.promptFeedback.blockReason}.`);
                }
                throw new Error('Farm Buddy returned an unexpected response structure.');
            }
        } catch (error) { 
            console.error('Direct API Call Error:', error);
            showError(`Error: ${error.message}`); 
            loadingContainer.classList.add('hidden'); 
            analyzeButton.disabled = false;
            analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
            return;
        }
    } else { 
         showError('Backend call not implemented.'); 
         loadingContainer.classList.add('hidden'); 
         analyzeButton.disabled = false;
         analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
         return; 
    }
    
    if (responseData) {
        displayResults(responseData);
    }
    
    if (responseData) {
        setTimeout(() => {
            loadingContainer.classList.add('hidden');
        }, 1500); 
    } else {
         loadingContainer.classList.add('hidden');
    }
    
    analyzeButton.disabled = false;
    analyzeButton.classList.remove('opacity-50', 'cursor-not-allowed');
});

function displayResults(data) {
    diagnosisEl.textContent = data.diagnosis || 'No diagnosis provided by AI.';
    plantHealthDetailsEl.textContent = data.plant_health_details || 'No specific plant details provided by AI.';
    soilConditionEl.textContent = data.soil_condition_assessment || 'No soil assessment provided by AI.';

    // --- UI IMPROVEMENT: populateList function updated to add 'checklist-item' class ---
    function populateList(element, items, defaultMessage) {
        element.innerHTML = ''; 
        if (items && items.length > 0) {
            items.forEach(recommendationText => {
                const li = document.createElement('li');
                li.classList.add('checklist-item'); // Add class for checklist styling
                li.textContent = recommendationText;
                element.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            // Apply a different class or style for the default message if you don't want the checkbox icon
            li.classList.add('checklist-item-default'); 
            li.textContent = defaultMessage;
            element.appendChild(li);
        }
    }
    // --- END UI IMPROVEMENT ---

    populateList(recommendationsPlantEl, data.recommendations_plant, 'No plant recommendations provided by AI.');
    populateList(recommendationsSoilEl, data.recommendations_soil, 'No soil recommendations provided by AI.');
    
    resultsSection.classList.remove('hidden'); 
    setTimeout(() => { 
        resultsSection.style.opacity = 1; 
    }, 10); 
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
