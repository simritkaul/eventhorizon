# Commands used so far

A record of everything run to build the current state of EventHorizon, in order.

## 1. Kafka and Kafka UI (Docker Compose)

Run from the repo root, where `docker-compose.yml` lives.

```bash
docker compose up -d      # start Kafka and Kafka UI in the background
docker compose ps         # check both containers are Up
```

Kafka UI: http://localhost:8080

## 2. Create the topic and first messages (Kafka UI, manual)

1. Topics > Add a Topic
2. Name: `orders`, Partitions: `1`, everything else default
3. Open the topic > Messages > Produce Message
   - key `123`, value `{"orderId": "123", "status": "CREATED"}`
   - key `124`, value `{"orderId": "124", "status": "CREATED"}`

## 3. Node + TypeScript project

```bash
mkdir producer && cd producer
npm init -y
npm install kafkajs
npm install -D typescript tsx @types/node
npx tsc --init
mkdir src
```

Then edit `package.json` and change:

```json
"type": "module"
```

`npm init -y` defaults to `"commonjs"`. With the `"module": "nodenext"` setting that `tsc --init` generates, that conflicts with ESM `import` syntax and TypeScript reports an error.

Source files created: `src/producer.ts` and `src/consumer.ts`.

## 4. Run the producer and consumer

```bash
# from the producer/ folder
npx tsx src/producer.ts    # sends one message to the "orders" topic, then exits
npx tsx src/consumer.ts    # long-running; stop with Ctrl+C
```

Use `tsx` to run files. Running `tsc <file>` directly fails with TS5112 when a `tsconfig.json` exists.

## 5. Handy commands (not all used yet)

```bash
npx tsc --noEmit              # type-check the whole project without emitting files
docker compose logs kafka     # broker logs, useful when something fails to connect
docker compose stop           # stop containers, keep their state
docker compose start          # start them again
docker compose down           # remove containers
```

No volume is mounted for Kafka's data, so assume `docker compose down` wipes topics, messages and committed offsets. After a `down`, recreate the `orders` topic.

## 6. After cloning the repo fresh

```bash
docker compose up -d
cd producer
npm install               # replaces all the install commands in section 3
```

Then recreate the `orders` topic in Kafka UI (1 partition).

## Topics

Create a 3-partition topic (run from repo root; `kafka:19092` because the command runs inside the container):

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:19092 --create --topic orders-p3 \
  --partitions 3 --replication-factor 1
```

Inspect partitions and leaders:

```bash
docker compose exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server kafka:19092 --describe --topic orders-p3
```

## Consumer groups

Groups are created implicitly when the first consumer with that `groupId` joins.

```bash
# list groups
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:19092 --list

# members, assignments, committed offsets and lag
docker compose exec kafka /opt/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server kafka:19092 --describe --group p3-group
```

## Running the Phase 1 scripts (from producer/)

```bash
npx tsx src/producer-keys.ts   # 9 keyed messages -> orders-p3
npx tsx src/consumer-p3.ts     # group p3-group, topic from TOPIC env var
```

## TODO

- After Ctrl+C on a consumer with a SIGINT `disconnect()` handler, survivors still took ~30s to rebalance. Investigate (suspects: npx/tsx signal propagation, handler not running).
