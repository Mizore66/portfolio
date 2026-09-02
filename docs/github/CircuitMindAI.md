# CircuitMindAI

CircuitMindAI inspects circuit boards: Nova Pro reads the copper, Nova Sonic talks the operator through the fault. Next.js and Express sit on ECS Fargate; GitHub Actions stamps the image.

The public clipping is the exhibit: [Opening Preparation · CircuitMindAI](https://anasqumhiyeh.dev/projects/circuitmindai).

## What runs

- `frontend/` — Next.js 15 (`novalink-frontend`). `npm run dev` / `npm run build`.
- `backend-js/` — Express + `ws`. `npm run dev` (watch) or `npm start`. `npm test` is `test-backend.js`.
- Vision: Amazon Bedrock `amazon.nova-pro-v1:0`.
- Voice: Bedrock bidirectional `amazon.nova-2-sonic-v1:0`.
- Index: Bedrock Knowledge Bases + OpenSearch Serverless.
- Stamp: GitHub Actions → ECR. Bedplate: ECS Fargate.

## Receipts to run it

Requires Node 18+, npm 9+, and AWS credentials for Bedrock / S3 / OpenSearch.

```bash
cd backend-js
npm install
# optional, once: npm run setup-infra
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

```bash
cd backend-js
npm test
```

Do not paste the old "Strategic Impact & Business Value" block. The exhibit already carries the measured line; this README is the same paragraph plus how to start the machines.
