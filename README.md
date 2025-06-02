# Farmbuddy
i deleted the wrong repo so now i have to start all over again but that gives me the chance to get more creative.


Farm Buddy: Plant & Soil Health Analyzer
Farm Buddy is a farmers-first digital advisory service designed to help users diagnose plant health issues and get actionable recommendations for both plants and soil. It leverages the power of multimodal AI to analyze text descriptions, image uploads, live camera captures, and audio recordings.

✨ Features
Multimodal Input:

Text description of plant and soil conditions.

Image upload of plants and soil.

Live camera capture for instant photo analysis.

Audio recording for verbal descriptions.

AI-Powered Analysis: Utilizes the Google Gemini API (specifically gemini-2.0-flash) to provide:

A concise diagnosis of overall plant health.

Specific details observed about the plant's condition.

An assessment of visible or described soil conditions.

Actionable recommendations to improve plant health.

Actionable recommendations to improve soil condition.

Structured Output: Presents analysis results in a clear, organized format.

Responsive Design: Built with Tailwind CSS for optimal viewing on various devices (mobile, tablet, desktop).

User Feedback: Provides clear success, error, and loading messages.

🚀 How to Use
To run Farm Buddy locally, you'll need the index.html, script.js, and style.css files.

Save the files: Save the provided index.html, script.js, and style.css files in the same directory.

Open index.html: Open the index.html file in your web browser.

Obtain a Gemini API Key:

Go to Google AI Studio.

Sign in with your Google account.

Follow the prompts to generate a new API key.

Important: Keep your API key secure and do not share it publicly.

Update script.js with your API Key:

Open script.js in a text editor.

Locate the line: const apiKey = "AIzaSyDbUjMksaajSFZNpYtSVPsfScc6Oz5scbs"; (or similar placeholder).

Replace "AIzaSyDbUjMksaajSFZNpYtSVPsfScc6Oz5scbs" with the actual API key you obtained from Google AI Studio.

Ensure the comparison in the if statement for the API key check is apiKey === "YOUR_GEMINI_API_KEY_HERE".

Interact with Farm Buddy:

Provide input using the text area, image upload, camera, or audio recording features.

Click the "Ask Farm Buddy to Analyze" button to get your results.

🛠️ Technologies Used
HTML5: For structuring the web page content.

Tailwind CSS: For rapid and responsive styling.

JavaScript (ES6+): For all interactive functionality, API calls, and DOM manipulation.

Google Gemini API: The core AI model (gemini-2.0-flash) for multimodal analysis.

Web APIs: FileReader (for file uploads), MediaDevices (for camera and microphone access), MediaRecorder (for audio recording), Fetch API (for making HTTP requests to the Gemini API).

💡 Future Enhancements
User Authentication: Implement user login to save analysis history.

Database Integration: Store past analyses and recommendations for future reference (e.g., using Firestore).

Advanced UI/UX: More sophisticated image editing tools, audio waveform visualization.

Location-based Recommendations: Integrate weather data or local agricultural advice.

Multi-language Support: Offer analysis in various languages.

Push Notifications: Alert users about optimal times for watering, fertilizing, etc.

Community Sharing: Allow users to share their plant issues and solutions with others.
