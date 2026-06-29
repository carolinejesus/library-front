# Sistema de Biblioteca — Frontend

Frontend do Sistema de Gerenciamento de Biblioteca desenvolvido para a disciplina de Laboratório de Desenvolvimento de Sistemas.

A aplicação foi desenvolvida em React com Vite e permite o acesso de dois tipos de usuários: aluno e funcionário.

Backend do projeto: [Backend](https://github.com/carolinejesus/library-system-back)

## Sobre o projeto

O sistema tem como objetivo auxiliar no gerenciamento de uma biblioteca. Por meio da interface web, alunos podem consultar livros, realizar reservas, renovar ou cancelar reservas e baixar recibos. Funcionários podem gerenciar livros, usuários e reservas, além de visualizar um relatório dos livros mais reservados.

Este repositório contém a interface gráfica da aplicação.

## Tecnologias utilizadas

* React
* Vite
* React Router DOM
* Axios
* Bootstrap
* React Toastify
* jsPDF
* Recharts

## Funcionalidades implementadas

### Funcionalidades do aluno

* Login
* Visualização do catálogo de livros
* Pesquisa por título, autor ou gênero
* Filtro por gênero
* Visualização de detalhes do livro
* Reserva de livros
* Visualização das próprias reservas
* Renovação de reserva
* Cancelamento de reserva
* Download de recibo em PDF
* Visualização de capa dos livros
* Alteração de foto de perfil

### Funcionalidades do funcionário

* Login
* Gerenciamento de livros
* Cadastro de título, autor, patrimônio, cópias, descrição, gênero e capa
* Edição de livros
* Exclusão de livros
* Gerenciamento de usuários
* Visualização e gerenciamento de reservas
* Visualização de relatório/ranking de livros mais reservados
* Visualização de capas dos livros

### Funcionalidades gerais

* Interface gráfica web
* Autenticação por token JWT
* Comunicação com API backend
* Internacionalização parcial no catálogo
* Detecção automática do idioma do navegador
* Suporte a português, inglês e espanhol na tela de catálogo

## Como instalar

Clone o repositório:

```bash
git clone https://github.com/carolinejesus/library-front
```

Entre na pasta do projeto:

```bash
cd library-front
```

Instale as dependências:

```bash
npm install
```

## Configuração do ambiente

Crie um arquivo `.env` na raiz do frontend com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:3000
```

Essa variável indica o endereço da API backend.

## Como executar

Com o backend rodando, execute o frontend:

```bash
npm run dev
```

A aplicação será iniciada em:

```text
http://localhost:5173
```

## Telas principais

* Tela de login
* Tela inicial do aluno
* Tela inicial do funcionário
* Catálogo de livros
* Detalhes do livro
* Gerenciamento de livros
* Gerenciamento de usuários
* Gerenciamento de reservas
* Relatório visual de livros mais reservados

## Internacionalização

A tela de catálogo possui suporte inicial à internacionalização. O idioma é detectado automaticamente pelo navegador utilizando `navigator.language`.

Idiomas suportados:

* Português
* Inglês
* Espanhol

## Relatórios e PDF

O sistema possui geração de recibo em PDF para reservas realizadas pelos alunos. O recibo contém informações como aluno, e-mail, livro, autor, status da reserva, data de reserva e data de devolução.

Além disso, a tela do funcionário possui um relatório visual com o ranking dos livros mais reservados.

## Funcionalidades desejadas e não implementadas

* Expandir a internacionalização para todas as telas
* Adicionar upload de capa de livros diretamente pelo sistema
* Impedir cadastro de livro sem imagem de capa
* Criar dashboards mais completos para o funcionário
* Melhorar responsividade em telas menores
* Adicionar testes automatizados
* Melhorar validações visuais nos formulários

## Observações

Este projeto foi desenvolvido individualmente por Caroline Freitas de Jesus, aproveitando uma base de projeto já existente e realizando melhorias e incrementos para atender aos requisitos da tarefa avaliativa.

## Autora

Caroline Freitas de Jesus
