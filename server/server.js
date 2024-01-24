//server.js
const express = require('express');
import fs from "fs";
import path from "path";
import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "../src/App";

const app = express();
//seting port
const port = 3000;
const router = express.Router(); 

//middleware funkcija koja omogu'ava da sve statičke datoteke iz direktoruma build budu dostubne na svim url-ovima koji počinju sa '/'
app.use("/", express.static('build'));


//ovaj middleware izvr[ava sve zahteve koji dolaze u express app 
app.use((req, res, next)=>{
    //proverava da li url zahteva završava sa .css ili .js
    if(/\.css and \.js/.test(req.path)){
        //ako je url, zahtev za css ili js datoteke preusmerava zahtev na istu, ali sa root direktorijumom kao prefiks. primer: /style/app.css > /app.css
        res.redirect('/'+req.path);
    }else{
        //nastavak za ostale zahteve
        next();
    }
});

app.get( '*', (req, res) => { 
    const title = 'SSR React on Node.js server';
    const context=[];
    const app = ReactDOMServer.renderToString(
        <StaticRouter location={req.url} context={context}>
            <App />
        </StaticRouter>
    )
    //definise putanju html dokumenta
    const indexFile = path.resolve('./server/index.html');
    //poziva html datoteku u kojoj će renderovati React App
    fs.readFile(indexFile, 'utf8', (err, data)=>{
        if(err){
            console.log("error");
            return res.status(500).send('oops some error', 'error!');        
        }    
        // u html dokumentu renderuje React i salje klientu  
        return res.send(
            data.replace('</head><body><noscript>You need to enable JavaScript to run this app.</noscript><div id="root"></div>', `
            <title>${title}</title></head><body><div id="root">${app}</div>`)
        );
    });    
});

router.use(express.static(path.resolve(__dirname, "..", "build"), {maxAge:'1d'}));

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

