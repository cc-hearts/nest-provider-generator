import { ProviderFactory } from '../../utils/provider.factory';
{{#if isExistsEntity}}
import { {{ providerEntityImportName }} } from '../entities/{{ providerEntityFileName }}.entity';
{{ else }}
class {{ providerEntityImportName }} {}
{{/if}}

export const {{ providerName }} = '{{ providerNameUpper }}';
export const {{ exportName }} = ProviderFactory({{ providerName }}, {{ providerEntityImportName }});
