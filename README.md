# Automated testing tool ecommerce project

Automated testing tool sample project. This project should pass all test cases in automated testing tool if all environment variables are properly set up

## Getting started

### Prerequisites

In order to install and run this project locally, you would need to have the following installed on you local machine.

* [**Node JS**](https://nodejs.org/en/)
* [**Express**](https://expressjs.com/)
* [**MySQL**](https://www.mysql.com/downloads/)

### Installation

* Clone this repository

```sh
git clone https://github.com/TuringEnterprises/backend-challenge-autotest-project.git
```

* Navigate to the project directory

```sh
cd path/to/ecommerce-shop

```

* Run `npm install` or `yarn` to instal the projects dependencies
* create a `.env` file and copy the contents of the `.env.sample` file into it and supply the values for each variable

```sh
cp .evn.sample .env
```

* Create a MySQL database and run the `sql` file in the database directory to migrate the database

```sh
cat ./src/database/database.sql | mysql -u <dbuser> -D <databasename> -p
```