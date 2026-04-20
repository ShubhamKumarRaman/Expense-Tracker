import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected.......")
    } catch (err) {
        console.error("Database Connection issue");
        process.exit(1);
    }
}