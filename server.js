const express = require("express"),
  bodyParser = require("body-parser"),
  view = require("./hardcodes/views"),
  admin = require("./routes/admin"),
  teacher = require("./routes/teacher"),
  student = require("./routes/student"),
  app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use("/admin", admin);
app.use("/teacher", teacher);
app.use("/student", student);

app.get("/", (req, res) => {
  res.render(view.loader, { data:{ client: req.query.client ? req.query.client : null }});
});

app.get("/home", (_req, res) => {
  res.render(view.homepage);
});

app.get("/plans", (_request, res) => {
  res.render(view.plans);
});

const clog = (msg) => console.log(msg);

app.get("/404", (_req, _res, next) => {
  next();
});
app.get("/403", (_req, _res, next) => {
  next();
});
app.get("/500", (req, res, next) => {
  next();
});

app.use((req, res, next) => {
  res.status(404);
  res.format({
    html: function () {
      res.render(view.notfound, { url: req.url });
    },
    json: function () {
      res.json({ error: "Not found" });
    },
    default: function () {
      res.type("txt").send("Not found");
    },
  });
});

app.use((err, req, res) => {
  res.status(err.status || 500);
  res.render(view.servererror, { error: err });
});

app.listen(3000, (_) => {
  console.log("listening on 3000");
});