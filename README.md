# PD Hours Control

Sistema de controle de horas trabalhadas por squads e funcionários.

## 📋 Sobre o Projeto

PD Hours Control é uma API para gerenciamento de horas trabalhadas, permitindo:
- Cadastro de squads e funcionários
- Lançamento de horas trabalhadas por funcionário
- Relatórios por squad e período
- Cálculo de totais e médias de horas

## 🚀 Tecnologias

### Backend
- .NET 10
- Entity Framework Core
- PostgreSQL
- Swagger / OpenAPI

### Frontend
- React 19
- TypeScript
- Vite
- React Router DOM

## 📦 Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [PostgreSQL 16+](https://www.postgresql.org)
- [Git](https://git-scm.com)

## 🔧 Configuração do Ambiente

### 1. Clone o repositório

```
git clone https://github.com/Mariana-SN/PDHoursControlAPIChallenge.git
cd PDHoursControlAPIChallenge
```

### 2. Configurar o Banco de Dados PostgreSQL

#### 2.1 Baixe o instalador

https://www.postgresql.org/download/windows/

#### 2.2 Crie o database:

Crie um novo database de nome PDHoursControl via interface pgAdmin ou terminal

```
psql -U postgres

CREATE DATABASE "PDHoursControl";

\l

\q

```

### 3. Configurações do Backend

#### 3.1 Navegue até a pasta da API:

PDHoursControl.API

#### 3.2 No arquivo appSettings.json:

Altere o valor de Password para a senha que você configurou.

```
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=PDHoursControl;Username=postgres;Password=SuaSenha"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}

```

#### 3.3. Execute a API

Para rodar a API, execute-a utilizando o Visual Studio.

#### 3.4. Página do Swagger

Para visualizar os enpoints e testá-los via swagger, acesse:

```
https://localhost:7033/swagger/index.html
```

### 4. Configurações do Frontend

Utilize o Visual Studio Code.

#### 4.1. Navegue até a pasta do frontend

```
cd PD-Hours-Control-WEB-PROJECT
```

#### 4.2. Instale as dependências

```
npm install
```

#### 4.3. Execute o frontend em desenvolvimento

```
npm run dev
```

#### 4.4. Acesse a aplicação
Abra o navegador e acesse: 

```
http://localhost:5173
```
