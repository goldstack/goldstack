## DO NOT

- Run @goldstack/template-management-cli cli without being prompted to do so

## Terraform

- To check Terraform plan, use `yarn infra plan [deploymentName]`
- To use arbitrary Terraform command, use `yarn infra terraform [deploymentName] [command]`. e.g `yarn infra terraform prod force-unlock -force [id]`
- Note we need to avoid user confirmations, so use `-force` when possible, otherwise warn the user
