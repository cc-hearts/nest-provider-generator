import { ProviderFactory } from '{{providerFactoryPath}}';
{{#if isExistsEntity }}
import { {{ providerEntityImportName }} } from '../entities/{{ providerEntityFileName }}.entity';
{{ else }}
class {{ providerEntityImportName }} {}
{{/if}}

export const {{ providerName }} = '{{ providerNameUpper }}';
export const {{ exportName }} = ProviderFactory({{ providerName }}, {{ providerEntityImportName }});
