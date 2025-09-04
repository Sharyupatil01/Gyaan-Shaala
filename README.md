# Gyaan-Shaala 📑

# - Backend

Welcome to the backend repository for Gyaan-Shaala, a fully functional ed-tech platform.This server-side application is built using the MERN stack (NodeJS, ExpressJS, and MongoDB). It powers all the core functionalities of the platform, from user authentication to course management and payment processing.

The backend follows a monolithic architecture and exposes a comprehensive RESTful API for the ReactJS front-end client to consume.

## 🚀 Key Features

The backend provides a range of robust features, including:

* **User Authentication & Authorization:** Secure user signup and login for both students and instructors using JSON Web Tokens (JWT). Includes OTP verification and password reset functionality.
* **Course Management:** Full CRUD (Create, Read, Update, Delete) functionality for instructors to manage courses and their content.
* **Payment Integration:** Seamless payment processing for course purchases handled through Razorpay integration.
* **Cloud Media Management:** All media content (videos, images, PDFs) is efficiently stored and managed using the Cloudinary cloud service.
* **Rating and Reviews:** Allows students to view and rate the courses they are enrolled in
* **Secure Password Handling:** User passwords are encrypted using `bcrypt` for an added layer of security

## 🛠️ Tech Stack & Dependencies

The backend is built with a modern and scalable tech stack:

* **Runtime Environment:** Node.js 
* **Framework:** Express.js
* **Database:** MongoDB (hosted on MongoDB Atlas) with Mongoose as the ODM 
* **Authentication:** JSON Web Tokens (JWT)
* **Password Hashing:** Bcrypt
* **Media Storage:** Cloudinary 
***Payment Gateway:** Razorpay 

## 🗄️ Database Schema

The database is built using MongoDB and uses Mongoose schemas to model the application data The core data models include:
* Student Schema 
* Instructor Schema 
* Course Schema 
* Other schemas for profiles, course progress, ratings, tags, and more

## Workflow 

<img width="768" height="179" alt="backend_workflow" src="https://github.com/user-attachments/assets/11b6a0fd-f228-4b2c-bbbf-ad203f1b6143" />



## ⚙️ API Endpoints

The API is designed following REST principles, using standard HTTP methods and JSON for data exchange.

| Method | Endpoint                    | Functionality                                    |
| :----- | :-------------------------- | :----------------------------------------------- |
| `POST` | `/api/auth/signup`          | Create a new user (student or instructor).        |
| `POST` | `/api/auth/login`           | Log in an existing user and generate a JWT token |
| `POST` | `/api/auth/verify-otp`      | Verify OTP sent to the user's email.            |
| `POST` | `/api/auth/forgot-password` | Send a password reset link to the user's email. |
| `GET`  | `/api/courses`              | Get a list of all available courses.            |
| `GET`  | `/api/courses/:id`          | Get details of a specific course by ID.           |
| `POST` | `/api/courses`              | Create a new course (Instructor only).            |
| `PUT`  | `/api/courses/:id`          | Update an existing course by .                  |
| `DELETE`| `/api/courses/:id`         | Delete a course by ID.                            |
| `POST` | `/api/courses/:id/rate`     | Add a rating to a course.                         |

## 📦 Installation and Setup

To get the backend server running locally, follow these steps:

1.  **Clone the repository**
    ```sh
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Install dependencies**
    ```sh
    npm install
    ```

3.  **Set up environment variables**
    Create a `.env` file in the root directory and add the necessary environment variables. Use the `.env.example` file as a template.

4.  **Start the server**
    ```sh
    npm start
    ```
    The server should now be running on the port specified in your `.env` file.

## 🔑 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

**Server Configuration**

PORT=4000

**MongoDB Connection** 

MONGODB_URL="your_mongodb_connection_string"

**JWT Secret** 

JWT_SECRET="your_jwt_secret_key"

**Cloudinary Credentials**

CLOUDINARY_CLOUD_NAME="your_cloud_name"

CLOUDINARY_API_KEY="your_api_key"

CLOUDINARY_API_SECRET="your_api_secret"

**Razorpay Credentials** 

RAZORPAY_KEY_ID="your_razorpay_key_id"

RAZORPAY_SECRET="your_razorpay_secret"
