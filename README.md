# Prompt Chaining for Summarization
### Experiment: Multi-Step Prompt Pipelines

---

## Objective

Demonstrate how breaking a text summarization task into multiple sequential LLM (Large Language Model) steps — called **Prompt Chaining** — produces more structured and thorough results compared to a single-prompt approach.

---

## What is Prompt Chaining?

**Prompt Chaining** is a technique where the output of one LLM prompt becomes the input for the next prompt. Instead of asking an AI to do everything in one step, you break the task into smaller, focused steps and pass the results through a pipeline.

**Analogy:** Think of it like a factory assembly line — each station performs one specific job, and the product improves as it moves from station to station.

---

## Architecture / Flow

```
Original Text
     |
     |-----> [Approach 1] Single Prompt --> Direct Summary
     |
     |-----> [Approach 2] Prompt Chain:
             |
          STEP 1: Extract Key Information
             |  (output passed as input)
             v
          STEP 2: Organize the Information
             |  (output passed as input)
             v
          STEP 3: Generate Final Summary
```

---

## Project Structure

```
AI AGENT/
│
├── data/
│   └── sample_text.txt        <- Input article (~700 words, AI in Education)
│
├── src/
│   ├── __init__.py
│   ├── config.py              <- API key loading, model name, settings
│   ├── llm.py                 <- Single function to call the Gemini API
│   ├── summarizer.py          <- All 4 summarization functions
│   └── main.py                <- Entry point; runs both approaches
│
├── .env                       <- YOUR API KEY (create this, never commit it)
├── .env.example               <- Template showing required variable
├── .gitignore                 <- Excludes .env from git
├── requirements.txt           <- Python dependencies
├── run.bat                    <- One-click run script for Windows
└── README.md                  <- This file
```

---

## Requirements

- Python 3.9 or higher
- A Google Gemini API key (free tier available at [ai.google.dev](https://ai.google.dev))
- Internet connection

---

## Installation

Open the **AI AGENT** folder in VS Code and open the **integrated terminal** (`` Ctrl+` ``).

### Step 1 — Create a virtual environment

```
python -m venv .venv
```

### Step 2 — Activate the virtual environment

**Windows PowerShell:**
```
.venv\Scripts\Activate.ps1
```

**Windows Command Prompt (CMD):**
```
.venv\Scripts\activate
```

> If PowerShell gives an execution policy error, run:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Step 3 — Install dependencies

```
pip install -r requirements.txt
```

---

## API Key Setup

1. Go to [https://ai.google.dev](https://ai.google.dev) and sign in with your Google account.
2. Click **Get API Key** and create a new key.
3. In the project folder, create a file named `.env` (copy from the example):

**Windows CMD:**
```
copy .env.example .env
```

4. Open `.env` and replace the placeholder:

```
GEMINI_API_KEY=your_actual_api_key_here
```

> **Important:** Never share your `.env` file or commit it to GitHub. The `.gitignore` already excludes it.

---

## How to Run

Make sure your virtual environment is activated, then run:

```
python src/main.py
```

Or double-click `run.bat` (it checks for the virtual environment and `.env` automatically).

---

## Expected Output

The terminal will display:

```
============================================================
  PROMPT CHAINING FOR SUMMARIZATION — Experiment
  Model : gemini-2.0-flash
============================================================

INPUT TEXT
----------
[The full article text]

============================================================
APPROACH 1: DIRECT SUMMARIZATION  (1 LLM call)
============================================================
[*] Sending the complete text to the LLM in a single prompt ...

DIRECT SUMMARY
--------------
[Paragraph-style summary from the model]

============================================================
APPROACH 2: MULTI-STEP PROMPT CHAIN  (3 LLM calls)
============================================================

STEP 1: KEY INFORMATION EXTRACTION
-----------------------------------
[*] Input : Original text
[*] Calling LLM ...

[STEP 1 OUTPUT]
MAIN TOPIC: ...
IMPORTANT FACTS: ...
...

STEP 2: INFORMATION ORGANIZATION
----------------------------------
[*] Input : Output from Step 1  <-- This is the chaining!
[*] Calling LLM ...

[STEP 2 OUTPUT]
[Organized, deduplicated information]

STEP 3: FINAL SUMMARY GENERATION
----------------------------------
[*] Input : Output from Step 2  <-- Chaining continues!
[*] Calling LLM ...

[STEP 3 OUTPUT — FINAL CHAINED SUMMARY]
MAIN IDEA: ...
KEY POINTS: ...
IMPORTANT CONCLUSION: ...

============================================================
COMPARISON
============================================================

DIRECT SUMMARIZATION  (1 LLM call)
...

CHAINED SUMMARIZATION  (3 LLM calls)
...

============================================================
EXPERIMENT COMPLETED
============================================================
```

---

## Explanation of Each Step

| Step | Input | What the LLM Does | Output |
|------|-------|-------------------|--------|
| Direct | Full text | Summarizes in one shot | Paragraph summary |
| Chain Step 1 | Full text | Extracts structured info (topic, facts, numbers, conclusions) | Structured key info |
| Chain Step 2 | Step 1 output | Organizes, deduplicates, groups related points | Clean organized info |
| Chain Step 3 | Step 2 output | Generates final summary with main idea, key points, conclusion | Student-friendly summary |

---

## Direct Summarization vs Prompt Chaining

| Feature | Direct Summarization | Prompt Chaining |
|---------|---------------------|-----------------|
| LLM calls | 1 | 3 |
| Speed | Faster | Slower |
| Structure | Less controlled | More controlled |
| Detail | May miss details | Less likely to miss details |
| Complexity | Simple | Moderate |
| Best for | Quick summaries | Thorough analysis |

---

## Advantages of Prompt Chaining

1. **Better accuracy** — Smaller, focused prompts reduce the chance of the model missing information.
2. **More structure** — Each step enforces a specific output format.
3. **Debuggable** — You can inspect each step's output and identify where errors occur.
4. **Reusable** — Individual steps can be reused in other pipelines.
5. **Handles complexity** — Breaks down tasks that are too complex for a single prompt.

---

## Limitations

1. **More API calls** — Increases cost and latency.
2. **Error propagation** — A mistake in Step 1 can affect all later steps.
3. **Overkill for simple tasks** — For short texts, direct summarization is fine.
4. **Harder to maintain** — More prompts means more things to tune.

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| `GEMINI_API_KEY is missing` | Create `.env` and add your API key |
| `Invalid API key` | Check the key at ai.google.dev — make sure there are no extra spaces |
| `ModuleNotFoundError: google` | Run `pip install -r requirements.txt` |
| `ModuleNotFoundError: dotenv` | Run `pip install python-dotenv` |
| `quota exceeded` | Wait a few minutes; free tier has per-minute limits |
| PowerShell activation error | Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |
| `FileNotFoundError: sample_text.txt` | Make sure you run from the project root folder |

---

## Viva Questions and Answers

**Q1. What is prompt chaining?**
Prompt chaining is a technique where the output of one LLM prompt is used as the input for the next prompt. It breaks a complex task into multiple smaller steps, with each step building on the previous one.

**Q2. Why use multiple prompts instead of one?**
A single prompt has to do everything at once, which can lead to vague or incomplete results. Multiple focused prompts allow the model to concentrate on one task at a time — extracting, then organizing, then summarizing — resulting in more thorough and structured output.

**Q3. What happens in Step 1?**
Step 1 asks the LLM to read the original text and extract key information — the main topic, important facts, important events, any numbers or statistics, and conclusions. The output is structured plain text organized under these headings.

**Q4. What happens in Step 2?**
Step 2 takes the output of Step 1 as input and asks the LLM to organize the extracted information into logical sections, remove repeated points, and group related information together. This cleans and structures the data before summarization.

**Q5. What happens in Step 3?**
Step 3 takes the organized output from Step 2 and asks the LLM to write a final concise summary with three specific parts: a main idea, a list of key points, and an important conclusion. This produces a student-friendly, well-structured summary.

**Q6. What is the difference between direct summarization and prompt chaining?**
Direct summarization sends the entire text to the model in one prompt and asks for a summary in one step. Prompt chaining breaks this into three steps — extracting, organizing, and then summarizing — with each step receiving the previous step's output as input. Chaining gives more control over the output structure and is less likely to miss important information.

**Q7. What are the advantages of prompt chaining?**
It produces more structured output, is easier to debug (you can see each intermediate step), handles complex tasks better, and allows individual steps to be reused in other pipelines.

**Q8. What are the limitations?**
It requires more API calls, which means higher cost and longer execution time. Errors in early steps can affect later steps. For simple or short texts, it may be more effort than necessary.

**Q9. Why should API keys not be hard-coded?**
If you hard-code an API key in your source code and push it to GitHub, anyone who sees the code can use your key — potentially incurring costs or misusing your account. Using environment variables keeps the key outside the codebase. The `.env` file is excluded from git by the `.gitignore`.

**Q10. How can this experiment be improved?**
Possible improvements include: adding more chain steps (e.g., sentiment analysis or keyword extraction), allowing the user to input their own text, saving outputs to a file, comparing performance across multiple models, adding a web interface, or measuring and displaying the token count and time taken for each step.
#   1 2 3 - A p p l i e d - a g e n t i c - a i - - - 2 1  
 