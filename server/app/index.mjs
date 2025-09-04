import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';
import rpc_router from '../routes/rpc-router.mjs';


const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors( {
    origin: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
} ));
app.use( (err , req , res , next) => {
    if(err instanceof ApiError){
        return res.status(err.statusCode).json(new ApiResponse(err.statusCode, err.message));
    }
    return res.status(500).json(new ApiResponse(500, 'Internal Server Error'));
} )

app.use('/api/v1/rpc' , rpc_router);

app.get('/' , (req , res) => {
    res.send("NDK-RPC-Engine is running");
} )

export default app;