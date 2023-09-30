const { createServer } = require("http");
const { join } = require("path");
const { statSync, createReadStream } = require("fs");
const log = (text) => console.log(text);
createServer(async (req, res) => {
  //Only Get Method is Allowed
  if (req.method === "GET") {
    try {
      //Convert url into into URL object to get different parameter of url
      const url = new URL(req.url, `http://${req.headers.host}`);
      //Get the pathname from url
      const pathname = url.pathname;
      //Get the filepath
      const filePath = join(__dirname, pathname);
      //Get the fileSize
      const fileSize = statSync(filePath).size;
      //log(req.headers);
      //Get Range headers from request object
      const range = req.headers.range;
      //Check the fileSize
      if (fileSize != 0) {
        //Check the range headers
        if (range) {
          //Replace bytes=0-1024 into first byte 0 and and last byte 1024
          const parts = range.replace("bytes=", "").split("-");
          //Convert first byte into integer base10 from string
          const startByte = parseInt(parts[0], 10);
          //Convert last byte into integer from string and if it is not present sets it to fileSize - 1
          const endByte = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          //Calculate Content Length to send to client
          const contentLength = endByte - startByte + 1;
          //Set the status to 206 Partial Content for sending chunks of file not fully file at once
          const headers = {
            "Content-Range": `bytes ${startByte}-${endByte}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "application/octet-stream",
            "Content-Disposition": "attachment",
          };
          res.writeHead(206, headers);
          //Reading the file and creating Readable Stream
          const file = createReadStream(filePath, {
            start: startByte,
            end: endByte,
          });
          //Pass the stream to response when it is ready
          file.on("open", () => {
            file.pipe(res);
          });
          //Log error and send it to client if any error in reading the file
          file.on("error", (err) => {
            log(err);
            res.statusCode = 500;
            res.end(err);
          });
        } else {
          const head = {
            "Content-Length": fileSize,
          };
          res.writeHead(200, head);
          createReadStream(filePath).pipe(res);
        }
        //"https://s1-filecr.xyz:70/797fb26f47bfd6f9?download_token=ea733c90fdb472ffdc82ba032743&username=hello"
      }
    } catch (err) {
      //Sending Internal Server Error Status with err message
      res.statusCode = 500;
      res.end(err);
    }
  } else {
    //Sending 403 Forbidden Status with err message
    res.statusCode = 403;
    res.end("Doesn't support");
  }
}).listen(8081, () => {
  log("Server On");
});
