# import marvin
# marvin.settings.openai.api_key = 'YOUR_API_KEY'
import ujson

import marvin
marvin.settings.openai.api_key = 'YOUR_API_KEY'

def handler(event, context):
    print(ujson.dumps([{"key": "hello world again again"}, 81, True]));
    result = "Hello World"
    return {
        'statusCode' : 200,
        'body': result
    }