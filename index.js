import express from "express";
import fs from "fs";

const app = express();

//Middle ware to handle request body
app.use(express.json());

//Get json data
const products = JSON.parse(fs.readFileSync("./data/products.json"));
const users = JSON.parse(fs.readFileSync("./data/users.json"));

//USER ROUTES
//get all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

//get one user
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);

  const findUser = users.find((user) => user.id === parsedId);

  if (!findUser) return res.status(404).send(`No user with id:${id} found`);

  res.json(findUser);
});

//add user (Post)
app.post("/api/users", (req, res) => {
  const { body } = req;

  const newId = users[users.length - 1].id + 1 || 1;

  const newUser = { id: newId, ...body };
  if (newUser.name == undefined || newUser.username == undefined)
    return res
      .status(400)
      .send(`Both name and username are required to add a new user`);

  users.push(newUser);
  fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(201).send(newUser);
  });
});

//delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);

  const findUserIndex = users.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1)
    return res.status(404).send(`No user with id:${id} found`);

  users.splice(findUserIndex, 1);

  fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(200).send(`User with id:${id} successfully deleted`);
  });
});

//update user with put
app.put("/api/users/:id", (req, res) => {
  const {
    body,
    params: { id },
  } = req;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);

  const findUserIndex = users.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1)
    return res.status(404).send(`No user with id:${id} found`);

  users[findUserIndex] = { id: parsedId, ...body };

  fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(200).send(users[findUserIndex]);
  });
});

//update user with patch
app.patch("/api/users/:id", (req, res) => {
  const {
    body,
    params: { id },
  } = req;
  const parsedId = parseInt(id);

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);

  const findUserIndex = users.findIndex((user) => user.id === parsedId);

  if (findUserIndex === -1)
    return res.status(404).send(`No user with id:${id} found`);

  users[findUserIndex] = { ...users[findUserIndex], ...body };

  fs.writeFile("./data/users.json", JSON.stringify(users), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(200).send(users[findUserIndex]);
  });
});

//USER ROUTES
//get all products
app.get("/api/products", (req, res) => {
  res.status(200).json(products);
});

//get all products from a category
app.get("/api/products/:type", (req, res) => {
  const { type } = req.params;
  if (!products[type])
    return res.status(400).send(`Invalid product type:${type}`);
  res.status(200).json(products[type]);
});
//get a product from a specific category
app.get("/api/products/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const parsedId = parseInt(id);
  if (!products[type])
    return res.status(400).send(`Invalid product type:${type}`);
  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);
  const findProduct = products[type].find((prod) => prod.id === parsedId);
  if (!findProduct)
    return res.status(404).send(`No ${type} with id:${id} found`);
  res.send(findProduct);
});

//add a product to category
app.post("/api/products/:type", (req, res) => {
  const {
    body,
    params: { type },
  } = req;
  if (!products[type])
    return res.status(400).send(`Invalid product type:${type}`);
  const category = products[type];

  const newId = category[category.length - 1].id + 1 || 1;
  const newProduct = { id: newId, ...body };
  category.push(newProduct);

  fs.writeFile("./data/products.json", JSON.stringify(products), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);

    res.status(201).send(newProduct);
  });
});

//delete a product
app.delete("/api/products/:type/:id", (req, res) => {
  const { type, id } = req.params;
  const category = products[type];
  const parsedId = parseInt(id);
  if (!products[type])
    return res.status(400).send(`Invalid product type:${type}`);
  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);

  const findProductIndex = category.findIndex(
    (product) => product.id === parsedId
  );

  if (findProductIndex === -1) {
    return res.status(404).send(`Product with id: ${id} not found`);
  }

  category.splice(findProductIndex, 1);

  fs.writeFile("./data/products.json", JSON.stringify(products), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);

    res
      .status(200)
      .send(`Product in category:${type} and id:${id} successfully deleted`);
  });
});

//update product in category with put
app.put("/api/products/:type/:id", (req, res) => {
  const {
    body,
    params: { id, type },
  } = req;
  const parsedId = parseInt(id);
  const category = products[type];

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);
  if (!category) return res.status(400).send(`Invalid product type:${type}`);

  const findProductIndex = category.findIndex(
    (product) => product.id === parsedId
  );

  if (findProductIndex === -1)
    return res.status(404).send(`No user with id:${id} found`);

  products[type][findProductIndex] = { id: parsedId, ...body };

  fs.writeFile("./data/products.json", JSON.stringify(products), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(200).send(category[findProductIndex]);
  });
});

//update product in category with patch
app.patch("/api/products/:type/:id", (req, res) => {
  const {
    body,
    params: { id, type },
  } = req;
  const parsedId = parseInt(id);
  const category = products[type];

  if (isNaN(parsedId)) return res.status(400).send(`Invalid id:${id}`);
  if (!category) return res.status(400).send(`Invalid product type:${type}`);

  const findProductIndex = category.findIndex(
    (product) => product.id === parsedId
  );

  if (findProductIndex === -1)
    return res.status(404).send(`No user with id:${id} found`);

  products[type][findProductIndex] = {
    ...products[type][findProductIndex],
    ...body,
  };

  fs.writeFile("./data/products.json", JSON.stringify(products), (err) => {
    if (err) return res.status(500).send("something went wrong", err.message);
    res.status(200).send(category[findProductIndex]);
  });
});

const PORT = 3030;
app.listen(3030, () => {
  console.log(`Server running on port: ${PORT}. localhost:${PORT}`);
});
