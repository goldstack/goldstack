
def handler(event, context):
    result = "Hello World"
    return {
        'statusCode' : 200,
        'body': result
    }