# wallet

## Personal Finance Manager

### Introduction

**wallet** is an project to manage personal finance. The [API](root/backend/) allow users creationt, searching, updating and deleting easily their financial movements. Also they have the possibility to use type movements by default and create new ones. Each user access is safety with Authorization Bearer Token. Its deployed on **fly.io**, you can use it in documentation.

### Documentation

You can find the documentation in the next [link](https://app.swaggerhub.com/apis/nahuelpairola/wallet/1.0.0#/info).

### Step by Step: run **wallet** in your machine

To run it locally you must clone this repo and run the next commands to load backend folder and packages installation:

```
cd root/backend
npm install
```

Install PSQL (PostgresSQL) (you can download it [here](https://www.postgresql.org/download/)). To set up your local database follow the next steps:
 1. Create a new database called **wallet**, inside **Servers** -> **PostgreSQL X** -> **Databases**. The 'X' represents version PSQL (for example 14). 
 2. Right click in the database **wallet** and go to **Query Tool**.
 3. Click in **Open File** icon and search the file [**wallet-api-db-tables.sql**](root/backend/models/wallet-api-db-tables.sql). Then executes the scripts by running with the Play icon. You have now the database ready to use.
 4. Repeat the last step with with the file [**wallet-api-db-types-by-default.sql**](root/backend/models/wallet-api-db-types-by-default.sql). You have now the deafult types stored in the database.

In [this location](root/backend/) create a **.env** file and add the enviroment varibles as the file [**.env.git**](root/backend/.env.git) detail.

To use **wallet** run the command: 

```
npm start
```

If you have some troubles, or you find something wrong, please let me know.

Happy codding :)
