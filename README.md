## Run container environment

```bash
docker-compose up -d
docker exec -it borametatoken_dockertruffle_1 /bin/sh
```
```bash
# in container env
$ /usr/src/app> ▉
```

## Run local test

```bash
truffle test --network docker_dev
#truffle console --network docker_dev
```

## Connect to Rinkeby testnet

```bash
sh rinkeby.sh
```