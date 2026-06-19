# Vaultly API (TypeScript) — Days 1–2

Banking demo API: auth (Day 1) + accounts, transactions and an atomic transfer service (Day 2).

## Stack
Node + Express 5 + Mongoose + TypeScript. Auth via JWT + bcryptjs. Money stored as integer **pence**.

## Setup
1. Drop these files into your `api/` folder.
2. Install dependencies:
   ```bash
   npm install express mongoose bcryptjs jsonwebtoken dotenv cors
   npm install -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs
   ```
3. Create a `.env` from `.env.example`:
   ```
   PORT=4000
   MONGO_URI=<your Atlas URI, with /vaultly before the ?>
   JWT_SECRET=<long random string>
   ```
   Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
4. Run it:
   ```bash
   npm run dev      # tsx watch — restarts on change
   ```

> MongoDB transactions (used by the transfer service) require a **replica set**.
> Atlas (even free M0) is one, so it works out of the box. A plain standalone
> local mongo will NOT support transactions.

## File map
```
src/
├── types/express.d.ts        # adds req.userId to Express's Request type
├── config/db.ts              # MongoDB connection
├── models/
│   ├── User.ts               # bcrypt hashing in a pre-save hook
│   ├── Account.ts            # balance as integer pence
│   └── Transaction.ts        # the ledger
├── utils/AppError.ts         # error with an HTTP statusCode
├── middleware/auth.ts        # protect: verifies JWT, sets req.userId
├── services/transferService.ts  # ATOMIC transfer (the core of Day 2)
├── controllers/              # auth, account, transfer handlers
├── routes/                   # /api/auth, /api/accounts, /api/transfers
├── app.ts                    # express app + error handler
└── server.ts                 # connects DB, starts listening
```

## Try it (curl)
```bash
# Register + login → copy the token
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Parisa","email":"p@test.com","password":"password123"}'
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"p@test.com","password":"password123"}'

# Create two accounts (note each _id)
curl -X POST http://localhost:4000/api/accounts -H "Authorization: Bearer TOKEN"
curl -X POST http://localhost:4000/api/accounts -H "Authorization: Bearer TOKEN"

# Fund account A with £100 (10000 pence)
curl -X POST http://localhost:4000/api/accounts/A_ID/deposit \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"amount":10000}'

# Transfer £30 (3000 pence) A → B
curl -X POST http://localhost:4000/api/transfers \
  -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"fromAccountId":"A_ID","toAccountId":"B_ID","amount":3000}'

# Check balances: A=7000, B=3000
curl http://localhost:4000/api/accounts -H "Authorization: Bearer TOKEN"
```

Failure cases that should be rejected: overdraw (Insufficient funds, 400),
non-positive amount (400), same from/to account (400).
