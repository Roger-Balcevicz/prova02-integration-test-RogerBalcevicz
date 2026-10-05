import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { SimpleReporter } from '../simple-reporter';

describe('JSONPlaceholder API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://jsonplaceholder.typicode.com';

  const postSchema = {
    type: 'object',
    properties: {
      userId: { type: 'number' },
      id: { type: 'number' },
      title: { type: 'string' },
      body: { type: 'string' }
    },
    required: ['userId', 'id', 'title', 'body']
  };

  p.request.setDefaultTimeout(30000);

  beforeAll(() => p.reporter.add(rep));
  afterAll(() => p.reporter.end());

  describe('GET', () => {
    it('lista todos os posts', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts`)
        .expectStatus(StatusCodes.OK)
        .expectJsonLength(100);
    });

    it('busca um post pelo id', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts/{id}`)
        .withPathParams('id', 1)
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema(postSchema)
        .expectJsonLike({ id: 1, userId: 1 });
    });

    it('filtra posts por usuário', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts`)
        .withQueryParams('userId', 1)
        .expectStatus(StatusCodes.OK)
        .expectJsonLength(10);
    });

    it('retorna 404 para post inexistente', async () => {
      await p
        .spec()
        .get(`${baseUrl}/posts/9999`)
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });

  describe('POST', () => {
    it('cria um novo post', async () => {
      const novoPost = {
        userId: 1,
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph()
      };

      await p
        .spec()
        .post(`${baseUrl}/posts`)
        .withJson(novoPost)
        .expectStatus(StatusCodes.CREATED)
        .expectJsonSchema(postSchema)
        .expectJsonLike(novoPost);
    });
  });

  describe('PUT', () => {
    it('substitui um post existente', async () => {
      const postAtualizado = {
        id: 1,
        userId: 1,
        title: faker.lorem.sentence(),
        body: faker.lorem.paragraph()
      };

      await p
        .spec()
        .put(`${baseUrl}/posts/1`)
        .withJson(postAtualizado)
        .expectStatus(StatusCodes.OK)
        .expectJson(postAtualizado);
    });
  });

  describe('PATCH', () => {
    it('atualiza parcialmente o título de um post', async () => {
      const title = faker.lorem.sentence();

      await p
        .spec()
        .patch(`${baseUrl}/posts/1`)
        .withJson({ title })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({ id: 1, title });
    });
  });

  describe('DELETE', () => {
    it('remove um post', async () => {
      await p.spec().delete(`${baseUrl}/posts/1`).expectStatus(StatusCodes.OK);
    });
  });
});
