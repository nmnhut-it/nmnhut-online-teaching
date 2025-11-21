#!/usr/bin/env python3
import json
import re
import sys

def check_file(filename):
    """Find potential errors in a JSON file"""
    print(f"\n{'='*60}")
    print(f"Checking {filename}")
    print('='*60)

    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    errors = []

    for q in data.get('questions', []):
        qid = q.get('id', '?')
        qtype = q.get('type', '')
        question_text = q.get('question', '')
        answer = q.get('correctAnswer', '')
        explanation = q.get('explanation', '')

        # Check for "Chọn ý:" in correctAnswer
        if isinstance(answer, str) and 'Chọn ý:' in answer:
            errors.append(f"  Q{qid}: Incorrect answer format: '{answer}'")

        # Check for odd-one-out type with wrong answer format
        if qtype == 'odd-one-out' and isinstance(answer, str) and 'Chọn ý:' in answer:
            options = q.get('options', [])
            errors.append(f"  Q{qid}: odd-one-out has 'Chọn ý:' answer. Options: {options}")

    if errors:
        print("\nFOUND ERRORS:")
        for error in errors:
            print(error)
    else:
        print("\nNo critical errors found")

    return len(errors)

if __name__ == '__main__':
    total_errors = 0
    for filename in sys.argv[1:]:
        total_errors += check_file(filename)

    print(f"\n{'='*60}")
    print(f"Total errors found: {total_errors}")
    print('='*60)
