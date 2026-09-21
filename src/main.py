import sys
import os

# Add the project root to sys.path so imports work when running: python src/main.py
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.config import MODEL_NAME
from src.summarizer import (
    direct_summarization,
    extract_key_information,
    organize_information,
    generate_final_summary,
)

LINE = "=" * 60
THIN = "-" * 60


def load_sample_text() -> str:
    file_path = os.path.join(PROJECT_ROOT, "data", "sample_text.txt")
    if not os.path.exists(file_path):
        raise FileNotFoundError(
            f"Sample text file not found.\nExpected location: {file_path}"
        )
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read().strip()
    if not text:
        raise ValueError("The file data/sample_text.txt is empty. Please add content.")
    return text


def header(title: str) -> None:
    print()
    print(LINE)
    print(title)
    print(LINE)


def section(title: str) -> None:
    print()
    print(title)
    print(THIN)


def main() -> None:
    print(LINE)
    print("  PROMPT CHAINING FOR SUMMARIZATION")
    print("  Multi-Step Prompt Pipelines — Experiment")
    print(f"  Model : {MODEL_NAME}")
    print(LINE)

    # ------------------------------------------------------------------ load
    print("\n[*] Loading sample text from data/sample_text.txt ...")
    try:
        text = load_sample_text()
    except (FileNotFoundError, ValueError) as exc:
        print(f"\nERROR: {exc}")
        sys.exit(1)

    section("INPUT TEXT")
    print(text)

    # ------------------------------------------ Approach 1: Direct Summary
    header("APPROACH 1: DIRECT SUMMARIZATION  (1 LLM call)")
    print("[*] Sending the complete text to the LLM in a single prompt ...")

    try:
        direct_summary = direct_summarization(text)
    except (EnvironmentError, PermissionError, ConnectionError, RuntimeError, ValueError) as exc:
        print(f"\nERROR: {exc}")
        sys.exit(1)

    section("DIRECT SUMMARY")
    print(direct_summary)

    # ------------------------------------------ Approach 2: Prompt Chaining
    header("APPROACH 2: MULTI-STEP PROMPT CHAIN  (3 LLM calls)")

    # Step 1 ---------------------------------------------------------------
    section("STEP 1: KEY INFORMATION EXTRACTION")
    print("[*] Prompt: Extract main topic, facts, events, statistics, and conclusions from the text.")
    print("[*] Input : Original text")
    print("[*] Calling LLM ...")

    try:
        extracted = extract_key_information(text)
    except (EnvironmentError, PermissionError, ConnectionError, RuntimeError, ValueError) as exc:
        print(f"\nERROR in Step 1: {exc}")
        sys.exit(1)

    print("\n[STEP 1 OUTPUT]")
    print(extracted)

    # Step 2 ---------------------------------------------------------------
    section("STEP 2: INFORMATION ORGANIZATION")
    print("[*] Prompt: Organize the extracted information, remove repetition, and group related points.")
    print("[*] Input : Output from Step 1  <-- This is the chaining!")
    print("[*] Calling LLM ...")

    try:
        organized = organize_information(extracted)
    except (EnvironmentError, PermissionError, ConnectionError, RuntimeError, ValueError) as exc:
        print(f"\nERROR in Step 2: {exc}")
        sys.exit(1)

    print("\n[STEP 2 OUTPUT]")
    print(organized)

    # Step 3 ---------------------------------------------------------------
    section("STEP 3: FINAL SUMMARY GENERATION")
    print("[*] Prompt: Generate a concise student-friendly summary (main idea, key points, conclusion).")
    print("[*] Input : Output from Step 2  <-- Chaining continues!")
    print("[*] Calling LLM ...")

    try:
        chained_summary = generate_final_summary(organized)
    except (EnvironmentError, PermissionError, ConnectionError, RuntimeError, ValueError) as exc:
        print(f"\nERROR in Step 3: {exc}")
        sys.exit(1)

    print("\n[STEP 3 OUTPUT — FINAL CHAINED SUMMARY]")
    print(chained_summary)

    # ---------------------------------------------------- Side-by-side compare
    header("COMPARISON")

    section("DIRECT SUMMARIZATION  (Approach 1 — 1 LLM call)")
    print(direct_summary)

    section("CHAINED SUMMARIZATION  (Approach 2 — 3 LLM calls)")
    print(chained_summary)

    # ------------------------------------------------------- Closing remarks
    header("EXPERIMENT COMPLETED")
    print("Observations:")
    print("  Approach 1 — Direct Summarization")
    print("    - Uses  1 LLM call with the full text")
    print("    - Fast, but less structured")
    print()
    print("  Approach 2 — Prompt Chaining")
    print("    - Uses  3 sequential LLM calls")
    print("    - Step 1 output  -->  Step 2 input")
    print("    - Step 2 output  -->  Step 3 input")
    print("    - More structured; each step refines the information")
    print()
    print("Compare the depth, structure, and clarity of both summaries above.")
    print(LINE)
    print()


if __name__ == "__main__":
    main()
