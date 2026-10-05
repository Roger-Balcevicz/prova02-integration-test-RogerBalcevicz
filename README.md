# Prova 02 - Integration Tests

> Testes de integração de API com JestJS e PactumJS.

## GitHub Actions

[![Node.js CI](https://github.com/Roger-Balcevicz/prova02-integration-test-RogerBalcevicz/actions/workflows/node.js.yml/badge.svg?branch=main)](https://github.com/Roger-Balcevicz/prova02-integration-test-RogerBalcevicz/actions/workflows/node.js.yml)

## SonarCloud

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Roger-Balcevicz_prova02-integration-test-RogerBalcevicz&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Roger-Balcevicz_prova02-integration-test-RogerBalcevicz)

## Getting Started

### Prerequisites

- NodeJS `v22`

### How to run?

Inside of the project folder run:

1. `npm install`
1. `npm run ci`

After that you should see a `./output` folder with some `HTML` reports.

Para rodar só os testes da prova: `npm run scenario`

## Prova 02 - Restful Booker

API escolhida: [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html), um CRUD de reservas de hotel. Os testes estão em `test/restful_booker.spec.ts`.

Cenários:

| # | Cenário | Método | Status esperado |
|---|---------|--------|-----------------|
| 1 | API responde o ping | GET `/ping` | 201 |
| 2 | Gera token com usuário e senha válidos | POST `/auth` | 200 |
| 3 | Não gera token com senha errada | POST `/auth` | 200 (`Bad credentials`) |
| 4 | Lista os ids das reservas | GET `/booking` | 200 |
| 5 | Cadastra uma nova reserva | POST `/booking` | 200 |
| 6 | Busca a reserva cadastrada pelo id | GET `/booking/{id}` | 200 |
| 7 | Encontra a reserva filtrando pelo nome | GET `/booking?firstname=&lastname=` | 200 |
| 8 | Não cadastra reserva sem campos obrigatórios | POST `/booking` | 500 |
| 9 | Não altera reserva sem token | PUT `/booking/{id}` | 403 |
| 10 | Altera todos os dados da reserva | PUT `/booking/{id}` | 200 |
| 11 | Altera só as datas da reserva | PATCH `/booking/{id}` | 200 |
| 12 | Exclui a reserva | DELETE `/booking/{id}` | 201 |
| 13 | Não encontra a reserva excluída | GET `/booking/{id}` | 404 |

Obs: os status 500 (cenário 8) e 201 no DELETE (cenário 12) são o que a API retorna nesses casos, por isso os testes esperam esses códigos.

### APIs under test

- [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html)
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)
- [Toolshop API](https://api.practicesoftwaretesting.com/api/documentation)
- [Deck of Cards](https://deckofcardsapi.com/)
- [http bin](http://httpbin.org/)
- [rick and morty api](https://rickandmortyapi.com/documentation/#rest)
- [D&D Combat API](https://dnd-combat-api-7f3660dcecb1.herokuapp.com/api)
- [Petstore](https://petstore.swagger.io/#/)
- [ServeRest](https://serverest.dev/#/)

### Docs

- [PactumJS](https://pactumjs.github.io/)
