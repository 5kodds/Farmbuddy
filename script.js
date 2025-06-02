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

// NEW: Camera related DOM Elements
const startCameraButton = document.getElementById('startCameraButton');
const liveCameraView = document.getElementById('liveCameraView');
const videoElement = document.getElementById('videoElement');
const capturePhotoButton = document.getElementById('capturePhotoButton');
const closeCameraButton = document.getElementById('closeCameraButton');
const photoCanvas = document.getElementById('photoCanvas'); // Hidden canvas
const cameraStatus = document.getElementById('cameraStatus');


// State variables
let base64ImageData = null;
let currentMimeType = "image/jpeg";
let mediaRecorder;
let audioChunks = [];
let base64AudioData = null;
let audioMimeType = "";
let cameraStream = null; // NEW: For camera stream

// Image handling (file upload)
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        closeCamera(); // Close camera if a file is chosen
        cameraStatus.textContent = "Camera closed due to file upload.";
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
    // Do not automatically close camera here, user might want to use camera next
}

// NEW: Camera Functionality
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    startCameraButton.addEventListener('click', async () => {
        clearImagePreview(); // Clear any previously uploaded file image
        fileNameDisplay.textContent = ""; // Clear file name display
        // Optionally clear audio too:
        // if (clearAudioButton && !clearAudioButton.classList.contains('hidden')) clearAudioButton.click();

        cameraStatus.textContent = "Requesting camera access...";
        errorDisplay.classList.add('hidden');
        successDisplay.classList.add('hidden');
        try {
            if (cameraStream) { // Stop any existing stream
                cameraStream.getTracks().forEach(track => track.stop());
            }
            // Prefer rear camera on mobile devices
            const constraints = { video: { facingMode: "environment" }, audio: false };
            cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = cameraStream;
            liveCameraView.classList.remove('hidden');
            startCameraButton.classList.add('hidden'); // Hide "Open Camera" button
            cameraStatus.textContent = "Camera active. Position your subject.";
        } catch (err) {
            console.error("Error accessing camera:", err);
            cameraStatus.textContent = `Error: ${err.message}.`;
            showError(`Could not access camera: ${err.message}. Please ensure permission is granted and no other app/tab is using it.`);
            liveCameraView.classList.add('hidden');
            startCameraButton.classList.remove('hidden');
        }
    });

    capturePhotoButton.addEventListener('click', () => {
        if (!cameraStream || !videoElement.srcObject || videoElement.readyState < videoElement.HAVE_METADATA) {
            showError("Camera not ready or stream not available.");
            return;
        }
        cameraStatus.textContent = "Capturing...";
        
        photoCanvas.width = videoElement.videoWidth;
        photoCanvas.height = videoElement.videoHeight;
        
        const context = photoCanvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, photoCanvas.width, photoCanvas.height);
        
        const imageDataUrl = photoCanvas.toDataURL('image/jpeg', 0.9); // JPEG quality 0.9
        base64ImageData = imageDataUrl.split(',')[1];
        currentMimeType = 'image/jpeg';

        imagePreview.src = imageDataUrl; // Show captured photo in the existing preview area
        imagePreviewContainer.classList.remove('hidden');
        fileNameDisplay.textContent = "Photo captured via camera."; // Update file name display

        closeCamera(); // Stop camera stream and hide camera view after capture
        cameraStatus.textContent = "Photo captured!";
    });

    closeCameraButton.addEventListener('click', () => {
        closeCamera();
        cameraStatus.textContent = "Camera closed.";
    });

} else {
    startCameraButton.disabled = true;
    startCameraButton.textContent = "Camera Not Supported";
    if(cameraStatus) cameraStatus.textContent = "Your browser does not support live camera access.";
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    videoElement.srcObject = null;
    liveCameraView.classList.add('hidden');
    startCameraButton.classList.remove('hidden');
    // cameraStatus.textContent = ""; // Clear status or set to "Camera closed"
}
// END NEW: Camera Functionality


// Audio Recording Functionality (from previous version)
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    recordAudioButton.addEventListener('click', async () => { /* ... (Full audio logic as provided before) ... */ 
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = []; base64AudioData = null;
            mediaRecorder.ondataavailable = event => { if (event.data.size > 0) audioChunks.push(event.data); };
            mediaRecorder.onstart = () => {
                recordAudioButton.classList.add('hidden'); stopAudioButton.classList.remove('hidden');
                clearAudioButton.classList.add('hidden'); audioPlayback.classList.add('hidden'); audioPlayback.src = "";
                recordingStatus.textContent = "Recording..."; errorDisplay.classList.add('hidden'); successDisplay.classList.add('hidden');
            };
            mediaRecorder.onstop = () => {
                recordAudioButton.classList.remove('hidden'); stopAudioButton.classList.add('hidden');
                recordingStatus.textContent = "Processing audio...";
                if (audioChunks.length === 0) { recordingStatus.textContent = "No audio recorded."; return; }
                const audioBlob = new Blob(audioChunks, { type: audioChunks[0]?.type || 'audio/webm' });
                audioMimeType = audioBlob.type; console.log("Recorded audio MIME type:", audioMimeType);
                const reader = new FileReader();
                reader.onloadend = () => {
                    base64AudioData = reader.result.split(',')[1]; audioPlayback.src = reader.result;
                    audioPlayback.classList.remove('hidden'); clearAudioButton.classList.remove('hidden');
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
    stopAudioButton.addEventListener('click', () => { if (mediaRecorder && mediaRecorder.state === "recording") mediaRecorder.stop(); });
    clearAudioButton.addEventListener('click', () => { 
        audioPlayback.src = ""; audioPlayback.classList.add('hidden'); clearAudioButton.classList.add('hidden');
        base64AudioData = null; audioMimeType = ""; audioChunks = []; recordingStatus.textContent = "";
        if (mediaRecorder && mediaRecorder.stream) {
            mediaRecorder.stream.getTracks().forEach(track => { if (track.readyState === 'live') track.stop(); });
        }
    });
} else { /* ... (Audio not supported handling) ... */ 
    recordAudioButton.disabled = true; recordAudioButton.textContent = "Audio Not Supported";
    if(recordingStatus) recordingStatus.textContent = "Browser doesn't support audio recording.";
}

// Error and Success message functions
function showError(message) { /* ... (same as before) ... */ 
    errorMessage.textContent = message;
    errorDisplay.classList.remove('hidden');
    successDisplay.classList.add('hidden');
    if (!resultsSection.classList.contains('hidden')) {
        resultsSection.style.opacity = 0;
        setTimeout(() => { resultsSection.classList.add('hidden'); }, 500);
    }
}
function showSuccess(message) { /* ... (same as before) ... */ 
    successMessage.textContent = message;
    successDisplay.classList.remove('hidden');
    errorDisplay.classList.add('hidden');
}

// Analyze button click listener
analyzeButton.addEventListener('click', async () => {
    // --- DEBUGGING: Confirm button click ---
    console.log("Analyze button clicked!");

    const userText = textInput.value.trim();
    // --- API KEY: Replaced with the key you provided ---
    const apiKey = "AIzaSyDbUjMksaajSFZNpYtSVPsfScc6Oz5scbs"; 
    const usingDirectGeminiCall = true; 

    // --- IMPORTANT: API Key Check ---
    // If you see an "API Key not configured" error, ensure the apiKey variable above is correctly set.
    // FIX: Changed the comparison string to the original placeholder "YOUR_GEMINI_API_KEY_HERE"
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

    // --- IMPORTANT: Input Validation ---
    // The button will not proceed if no text, image, or audio is provided.
    // Ensure you have at least one input before clicking.
    if (!userText && !base64ImageData && !base64AudioData) { // Validation includes all three types of input
        showError('Please provide text, an image, or record audio.');
        return;
    }

    loadingContainer.classList.remove('hidden');
    loadingStatusMessage.textContent = "Preparing your inputs for Farm Buddy..."; 

    resultsSection.style.opacity = 0; // Prepare for fade-in
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
        // --- FIX: Changed inline_data to inlineData and mime_type to mimeType ---
        if (base64ImageData) { parts.push({ inlineData: { mimeType: currentMimeType, data: base64ImageData } }); }
        if (base64AudioData && audioMimeType) { parts.push({ inlineData: { mimeType: audioMimeType, data: base64AudioData } }); }
        
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

function displayResults(data) { /* ... (same as before with checklist item class) ... */ 
    diagnosisEl.textContent = data.diagnosis || 'No diagnosis provided by AI.';
    plantHealthDetailsEl.textContent = data.plant_health_details || 'No specific plant details provided by AI.';
    soilConditionEl.textContent = data.soil_condition_assessment || 'No soil assessment provided by AI.';

    function populateList(element, items, defaultMessage) {
        element.innerHTML = ''; 
        if (items && items.length > 0) {
            items.forEach(recommendationText => {
                const li = document.createElement('li');
                li.classList.add('checklist-item'); 
                li.textContent = recommendationText;
                element.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.classList.add('checklist-item-default'); 
            li.textContent = defaultMessage;
            element.appendChild(li);
        }
    }

    populateList(recommendationsPlantEl, data.recommendations_plant, 'No plant recommendations provided by AI.');
    populateList(recommendationsSoilEl, data.recommendations_soil, 'No soil recommendations provided by AI.');
    
    resultsSection.classList.remove('hidden'); 
    setTimeout(() => { 
        resultsSection.style.opacity = 1; 
    }, 10); 
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
