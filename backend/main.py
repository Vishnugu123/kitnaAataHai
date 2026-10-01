from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_service import generate_questions,evaluate_answers

assessment_store = {}

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AssessmentSubmission(BaseModel):
    assessment_id: str
    answers: dict[int, str]


class AssessmentRequest(BaseModel):
    subject: str
    topics: list[str]
    difficulty: str
    questions: int


@app.get("/")
def home():
    return {
        "message": "AI Assessment API is running"
    }

@app.post("/api/assessment")
def create_assessment(request: AssessmentRequest):
    result = generate_questions(
        subject=request.subject,
        topics=request.topics,
        difficulty=request.difficulty,
        number_of_questions=request.questions,
    )

    assessment_id = "assessment_1"

    assessment_store[assessment_id] = result

    return {
        "assessment_id": assessment_id,
        "questions": result["questions"],
    }

@app.post("/api/assessment/submit")
def submit_assessment(request: AssessmentSubmission):
    assessment = assessment_store.get(request.assessment_id)

    if not assessment:
        return {
            "error": "Assessment not found"
        }

    result = evaluate_answers(
        questions=assessment["questions"],
        answers=request.answers,
    )

    return result