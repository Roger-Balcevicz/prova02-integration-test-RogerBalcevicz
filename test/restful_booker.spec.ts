import pactum from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { faker } from '@faker-js/faker';
import { eachLike, int, string } from 'pactum-matchers';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker API', () => {
  const p = pactum;
  const rep = SimpleReporter;
  const baseUrl = 'https://restful-booker.herokuapp.com';

  const reserva = {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 100, max: 2000 }),
    depositpaid: true,
    bookingdates: {
      checkin: '2026-12-10',
      checkout: '2026-12-15'
    },
    additionalneeds: 'Breakfast'
  };

  const schemaReserva = {
    type: 'object',
    properties: {
      firstname: { type: 'string' },
      lastname: { type: 'string' },
      totalprice: { type: 'number' },
      depositpaid: { type: 'boolean' },
      bookingdates: {
        type: 'object',
        properties: {
          checkin: { type: 'string' },
          checkout: { type: 'string' }
        },
        required: ['checkin', 'checkout']
      },
      additionalneeds: { type: 'string' }
    },
    required: [
      'firstname',
      'lastname',
      'totalprice',
      'depositpaid',
      'bookingdates'
    ]
  };

  p.request.setBaseUrl(baseUrl);
  p.request.setDefaultTimeout(30000);

  beforeAll(async () => {
    p.reporter.add(rep);

    await p
      .spec()
      .post('/auth')
      .withJson({
        username: 'admin',
        password: 'password123'
      })
      .expectStatus(StatusCodes.OK)
      .stores('token', 'token');
  });

  afterAll(() => p.reporter.end());

  describe('Health check', () => {
    it('deve responder o ping indicando que a API está no ar', async () => {
      await p
        .spec()
        .get('/ping')
        .expectStatus(StatusCodes.CREATED)
        .expectBody('Created');
    });
  });

  describe('Autenticação', () => {
    it('deve gerar um token ao informar usuário e senha válidos', async () => {
      await p
        .spec()
        .post('/auth')
        .withJson({
          username: 'admin',
          password: 'password123'
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonMatch({ token: string() });
    });

    it('não deve gerar token quando a senha estiver errada', async () => {
      await p
        .spec()
        .post('/auth')
        .withJson({
          username: 'admin',
          password: faker.internet.password()
        })
        .expectStatus(StatusCodes.OK)
        .expectJson({ reason: 'Bad credentials' });
    });
  });

  describe('Reservas', () => {
    it('deve listar os ids das reservas cadastradas', async () => {
      await p
        .spec()
        .get('/booking')
        .expectStatus(StatusCodes.OK)
        .expectHeaderContains('content-type', 'application/json')
        .expectJsonMatch(eachLike({ bookingid: int() }))
        .expectResponseTime(10000);
    });

    it('deve cadastrar uma nova reserva', async () => {
      await p
        .spec()
        .post('/booking')
        .withHeaders('Accept', 'application/json')
        .withJson(reserva)
        .expectStatus(StatusCodes.OK)
        .expectJsonMatch({ bookingid: int() })
        .expectJson('booking', reserva)
        .stores('bookingId', 'bookingid');
    });

    it('deve buscar a reserva cadastrada pelo id', async () => {
      await p
        .spec()
        .get('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.OK)
        .expectJsonSchema(schemaReserva)
        .expectJson(reserva);
    });

    it('deve encontrar a reserva filtrando pelo nome do hóspede', async () => {
      await p
        .spec()
        .get('/booking')
        .withQueryParams({
          firstname: reserva.firstname,
          lastname: reserva.lastname
        })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike([{ bookingid: '$S{bookingId}' }]);
    });

    it('não deve cadastrar reserva sem os campos obrigatórios', async () => {
      await p
        .spec()
        .post('/booking')
        .withHeaders('Accept', 'application/json')
        .withJson({ firstname: faker.person.firstName() })
        .expectStatus(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it('não deve alterar a reserva sem o token de acesso', async () => {
      await p
        .spec()
        .put('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .withJson(reserva)
        .expectStatus(StatusCodes.FORBIDDEN)
        .expectBody('Forbidden');
    });

    it('deve alterar todos os dados da reserva com PUT', async () => {
      const reservaAlterada = {
        ...reserva,
        totalprice: reserva.totalprice + 100,
        depositpaid: false,
        additionalneeds: 'Late checkout'
      };

      await p
        .spec()
        .put('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .withCookies('token', '$S{token}')
        .withJson(reservaAlterada)
        .expectStatus(StatusCodes.OK)
        .expectJson(reservaAlterada);
    });

    it('deve alterar somente as datas da reserva com PATCH', async () => {
      const novasDatas = {
        checkin: '2027-01-05',
        checkout: '2027-01-08'
      };

      await p
        .spec()
        .patch('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .withCookies('token', '$S{token}')
        .withJson({ bookingdates: novasDatas })
        .expectStatus(StatusCodes.OK)
        .expectJsonLike({
          firstname: reserva.firstname,
          bookingdates: novasDatas
        });
    });

    it('deve excluir a reserva', async () => {
      await p
        .spec()
        .delete('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withCookies('token', '$S{token}')
        .expectStatus(StatusCodes.CREATED);
    });

    it('não deve encontrar a reserva depois de excluída', async () => {
      await p
        .spec()
        .get('/booking/{id}')
        .withPathParams('id', '$S{bookingId}')
        .withHeaders('Accept', 'application/json')
        .expectStatus(StatusCodes.NOT_FOUND);
    });
  });
});
