#!/usr/bin/env python3
import json
import re
import sys

def fix_spacing_issues(text):
    """Fix common spacing issues in questions"""
    # Fix patterns like "at6", "on20th", "in1974", "class6A", etc.
    text = re.sub(r'\bat(\d)', r'at \1', text)
    text = re.sub(r'\bon(\d)', r'on \1', text)
    text = re.sub(r'\bin(\d)', r'in \1', text)
    text = re.sub(r'\babout(\d)', r'about \1', text)
    text = re.sub(r'\bnumber(\d)', r'number \1', text)
    text = re.sub(r'\bpage(\d)', r'page \1', text)
    text = re.sub(r'\bclass(\d)', r'class \1', text)
    text = re.sub(r'\bJust(\d)', r'Just \1', text)
    text = re.sub(r'\bRoom(\d)', r'Room \1', text)
    text = re.sub(r'\bhas(\d)', r'has \1', text)
    text = re.sub(r'\bborn(\d)', r'born \1', text)
    text = re.sub(r'\btakes(\d)', r'takes \1', text)
    text = re.sub(r'\bare(\d)', r'are \1', text)
    text = re.sub(r'\bhis(\d)', r'his \1', text)
    text = re.sub(r'\bher(\d)', r'her \1', text)
    text = re.sub(r'\bthe(\d)', r'the \1', text)
    text = re.sub(r'\bfor(\d)', r'for \1', text)
    text = re.sub(r'\bbetween(\d)', r'between \1', text)
    text = re.sub(r'\band(\d)', r'and \1', text)

    # Fix patterns like "20th1980" to "20th 1980"
    text = re.sub(r'(\d+(?:st|nd|rd|th))(\d{4})', r'\1 \2', text)

    return text

def fix_json_file(filename):
    """Fix spacing issues in a JSON file"""
    print(f"Processing {filename}...")

    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)

    changes = 0
    for question in data.get('questions', []):
        # Fix question text
        if 'question' in question:
            old_question = question['question']
            new_question = fix_spacing_issues(old_question)
            if old_question != new_question:
                question['question'] = new_question
                changes += 1

        # Fix correctAnswer text
        if 'correctAnswer' in question:
            old_answer = question['correctAnswer']
            new_answer = fix_spacing_issues(str(old_answer))
            if str(old_answer) != new_answer:
                question['correctAnswer'] = new_answer
                changes += 1

        # Fix explanation text
        if 'explanation' in question:
            old_explanation = question['explanation']
            new_explanation = fix_spacing_issues(old_explanation)
            if old_explanation != new_explanation:
                question['explanation'] = new_explanation
                changes += 1

    # Write back
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"  Made {changes} changes")
    return changes

if __name__ == '__main__':
    for filename in sys.argv[1:]:
        fix_json_file(filename)
