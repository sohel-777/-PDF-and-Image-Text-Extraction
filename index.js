const express = require("express");
const fileUpload = require("express-fileupload");
const pdfParse = require("pdf-parse");
const T = require("tesseract.js");

const app = express();

app.use("/", express.static("public"));
app.use(fileUpload());

app.post("/extract-text", (req, res) => {
  if (!req.files || !req.files.pdfFile || !req.files.imgFile) {
    res.status(400).send("No files were uploaded.");
    return;
  }

  const pdfPromise = pdfParse(req.files.pdfFile);
  const imgPromise = T.recognize(req.files.imgFile.data, "eng");

  Promise.all([pdfPromise, imgPromise])
    .then(([pdfResult, imgResult]) => {
      const pdfData = pdfResult.text;
      const imgData = imgResult.data.text;
      res.send({ status: 200, pdfData: pdfData, imgData: imgData });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error processing files.");
    });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
