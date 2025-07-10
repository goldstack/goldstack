# Shared config for all lambdas in the API

resource "aws_iam_role" "lambda_exec" {
  name = "lambda-api-role-${random_id.id.hex}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

}

resource "aws_iam_role_policy_attachment" "lambda_admin_role_attach" {
  role       = aws_iam_role.lambda_exec.name
  # Gives this lambda full access to everything. Consider restricting rules to only the resources this lambda will require.
  policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess"
}

