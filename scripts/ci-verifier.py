#!/usr/bin/env python3
"""Verify that CI verifier wiring stays on the expected Python runtime.

This guard is intentionally separate from the Node-based site checks. The site
uses vanilla JavaScript, so syntax/math/audit jobs can keep using Node 22 while
this CI wiring verifier runs on Python.
"""
from __future__ import annotations

from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "ci-verifier.yml"
THIS_SCRIPT = Path("scripts/ci-verifier.py")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> int:
    if not WORKFLOW.exists():
        fail(f"Missing workflow: {WORKFLOW.relative_to(ROOT)}")

    workflow = WORKFLOW.read_text(encoding="utf-8")

    if "actions/setup-python@v5" not in workflow:
        fail("CI verifier workflow must use actions/setup-python@v5.")

    if not re.search(r"python-version:\s*['\"]?3\.12['\"]?", workflow):
        fail("CI verifier workflow must pin python-version to 3.12.")

    if f"python {THIS_SCRIPT.as_posix()}" not in workflow:
        fail(f"CI verifier workflow must run python {THIS_SCRIPT.as_posix()}.")

    if "actions/setup-node" in workflow or re.search(r"\bnode-version\b", workflow):
        fail("CI verifier workflow must not be wired to Node.js.")

    print("CI verifier workflow is wired to Python 3.12.")
    print("Node 22 remains limited to JavaScript site checks, not the CI verifier.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
