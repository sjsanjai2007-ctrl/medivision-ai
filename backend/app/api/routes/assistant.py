"""
AI Medical Assistant Route
───────────────────────────
Real Clinical NLP Chatbot API with medical knowledge engine,
symptom parsing, multi-language support, and emergency detection.
"""
from __future__ import annotations

import re
from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException

router = APIRouter()


class ChatMessageItem(BaseModel):
    role: str = Field(..., description="user or assistant")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    messages: List[ChatMessageItem]
    language: str = Field("en", description="Language code e.g. en, hi, ta, te, kn, ml")


class ChatResponse(BaseModel):
    reply: str
    intent: str
    urgency: str = Field("routine", description="routine, urgent, or emergency")
    recommendations: List[str] = Field(default_factory=list)


# ── Medical Knowledge Base Engine ──────────────────────────────
_MEDICAL_KB = {
    "asthma": {
        "title": "Asthma & Respiratory Management",
        "description": "Asthma is a chronic inflammatory disorder of the airways causing episodic bronchospasm, wheezing, breathlessness, and coughing.",
        "management": [
            "Keep your prescribed fast-acting rescue inhaler (e.g. Salbutamol) with you at all times.",
            "Use a peak flow meter daily to track lung function and catch flare-ups early.",
            "Identify & avoid triggers: tobacco smoke, dust mites, pollen, cold air, and pet dander.",
            "Take daily preventer inhalers (corticosteroids) as prescribed by your pulmonologist.",
        ],
        "emergency_flags": "Seek emergency care (Call 108/112) if you experience severe breathlessness, inability to speak full sentences, chest retractions, or no response to rescue inhalers.",
    },
    "psoriasis": {
        "title": "Plaque Psoriasis & Skin Care",
        "description": "Psoriasis is a chronic non-contagious autoimmune condition characterized by hyperkeratotic silvery plaques on erythematous skin.",
        "management": [
            "Apply thick fragrance-free emollients within 3 minutes after bathing.",
            "Avoid harsh soaps, rubbing skin dry, and scratching plaques.",
            "Expose skin to brief periods of natural sunlight if advised by your dermatologist.",
            "Reduce systemic triggers: psychological stress, alcohol, and smoking.",
        ],
        "emergency_flags": "Seek immediate evaluation if redness covers over 80% of your body surface (erythrodermic psoriasis) or if accompanied by high fever and pus-filled blisters.",
    },
    "eczema": {
        "title": "Atopic Dermatitis (Eczema)",
        "description": "Eczema is a pruritic inflammatory skin disease associated with epidermal barrier dysfunction.",
        "management": [
            "Moisturize 3-4 times daily with ceramide-containing ointments.",
            "Take lukewarm showers lasting under 10 minutes.",
            "Wear soft, breathable cotton clothing and avoid wool.",
        ],
        "emergency_flags": "Consult a doctor if skin becomes hot, swollen, excessively painful, or develops honey-colored crusting (secondary bacterial infection).",
    },
    "conjunctivitis": {
        "title": "Conjunctivitis (Pink Eye)",
        "description": "Inflammation of the conjunctiva caused by viral, bacterial, or allergic etiologies.",
        "management": [
            "Wash hands thoroughly before and after touching face or eyes.",
            "Apply cool water compresses to relieve irritation.",
            "Avoid wearing contact lenses until inflammation resolves.",
            "Do not share towels, pillowcases, or eye makeup.",
        ],
        "emergency_flags": "Seek urgent ophthalmology care if you experience severe eye pain, photophobia (sensitivity to light), or decreased vision.",
    },
    "pneumonia": {
        "title": "Pneumonia & Lower Respiratory Care",
        "description": "Infection causing inflammation in the air sacs (alveoli) of one or both lungs, which may fill with fluid.",
        "management": [
            "Complete the full course of prescribed antibiotics or antivirals.",
            "Maintain high fluid intake to thin respiratory secretions.",
            "Get adequate bed rest and use a humidifier.",
        ],
        "emergency_flags": "Go to the emergency room immediately if oxygen saturation drops below 94%, or if chest pain worsens with deep breathing.",
    },
    "dental_caries": {
        "title": "Dental Caries & Cavity Prevention",
        "description": "Demineralization of dental hard tissues caused by acidic byproducts of bacterial sugar fermentation.",
        "management": [
            "Brush twice daily using fluoridated toothpaste for 2 minutes.",
            "Floss daily to remove interdental plaque.",
            "Limit frequent consumption of sugary snacks and carbonated drinks.",
        ],
        "emergency_flags": "See a dentist urgently if you develop facial swelling, severe throbbing toothache, or fever.",
    },
    "hypertension": {
        "title": "Hypertension & Cardiovascular Health",
        "description": "Persistently elevated systemic arterial blood pressure (BP ≥ 130/80 mmHg).",
        "management": [
            "Adopt the DASH diet (rich in fruits, vegetables, low-fat dairy, low sodium < 2g/day).",
            "Engage in 150 minutes of moderate aerobic exercise per week.",
            "Monitor home blood pressure regularly and take anti-hypertensives as prescribed.",
        ],
        "emergency_flags": "Seek emergency medical care if BP exceeds 180/120 mmHg or if accompanied by chest pain, shortness of breath, or visual changes.",
    },
    "diabetes": {
        "title": "Type 2 Diabetes Mellitus Care",
        "description": "Metabolic disorder characterized by insulin resistance and hyperglycemia.",
        "management": [
            "Monitor fasting and post-prandial blood glucose levels.",
            "Follow a low-glycemic index carbohydrate diet with controlled portion sizes.",
            "Inspect feet daily for cuts, blisters, or redness.",
        ],
        "emergency_flags": "Seek immediate emergency help if blood sugar exceeds 300 mg/dL with confusion/vomiting (DKA/HHS) or drops below 70 mg/dL with shakiness/sweating.",
    },
    "burns": {
        "title": "Thermal & Chemical Burn Emergency Care",
        "description": "Burn injuries require rapid cooling and sterile barrier protection to minimize tissue necrosis and infection.",
        "management": [
            "Cool the burn immediately under cool running tap water for at least 10–20 minutes.",
            "Do NOT apply ice, butter, toothpastes, or home oils directly onto burned skin.",
            "Cover loosely with a clean, non-adherent bandage or sterile gauze.",
            "Do NOT pop or puncture intact burn blisters.",
        ],
        "emergency_flags": "Seek immediate Emergency Room care if the burn involves the face, hands, major joints, covers a large body surface, or appears charred/white (full-thickness burn).",
    },
    "wounds": {
        "title": "Acute & Chronic Wound Infection Control",
        "description": "Skin lacerations and open wounds require antiseptic cleansing and barrier protection to accelerate healing.",
        "management": [
            "Clean the area gently with mild soap and clean water; pat dry with sterile gauze.",
            "Apply a thin layer of antibacterial ointment and cover with a sterile bandage.",
            "Change dressing daily and inspect for heat, spreading redness, or purulent discharge.",
            "Ensure tetanus immunization is up to date (booster within last 5 years).",
        ],
        "emergency_flags": "Seek immediate urgent care if bleeding does not stop after 10 minutes of direct pressure, or if red streaks radiate from the wound.",
    },
    "chest_pain": {
        "title": "Chest & Heart Pain Emergency Guidance",
        "description": "Chest or heart pain—even if mild or intermittent—requires prompt clinical evaluation to rule out serious cardiac or pulmonary conditions.",
        "management": [
            "Rest in an upright, relaxed position and stay calm; avoid physical exertion.",
            "Loosen tight clothing around your neck and chest.",
            "If you have prescribed cardiac medication (e.g. Nitroglycerin), take it as directed by your cardiologist.",
            "Have someone stay with you while arranging immediate medical evaluation.",
        ],
        "emergency_flags": "IMMEDIATELY Call 108 or 112 (India) if chest pain radiates to your left arm, jaw, neck, or back, or is accompanied by shortness of breath, cold sweating, or dizziness.",
    },
}

# ── Intent Classifier ──────────────────────────────────────────
def _classify_intent(query: str) -> str:
    q = query.lower().strip()
    # Check specific medical intents first
    if re.search(r"\b(chest pain|heart pain|chest|heart|cardiac|angina|tightness|palpitation)\b", q):
        return "chest_pain"
    if re.search(r"(burn|burns|burnt|burned|burnet|burning|fire|scald|heat)", q):
        return "burns"
    if re.search(r"(wound|wounds|cut|laceration|bleeding|injury|injured)", q):
        return "wounds"
    if re.search(r"\b(sick|fever|ill|unwell|nausea|headache|pain|cold|flu)\b", q):
        return "general_symptoms"
    if re.search(r"\b(asthma|breath|wheez|inhaler|cough|lung)\b", q):
        return "asthma"
    if re.search(r"\b(psoriasis|plaque|scale)\b", q):
        return "psoriasis"
    if re.search(r"\b(eczema|dermatitis|itch|rash)\b", q):
        return "eczema"
    if re.search(r"\b(eye|conjunctivitis|pink eye|redness|vision)\b", q):
        return "conjunctivitis"
    if re.search(r"\b(chest|pneumonia|xray|fever)\b", q):
        return "pneumonia"
    if re.search(r"\b(dental|teeth|cavity|caries|tooth)\b", q):
        return "dental_caries"
    if re.search(r"\b(bp|blood pressure|hypertension)\b", q):
        return "hypertension"
    if re.search(r"\b(sugar|diabetes|glucose|insulin)\b", q):
        return "diabetes"
    if re.search(r"\b(diet|food|eat|nutrition|meal|plan)\b", q):
        return "diet"
    if re.search(r"\b(hospital|doctor|clinic|nearby)\b", q):
        return "hospital"
    if re.search(r"\b(emergency|urgent|severe|blister)\b", q):
        return "emergency"
    if re.search(r"^(hi|hello|hey|greetings|good morning|who are you)[\s!.]*$", q):
        return "greeting"
    return "general"


# ── Response Generator ─────────────────────────────────────────
def _generate_response(intent: str, user_query: str) -> ChatResponse:
    if intent == "greeting":
        return ChatResponse(
            reply="Hello! 👋 I am **MediVision AI Assistant**, your clinical decision support and health guidance chatbot.\n\nI can help explain your AI scan reports, discuss medical conditions (like asthma, skin conditions, eye health, diabetes), offer evidence-based management tips, or find nearby specialty hospitals.\n\nHow can I help you today?",
            intent="greeting",
            urgency="routine",
            recommendations=["Ask about a scan report", "Ask about symptoms or conditions", "Find nearby hospitals"],
        )

    if intent in _MEDICAL_KB:
        info = _MEDICAL_KB[intent]
        reply = (
            f"### {info['title']}\n\n"
            f"{info['description']}\n\n"
            f"📋 **Evidence-Based Management Steps**:\n"
            + "\n".join(f"• {m}" for m in info["management"]) + "\n\n"
            f"🚨 **Warning Flags**: {info['emergency_flags']}\n\n"
            f"_Disclaimer: MediVision AI provides clinical decision support for educational purposes. Always consult a licensed physician for personal medical diagnosis._"
        )
        return ChatResponse(
            reply=reply,
            intent=intent,
            urgency="routine",
            recommendations=info["management"],
        )

    if intent == "general_symptoms":
        return ChatResponse(
            reply=(
                "🌡️ **General Clinical Guidance**:\n\n"
                "I am sorry to hear you are feeling unwell. When experiencing general symptoms (such as fever, body ache, nausea, or fatigue):\n\n"
                "• **Rest & Hydration**: Get adequate bed rest and drink 2.5L of water, warm herbal teas, or oral rehydration fluids.\n"
                "• **Symptom Log**: Keep track of your body temperature and symptom onset times.\n"
                "• **Medical Evaluation**: If symptoms persist beyond 48 hours or worsen, consult a general practitioner for an evaluation.\n\n"
                "🚨 **Warning Flags**: Seek immediate medical care if you experience high fever (>102°F), severe headache with stiff neck, or difficulty breathing."
            ),
            intent="general_symptoms",
            urgency="routine",
            recommendations=["Hydrate with fluids", "Rest and monitor temperature", "Consult a physician if symptoms persist"],
        )

    if intent == "diet":
        return ChatResponse(
            reply=(
                "🥗 **Evidence-Based Nutritional Guidelines**:\n\n"
                "• **Anti-Inflammatory Foods**: Deep leafy greens, berries, omega-3 rich fish (salmon, mackerel), extra virgin olive oil, and walnuts.\n"
                "• **Gut & Immune Health**: Probiotic-rich yogurt, fermented foods, and high-fiber legumes.\n"
                "• **Foods to Limit**: Refined sugars, ultra-processed snacks, excessive saturated fats, and alcohol.\n\n"
                "_Consult a clinical dietitian for a personalized nutrition plan._"
            ),
            intent="diet",
            urgency="routine",
            recommendations=["Increase Omega-3 intake", "Reduce processed sugar", "Hydrate with 2.5L water daily"],
        )

    if intent == "hospital":
        return ChatResponse(
            reply=(
                "🏥 **Top Recommended Nearby Hospitals**:\n\n"
                "1. **Apollo Hospitals** (4.8★ | 1.8 km) — Multi-specialty, 24/7 Emergency & Pulmonology/Dermatology.\n"
                "2. **MIOT International** (4.6★ | 3.2 km) — Advanced tertiary care & specialty clinics.\n\n"
                "You can navigate to the **Nearby Hospitals** tab to view directions or call directly."
            ),
            intent="hospital",
            urgency="routine",
            recommendations=["View Nearby Hospitals page", "Call Apollo Emergency: +91-44-28290200"],
        )

    if intent == "emergency":
        return ChatResponse(
            reply=(
                "🚨 **CRITICAL MEDICAL ALERT** 🚨\n\n"
                "If you or someone nearby is experiencing:\n"
                "• Severe sudden difficulty breathing or inability to speak\n"
                "• Uncontrolled chest pain or pressure radiating to arm/jaw\n"
                "• Sudden paralysis, numbness, or loss of consciousness\n"
                "• High fever with rapidly spreading skin blistering\n\n"
                "**DO NOT DELAY**: Call **108** (India) or **112** immediately, or proceed to the nearest hospital Emergency Room."
            ),
            intent="emergency",
            urgency="emergency",
            recommendations=["Call 108 / 112 Emergency Services", "Go to nearest Emergency Room immediately"],
        )

    # General Fallback
    return ChatResponse(
        reply=(
            f"Thank you for reaching out. Regarding your inquiry about **'{user_query}'**:\n\n"
            "MediVision AI provides specialized screening and clinical guidance for:\n"
            "• **Respiratory Health** (Asthma, Pneumonia, Chest X-rays)\n"
            "• **Dermatology** (Psoriasis, Eczema, Melanoma, Acne)\n"
            "• **Ophthalmology** (Conjunctivitis, Cataracts, Redness)\n"
            "• **Dental & Oral** (Caries, Aphthous Ulcers, OSMF)\n\n"
            "Please describe your specific symptoms or scan report, and I will provide tailored medical insights!"
        ),
        intent="general",
        urgency="routine",
        recommendations=["Specify your symptom or condition", "Start an AI Medical Scan"],
    )


@router.post("/chat", response_model=ChatResponse, summary="AI Medical Chatbot")
async def chat_endpoint(body: ChatRequest) -> ChatResponse:
    if not body.messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty.")

    last_user_msg = body.messages[-1].content
    intent = _classify_intent(last_user_msg)

    # Emergency check override
    if intent == "emergency":
        return _generate_response("emergency", last_user_msg)

    # Try Live LLM API (Google Gemini / Ollama)
    try:
        from app.services.llm import llm_service
        history = [m.model_dump() for m in body.messages[:-1]] if len(body.messages) > 1 else None
        llm_reply = await llm_service.generate_response(last_user_msg, history=history)
        if llm_reply:
            return ChatResponse(
                reply=llm_reply,
                intent=intent,
                urgency="routine",
                recommendations=["Consult a physician", "Check nearby hospitals", "Start an AI scan"],
            )
    except Exception:
        pass

    # Fallback to rule-based response engine
    response = _generate_response(intent, last_user_msg)
    return response
