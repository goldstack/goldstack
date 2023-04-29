# S3 Buckets for file hosting

# Random id to prevent name collisions when bucket names need to be truncated
resource "random_id" "bucket_name" {
	  byte_length = 4
}

# Creates bucket to store static files
resource "aws_s3_bucket" "static_files" {
  bucket = "${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-static-files-${random_id.bucket_name.hex}"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }


  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_public_access_block" "static_files" {
  bucket = aws_s3_bucket.static_files.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "static_files" {
  bucket = aws_s3_bucket.static_files.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "static_files" {
  depends_on = [
	  aws_s3_bucket_public_access_block.static_files,
	  aws_s3_bucket_ownership_controls.static_files,
  ]

  bucket = aws_s3_bucket.static_files.id
  acl    = "public-read"

}

resource "aws_s3_bucket_policy" "static_files" {
  bucket = aws_s3_bucket.static_files.id

  depends_on = [
	  aws_s3_bucket_public_access_block.static_files,
	  aws_s3_bucket_ownership_controls.static_files,
  ]

  policy = data.aws_iam_policy_document.static_files.json
}

data "aws_iam_policy_document" "static_files" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [ 
      "arn:aws:s3:::${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-static-files-${random_id.bucket_name.hex}/*"
    ]
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

# Creates bucket to store the public files
resource "aws_s3_bucket" "public_files" {
  bucket = "${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-public-files-${random_id.bucket_name.hex}"

  # Remove this line if you want to prevent accidential deletion of bucket
  force_destroy = true

  tags = {
    ManagedBy = "terraform"
    Changed   = formatdate("YYYY-MM-DD hh:mm ZZZ", timestamp())
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "aws_s3_bucket_public_access_block" "public_files" {
  bucket = aws_s3_bucket.public_files.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_ownership_controls" "public_files" {
  bucket = aws_s3_bucket.public_files.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "public_files" {
  depends_on = [
	  aws_s3_bucket_public_access_block.public_files,
	  aws_s3_bucket_ownership_controls.public_files,
  ]

  bucket = aws_s3_bucket.public_files.id
  acl    = "public-read"

}

resource "aws_s3_bucket_policy" "public_files" {
  bucket = aws_s3_bucket.public_files.id

  depends_on = [
	  aws_s3_bucket_public_access_block.public_files,
	  aws_s3_bucket_ownership_controls.public_files,
  ]

  policy = data.aws_iam_policy_document.public_files.json
}

data "aws_iam_policy_document" "public_files" {
  statement {
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [ 
      "arn:aws:s3:::${length(var.domain) < 38 ? var.domain : substr(var.domain, 0, 38)}-public-files-${random_id.bucket_name.hex}/*"
    ]
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