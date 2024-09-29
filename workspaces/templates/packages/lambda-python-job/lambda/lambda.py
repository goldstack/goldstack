import ujson

def handler(event, context):
    print(ujson.dumps([{"key": "hello world"}, 81, True]));
    result = "Hello World"
    return {
        'statusCode' : 200,
        'body': result
    }
