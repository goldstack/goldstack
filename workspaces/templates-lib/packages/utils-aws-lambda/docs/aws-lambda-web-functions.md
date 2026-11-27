# AWS Lambda Web Functions: migration assessment

Investigation for [issue #730](https://github.com/goldstack/goldstack/issues/730), written on
2026-11-27.

## Executive summary

AWS Lambda Web Functions (announced 2026-10-12) are a good fit for the parts of Goldstack that
run a single Node.js HTTP server, but they are **not a drop-in replacement** for the current
Event Function based templates.

- **Strong fit:** `lambda-express` and the `goldstack-api` app. Both run one Express app behind
  API Gateway and use `aws-serverless-express` only to adapt the event payload. A Web Function
  lets the same app listen on a port directly.
- **Possible but structural work:** `server-side-rendering` and `serverless-api`. Both create one
  Lambda per route and let API Gateway dispatch on the path. A Web Function endpoint sends every
  request to one server, so these templates would need to be consolidated into a single HTTP
  server (or create one Web Function per route, which is a poor fit).
- **Not applicable:** `lambda-go-gin` (Web Functions only support Node.js and preview Python),
  `lambda-node-trigger` and `lambda-python-job` (event driven), the Cognito trigger Lambdas in
  `user-management`, and the Lambda@Edge functions used by the docs and Next.js apps.

The main blockers are deployment, domains, and routing rather than runtime code:

1. Web Function code is deployed as a **zip in S3** and becomes an immutable **revision** behind an
   **endpoint**. The current deployer uploads a zip directly with `lambda update-function-code`.
2. A Web Function endpoint **cannot have a custom domain**. Goldstack's APIs all use a custom
   domain, so a CloudFront distribution (with OAC and an `IamAuth` endpoint) or API Gateway has to
   stay in front.
3. The per-route Lambda model used by `serverless-api` and `server-side-rendering` does not map
   directly to one endpoint per function.
4. Web Functions are Node.js 24/26 (Arm64) only, with Python 3.15 in preview. Regions are limited
   at launch, although the Goldstack default (`us-west-2`) is supported.

Recommendation: do not migrate existing templates wholesale. Add an **opt-in** Web Function
deployment mode/template and prove it on `lambda-express` first, keeping the Event Function
templates as the default and fallback.

## What Lambda Web Functions provide

Compared with Lambda Event Functions:

| Aspect | Lambda Event Functions (current) | Lambda Web Functions |
| --- | --- | --- |
| Programming model | Handler receives an event and returns a response | Standard HTTP server listens on a port |
| Concurrency | One request per execution environment | Up to 128 requests per environment (default 64) |
| Billing | Wall-clock duration in GB-seconds | Requests + active CPU time + memory for the environment lifetime |
| Response streaming | Optional response streaming | Native, no extra configuration |
| Front door | API Gateway / Function URL | Built-in HTTPS endpoint, or CloudFront/API Gateway in front |
| Custom domain | Supported by API Gateway/CloudFront | Not directly; requires CloudFront or API Gateway |
| Code deployment | Direct zip upload or S3 | Zip in S3, then an immutable revision and an endpoint |
| Runtimes | Many, including Go and Python 3.12 | Node.js 24/26; Python 3.15 preview |
| Architecture | x86 or Arm | Arm64 only |

Important limits from the AWS documentation:

- Deployment package: 512 MB unzipped; environment variables: 32 KB; request headers: 128 KiB.
- Execution environment: 2 vCPU, 2 GB memory, 512 MB `/tmp`, 1,024 file descriptors/processes.
- Request timeout: default 30 s, range 3-900 s. Server must start listening within 10 s.
- Quotas: 10 endpoints and 50 revisions per function; 100,000 requests/s and 2,000 Arm64 vCPUs per
  account and region.
- Launch regions: `us-east-1`, `us-east-2`, `us-west-2`, `ap-northeast-1`, `eu-west-1`.
- Memory is billed for as long as an execution environment exists, **including idle time between
  requests**. There is no confirmed free tier for Web Functions.

Pricing in `us-east-1` (Arm64) is $0.30 per million requests, $0.0000276944 per active
vCPU-second, and $0.0000036667 per GB-second of memory. Event Functions remain $0.20 per million
requests with a 400,000 GB-second monthly free tier.

## Current Lambda inventory

| Package / area | Runtime | Trigger and entry point | HTTP workload | Web Function fit |
| --- | --- | --- | --- | --- |
| `templates/packages/lambda-express` | Node.js 22 | API Gateway REST -> `aws-serverless-express` | Yes, one Express app | Strong |
| `apps/packages/goldstack-api` | Node.js 22 | API Gateway REST -> `aws-serverless-express` | Yes, one Express app | Strong |
| `templates/packages/serverless-api` | Node.js 22 | API Gateway HTTP API -> one event handler per route | Yes, per-route | Weak/structural |
| `templates/packages/server-side-rendering` | Node.js 22 | API Gateway HTTP API + CloudFront -> one SSR handler per route | Yes, per-route | Medium/structural |
| `templates/packages/lambda-go-gin` | Go (`provided.al2`) | API Gateway REST -> Go Gin adapter | Yes | Not supported |
| `templates/packages/lambda-node-trigger` | Node.js 22 | SQS and EventBridge schedule | No | Not applicable |
| `templates/packages/lambda-python-job` | Python 3.12 | SQS and EventBridge schedule | No | Not applicable |
| `templates/packages/user-management` triggers | Node.js 22 | Cognito pre-sign-up / post-confirmation | No | Not applicable |
| Docs, home page and Next.js edge Lambdas | Node.js 22 | CloudFront Lambda@Edge | No | Not applicable |
| CloudFront Functions (`cloudfront-js-*`) | CloudFront JS | Viewer request/response | No | Not applicable |

The four HTTP templates all currently use API Gateway and a Lambda handler. `lambda-express` and
`goldstack-api` wrap an Express app in `aws-serverless-express`. `serverless-api` and
`server-side-rendering` read a `routes/` directory, bundle each route into its own Lambda, and
create an API Gateway route per function (`utils-aws-lambda/src/generateLambdaConfig.ts`).

## Feasibility by workload

### `lambda-express` and `goldstack-api` (strong fit)

These are the closest match. The Express app already handles all paths and methods, including CORS
in the app (`src/server.ts`). A Web Function entry point can replace `src/lambda.ts` with a normal
`app.listen()` using the `AWS_LAMBDA_HTTP_ENDPOINT` value that Lambda injects. The
`aws-serverless-express` dependency and API Gateway can be removed.

Benefits:

- Two to three times fewer cold-start penalties for bursty traffic because each environment serves
  many concurrent requests.
- No API Gateway 29 s integration timeout; Web Functions support up to 900 s.
- Active-CPU billing is better for handlers that wait on a database or downstream API.
- Native response streaming, useful for large responses or SSE.

Costs and caveats:

- Custom domains require a CloudFront distribution per API. This is roughly equivalent in
  operational complexity to the current API Gateway custom-domain setup, but it is a new
  Terraform/ACM/Route 53 path.
- The endpoint must be restricted (`IamAuth` + CloudFront OAC) or it is publicly reachable on its
  own domain.
- The app must bind quickly (10 s initialization timeout).
- CORS remains application-level; that is already the case for these templates.
- Low-traffic deployments may cost more than Event Functions because memory is billed while an
  environment is warm, even when it is idle.

The deployment pipeline is the main work: build the zip, upload it to S3, create a revision, and
update the endpoint. `utils-aws-lambda/src/deployFunction.ts` currently calls
`UpdateFunctionCodeCommand` with a direct `ZipFile`, and Terraform creates the function from an
empty archive before the code is uploaded.

### `server-side-rendering` (medium fit, high effort)

The SSR template already runs behind CloudFront, so replacing the API Gateway origin with a Web
Function endpoint fits the target architecture. The current template renders each route in its own
Lambda, however. A Web Function handles all paths in one server, so migration means either:

- consolidating the route handlers into a single SSR server (a significant template redesign and a
  change to how routes are built), or
- creating one Web Function and endpoint per route, which multiplies infrastructure and loses most
  of the benefit.

SSR is also the workload where the cost case is least clear. React rendering is CPU heavy. If most
of a request is active CPU rather than I/O wait, active-CPU billing can be more expensive than the
current wall-clock GB-second model. The Web Function is a better fit once the server is mostly
waiting on data or streaming, not when it is rendering large trees on every request.

### `serverless-api` (weak fit without a redesign)

The defining feature of this template is one Lambda per route, with API Gateway doing path
dispatch. A Web Function is one HTTP server, so the template's core design would have to change.
The current API Gateway CORS configuration would also need to move into the application for a
direct endpoint. If Goldstack wants a Web Function API template, it should be a new
single-server template rather than a conversion of this one.

### `lambda-go-gin` (not available)

Web Functions support Node.js and a Python preview. Go is not supported. This template must stay
on Event Functions until AWS adds a Go runtime.

### Event, trigger and Edge Lambdas (not applicable)

`lambda-node-trigger`, `lambda-python-job`, the Cognito triggers, Lambda@Edge and CloudFront
Functions are not HTTP servers. Web Functions are explicitly for HTTP request/response workloads;
these should stay as Event Functions.

## Usefulness and cost

The benefit is workload dependent:

| Workload pattern | Likely effect |
| --- | --- |
| API mostly waiting on a database or downstream service | Lower compute cost; active CPU excludes I/O wait |
| Bursty traffic with many concurrent requests | Better latency and fewer cold starts due to multi-concurrency |
| Large or streamed responses | Native streaming; no API Gateway integration timeout |
| CPU-bound SSR or data processing | Neutral to worse; active CPU billing can exceed wall-clock billing |
| Very low traffic | Possibly worse; memory is billed while an environment is warm |
| Go or non-HTTP workloads | No benefit; not supported or not applicable |

The removal of API Gateway is a real saving for the Express templates, but it is partly offset by
the CloudFront distribution required for a custom domain. For the SSR template CloudFront already
exists, so the origin change is the main consideration.

## Blockers and gaps

1. **Deployment model.** Web Function deployments are S3 zip -> revision -> endpoint. The current
   `deployFunction` flow updates function code directly. Terraform support exists via
   `aws_lambdaweb_function`, `aws_lambdaweb_function_revision` and
   `aws_lambdaweb_function_endpoint`, but the function resource uses the Cloud Control API and
   needs `cloudformation:CreateResource`. Revisions are immutable and limited to 50; rollback is
   done by shifting endpoint weights rather than re-uploading code.
2. **Custom domains.** Endpoints do not support custom domains. A CloudFront distribution with an
   `IamAuth` endpoint, OAC (`always-amz-auth`) and a resource-based policy is required. This
   replaces the current API Gateway domain mapping and must be implemented per API.
3. **Routing.** One endpoint maps to one server. The per-route model in `serverless-api` and
   `server-side-rendering` does not translate without consolidation.
4. **Runtimes.** Node.js 24/26 on Arm64 only; Python 3.15 is preview. The repo currently targets
   Node.js 22 and Go, and no template sets an Arm architecture.
5. **Regions.** Only five regions at launch. Goldstack's default `us-west-2` is included, but
   users can configure any region, so a feature must detect unsupported regions and fall back.
6. **Fixed environment size and billing.** 2 vCPU / 2 GB per environment, with memory billed for
   the environment lifetime. There is no provisioned concurrency and no x86 option.
7. **Observability and IAM.** Default log group is `/aws/lambda/web/{function_name}` rather than
   `/aws/lambda/{function_name}`. Endpoint invocation uses `lambda:InvokeWebFunctionEndpoint`;
   API Gateway permissions become obsolete when the endpoint is called directly. Alerts and
   dashboards need updating.
8. **Startup and timeout.** 10 s initialization timeout, 30 s default request timeout. Long
   requests are possible only up to 900 s and only on a direct endpoint; a front door can impose
   its own shorter timeout.

## Suggested migration path

1. **Spike** a single `lambda-express` deployment in a sandbox: run the existing app with
   `app.listen(process.env.AWS_LAMBDA_HTTP_ENDPOINT)`, deploy a revision manually, put CloudFront
   with OAC in front, and compare latency and cost with the current deployment.
2. **Add deployment support** to `utils-aws-lambda`: upload the build zip to S3, create a revision,
   and update the endpoint. Prefer Terraform resources for the long-lived function/revision/
   endpoint and keep a CLI/SDK path for application code updates, mirroring the current
   `template deploy` workflow.
3. **Add an opt-in mode** to `lambda-express` (for example `deploymentType: 'web'`) or a new
   `lambda-express-web` template. Keep the existing Event Function template as the default.
4. **Create a new single-server API/SSR template** if the Web Function model is adopted more
   widely. Do not force the per-route templates into it.
5. **Update docs** with the region, runtime, custom-domain and pricing caveats, and add the
   CloudFront OAC setup for custom domains.
6. **Keep Event Functions** for all trigger, Edge, Go and Python workloads.

## Recommendation

Web Functions are feasible and useful for the Node.js HTTP templates, but the migration is a
template and deployment-pipeline project, not a configuration switch. The best next step is an
opt-in experiment on `lambda-express` (and then `goldstack-api`), with a new single-server template
if the experiment succeeds. The existing per-route and event-driven templates should remain on
Event Functions for now.

## Sources

- [Announcing AWS Lambda Web Functions](https://aws.amazon.com/blogs/aws/announcing-aws-lambda-web-functions-for-fast-consistent-web-app-performance-anywhere/)
- [AWS Lambda Web Functions overview](https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html)
- [Lambda Web Function runtimes](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-runtimes.html)
- [Deploying Web Functions](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-deploying.html)
- [Web Function endpoint access control](https://docs.aws.amazon.com/lambda/latest/dg/web-functions-endpoint-access-control.html)
- [Lambda quotas](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html)
- [AWS Lambda pricing](https://aws.amazon.com/lambda/pricing/)
- [Terraform `aws_lambdaweb_function`](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/lambdaweb_function)
