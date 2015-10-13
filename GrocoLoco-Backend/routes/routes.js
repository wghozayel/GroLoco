
var passport = require('passport');
var clone = require('clone');
//ROUTES ===========================================================

module.exports = function (app){
    app.delete('/deletegroceryitem', isAuthenticated, function(req, res){
        GroceryList.findOne({
            'User': req.user,
            'GroceryListName': req.body.GroceryListName
        }, function(err, groceryList){
            if(err)
                res.send(err)
            if(groceryList){
                for(var i = 0; i < groceryList.List.length; i++){
                    if(groceryList.List[i]._id == req.body._id){
                        var index = req.user.GroceryList.indexOf(groceryList.List[i])
                        req.user.GroceryList.splice(index, 1);
                        console.log(index)
                         GroceryList.findOneAndUpdate({
                            'User': req.user,
                            'GroceryListName': req.body.GroceryListName
                        },{
                            'List': groceryList.List
                        },{
                            safe:true, upsert:true, new: true
                        },
                        function(err, groceryList){
                            if(err)
                                res.send(err)
                            if(groceryList)
                                res.send(groceryList)
                        })
                    }
                }
            }else{
                res.send(404);
            }
        })
    })

    app.post('/crossoutitem', isAuthenticated, function(req, res){
        GroceryList.findOne({
            'User': req.user,
            'GroceryListName': req.body.GroceryListName
        }, function(err, groceryList){
            if(err)
                res.send(err)
            if(groceryList){
                for(var i = 0; i < groceryList.List.length; i++){
                    if(groceryList.List[i]._id == req.body._id){
                        groceryList.List[i].CrossedOut = req.body.CrossedOut
                         GroceryList.findOneAndUpdate({
                            'User': req.user,
                            'GroceryListName': req.body.GroceryListName
                        },{
                            'List': groceryList.List
                        },{
                            safe:true, upsert:true, new: true
                        },
                        function(err, groceryList){
                            if(err)
                                res.send(err)
                            if(groceryList)
                                res.send(groceryList)
                        })
                    }
                }
            }else{
                res.send(404);
            }
        })
    })

    app.post('/editgroceryitem', isAuthenticated, function(req, res){
        GroceryList.findOne({
                'User': req.user,
                'GroceryListName': req.body.GroceryListName
            }, function(err, groceryList){
                if(err)
                    res.send(err)
                if(groceryList){
                    for(var i = 0; i < groceryList.List.length; i++){
                        if(groceryList.List[i]._id == req.body._id){
                            groceryList.List[i].ItemName = req.body.ItemName
                            groceryList.List[i].Quantity = req.body.Quantity
                             GroceryList.findOneAndUpdate({
                                'User': req.user,
                                'GroceryListName': req.body.GroceryListName
                            },{
                                'List': groceryList.List
                            },{
                                safe:true, upsert:true, new: true
                            },
                            function(err, groceryList){
                                if(err)
                                    res.send(err)
                                if(groceryList)
                                    res.send(200)
                            })
                        }
                    }
                }else{
                    res.send(404);
                }
            })
    })

    app.delete('/deletegrocerylist', isAuthenticated, function(req,res){
        GroceryList.findOneAndRemove({
                'User': req.user,
                'GroceryListName': req.body.GroceryListName
            }, function (err, groceryList){
            if(err) 
                res.send(err)
            if(groceryList){
                for(var i = 0; i < req.user.GroceryList.length; i++){
                    var userClone = clone(req.user)

                    if(req.user.GroceryList[i].toString() == groceryList._id.toString()){

                        var index = userClone.GroceryList.indexOf(groceryList._id)
                    
                        console.log("Index: " + index)
                        userClone.GroceryList.splice(index, 1);


                        User.findOneAndUpdate({
                            'Email': userClone.Email
                        },{
                            'GroceryList': userClone.GroceryList
                        },function(err,user){
                            if(err)
                                res.send(err)
                            if(user)
                                res.send(user)
                            else
                                res.send(404)
                        })
                    }else{
                        res.send(500)
                        console.log('else here')
                    }
                }
            }
            else{
                console.log("here")
                res.send(404)
            }
        })
    })

    app.get('/grocerylists', isAuthenticated, function(req,res){
        GroceryList.find({'User':req.user}, function(err, grocerylists){
            if(err)
                res.send(err)
            if(grocerylists)
                res.send(grocerylists)
            else
                res.send(404)
        })
    })

    app.post('/addtolist', isAuthenticated, function(req, res) {

        var groceryListName = req.body.GroceryListName;

        for(var i = 0; i < req.body.List.length;i++){
             GroceryList.findOneAndUpdate({
                'User': req.user,
                'GroceryListName': groceryListName
            },{
                $push:{'List': req.body.List[i]}
            },{
                safe:true, upsert:true, new: true
            },
            function(err, groceryList){
                if(err)
                    res.send(err)
                if(groceryList)
                    res.send(200)
            })
        }
    });

    app.post('/newgrocerylist', isAuthenticated, function(req, res) {

        var newGroceryList = new GroceryList({
            'User'              : req.user,
            'GroceryListName'   : req.body.GroceryListName
        });

        newGroceryList.save(function(err, newGroceryList){
            if(err)
                res.send(err)
            if(newGroceryList){
                User.findOneAndUpdate({
                    'Email': req.user.Email
                },{
                    $push:{'GroceryList':newGroceryList}
                },{
                    safe:true, upsert:true, new: true
                },
                function(err,user){
                    if(err)
                        res.send(err)
                    if(user)
                        res.send(user)
                })
            }
        })
    });


    app.post('/createuser', passport.authenticate('signup', {
        successRedirect : '/createuser', // redirect to the secure profile section
        failureRedirect : '/createuser/fail', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/createuser', isAuthenticated, function(req,res){
        console.log('testing the sign up')
        res.send(req.user)
    })

    app.get('/createuser/fail', function(req,res){
        var fail = 'Creating a user failed.'
        console.log(fail)
        res.status(500).send({message: fail})
    })

    app.post('/login', passport.authenticate('login', {
        successRedirect : '/home', // redirect to the secure profile section
        failureRedirect : '/login/fail', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    app.get('/login/fail', function(req,res){
        var fail = 'Logging in failed.'
        console.log(fail)
        res.status(500).send({message: fail})
    })

    app.get('/home', isAuthenticated, function(req,res){
        res.status(200).send(req.user)
    })

    app.get('/loggedin', isAuthenticated, function(req,res){
        res.send(req.user)
    })

    app.post('/logout', logout, function(req,res){
        res.send({
            status:200,
            message:'bye'
        })
    });
}

var logout = function(req, res, next){
    req.logout()
    req.session.destroy();
    return next()
}

var isAuthenticated = function (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler 
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response object
    if (req.isAuthenticated()){
        console.log('User is authenticated')
        return next();
    }
    // if the user is not authenticated then redirect him to the login page
    var fail = 'Sorry a user is not logged in'
    console.log(fail)
    res.status(500).send({message: fail});
}
