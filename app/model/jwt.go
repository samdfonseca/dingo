package model

import (
	"crypto/rsa"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	jwt "github.com/dgrijalva/jwt-go"
)

type JWT struct {
	UserRole   int    `json:"user_role"`
	UserID     int64  `json:"user_id"`
	UserEmail  string `json:"user_email"`
	Expiration int64  `json:"expiration"`
	Token      string `json:"token"`
}

const (
	privKeyPath = "dingo.rsa"     // openssl genrsa -out dingo.rsa 2048
	pubKeyPath  = "dingo.rsa.pub" // openssl rsa -in dingo.rsa -pubout > dingo.rsa.pub
)

var (
	verifyKey *rsa.PublicKey
	signKey   *rsa.PrivateKey
)

func init() {
	signBytes, err := ioutil.ReadFile(privKeyPath)
	if err != nil {
		log.Fatal(err)
	}

	signKey, err = jwt.ParseRSAPrivateKeyFromPEM(signBytes)
	if err != nil {
		log.Fatal(err)
	}

	verifyBytes, err := ioutil.ReadFile(pubKeyPath)
	if err != nil {
		log.Fatal(err)
	}

	verifyKey, err = jwt.ParseRSAPublicKeyFromPEM(verifyBytes)
	if err != nil {
		log.Fatal(err)
	}
}

func NewJWT(user *User) (JWT, error) {
	method := jwt.GetSigningMethod("RS256")
	token := jwt.New(method)
	token.Claims["UserRole"] = user.Role
	token.Claims["UserID"] = user.Id
	token.Claims["UserEmail"] = user.Email
	exp := time.Now().Add(time.Minute * 3600).Unix()
	token.Claims["exp"] = exp

	tokenString, err := token.SignedString(signKey)
	if err != nil {
		return JWT{}, err
	}

	return JWT{
		UserRole:   user.Role,
		UserID:     user.Id,
		UserEmail:  user.Email,
		Expiration: exp,
		Token:      tokenString,
	}, nil
}

func NewJWTFromToken(token *jwt.Token) JWT {
	userRole := token.Claims["UserRole"].(float64)
	userID := token.Claims["UserID"].(float64)
	userEmail := token.Claims["UserEmail"].(string)
	expiration := token.Claims["exp"].(float64)
	return JWT{
		UserRole:   int(userRole),
		UserID:     int64(userID),
		UserEmail:  userEmail,
		Expiration: int64(expiration),
		Token:      token.Raw,
	}
}

func ValidateJWT(t string) (*jwt.Token, error) {
	token, err := jwt.Parse(t, func(token *jwt.Token) (interface{}, error) {
		return verifyKey, nil
	})

	switch err.(type) {
	case nil:
		if !token.Valid {
			return token, fmt.Errorf("Invalid token: %s\n", token.Raw)
		}
		return token, nil
	case *jwt.ValidationError:
		validationErr := err.(*jwt.ValidationError)

		switch validationErr.Errors {
		case jwt.ValidationErrorExpired:
			return token, fmt.Errorf("Expired token: %s\n", token.Raw)
		default:
			return token, fmt.Errorf("Token validation error: %s\n", token.Raw)
		}
	default:
		return token, fmt.Errorf("Unable to parse token: %s\n", token.Raw)
	}
}
