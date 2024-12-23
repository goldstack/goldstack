output "alias_details" {
  description = "The alias config"
  value       = module.open_next_zone.alias_details
}

output "bucket_name" {
  description = "The name of the s3 bucket"
  value       = module.open_next_zone.bucket_name
}

output "bucket_arn" {
  description = "The ARN of the s3 bucket"
  value       = module.open_next_zone.bucket_arn
}

output "zone_config" {
  description = "The zone config"
  value       = module.open_next_zone.zone_config
}

output "behaviours" {
  description = "The behaviours for the zone"
  value       = module.open_next_zone.behaviours
}

output "custom_error_responses" {
  description = "The custom error responses for the zone"
  value       = module.open_next_zone.custom_error_responses
}

output "cloudfront_url" {
  description = "The URL for the cloudfront distribution"
  value       = module.open_next_zone.cloudfront_url
}

output "cloudfront_distribution_id" {
  description = "The ID for the cloudfront distribution"
  value       = module.open_next_zone.cloudfront_distribution_id
}

output "cloudfront_staging_distribution_id" {
  description = "The ID for the cloudfront staging distribution"
  value       = module.open_next_zone.cloudfront_staging_distribution_id
}

output "alternate_domain_names" {
  description = "Extra CNAMEs (alternate domain names) associated with the cloudfront distribution"
  value       = module.open_next_zone.alternate_domain_names
}
