const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {  // MONGODB_URI yerine MONGO_URI kullanıyoruz
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB bağlantısı başarılı!');

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB bağlantısı koptu, yeniden bağlanılıyor...');
            setTimeout(connectDB, 5000);
        });

    } catch (error) {
        console.error('MongoDB bağlantı hatası:', error);
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;