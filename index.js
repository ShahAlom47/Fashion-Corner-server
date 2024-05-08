const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser')
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: ["http://localhost:5173", `http://localhost:5173`],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
}
))
app.use(express.json());
app.use(cookieParser())



;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.r31xce1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const verifyToken=(req,res,next)=>{
  const token= req.cookies.token;
// console.log('tok tok ',req.cookies.token);

if(!token){
  return res.status(401).send({message:'Unauthorized Access'})
}


jwt.verify(token,process.env.ACCESS_TOKEN,(err,decode)=>{
  if(err){
    return res.status(403).send({message:'Forbidden Access'})
  }
req.userInfo=decode
next()
}) 
}

async function run() {
  try {
    // // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db('fashionCornerDB').collection('products');



// auth related API 

app.post('/jwt',async(req,res)=>{
const userEmail = req.body
const token = jwt.sign(userEmail, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
res.cookie('token',token)

res.send({success:true})

})

 // clear cookes 
 app.post('/jwt/logout', async (req, res) => {
  const userEmail = req.body;
  res.clearCookie('token', {
    maxAge: 0
  })

  res.send({ success: true })
});


    // product related api 

   
    app.get('/products',verifyToken, async (req, res) => {
      const item = parseInt(req.query.item)
      const page = parseInt(req.query.page)
      console.log(req.userInfo.email);
      
      const skip = item * page;
      const result = await productCollection.find().skip(skip).limit(item).toArray();
      res.send(result);
    })


    app.get('/productsCount', async (req, res) => {


      const totalProducts = await productCollection.estimatedDocumentCount();
      res.send({ totalProducts });
    })













    // const productCollection = client.db('emaJohnDB').collection('products');

    // app.get('/products', async (req, res) => {

    //   const page = parseInt(req.query.page)
    //   const size = parseInt(req.query.size)
    //   const skip = page * size
    //   console.log(page, size);

    //   const result = await productCollection.find().skip(skip).limit(size).toArray();
    //   res.send(result);
    // })

    // app.post('/productById', async (req, res) => {
    //   const data = req.body
    //   const ids = Object.keys(data)
    //   const id = ids.map(id => new ObjectId(id));
    //   const query = { _id: { $in: id } };


    //   const result = await productCollection.find(query).toArray();
    //   console.log(result);
    //   res.send(result);

    // })


    // app.get('/totalProducts', async (req, res) => {
    //   const totalProducts = await productCollection.estimatedDocumentCount();
    //   res.send({ totalProducts });
    // })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Fashion Corner Stating')
})

app.listen(port, () => {
  console.log(`fashion corner server is running on port: ${port}`);
})
