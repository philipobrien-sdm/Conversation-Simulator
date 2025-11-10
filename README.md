# Perspective Shift AI

## What is this Tool?

Perspective Shift AI is a tool to foster empathy and improve communication by showing you how different people might interpret the same text. It uses Google's Gemini AI to analyze a piece of writing from one or two unique demographic perspectives that you define. The goal is to reveal potential sensitivities, highlight different interpretations, and provide guidance for building bridges between differing viewpoints.

## Core Features

- **Custom Persona Builder:** Define up to two unique personas using traits like age, nationality, profession, and political views.
- **Significance Sliders:** Fine-tune each persona by specifying how important each trait is to their identity, from "not significant" (0) to "core identity" (10).
- **Detailed Perspective Reports:** For each persona, get a comprehensive breakdown of their likely summary, key interpretations, emotional responses, and potential sensitivities.
- **Comparative Analysis:** When using two personas, the tool generates a third report highlighting points of convergence, divergence, and provides actionable guidance for facilitating respectful dialogue between them.
- **Export to HTML:** Download the complete analysis as a clean, self-contained, interactive HTML file, perfect for sharing or archiving.

## See it in Action: Example Reports

Check out these pre-generated reports to see what the tool can do. These were created using the "Pineapple on Pizza?" example text with different randomly generated personas.

- **Example Report 1:** A comparison between a pragmatic, atheist Construction Worker and an empathetic, non-traditional Stay-at-home Parent.
- **Example Report 2:** A comparison between a logical, under-18 Accountant and a tradition-conscious, under-18 Japanese Stay-at-home Parent.

## 🚀 Installation and Setup in Google AI Studio

Follow these steps to download the code and run your own instance of the application in Google AI Studio.

### Prerequisites

- **Google Account:** You need a Google account to use Google AI Studio.
- **Gemini API Key:** The application requires your own Gemini API key to function.
  1. Go to Google AI Studio.
  2. Click on "Get API key" in the top-left menu.
  3. Follow the instructions to create a new API key.
  4. Copy and save this key somewhere safe. You will need it in Step 3.

### Step 1: Download the Project from GitHub

This step is for users who have cloned this project from a Git repository.

1.  On the repository page, click the green `< > Code` button.
2.  In the dropdown menu, select "Download ZIP".
3.  Save the ZIP file to your computer and unzip it. You will now have a folder named something like `perspective-shift-ai-main`.

### Step 2: Prepare the ZIP for AI Studio

This is the most important step. AI Studio requires the `index.html` file to be at the top level of the zip file, but a GitHub download puts it inside a folder. You must re-zip the core files.

1.  **Open the folder.** Navigate inside the unzipped `perspective-shift-ai-main` folder. You should see all the project files and folders (`index.html`, `App.tsx`, `components`, etc.).
2.  **Select the application files.** Select all the files and folders inside this directory that are needed for the app.
    - Include:
      - `App.tsx`
      - `components/` (folder)
      - `constants.ts`
      - `index.html`
      - `index.tsx`
      - `metadata.json`
      - `services/` (folder)
      - `types.ts`
      - `utils/` (folder)
      - `README.md`
      - `Examples/` (folder)
    - Do not go back up and select the parent folder. Stay inside the `perspective-shift-ai-main` folder.
3.  **Create the new ZIP file.** With all the app files selected, right-click and choose:
    - **Windows:** "Send to" > "Compressed (zipped) folder".
    - **Mac:** "Compress [X] items".
4.  Rename the new ZIP file to something clear, like `aistudio-perspective-shift-upload.zip`.

**CRITICAL:** By zipping the contents directly, you ensure that `index.html` is at the root of your new zip file, which is what AI Studio needs.

### Step 3: Upload and Run in AI Studio

1.  **Go to the Google AI Studio App Gallery:** Open your web browser and navigate to `aistudio.google.com/app`.
2.  **Create a New App:** Click "Create new" and select "Zip upload".
3.  **Upload Your ZIP:** Select the `aistudio-perspective-shift-upload.zip` file you created in the previous step. AI Studio will build the project and launch the application.
4.  **Add Your API Key:**
    1.  Once the project is loaded, locate the "Secrets" panel on the left-hand side (it looks like a key icon 🔑).
    2.  Click "Add new secret".
    3.  For the **Name**, enter `API_KEY` (this must be exact).
    4.  For the **Value**, paste the Gemini API key you obtained in the Prerequisites step.
    5.  Click **Save**.

Your application is now set up and ready to use!

## 📖 How to Use This Tool

1.  **Provide Text:** Copy and paste any text into the "Text to Analyze" area. You can also click "Load Example" to start with a pre-filled text.
2.  **Build Personas:** Configure one or two personas using the dropdowns and significance sliders.
3.  **Generate Analysis:** Click the "Generate Analysis" button. The AI will process the text and generate a multi-tabbed report.
4.  **Explore the Report:** Use the tabs to explore the different analysis views and the final comparison. You can export the full report to a single HTML file.

## Important Limitations: What This Tool Does NOT Do

- **It is NOT a fact-checker.** The tool analyzes potential interpretations, not the truthfulness of the text's claims.
- **The AI is not a real person.** The analysis is a sophisticated prediction based on the data provided. It is a simulation of a perspective, not a replacement for talking to actual people. Use its analysis as a starting point for empathy, not as a definitive statement on any demographic group.
- **Context is key.** The tool analyzes the text you provide in isolation. The broader context of who the author is, where it was published, and the ongoing cultural conversation is something you must still consider.

## Our Goal

The purpose of this tool is to empower you with a new lens for empathy. By making different potential interpretations more visible, we hope to help you become a more considerate reader, a more effective communicator, and a more engaged global citizen.

## 🔒 Privacy

- **API Key:** Your API key is managed securely by Google AI Studio's secrets manager and is never exposed in the client-side code.
- **User Data:** All text and persona configurations are sent to the Gemini API only when you click "Generate Analysis." No data is stored or logged outside of that single transaction.
