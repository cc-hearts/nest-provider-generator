# nest-provider-generator

The nest-provider-generator is a powerful tool designed to streamline the process of generating Nest providers and their corresponding entities. It simplifies the task of creating and linking providers and entities in your NestJS project, reducing development time and effort.

## Install

```ts
npm install @cc-heart/nest-provider-generator
```

## Usage

mkdir `src/utils/provider.factory.ts` and write `ProviderFactory` as a export function

example:

```ts
import { DataSource } from 'typeorm';
const DATA_SOURCE = 'data_source'

type ctor = { new (...args: any): object };

export const ProviderFactory = (provide: string | ctor, repository: ctor) => {
  return {
    provide,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(repository),
    inject: [DATA_SOURCE],
  };
};

```

Use under the nest root `nest-provider <module_name>` to generator entity provider

## LICENSE

[MIT](./LICENSE)
