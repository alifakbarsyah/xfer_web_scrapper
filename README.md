**Xfer web scrapper API**

Setup
------------

01. cp .env.example .env
02. update file according to your local configuration
03. create database "xferdb"
04. cp config/config.example.json config/config.json
05. update file according to your local configuration
06. please use node v12.14
07. npm install
08. npm install -g eslint
09. cd ./core
10. npm install
11. npm install -g eslint
12. cd ..
13. sequelize db:migrate
14. npm start
15. hit http://localhost:7000
16. postman test env and collection are available on "postman" folder