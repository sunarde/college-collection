var express     = require("express"),
    app         = express(),
    path        = require('path'),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    User        = require("./models/user");
    
mongoose.connect("mongodb://localhost/college"); //name of database

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static( path.join(__dirname, '/public')));
app.set("view engine","ejs");

//PASSPORT configuration
app.use(require("express-session")({
    secret: "AV Fashion Rocks On",
    resave:false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//SCHEMA SETUP for list of colleges
var listcollegesSchema = new mongoose.Schema({
    name: String
});

var listcolleges = mongoose.model("listcolleges",listcollegesSchema); //store schema in listcolleges


//SCHEMA SETUP for registration
var registrationSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    college: String,
    stream: String,
    gender: String,
    mobile: Number,
    email: String
});

var Registration = mongoose.model("registrations",registrationSchema); //registration schema

//SCHEMA SETUP for t-shirt
var tshirtSchema  = new mongoose.Schema({
category: String,
sub_category:String,
image:String,
product_name:String,
price:Number,
color:String
});

var fashions=mongoose.model("fashions",tshirtSchema);  //store Schema into fashions Collection

////SCHEMA SETUP for Orders

var orderSchema = new mongoose.Schema({
    productname: String,
    price: Number,
    color: String,
    size: String,
    fname: String,
    lname: String,
    collegename: String,
    mobile: Number,
    email: String,
    pincode: Number 
});

var Order_Detail = mongoose.model("order_details",orderSchema); //store schema into Order_Detail collections


//get all girls tshirt data from DB and display on /colleges/girls

app.get("/colleges/girls",function(req,res){  
    fashions.find({category: "girls",sub_category: "tshirt"},function(err,allGirlstshirt)
        {
        if(err){
            console.log(err);
        }else{
            res.render("girls",{girl:allGirlstshirt});
        }
    });
});


//get all boyss tshirt data from DB and display on /colleges/boys


app.get("/colleges/boys",function(req,res){  
    fashions.find({category: "boys", sub_category: "tshirt"},function(err,allBoystshirt)
        {
        if(err){
            console.log(err);
        }else{
            res.render("boys",{boy:allBoystshirt});
           
        }
    });
});


/*College.creatnode(
    {
        firstname: "sunil",
        lastname: "arde",
        collegename: "Thakur College of Commerce and Science"
    },
    function(err,college){
        if(err){
            console.log(err);
            }else {
                console.log("Newly created student detail");
                console.log(college);
            }
    }) ;
    
*/
app.get("/", function(req,res){
    res.render("colleges.ejs");
    
});

app.get("/colleges", function(req,res){
    res.render("colleges.ejs");
    
});


app.get("/contact-us", function(req,res){
    res.render("contact-us.ejs");
    
});


app.get("/colleges/register",function(req,res){
     listcolleges.find({},function (err,allListcolleges){
        if(err){
            console.log(err);
        }
        else{
          
             res.render("register",{listcolleges:allListcolleges}); 
            
         
        }
    });
});

//Create routes -- add new registration to datbase
app.post("/colleges/register",function(req,res){
    //get date from form
    
    var firstname=req.body.firstname;
    var lastname=req.body.lastname;
    var college=req.body.college;
    var stream=req.body.stream;
    var gender=req.body.gender;
    var mobile=req.body.mobile;
    var email=req.body.email;
    var newRegistration = {firstname: firstname, lastname: lastname, college: college, stream: stream, gender: gender, mobile: mobile, email:email };
    Registration.create(newRegistration,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/colleges");
        }
        
    });
});

// NEW - show form to create new college


//show more info about 1 girls product
//store in variable



app.get("/colleges/p/:id", function(req, res) {
    
    fashions.findById(req.params.id,function(err,foundProduct){
        if(err){
            console.log(err);
        }else{
        
                //var college_list = listcolleges.find();
               // res.send("Hello World"); 
        
               res.render ("p.ejs",{product: foundProduct});
           
            }
    });
    
    
});


app.get("/colleges/track-order",isLoggedIn, function(req,res){
    res.render("track-order.ejs");
    
});



    //get DATA through FORM and add into order_detail collections
app.post("/colleges/p/:id",function(req,res){

    var productname=req.body.productname;
    var price=req.body.price;
    var size=req.body.size;
    var fname=req.body.firstname;
    var lname=req.body.lastname;
    var collegename=req.body.college;
    var mobile=req.body.mobile;
    var email=req.body.email;
    var pincode=req.body.pincode;
    var newOrder = {productname:productname,price:price, size:size, fname:fname, lname:lname, collegename:collegename, mobile: mobile, email:email, pincode:pincode };
    Order_Detail.create(newOrder,function(err,newlyCreated){
        if(err){
            console.log(err);
        }else{
            res.redirect("/colleges");
        }
        
    });

});



//AUTH ROUTE
//show register form

app.get("/join-us",function(req,res){
     listcolleges.find({},function (err,allListcolleges){
        if(err){
            console.log(err);
        }
        else{
          
             res.render("join-us",{listcolleges:allListcolleges}); 
            
         
        }
    });
});



//handle sign up logic - new user
app.post("/join-us",function(req,res){
    var newUser=new User({firstname:req.body.firstname, lastname:req.body.lastname, username:req.body.username,college:req.body.college, gender:req.body.gender, mobile:req.body.mobile});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("join-us");
                }
            passport.authenticate("local")(req,res,function(){
               res.redirect("/colleges"); 
            });
    });
    
});

//show login form

app.get("/login",function (req,res){
    res.render("login");
});

//handling logic here

app.post("/login",passport.authenticate("local",
    {
        successRedirect: "/colleges", 
        failureRedirect: "/login"
    }), function (req,res){
    
});

//logout route

app.get("/logout",function(req,res){
      req.logout(); 
      res.redirect("/colleges");
});

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Collection Server Started");
});