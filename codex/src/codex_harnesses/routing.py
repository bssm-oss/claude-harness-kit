import re
from dataclasses import asdict

from .types import RouteResult


TEAM_TRIGGERS = {
    "debate": [
        " vs ",
        " versus ",
        "tradeoff",
        "trade-off",
        "compare",
        "choose",
        "decision",
        "decide",
        "which is better",
        "둘 중",
        "결정",
        "비교",
        "골라",
        "판정",
        "나아",
    ],
    "explore": [
        "investigate",
        "explore",
        "why",
        "root cause",
        "architecture",
        "trace",
        "debug",
        "조사",
        "탐색",
        "왜",
        "원인",
        "구조",
    ],
    "review": [
        "review",
        "audit",
        " pr ",
        "pull request",
        "security",
        "correctness",
        "performance",
        "리뷰",
        "검토",
        "보안",
    ],
    "research": [
        "research",
        "look up",
        "find latest",
        "docs",
        "documentation",
        "spec",
        "조사해줘",
        "리서치",
        "문서",
        "자료",
    ],
}


CHAIN_TRIGGERS = [
    (("bug", "decide"), ["explore", "debate"]),
    (("root cause", "decision"), ["explore", "debate"]),
    (("review", "risk"), ["review", "debate"]),
    (("research", "decide"), ["research", "debate"]),
    (("조사", "결정"), ["explore", "debate"]),
    (("리뷰", "위험"), ["review", "debate"]),
    (("도입", "검토"), ["research", "debate"]),
]


OPTION_PATTERNS = [
    re.compile(r"(?P<a>[A-Za-z0-9_.+/ -]{2,80})\s+vs\.?\s+(?P<b>[A-Za-z0-9_.+/ -]{2,80})", re.I),
    re.compile(r"(?P<a>[A-Za-z0-9_.+/ -]{2,80})\s+versus\s+(?P<b>[A-Za-z0-9_.+/ -]{2,80})", re.I),
    re.compile(r"option\s+a:?\s*(?P<a>[^,;]+).+option\s+b:?\s*(?P<b>[^,;]+)", re.I),
    re.compile(r"(?P<a>[A-Za-z0-9_.+/ -]{2,80})\s+or\s+(?P<b>[A-Za-z0-9_.+/ -]{2,80})", re.I),
    re.compile(r"(?P<a>[\w가-힣_.+/ -]{2,80})\s*(?:와|과|랑)\s*(?P<b>[\w가-힣_.+/ -]{2,80})\s*(?:중|비교|결정)", re.I),
]


def _contains(text: str, needle: str) -> bool:
    return needle in text


def extract_options(request: str) -> tuple[str | None, str | None]:
    for pattern in OPTION_PATTERNS:
        match = pattern.search(request)
        if not match:
            continue
        option_a = _clean_option(match.group("a"))
        option_b = _clean_option(match.group("b"))
        if option_a and option_b and option_a.lower() != option_b.lower():
            return option_a, option_b
    return None, None


def _clean_option(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip(" .,:;?!\"'")
    lowered = value.lower()
    for marker in [" should ", " use ", " choose ", " between ", " prefer "]:
        index = lowered.rfind(marker)
        if index >= 0:
            value = value[index + len(marker):]
            lowered = value.lower()
    value = re.sub(r"\b(compare|choose|decide|결정|비교|골라).*$", "", value, flags=re.I).strip()
    return value[:80]


def classify_request(request: str) -> RouteResult:
    lowered = f" {request.lower()} "
    chain: list[str] = []
    for needles, teams in CHAIN_TRIGGERS:
        if all(_contains(lowered, needle) for needle in needles):
            chain = teams
            break

    scores: dict[str, int] = {}
    for team, triggers in TEAM_TRIGGERS.items():
        scores[team] = sum(1 for trigger in triggers if trigger in lowered)

    if chain:
        team = chain[0]
        confidence = 0.9
        reason = f"matched chained workflow: {' -> '.join(chain)}"
    else:
        team, score = max(scores.items(), key=lambda item: item[1])
        option_a, option_b = extract_options(request)
        if score == 0 and option_a and option_b:
            return RouteResult(
                request=request,
                team="debate",
                confidence=0.8,
                reason="extracted two competing options",
                requires_confirmation=False,
                option_a=option_a,
                option_b=option_b,
            )
        if score == 0:
            return RouteResult(
                request=request,
                team="unknown",
                confidence=0.2,
                reason="no harness trigger matched",
                requires_confirmation=True,
            )
        confidence = min(0.95, 0.55 + (score * 0.15))
        reason = f"matched {score} {team} trigger(s)"

    option_a, option_b = extract_options(request)
    requires_confirmation = confidence < 0.7
    if team == "debate" and not (option_a and option_b):
        requires_confirmation = True
        reason = f"{reason}; debate options need confirmation"

    return RouteResult(
        request=request,
        team=team,
        confidence=confidence,
        reason=reason,
        requires_confirmation=requires_confirmation,
        option_a=option_a,
        option_b=option_b,
        chain=chain,
    )


def route_to_dict(route: RouteResult) -> dict:
    return asdict(route)
