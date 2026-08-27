# The Legacy Trunk

> A digital family archive preserving stories, heirlooms, and memories across generations.

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)

---

## 📌 Overview

**The Legacy Trunk** is a secure, private platform designed to help families build a digital archive. It solves the problem of fading family history by allowing members to record stories, build generational family trees, preserve media, and pass down digital heirlooms securely.

Whether you're mapping out your ancestry, sharing a memory from a recent holiday, or scheduling a "Time Capsule" for a future milestone, The Legacy Trunk ensures that your family's shared soul and magic live on.

---

## ✨ Features

### Family Tree Management
* **Generational Mapping**: Build a complete family tree by specifying relationships (parent, spouse, child, etc.).
* **Smart Auto-generation**: The system automatically calculates generations based on the tree structure.
* **Claim Codes**: Invite family members to claim their specific node in the family tree.

### Memories & Stories
* **Rich Story Creation**: Record and share text stories, photos, and videos.
* **Tagging**: Tag specific family members in memories.
* **Visibility Controls**: Keep memories private, share with selected members, or open them to the entire family circle.

### Secure Vault
* **Secondary Protection**: A dedicated, password-protected vault separate from general memories.
* **Cloud Storage**: Highly secure file and heirloom storage backed by AWS S3.

### Time Capsules
* **Scheduled Messages**: Schedule messages or memories to be delivered to family members at a future date using background cron jobs.

### User Management & Authentication
* **Role-Based Access**: Granular roles (Creator, Admin, Member) within family groups.
* **Authentication**: Secure JWT-based authentication with bcrypt password hashing.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User -->|React / Vite| Frontend
    Frontend -->|REST API / JWT| Backend
    Backend -->|Mongoose| MongoDB[(MongoDB)]
    Backend -->|AWS SDK| S3[AWS S3 Storage]
    Backend -->|node-cron| Cron[Scheduled Tasks]
```

### Application Flow
1. **User Authentication**: User logs in and receives an HTTP-only/secure JWT.
2. **Family Selection**: User selects or joins a family group (via Family Code).
3. **Data Retrieval**: Frontend fetches the family tree and memory feeds from the Express API.
4. **Media Upload**: Media is sent to the backend, which securely pipes it to AWS S3 and returns the URL.
5. **Scheduled Tasks**: A Node.js cron job runs in the background to check and deliver Time Capsules.

---

## 📂 Project Structure

```text
The-Legacy-Trunk/
├── frontend/             # React (Vite) application
│   ├── src/
│   │   ├── assets/       # Static files and images
│   │   ├── components/   # Reusable UI components (Modals, Feed, Vault)
│   │   ├── contexts/     # React state management
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Main application views (Home, Profile, Tree)
│   │   └── services/     # API integration logic
│   └── package.json
├── backend/              # Node.js / Express server
│   ├── config/           # Database config
│   ├── controllers/      # Route business logic
│   ├── middlewares/      # Error handling & auth middleware
│   ├── models/           # Mongoose schemas (User, Family, Person, Memory)
│   ├── routes/           # Express API endpoints
│   ├── utiles/           # Helpers and Cron job definitions
│   ├── server.js         # Entry point
│   └── package.json
└── README.md
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| **React + Vite** | Fast, modern frontend framework |
| **Tailwind CSS** | Utility-first styling and responsive UI |
| **Framer Motion** | UI animations and transitions |
| **Node.js** | Backend JavaScript runtime |
| **Express.js** | Backend API framework |
| **MongoDB (Mongoose)**| NoSQL Database for flexible schema design |
| **AWS S3** | Cloud storage for media and Secure Vault files |
| **JWT & bcryptjs** | Authentication, authorization, and password hashing |
| **Node-Cron** | Background task scheduling for Time Capsules |

---

## 🗄️ Database Design

The application uses MongoDB to handle complex relationships between users, families, and memories.

```mermaid
erDiagram
    USER ||--o{ FAMILY : belongs_to
    USER ||--|| SECURE_VAULT : owns
    FAMILY ||--o{ PERSON : contains
    FAMILY ||--o{ MEMORY : has
    PERSON ||--o{ PERSON : related_to
    USER ||--o{ MEMORY : authors
    USER ||--o{ SCHEDULED_MESSAGE : authors
```

* **User**: Represents the physical account.
* **Person**: Represents a node on the Family Tree. (A User can "claim" a Person).
* **Family**: Represents the isolated group containing Persons and Memories.

---

## 🔌 API Documentation

Here are some of the core API endpoints that power the application:

| Method | Endpoint | Description | Auth Required |
| ------ | -------- | ----------- | ------------- |
| POST | `/api/v1/auth/register` | Register a new user account | No |
| POST | `/api/v1/auth/login` | Authenticate user and return JWT | No |
| POST | `/api/v1/families/create`| Create a new family group | Yes |
| GET | `/api/v1/persons/tree/:id`| Fetch the family tree hierarchy | Yes |
| POST | `/api/v1/memories` | Publish a new memory/story | Yes |
| POST | `/api/v1/vault/upload` | Upload a file to Secure Vault | Yes |
| POST | `/api/v1/scheduled-messages`| Create a Time Capsule | Yes |

---

## 🔐 Authentication & Security

* **Stateless Authentication**: Uses JWT (JSON Web Tokens) for authenticating API requests.
* **Password Hashing**: User passwords and Secure Vault secondary passwords are salted and hashed using `bcryptjs`.
* **Rate Limiting**: `express-rate-limit` prevents brute-force API attacks by limiting requests per IP window.
* **Security Headers**: `helmet` is implemented on the backend to set various HTTP headers for security.
* **CORS**: Configured to safely accept cross-origin requests from the frontend client.

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB Atlas connection string (or local MongoDB)
* AWS Account (S3 bucket setup for media)

### 1. Clone Repository
```bash
git clone <repository-url>
cd The-Legacy-Trunk
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb+srv://<USER>:<PASSWORD>@cluster...
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=YOUR_AWS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket
FRONTEND_URL=http://localhost:5173
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000
VITE_ALGOLIA_APP_ID=yourAlgoliaAppId
VITE_ALGOLIA_SEARCH_KEY=publicSearchKey
VITE_FEATURE_AI_SUGGESTIONS=true
```

Start the frontend development server:
```bash
npm run dev
```

---

## 🖥️ Usage Flow

1. **Register & Login**: Create a new account.
2. **Create or Join**: Start a new family (generates a unique Family Code) or join an existing one using a code.
3. **Build the Tree**: Navigate to the Family Tree and start adding members. Define their relationships, and the system auto-calculates generations.
4. **Share a Memory**: Go to the feed, click "Create Story", upload a photo to S3, tag family members, and publish.
5. **Set a Time Capsule**: Use the Time Capsule feature to schedule a message for someone's future birthday.
6. **Lock Documents**: Navigate to the Secure Vault, set a secondary password, and upload sensitive family documents.

---

## 📸 Screenshots

> Add application screenshots here.

### Dashboard / Memories Feed
![Dashboard Placeholder](./screenshots/dashboard.png)

### Family Tree View
![Family Tree Placeholder](./screenshots/tree.png)

---

## 🧩 Challenges & Technical Decisions

* **Tree Generation Logic**: Instead of manually setting hierarchies, the `Person` model dynamically calculates its `generation` level via a pre-save hook based on its relationship (father, mother, son, daughter) to existing nodes. This greatly simplifies frontend rendering.
* **Secure Vault Isolation**: To ensure maximum privacy, the `SecureVault` model requires a *secondary* bcrypt-hashed password that is completely independent of the user's login password.
* **Cron-based Time Capsules**: Implemented `node-cron` in the backend to routinely scan the `ScheduledMessage` collection and automatically unlock/deliver memories once their `deliverAt` timestamp has passed.

---

## 📈 Future Improvements

* 🚧 **PDF/Book Export**: Integrate `pdf-lib` to generate printable physical books of curated stories.
* 🔮 **AI Integration**: Implement AI features (e.g., via OpenAI) to automatically tag people, generate memory prompts, and perform sentiment analysis on stories.
* 🔮 **Automated Testing**: Introduce Jest and React Testing Library for robust automated testing coverage.

---

## 📄 License

No license has currently been specified.

---

## 👨‍💻 Team Information

**Team Name:** Team LegacyBuilder  
**Event:** WEBSTER 2025 (Team ID: 941)

| Member            | Role |
| :---------------- | :--- |
| **Gaurav Mahor**  | CSE  |
| **Ashish Gautam** | CSE  |
| **Devesh**        | CSE  |
