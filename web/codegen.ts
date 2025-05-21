import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: ['../api/src/schema.gql'],
  documents: ['./src/**/*.tsx', './src/**/*.ts'],
  generates: {
    './src/gql/': {
      // https://the-guild.dev/graphql/codegen/plugins/presets/preset-client
      preset: 'client',
      plugins: ['typescript',
        'typescript-operations',
        'typescript-urql',],
      config: {
        strictScalars: true,
        enumsAsTypes: true,
        withHooks: true,
        skipTypename: false,
        scalars: {
          DateTime: 'string',
        },
      },
      presetConfig: {
        // https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#how-to-disable-fragment-masking
        fragmentMasking: false,
      },
    },
  },
};

export default config;