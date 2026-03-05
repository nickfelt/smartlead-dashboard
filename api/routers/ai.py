"""
AI routes — email sequence generation, variants, rewrite, subject lines.
Uses client's own API key (BYOK model). Full implementation in Phase 4.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from api.middleware.auth import require_active_subscription, log_action
from api.models import (
    UserContext,
    GenerateSequenceRequest,
    GenerateVariantsRequest,
    RewriteRequest,
    SubjectLineRequest,
    SubscriptionTier,
)
from api.config import get_settings

router = APIRouter(prefix="/ai", tags=["ai"])

# ─── Mock AI responses ───────────────────────────────────────────────────────

MOCK_SEQUENCE = [
    {
        "seq_number": 1,
        "seq_delay_details": {"delay_in_days": 0},
        "variants": [
            {
                "subject": "Quick question about {{company_name}}'s outreach",
                "body": (
                    "Hi {{first_name}},\n\n"
                    "I noticed {{company_name}} is growing fast — congrats!\n\n"
                    "We help companies like yours book more meetings through cold email. "
                    "Would a quick 15-minute call make sense this week?\n\n"
                    "Best,\n{{sender_name}}"
                ),
            }
        ],
    },
    {
        "seq_number": 2,
        "seq_delay_details": {"delay_in_days": 3},
        "variants": [
            {
                "subject": "Re: Quick question about {{company_name}}'s outreach",
                "body": (
                    "Hey {{first_name}},\n\n"
                    "Just wanted to bump this up. "
                    "We recently helped a company in {{city}} go from 2% to 8% reply rates in 60 days.\n\n"
                    "Worth a quick chat?\n\n"
                    "{{sender_name}}"
                ),
            }
        ],
    },
    {
        "seq_number": 3,
        "seq_delay_details": {"delay_in_days": 7},
        "variants": [
            {
                "subject": "Last try — {{first_name}}",
                "body": (
                    "{{first_name}},\n\n"
                    "I'll keep this short — if cold email isn't a priority for {{company_name}} right now, no worries at all.\n\n"
                    "If it ever becomes one, feel free to reach back out.\n\n"
                    "{{sender_name}}"
                ),
            }
        ],
    },
]

MOCK_SUBJECT_LINES = [
    "Quick question for {{first_name}}",
    "How {{company_name}} could book 3x more meetings",
    "{{first_name}}, saw this and thought of you",
    "Is outbound a priority for {{company_name}} in Q1?",
    "Honest question, {{first_name}}",
    "The reply rate issue most {{title}}s don't fix",
    "2 minutes — worth it for {{company_name}}?",
]


# ─── Helper ──────────────────────────────────────────────────────────────────

def _check_ai_access(user: UserContext, provider: str) -> None:
    """Validate the user has access to AI writer and has configured the key."""
    # Check tier
    if user.subscription_tier == SubscriptionTier.free:
        raise HTTPException(
            status_code=403,
            detail="AI writer requires a Starter plan or higher. Upgrade in Settings.",
        )
    # In mock mode, skip key checks
    settings = get_settings()
    if settings.use_mock:
        return
    # Real check: verify user has the key configured for the selected provider
    # (Phase 4 will implement the full lookup from Supabase)


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/generate-sequence")
async def generate_sequence(
    body: GenerateSequenceRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    """Generate a full multi-step email sequence using the client's API key."""
    _check_ai_access(user, body.provider.value)
    settings = get_settings()

    if settings.use_mock:
        steps = MOCK_SEQUENCE[: body.steps]
        await log_action(request, user, "ai.generate_sequence", "ai", "mock", {"provider": body.provider.value, "steps": body.steps})
        return {"sequences": steps, "provider": body.provider.value, "mock": True}

    # Phase 4: call real Claude or OpenAI with client's decrypted API key
    raise NotImplementedError("Real AI generation requires Phase 4")


@router.post("/generate-variants")
async def generate_variants(
    body: GenerateVariantsRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    """Generate A/B/C variants for an existing sequence step."""
    _check_ai_access(user, body.provider.value)
    settings = get_settings()

    if settings.use_mock:
        variants = [
            {
                "label": chr(65 + i),  # A, B, C
                "subject": f"{body.existing_subject} (variant {chr(65 + i)})",
                "body": body.existing_body + f"\n\n[Variant {chr(65 + i)}: different angle]",
            }
            for i in range(body.num_variants)
        ]
        return {"variants": variants, "mock": True}

    raise NotImplementedError("Real variant generation requires Phase 4")


@router.post("/rewrite")
async def rewrite(
    body: RewriteRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    """Rewrite existing copy in a different style."""
    _check_ai_access(user, body.provider.value)
    settings = get_settings()

    if settings.use_mock:
        style_map = {
            "More concise": body.text[: len(body.text) // 2] + "...",
            "More casual": body.text.replace("I", "Hey,\n\nI").replace("Best,", "Cheers,"),
            "More formal": body.text.replace("Hey", "Dear {{first_name}}"),
            "More urgent": body.text + "\n\n[Time-sensitive: spots filling up fast]",
            "Add social proof": body.text + "\n\nWe've helped 50+ companies like {{company_name}} achieve similar results.",
        }
        return {"rewritten": style_map.get(body.style, body.text), "style": body.style, "mock": True}

    raise NotImplementedError("Real rewrite requires Phase 4")


@router.post("/subject-lines")
async def generate_subject_lines(
    body: SubjectLineRequest,
    request: Request,
    user: UserContext = Depends(require_active_subscription),
):
    """Generate subject line suggestions for an email body."""
    _check_ai_access(user, body.provider.value)
    settings = get_settings()

    if settings.use_mock:
        return {
            "subject_lines": [
                {"subject": s, "type": ["curiosity", "personalization", "benefit", "question"][i % 4]}
                for i, s in enumerate(MOCK_SUBJECT_LINES[: body.num_suggestions])
            ],
            "mock": True,
        }

    raise NotImplementedError("Real subject lines require Phase 4")
