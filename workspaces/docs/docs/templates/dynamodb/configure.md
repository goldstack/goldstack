In order to provide a basic configuration for the DynamoDB table, we only need to define the name of the table we want to use.

The template will create a basic table with this name with a partition and sort key. Further configuration of the table can be performed in code using migrations (`updateTable`). This can be used to define additional indices. Infrastructure configuration can be extended using Terraform.
