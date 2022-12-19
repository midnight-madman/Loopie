import openai

from settings import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

MIN_TEXT_LENGTH = 5000
OPENAI_MODEL_MAX_CHARACTERS = 12400

OPENAI_REQUEST_METADATA = dict(model="text-davinci-002",
                               temperature=0.7,
                               max_tokens=256,
                               top_p=1.0,
                               frequency_penalty=0.0,
                               presence_penalty=1)


def get_open_api_summary(row):
    text = row['content']
    # 1 token ~= 4 chars in English
    # model text-davinci-002 has max of 4097
    # max: 4097 - 100 (output) = 4097 tokens ~= 16400 chars
    summary, response = None, None
    can_get_summary = text and len(text) > MIN_TEXT_LENGTH

    if can_get_summary:
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
