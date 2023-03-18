[!embed](./../shared/getting-started-project.md)

For local testing, this module uses [DynamoDBLocal](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html). 

Since DynamoDBLocal is run using Java, we recommend to [install Java](https://www.java.com/download/ie_manual.jsp) to perform local testing.

You can confirm that Java is configured correctly by running:

```
$ java -version
java version "11.0.3" 2019-04-16 LTS
Java(TM) SE Runtime Environment 18.9 (build 11.0.3+12-LTS)
Java HotSpot(TM) 64-Bit Server VM 18.9 (build 11.0.3+12-LTS, mixed mode)
```

Local testing also supports a fallback using Docker when Java is not installed, but this is currently [not recommended](https://github.com/goldstack/goldstack/pull/309) to be used.

[!embed](./../shared/getting-started-infrastructure.md)

### 3. Development

[!embed](./development.md)
