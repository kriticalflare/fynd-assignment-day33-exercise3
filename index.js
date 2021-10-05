const http = require("http");
const { nanoid } = require("nanoid");
const url = require("url");

const server = http.createServer();

let dataStore = [];

server.on("request", async (req, res) => {
  const parts = url.parse(req.url, true);
  if (parts.pathname === "/shorten") {
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const data = Buffer.concat(buffers).toString();
    const url = JSON.parse(data).url;
    const storedModel = dataStore.filter((model) => model.url == url);
    let urlModel;
    if (storedModel.length > 0) {
      urlModel = storedModel[0];
    } else {
      urlModel = {
        url: url,
        shortenUrl: nanoid(),
      };
    }
    dataStore.push(urlModel);
    res.writeHead(201, { "content-type": "application/json" });
    res.end(JSON.stringify(urlModel));
  } else if (parts.query.id) {
    let shortId = parts.query.id;
    const storedModel = dataStore.filter(
      (model) => model.shortenUrl == shortId
    );
    if (storedModel.length > 0) {
      res.writeHead(302, { Location: storedModel[0].url });
      res.end();
    } else {
      res.writeHead(404);
      res.end("Url doesnt exist");
    }
  } else {
    res.writeHead(401);
    res.end("Invalid path");
  }
});

server.on("error", (error) => {
  console.error(error.message);
});

server.listen(3000);
