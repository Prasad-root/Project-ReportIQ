from groq import Groq
import json
from dotenv import load_dotenv
import os
import re

def extract_json(raw: str) -> str:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if match:
        raw = match.group(0)
    raw = re.sub(r",\s*([}\]])", r"\1", raw)
    return raw.strip()


load_dotenv()
groq_llm_api_key = os.getenv("GROQ_LLM")

client = Groq(api_key=groq_llm_api_key)

def explain_func(user_input: str):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": """You are a medical report analyser. 
                Output strictly valid JSON in this structure:
                {
                  "health_score": "a percentage number between 0 and 100, always include the % sign",
                  "explanation": "A detailed paragraph (at least 6–8 sentences) giving an in-depth medical analysis of the findings, explaining the meaning of abnormal/normal results, possible causes, and their implications for the patient.",
                  "recommendations": ["...", "..."]
                }"""
            },
            {"role": "user", "content": user_input}
        ]
    )

    # Full model output
    full_response = response.choices[0].message.content

    try:
        parsed = json.loads(extract_json(full_response))
    except json.JSONDecodeError:
        parsed = {
            "error": "Invalid JSON",
            "raw_output": full_response
        }

    return parsed

