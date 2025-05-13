import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dbConnect } from "./db.js";
import router from "./routes/userRoute.js";
import superAdminrouter from "./routes/superAdminRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import morgan from "morgan";
import paymentRouter from "./routes/payment&salaryRoute.js"
dotenv.config();

// Connect to the database
const connectToDatabase = async () => {
  try {
    await dbConnect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); 
  }
};
connectToDatabase();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(",") : ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
app.use("/api/auth", router);
app.use("/api/admin", superAdminrouter);
app.use("/api/employees", employeeRouter);
app.use("/api", paymentRouter)

// Default route
app.get("/", (req, res) => {
  res.send("Your app is running");
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const port = process.env.PORT || 1000;

app.listen(port, () => {
  console.log(`Your app is running on port ${port}`);
});