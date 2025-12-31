<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

AaharWise
=========

AaharWise is an AI‑powered nutrition and preventive‑health coach that turns your daily plates into clear calorie, macro, and long‑term habit insights (wellness guidance only, not medical advice).

Live App
--------

- Deployed URL: https://aaharwise-116236993080.us-west1.run.app  

Overview
--------

AaharWise helps users understand how their daily food and water intake affects both their current status and future health risk (e.g., weight, metabolic health, lifestyle‑disease tendency). It focuses on prevention and habit‑building, not medical diagnosis or treatment.

Key Features
------------

- **AI nutrition coach persona**  
  - Friendly, non‑judgmental coach tone.  
  - Age‑aware, preventive‑health focus with simple language.

- **Smart meal logging & analysis**  
  - Structured daily logs: meals, snacks, timing, tags (home‑cooked / junk).  
  - Calorie and macro estimates: calories, carbs, protein, fats, fiber.  
  - Water intake tracking and basic activity context.

- **Image‑based plate analysis**  
  - Upload a plate photo; AI identifies foods and estimates calories and macros.  
  - Special handling for juices/milkshakes: user must manually enter ingredients for accurate sugar/nutrient estimation.

- **Health summary & score**  
  - Short, “crispy” daily verdict (status line).  
  - 1–10 health score with creative labels (e.g., optimized, sluggish, red‑lined).  
  - 60‑second fix: 1–2 high‑impact actions for immediate improvement.

- **Long‑term trajectory insight**  
  - Explains short‑term impact (energy, mood, digestion, cravings).  
  - Projects possible 5–10 year risk trends if current pattern continues (framed as tendencies, not diagnoses).

- **History & trends view**  
  - Daily summaries and weekly averages.  
  - Trends in calories, fiber, junk‑food frequency, and hydration.

- **Exports**  
  - CSV export of daily or historical logs.  

- **UI & design**  
  - Modern, lively gradients and glassmorphism‑style cards.  
  - Fuel‑gauge–style health index visual.  
  - Dark mode friendly, responsive layout.

Tech Stack
----------

- **Frontend**: React (TypeScript) rendered via ES modules in the browser  
- **Styling**: Tailwind CSS + custom gradients and card styles  
- **AI**: Google Gemini model (via Google AI Studio build mode)  
- **Deployment**: Deployed directly from Google AI Studio to Cloud Run

Architecture Notes
------------------

- The app is built in Google AI Studio’s app/build mode and uses the platform’s managed integration with Gemini; no client‑side API keys are hard‑coded in the repository.  
- Image analysis and nutrition estimation are encapsulated in a service layer (e.g., `geminiService`) that calls Gemini for:
  - Food recognition from base64‑encoded images  
  - Calorie and macro estimation  
  - Coach narrative generation (summary, score, trajectory, tips)
 
  - 

Disclaimers
-----------

- AaharWise is a **wellness and education tool**, not a medical device.  
- It does **not** provide medical advice, diagnosis, or treatment.  
- Nutrient and risk estimates are approximate and may be inaccurate.  
- Users should consult qualified healthcare professionals for any medical concerns or decisions.

Planned Improvements
--------------------

- Deeper regional food support (e.g., more Indian dish recognition).  
- More detailed habit‑streak tracking and gamification.  
- Optional authentication to sync logs across devices.

[1](https://aaharwise-116236993080.us-west1.run.app)
