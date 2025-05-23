const http = require("http")
const fs = require("fs")
const path = require("path")


if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }
  

const server = http.createServer((req, res) => {


    if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "content-type": "text/html" })
        res.end(`
         <form action="/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="myfile">
        <button type="submit">submit</button>
</form>
        `)
    }


    if (req.method === "POST" && req.url === "/upload") {

        const contenttype = req.headers["content-type"]
        const boundary = contenttype.split("boundary=")[1]

        let data = Buffer.alloc(0)
        req.on("data", chunk => {
            data = Buffer.concat([data, chunk])
        })
        req.on("end",() => {
            const parts = data.toString().split(`--${boundary}`)
            for (let part of parts) {
                if (part.includes('filename=')) {
                  const filenameMatch = part.match(/filename="(.+?)"/);
                  const filename = filenameMatch ? filenameMatch[1] : 'upload';
        
                  const fileDataStart = part.indexOf('\r\n\r\n') + 4;
                  const fileDataEnd = part.lastIndexOf('\r\n');
        
                  const fileContent = part.slice(fileDataStart, fileDataEnd);
        
                  const filepath = path.join(__dirname, 'uploads', filename);
                  fs.writeFileSync(filepath, fileContent, 'binary');
        
                  res.writeHead(200, { 'Content-Type': 'text/plain' });
                  res.end(`File uploaded successfully as ${filename}`);
                  return;
                }
              }
              res.writeHead(400, { 'Content-Type': 'text/plain' });
              res.end('No file uploaded.');
        })


    }
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
})

server.listen(5000, () => {
    console.log("server listening on port 5000");

})