# S3 Buckets for file hosting

# Random id to prevent name collisions when bucket names need to be truncated
resource "random_id" "bucket_name" {
	  byte_length = 4
}

# Creates bucket to store the static website
resource "aws_s3_bucket" "static_files" {
  bucket = "${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-static-files-${random_id.bucket_name.hex}"

  acl = "public-read"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-static-files-${random_id.bucket_name.hex}/*"
    }
  ]
}
EOF

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_website_configuration" "static_files_web" {
  bucket = aws_s3_bucket.static_files.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }

}

resource "aws_s3_bucket" "public_files" {
  bucket = "${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-public-files-${random_id.bucket_name.hex}"

  acl = "public-read"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  policy = <<EOF
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForGetBucketObjects",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-public-files-${random_id.bucket_name.hex}/*"
    }
  ]
}
EOF

  lifecycle {
    ignore_changes = [tags]
  }
}


resource "aws_s3_bucket_website_configuration" "public_files_web" {
  bucket = aws_s3_bucket.public_files.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }

}