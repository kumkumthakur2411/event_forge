const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../../backend/.env' });
(async ()=>{
  try{
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to DB');
    const ev = await Event.findOne({}).sort({createdAt:-1});
    console.log('Latest event id:', ev? ev._id : 'none', 'status:', ev? ev.status : 'n/a');
    if(!ev){ process.exit(0); }
    console.log('postedBy:', ev.postedBy);
    const owner = await User.findById(ev.postedBy);
    console.log('Owner exists:', !!owner);
    console.log('Owner notifications:', owner ? owner.notifications : 'n/a');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
