import sirv from 'sirv';
import polka from 'polka';
import compression from 'compression';
import * as sapper from '../__sapper__/server.js';

import fs from 'fs';

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

const sapperPath = `${process.cwd()}/__sapper__/${dev ? 'dev' : 'build'}`;
const filePath = `${sapperPath}/build.json`;

if (dev) {
  startServer();
}
else {
  import(`../__sapper__/${dev ? 'dev' : 'build'}/build.json`)
    .then(data => {
      new Promise((resolve, reject) => {
        fs.readdir(`${sapperPath}/client/css/`, (err, files) => {
          if (err) {
            reject(err);
          }

          files.forEach(file => {
            if (/\.css$/i.test(file)) {
              data.css.main = `css/${file}`;
              resolve(data);
            }
          });
        });
      })
        .then(dataObject => {
          fs.writeFile(filePath, JSON.stringify(dataObject), function (err) {
            if (err) {
              throw err;
            }

            startServer();
          });
        })
        .catch(error => {
          throw error;
        });
    })
    .catch(error => console.log(error));
}


function startServer() {
  polka() // You can also use Express
    .use(
      compression({ threshold: 0 }),
      sirv('static', { dev }),
      sapper.middleware(),
    )
    .listen(PORT, err => {
      if (err) console.log('error', err);
    });

}
