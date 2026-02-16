const bodyParser = require("body-parser");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app= express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const uri =  "mongodb+srv://hsdbghmis_db_user:jDAi1chfxHjjjKDA@cluster0.j8jllnl.mongodb.net/?appName=Cluster0";

mongoose
.connect(uri)
.then(()=> console.log("MongoDb Connected"))
.catch((err)=> {
    console.error("MongoDb connection error:", err);
    process.exit(1);
});

const stockSchema = new mongoose.Schema({
    Company: String,
    description: String,
    intitial_price: Number,
    price_2002: Number,
    price_2007: Number,
    symbol: String,

});

const Stock = mongoose.model("Stock", stockSchema, "stocks");

const watchlistSchema = new mongoose.Schema({
  stockId: { type: mongoose.Schema.Types.ObjectId, ref: "Stock" },
  addedAt: { type: Date, default: Date.now },
});

const Watchlist = mongoose.model("Watchlist", watchlistSchema);

app.get("/api/stocks", async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/watchlist", async (req, res) => {
  try {
    const list = await Watchlist.find().populate("stockId");
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/watchlist", async (req,res)=> {
    try{
        const { stockId}= req.body;
        const exists = await Watchlist.findOne({ stockId});
        if(exists) return res.json({ message: "Already in Watchlist"});
        const item = new Watchlist({stockId});
        await item.save();
        res.json({message: " added to watchlist"});

    } catch (error){
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`);
});