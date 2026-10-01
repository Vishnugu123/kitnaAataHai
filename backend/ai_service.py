import json
import os
import time

from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env")

client = genai.Client(api_key=api_key)

def call_gemini(prompt: str):
    models = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
    ]

    for model in models:
        try:
            print(f"Trying model: {model}")

            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            return response

        except Exception as e:
            print(f"Model {model} failed: {e}")

    raise Exception("All Gemini models failed")


def generate_questions(
    subject: str,
    topics: list[str],
    difficulty: str,
    number_of_questions: int,
):
    prompt = f"""
You are an expert technical assessment generator.

Create {number_of_questions} questions for the following assessment:

Subject:
{subject}

Allowed topics:
{", ".join(topics)}

Difficulty:
{difficulty}

IMPORTANT RULES:

1. Ask questions ONLY from the allowed topics.
2. Do NOT ask anything outside the allowed topics.
3. Test conceptual understanding.
4. Include a mixture of conceptual and code-based questions.
5. Questions should match the requested difficulty.
6. Each question can cover one or more of the allowed topics.
7. Do not repeat the same question.
8. Return valid JSON only.
9. Do not include markdown.
10. expected_answer should contain the ideal answer that will later be used to evaluate the user's answer.

Return exactly this JSON structure:

{{
    "questions": [
        {{
            "question": "string",
            "type": "conceptual or code",
            "difficulty": "{difficulty}",
            "topics": ["topic1"],
            "expected_concepts": ["concept1", "concept2"],
            "expected_answer": "string"
        }}
    ]
}}
"""
    
    response = call_gemini(prompt)

    content = response.text

    result = json.loads(content)

    for index, question in enumerate(result["questions"]):
        question["id"] = index + 1

    return result

def evaluate_answers(questions, answers):
    prompt = f"""
You are an expert technical interviewer.

Evaluate the user's answers against the expected answers and concepts.

Questions:
{json.dumps(questions, indent=2)}

User Answers:
{json.dumps(answers, indent=2)}

IMPORTANT RULES:

1. Evaluate every question.
2. Compare the user's answer with the expected concepts.
3. Do not require the user's wording to exactly match the expected answer.
4. Focus on conceptual understanding.
5. If the answer is empty, mark it as unanswered.
6. Give each question a score from 0 to 10.
7. Identify concepts the user understood.
8. Identify concepts the user missed.
9. Give concise feedback.
10. Return valid JSON only.
11. Do not include markdown.

Return exactly this structure:

{{
    "total_score": 0,
    "max_score": 0,
    "percentage": 0,
    "questions": [
        {{
            "question_id": 1,
            "score": 0,
            "status": "correct, partial, incorrect, or unanswered",
            "understood_concepts": [],
            "missing_concepts": [],
            "feedback": "string"
        }}
    ],
    "overall_feedback": "string",
    "weak_topics": []
}}
"""

    response = call_gemini(prompt)

    content = response.text

    return json.loads(content)