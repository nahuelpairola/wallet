# wallet

## Personal Finance Manager

### Introduction

**wallet** is personal project to manage personal finance. The [API](root/backend/) is enable users to create, search, update and delete easily their financial movements.

Its deployed on **fly.io**, you can use it (see )

### Documentation

You can find the documentation in the next [link](https://app.swaggerhub.com/apis/nahuelpairola/wallet/1.0.0#/info)

### Step by Step: run **wallet** in your machine

To run it locally you must clone this repo and run the next commands:

```
npm cmd root/backend
npm install
```

Install PSQL (PostgresSQL) (you can download it [here](https://www.postgresql.org/download/)). To set up you local db follow the next steps:
 1. Create a new database called wallet
 2. Right click in the database **wallet** (created before) and go to **Query Tool**.
 3. Click on the "Open File" icon and open the file **wallet-api-db-tables.sql**. Then push the "Play" icon (execute). You already have you tables.
 4. Repeat the last step with with the file **wallet-api-db-types-by-default.sql**. You hace in types table the default types.

In [this location](root/backend/) create a **.env** file as the [**.env.git**](root/backend/.env.git) enviroment variables detail.

To use **wallet** run the project with the command 

```
npm start
```

If you have some troubles, or you find something wrong, please let me know.

Happy codding :)