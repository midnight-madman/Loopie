import logging
import re

import openai

from settings import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

MIN_WORD_COUNT = 500
MIN_TEXT_LENGTH = 5000
OPENAI_MODEL_MAX_CHARACTERS = 11500

OPENAI_REQUEST_METADATA = dict(model="text-davinci-002",
                               temperature=0.7,
                               max_tokens=256,
                               top_p=1.0,
                               frequency_penalty=0.0,
                               presence_penalty=1)

logger = logging.getLogger(__name__)


def get_open_api_summary(row):
    text = row['content']
    assert text, "NewsItem must have text to create summary"

    # 1 token ~= 4 chars in English
    # model text-davinci-002 has max token input of 4097
    summary, response = None, None
    word_count = len(re.findall(r'\w+', text))
    can_get_summary = word_count > MIN_WORD_COUNT  # and len(text) > MIN_TEXT_LENGTH
    if not can_get_summary:
        logger.info(f'Text has less than minimum {MIN_WORD_COUNT} words (words: {word_count}, text length: {len(text)})')
    else:
        text = text[:OPENAI_MODEL_MAX_CHARACTERS]
        try:
            response = openai.Completion.create(
                prompt=f"{text}\n\nQ: Could you please summarize the article above in three sentences?",
                **OPENAI_REQUEST_METADATA
            )
        except openai.error.InvalidRequestError as ex:
            logger.exception(f'Failed to get summary for text with OpenAI exception {ex}')
            return ''

        summary = response.choices[0].text
        if summary.startswith('\n\nA'):
            summary = summary[4:].lstrip()

    row['summary'] = summary
    row['metadata'] = response
    return row
