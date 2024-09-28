import marvin
marvin.settings.openai.api_key = 'YOUR_API_KEY'

def handler(event, context):
    result = "Hello World"
    return {
        'statusCode' : 200,
        'body': result
    }