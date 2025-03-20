# Database Project

A hotel booking system built with **Node.js, Express, Sequelize, MySQL, and EJS**. This project includes **user authentication, hotel and room management, reservations, and automated testing**.

---

## 📌 Features
- 🔐 **User Authentication** (Login & Signup)
- 🏨 **Manage Hotels & Rooms** (Admin only)
- 🏠 **Book & Manage Reservations**
- ⭐ **Rate Hotels**
- 📝 **CRUD Operations for Users, Hotels, Rooms & Reservations**
- ✅ **Automated Selenium Tests**
- 📄 **Swagger API Documentation**

---

## 🚀 Installation & Setup

### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/runeunhjem/databaseproject.git
cd databaseproject
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

### 3️⃣ **Configure the Environment**
Create a `.env` file in the root directory and add:
```
DATABASE_URL=mysql://user:password@localhost:3306/hotel_booking
SESSION_SECRET=your-secret-key
```

### 4️⃣ **Database Setup**
Run database migrations and seeders (if needed):
```sh
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5️⃣ **Start the Server**
```sh
npm run dev
```
Server will start on **`http://localhost:3000`**.

---

## 🛠️ Project Structure
```
databaseproject/
│── models/        # Database models (User, Hotel, Room, Reservation)
│── config/        # Configurations (Database, Passport.js)
│── public/        # Static assets (CSS, JS, Images)
│── routes/        # Express routes (Users, Hotels, Rooms, Admin, Auth)
│── services/      # Business logic (HotelService, UserService, RoomService)
│── tests/         # Automated Selenium tests
│── views/         # EJS views for rendering frontend
│── bin/www        # Server entry point
│── app.js         # Express application
│── README.md      # Documentation
```

---

## 🛠️ Running Automated Tests

This project includes **Selenium WebDriver tests** to verify core functionalities.

### Run All Tests:
```sh
npm test
```

### Individual Test Files:
```sh
node ./tests/canAddHotel.js
node ./tests/canAddRooms.js
node ./tests/canDeleteHotel.js
node ./tests/canSeeUserDetails.js
```

**Example Test Output:**
```
✅ Landed on start page
✅ Clicked 'Login' button
✅ Logged in as admin
✅ Created a new hotel: Grand Plaza
✅ Added a room: Family Room (4 people)
✅ Successfully deleted the hotel
```

---

## 📄 API Documentation

Swagger UI is available at:
📌 **`http://localhost:3000/doc`**

To regenerate Swagger documentation:
```sh
node swagger
```

---

## 👨‍💻 Example Usage

### 1️⃣ **Register a New User**
- Go to `http://localhost:3000/auth/signup`
- Fill out the form and submit

### 2️⃣ **Login**
- Visit `http://localhost:3000/auth/login`
- Enter credentials and submit

### 3️⃣ **Add a New Hotel (Admin)**
- Navigate to **Hotels endpoint**
- Click "Add Hotel" and fill in details

### 4️⃣ **Add a Room to a Hotel**
- Go to a hotel's detail page
- Click "Add Room" and enter details

### 5️⃣ **Book a Room**
- Find a hotel → Choose a room → Click "Book Now"

---

## 🛠 Technologies Used
- **Backend:** Node.js, Express, Sequelize (MySQL)
- **Frontend:** EJS, Bootstrap
- **Authentication:** Passport.js (Local Strategy)
- **Testing:** Selenium WebDriver
- **API Documentation:** Swagger
- **Database:** MySQL

---

## 📜 License
MIT License

---

## 📞 Support
If you need help, feel free to create an **Issue** on GitHub or contact me directly.

---
🚀 **Happy Coding!**

