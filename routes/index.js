const express = require("express");
const router = express.Router();

/*aqui vamos a llamar a los modelos que se van a crear en mongo db */
const categoria = require("../models/categoria");
const productos = require("../models/producto"); 
const empresas  = require("../models/empresas"); 
const enviosenca = require("../models/enviosEnca");
const enviosdetalle = require("../models/enviosDetalle"); 
/* aqui van a ir las rutas que van a procesar las operaciones con la base de datos */
router.get("/", async(req,res) =>{
  const listempresas = await empresas.find(); 
  res.render("index", {
    titulo: "REPORTES",
    empresas: listempresas
  });
});
/*crud de categorias */
router.get("/categoria", async (req, res) => {
  const listcategorias = await categoria.find();
  res.render("categoria", {
    titulo: "CATEGORIAS CRUD",
    categorias: listcategorias,
  });
});
router.post("/addcategoria", async (req, res) => {
  const cate = new categoria(req.body);
  await cate.save();
  res.redirect("/categoria");
});

router.get('/editcategoria/:id',async(req,res)=>{
    const {id}=req.params;
     const cat= await categoria.findById(id);
    res.render('editcategoria',{
      titulo:'Editar Categoria',
      cat
    });
  });

  router.post('/updatecategoria/:id',async(req,res)=>{
    const {id}=req.params;
    await categoria.updateOne({_id:id},req.body);
    res.redirect('/categoria');
  });

  router.get('/deletecategoria/:id',async(req,res)=>{
    const {id}=req.params;
    await categoria.deleteOne({_id:id});
    res.redirect('/categoria');
  });
/* rutas de crud productos */

router.get("/producto", async (req, res) => {
  const listproductos = await productos.aggregate([
    {
      $lookup: {
        from: "categorias",
        localField: "Codcategoria",
        foreignField: "Codcategoria",
        as: "categoria"
      }
    },
    {
      $unwind: "$categoria"
    }
  ]);
  const listcategorias = await categoria.find(); 
  res.render("producto", {
    titulo: "PRODUCTOS CRUD",
    categorias: listcategorias,
    productos: listproductos
  });
});

router.post("/addproducto", async (req, res) => {
  const prod = new productos(req.body);
  prod.fechaingreso = new Date(); 
  await prod.save();
  res.redirect("/producto");
});

router.get('/editproducto/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id); 
  const prod = await productos.findById(id)
   const inner= await productos.aggregate([
    {
      $match:{
        "_id": prod._id
      }
    },
    {
      $lookup: {
        from: "categorias",
        localField: "Codcategoria",
        foreignField: "Codcategoria",
        as: "categoria"
      }
    },
    {
      $unwind: "$categoria"
    }
  ]);
  
  const listcategorias = await categoria.find(); 
  res.render('editproducto',{
    titulo:'Editar Cliente',
    prod: inner[0],
    cate: listcategorias
  });
});

router.post('/updateproducto/:id',async(req,res)=>{
  const {id}=req.params;
  await productos.updateOne({_id:id},req.body);
  res.redirect('/producto');
});

router.get('/deleteproducto/:id',async(req,res)=>{
  const {id}=req.params;
  await productos.deleteOne({_id:id});
  res.redirect('/producto');
});

/*  rutas CRUD para empresas */
router.get("/empresa", async (req, res) => {
  const listempresas = await empresas.find(); 
  res.render("empresa", {
    titulo: "EMPRESAS CRUD",
    empresas: listempresas
  });
});

router.post("/addempresa", async(req,res) =>{
   const empresita = new  empresas(req.body);
   await empresita.save();
   res.redirect("/empresa");
});


router.get('/editempresa/:id',async(req,res)=>{
  const {id}=req.params; 
   const empres= await empresas.findById(id);
  res.render('editempresa',{
    titulo:'Editar Empresa',
    empres
  });
});


router.post('/updateempresa/:id',async(req,res)=>{
  const {id}=req.params;
  await empresas.updateOne({_id:id},req.body);
  res.redirect('/empresa');
});

router.get('/deleteempresa/:id',async(req,res)=>{
  const {id}=req.params;
  await empresas.deleteOne({_id:id});
  res.redirect('/empresa');
});

/*rutas crud para los encabezados de los envios */
router.get("/enviosenca", async(req,res) =>{
  const listencabezados = await enviosenca.aggregate([
    {
      $lookup: {
        from: "empresas",
        localField: "codempresa",
        foreignField: "codempresa",
        as: "empresas"
      }
    },
    {
      $unwind: "$empresas"
    }
  ]);
  const listempresas = await empresas.find(); 
  res.render("enviosenca", {
    titulo: "ENVIOS PROCESO",
    empresas: listempresas,
    encabezados: listencabezados
  });
});

router.post("/addenvioenca", async (req, res) => {
  const envio = new enviosenca(req.body);
  envio.fechaingreso = new Date(); 
  await envio.save();
  res.redirect("/enviosenca");
});

router.get('/agregarproductos/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id); 
  const encabezadoid = await enviosenca.findById(id);
   const detalles= await enviosdetalle.aggregate([
    {
      $match:{
        "CodEnvioEncabezado": encabezadoid.CodEnvioEncabezado
      }
    },
    {
      $lookup: {
        from: "productos",
        localField: "Codproducto",
        foreignField: "Codproducto",
        as: "productos"
      },
    },
    {
      $unwind: "$productos"
    }
  ]);
  const listproductos = await productos.find(); 
  res.render('detalleproductos',{
    titulo:'Agregar detalles a envios',
    idEnca: encabezadoid,
    prod: listproductos,
    details: detalles
  });
});
router.post("/adddetalle", async (req, res) => {
  const detalle = new enviosdetalle(req.body);
  const prod = await productos.findOne({Codproducto:detalle.Codproducto}); 
  let descuentostock = parseInt(req.body.cantidad); 
  if(descuentostock > prod.existencia){
      res.redirect("/enviosenca"); 
  }else{  
      let stockfinal = prod.existencia - descuentostock; 
     await  productos.updateOne(
        { _id: prod._id }, 
        { $set: { existencia: stockfinal } } 
     );
     await detalle.save(); 
      res.redirect("/enviosenca");
  }
});

router.post("/busqueda", async (req, res) => {
  const{codempresa} = req.body; 
  const empresa = await empresas.find({codempresa:codempresa});
  const listencabezados = await enviosenca.aggregate([
    {
      $match:{
        "codempresa": empresa[0].codempresa
      }
    },
    {
      $lookup: {
        from: "empresas",
        localField: "codempresa",
        foreignField: "codempresa",
        as: "empresas"
      }
    },
    {
      $unwind: "$empresas"
    }
  ]); 
  res.render("consulta",{
     titulo:"Consulta encontrada",
     encabezados: listencabezados
  });
});
router.get('/solodetalles/:id',async(req,res)=>{
  const {id}=req.params;
  console.log(id); 
  const encabezadoid = await enviosenca.findById(id);
   const detalles= await enviosdetalle.aggregate([
    {
      $match:{
        "CodEnvioEncabezado": encabezadoid.CodEnvioEncabezado
      }
    },
    {
      $lookup: {
        from: "productos",
        localField: "Codproducto",
        foreignField: "Codproducto",
        as: "productos"
      },
    },
    {
      $unwind: "$productos"
    }
  ]);
  res.render('solodetalles',{
    titulo:'Agregar detalles a envios',
    details: detalles
  });
});
module.exports = router;
