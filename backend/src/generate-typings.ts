import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { AppModule } from './app.module';
import { writeFileSync } from 'fs';
import { printSchema } from 'graphql';

async function generateSchema() {
  const app = await NestFactory.create(AppModule, { logger: false });
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([]);

  writeFileSync('./src/schema.graphql', printSchema(schema));
  console.log('GraphQL schema generated at ./src/schema.graphql');

  await app.close();
}

generateSchema();