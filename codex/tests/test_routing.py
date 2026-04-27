from codex_harnesses.routing import classify_request, extract_options


def test_extract_options_from_vs():
    assert extract_options("Redis vs Memcached 결정해줘") == ("Redis", "Memcached")


def test_extract_options_from_or_question():
    assert extract_options("For Python, should indentation use tabs or spaces?") == ("tabs", "spaces")


def test_route_debate_with_options():
    route = classify_request("PostgreSQL vs MongoDB 결정해줘")

    assert route.team == "debate"
    assert route.requires_confirmation is False
    assert route.option_a == "PostgreSQL"
    assert route.option_b == "MongoDB"


def test_route_debate_from_extracted_or_options():
    route = classify_request("For Python, should indentation use tabs or spaces?")

    assert route.team == "debate"
    assert route.requires_confirmation is False
    assert route.option_a == "tabs"
    assert route.option_b == "spaces"


def test_route_review():
    route = classify_request("Review this PR for security and correctness")

    assert route.team == "review"
    assert route.confidence >= 0.7


def test_route_chained_explore_to_debate():
    route = classify_request("Investigate this bug and decide the safest fix")

    assert route.team == "explore"
    assert route.chain == ["explore", "debate"]


def test_route_unknown_requires_confirmation():
    route = classify_request("hello there")

    assert route.team == "unknown"
    assert route.requires_confirmation is True
