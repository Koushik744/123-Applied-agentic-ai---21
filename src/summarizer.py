from src.llm import call_llm


def direct_summarization(text: str) -> str:
    """Approach 1 — Single prompt summarization."""
    prompt = f"""Summarize the following text in a concise and clear manner.

TEXT:
{text}

Write a clear, well-structured summary that captures the main idea and key points."""
    return call_llm(prompt)


def extract_key_information(text: str) -> str:
    """Chain Step 1 — Extract structured key information from the raw text."""
    prompt = f"""Read the following text carefully and extract the key information.
Present your output as structured plain text using exactly these section headings:

MAIN TOPIC:
[State what this text is primarily about in 1-2 sentences]

IMPORTANT FACTS:
[List each important fact on a new line starting with a dash]

IMPORTANT EVENTS OR DEVELOPMENTS:
[List each key event or development on a new line starting with a dash]

IMPORTANT NUMBERS OR STATISTICS:
[List any numbers, percentages, or statistics mentioned, with context]

IMPORTANT CONCLUSIONS:
[List the conclusions or outcomes stated in the text]

TEXT:
{text}

Extract only information that is explicitly present in the text. Do not add any external knowledge."""
    return call_llm(prompt)


def organize_information(extracted_info: str) -> str:
    """Chain Step 2 — Organize and clean the extracted information."""
    prompt = f"""You have received information extracted from a text document.
Your task is to:
1. Organize the information into a clear, logical order
2. Remove any repeated or duplicate points
3. Group related points together
4. Keep only the most relevant and important information

EXTRACTED INFORMATION:
{extracted_info}

Present the organized information in clear sections with headings.
Do not add any new information that was not in the extracted text above."""
    return call_llm(prompt)


def generate_final_summary(organized_info: str) -> str:
    """Chain Step 3 — Generate the final student-friendly summary."""
    prompt = f"""Using only the organized information provided below, write a concise final summary.

Your summary must follow this exact structure:

MAIN IDEA:
[One or two sentences describing the central topic]

KEY POINTS:
- [Point 1]
- [Point 2]
- [Point 3]
- [Point 4 if applicable]
- [Point 5 if applicable]

IMPORTANT CONCLUSION:
[One or two sentences stating the main takeaway]

ORGANIZED INFORMATION:
{organized_info}

Rules:
- Use only the information provided above. Do not introduce external facts.
- Write in clear, simple language suitable for a college student.
- Keep the summary concise and easy to read."""
    return call_llm(prompt)
