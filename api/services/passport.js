var FacebookStrategy = require("passport-facebook");


var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
module.exports = require("passport");


module.exports.use(new FacebookStrategy({
        clientID: "310667669306983",
        clientSecret: "e699901907ed0bc0ca91a63d3a7b2054",
        callbackURL: "/user/loginFacebook/",
        profileFields: ['id', 'displayName', 'photos', 'email'],
        enableProof: false
    },
    function(accessToken, refreshToken, profile, done) {
        if (!_.isEmpty(profile)) {
            User.findOne({
                "oauthLogin.socialId": profile.id + ""
            }).exec(function(err, data) {
                console.log(profile);
                if (err) {
                    done(err, false);
                } else {
                    usertemp = {
                        "oauthLogin": [{
                            "socialId": profile.id + "",
                            "socialProvider": profile.provider
                        }],
                        "status": 1
                    };
                    if (profile.displayName) {
                        usertemp.firstName = profile.displayName.split(" ")[0];
                        usertemp.lastName = profile.displayName.split(" ")[1];
                    }
                    if (profile.photos && profile.photos.length > 0) {
                        usertemp.image = profile.photos[0].value;
                    }
                    if (profile.emails && profile.emails.length > 0) {
                        usertemp.email = profile.emails[0].value;
                    }
                    if (_.isEmpty(data)) {
                        var user = User(usertemp);
                        user.save(function(err, data2) {
                            done(err, data2);
                        });
                    } else {
                        done(err, data);
                    }

                }
            });

        } else {
            done("There is an Error", false);
        }
    }
));



module.exports.use(new GoogleStrategy({
        clientID: "183921873228-7c4e1o43d9k5jjn8sc1h3b7vqda7a8b9.apps.googleusercontent.com",
        clientSecret: "zSCTPVgwBuHz1K7p-4K3kUMB",
        callbackURL: "/user/loginGoogleCallback"
    },
    function(token, tokenSecret, profile, done) {
        if (!_.isEmpty(profile)) {
            User.findOne({
                "oauthLogin.socialId": profile.id + ""
            }).exec(function(err, data) {
                if (err) {
                    done(err, false);
                } else {
                    usertemp = {
                        "oauthLogin": [{
                            "socialId": profile.id + "",
                            "socialProvider": profile.provider
                        }],
                        "status": 1
                    };
                    if (profile.displayName) {
                        usertemp.firstName = profile.displayName.split(" ")[0];
                        usertemp.lastName = profile.displayName.split(" ")[1];
                    }
                    if (profile.photos && profile.photos.length > 0) {
                        usertemp.profilePic = profile.photos[0].value;
                    }
                    if (profile.emails && profile.emails.length > 0) {
                        usertemp.email = profile.emails[0].value;
                    }
                    if (_.isEmpty(data)) {
                        var user = User(usertemp);
                        user.save(function(err, data2) {
                            done(err, data2);
                        });
                    } else {
                        done(err, data);
                    }
                }
            });
        } else {
            done("There is an Error", false);
        }
    }
));
