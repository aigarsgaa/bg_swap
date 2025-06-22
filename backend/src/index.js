"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("./config/passport")); // Your Passport configuration
const dotenv_1 = __importDefault(require("dotenv"));
const bgg_1 = __importDefault(require("./routes/bgg"));
const auth_1 = __importDefault(require("./routes/auth"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: 'http://localhost:3000', credentials: true }));
app.use(express_1.default.json());
// Session middleware
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using https
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/bgg', bgg_1.default);
app.get('/', (req, res) => {
    res.send('Board Game Swap API is running!');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
