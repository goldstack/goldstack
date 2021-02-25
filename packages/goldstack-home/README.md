## Prerequisites

- A Route53 hosted zone for the domain
- The domains are not referenced in any other CloudFront distributions

## Notes

- By default all resources in `_next/static` will be cached.
- Setting up the infrastructure can take up to 30 min
- Deploying new website versions should only take a few seconds
- See this [blog article](https://simonecarletti.com/blog/2016/08/redirect-domain-https-amazon-cloudfront/) to see how a similar setup could be created manually.
- AWS has a default limit of the number of SSL certificates per account. If you are reaching this limit, you can simply make a service request with AWS to increase it.
- Redirect configured as CNAME rather than its own bucket and CloudFront distribution due to [this post](https://www.reddit.com/r/aws/comments/7jyisk/https_redirect_on_s3_bucket_access_denied_error/)

## Trouble Shooting

### Check CloudFront configuration for Redirect Domain

Get the domain from the CloudFront distribution with your redirect domain and issue a request as the following.

```
curl -I -H 'Host: www.javadelight.org' d1o21txwkefj80.cloudfront.net
```

You should get a result similar to the below:

```
HTTP/1.1 301 Moved Permanently
Server: CloudFront
Date: Fri, 05 Jun 2020 20:18:57 GMT
Content-Type: text/html
Content-Length: 183
Connection: keep-alive
Location: https://www.javadelight.org/
X-Cache: Redirect from cloudfront
Via: 1.1 b2f6943465d79fdac69ff5e361607cf1.cloudfront.net (CloudFront)
X-Amz-Cf-Pop: SYD4-C2
X-Amz-Cf-Id: pSmjra6obpAoToyy7OI4vgCUC_PHbKo89LM48I-f5XX2ZMYdxy99ew==
```
