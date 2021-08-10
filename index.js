const express = require('express');
const app = express()
const port = 8000
const con = require('./configsql');
const shortid = require('shortid');
const { connect } = require('./configsql');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const md5 = require('md5');
const cors = require('cors');
const authMiddleware = require('./authMiddleware');
app.use(cors());

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// API PRODUCTS
// Get all products
app.get('/products', (req, res) => {
  const { page, limit } = req.query;
  //get data
  var sql = 'select * from hanghoa';
  con.query(sql, function (err, data) {
    if (err) throw err;
    if (page && limit) {
      const products = data.slice(limit * (page - 1), page * limit)
      const result = { page: parseInt(page), limit: parseInt(limit), totalPage: Math.ceil(data.length / limit), data: products };
      res.json(result);
    } else {
      res.json(data);
    }

  })
})

// Get 1 product 
app.get('/products/:idProduct', (req, res) => {
  const { idProduct } = req.params;
  //get data
  var sql = `select * from hanghoa where MSHH='${idProduct}'`;
  con.query(sql, function (err, data) {
    if (err) throw err;
    res.json(data[0]);
  })
})

// ADD PRODUCT 
app.post('/products', (req, res) => {
  const { TenHH, MaLoaiHang, Gia, SoLuongHang, ManHinh, HeDieuHanh, CamSau, CamTruoc, Chip, Ram, Rom, Sim, Pin, HinhAnh } = req.body;
  const MSHH = `HH${shortid.generate()}`;
  //get data
  var sql = `insert into hanghoa values('${MSHH}','${TenHH}','${MaLoaiHang}','${Gia}','${SoLuongHang}','${ManHinh}','${HeDieuHanh}','${CamSau}','${CamTruoc}','${Chip}','${Ram}','${Rom}','${Sim}','${Pin}','${HinhAnh}')`;
  con.query(sql, function (err, data) {
    if (err) res.json({ message: `Lỗi!! ${err}` });
    res.json({ message: `Thêm ${TenHH} thành công !` });
  })
})

// Update products
app.put('/products/:idProduct', (req, res) => {
  const { idProduct } = req.params;
  var sql = `update hanghoa set  TenHH='${TenHH}',Gia='${Gia}',SoLuongHang='${SoLuongHang}',ManHinh='${ManHinh}',HeDieuHanh='${HeDieuHanh}',CamSau='${CamSau}',CamTruoc='${CamTruoc}',Chip='${Chip}',Ram='${Ram}',Rom='${Rom}',Pin='${Pin}',HinhAnh='${HinhAnh}' where MSHH = '${idProduct}'`;
  con.query(sql, function (err) {
    console.log(sql);
    if (err) res.json({ message: `Lỗi!! ${err}` });
    res.json({ message: `Sửa sản phẩm ID ${idProduct} thành công !` });
  })
})

// Delete products
app.delete('/products/:idProduct', (req, res) => {
  const { idProduct } = req.params;
  var sql = `delete from hanghoa  where MSHH = '${idProduct}'`;
  con.query(sql, function (err) {
    if (err) res.json({ message: `Lỗi!! ${err}` });
    res.json({ message: `Xóa sản phẩm ID ${idProduct} thành công !` });
  })
})


//  AUTHENTICATION

app.post('/login', (req, res) => {
  const { userName, pass } = req.body;
  const sql = `select * from khachhang where UserName='${userName}'`;
  con.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length) {
      const { HoTenKH, SoDienThoai, DiaChi, MSKH, Email } = result[0];
      const token = jwt.sign({ HoTenKH, MSKH }, process.env.SECRET)
      if (md5(pass) == result[0].PassWord) res.json({ token: token, message: "Đăng nhập thành công" });
      else res.json({ message: "Mật khẩu không chính xác, vui lòng thử lại !" })
    } else res.json({ message: "Tài khoản không tồn tại !" });
  })

})

//REGISTER

app.post('/register', (req, res) => {
  const { HoTenKH, UserName, Pass, SoDienThoai, DiaChi, Email } = req.body;
  const MSKH = shortid.generate();
  //check username exist
  var sql = `select * from khachhang where UserName='${UserName}'`;
  con.query(sql, function (err, data) {
    if (data.length) res.json({ message: `Tài khoản đã tồn tại !` });

    var sql1 = `insert into khachhang values('${MSKH}','${HoTenKH}','${SoDienThoai}','${Email}','${UserName}','${Pass}','${DiaChi}')`;
    con.query(sql1, function (err) {
      if (err) res.json({ message: `Lỗi đăng ký ${err}` });
      res.json({ message: `Đăng ký tài khoản ${UserName} thành công !` });
    });

  });
})


//Update info 
app.put('/register', (req, res) => {
  const { MSKH, HoTenKH, Pass, SoDienThoai, DiaChi, Email } = req.body;
  //check username exist
  var sql = `update khachhang set HoTenKH='${HoTenKH}',SoDienThoai='${SoDienThoai}',Email='${Email}',PassWord='${md5(Pass)}',DiaChi='${DiaChi}' where MSKH='${MSKH}'`;
  con.query(sql, function (err, data) {
    if (err) res.json({ message: `Lỗi update ${err}` });
    console.log(sql);
    res.json({ message: `Cập nhật thông tin thành công !` });
  });

})


app.use(authMiddleware.isAuth);

app.get('/user', (req, res) => {
  const user = req.jwtDecoded;
  var sql = `select * from khachhang where MSKH ='${user.MSKH}'`;
  con.query(sql, function (err, result) {
    if (err) res.json({ message: `Lỗi!! ${err}` });
    res.json(result[0]);
  })
})

// GET BILL
app.get('/bill', (req, res) => {
  const { MSKH } = "";
  //get data
  var sql = `select * from dathang where MSKH='${MSKH}'`;
  con.query(sql, function (err, data) {
    if (err) throw err;
    res.json(data[0]);
  })
})

// ADD Bill 
app.post('/bill', (req, res) => {
  const { NgayDH, NgayGH, TongTien, products } = req.body;
  const SoDonDH = `${shortid.generate()}`;
  const MSKH = req.jwtDecoded.MSKH;
  const MSNV = 'NV01';
  //get data
  var sql = `insert into dathang(SoDonDH,MSKH,MSNV,NgayDH,NgayGH,TongTien) values('${SoDonDH}','${MSKH}','${MSNV}','${NgayDH}','${NgayGH}','${TongTien}')`;
  con.query(sql, function (err) {
    if (err) res.json({ message: `Lỗi! ${err}` });
    // Chi tiet dat hang
    for (product of products) {
      const { MSHH, SoLuong, GiaDatHang } = product;
      var sql1 = `insert into chitietdathang values('${SoDonDH}','${MSHH}','${SoLuong}','${GiaDatHang}',${0})`;
      con.query(sql1, function (err) {
        if (err) res.json({ message: `Lỗi!! ${err}` });
      })
    }

    res.json({ success: true, message: 'Đặt hàng thành công !' })
  })
})

// UPDATE BILL
// app.put('/products/:idProduct', (req, res) => {
//   const { SoDonDH } = req.body;
//   var sql = `update dathang set  TrangThai='${TenHH}' where SoDonDH = '${SoDonDH}'`;
//   con.query(sql, function (err) {
//     if (err) res.json({ message: `Lỗi!! ${err}` });
//     res.json({ message: `Sửa trạng thái thành công !` });
//   })
// })

//

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})