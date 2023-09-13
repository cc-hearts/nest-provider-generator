# nest-provider-generator

The nest-provider-generator is a powerful tool designed to streamline the process of generating Nest providers and their corresponding entities. It simplifies the task of creating and linking providers and entities in your NestJS project, reducing development time and effort.

## Install

```ts
npm install @cc-heart/nest-provider-generator
```

## Usage

Created at the root of the project `nestProvider.config.js`

example:

```ts
export default {
  // providerFactory path
  providerFactoryPath: '../../utils/provider.factory.js',
}
```

Use under the nest root `nest-provider <module_name>` to generator entity provider

## LICENSE

[MIT](./LICENSE)
