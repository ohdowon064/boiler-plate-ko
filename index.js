const express = require('express')
const config = require("./config/key.js")
const mongoose = require('mongoose')
const { User } = require('./models/user.js')
const cookieParser = require('cookie-parser')
const app = express()
const port = 3000

// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}))

// application/json
app.use(express.json())

mongoose.connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register', (req, res) => {
    // 회원가입 데이터를 client에서 가져오면
    // 해당 데이터들을 데이터베이스에 넣는다.

    const user = new User(req.body)

    user.save((err, userInfo) => {
        if(err) return res.json({success: false, err})
        return res.status(200).json({
            success: true
        })
    })

})

app.post('/login', (req, res) => {
  
  // 요청된 이메일을 DB에서 찾는다.
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user) {
      return res.json({
        loginSuccess: false,
        message : "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }

    // 비밀번호 비교
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
        return res.json({
          loginSuccess: false, 
          message: "비밀번호가 틀렸습니다."
        })
      
      // 토큰 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)

        // 토큰을 어디에 저장? 쿠키, 세션, 로컬스토리지
        res.cookie("x_auth", user.token)
          .status(200)
          .json({
            loginSuccess: true,
            userId: user._id
          })
      })
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})