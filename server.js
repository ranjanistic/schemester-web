
const express = require("express"),
  bodyParser = require("body-parser"),
  {client,view,get} = require("./public/script/codes"),
  server = express(),
  shared = require("./workers/common/sharedata"),
  mongo = require('./config/db'),
  https = require('https'),
  fs = require('fs');

server.set("view engine", "ejs");
server.use(express.static("public"));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

mongo.connectToDB(require("./config/config.json").db.dpass,( err,dbname )=>{
  if (err) return console.error(err.code == 8000?'DB CREDS MISMATCH':err+`\nIf you don't have local mongodb server running at port 27017, then set up that first.`);
  console.log(`Connected to ${dbname}`);
  server.use(`/${client.admin}`, require(`./routes/${client.admin}`));
  server.use(`/${client.teacher}`, require(`./routes/${client.teacher}`));
  server.use(`/${client.student}`, require(`./routes/${client.student}`));
  
  server.get(get.root, (req, res) => {
    res.render(view.loader, { data:{ client: req.query.client }});
  });
  server.get(get.home, (_, res) => {
    res.render(view.homepage);
  });
  server.get(get.offline,(_,res)=>{
    res.render(view.offline)
  });
  server.get(get.tour,(req,res)=>{
    res.render(view.tour);
  });
  server.get(get.notfound, (__, _, next) => {
    next();
  });
  server.get(get.forbidden, (__, _, next) => {
    next();
  });
  server.get(get.servererror, (__, _, next) => {
    next();
  });
  server.use((req, res, _) => {
    res.status(404);
    res.format({
      html: ()=> {
        res.render(view.notfound, { url: req.url });
      },
      json: ()=> {
        res.json({ error: "Not found" });
      },
      default: ()=>{
        res.type("txt").send("Not found");
      },
    });
  });
  
  server.use((err, _, res) => {
    res.status(err.status || 500);
    res.render(view.servererror, { error: err });
  });
  const server_port = process.env.PORT|| 3000 || 80;
  const server_host = '0.0.0.0' || 'localhost';

  try{  //for local https dev server
    const key = fs.readFileSync('./localhost-key.pem');
    const cert = fs.readFileSync('./localhost.pem');
    https.createServer({key: key, cert: cert }, server).listen(server_port, server_host, ()=>{ console.log(`listening on ${server_port} (https)`)})
  }catch(e){ //for cloud server
    server.listen(server_port, server_host, ()=>{ console.log(`listening on ${server_port}`);
      if(server_port == 3000 && e.errno == -4058)
        console.warn("Server hosted via non-https protocol. Session will fail.\n See https://github.com/ranjanistic/schemester-web#generate-localhost-certificate to supress this warning.")
    })
  }
});
