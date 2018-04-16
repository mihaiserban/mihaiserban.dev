---
title: "Installing Ghost and Nginx on Ubuntu 16.04"
---

Here’s a guide on installing Ghost on a Ubuntu 16.04 LTS VPS.

Prerequisites:

* A cloud provider such as Digital Ocean or AWS
* Node (NVM)
* PM2 or Forever (to keep it running background).

Before starting, make sure you are operating as a non-root user with sudo privileges.

NVM (Node Version Manager) is a neat tool for installing and managing multiple versions of node.
https://github.com/creationix/nvm

Lets first grab some handy tools, NVM will need them.

```bash
$ sudo apt-get install build-essential libssl-dev
```

Now we can use NVM’s install script using cURL.
If you don’t have cURL installed, do so now:

```bash
$ sudo apt-get install curl
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.4/install.sh | bash
```

I encountered a small issue with this script:

```bash
=> Profile not found. Tried (as defined in $PROFILE), ~/.bashrc, ~/.bash_profile, ~/.zshrc, and ~/.profile.
=> Create one of them and run this script again
=> Create it (touch ) and run this script again
```

So I checked if I had this file:

```bash
$ cat ~/.profile
```

Turns out one didn’t exist, so I ran:

```bash
$ touch ~/.profile
```

I then re-ran the script and then everything went fine. After its finished, open a new shell and reconnect to your server. Type "nvm" and you should see the CLI now.

Ghost tells us which versions of Node it’s happy with, you can view that list here:
http://support.ghost.org/supported-node-versions/

I’ll be installing node v4.4.7

```bash
$ nvm install 4.4.7
```

Now check that node and npm are installed correctly:

```bash
$ node -v
$ npm -v
```

So, now we can get to installing ghost!

```bash
$ sudo mkdir -p /var/www/
$ cd /var/www/
$ sudo wget https://ghost.org/zip/ghost-latest.zip
```

Now lets unzip that file into a directory called ghost:

```bash
$ sudo apt-get install unzip
$ sudo unzip -d ghost ghost-latest.zip
$ cd ghost/
```

Now run npm to install:

```bash
$ sudo npm install --production
```

We now need to go in the config file and change some settings. `config.js` likely doesn’t exist yet in the directory, so lets go ahead and make one using the default variables found in `config.example.js`

```bash
$ sudo cp config.example.js config.js
```

Update the URL value to represent your domain name. If you are using mailgun, you can configure that in this file as well.

```bash
var path = require('path'),
    config;
config = {
    // ### Production
    // When running Ghost in the wild, use the   production environment
    // Configure your URL and mail settings here
    production: {
        url: 'http://my-ghost-blog.com',
        mail: {
            // Your mail settings
        },
        database: {
            client: 'sqlite3',
            connection: {
                filename: path.join(__dirname, '/content/data/ghost.db')
            },
            debug: false
        },
        server: {
            // Host to be passed to node's `net.Server#listen()`
            host: '127.0.0.1',
            // Port to be passed to node's `net.Server#listen()`, for iisnode s$
            port: '2368'
        }
    },
```

Save the file and exit. While still in the /var/www/ghost directory, start Ghost with the following command:

```bash
$ sudo npm start --production
```

You should now be able to access your blog using port 2368
Now push `ctrl + c` to shut it down. We are now going to install nginx.

```bash
$ sudo apt-get install nginx
```

CD into the directoy and remove the default file:

```bash
$ cd /etc/nginx/
$ sudo rm sites-enabled/default
```

Create a new file in /etc/nginx/sites-available/ and call it ghost. Then open with nano:

```bash
$ sudo touch /etc/nginx/sites-available/ghost
$ sudo nano /etc/nginx/sites-available/ghost
```

Now copy and paste this snippet. Replace **your_domain.tld** with the value of your sites domain name.

```bash
server {
    listen 80;
    server_name your_domain.tld;
    location / {
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Host      $http_host;
        proxy_pass         http://127.0.0.1:2368;
    }
}
```

symlink the configuration in sites-enabled:

```bash
$ sudo ln -s /etc/nginx/sites-available/ghost /etc/nginx/sites-enabled/ghost
```

grant privileges:

```bash
$ sudo chown -R ghost:ghost /var/www/ghost/
```

Now cd into the directory and start ghost again:

```bash
$ cd /var/www/ghost
$ npm start --production
```

Now lets set up and configure PM2

```bash
$ npm install pm2@latest -g
```

We should install completion while we are at it:

```bash
$ pm2 completion install
```

I came into an error here, PM2 said it couldn’t find my .bashrc file. I looked in my root directory for one, and it didn’t exist. So I created a fresh one like so:

```bash
$ nano .bashrc
```

Save and exit, then:
/bin/cp /etc/skel/.bashrc ~/

Run this after:

```bash
$ source ~/.bashrc
```

CD back into your ghost directory and:

```bash
$ pm2 completion install
$ NODE_ENV=production pm2 start index.js --name "ghost"
$ pm2 save
```

Logrotation would be nice to have, lets add it:

```bash
$ pm2 install pm2-logrotate
$ pm2 set pm2-logrotate:retain 7
$ pm2 save
$ pm2 list
```

Almost there, lets make sure that PM2 starts up on reboot:

```bash
$ pm2 startup
```

PM2 will return a message like this one:
You have to run this command as root. Execute the following command:

```bash
sudo su -c "env PATH=$PATH:/home/ghost/.nvm/versions/node/v4.4.7/bin pm2 startup linux -u ghost --hp /home/ghost"
```

Eventually I’d like to migrate to a more robust DB such as Postgre SQL. More on that another time.

Cheers!
