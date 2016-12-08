#Default backend api

###Database (in case of non-rds)
####1. install docker
`curl -sSL https://get.docker.com/ | sh`
####2. prepare volume directory
`sudo mkdir -p /var/lib/postgresql/data`
####3. create DB container
`sudo docker run -d --name starter-db --restart=always -e "PGDATA=/var/lib/postgresql/data/pgdata" -v /var/lib/postgresql/data:/var/lib/postgresql/data --net=host postgres:9.5`
####4. initialize database
```bash
docker exec -it starter-db bash
psql -d template1 -U postgres
create user starter with password 'start123';
create database starter_db;
grant all privileges on database starter_db to starter;
```

###Get project ready
`npm i -d`

###Enjoy
`npm run dev`
