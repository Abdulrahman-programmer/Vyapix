# Vyapix 🚀

A full-stack inventory and sales management system built using the MERN stack. Vyapix helps track products, manage stock levels, generate reports, and handle sales efficiently.

---

## 📌 Features

* 📦 Product Management (Add, Update, Delete)
* 📉 Low Stock Alerts
* 💰 Sales Tracking
* 📊 Reports & Analytics (Date-wise, Range-wise)
* 🔐 JWT Authentication
* 📷 Barcode/QR Scanner Integration

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Axios
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### Deployment

* Frontend: Netlify
* Backend: Render

---

## ⚙️ Environment Variables

### 🔹 Frontend (.env)

```
VITE_API_BASE_URL=http://localhost:3000/
```

### 🔹 Backend (.env)

```
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/vyapix.git
cd vyapix
```

### 2️⃣ Install dependencies

#### Backend

```
cd backend
npm install
```

#### Frontend

```
cd frontend
npm install
```

---

### 3️⃣ Run the project

#### Start Backend

```
npm run dev
```

#### Start Frontend

```
npm run dev
```

---

## 📡 API Endpoints (Sample)

### Auth

* POST `/api/auth/login`
* POST `/api/auth/register`

### Sales

* GET `/api/sales/:date`
* GET `/api/sales/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`

### Products

* GET `/api/products`
* POST `/api/products`
* PUT `/api/products/:id`
* DELETE `/api/products/:id`

---

## 🌐 Deployment

### Frontend (Netlify)

* Build Command: `npm run build`
* Publish Directory: `dist`

### Backend (Render)

* Start Command: `npm start`

---

## ⚠️ Important Notes

* Make sure CORS is configured correctly in backend using `CLIENT_URL`
* Use environment variables properly in production
* Replace localhost URLs with deployed URLs after hosting

---


## 🤝 Contributing

Contributions are welcome! Feel free to fork this repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Abdul Rahman**
CSE Student | Full Stack Developer

---

⭐ If you like this project, give it a star on GitHub!
