var express = require('express');
const app = express();
const math = require("mathjs");
const port = 300;
const axios = require('axios');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs')

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');


var serviceAccount = require("./key.json");
const { render } = require('ejs');


initializeApp({
    credential: cert(serviceAccount)
  });
  
  const db = getFirestore();
  

app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.get('/', (req, res) =>{
    res.render("home")
});

app.get('/main', (req, res) =>{
    res.render("main")
});
app.get('/signin', (req, res) =>{
    res.render("signin")
});

app.get('/about', (req, res) =>{
    res.render("about")
});

app.get('/product', (req, res) =>{
    res.render("product")
});

app.get('/contact', (req, res) =>{
    res.render("contact")
});

app.get('/signup', (req, res) =>{
    res.render("signup")
});


app.post('/signupsubmit',async (req, res) =>{
   const { full_name, last_name, email, password } = req.body;

   try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await db.collection("signup").where('email', '==', email).get();
    if(!existingUser.empty) {
    return res.render('error')
   } else{
      await db.collection("signup").add({
        name:full_name + " "+ last_name,
        email: email,
        password: hashedPassword
      });
      res.render("signin");
    }

   } catch (error) {
    console.error('Error signing up user:', error);
    return res.status(500).json({ error: 'Server error'});
   }
    
});


app.get('/signin', (req, res) =>{
    res.render("signin")
});
``
app.post('/signinsubmit', async(req, res) =>{
    const email = req.body.email;
    const password = req.body.password;
   
    try{
        const querySnapshot = await db.collection("signup").where("email", "==", email).get();
        if(querySnapshot.empty) {
            return res.send("No account found with this email");
         }

         const userDoc = querySnapshot.docs[0].data();
         const storedHashedPassword = userDoc.password;

         const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

         if (passwordMatch) {
            res.render("main");
         } else{
            res.send("Incorrect password");
         }
        
    } catch (error) {
        console.error("Error signing in usera:", error);
        res.status(500).send('An error occured while signing in');
    }
});

app.get("/product",(req,res)=>{
	res.render("product");
});

const a = [];
const cost = [];
var amount = 0;
app.get("/addToCart",(req,res)=>{
	const value = req.query.ItemName;
	var c = req.query.ItemCost;
    if(c) {
       
	cost.push(c);
	c = math.evaluate(c.slice(0,c.length-2));
	amount = amount + c;
   
	a.push(value);
    }
	res.render("product");
});
app.get("/cart",(req,res)=>{
	if(typeof(a) !== "undefined"){
		db.collection("Cart").add({
			Cart : a,
			Cost : cost,
			TotalCost : amount,
		}).then(()=>{
			res.render("cart",{productsData : a, amount : amount, cost : cost});
		});
	} else {
        console.error('Cart item is undefined');
    }
});


app.get("/cartsubmit",(req, res)=>{
	res.render("contact");
});

app.get("/ordersubmit",(req,res)=>{
	res.render("contact");
});


app.get("/contact",(req,res)=>{
	res.render("contact");
});

app.get("/contactsubmit", (req, res)=> {
    const email = req.query.email;
    const phone = req.query.phone;
    const review = req.query.review;

    db.collection("Feedback").add({
        Email: email,
        PhoneNUmber: phone,
        Feedback : review,
    }).then(() =>{
        res.render("thankyou");
    })
});

app.listen(port, () => {
    console.log('Example app listening on port');
})

app.get("/thankyou", (req, res)=>{
    res.render("thankyou");
})
app.get("/thankyousubmit", (req,res)=>{
    res.render("home");
})

