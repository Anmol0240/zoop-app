# 🍔 Zoop – Real-Time Fast Food Ordering App

Full-stack food ordering app with **Customer App**, **Admin Dashboard**, and **Socket.io** real-time updates.

---

## 📁 Project Structure

```
zoop/
├── server/      → Node.js + Express + Socket.io + MongoDB
├── client/      → Customer React App (port 3000)
└── admin/       → Admin React App (port 3001)
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) OR MongoDB Atlas URI

### 1. Clone & Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# Admin
cd ../admin
npm install
```

### 2. Environment Variables

```bash
# server/.env
cp server/.env.example server/.env
# Edit MONGODB_URI if needed

# client/.env
cp client/.env.example client/.env

# admin/.env
cp admin/.env.example admin/.env
```

### 3. Start All (3 terminals)

```bash
# Terminal 1 - Server
cd server && npm start

# Terminal 2 - Customer App
cd client && npm start

# Terminal 3 - Admin
cd admin && npm start
```

### Access
| App | URL |
|-----|-----|
| Customer | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API | http://localhost:5000/api |

**Admin Login:** `admin@zoop.com` / `admin123`

---

## ☁️ Replit Setup

### Step 1: Upload project to Replit

Create 3 separate Repls:
- `zoop-server` → upload `server/` contents
- `zoop-client` → upload `client/` contents  
- `zoop-admin` → upload `admin/` contents

### Step 2: zoop-server Repl

1. Set **Run command**: `npm start`
2. Add **Secrets** (Environment Variables):
   ```
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/zoop
   JWT_SECRET = your_secret_key
   PORT = 5000
   CLIENT_URL = https://zoop-client.yourusername.repl.co
   ADMIN_URL = https://zoop-admin.yourusername.repl.co
   ```
3. Run the Repl and copy the URL (e.g. `https://zoop-server.yourusername.repl.co`)

### Step 3: zoop-client Repl

1. Set **Run command**: `npm start`
2. Add **Secrets**:
   ```
   REACT_APP_API_URL = https://zoop-server.yourusername.repl.co
   ```
3. Set `PORT = 3000` in Secrets

### Step 4: zoop-admin Repl

1. Set **Run command**: `PORT=3001 npm start`
2. Add **Secrets**:
   ```
   REACT_APP_API_URL = https://zoop-server.yourusername.repl.co
   ```

### Step 5: QR Code for Customers

Use any QR code generator (e.g. https://qr.io) to generate a QR code pointing to your **client Repl URL**.

---

## ✨ Features

### Customer
- Mobile-first menu with images
- Add to cart with quantity controls
- Enter table number
- Place order
- Real-time order tracking with animated progress bar

### Admin
- Login-protected dashboard
- Real-time new order notifications
- Update order status (Placed → Preparing → Ready → Completed)
- Menu management (Add/Edit/Delete/Hide items)
- Sales summary stats

---

## 🔌 Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `newOrder` | Server → Admin | New order received |
| `orderStatusUpdated` | Server → Customer + Admin | Order status changed |
| `joinOrder` | Client → Server | Customer subscribes to their order |
| `joinAdmin` | Client → Server | Admin subscribes to admin room |

---

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, React Router v6
- **Backend**: Node.js, Express, Socket.io
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (admin only)
- **Fonts**: Bebas Neue + DM Sans
