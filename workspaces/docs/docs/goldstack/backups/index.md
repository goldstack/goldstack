---
id: backups
title: Backups
---

For production workloads, we recommend configuring automated backups for all S3 buckets and DynamoDB tables using AWS Backup. This guide describes how to set up centralized, cross-account, cross-region backups across your AWS Organization.

## Overview

Goldstack provides two templates for configuring AWS Backup:

- **[backup](../templates/backup/index.md)**: Configures AWS Backup for S3 buckets and DynamoDB tables in an AWS account, with optional cross-account copy to a central vault
- **[backup-central](../templates/backup-central/index.md)**: Sets up a centralized AWS Backup vault in a dedicated account for storing backups from multiple source accounts

## Prerequisites

### AWS Organizations

All accounts must belong to the same AWS Organization. For more information, see [AWS Organizations and Control Tower](../configuration/aws-organizations.md).

### Enable Cross-Account Backup

Before using cross-account backup features, you must enable cross-account backup in your AWS Organizations management account:

1. Log in to the AWS Organizations **management account**
2. Open the AWS Backup console at [https://console.aws.amazon.com/backup](https://console.aws.amazon.com/backup)
3. In **My account**, choose **Settings**
4. For **Cross-account backup**, choose **Turn On**

For detailed instructions, see [Creating backup copies across AWS accounts](https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html).

### Enable Advanced DynamoDB Backup

**Note:** Customers who started using AWS Backup after November 2021 have Advanced DynamoDB backup enabled by default. If you created backup vaults before that date, you need to manually enable this feature.

For cross-account copy of DynamoDB backups to work, you must enable Advanced DynamoDB backup features in each source account and region where you want to back up DynamoDB tables:

1. Open the AWS Backup console at [https://console.aws.amazon.com/backup](https://console.aws.amazon.com/backup)
2. In the left navigation menu, choose **Settings**
3. Under **Advanced features for DynamoDB backups**, choose **Enable**

This setting must be enabled **per region** in **each source account**. If you have DynamoDB tables in multiple regions, repeat this step for each region.

For more information, see [Advanced DynamoDB backup](https://docs.aws.amazon.com/aws-backup/latest/devguide/advanced-ddb-backup.html).


## Architecture

The typical backup architecture includes:

1. **Source accounts**: Deploy the `backup` template to accounts where your S3 buckets and DynamoDB tables reside
2. **Central backup account**: Deploy the `backup-central` template to a dedicated account that will store all backups

When configured, backups created in source accounts are automatically copied to the central backup vault in the destination account.

## Excluding Resources

Resources tagged with `goldstack:no_backup=true` will be excluded from backups.

## See Also

- [AWS Backup Documentation](https://docs.aws.amazon.com/aws-backup/latest/devguide/whatisbackup.html)
- [Creating backup copies across AWS accounts](https://docs.aws.amazon.com/aws-backup/latest/devguide/create-cross-account-backup.html)